using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Reviews;

public record CreateReviewRequest(
    [Range(1, 5)] int Rating,
    [Required, MaxLength(2000)] string Body
);
