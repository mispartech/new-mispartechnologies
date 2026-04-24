/**
 * Paystack Checkout Helper
 *
 * Flow:
 * 1. Frontend asks Django backend to initialize a transaction
 *    (POST /api/payments/paystack/initialize/) — backend creates the
 *    transaction with Paystack using its SECRET key and returns
 *    { reference, access_code, authorization_url }.
 * 2. Frontend opens Paystack Inline using the access_code (or falls
 *    back to redirecting to authorization_url).
 * 3. After payment, Paystack hits the backend webhook
 *    (/api/payments/paystack/webhook/) AND the user is redirected
 *    to the callback URL where the frontend re-verifies status via
 *    GET /api/payments/paystack/verify/:reference/.
 */

import { djangoApi } from './client';
import { API_ROUTES } from './apiRoutes';

declare global {
  interface Window {
    PaystackPop?: {
      newTransaction: (opts: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        reference?: string;
        accessCode?: string;
        metadata?: Record<string, unknown>;
        onSuccess?: (tx: { reference: string; status: string; trans: string }) => void;
        onCancel?: () => void;
        onError?: (err: unknown) => void;
      }) => void;
    };
  }
}

export type PaystackPlan = 'starter' | 'pro' | 'business';

export interface InitializeResponse {
  reference: string;
  access_code: string;
  authorization_url: string;
  amount: number; // in kobo
  currency: string;
}

export interface VerifyResponse {
  reference: string;
  status: 'success' | 'failed' | 'abandoned' | 'pending';
  amount: number;
  currency: string;
  plan: PaystackPlan;
  paid_at?: string;
}

const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string | undefined;

/** Ask the Django backend to create a Paystack transaction. */
export async function initializePayment(payload: {
  plan: PaystackPlan;
  email: string;
  whatsapp_addon?: boolean;
  member_count?: number;
}) {
  return djangoApi.initializePaystackPayment(payload) as Promise<{ data?: InitializeResponse; error?: string; status: number }>;
}

/** Verify a transaction reference after callback. */
export async function verifyPayment(reference: string) {
  return djangoApi.verifyPaystackPayment(reference) as Promise<{ data?: VerifyResponse; error?: string; status: number }>;
}

/** Open Paystack Inline checkout using an access code from the backend. */
export function openPaystackCheckout(opts: {
  email: string;
  amount: number; // in kobo
  reference: string;
  accessCode: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onCancel?: () => void;
  onError?: (err: unknown) => void;
}) {
  if (!PUBLIC_KEY) {
    throw new Error('VITE_PAYSTACK_PUBLIC_KEY is not configured');
  }
  if (!window.PaystackPop) {
    throw new Error('Paystack inline script failed to load. Please refresh the page.');
  }

  window.PaystackPop.newTransaction({
    key: PUBLIC_KEY,
    email: opts.email,
    amount: opts.amount,
    currency: opts.currency ?? 'NGN',
    reference: opts.reference,
    accessCode: opts.accessCode,
    metadata: opts.metadata,
    onSuccess: (tx) => opts.onSuccess(tx.reference),
    onCancel: () => opts.onCancel?.(),
    onError: (err) => opts.onError?.(err),
  });
}
