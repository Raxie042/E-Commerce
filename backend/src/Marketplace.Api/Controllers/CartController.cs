using Marketplace.Api.Extensions;
using Marketplace.Application.DTOs.Cart;
using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public class CartController(ICartService cartService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await cartService.GetCartAsync(User.GetUserId(), ct));

    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddToCartRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await cartService.AddItemAsync(User.GetUserId(), request, ct));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, UpdateCartItemRequest request, CancellationToken ct)
    {
        try
        {
            return Ok(await cartService.UpdateItemAsync(itemId, User.GetUserId(), request, ct));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId, CancellationToken ct)
    {
        try
        {
            return Ok(await cartService.RemoveItemAsync(itemId, User.GetUserId(), ct));
        }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpDelete]
    public async Task<IActionResult> Clear(CancellationToken ct)
    {
        await cartService.ClearCartAsync(User.GetUserId(), ct);
        return NoContent();
    }
}
