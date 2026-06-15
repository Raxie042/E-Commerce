using Marketplace.Application.DTOs.Categories;

namespace Marketplace.Application.Services;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default);
}
