import {
  financialRepository,
  SubscriptionPlan,
  ParentSubscription,
  DomainInvoice,
} from "../repositories/FinancialRepository";
import { defaultPaymentGateway } from "@/lib/integrations/paymentGateway";
import { communicationRepository } from "../repositories/CommunicationRepository";

export interface CheckoutCalculation {
  plan: SubscriptionPlan;
  subtotalMinorUnits: number;
  discountMinorUnits: number;
  taxMinorUnits: number;
  totalMinorUnits: number;
  couponApplied?: {
    code: string;
    discountPercentage: number;
  };
}

export class BillingService {
  formatPrice(minorUnits: number, currency = "USD"): string {
    const major = (minorUnits / 100).toFixed(2);
    return currency === "USD" ? `$${major}` : `${major} ${currency}`;
  }

  async getAllPlans(): Promise<SubscriptionPlan[]> {
    return await financialRepository.getAllPlans();
  }

  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    return await financialRepository.getPlanById(planId);
  }

  /**
   * Calculates checkout price in 64-bit integer minor units with optional coupon application.
   */
  async calculateCheckoutPrice(
    planId: string,
    couponCode?: string
  ): Promise<CheckoutCalculation> {
    const plan = await financialRepository.getPlanById(planId);
    if (!plan) {
      throw new Error(`PLAN_NOT_FOUND: Plan ${planId} does not exist`);
    }

    const subtotal = plan.priceMinorUnits;
    let discount = 0;
    let couponApplied = undefined;

    if (couponCode && couponCode.trim()) {
      const coupon = await financialRepository.getCoupon(couponCode.trim());
      if (coupon) {
        discount = Math.round((subtotal * coupon.discountPercentage) / 100);
        couponApplied = {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
        };
      }
    }

    const net = Math.max(0, subtotal - discount);
    const tax = 0; // Tax-exempt educational subscription or included in price
    const total = net + tax;

    return {
      plan,
      subtotalMinorUnits: subtotal,
      discountMinorUnits: discount,
      taxMinorUnits: tax,
      totalMinorUnits: total,
      couponApplied,
    };
  }

  /**
   * Processes subscription checkout, charges payment gateway, creates subscription and invoice.
   */
  async processCheckout(params: {
    parentId: string;
    planId: string;
    couponCode?: string;
    paymentMethod: "CREDIT_CARD" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL" | "MOCK";
  }): Promise<{
    subscription: ParentSubscription;
    invoice: DomainInvoice;
  }> {
    const calculation = await this.calculateCheckoutPrice(
      params.planId,
      params.couponCode
    );

    // 1. Process via Payment Gateway
    const payment = await defaultPaymentGateway.processPayment({
      amountMinorUnits: calculation.totalMinorUnits,
      currency: calculation.plan.currency,
      paymentMethod: params.paymentMethod,
      description: `Subscription to ${calculation.plan.nameEn}`,
      metadata: {
        parentId: params.parentId,
        planId: params.planId,
      },
    });

    if (!payment.success) {
      throw new Error(`PAYMENT_FAILED: ${payment.errorMessage || "Payment could not be completed"}`);
    }

    // 2. Create / Renew Subscription
    const now = new Date();
    const periodStart = now;
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const subId = `sub-${params.parentId}-${Date.now()}`;
    const subscription: ParentSubscription = {
      id: subId,
      parentId: params.parentId,
      planId: params.planId,
      status: "ACTIVE",
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
    };
    await financialRepository.saveSubscription(subscription);

    // 3. Generate Tax Invoice
    const invoiceNumber = `INV-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceId = `inv-${Date.now()}`;

    const invoice: DomainInvoice = {
      id: invoiceId,
      invoiceNumber,
      parentId: params.parentId,
      subscriptionId: subId,
      subtotalMinorUnits: calculation.subtotalMinorUnits,
      discountMinorUnits: calculation.discountMinorUnits,
      taxMinorUnits: calculation.taxMinorUnits,
      totalMinorUnits: calculation.totalMinorUnits,
      currency: calculation.plan.currency,
      status: "PAID",
      lineItems: [
        {
          description: `${calculation.plan.nameAr} (${calculation.plan.nameEn})`,
          quantity: 1,
          unitPriceMinorUnits: calculation.subtotalMinorUnits,
          totalMinorUnits: calculation.subtotalMinorUnits,
        },
      ],
      paymentMethod: `${params.paymentMethod} (مؤكد)`,
      paidAt: now,
      createdAt: now,
    };
    await financialRepository.saveInvoice(invoice);

    // 4. Emit In-App Notification
    await communicationRepository.addNotification({
      userId: params.parentId,
      title: "تم تأكيد اشتراككم بنجاح",
      message: `تم سداد فاتورة ${invoiceNumber} بمبلغ ${this.formatPrice(calculation.totalMinorUnits)} وتفعيل باقة «${calculation.plan.nameAr}».`,
      type: "ATTENDANCE_ALERT",
      linkUrl: `/ar/parent/invoices/${invoiceId}`,
    });

    return { subscription, invoice };
  }

  async getParentSubscription(parentId: string): Promise<ParentSubscription | null> {
    return await financialRepository.getSubscriptionByParentId(parentId);
  }

  async getParentInvoices(parentId: string): Promise<DomainInvoice[]> {
    return await financialRepository.getInvoicesByParentId(parentId);
  }

  async getInvoiceById(invoiceId: string): Promise<DomainInvoice | null> {
    return await financialRepository.getInvoiceById(invoiceId);
  }
}

export const billingService = new BillingService();
