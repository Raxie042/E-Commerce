using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Admin;
using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(IAdminService adminService) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats() =>
        Ok(await adminService.GetStatsAsync());

    [HttpGet("users")]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetUsers(
        [FromQuery] string? role,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        Ok(await adminService.GetUsersAsync(role, page, pageSize));

    [HttpPut("users/{id:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleRequest request)
    {
        try
        {
            await adminService.UpdateUserRoleAsync(id, request.Role);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpGet("orders")]
    public async Task<ActionResult<PagedResult<AdminOrderDto>>> GetOrders(
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20) =>
        Ok(await adminService.GetOrdersAsync(status, page, pageSize));

    [HttpPost("orders/{id:guid}/refund")]
    public async Task<IActionResult> RefundOrder(Guid id)
    {
        try
        {
            await adminService.RefundOrderAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return UnprocessableEntity(new { error = ex.Message }); }
    }

    [HttpPut("sellers/{id:guid}/payout")]
    public async Task<IActionResult> TogglePayout(Guid id, [FromBody] TogglePayoutRequest request)
    {
        try
        {
            await adminService.ToggleSellerPayoutAsync(id, request.Enabled);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }

    [HttpDelete("reviews/{id:guid}")]
    public async Task<IActionResult> DeleteReview(Guid id)
    {
        try
        {
            await adminService.DeleteReviewAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
    }
}

public record TogglePayoutRequest(bool Enabled);
