/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Clock, Printer } from 'lucide-react';

interface LegalPagesProps {
  initialTab?: 'privacy' | 'terms';
}

export default function LegalPages({ initialTab = 'privacy' }: LegalPagesProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header bar controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-850 pb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'privacy' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`pb-2 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'terms' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Terms of Service
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Document
          </button>
        </div>

        {activeTab === 'privacy' ? (
          // PRIVACY POLICY CONTENT
          <div className="space-y-6 max-w-3xl leading-relaxed font-light text-slate-300 text-sm md:text-base">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="h-5 w-5" />
              <span className="font-display font-bold uppercase tracking-wider text-xs">Privacy Protocol v1.4</span>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              SCUT AI Privacy Policy
            </h1>
            <p className="text-xs text-slate-500">Last updated: July 14, 2026</p>

            <section className="space-y-3 pt-4">
              <h3 className="font-display text-base font-bold text-white">1. Core Telemetry & Information We Collect</h3>
              <p>
                We capture your email address and profile name during authentication. In addition, our backend systems keep log audits of query volumes and token consumption counts to enforce subscription boundaries.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">2. Prompt Inputs & File Attachments</h3>
              <p>
                All conversational text and visual base64 files are processed on the server and handed off to Google GenAI endpoints. We do not store or persist raw prompt inputs on our persistent databases unless bookmarked by the builder inside favorited states.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">3. Zero Data Training Enforcement</h3>
              <p>
                Pro and Business subscriber payloads are governed by zero data training API terms. Your inputs bypass general language weight updates completely.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">4. Cookies & Persistent Tokens</h3>
              <p>
                We utilize client-side localStorage and standard cookies solely to secure your login state and verify Stripe subscription tokens. No advertising trackers are deployed.
              </p>
            </section>
          </div>
        ) : (
          // TERMS OF SERVICE CONTENT
          <div className="space-y-6 max-w-3xl leading-relaxed font-light text-slate-300 text-sm md:text-base">
            <div className="flex items-center gap-2 text-cyan-400">
              <BookOpen className="h-5 w-5" />
              <span className="font-display font-bold uppercase tracking-wider text-xs">Legal Contract v1.2</span>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              SCUT AI Terms of Service
            </h1>
            <p className="text-xs text-slate-500">Last updated: July 14, 2026</p>

            <section className="space-y-3 pt-4">
              <h3 className="font-display text-base font-bold text-white">1. Provision of Platform Services</h3>
              <p>
                SCUT AI provides multi-model workspace capabilities proxying directly to Google Gemini models. You are granted a limited, revocable license to access computing endpoints under the quota bounds defined by your current billing tier.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">2. Acceptable Platform Use</h3>
              <p>
                You must not leverage custom developer API credentials to carry out systemic scraping operations or breach general security limits.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">3. Sandboxed Stripe Billing Simulations</h3>
              <p>
                SCUT AI billing portals utilize card simulations. All payments, receipts, and invoices are generated within virtual sandboxes and hold zero actual currency value. Upgrades are provided purely as simulated utility services.
              </p>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-bold text-white">4. Disclaimers of SLA Warranty</h3>
              <p>
                Services are provided "as-is." Free Starter plans are delivered without uptime SLAs. Dedicated response guarantees are reserved exclusively for Business and Enterprise SLA contracts.
              </p>
            </section>
          </div>
        )}

      </div>
    </div>
  );
}
