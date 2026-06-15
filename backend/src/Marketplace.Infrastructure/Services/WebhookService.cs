using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Marketplace.Infrastructure.Services;

public class WebhookService(AppDbContext db, IOrderService orderService, IConfiguration config)
    : IWebhookService
{
    public async Task HandleStripeWebhookAsync(string payload, string signature)
    {
        var webhookSecret = config["Stripe:WebhookSecret"]
            ?? throw new InvalidOperationException("Stripe:WebhookSecret not configured.");

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(payload, signature, webhookSecret);
        }
        catch (StripeException ex)
        {
            throw new ArgumentException("Invalid Stripe signature.", ex);
        }

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            if (await db.WebhookEvents.AnyAsync(w => w.StripeEventId == stripeEvent.Id))
            {
                await tx.RollbackAsync();
                return;
            }

            db.WebhookEvents.Add(new WebhookEvent
            {
                Id = Guid.NewGuid(),
                StripeEventId = stripeEvent.Id,
                Type = stripeEvent.Type,
                Payload = payload
            });
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }

        if (stripeEvent.Type == EventTypes.PaymentIntentSucceeded
            && stripeEvent.Data.Object is PaymentIntent intent)
        {
            await orderService.HandlePaymentSucceededAsync(intent.Id);
        }
    }
}
