using Marketplace.Application.DTOs.Reviews;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class ReviewService(AppDbContext db) : IReviewService
{
    public async Task<List<ReviewDto>> GetByProductAsync(Guid productId) =>
        await db.Reviews
            .Include(r => r.Buyer)
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewDto(
                r.Id,
                r.BuyerId,
                $"{r.Buyer.FirstName} {r.Buyer.LastName}",
                r.Rating,
                r.Body,
                r.CreatedAt))
            .ToListAsync();

    public async Task<ReviewDto> CreateAsync(Guid userId, Guid productId, CreateReviewRequest request)
    {
        var hasBought = await db.OrderItems
            .AnyAsync(oi =>
                oi.ProductVariant.ProductId == productId &&
                oi.SubOrder.Order.BuyerId == userId &&
                oi.SubOrder.Order.Status != OrderStatus.Cancelled &&
                oi.SubOrder.Order.Status != OrderStatus.Pending);

        if (!hasBought)
            throw new InvalidOperationException("You must purchase this product before reviewing it.");

        var alreadyReviewed = await db.Reviews
            .AnyAsync(r => r.BuyerId == userId && r.ProductId == productId);

        if (alreadyReviewed)
            throw new InvalidOperationException("You have already reviewed this product.");

        var user = await db.Users.FindAsync(userId)
            ?? throw new KeyNotFoundException("User not found.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            BuyerId = userId,
            ProductId = productId,
            Rating = request.Rating,
            Body = request.Body
        };
        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        return new ReviewDto(
            review.Id,
            review.BuyerId,
            $"{user.FirstName} {user.LastName}",
            review.Rating,
            review.Body,
            review.CreatedAt);
    }
}
