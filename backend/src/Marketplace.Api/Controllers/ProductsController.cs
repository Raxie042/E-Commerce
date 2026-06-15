using Marketplace.Api.Extensions;
using Marketplace.Application.DTOs.Products;
using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(IProductService productService) : ControllerBase
{
    // ── Public storefront ─────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetActive(
        [FromQuery] Guid? categoryId,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default) =>
        Ok(await productService.GetActiveAsync(categoryId, search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        try { return Ok(await productService.GetByIdAsync(id, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
    }

    // ── Seller dashboard ──────────────────────────────────────────────────────

    [Authorize(Roles = "Seller")]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMine(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        return Ok(await productService.GetBySellerAsync(sellerId.Value, page, pageSize, ct));
    }

    [Authorize(Roles = "Seller")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductRequest request, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        var product = await productService.CreateAsync(sellerId.Value, request, ct);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [Authorize(Roles = "Seller")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        try { return Ok(await productService.UpdateAsync(id, sellerId.Value, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [Authorize(Roles = "Seller")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        try { await productService.ArchiveAsync(id, sellerId.Value, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    // ── Variants ──────────────────────────────────────────────────────────────

    [Authorize(Roles = "Seller")]
    [HttpPost("{productId:guid}/variants")]
    public async Task<IActionResult> AddVariant(Guid productId, CreateVariantRequest request, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        try { return Ok(await productService.AddVariantAsync(productId, sellerId.Value, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [Authorize(Roles = "Seller")]
    [HttpPut("variants/{variantId:guid}")]
    public async Task<IActionResult> UpdateVariant(Guid variantId, UpdateVariantRequest request, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        try { return Ok(await productService.UpdateVariantAsync(variantId, sellerId.Value, request, ct)); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    [Authorize(Roles = "Seller")]
    [HttpDelete("variants/{variantId:guid}")]
    public async Task<IActionResult> DeleteVariant(Guid variantId, CancellationToken ct)
    {
        var sellerId = GetSellerId();
        if (sellerId == null) return Forbid();
        try { await productService.DeleteVariantAsync(variantId, sellerId.Value, ct); return NoContent(); }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    private Guid? GetSellerId()
    {
        var raw = User.FindFirst("sellerId")?.Value;
        return raw != null ? Guid.Parse(raw) : null;
    }
}
