namespace Marketplace.Application.DTOs.Orders;

public record CheckoutResponse(
    Guid OrderId,
    string ClientSecret,
    decimal TotalAmount
);
