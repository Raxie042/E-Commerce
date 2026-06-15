namespace Marketplace.Application.DTOs.Orders;

public record OrderDto(
    Guid Id,
    string Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    ShippingAddressDto? ShippingAddress,
    List<SubOrderDto> SubOrders
);

public record SubOrderDto(
    Guid Id,
    Guid SellerId,
    string StoreName,
    string Status,
    decimal Subtotal,
    decimal PlatformFee,
    decimal SellerPayout,
    List<OrderItemDto> Items
);

public record OrderItemDto(
    Guid Id,
    Guid ProductVariantId,
    string ProductTitle,
    string VariantName,
    int Quantity,
    decimal UnitPrice,
    decimal Subtotal
);

public record ShippingAddressDto(
    string Line1,
    string? Line2,
    string City,
    string Region,
    string PostalCode,
    string Country
);
