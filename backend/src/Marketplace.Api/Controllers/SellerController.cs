using Marketplace.Api.Extensions;
using Marketplace.Application.Services;
using Marketplace.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/seller")]
[Authorize(Roles = "Seller")]
public class SellerController(AppDbContext db, IStripeService stripeService) : ControllerBase
{
    [HttpGet("stripe/onboard")]
    public async Task<IActionResult> GetOnboardingLink(
        [FromQuery] string returnUrl = "http://localhost:3000/seller/stripe?status=success",
        [FromQuery] string refreshUrl = "http://localhost:3000/seller/stripe?status=refresh")
    {
        var userId = User.GetUserId();
        var seller = await db.Sellers
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.UserId == userId);

        if (seller is null)
            return NotFound("Seller profile not found.");

        if (string.IsNullOrEmpty(seller.StripeConnectAccountId))
        {
            var accountId = await stripeService.CreateConnectAccountAsync(seller.User.Email);
            seller.StripeConnectAccountId = accountId;
            await db.SaveChangesAsync();
        }

        var url = await stripeService.CreateOnboardingLinkAsync(
            seller.StripeConnectAccountId, returnUrl, refreshUrl);

        return Ok(new { url });
    }

    [HttpGet("stripe/status")]
    public async Task<IActionResult> GetStripeStatus()
    {
        var userId = User.GetUserId();
        var seller = await db.Sellers.FirstOrDefaultAsync(s => s.UserId == userId);
        if (seller is null) return NotFound();

        return Ok(new
        {
            connected = !string.IsNullOrEmpty(seller.StripeConnectAccountId),
            payoutEnabled = seller.PayoutEnabled,
            accountId = seller.StripeConnectAccountId
        });
    }
}
