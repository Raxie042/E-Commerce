using Marketplace.Application.DTOs.Orders;

namespace Marketplace.Application.DTOs.Fulfillment;

public record SellerSubOrderDto(
    Guid Id,
    Guid OrderId,
    string Status,
    decimal Subtotal,
    decimal PlatformFee,
    decimal SellerPayout,
    string? StripeTransferId,
    DateTime CreatedAt,
    BuyerDto Buyer,
    ShippingAddressDto? ShippingAddress,
    List<SellerOrderItemDto> Items
);

public record BuyerDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email
);

public record SellerOrderItemDto(
    Guid Id,
    string ProductTitle,
    string VariantName,
    string? ImageUrl,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);
