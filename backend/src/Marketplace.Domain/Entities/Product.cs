using Marketplace.Domain.Enums;

namespace Marketplace.Domain.Entities;

public class Product
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public Guid? CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public ProductStatus Status { get; set; } = ProductStatus.Draft;
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Seller Seller { get; set; } = null!;
    public Category? Category { get; set; }
    public ICollection<ProductVariant> Variants { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
