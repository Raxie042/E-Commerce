using Marketplace.Domain.Enums;

namespace Marketplace.Domain.Entities;

public class SubOrder
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Guid SellerId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal PlatformFee { get; set; }
    public decimal SellerPayout { get; set; }
    public SubOrderStatus Status { get; set; } = SubOrderStatus.AwaitingFulfillment;
    public string? StripeTransferId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Order Order { get; set; } = null!;
    public Seller Seller { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = [];
}
