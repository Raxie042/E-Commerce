using Marketplace.Application.DTOs.Cart;

namespace Marketplace.Application.Services;

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid buyerId, CancellationToken ct = default);
    Task<CartDto> AddItemAsync(Guid buyerId, AddToCartRequest request, CancellationToken ct = default);
    Task<CartDto> UpdateItemAsync(Guid cartItemId, Guid buyerId, UpdateCartItemRequest request, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(Guid cartItemId, Guid buyerId, CancellationToken ct = default);
    Task ClearCartAsync(Guid buyerId, CancellationToken ct = default);
}
