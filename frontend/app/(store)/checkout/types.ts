export interface CheckoutResponse {
  orderId: string;
  clientSecret: string;
  totalAmount: number;
}
