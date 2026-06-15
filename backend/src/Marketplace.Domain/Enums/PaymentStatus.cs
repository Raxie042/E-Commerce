namespace Marketplace.Domain.Enums;

public enum PaymentStatus
{
    RequiresPayment,
    Processing,
    Succeeded,
    Failed,
    Refunded
}
