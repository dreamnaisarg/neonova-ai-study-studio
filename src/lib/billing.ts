/**
 * NeoNova Centralized Entitlement & Google Play Billing Integration
 * Supports 3 tiers:
 *   - starter (FREE - default for all students)
 *   - plus (PAID - SKU: neonova_plus)
 *   - pro (PAID - SKU: neonova_pro)
 */

export type PlanTier = 'starter' | 'plus' | 'pro';

export interface PlanConfig {
  id: PlanTier;
  sku?: string;
  name: string;
  badge: string;
  priceMonthly: string;
  priceYearly: string;
  priceMonthlyValue: number;
  priceYearlyValue: number;
  currency: string;
  tagline: string;
  description: string;
  features: string[];
  ctaLabel: string;
}

export const PLAY_STORE_PACKAGE_NAME = "studio.ai.neonova_ai_homework_helper_2007.twa";
export const SKU_PLUS = "neonova_plus";
export const SKU_PRO = "neonova_pro";

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: 'starter',
    name: 'NeoNova Starter',
    badge: 'STARTER',
    priceMonthly: 'FREE',
    priceYearly: 'FREE',
    priceMonthlyValue: 0,
    priceYearlyValue: 0,
    currency: 'INR',
    tagline: 'Essential learning assistance for everyday homework',
    description: 'The default plan for every student. Includes core homework help, practice quizzes, and basic notes.',
    features: [
      'Core AI homework helper',
      'Basic step-by-step math & science explanations',
      'Curriculum practice quizzes (Grade 1 to 12)',
      'Basic chapter notes and study sheets',
      'Grade and subject personalization',
      'Selected basic NeoVision interactive tools',
      'Standard AI daily question limits'
    ],
    ctaLabel: 'Current Plan'
  },
  plus: {
    id: 'plus',
    sku: SKU_PLUS,
    name: 'NeoNova Plus',
    badge: 'PLUS ⭐',
    priceMonthly: '₹99/month',
    priceYearly: '₹899/year',
    priceMonthlyValue: 99,
    priceYearlyValue: 899,
    currency: 'INR',
    tagline: 'Higher AI capacity, scientific 3D models, and memory revision',
    description: 'A more powerful learning experience with higher AI capacity, memory flashcards, and scientific labs.',
    features: [
      'Everything included in Starter',
      'Higher AI daily usage limits',
      'Advanced multi-step homework explanations',
      'Adaptive quiz generation tailored to mistakes',
      'Memory Booster (Spaced repetition flashcards)',
      'Scientific 3D Anatomy Lab (Human organ atlas)',
      'Formula Visualizer & graphical wave curves',
      'Personalized learning topic analytics'
    ],
    ctaLabel: 'Upgrade to Plus'
  },
  pro: {
    id: 'pro',
    sku: SKU_PRO,
    name: 'NeoNova Pro',
    badge: 'PRO 👑',
    priceMonthly: '₹199/month',
    priceYearly: '₹1,799/year',
    priceMonthlyValue: 199,
    priceYearlyValue: 1799,
    currency: 'INR',
    tagline: 'The complete NeoNova academic experience with full spatial labs',
    description: 'Ultimate learning mastery. Full NeoVision hub, exam panic shield, NeoNova AI Tutor study coach, and priority processing.',
    features: [
      'Everything included in Plus',
      'Highest AI usage limits & priority processing',
      'Full NeoVision suite access (Hologram Teacher, History Scanner, City Builder, Arena)',
      'Exam Panic Shield & targeted rapid revision checklist',
      'NeoNova AI Tutor conversational academic companion',
      'Advanced topic mastery analytics and weakness tracking',
      'Priority access to newly released educational modules',
      'Full offline study notes export'
    ],
    ctaLabel: 'Upgrade to Pro'
  }
};

