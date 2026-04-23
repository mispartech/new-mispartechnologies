import React from 'react';
import { Check, User, Building2, Crown, Clock } from 'lucide-react';

interface PricingTier {
  name: string;
  icon: React.ReactNode;
  badge?: string;
  bestFor: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  footnote: string;
  highlighted?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Starter',
    icon: <User className="w-5 h-5" />,
    bestFor: 'Best for small churches, schools & teams',
    description: 'Get started with contactless attendance for a single team or department.',
    price: '$50',
    period: '/quarter',
    features: [
      'Up to 50 members',
      '1 admin user',
      '1 department',
      'Face recognition attendance',
      'Basic attendance logs & reports',
      'Email attendance reports',
      'Email support',
    ],
    footnote: 'Billed quarterly · Cancel anytime',
  },
  {
    name: 'Pro',
    icon: <Crown className="w-5 h-5" />,
    badge: 'Top Pick',
    bestFor: 'Best for growing organisations',
    description: 'Scale across multiple departments with analytics and richer reporting.',
    price: '$75',
    period: '/quarter',
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
    footnote: 'Billed quarterly · 24/7 customer support',
    highlighted: true,
  },
  {
    name: 'Business',
    icon: <Building2 className="w-5 h-5" />,
    bestFor: 'Best for large, multi-site organisations',
    description: 'Full control, branding, and unlimited scale with a dedicated account manager.',
    price: '$120',
    period: '/quarter',
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
    footnote: 'Billed quarterly · 28-day free trial',
  },
];

const PricingSection = () => {
  return (
    <section
      id="pricing"
      className="relative py-24 overflow-hidden"
      style={{ background: 'hsl(var(--hero-bg))' }}
    >
      {/* Subtle glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07] blur-[120px]" style={{ background: 'hsl(var(--glow-cyan))' }} />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: 'hsl(var(--primary-foreground))' }}>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Pricing Plans
            </span>
          </h2>
          <p className="text-base md:text-lg" style={{ color: 'hsl(210 20% 70%)' }}>
            Whether you're starting small, managing a growing congregation, or running a large
            organisation, our plans are designed to deliver accurate, real-time, and contactless
            attendance at every scale.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-10">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-6 lg:p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                tier.highlighted
                  ? 'ring-2 ring-secondary shadow-lg shadow-secondary/10'
                  : 'ring-1 ring-white/10'
              }`}
              style={{ background: 'hsl(210 30% 15% / 0.6)', backdropFilter: 'blur(12px)' }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold italic" style={{ color: 'hsl(var(--primary-foreground))' }}>
                    {tier.name}
                  </h3>
                  <span style={{ color: 'hsl(var(--secondary))' }}>{tier.icon}</span>
                </div>
                {tier.badge && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                    {tier.badge}
                  </span>
                )}
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'hsl(var(--secondary))' }}>
                {tier.bestFor}
              </p>
              <p className="text-sm mb-6" style={{ color: 'hsl(210 20% 65%)' }}>
                {tier.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-secondary" />
                    <span className="text-sm" style={{ color: 'hsl(210 20% 80%)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div
                className={`rounded-xl py-3 text-center font-bold text-lg mb-4 transition-colors ${
                  tier.highlighted
                    ? 'bg-secondary text-secondary-foreground'
                    : 'border border-white/20 hover:border-secondary/50'
                }`}
                style={!tier.highlighted ? { color: 'hsl(var(--primary-foreground))' } : {}}
              >
                {tier.price} <span className="text-sm font-medium opacity-80">{tier.period}</span>
              </div>

              {/* Footnote */}
              <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'hsl(210 20% 55%)' }}>
                <Check className="w-3 h-3 text-secondary" />
                {tier.footnote}
              </div>
            </div>
          ))}
        </div>

        {/* Payment coming soon notice */}
        <div className="max-w-md mx-auto mb-16">
          <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10">
            <Clock className="w-4 h-4 text-cyan" />
            <span className="text-xs text-white/50">Payment integration coming soon — contact sales to get started</span>
          </div>
        </div>

        {/* Hardware section */}
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="font-bold text-base mb-3" style={{ color: 'hsl(var(--primary-foreground))' }}>
            Hardware & Setup (Optional)
          </h3>
          <ul className="space-y-1.5">
            {[
              'One-time camera setup (or use existing CCTV/IP cameras)',
              'Custom deployment & onboarding support',
              'Staff training & system configuration',
            ].map((item, i) => (
              <li key={i} className="text-sm flex items-center justify-center gap-2" style={{ color: 'hsl(210 20% 65%)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
