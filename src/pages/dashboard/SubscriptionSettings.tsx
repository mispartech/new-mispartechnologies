import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Clock, CreditCard, ArrowRight, MessageCircle, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { initializePayment, verifyPayment, openPaystackCheckout, type PaystackPlan } from '@/lib/api/paystack';

interface Plan {
  id: PaystackPlan;
  name: string;
  price: string;
  period: string;
  bestFor: string;
  highlighted?: boolean;
  badge?: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$50',
    period: '/quarter',
    bestFor: 'Best for small churches, schools & teams',
    features: [
      'Up to 50 members',
      '1 admin user',
      '1 department',
      'Face recognition attendance',
      'Basic attendance logs & reports',
      'Email attendance reports',
      'Email support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$75',
    period: '/quarter',
    highlighted: true,
    badge: 'Top Pick',
    bestFor: 'Best for growing organisations',
    features: [
      'Everything in Starter',
      'Up to 200 members',
      'Up to 5 admin/manager accounts',
      'Unlimited departments',
      'Attendance analytics & charts',
      'CSV / PDF export',
      'Monthly reports (Email included)',
      'WhatsApp reporting add-on (₦20/member/month)',
      'Priority support',
    ],
  },
  {
    id: 'business',
    name: 'Business',
    price: '$120',
    period: '/quarter',
    bestFor: 'Best for large, multi-site organisations',
    features: [
      'Everything in Pro',
      'Unlimited members & admins',
      'Visitor tracking & review',
      'Custom branding & theming',
      'Activity logs & audit trail',
      'Email + WhatsApp reports (first 500 members included)',
      'WhatsApp: ₦20/member/month beyond 500',
      'API access',
      'Dedicated account manager',
    ],
  },
];

const SubscriptionSettings = () => {
  const memberCount = 0;
  const whatsappCostEstimate = memberCount * 20;
  const [loadingPlan, setLoadingPlan] = useState<PaystackPlan | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Verify payment after Paystack redirect callback (?reference=... or ?trxref=...)
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;

    (async () => {
      const res = await verifyPayment(reference);
      if (res.data?.status === 'success') {
        toast({
          title: 'Payment Successful',
          description: `Your ${res.data.plan ?? ''} subscription is now active.`,
        });
      } else if (res.error) {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: res.error,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Payment Not Completed',
          description: `Status: ${res.data?.status ?? 'unknown'}`,
        });
      }
      // Clean URL
      const next = new URLSearchParams(searchParams);
      next.delete('reference');
      next.delete('trxref');
      setSearchParams(next, { replace: true });
    })();
  }, [searchParams, setSearchParams]);

  const handleSubscribe = async (plan: PaystackPlan) => {
    setLoadingPlan(plan);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) {
        toast({
          variant: 'destructive',
          title: 'Not signed in',
          description: 'Please sign in to subscribe to a plan.',
        });
        return;
      }

      const init = await initializePayment({ plan, email });
      if (!init.data) {
        toast({
          variant: 'destructive',
          title: 'Could not start payment',
          description: init.error || 'Please try again.',
        });
        return;
      }

      const { reference, access_code, authorization_url, amount, currency } = init.data;

      try {
        openPaystackCheckout({
          email,
          amount,
          currency,
          reference,
          accessCode: access_code,
          metadata: { plan },
          onSuccess: async (ref) => {
            const v = await verifyPayment(ref);
            if (v.data?.status === 'success') {
              toast({
                title: 'Payment Successful',
                description: `Your ${plan} subscription is now active.`,
              });
            } else {
              toast({
                variant: 'destructive',
                title: 'Verification Pending',
                description: 'We are still confirming your payment. You will be notified shortly.',
              });
            }
          },
          onCancel: () => {
            toast({ title: 'Payment cancelled' });
          },
          onError: (err) => {
            console.error('[Paystack] error', err);
            toast({
              variant: 'destructive',
              title: 'Payment error',
              description: 'Something went wrong with the payment popup.',
            });
          },
        });
      } catch (err) {
        // Fallback: redirect to Paystack hosted page
        if (authorization_url) {
          window.location.href = authorization_url;
          return;
        }
        throw err;
      }
    } catch (err) {
      console.error('[Subscribe]', err);
      toast({
        variant: 'destructive',
        title: 'Unable to start checkout',
        description: err instanceof Error ? err.message : 'Unexpected error',
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscription & Billing</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your organization's subscription plan</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Current Plan</h2>
          </div>
          <Badge variant="secondary" className="text-xs">Free Trial</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          You're currently on a free trial. Choose a plan below to continue using Mispar after your trial ends.
        </p>
      </div>

      {/* Secure Payment Notice */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
        <CreditCard className="w-5 h-5 text-primary shrink-0" />
        <p className="text-sm text-foreground">
          Payments are processed securely by <span className="font-semibold">Paystack</span>. Your card details never touch our servers.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 flex flex-col ${
              plan.highlighted
                ? 'border-primary shadow-md shadow-primary/10 bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              {plan.badge && (
                <Badge className="text-xs">{plan.badge}</Badge>
              )}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              {plan.bestFor}
            </p>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
              <p className="text-xs text-muted-foreground mt-1">Billed quarterly</p>
            </div>
            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.highlighted ? 'default' : 'outline'}
              className="w-full"
              disabled={loadingPlan !== null}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loadingPlan === plan.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting checkout…
                </>
              ) : (
                <>Subscribe to {plan.name}</>
              )}
            </Button>
          </div>
        ))}
      </div>

      {/* WhatsApp Add-on Section */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">WhatsApp Delivery Add-on</h2>
          <Badge variant="outline" className="text-xs">Pro & Business</Badge>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Send monthly attendance records to members via WhatsApp. Available on Pro and Business plans.
        </p>
        <div className="grid sm:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Cost per member</p>
            <p className="text-lg font-bold text-foreground">₦20<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Your members</p>
            <p className="text-lg font-bold text-foreground">{memberCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estimated cost</p>
            <p className="text-lg font-bold text-foreground">₦{whatsappCostEstimate.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
          <Mail className="w-3 h-3" />
          Configure delivery channel in Organization Settings → Delivery tab
        </p>
      </div>

      {/* Contact */}
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h3 className="font-semibold text-foreground mb-2">Need a custom plan?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Contact our sales team for enterprise pricing and custom feature sets.
        </p>
        <Button variant="outline" asChild>
          <a href="mailto:sales@mispartechnologies.com">
            Contact Sales <ArrowRight className="w-4 h-4 ml-1" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSettings;