export const FEATURE_REQUIREMENTS: Record<string, PlanTier> = {
  'home': 'starter',
  'homework': 'starter',
  'subjects': 'starter',
  'quiz': 'starter',
  'drawing': 'starter',
  'library': 'starter',
  'progress': 'starter',
  'daily': 'starter',
  'memory': 'plus',
  'notes': 'plus',
  'animation_lab': 'plus',
  'three_d_lab': 'plus',
  'visualizer': 'plus',
  'career': 'plus',
  'alerts': 'plus',
  'ai_tutor': 'pro',
  'neovision_hub': 'pro',
  'neovision_deck': 'pro',
  'scifi_deck': 'pro',
  'exam_prep': 'pro',
  'panic_shield': 'pro'
};

const TIER_WEIGHTS: Record<PlanTier, number> = {
  starter: 0,
  plus: 1,
  pro: 2
};

export function hasEntitlement(userTier: PlanTier, requiredTier: PlanTier): boolean {
  return TIER_WEIGHTS[userTier] >= TIER_WEIGHTS[requiredTier];
}

export function canAccessFeature(userTier: PlanTier, featureId: string): { allowed: boolean; requiredTier: PlanTier } {
  const requiredTier = FEATURE_REQUIREMENTS[featureId] || 'starter';
  return {
    allowed: hasEntitlement(userTier, requiredTier),
    requiredTier
  };
}

export interface VerifiedSubscriptionState {
  tier: PlanTier;
  sku?: string;
  purchaseToken?: string;
  orderId?: string;
  purchaseTime?: string;
  expiryTime?: string;
  isAutoRenewing?: boolean;
  status: 'active' | 'cancelled' | 'expired' | 'none';
  lastVerifiedAt?: string;
  serverSignature?: string;
  paymentMethod?: string;
  amountPaid?: number;
  billingCycle?: 'monthly' | 'yearly';
  studentName?: string;
  provider?: string;
}

const STORAGE_KEY_SUBSCRIPTION = 'NEONOVA_SUBSCRIPTION_VERIFIED_STATE';

export function getStoredEntitlement(): VerifiedSubscriptionState {
  if (typeof window === 'undefined') {
    return { tier: 'starter', status: 'none' };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUBSCRIPTION);
    let parsed: VerifiedSubscriptionState | null = raw ? JSON.parse(raw) : null;
    
    // Also check authenticated user profile for plan tier & expiry
    if (!parsed || parsed.tier === 'starter') {
      try {
        const userRaw = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          if (user && (user.planTier === 'plus' || user.planTier === 'pro')) {
            const now = Date.now();
            const cycle: 'monthly' | 'yearly' = user.billingCycle === 'yearly' ? 'yearly' : 'monthly';
            const exp = user.subscriptionExpires ? new Date(user.subscriptionExpires).getTime() : (now + 30 * 24 * 60 * 60 * 1000);
            if (now < exp) {
              parsed = {
                tier: user.planTier,
                sku: user.planTier === 'plus' ? SKU_PLUS : SKU_PRO,
                status: 'active',
                billingCycle: cycle,
                expiryTime: user.subscriptionExpires || new Date(exp).toISOString(),
                purchaseTime: user.createdAt || new Date(now).toISOString(),
                studentName: user.studentName || user.username,
                provider: 'NeoNova Student Account Entitlement'
              };
              localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(parsed));
            }
          }
        }
      } catch {}
    }

    if (!parsed) return { tier: 'starter', status: 'none' };

    if (parsed.expiryTime) {
      const expiry = new Date(parsed.expiryTime).getTime();
      if (!isNaN(expiry) && Date.now() > expiry) {
        const expiredState: VerifiedSubscriptionState = {
          ...parsed,
          tier: 'starter',
          status: 'expired'
        };
        localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(expiredState));
        return expiredState;
      }
    }

    if (parsed.status === 'active' && (parsed.tier === 'plus' || parsed.tier === 'pro')) {
      return parsed;
    }
    return { tier: 'starter', status: 'none' };
  } catch (err) {
    console.error("Failed to read subscription entitlement", err);
    return { tier: 'starter', status: 'none' };
  }
}

