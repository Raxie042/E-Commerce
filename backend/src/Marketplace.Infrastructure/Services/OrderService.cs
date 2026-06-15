using Marketplace.Application.DTOs.Orders;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Marketplace.Infrastructure.Services;

public class OrderService(AppDbContext db, IStripeService stripe, IConfiguration config) : IOrderService
{
    public async Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest req)
    {
        var cart = await db.Carts
            .Include(c => c.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
                        .ThenInclude(p => p.Seller)
            .FirstOrDefaultAsync(c => c.BuyerId == userId)
            ?? throw new InvalidOperationException("Cart not found.");

        if (!cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in cart.Items)
            {
                var affected = await db.Database.ExecuteSqlRawAsync(
                    """
                    UPDATE "ProductVariants"
                    SET "StockQuantity" = "StockQuantity" - {0}
                    WHERE "Id" = {1} AND "StockQuantity" >= {2}
                    """,
                    item.Quantity, item.ProductVariantId, item.Quantity);

                if (affected == 0)
                    throw new InvalidOperationException(
                        $"Insufficient stock for variant '{item.ProductVariant.Name}'.");
            }

            var address = new Address
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Line1 = req.Line1,
                Line2 = req.Line2,
                City = req.City,
                Region = req.Region,
                PostalCode = req.PostalCode,
                Country = req.Country
            };
            db.Addresses.Add(address);

            var total = cart.Items.Sum(i =>
                i.Quantity * (i.ProductVariant.PriceOverride ?? i.ProductVariant.Product.BasePrice));

            var order = new Order
            {
                Id = Guid.NewGuid(),
                BuyerId = userId,
                ShippingAddressId = address.Id,
                TotalAmount = total,
                Status = OrderStatus.Pending
            };
            db.Orders.Add(order);

            decimal feeRate = (decimal.TryParse(config["Stripe:PlatformFeePercent"], out var pct) ? pct : 10m) / 100m;

            foreach (var group in cart.Items.GroupBy(i => i.ProductVariant.Product.SellerId))
            {
                var subtotal = group.Sum(i =>
                    i.Quantity * (i.ProductVariant.PriceOverride ?? i.ProductVariant.Product.BasePrice));
                var platformFee = Math.Round(subtotal * feeRate, 2);

                var subOrder = new SubOrder
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    SellerId = group.Key,
                    Subtotal = subtotal,
                    PlatformFee = platformFee,
                    SellerPayout = subtotal - platformFee,
                    Status = SubOrderStatus.AwaitingFulfillment
                };
                db.SubOrders.Add(subOrder);

                foreach (var item in group)
                {
                    db.OrderItems.Add(new OrderItem
                    {
                        Id = Guid.NewGuid(),
                        SubOrderId = subOrder.Id,
                        ProductVariantId = item.ProductVariantId,
                        Quantity = item.Quantity,
                        UnitPriceAtPurchase = item.ProductVariant.PriceOverride
                            ?? item.ProductVariant.Product.BasePrice
                    });
                }
            }

            var (paymentIntentId, clientSecret) =
                await stripe.CreatePaymentIntentAsync(total, order.Id);

            db.Payments.Add(new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                StripePaymentIntentId = paymentIntentId,
                Amount = total,
                Status = PaymentStatus.RequiresPayment
            });

            db.CartItems.RemoveRange(cart.Items);

            await db.SaveChangesAsync();
            await tx.CommitAsync();

            return new CheckoutResponse(order.Id, clientSecret, total);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task HandlePaymentSucceededAsync(string paymentIntentId)
    {
        var payment = await db.Payments
            .Include(p => p.Order)
                .ThenInclude(o => o.SubOrders)
                    .ThenInclude(so => so.Seller)
            .FirstOrDefaultAsync(p => p.StripePaymentIntentId == paymentIntentId);

        if (payment is null) return;

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            payment.Status = PaymentStatus.Succeeded;
            payment.Order.Status = OrderStatus.Paid;

            foreach (var subOrder in payment.Order.SubOrders)
            {
                if (!string.IsNullOrEmpty(subOrder.Seller.StripeConnectAccountId)
                    && subOrder.Seller.PayoutEnabled)
                {
                    try
                    {
                        var transferId = await stripe.CreateTransferAsync(
                            subOrder.Seller.StripeConnectAccountId,
                            subOrder.SellerPayout);
                        subOrder.StripeTransferId = transferId;
                    }
                    catch
                    {
                        // Transfer failed — log in production; order stays Paid.
                    }
                }
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto?> GetOrderAsync(Guid orderId, Guid userId)
    {
        var order = await db.Orders
            .Include(o => o.ShippingAddress)
            .Include(o => o.SubOrders)
                .ThenInclude(so => so.Seller)
            .Include(o => o.SubOrders)
                .ThenInclude(so => so.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == userId);

        return order is null ? null : MapOrder(order);
    }

    public async Task<List<OrderDto>> GetBuyerOrdersAsync(Guid userId)
    {
        var orders = await db.Orders
            .Include(o => o.ShippingAddress)
            .Include(o => o.SubOrders)
                .ThenInclude(so => so.Seller)
            .Include(o => o.SubOrders)
                .ThenInclude(so => so.Items)
                    .ThenInclude(i => i.ProductVariant)
                        .ThenInclude(v => v.Product)
            .Where(o => o.BuyerId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return orders.Select(MapOrder).ToList();
    }

    private static OrderDto MapOrder(Order o) => new(
        o.Id,
        o.Status.ToString(),
        o.TotalAmount,
        o.CreatedAt,
        o.ShippingAddress is null ? null : new ShippingAddressDto(
            o.ShippingAddress.Line1,
            o.ShippingAddress.Line2,
            o.ShippingAddress.City,
            o.ShippingAddress.Region,
            o.ShippingAddress.PostalCode,
            o.ShippingAddress.Country),
        o.SubOrders.Select(so => new SubOrderDto(
            so.Id,
            so.SellerId,
            so.Seller.StoreName,
            so.Status.ToString(),
            so.Subtotal,
            so.PlatformFee,
            so.SellerPayout,
            so.Items.Select(i => new OrderItemDto(
                i.Id,
                i.ProductVariantId,
                i.ProductVariant.Product.Title,
                i.ProductVariant.Name,
                i.Quantity,
                i.UnitPriceAtPurchase,
                i.Quantity * i.UnitPriceAtPurchase
            )).ToList()
        )).ToList()
    );
}
