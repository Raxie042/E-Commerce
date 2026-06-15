using Marketplace.Application.DTOs.Categories;
using Marketplace.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/categories")]
public class CategoriesController(ICategoryService categoryService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await categoryService.GetAllAsync(ct));

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryRequest request, CancellationToken ct) =>
        Ok(await categoryService.CreateAsync(request, ct));
}
