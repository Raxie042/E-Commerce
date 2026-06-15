namespace Marketplace.Application.DTOs.Admin;

public record AdminStatsDto(
    int TotalUsers,
    int TotalSellers,
    int TotalOrders,
    int PaidOrders,
    decimal TotalRevenue,
    decimal TotalPayouts
);
