using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Marketplace.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
                  ?? principal.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? throw new UnauthorizedAccessException("User ID claim missing.");
        return Guid.Parse(sub);
    }
}
