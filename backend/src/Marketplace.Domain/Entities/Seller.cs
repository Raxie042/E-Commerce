namespace Marketplace.Domain.Entities;

public class Seller
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string StoreName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? StripeConnectAccountId { get; set; }
    public bool PayoutEnabled { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = [];
    public ICollection<SubOrder> SubOrders { get; set; } = [];
}
