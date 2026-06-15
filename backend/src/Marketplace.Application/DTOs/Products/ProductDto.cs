using System.ComponentModel.DataAnnotations;
using Marketplace.Domain.Enums;

namespace Marketplace.Application.DTOs.Products;

public class ProductDto
{
    public Guid Id { get; set; }
    public Guid SellerId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BasePrice { get; set; }
    public ProductStatus Status { get; set; }
    public string? ImageUrl { get; set; }
    public Guid? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<ProductVariantDto> Variants { get; set; } = [];
}

public class CreateProductRequest
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Range(0.01, double.MaxValue)] public decimal BasePrice { get; set; }
    public Guid? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public List<CreateVariantRequest> Variants { get; set; } = [];
}

public class UpdateProductRequest
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Range(0.01, double.MaxValue)] public decimal BasePrice { get; set; }
    public Guid? CategoryId { get; set; }
    public string? ImageUrl { get; set; }
    public ProductStatus Status { get; set; }
}