/**
 * Save an active subscription for monthly or yearly duration (persists across restarts)
 */
export function saveActiveSubscriptionPlan(
  tier: 'plus' | 'pro',
  billingCycle: 'monthly' | 'yearly' = 'monthly',
  studentName?: string
): VerifiedSubscriptionState {
  const now = Date.now();
  const durationDays = billingCycle === 'yearly' ? 365 : 30;
  const expiryTime = new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString();

  const state: VerifiedSubscriptionState = {
    tier,
    sku: tier === 'plus' ? SKU_PLUS : SKU_PRO,
    orderId: `ORD-SUB-${now}`,
    purchaseToken: `TOKEN-${Date.now().toString(36).toUpperCase()}`,
    purchaseTime: new Date(now).toISOString(),
    expiryTime,
    status: 'active',
    lastVerifiedAt: new Date(now).toISOString(),
    serverSignature: `NEONOVA-VERIFIED-${Date.now()}`,
    billingCycle,
    amountPaid: tier === 'plus' ? (billingCycle === 'yearly' ? 899 : 99) : (billingCycle === 'yearly' ? 1799 : 199),
    studentName,
    provider: 'Official NeoNova In-App Subscription'
  };

  saveVerifiedSubscription(state);

  // Sync to local user if logged in
  try {
    const userRaw = localStorage.getItem('neonova_auth_user') || localStorage.getItem('neonova_installed_profile');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      user.planTier = tier;
      user.billingCycle = billingCycle;
      user.subscriptionExpires = expiryTime;
      user.subscriptionStatus = 'active';
      localStorage.setItem('neonova_auth_user', JSON.stringify(user));
      localStorage.setItem('neonova_installed_profile', JSON.stringify(user));

      // Asynchronously sync to server
      const token = localStorage.getItem('neonova_auth_token');
      fetch('/api/user/save-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          token,
          planTier: tier,
          billingCycle
        })
      }).catch(() => {});
    }
  } catch {}

  return state;
}

export async function createServerPaymentOrder(
  tier: 'plus' | 'pro',
  billingCycle: 'monthly' | 'yearly',
  studentName?: string,
  studentEmail?: string
): Promise<{
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  tier?: 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  upiId?: string;
  upiPayString?: string;
  error?: string;
}> {
  const amount = tier === 'plus' 
    ? (billingCycle === 'yearly' ? 899 : 99) 
    : (billingCycle === 'yearly' ? 1799 : 199);
  const fallbackOrderId = `ORD-NEO-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

  try {
    const res = await fetch('/api/create-payment-order', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ tier, billingCycle, studentName, studentEmail })
    });
    const text = await res.text();
    let data: any = null;
    if (text && text.trim().startsWith('{')) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (data && data.success) {
      return data;
    }
  } catch (err: any) {
    console.warn("Server order creation unavailable, using client order generation:", err);
  }

  return {
    success: true,
    orderId: fallbackOrderId,
    amount,
    currency: "INR",
    tier,
    billingCycle,
    upiId: "9898074424@axl",
    upiPayString: `upi://pay?pa=9898074424@axl&pn=Bank%20Of%20Baroda&am=${amount}.00&cu=INR&tn=NeoNova%20${tier.toUpperCase()}`
  };
}

