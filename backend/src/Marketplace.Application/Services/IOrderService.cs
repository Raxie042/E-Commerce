using Marketplace.Application.DTOs.Orders;

namespace Marketplace.Application.Services;

public interface IOrderService
{
    Task<CheckoutResponse> CheckoutAsync(Guid userId, CheckoutRequest request);
    Task<OrderDto?> GetOrderAsync(Guid orderId, Guid userId);
    Task<List<OrderDto>> GetBuyerOrdersAsync(Guid userId);
    Task HandlePaymentSucceededAsync(string paymentIntentId);
}
