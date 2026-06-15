using Marketplace.Domain.Enums;

namespace Marketplace.Domain.Entities;

public class Order
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public Guid? ShippingAddressId { get; set; }
    public decimal TotalAmount { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Buyer { get; set; } = null!;
    public Address? ShippingAddress { get; set; }
    public ICollection<SubOrder> SubOrders { get; set; } = [];
    public Payment? Payment { get; set; }
}
