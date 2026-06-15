namespace Marketplace.Domain.Enums;

public enum OrderStatus
{
    Pending,
    Paid,
    PartiallyFulfilled,
    Fulfilled,
    Cancelled,
    Refunded
}
