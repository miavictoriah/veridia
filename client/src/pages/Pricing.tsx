import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardNav } from '@/components/DashboardNav';
import { useAuth } from '@/_core/hooks/useAuth';

export default function Pricing() {
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [nonCompliantPct, setNonCompliantPct] = useState(35);
  const [propertyCount, setPropertyCount] = useState(50);

  const tiers = [
    {
      id: 'insight',
      name: 'Insight',
      description: 'Risk visibility and compliance forecasting for smaller portfolios.',
      monthlyPrice: 375,
      annualPrice: 4500,
      features: [
        { name: 'Risk scoring dashboard', included: true },
        { name: 'Compliance forecasting (6-month)', included: true },
        { name: 'Portfolio aggregation', included: true },
        { name: 'Up to 50 properties', included: true },
        { name: 'Email support', included: true },
        { name: 'Capex prioritisation', included: false },
        { name: 'Scenario modelling', included: false },
        { name: 'API access', included: false },
        { name: 'Dedicated account manager', included: false },
      ],
      cta: 'Start with Insight',
      highlighted: false,
    },
    {
      id: 'optimize',
      name: 'Optimise',
      description: 'Full decision support with capex optimisation and scenario modelling.',
      monthlyPrice: 750,
      annualPrice: 9000,
      features: [
        { name: 'Risk scoring dashboard', included: true },
        { name: 'Compliance forecasting (12-month)', included: true },
        { name: 'Portfolio aggregation', included: true },
        { name: 'Up to 500 properties', included: true },
        { name: 'Email & chat support', included: true },
        { name: 'Capex prioritisation', included: true },
        { name: 'Scenario modelling', included: true },
        { name: 'API access', included: false },
        { name: 'Dedicated account manager', included: false },
      ],
      cta: 'Start with Optimise',
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom integrations, unlimited properties, and dedicated support.',
      monthlyPrice: 1500,
      annualPrice: 18000,
      features: [
        { name: 'Risk scoring dashboard', included: true },
        { name: 'Compliance forecasting (24-month)', included: true },
        { name: 'Portfolio aggregation', included: true },
        { name: 'Unlimited properties', included: true },
        { name: 'Priority support (24/7)', included: true },
        { name: 'Capex prioritisation', included: true },
        { name: 'Scenario modelling', included: true },
        { name: 'API access', included: true },
        { name: 'Dedicated account manager', included: true },
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const getPrice = (tier: typeof tiers[0]) => {
    return billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
  };

  const getSavings = (tier: typeof tiers[0]) => {
    if (billingCycle === 'annual') {
      const monthlyCost = tier.monthlyPrice * 12;
      const savings = monthlyCost - tier.annualPrice;
      const percent = Math.round((savings / monthlyCost) * 100);
      return { savings, percent };
    }
    return null;
  };

  const Wrapper = isAuthenticated ? ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#fafafa]">
      <DashboardNav />
      <div className="lg:ml-60 pt-14 lg:pt-0">
        <div className="border-b border-gray-100 bg-white">
          <div className="px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Plans & Pricing</h1>
            <p className="text-[13px] text-gray-400 mt-1">Choose the plan that fits your portfolio</p>
          </div>
        </div>
        <div className="px-6 lg:px-8 py-8">{children}</div>
      </div>
    </div>
  ) : ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-white">
      {/* Minimal nav for public pricing */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-2.5">
            <svg viewBox="0 0 28 28" className="w-7 h-7" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 3C8 3 4 8 4 14c0 6 4 11 10 11 2-4 4-9 4-14 0-3-1-5.5-4-8z" fill="#0d9488" opacity="0.9"/>
              <path d="M14 3c4 2.5 6 5 6 8 0 5-2 10-6 14" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" fill="none"/>
            </svg>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">Veridia</span>
          </a>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-16">{children}</div>
    </div>
  );

  return (
    <Wrapper>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        {!isAuthenticated && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Choose the plan that fits your portfolio size. All plans include a 14-day free trial.
            </p>
          </div>
        )}

        {/* ROI Calculator */}
        <div className="bg-gray-50 rounded-xl border border-gray-100 p-8 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-1 text-center">Estimate your savings</h2>
          <p className="text-[13px] text-gray-400 text-center mb-6">Based on avoided fines, protected rental income, and capex sequencing</p>
          <div className="grid md:grid-cols-2 gap-8 mb-6">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-2">Number of properties</label>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={propertyCount}
                onChange={(e) => setPropertyCount(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="text-center mt-2 text-[14px] font-semibold text-teal-700">{propertyCount} properties</div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-2">Estimated non-compliant (%)</label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={nonCompliantPct}
                onChange={(e) => setNonCompliantPct(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
              />
              <div className="text-center mt-2 text-[14px] font-semibold text-teal-700">{nonCompliantPct}% below EPC C</div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">Avoided MEES Fines</p>
              <p className="text-xl font-semibold text-red-600">£{(Math.round(propertyCount * (nonCompliantPct / 100) * 5000 / 1000))}K</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">Protected Rent</p>
              <p className="text-xl font-semibold text-teal-600">£{(Math.round(propertyCount * (nonCompliantPct / 100) * 0.3 * 14400 / 1000))}K</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">Sequencing Savings</p>
              <p className="text-xl font-semibold text-teal-600">£{(Math.round(propertyCount * 10000 * 0.15 / 1000))}K</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
              <p className="text-[11px] text-gray-400 mb-1">Time Saved</p>
              <p className="text-xl font-semibold text-purple-600">{Math.round(propertyCount * 2 / 8)} days</p>
            </div>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-[13px] font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-400'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
              billingCycle === 'annual' ? 'bg-teal-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-[13px] font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-400'}`}>
            Annual
          </span>
          {billingCycle === 'annual' && (
            <span className="ml-1 inline-block bg-teal-50 text-teal-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              Save 15%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-xl border transition-all ${
                tier.highlighted
                  ? 'border-teal-200 bg-teal-50/30 shadow-sm'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-teal-600 text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{tier.name}</h3>
                <p className="text-[13px] text-gray-400 mb-5">{tier.description}</p>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-semibold text-gray-900">
                      £{getPrice(tier).toLocaleString()}
                    </span>
                    <span className="text-[13px] text-gray-400">
                      /{billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  </div>
                  {getSavings(tier) && (
                    <p className="text-[12px] text-teal-600 font-medium mt-1">
                      Save £{getSavings(tier)!.savings.toLocaleString()} vs monthly
                    </p>
                  )}
                </div>

                <Button
                  className={`w-full mb-6 text-[13px] h-10 ${
                    tier.highlighted
                      ? 'bg-teal-600 hover:bg-teal-700 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tier.cta}
                </Button>

                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-[13px] ${feature.included ? 'text-gray-600' : 'text-gray-300'}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-16">
          <h2 className="text-2xl font-semibold text-gray-900 tracking-tight mb-8 text-center">
            Frequently asked questions
          </h2>

          <div className="space-y-5">
            {[
              { q: "Can I change plans anytime?", a: "Yes, you can upgrade or downgrade at any time. Changes take effect at the start of your next billing cycle." },
              { q: "What's included in the free trial?", a: "Your 14-day free trial includes full access to all Optimise plan features. No credit card required." },
              { q: "Do you offer multi-year discounts?", a: "Yes, we offer 10-15% discounts for 3-year prepaid contracts. Contact our sales team for details." },
              { q: "What if I need more than 500 properties?", a: "The Enterprise plan supports unlimited properties with custom pricing based on portfolio size." },
              { q: "Do you offer implementation support?", a: "All plans include onboarding support. Enterprise customers receive dedicated implementation assistance and custom integrations." },
            ].map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-5">
                <h3 className="text-[14px] font-semibold text-gray-900 mb-1.5">{faq.q}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gray-900 rounded-xl p-10 text-center">
          <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">
            Ready to see your portfolio's risk?
          </h2>
          <p className="text-[14px] text-gray-400 mb-6 max-w-lg mx-auto">
            Enter your first postcode and get real EPC data, risk scores, and upgrade cost estimates in minutes.
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white text-[14px] h-11 px-8 rounded-xl">
            Start free trial
          </Button>
        </div>
      </div>
    </Wrapper>
  );
}
