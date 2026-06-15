namespace Marketplace.Application.DTOs.Reviews;

public record ReviewDto(
    Guid Id,
    Guid BuyerId,
    string BuyerName,
    int Rating,
    string Body,
    DateTime CreatedAt
);
