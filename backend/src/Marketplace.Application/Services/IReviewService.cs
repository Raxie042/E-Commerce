using Marketplace.Application.DTOs.Reviews;

namespace Marketplace.Application.Services;

public interface IReviewService
{
    Task<List<ReviewDto>> GetByProductAsync(Guid productId);
    Task<ReviewDto> CreateAsync(Guid userId, Guid productId, CreateReviewRequest request);
}
