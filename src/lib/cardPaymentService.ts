import { VerifiedSubscriptionState, saveVerifiedSubscription } from './billing';

export interface CardOrderResponse {
  success: boolean;
  orderId: string;
  gatewayOrderId?: string;
  amount: number;
  amountInPaise: number;
  currency: string;
  planTier: 'plus' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  keyId: string;
  isLiveGateway: boolean;
  merchantName: string;
  merchantSettlementNotice: string;
  settlementBank: string;
  prefill?: {
    name?: string;
    email?: string;
  };
  error?: string;
}

export interface CardVerificationResult {
  verified: boolean;
  message?: string;
  verifiedState?: VerifiedSubscriptionState;
  error?: string;
  settlementDetails?: {
    beneficiary: string;
    bank: string;
    accountMasked: string;
    ifsc: string;
    schedule: string;
  };
}

export interface MerchantInfo {
  merchantName: string;
  brandName: string;
  settlementBank: string;
  accountNumberMasked: string;
  ifsc: string;
  primaryUpiId: string;
  settlementSchedule: string;
  pciCompliance: string;
  tokenizationCompliant: boolean;
  supportedCards: string[];
}

/**
 * Request server to calculate price and create an authoritative card order
 */
export async function createCardOrderOnServer(
  tier: 'plus' | 'pro',
  billingCycle: 'monthly' | 'yearly',
  studentName?: string,
  studentEmail?: string
): Promise<CardOrderResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_token') || '' : '';
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_user') : null;
  let accountId = 'student-default';
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u?.id) accountId = u.id;
      if (!studentEmail && u?.email) studentEmail = u.email;
      if (!studentName && (u?.studentName || u?.username)) studentName = u.studentName || u.username;
    } catch {}
  }

  const res = await fetch('/api/payment/create-card-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      tier,
      billingCycle,
      studentName: studentName || 'Student',
      studentEmail: studentEmail || '',
      accountId,
      token
    })
  });

  if (!res.ok) {
    throw new Error(`Failed to create payment order (HTTP ${res.status})`);
  }

  return await res.json();
}

/**
 * Authoritatively verify card transaction on server
 */
export async function verifyCardPaymentOnServer(payload: {
  orderId: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string;
  gatewaySignature?: string;
  tier: 'plus' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  studentName?: string;
  studentEmail?: string;
}): Promise<CardVerificationResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_token') || '' : '';
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('neonova_auth_user') : null;
  let accountId = 'student-default';
  if (userRaw) {
    try {
      const u = JSON.parse(userRaw);
      if (u?.id) accountId = u.id;
    } catch {}
  }

  const res = await fetch('/api/payment/verify-card-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      ...payload,
      accountId,
      token
    })
  });

  const data = await res.json();
  if (data?.verified && data?.verifiedState) {
    saveVerifiedSubscription(data.verifiedState);
  }
  return data;
}

/**
 * Fetch official merchant settlement information
 */
export async function fetchMerchantSettlementInfo(): Promise<MerchantInfo> {
  try {
    const res = await fetch('/api/payment/merchant-info');
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Could not fetch merchant info from API:', e);
  }

  return {
    merchantName: 'Naisarg Ramdatti',
    brandName: 'NeoNova AI Homework Helper',
    settlementBank: 'Bank of Baroda',
    accountNumberMasked: '•••• •••• •••• 5536',
    ifsc: 'BARB0KHERAL',
    primaryUpiId: '9898074424@axl',
    settlementSchedule: 'T+1 / T+2 Banking Business Days',
    pciCompliance: 'PCI-DSS Level 1 Hosted Checkout',
    tokenizationCompliant: true,
    supportedCards: ['RuPay', 'Visa', 'Mastercard', 'Maestro', 'American Express']
  };
}

/**
 * Dynamically load Razorpay official standard checkout SDK
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Razorpay checkout script load failed (network/adblocker)');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}
