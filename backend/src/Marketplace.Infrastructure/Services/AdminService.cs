using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Admin;
using Marketplace.Application.Services;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class AdminService(AppDbContext db, IStripeService stripe) : IAdminService
{
    public async Task<AdminStatsDto> GetStatsAsync()
    {
        var totalUsers = await db.Users.CountAsync();
        var totalSellers = await db.Sellers.CountAsync();
        var totalOrders = await db.Orders.CountAsync();
        var paidOrders = await db.Orders.CountAsync(o =>
            o.Status != OrderStatus.Pending && o.Status != OrderStatus.Cancelled);
        var totalRevenue = await db.Payments
            .Where(p => p.Status == PaymentStatus.Succeeded)
            .SumAsync(p => (decimal?)p.Amount) ?? 0m;
        var totalPayouts = await db.SubOrders
            .Where(so => so.StripeTransferId != null)
            .SumAsync(so => (decimal?)so.SellerPayout) ?? 0m;

        return new AdminStatsDto(totalUsers, totalSellers, totalOrders, paidOrders, totalRevenue, totalPayouts);
    }

    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(string? role, int page, int pageSize)
    {
        var query = db.Users.Include(u => u.Seller).AsQueryable();

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, true, out var parsedRole))
            query = query.Where(u => u.Role == parsedRole);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Role.ToString(),
                u.CreatedAt,
                u.Seller != null ? u.Seller.StoreName : null,
                u.Seller != null ? u.Seller.PayoutEnabled : null))
            .ToListAsync();

        return new PagedResult<AdminUserDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task<PagedResult<AdminOrderDto>> GetOrdersAsync(string? status, int page, int pageSize)
    {
        var query = db.Orders
            .Include(o => o.Buyer)
            .Include(o => o.Payment)
            .Include(o => o.SubOrders)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<OrderStatus>(status, true, out var parsedStatus))
            query = query.Where(o => o.Status == parsedStatus);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new AdminOrderDto(
                o.Id,
                o.Buyer.Email,
                $"{o.Buyer.FirstName} {o.Buyer.LastName}",
                o.Status.ToString(),
                o.TotalAmount,
                o.CreatedAt,
                o.SubOrders.Count,
                o.Payment != null ? o.Payment.StripePaymentIntentId : null,
                o.Payment != null ? o.Payment.Status.ToString() : null))
            .ToListAsync();

        return new PagedResult<AdminOrderDto> { Items = items, TotalCount = total, Page = page, PageSize = pageSize };
    }

    public async Task UpdateUserRoleAsync(Guid userId, string role)
    {
        if (!Enum.TryParse<UserRole>(role, true, out var newRole))
            throw new ArgumentException($"Unknown role '{role}'.");

        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        user.Role = newRole;
        await db.SaveChangesAsync();
    }

    public async Task ToggleSellerPayoutAsync(Guid sellerId, bool enabled)
    {
        var seller = await db.Sellers.FindAsync(sellerId)
            ?? throw new KeyNotFoundException("Seller not found.");

        seller.PayoutEnabled = enabled;
        await db.SaveChangesAsync();
    }

    public async Task RefundOrderAsync(Guid orderId)
    {
        var order = await db.Orders
            .Include(o => o.Payment)
            .Include(o => o.SubOrders)
            .FirstOrDefaultAsync(o => o.Id == orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        if (order.Payment is null)
            throw new InvalidOperationException("Order has no payment to refund.");

        if (order.Status == OrderStatus.Refunded)
            throw new InvalidOperationException("Order is already refunded.");

        if (order.Payment.Status != PaymentStatus.Succeeded)
            throw new InvalidOperationException("Cannot refund a payment that has not succeeded.");

        await stripe.RefundPaymentAsync(order.Payment.StripePaymentIntentId);

        order.Payment.Status = PaymentStatus.Refunded;
        order.Status = OrderStatus.Refunded;
        foreach (var sub in order.SubOrders)
            sub.Status = SubOrderStatus.Refunded;

        await db.SaveChangesAsync();
    }

    public async Task DeleteReviewAsync(Guid reviewId)
    {
        var review = await db.Reviews.FindAsync(reviewId)
            ?? throw new KeyNotFoundException("Review not found.");

        db.Reviews.Remove(review);
        await db.SaveChangesAsync();
    }
}
