using Marketplace.Application.DTOs.Auth;
using Marketplace.Application.Services;
using Marketplace.Domain.Entities;
using Marketplace.Domain.Enums;
using Marketplace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Infrastructure.Services;

public class AuthService(AppDbContext db, IJwtTokenService jwtService) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email.ToLower(), ct))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            CreatedAt = DateTime.UtcNow
        };

        db.Users.Add(user);

        Seller? seller = null;
        if (request.Role == UserRole.Seller)
        {
            seller = new Seller
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                StoreName = request.StoreName ?? $"{request.FirstName}'s Store",
                Description = string.Empty,
                PayoutEnabled = false,
                CreatedAt = DateTime.UtcNow
            };
            db.Sellers.Add(seller);
        }

        await db.SaveChangesAsync(ct);

        var (token, expiresAt) = jwtService.GenerateToken(user, seller?.Id);
        return BuildResponse(token, expiresAt, user, seller?.Id);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await db.Users
            .Include(u => u.Seller)
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower(), ct)
            ?? throw new UnauthorizedAccessException("Invalid email or password.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password.");

        var (token, expiresAt) = jwtService.GenerateToken(user, user.Seller?.Id);
        return BuildResponse(token, expiresAt, user, user.Seller?.Id);
    }

    public async Task<UserDto> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users
            .Include(u => u.Seller)
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new KeyNotFoundException("User not found.");

        return ToUserDto(user, user.Seller?.Id);
    }

    private static AuthResponse BuildResponse(string token, DateTime expiresAt, User user, Guid? sellerId) =>
        new() { Token = token, ExpiresAt = expiresAt, User = ToUserDto(user, sellerId) };

    private static UserDto ToUserDto(User user, Guid? sellerId) =>
        new()
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            SellerId = sellerId
        };
}
