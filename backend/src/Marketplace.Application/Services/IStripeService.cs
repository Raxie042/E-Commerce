namespace Marketplace.Application.Services;

public interface IStripeService
{
    Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(decimal amount, Guid orderId);
    Task<string> CreateTransferAsync(string destinationAccountId, decimal amount, string currency = "usd");
    Task<string> CreateConnectAccountAsync(string email);
    Task<string> CreateOnboardingLinkAsync(string accountId, string returnUrl, string refreshUrl);
    Task<string> RefundPaymentAsync(string paymentIntentId);
}
