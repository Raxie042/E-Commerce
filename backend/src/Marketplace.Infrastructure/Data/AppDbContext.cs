using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Seller> Sellers => Set<Seller>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<SubOrder> SubOrders => Set<SubOrder>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<WebhookEvent> WebhookEvents => Set<WebhookEvent>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<Seller>(e =>
        {
            e.HasOne(s => s.User)
             .WithOne(u => u.Seller)
             .HasForeignKey<Seller>(s => s.UserId);
        });

        modelBuilder.Entity<Category>(e =>
        {
            e.HasOne(c => c.Parent)
             .WithMany(c => c.Children)
             .HasForeignKey(c => c.ParentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.Property(p => p.BasePrice).HasPrecision(18, 2);
            e.Property(p => p.Status).HasConversion<string>();
        });

        modelBuilder.Entity<ProductVariant>(e =>
        {
            e.HasIndex(v => v.Sku).IsUnique();
            e.Property(v => v.PriceOverride).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Cart>(e =>
        {
            e.HasOne(c => c.Buyer)
             .WithOne(u => u.Cart)
             .HasForeignKey<Cart>(c => c.BuyerId);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.Property(o => o.TotalAmount).HasPrecision(18, 2);
            e.Property(o => o.Status).HasConversion<string>();
        });

        modelBuilder.Entity<SubOrder>(e =>
        {
            e.Property(s => s.Subtotal).HasPrecision(18, 2);
            e.Property(s => s.PlatformFee).HasPrecision(18, 2);
            e.Property(s => s.SellerPayout).HasPrecision(18, 2);
            e.Property(s => s.Status).HasConversion<string>();
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(i => i.UnitPriceAtPurchase).HasPrecision(18, 2);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.Property(p => p.Amount).HasPrecision(18, 2);
            e.Property(p => p.Status).HasConversion<string>();
            e.HasOne(p => p.Order)
             .WithOne(o => o.Payment)
             .HasForeignKey<Payment>(p => p.OrderId);
        });

        modelBuilder.Entity<WebhookEvent>(e =>
        {
            e.HasIndex(w => w.StripeEventId).IsUnique();
        });

        modelBuilder.Entity<Review>(e =>
        {
            e.HasIndex(r => new { r.BuyerId, r.ProductId }).IsUnique();
        });
    }
}