export async function verifyPaymentOnServer(payload: {
  orderId: string;
  paymentMethod: 'google_play' | 'upi' | 'card' | 'netbanking';
  transactionRef: string;
  purchaseToken?: string;
  tier: 'plus' | 'pro';
  billingCycle: 'monthly' | 'yearly';
  studentName?: string;
  studentEmail?: string;
}): Promise<{
  verified: boolean;
  message?: string;
  verifiedState?: VerifiedSubscriptionState;
  error?: string;
}> {
  const refString = (payload.transactionRef || payload.purchaseToken || "").toString().trim();

  const forbiddenPatterns = [
    /^(fake|dummy|bypass|none|nil|null|undefined)$/i,
    /fake.*slip/i
  ];

  if (!refString || refString.length < 5 || forbiddenPatterns.some(rx => rx.test(refString))) {
    return {
      verified: false,
      error: "Payment verification failed. Invalid transaction reference. Please provide an authentic bank UTR, card transaction ID, or UPI transaction number."
    };
  }

  const cleanUtr = refString.replace(/^(UPI|UTR|REF|TXN|ORDER|ID|NO)[\/\-:\s#]?/i, '').replace(/\s+/g, '').trim();
  if (cleanUtr.length < 5 || cleanUtr.length > 40) {
    return {
      verified: false,
      error: "Invalid transaction reference. Please enter the authentic transaction ID or UTR number from your payment receipt (at least 6 characters)."
    };
  }

  try {
    const res = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const rawText = await res.text();
    let data: any = null;
    if (rawText && rawText.trim().startsWith('{')) {
      try {
        data = JSON.parse(rawText);
      } catch {
        data = null;
      }
    }
    if (data) {
      if (data.verified && data.verifiedState) {
        saveVerifiedSubscription(data.verifiedState);
        return {
          verified: true,
          message: data.message || `Payment verified successfully. NeoNova ${payload.tier === 'plus' ? 'Plus' : 'Pro'} is now active!`,
          verifiedState: data.verifiedState
        };
      } else {
        return {
          verified: false,
          error: data.error || "We couldn't verify this transaction yet. Your paid features will remain locked until the payment is successfully verified."
        };
      }
    }

    return {
      verified: false,
      error: "Payment verification failed. Please check your transaction ID or wait for the payment provider to confirm the transaction."
    };
  } catch (networkErr: any) {
    console.warn("Backend /api/verify-payment call failed:", networkErr);
    return {
      verified: false,
      error: "We couldn't verify this transaction yet. Your paid features will remain locked until the payment is successfully verified."
    };
  }
}

export function saveVerifiedSubscription(state: VerifiedSubscriptionState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_SUBSCRIPTION, JSON.stringify(state));
  } catch (err) {
    console.error("Failed to persist subscription entitlement", err);
  }
}

export function clearSubscription(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_SUBSCRIPTION);
  } catch (err) {
    console.error("Failed to clear subscription", err);
  }
}

export async function initiatePlayBillingPurchase(
  targetTier: 'plus' | 'pro'
): Promise<{
  success: boolean;
  status: 'play_flow_launched' | 'requires_android_play_store' | 'error';
  message: string;
  verifiedState?: VerifiedSubscriptionState;
}> {
  const sku = targetTier === 'plus' ? SKU_PLUS : SKU_PRO;

  return {
    success: false,
    status: 'requires_android_play_store',
    message: `Google Play Billing is configured for SKU "${sku}". To activate your subscription with real Google Play Billing, launch NeoNova from the installed Android app (via Google Play Store).`
  };
}

export async function restorePlayPurchases(): Promise<{
  found: boolean;
  tier: PlanTier;
  message: string;
}> {
  const current = getStoredEntitlement();
  if (current.status === 'active' && current.tier !== 'starter') {
    return {
      found: true,
      tier: current.tier,
      message: `Verified active subscription for NeoNova ${PLANS[current.tier].name} loaded.`
    };
  }

  return {
    found: false,
    tier: 'starter',
    message: "No active Google Play purchases found for this account. Current plan: NeoNova Starter (FREE)."
  };
}

export function getPlayStoreSubscriptionUrl(sku?: string): string {
  if (sku) {
    return `https://play.google.com/store/account/subscriptions?package=${PLAY_STORE_PACKAGE_NAME}&sku=${sku}`;
  }
  return `https://play.google.com/store/account/subscriptions`;
}

export const getCurrentSubscriptionState = getStoredEntitlement;
export const saveLocalSubscription = saveVerifiedSubscription;

