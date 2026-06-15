using Marketplace.Application.DTOs;
using Marketplace.Application.DTOs.Products;

namespace Marketplace.Application.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetActiveAsync(Guid? categoryId, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<PagedResult<ProductDto>> GetBySellerAsync(Guid sellerId, int page, int pageSize, CancellationToken ct = default);
    Task<ProductDto> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<ProductDto> CreateAsync(Guid sellerId, CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateAsync(Guid productId, Guid sellerId, UpdateProductRequest request, CancellationToken ct = default);
    Task ArchiveAsync(Guid productId, Guid sellerId, CancellationToken ct = default);
    Task<ProductVariantDto> AddVariantAsync(Guid productId, Guid sellerId, CreateVariantRequest request, CancellationToken ct = default);
    Task<ProductVariantDto> UpdateVariantAsync(Guid variantId, Guid sellerId, UpdateVariantRequest request, CancellationToken ct = default);
    Task DeleteVariantAsync(Guid variantId, Guid sellerId, CancellationToken ct = default);
}
