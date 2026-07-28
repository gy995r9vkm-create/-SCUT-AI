/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Coins, CreditCard, Zap, List, ArrowUpRight, Shield, Sparkle, Menu, X, 
  Terminal, Smartphone, Bell, Sliders, DollarSign, Wallet
} from 'lucide-react';

import WalletPage from './WalletPage';
import ScutTokenPage from './ScutTokenPage';
import ScutCreditsPage from './ScutCreditsPage';
import TransactionsPage from './TransactionsPage';
import PaymentRequestsPage from './PaymentRequestsPage';

interface ScutPayHubProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  initialSubTab?: string;
  onUpdateUser?: any;
  checkoutAmount?: string | null;
  checkoutDescription?: string | null;
  onClearCheckout?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function ScutPayHub({
  user, onNavigate, onAddLog, initialSubTab = 'wallet', onUpdateUser, checkoutAmount, checkoutDescription, onClearCheckout, activeTab, setActiveTab
}: ScutPayHubProps) {
  const [internalActiveTab, setInternalActiveTab] = useState<string>(initialSubTab);
  const [subSidebarOpen, setSubSidebarOpen] = useState(false);

  const currentActiveTab = activeTab || internalActiveTab;
  const updateActiveTab = setActiveTab || setInternalActiveTab;

  useEffect(() => {
    if (initialSubTab) {
      updateActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const payModules = [
    { id: 'wallet', name: 'Multi-Chain Wallet', desc: 'Manage your balance, tokens & gas feeds', icon: Wallet, color: 'text-cyan-400 bg-cyan-500/10' },
    { id: 'token', name: 'SCUT Token (POL)', desc: 'Stake, mint or trade core utility protocol tokens', icon: Coins, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'credits', name: 'SCUT AI Credits', desc: 'AI conversation refills & microcredits ledger', icon: Zap, color: 'text-purple-400 bg-purple-500/10' },
    { id: 'transactions', name: 'Ecosystem Ledger', desc: 'Secure history of decentralized transactions', icon: List, color: 'text-teal-400 bg-teal-500/10' },
    { id: 'payment_requests', name: 'Payment Requests', desc: 'Send peer-to-peer invoices & billing contracts', icon: ArrowUpRight, color: 'text-rose-400 bg-rose-500/10' },
    { id: 'cards_terminals', name: 'Simulated Card Terminals', desc: 'Simulate high-fidelity merchant terminals', icon: CreditCard, color: 'text-indigo-400 bg-indigo-500/10' }
  ];

  const handleTabClick = (tabId: string) => {
    updateActiveTab(tabId);
    setSubSidebarOpen(false);
    onAddLog('Navigated SCUT Pay Hub', `Opened payment module: ${tabId}`, 'billing');
  };

  const renderActiveComponent = () => {
    switch (currentActiveTab) {
      case 'wallet':
        return <WalletPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'token':
        return <ScutTokenPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'credits':
        return <ScutCreditsPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'transactions':
        return <TransactionsPage user={user} onNavigate={onNavigate} />;
      case 'payment_requests':
        return <PaymentRequestsPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'cards_terminals':
        return <FuturePaymentFeatures user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      default:
        return <WalletPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 text-slate-100 min-h-[calc(100vh-64px)] relative overflow-hidden">
      
      {/* MOBILE TRIGGER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Coins className="h-4 w-4" />
          </div>
          <span className="font-display font-extrabold text-sm text-white">SCUT Pay Hub</span>
        </div>
        <button 
          onClick={() => setSubSidebarOpen(!subSidebarOpen)}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          {subSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* SUB-SIDEBAR FOR SCUT PAY */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 md:z-10
        w-64 bg-slate-900/50 border-r border-slate-900/80 p-4 flex flex-col gap-4 shrink-0 h-full
        transition-transform duration-300 transform md:transform-none
        ${subSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center gap-2 px-2 py-1">
          <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Coins className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
              SCUT Pay <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20">v3.2</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">Decentralized Finance Core</p>
          </div>
        </div>

        {/* PAYMENT SUB-MODULE MATRIX */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500 px-2.5 mb-2">Available Ledger Chains</div>
          {payModules.map((mod) => {
            const IconComponent = mod.icon;
            const isActive = currentActiveTab === mod.id;
            return (
              <button
                key={mod.id}
                onClick={() => handleTabClick(mod.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-amber-500/10 border border-amber-500/15 text-white font-bold' 
                    : 'hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg border border-slate-800 ${isActive ? mod.color : 'bg-slate-950 text-slate-500'}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold leading-none">{mod.name}</p>
                  <p className="text-[9px] text-slate-500 font-normal truncate mt-0.5">{mod.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* SECURE CERTIFICATE WIDGET */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2.5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">PCI-DSS Certified Sandbox</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed font-light">
            All cryptographic key sign sequences and Web3 wallet payloads are processed client-side or wrapped in secured serverless isolates.
          </p>
        </div>
      </aside>

      {/* MAIN PAYMENT HUB ENGINE WINDOW */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-[calc(100vh-64px)] md:h-auto">
        <div className="flex-1 overflow-y-auto w-full relative">
          {renderActiveComponent()}
        </div>
      </main>

      {/* Overlay backdrop for mobile sub-sidebar */}
      {subSidebarOpen && (
        <div 
          onClick={() => setSubSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
        />
      )}

    </div>
  );
}

/* Simulated Future Cards and Terminals Page */
function FuturePaymentFeatures({ user, onNavigate, onAddLog }: { user: any; onNavigate: (page: string) => void; onAddLog: any }) {
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 1089');
  const [terminalAmount, setTerminalAmount] = useState('10.00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [terminalSuccess, setTerminalSuccess] = useState(false);

  const triggerSwipe = () => {
    setIsProcessing(true);
    setTerminalSuccess(false);
    onAddLog('POS Terminal swipe requested', `Processing payment swipe of $${terminalAmount}`, 'billing');
    
    setTimeout(() => {
      setIsProcessing(false);
      setTerminalSuccess(true);
      onAddLog('POS Terminal success', `Charged $${terminalAmount} from card ending in 1089`, 'billing');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded">High Fidelity POS Terminal</span>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-8 w-8 text-amber-400" />
            Cards & Terminal Sandbox
          </h1>
          <p className="text-slate-400 text-xs md:text-sm mt-1 font-light">
            Simulate credit card swiping, terminal setups, contactless NFC checkouts, and custom merchant gateway webhooks in real time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Card visualizer */}
          <div className="space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Your Virtual SCUT Platinum Card</h2>
            <div className="h-48 w-full rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 p-6 flex flex-col justify-between shadow-2xl border border-amber-400/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent)] pointer-events-none" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-amber-100/80 leading-none">SCUT Platform Card</p>
                  <p className="text-xs font-bold font-mono text-white mt-0.5">Platinum Sovereign</p>
                </div>
                <Coins className="h-6 w-6 text-white animate-spin-slow" />
              </div>
              
              <p className="text-lg font-mono font-bold tracking-widest text-white mt-4">{cardNumber}</p>
              
              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-[8px] font-mono uppercase text-amber-100/60 leading-none">Card Holder</p>
                  <p className="text-xs font-bold text-white uppercase mt-0.5">{user?.name || 'USER'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-mono uppercase text-amber-100/60 leading-none">Expires</p>
                  <p className="text-xs font-bold text-white font-mono mt-0.5">12/29</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-white">Contactless Wallet Protocol</p>
              <p className="text-[11px] text-slate-400 font-light">
                Your card is linked natively with the SCUT multi-chain wallet. Each POS transaction directly clears the token equivalent from your smart contract balance.
              </p>
            </div>
          </div>

          {/* POS Terminal Emulator */}
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-900 space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-amber-400" /> POS Terminal Emulator
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transaction Amount ($ USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                  <input 
                    type="number"
                    value={terminalAmount}
                    onChange={(e) => setTerminalAmount(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {terminalSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span>Terminal cleared successfully! Paid ${terminalAmount} USD.</span>
                </div>
              )}

              <button 
                onClick={triggerSwipe}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Sliders className="h-4 w-4 animate-spin" />
                    Processing Contactless Swipe...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Simulate Touch/Swipe Pay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
