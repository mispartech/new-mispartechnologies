import React from 'react';
import { Check, Clock, CreditCard, ArrowRight, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
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
  // TODO: fetch real member count from org settings
  const memberCount = 0;
  const whatsappCostEstimate = memberCount * 20;

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

      {/* Payment integration notice */}
      <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-center gap-3">
        <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Payment integration (Paystack) is coming soon. Contact sales to get started with a plan.
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
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
              disabled
            >
              Coming Soon
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
