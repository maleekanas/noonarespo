export interface PaymentRequest {
  amountMinorUnits: number;
  currency: string;
  paymentMethod: "CREDIT_CARD" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL" | "MOCK";
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  amountMinorUnits: number;
  currency: string;
  provider: "STRIPE" | "PAYPAL" | "MOLLIE" | "MOCK";
  receiptUrl?: string;
  errorMessage?: string;
  processedAt: Date;
}

export interface PaymentGateway {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  processRefund(transactionId: string, amountMinorUnits: number): Promise<PaymentResult>;
}

export class MockPaymentGateway implements PaymentGateway {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const txnId = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      transactionId: txnId,
      amountMinorUnits: request.amountMinorUnits,
      currency: request.currency,
      provider: "MOCK",
      receiptUrl: `https://billing.kidsarabicacademy.internal/receipts/${txnId}`,
      processedAt: new Date(),
    };
  }

  async processRefund(transactionId: string, amountMinorUnits: number): Promise<PaymentResult> {
    const refundTxnId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    return {
      success: true,
      transactionId: refundTxnId,
      amountMinorUnits,
      currency: "USD",
      provider: "MOCK",
      processedAt: new Date(),
    };
  }
}

export const defaultPaymentGateway: PaymentGateway = new MockPaymentGateway();
