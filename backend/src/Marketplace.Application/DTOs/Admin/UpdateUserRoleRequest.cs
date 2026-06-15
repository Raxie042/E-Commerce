using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Admin;

public record UpdateUserRoleRequest([Required] string Role);
