using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Products;

public class ProductVariantDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    public int StockQuantity { get; set; }
}

public class CreateVariantRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    [Required] public string Sku { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    [Range(0, int.MaxValue)] public int StockQuantity { get; set; }
}

public class UpdateVariantRequest
{
    [Required] public string Name { get; set; } = string.Empty;
    public decimal? PriceOverride { get; set; }
    [Range(0, int.MaxValue)] public int StockQuantity { get; set; }
}
