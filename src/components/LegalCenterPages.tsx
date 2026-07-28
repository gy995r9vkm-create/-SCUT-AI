/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, ShieldAlert, BookOpen, Clock, Printer, Scale, CheckSquare, 
  Search, Lock, Download, FileSignature, CheckCircle, ChevronRight
} from 'lucide-react';

interface LegalCenterPagesProps {
  initialTab?: 'legal_center' | 'privacy' | 'terms' | 'cookie' | 'security' | 'community' | 'rules' | 'pay_terms';
  onNavigate: (page: string) => void;
}

export default function LegalCenterPages({ initialTab = 'legal_center', onNavigate }: LegalCenterPagesProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [signedCompliance, setSignedCompliance] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const legalTabs = [
    { id: 'legal_center', label: 'Trust Center Hub', icon: Scale },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'terms', label: 'Terms of Service', icon: BookOpen },
    { id: 'cookie', label: 'Cookie Policy', icon: Lock },
    { id: 'security', label: 'Security Policy', icon: ShieldAlert },
    { id: 'community', label: 'Community Guidelines', icon: FileSignature },
    { id: 'rules', label: 'Marketplace Rules', icon: CheckSquare },
    { id: 'pay_terms', label: 'SCUT Pay Terms', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Trust & Safety</span>
              <span className="text-[10px] font-mono text-slate-500">Last Audited: July 2026</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <Scale className="h-8 w-8 text-cyan-400" />
              Legal & Trust Center
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              Understand our regulatory blueprints, decentralized safety protocols, privacy policies, and community standards.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 transition-all flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print Document
            </button>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search policy codes or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white outline-none transition-all"
          />
        </div>

        {/* WORKSPACE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT SIDEBAR CONTROLS */}
          <div className="lg:col-span-1 space-y-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold px-3">Ecosystem Protocols</div>
            <nav className="space-y-1">
              {legalTabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === tab.id 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                    }`}
                  >
                    <TabIcon className={`h-4 w-4 ${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="pt-6 border-t border-slate-900 mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900 space-y-2">
                <div className="text-[9px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Compliance Check
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                  Your current session conforms with SCUT v1.4 privacy directives.
                </p>
                <button
                  onClick={() => {
                    setSignedCompliance(true);
                    alert('Cryptographic signature applied to session headers.');
                  }}
                  disabled={signedCompliance}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-bold text-cyan-400 disabled:text-slate-500 transition-all cursor-pointer"
                >
                  {signedCompliance ? 'Signature Applied' : 'Sign Terms Electronically'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT POLICIES VIEWER PANEL */}
          <div className="lg:col-span-3 min-h-[400px] p-8 rounded-3xl bg-slate-900/20 border border-slate-900 leading-relaxed text-sm text-slate-300 font-light space-y-6">
            
            {activeTab === 'legal_center' && (
              <div className="space-y-6">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Scale className="h-6 w-6 text-cyan-400" />
                  Ecosystem Trust & Compliance Center
                </h2>
                <p className="text-slate-400 text-xs md:text-sm">
                  Welcome to the primary hub for SCUT AI platform governance. Use the side index menu to access raw legal agreements, guidelines, and compliance certifications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1.5">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Zero-Data Logging SLA</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      All enterprise accounts are backed by non-training API covenants, protecting prompts from general LLM tuning pools.
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1.5">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Decentralized Payment Escrow</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Transactions across Marketplace and SCUT Pay are securely verified via cryptographic credit nodes to avoid fraud.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Privacy Protocol v1.4</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">SCUT AI Privacy Policy</h1>
                <p className="text-xs text-slate-500">Last updated: July 14, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Prompt Inputs & File Attachments</h3>
                <p className="text-xs text-slate-400">
                  All conversational text and visual base64 files are processed on the server and handed off to Google GenAI endpoints. We do not store or persist raw prompt inputs on our persistent databases unless bookmarked by the builder inside favorited states.
                </p>
                <h3 className="font-display text-sm font-bold text-white">2. Data Training Safeguards</h3>
                <p className="text-xs text-slate-400">
                  Pro and Business subscriber payloads are governed by zero data training API terms. Your inputs bypass general language weight updates completely.
                </p>
              </div>
            )}

            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <BookOpen className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Legal Contract v1.2</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">Terms of Service Agreement</h1>
                <p className="text-xs text-slate-500">Last updated: July 12, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Acceptable Computational Usage</h3>
                <p className="text-xs text-slate-400">
                  Subscribers agree to deploy prompts in accordance with universal ethical guidelines. Automated high-frequency scraping of SCUT proxy endpoints without a registered API key is strictly forbidden and subject to automated session termination.
                </p>
                <h3 className="font-display text-sm font-bold text-white">2. Credit & Token Ledger Balances</h3>
                <p className="text-xs text-slate-400">
                  Ecosystem credits purchased or awarded carry no physical cash value and are solely redeemable for AI compute execution, marketplace downloads, or verified group operations inside SCUT portals.
                </p>
              </div>
            )}

            {activeTab === 'cookie' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Lock className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Security Protocol v1.0</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">Cookie & Client State Policy</h1>
                <p className="text-xs text-slate-500">Last updated: July 10, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Client-Side Persistent Tokens</h3>
                <p className="text-xs text-slate-400">
                  We utilize secure cookies and localized client-side browser space (localStorage) solely to cache active authorization sessions, route paths, and dynamic multi-language preferences. We deploy zero cross-site behavioral tracking cookies.
                </p>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-400">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Threat Compliance v2.5</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">Security & Encryption Standards</h1>
                <p className="text-xs text-slate-500">Last updated: July 18, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. End-to-End Database Isolation</h3>
                <p className="text-xs text-slate-400">
                  User accounts and API secrets are isolated at the database container level using Firebase Security Rules. Multi-factor encryption locks prevent unauthorized access to prompt structures.
                </p>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <FileSignature className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Platform Covenant v1.1</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">Ecosystem Community Guidelines</h1>
                <p className="text-xs text-slate-500">Last updated: July 15, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Safe Multi-user Collaboration</h3>
                <p className="text-xs text-slate-400">
                  SCUT Chat and Virtual rooms are monitored for abusive language patterns. Users are expected to foster positive, construction-focused interactions within both regional and global virtual lounges.
                </p>
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <CheckSquare className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Market Rules v1.0</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">Marketplace & Trading Rules</h1>
                <p className="text-xs text-slate-500">Last updated: July 11, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Verified Prompt and Asset Selling</h3>
                <p className="text-xs text-slate-400">
                  All prompt templates, bots, or plugins submitted to the SCUT Marketplace undergo automated semantic safety sandboxing. Authors are credited in real-time in SCUT Credits when an asset is downloaded.
                </p>
              </div>
            )}

            {activeTab === 'pay_terms' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-cyan-400">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-display font-bold uppercase tracking-wider text-xs">Ledger SLA v1.3</span>
                </div>
                <h1 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight">SCUT Pay Terms of Service</h1>
                <p className="text-xs text-slate-500">Last updated: July 16, 2026</p>
                
                <h3 className="font-display text-sm font-bold text-white pt-2">1. Escrows, Fees, and Settlement Nodes</h3>
                <p className="text-xs text-slate-400">
                  Transactions initiated through SCUT Pay are settled instantly via the regional Firebase cluster. Standard consumer purchases are backed by standard 14-day token chargeback escrows.
                </p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
