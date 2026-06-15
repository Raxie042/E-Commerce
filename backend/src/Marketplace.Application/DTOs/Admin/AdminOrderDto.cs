namespace Marketplace.Application.DTOs.Admin;

public record AdminOrderDto(
    Guid Id,
    string BuyerEmail,
    string BuyerName,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    int SubOrderCount,
    string? PaymentIntentId,
    string? PaymentStatus
);
