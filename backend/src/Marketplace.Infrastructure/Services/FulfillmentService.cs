using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Fulfillment;
using Marketplace.Application.DTOs.Orders;
using Marketplace.Application.Services;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class FulfillmentService(AppDbContext db) : IFulfillmentService
{
    private static readonly Dictionary<SubOrderStatus, SubOrderStatus[]> AllowedTransitions = new()
    {
        [SubOrderStatus.AwaitingFulfillment] = [SubOrderStatus.Shipped],
        [SubOrderStatus.Shipped]             = [SubOrderStatus.Delivered],
        [SubOrderStatus.Delivered]           = [],
        [SubOrderStatus.Cancelled]           = [],
        [SubOrderStatus.Refunded]            = [],
    };

    public async Task<PagedResult<SellerSubOrderDto>> GetSellerSubOrdersAsync(
        Guid sellerId, string? status, int page, int pageSize)
    {
        var query = db.SubOrders
            .Include(so => so.Order)
                .ThenInclude(o => o.Buyer)
            .Include(so => so.Order)
                .ThenInclude(o => o.ShippingAddress)
            .Include(so => so.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .Where(so => so.SellerId == sellerId);

        if (!string.IsNullOrEmpty(status)
            && Enum.TryParse<SubOrderStatus>(status, true, out var parsed))
        {
            query = query.Where(so => so.Status == parsed);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(so => so.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<SellerSubOrderDto>
        {
            Items = items.Select(MapSubOrder).ToList(),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<SellerSubOrderDto?> GetSellerSubOrderAsync(Guid subOrderId, Guid sellerId)
    {
        var subOrder = await db.SubOrders
            .Include(so => so.Order)
                .ThenInclude(o => o.Buyer)
            .Include(so => so.Order)
                .ThenInclude(o => o.ShippingAddress)
            .Include(so => so.Items)
                .ThenInclude(i => i.ProductVariant)
                    .ThenInclude(v => v.Product)
            .FirstOrDefaultAsync(so => so.Id == subOrderId && so.SellerId == sellerId);

        return subOrder is null ? null : MapSubOrder(subOrder);
    }

    public async Task UpdateStatusAsync(Guid subOrderId, Guid sellerId, string newStatus)
    {
        if (!Enum.TryParse<SubOrderStatus>(newStatus, true, out var target))
            throw new ArgumentException($"Unknown status '{newStatus}'.");

        var subOrder = await db.SubOrders
            .Include(so => so.Order)
                .ThenInclude(o => o.SubOrders)
            .FirstOrDefaultAsync(so => so.Id == subOrderId && so.SellerId == sellerId)
            ?? throw new KeyNotFoundException("Sub-order not found.");

        if (!AllowedTransitions[subOrder.Status].Contains(target))
            throw new InvalidOperationException(
                $"Cannot transition from {subOrder.Status} to {target}.");

        subOrder.Status = target;

        var siblingStatuses = subOrder.Order.SubOrders.Select(so =>
            so.Id == subOrder.Id ? target : so.Status).ToList();

        subOrder.Order.Status = siblingStatuses.All(s => s == SubOrderStatus.Delivered)
            ? OrderStatus.Fulfilled
            : siblingStatuses.Any(s => s == SubOrderStatus.Delivered)
                ? OrderStatus.PartiallyFulfilled
                : subOrder.Order.Status;

        await db.SaveChangesAsync();
    }

    private static SellerSubOrderDto MapSubOrder(Domain.Entities.SubOrder so) => new(
        so.Id,
        so.OrderId,
        so.Status.ToString(),
        so.Subtotal,
        so.PlatformFee,
        so.SellerPayout,
        so.StripeTransferId,
        so.CreatedAt,
        new BuyerDto(
            so.Order.Buyer.Id,
            so.Order.Buyer.FirstName,
            so.Order.Buyer.LastName,
            so.Order.Buyer.Email),
        so.Order.ShippingAddress is null ? null : new ShippingAddressDto(
            so.Order.ShippingAddress.Line1,
            so.Order.ShippingAddress.Line2,
            so.Order.ShippingAddress.City,
            so.Order.ShippingAddress.Region,
            so.Order.ShippingAddress.PostalCode,
            so.Order.ShippingAddress.Country),
        so.Items.Select(i => new SellerOrderItemDto(
            i.Id,
            i.ProductVariant.Product.Title,
            i.ProductVariant.Name,
            i.ProductVariant.Product.ImageUrl,
            i.Quantity,
            i.UnitPriceAtPurchase,
            i.Quantity * i.UnitPriceAtPurchase
        )).ToList()
    );
}
