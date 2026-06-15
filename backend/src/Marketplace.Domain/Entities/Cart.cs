namespace Marketplace.Domain.Entities;

public class Cart
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Buyer { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = [];
}
