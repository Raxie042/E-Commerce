using Marketplace.Domain.Entities;

namespace Marketplace.Application.Services;

public interface IJwtTokenService
{
    (string token, DateTime expiresAt) GenerateToken(User user, Guid? sellerId = null);
}
