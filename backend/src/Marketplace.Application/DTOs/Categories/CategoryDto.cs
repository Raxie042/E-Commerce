namespace Marketplace.Application.DTOs.Categories;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
    public List<CategoryDto> Children { get; set; } = [];
}

public class CreateCategoryRequest
{
    public string Name { get; set; } = string.Empty;
    public Guid? ParentId { get; set; }
}
