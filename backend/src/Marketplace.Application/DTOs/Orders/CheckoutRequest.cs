using System.ComponentModel.DataAnnotations;

namespace Marketplace.Application.DTOs.Orders;

public record CheckoutRequest(
    [Required] string Line1,
    string? Line2,
    [Required] string City,
    [Required] string Region,
    [Required] string PostalCode,
    [Required] string Country
);
