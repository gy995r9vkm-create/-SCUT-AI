/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, ShieldCheck, Zap, Layers, ChevronRight, HelpCircle, AlertCircle, Sparkles, Check, Info, Lock
} from 'lucide-react';
import { User, SubscriptionTier } from '../types';

interface SubscriptionPageProps {
  user: User;
  onUpdateTier: (tier: SubscriptionTier) => void;
}

export default function SubscriptionPage({ user, onUpdateTier }: SubscriptionPageProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card details states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free Starter',
      price: '€0.00',
      interval: 'lifetime',
      desc: 'Test-drive SCUT Gemini capabilities',
      features: [
        '100 queries / month limit',
        'Standard Gemini 2.5 Flash API access',
        'Basic local search & favorites lists',
        'Image & document attachments'
      ],
      color: 'border-slate-800'
    },
    {
      id: 'pro' as SubscriptionTier,
      name: 'Professional Pro',
      price: '€9.99',
      interval: 'month',
      desc: 'Unlimited power for creators & builders',
      features: [
        'Unlimited Gemini 2.5 Flash queries',
        'Access to reasoning Gemini 2.5 Pro',
        '1,000 custom API key invocations',
        'Prioritized response times (30ms avg)',
        'Full markdown & doc extraction system',
        'Dedicated workspace dashboard analytics'
      ],
      color: 'border-cyan-500/30 bg-cyan-950/5 shadow-cyan-500/5',
      badge: 'Popular',
      popular: true
    },
    {
      id: 'business' as SubscriptionTier,
      name: 'Business Elite',
      price: '€19.99',
      interval: 'month',
      desc: 'Scale up deep team collaborations',
      features: [
        'Everything in Professional Pro',
        'Shared group workspace dashboards',
        '10,000 custom API key invocations',
        'Zero data training privacy terms',
        'Dedicated SLA & 24/7 priority support'
      ],
      color: 'border-indigo-500/20 bg-indigo-950/5'
    }
  ];

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;
    setIsProcessing(true);

    // Simulate secure Stripe verification payment delay
    setTimeout(() => {
      setIsProcessing(false);
      setSuccess(true);
      onUpdateTier(selectedTier);
      
      // Reset card details
      setCardNumber('');
      setCardExpiry('');
      setCardCvc('');
      
      setTimeout(() => {
        setSuccess(false);
        setSelectedTier(null);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Stripe Secure Billing
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white">
            Manage Subscription Billing
          </h1>
          <p className="text-sm text-slate-400 font-light">
            Your billing portal is powered by simulated Stripe Checkout elements. Safe, sandboxed, and secure.
          </p>
        </div>

        {/* Current status overview banner */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/15 text-cyan-400 shrink-0 h-12 w-12 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Activated Plan</p>
              <h2 className="text-xl font-bold text-white capitalize mt-0.5">{user.subscriptionTier} Level</h2>
              <p className="text-xs text-slate-500 mt-1">Next invoice: Simulated renewal scheduled automatically.</p>
            </div>
          </div>

          <div className="bg-slate-950/60 rounded-xl px-4 py-3 border border-slate-850 text-xs text-slate-400 flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>Invoice history and balance sheets are managed automatically.</span>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((p) => {
            const isCurrent = user.subscriptionTier === p.id;
            return (
              <div 
                key={p.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between relative overflow-hidden transition-all hover:-translate-y-1 ${p.color}`}
              >
                {p.badge && (
                  <span className="absolute top-3 right-3 text-[9px] font-bold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {p.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{p.desc}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">{p.price}</span>
                    <span className="text-xs text-slate-500 font-light">/ {p.interval}</span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-4 space-y-2.5">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300 font-light">{f}</span>
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
                  ) : p.id === 'free' ? (
                    <button
                      onClick={() => onUpdateTier('free')}
                      className="w-full py-2.5 px-4 rounded-xl border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      Downgrade to Free
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedTier(p.id)}
                      className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all active:scale-[0.98] text-xs cursor-pointer text-center"
                    >
                      Upgrade to {p.name.split(' ')[1]}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stripe Elements Mock Modal */}
        <AnimatePresence>
          {selectedTier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedTier(null)} />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl glass-panel-heavy p-8 text-white shadow-2xl"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500" />

                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">Stripe Checkout</h3>
                    <p className="text-xs text-slate-400">Upgrade to {selectedTier.toUpperCase()}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedTier(null)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {success ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-lg font-bold text-white">Payment Authorized!</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                      Stripe successfully credited your card. Your SCUT AI workspace tier has been updated to <b>{selectedTier.toUpperCase()}</b>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleCheckout} className="space-y-4">
                    
                    {/* Invoice detail */}
                    <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-850 flex justify-between text-xs">
                      <span className="text-slate-400">Plan Amount Due:</span>
                      <span className="font-bold text-cyan-400 font-mono">
                        {selectedTier === 'pro' ? '€9.99' : '€19.99'} / month
                      </span>
                    </div>

                    {/* Stripe Card fields */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="4242 •••• •••• 4242"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardNumber(v);
                            }}
                            className="w-full rounded-xl bg-slate-950 border border-slate-850 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM / YY"
                            value={cardExpiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '');
                              if (v.length > 2) {
                                setCardExpiry(v.slice(0, 2) + '/' + v.slice(2));
                              } else {
                                setCardExpiry(v);
                              }
                            }}
                            className="w-full rounded-xl bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">CVC Code</label>
                          <input
                            type="password"
                            required
                            maxLength={3}
                            placeholder="•••"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                            className="w-full rounded-xl bg-slate-950 border border-slate-850 px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 justify-center py-1">
                      <Lock className="h-3 w-3 text-cyan-500" />
                      <span>Encrypted SSL Secure Payment Gateway. Powered by Stripe.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 px-4 rounded-xl font-display font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        `Authorize Payment with Stripe`
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

// Simple absolute close helper
function X({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
