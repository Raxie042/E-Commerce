using Marketplace.Api.Extensions;
using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Fulfillment;
using Marketplace.Application.Services;
using Marketplace.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/seller/suborders")]
[Authorize(Roles = "Seller")]
public class FulfillmentController(IFulfillmentService fulfillment, AppDbContext db) : ControllerBase
{
    private async Task<Guid?> ResolveSellerIdAsync() =>
        (await db.Sellers.FirstOrDefaultAsync(s => s.UserId == User.GetUserId()))?.Id;

    [HttpGet]
    public async Task<ActionResult<PagedResult<SellerSubOrderDto>>> GetSubOrders(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var sellerId = await ResolveSellerIdAsync();
        if (sellerId is null) return NotFound("Seller profile not found.");

        var result = await fulfillment.GetSellerSubOrdersAsync(sellerId.Value, status, page, pageSize);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SellerSubOrderDto>> GetSubOrder(Guid id)
    {
        var sellerId = await ResolveSellerIdAsync();
        if (sellerId is null) return NotFound("Seller profile not found.");

        var subOrder = await fulfillment.GetSellerSubOrderAsync(id, sellerId.Value);
        return subOrder is null ? NotFound() : Ok(subOrder);
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(
        Guid id, [FromBody] UpdateSubOrderStatusRequest request)
    {
        var sellerId = await ResolveSellerIdAsync();
        if (sellerId is null) return NotFound("Seller profile not found.");

        try
        {
            await fulfillment.UpdateStatusAsync(id, sellerId.Value, request.Status);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
    }
}
