using Marketplace.Application.Services;
using Microsoft.Extensions.Configuration;
using Stripe;

namespace Marketplace.Infrastructure.Services;

public class StripeService : IStripeService
{
    public StripeService(IConfiguration config)
    {
        StripeConfiguration.ApiKey = config["Stripe:SecretKey"];
    }

    public async Task<(string PaymentIntentId, string ClientSecret)> CreatePaymentIntentAsync(decimal amount, Guid orderId)
    {
        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = "usd",
            AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions { Enabled = true },
            Metadata = new Dictionary<string, string> { ["orderId"] = orderId.ToString() }
        };
        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options);
        return (intent.Id, intent.ClientSecret);
    }

    public async Task<string> CreateTransferAsync(string destinationAccountId, decimal amount, string currency = "usd")
    {
        var options = new TransferCreateOptions
        {
            Amount = (long)(amount * 100),
            Currency = currency,
            Destination = destinationAccountId
        };
        var service = new TransferService();
        var transfer = await service.CreateAsync(options);
        return transfer.Id;
    }

    public async Task<string> CreateConnectAccountAsync(string email)
    {
        var options = new AccountCreateOptions
        {
            Type = "express",
            Email = email,
            Capabilities = new AccountCapabilitiesOptions
            {
                Transfers = new AccountCapabilitiesTransfersOptions { Requested = true }
            }
        };
        var service = new AccountService();
        var account = await service.CreateAsync(options);
        return account.Id;
    }

    public async Task<string> CreateOnboardingLinkAsync(string accountId, string returnUrl, string refreshUrl)
    {
        var options = new AccountLinkCreateOptions
        {
            Account = accountId,
            RefreshUrl = refreshUrl,
            ReturnUrl = returnUrl,
            Type = "account_onboarding"
        };
        var service = new AccountLinkService();
        var link = await service.CreateAsync(options);
        return link.Url;
    }
}
