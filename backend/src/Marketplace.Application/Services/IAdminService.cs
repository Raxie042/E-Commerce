using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Admin;

namespace Marketplace.Application.Services;

public interface IAdminService
{
    Task<AdminStatsDto> GetStatsAsync();
    Task<PagedResult<AdminUserDto>> GetUsersAsync(string? role, int page, int pageSize);
    Task<PagedResult<AdminOrderDto>> GetOrdersAsync(string? status, int page, int pageSize);
    Task UpdateUserRoleAsync(Guid userId, string role);
    Task ToggleSellerPayoutAsync(Guid sellerId, bool enabled);
    Task RefundOrderAsync(Guid orderId);
    Task DeleteReviewAsync(Guid reviewId);
}
