using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Fulfillment;

public record UpdateSubOrderStatusRequest(
    [Required] string Status
);
