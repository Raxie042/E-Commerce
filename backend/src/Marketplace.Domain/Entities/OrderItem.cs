namespace Marketplace.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; }
    public Guid SubOrderId { get; set; }
    public Guid ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPriceAtPurchase { get; set; }

    public SubOrder SubOrder { get; set; } = null!;
    public ProductVariant ProductVariant { get; set; } = null!;
}
