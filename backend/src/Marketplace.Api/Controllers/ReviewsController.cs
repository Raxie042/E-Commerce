using Marketplace.Api.Extensions;
using Marketplace.Application.DTOs.Reviews;
using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/products/{productId:guid}/reviews")]
public class ReviewsController(IReviewService reviewService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ReviewDto>>> GetReviews(Guid productId) =>
        Ok(await reviewService.GetByProductAsync(productId));

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> CreateReview(
        Guid productId, [FromBody] CreateReviewRequest request)
    {
        try
        {
            var review = await reviewService.CreateAsync(User.GetUserId(), productId, request);
            return CreatedAtAction(nameof(GetReviews), new { productId }, review);
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }
}
