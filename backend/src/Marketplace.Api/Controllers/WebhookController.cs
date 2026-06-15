using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhookController(IWebhookService webhookService) : ControllerBase
{
    [HttpPost("stripe")]
    [AllowAnonymous]
    public async Task<IActionResult> HandleStripe()
    {
        string payload;
        using (var reader = new StreamReader(Request.Body, System.Text.Encoding.UTF8))
            payload = await reader.ReadToEndAsync();

        var signature = Request.Headers["Stripe-Signature"].ToString();
        if (string.IsNullOrEmpty(signature))
            return BadRequest("Missing Stripe-Signature header.");

        try
        {
            await webhookService.HandleStripeWebhookAsync(payload, signature);
            return Ok();
        }
        catch (ArgumentException)
        {
            return BadRequest("Invalid webhook signature.");
        }
    }
}
