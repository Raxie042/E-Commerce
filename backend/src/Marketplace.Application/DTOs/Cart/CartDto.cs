using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Cart;

public class CartDto
{
    public Guid Id { get; set; }
    public List<CartItemDto> Items { get; set; } = [];
    public decimal Total { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid ProductVariantId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string VariantName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public Guid SellerId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
}

public class AddToCartRequest
{
    [Required] public Guid ProductVariantId { get; set; }
    [Range(1, 100)] public int Quantity { get; set; } = 1;
}

public class UpdateCartItemRequest
{
    [Range(0, 100)] public int Quantity { get; set; }
}
