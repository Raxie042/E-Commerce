using Marketplace.Application.DTOs.Cart;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class CartService(AppDbContext db) : ICartService
{
    public async Task<CartDto> GetCartAsync(Guid buyerId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(buyerId, ct);
        return ToDto(cart);
    }

    public async Task<CartDto> AddItemAsync(Guid buyerId, AddToCartRequest request, CancellationToken ct = default)
    {
        var variant = await db.ProductVariants
            .Include(v => v.Product).ThenInclude(p => p.Seller)
            .FirstOrDefaultAsync(v => v.Id == request.ProductVariantId, ct)
            ?? throw new KeyNotFoundException("Product variant not found.");

        if (variant.Product.Status != ProductStatus.Active)
            throw new InvalidOperationException("This product is not available.");

        if (variant.StockQuantity < request.Quantity)
            throw new InvalidOperationException($"Only {variant.StockQuantity} in stock.");

        var cart = await GetOrCreateCartAsync(buyerId, ct);

        var existing = cart.Items.FirstOrDefault(i => i.ProductVariantId == request.ProductVariantId);
        if (existing != null)
        {
            var newQty = existing.Quantity + request.Quantity;
            if (newQty > variant.StockQuantity)
                throw new InvalidOperationException($"Cannot add more. Only {variant.StockQuantity} in stock.");
            existing.Quantity = newQty;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductVariantId = request.ProductVariantId,
                Quantity = request.Quantity
            });
        }

        await db.SaveChangesAsync(ct);
        return await GetCartAsync(buyerId, ct);
    }

    public async Task<CartDto> UpdateItemAsync(Guid cartItemId, Guid buyerId, UpdateCartItemRequest request, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(buyerId, ct);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        if (request.Quantity == 0)
        {
            db.CartItems.Remove(item);
        }
        else
        {
            var stock = await db.ProductVariants
                .Where(v => v.Id == item.ProductVariantId)
                .Select(v => v.StockQuantity)
                .FirstOrDefaultAsync(ct);

            if (request.Quantity > stock)
                throw new InvalidOperationException($"Only {stock} in stock.");

            item.Quantity = request.Quantity;
        }

        await db.SaveChangesAsync(ct);
        return await GetCartAsync(buyerId, ct);
    }

    public async Task<CartDto> RemoveItemAsync(Guid cartItemId, Guid buyerId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(buyerId, ct);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        db.CartItems.Remove(item);
        await db.SaveChangesAsync(ct);
        return await GetCartAsync(buyerId, ct);
    }

    public async Task ClearCartAsync(Guid buyerId, CancellationToken ct = default)
    {
        var cart = await GetOrCreateCartAsync(buyerId, ct);
        db.CartItems.RemoveRange(cart.Items);
        await db.SaveChangesAsync(ct);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid buyerId, CancellationToken ct)
    {
        var cart = await db.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Seller)
            .FirstOrDefaultAsync(c => c.BuyerId == buyerId, ct);

        if (cart != null) return cart;

        cart = new Cart { Id = Guid.NewGuid(), BuyerId = buyerId, CreatedAt = DateTime.UtcNow };
        db.Carts.Add(cart);
        await db.SaveChangesAsync(ct);
        return cart;
    }

    private static CartDto ToDto(Cart cart)
    {
        var items = cart.Items.Select(i =>
        {
            var unitPrice = i.ProductVariant?.PriceOverride ?? i.ProductVariant?.Product?.BasePrice ?? 0m;
            return new CartItemDto
            {
                Id = i.Id,
                ProductVariantId = i.ProductVariantId,
                ProductId = i.ProductVariant?.ProductId ?? Guid.Empty,
                ProductTitle = i.ProductVariant?.Product?.Title ?? string.Empty,
                VariantName = i.ProductVariant?.Name ?? string.Empty,
                ImageUrl = i.ProductVariant?.Product?.ImageUrl,
                UnitPrice = unitPrice,
                Quantity = i.Quantity,
                Subtotal = unitPrice * i.Quantity,
                SellerId = i.ProductVariant?.Product?.SellerId ?? Guid.Empty,
                StoreName = i.ProductVariant?.Product?.Seller?.StoreName ?? string.Empty,
                StockQuantity = i.ProductVariant?.StockQuantity ?? 0
            };
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            Items = items,
            Total = items.Sum(i => i.Subtotal),
            ItemCount = items.Sum(i => i.Quantity)
        };
    }
}
