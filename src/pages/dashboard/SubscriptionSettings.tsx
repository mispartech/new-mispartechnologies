import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, User, Building2, Crown, Clock, CreditCard, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const plans = [
  {
    name: 'Starter',
    price: '$35',
    period: '/quarter',
    features: [
      'Up to 50 members',
      '1 admin user',
      'Face recognition attendance',
      'Basic attendance logs & reports',
      '1 department',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$65',
    period: '/quarter',
    highlighted: true,
    badge: 'Recommended',
    features: [
      'Everything in Starter',
      'Up to 200 members',
      '5 admin/manager accounts',
      'Unlimited departments',
      'Attendance analytics & charts',
      'CSV/PDF export',
      'Priority support',
    ],
  },
  {
    name: 'Business',
    price: '$100',
    period: '/quarter',
    features: [
      'Everything in Pro',
      'Unlimited members & admins',
      'Visitor tracking & review',
      'Custom branding & theming',
      'Activity logs & audit trail',
      'API access',
      'Dedicated account manager',
    ],
  },
];

const SubscriptionSettings = () => {
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
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
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
