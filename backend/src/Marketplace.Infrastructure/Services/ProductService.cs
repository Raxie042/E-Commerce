using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Products;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class ProductService(AppDbContext db) : IProductService
{
    public async Task<PagedResult<ProductDto>> GetActiveAsync(
        Guid? categoryId, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Products
            .Include(p => p.Seller)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.Status == ProductStatus.Active);

        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Title.Contains(search) || p.Description.Contains(search));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<ProductDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<PagedResult<ProductDto>> GetBySellerAsync(
        Guid sellerId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Products
            .Include(p => p.Seller)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .Where(p => p.SellerId == sellerId);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<ProductDto>
        {
            Items = items.Select(ToDto).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await db.Products
            .Include(p => p.Seller)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == id, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        return ToDto(product);
    }

    public async Task<ProductDto> CreateAsync(Guid sellerId, CreateProductRequest request, CancellationToken ct = default)
    {
        var seller = await db.Sellers.FirstOrDefaultAsync(s => s.Id == sellerId, ct)
            ?? throw new KeyNotFoundException("Seller not found.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            SellerId = sellerId,
            Title = request.Title,
            Description = request.Description,
            BasePrice = request.BasePrice,
            CategoryId = request.CategoryId,
            ImageUrl = request.ImageUrl,
            Status = ProductStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var v in request.Variants)
        {
            product.Variants.Add(new ProductVariant
            {
                Id = Guid.NewGuid(),
                ProductId = product.Id,
                Name = v.Name,
                Sku = v.Sku,
                PriceOverride = v.PriceOverride,
                StockQuantity = v.StockQuantity
            });
        }

        db.Products.Add(product);
        await db.SaveChangesAsync(ct);

        product.Seller = seller;
        return ToDto(product);
    }

    public async Task<ProductDto> UpdateAsync(Guid productId, Guid sellerId, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await db.Products
            .Include(p => p.Seller)
            .Include(p => p.Category)
            .Include(p => p.Variants)
            .FirstOrDefaultAsync(p => p.Id == productId, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.SellerId != sellerId)
            throw new UnauthorizedAccessException("You do not own this product.");

        product.Title = request.Title;
        product.Description = request.Description;
        product.BasePrice = request.BasePrice;
        product.CategoryId = request.CategoryId;
        product.ImageUrl = request.ImageUrl;
        product.Status = request.Status;

        await db.SaveChangesAsync(ct);
        return ToDto(product);
    }

    public async Task ArchiveAsync(Guid productId, Guid sellerId, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.SellerId != sellerId)
            throw new UnauthorizedAccessException("You do not own this product.");

        product.Status = ProductStatus.Archived;
        await db.SaveChangesAsync(ct);
    }

    public async Task<ProductVariantDto> AddVariantAsync(Guid productId, Guid sellerId, CreateVariantRequest request, CancellationToken ct = default)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.SellerId != sellerId)
            throw new UnauthorizedAccessException("You do not own this product.");

        var variant = new ProductVariant
        {
            Id = Guid.NewGuid(),
            ProductId = productId,
            Name = request.Name,
            Sku = request.Sku,
            PriceOverride = request.PriceOverride,
            StockQuantity = request.StockQuantity
        };

        db.ProductVariants.Add(variant);
        await db.SaveChangesAsync(ct);
        return ToVariantDto(variant);
    }

    public async Task<ProductVariantDto> UpdateVariantAsync(Guid variantId, Guid sellerId, UpdateVariantRequest request, CancellationToken ct = default)
    {
        var variant = await db.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId, ct)
            ?? throw new KeyNotFoundException("Variant not found.");

        if (variant.Product.SellerId != sellerId)
            throw new UnauthorizedAccessException("You do not own this variant.");

        variant.Name = request.Name;
        variant.PriceOverride = request.PriceOverride;
        variant.StockQuantity = request.StockQuantity;

        await db.SaveChangesAsync(ct);
        return ToVariantDto(variant);
    }

    public async Task DeleteVariantAsync(Guid variantId, Guid sellerId, CancellationToken ct = default)
    {
        var variant = await db.ProductVariants
            .Include(v => v.Product)
            .FirstOrDefaultAsync(v => v.Id == variantId, ct)
            ?? throw new KeyNotFoundException("Variant not found.");

        if (variant.Product.SellerId != sellerId)
            throw new UnauthorizedAccessException("You do not own this variant.");

        db.ProductVariants.Remove(variant);
        await db.SaveChangesAsync(ct);
    }

    private static ProductDto ToDto(Product p) => new()
    {
        Id = p.Id,
        SellerId = p.SellerId,
        StoreName = p.Seller?.StoreName ?? string.Empty,
        Title = p.Title,
        Description = p.Description,
        BasePrice = p.BasePrice,
        Status = p.Status,
        ImageUrl = p.ImageUrl,
        CategoryId = p.CategoryId,
        CategoryName = p.Category?.Name,
        CreatedAt = p.CreatedAt,
        Variants = p.Variants.Select(ToVariantDto).ToList()
    };

    private static ProductVariantDto ToVariantDto(ProductVariant v) => new()
    {
        Id = v.Id,
        Name = v.Name,
        Sku = v.Sku,
        PriceOverride = v.PriceOverride,
        StockQuantity = v.StockQuantity
    };
}
