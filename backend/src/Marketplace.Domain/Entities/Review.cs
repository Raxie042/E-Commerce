namespace Marketplace.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid BuyerId { get; set; }
    public Guid ProductId { get; set; }
    public int Rating { get; set; }
    public string Body { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Buyer { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
