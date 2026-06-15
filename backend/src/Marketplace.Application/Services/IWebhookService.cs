namespace Marketplace.Application.Services;

public interface IWebhookService
{
    Task HandleStripeWebhookAsync(string payload, string signature);
}
