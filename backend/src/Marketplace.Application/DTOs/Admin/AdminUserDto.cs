namespace Marketplace.Application.DTOs.Admin;

public record AdminUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string Role,
    DateTime CreatedAt,
    string? StoreName,
    bool? PayoutEnabled
);
