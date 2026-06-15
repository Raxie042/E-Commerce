using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Fulfillment;

namespace Marketplace.Application.Services;

public interface IFulfillmentService
{
    Task<PagedResult<SellerSubOrderDto>> GetSellerSubOrdersAsync(
        Guid sellerId, string? status, int page, int pageSize);

    Task<SellerSubOrderDto?> GetSellerSubOrderAsync(Guid subOrderId, Guid sellerId);

    Task UpdateStatusAsync(Guid subOrderId, Guid sellerId, string newStatus);
}
