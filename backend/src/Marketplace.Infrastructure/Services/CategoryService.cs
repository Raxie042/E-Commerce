using Marketplace.Application.DTOs.Categories;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class CategoryService(AppDbContext db) : ICategoryService
{
    public async Task<List<CategoryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await db.Categories
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

        return BuildTree(all, null);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ParentId = request.ParentId
        };
        db.Categories.Add(category);
        await db.SaveChangesAsync(ct);
        return new CategoryDto { Id = category.Id, Name = category.Name, ParentId = category.ParentId };
    }

    private static List<CategoryDto> BuildTree(List<Category> all, Guid? parentId) =>
        all.Where(c => c.ParentId == parentId)
           .Select(c => new CategoryDto
           {
               Id = c.Id,
               Name = c.Name,
               ParentId = c.ParentId,
               Children = BuildTree(all, c.Id)
           })
           .ToList();
}
