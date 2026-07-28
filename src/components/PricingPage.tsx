/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, HelpCircle, Layers, ShieldCheck, Zap } from 'lucide-react';

interface PricingPageProps {
  onNavigate: (page: string) => void;
  userTier: string;
}

export default function PricingPage({ onNavigate, userTier }: PricingPageProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return '€0.00';
    const price = isAnnual ? monthlyPrice * 0.8 : monthlyPrice;
    return `€${price.toFixed(2)}`;
  };

  const planTiers = [
    {
      id: 'free',
      name: 'Free Starter',
      price: 0,
      desc: 'Test-drive SCUT Gemini capabilities',
      cta: 'Get Started Free',
      features: [
        '100 queries / month limit',
        'Standard Gemini 2.5 Flash API access',
        'Basic local search & history threads',
        'Image & document attachments',
        'Community forum support'
      ]
    },
    {
      id: 'pro',
      name: 'Professional Pro',
      price: 9.99,
      desc: 'Unlimited power for builders & researchers',
      cta: 'Upgrade to Pro',
      popular: true,
      badge: 'Highly Popular',
      features: [
        'Unlimited Gemini 2.5 Flash queries',
        'Access to reasoning Gemini 2.5 Pro',
        '1,000 custom API key invocations',
        'Prioritized response times (30ms avg)',
        'Full markdown & doc extraction system',
        'Dedicated workspace dashboard analytics',
        'Standard email support (under 24h)'
      ]
    },
    {
      id: 'business',
      name: 'Business Elite',
      price: 19.99,
      desc: 'Scale up deep team collaborations',
      cta: 'Upgrade to Business',
      features: [
        'Everything in Professional Pro',
        'Shared group workspace dashboards',
        '10,000 custom API key invocations',
        'Zero data training privacy terms',
        'Dedicated SLA & 24/7 priority support',
        'Custom invoice billing support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      price: null,
      desc: 'Tailored limits for global organizations',
      cta: 'Contact Enterprise',
      features: [
        'Custom private model deployments',
        'Unlimited custom API key invocations',
        'Custom system prompts preloading',
        'Single Sign-On (SSO) SAML integrations',
        'Personal dedicated client success manager',
        'On-premise sandbox architectures'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Simple Transparent Billing
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Choose the Perfect Intelligence Level
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            All tiers connect directly to high-performance Google Gemini models. Switch billing cycles below to instantly unlock a 20% discount.
          </p>

          {/* Billing Toggle switch */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className={`text-xs font-medium transition-colors ${!isAnnual ? 'text-white' : 'text-slate-500'}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-7 rounded-full bg-slate-900 border border-slate-800 p-0.5 relative transition-all cursor-pointer"
            >
              <div 
                className={`bg-cyan-400 h-5 w-5 rounded-full shadow transform duration-250 ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`} 
              />
            </button>
            <span className={`text-xs font-medium transition-colors flex items-center gap-1.5 ${isAnnual ? 'text-cyan-400' : 'text-slate-500'}`}>
              Annual Billing
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {planTiers.map((p) => {
            const isCurrent = userTier === p.id;
            return (
              <div 
                key={p.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${
                  p.popular 
                    ? 'border-cyan-500 bg-cyan-950/5 shadow-cyan-500/[0.02]' 
                    : 'border-slate-850 bg-slate-900/20'
                }`}
              >
                {p.popular && p.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed font-light">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    {p.price !== null ? (
                      <>
                        <span className="text-3xl font-extrabold text-white">{calculatePrice(p.price)}</span>
                        <span className="text-xs text-slate-500">/ {isAnnual ? 'yr' : 'mo'}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold text-white">Custom SLA</span>
                    )}
                  </div>

                  <div className="border-t border-slate-800/80 pt-5 space-y-3">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-light leading-normal">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" /> Active Plan
                    </button>
                  ) : p.price === null ? (
                    <button
                      onClick={() => onNavigate('contact')}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white transition-all cursor-pointer text-center block"
                    >
                      Contact Enterprise Sales
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('subscription')}
                      className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all text-xs text-center block"
                    >
                      {p.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Checklist Table */}
        <div className="space-y-6 pt-8">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-white">Detailed Matrix Comparison</h2>
            <p className="text-xs text-slate-500">Audit specific limits and feature boundaries</p>
          </div>

          <div className="rounded-2xl border border-slate-850 bg-slate-900/20 overflow-hidden shadow-inner max-w-4xl mx-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold">
                    <th className="p-4">Platform Feature</th>
                    <th className="p-4">Free</th>
                    <th className="p-4 text-cyan-400">Pro</th>
                    <th className="p-4">Business</th>
                    <th className="p-4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  <tr>
                    <td className="p-4 font-medium text-slate-200">Gemini 2.5 Flash Queries</td>
                    <td className="p-4 text-slate-400">100 / month</td>
                    <td className="p-4 font-bold text-cyan-300">Unlimited</td>
                    <td className="p-4 text-slate-300">Unlimited</td>
                    <td className="p-4 text-slate-300">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-200">Gemini 2.5 Pro Model access</td>
                    <td className="p-4 text-slate-500">Locked 🔒</td>
                    <td className="p-4 font-semibold text-emerald-400">Included ✔</td>
                    <td className="p-4 text-emerald-400">Included ✔</td>
                    <td className="p-4 text-emerald-400">Included ✔</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-200">Custom Dev API Keys</td>
                    <td className="p-4 text-slate-500">None</td>
                    <td className="p-4 text-slate-300">1,000 queries</td>
                    <td className="p-4 text-slate-300">10,000 queries</td>
                    <td className="p-4 font-bold text-cyan-300">Custom Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-200">Data Training Privacy</td>
                    <td className="p-4 text-slate-400">Standard terms</td>
                    <td className="p-4 text-slate-400">Standard terms</td>
                    <td className="p-4 font-semibold text-cyan-400">Zero Data Training ✔</td>
                    <td className="p-4 text-cyan-400">Zero Data Training ✔</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-slate-200">Priority SLA Support</td>
                    <td className="p-4 text-slate-500">None</td>
                    <td className="p-4 text-slate-400">Email &lt;24h</td>
                    <td className="p-4 text-slate-300">Dedicated 1h response</td>
                    <td className="p-4 font-bold text-cyan-400">SLA contract guarantee</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
