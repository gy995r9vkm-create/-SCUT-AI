/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Gift, 
  Award, 
  Clock, 
  Zap, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  ChevronRight, 
  Heart, 
  HelpCircle, 
  Lock, 
  Unlock, 
  Calendar,
  AlertCircle,
  Copy,
  Plus
} from 'lucide-react';
import { User, ScutCreditsTransaction } from '../types';
import { 
  getUserCredits, 
  listenToCreditTransactions, 
  earnCredits, 
  spendCredits, 
  DEFAULT_CREDIT_RULES,
  ACHIEVEMENTS
} from '../lib/credits';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

interface ScutCreditsPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => void;
}

export default function ScutCreditsPage({ user, onNavigate, onAddLog }: ScutCreditsPageProps) {
  const [balance, setBalance] = useState<number>(100);
  const [transactions, setTransactions] = useState<ScutCreditsTransaction[]>([]);
  const [referralCodeInput, setReferralCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'earn' | 'spend'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [activeAchievements, setActiveAchievements] = useState(ACHIEVEMENTS);

  // Load and subscribe to updates
  useEffect(() => {
    if (!user || !auth.currentUser) {
      // Offline / unregistered user defaults
      const savedBalance = localStorage.getItem('local_scut_credits');
      setBalance(savedBalance ? parseInt(savedBalance) : 100);
      
      const savedTxs = localStorage.getItem('local_scut_credit_txs');
      if (savedTxs) {
        setTransactions(JSON.parse(savedTxs));
      } else {
        const defaultTxs: ScutCreditsTransaction[] = [
          {
            id: 'tx-init',
            amount: 100,
            type: 'earn_community',
            description: 'Welcome reward for initializing SCUT platform workspace',
            timestamp: new Date().toLocaleString()
          }
        ];
        setTransactions(defaultTxs);
        localStorage.setItem('local_scut_credit_txs', JSON.stringify(defaultTxs));
      }
      return;
    }

    // Check last daily check-in
    const lastCheckIn = localStorage.getItem(`scut_daily_checkin_${auth.currentUser.uid}`);
    if (lastCheckIn) {
      const lastDate = new Date(lastCheckIn);
      const today = new Date();
      if (lastDate.toDateString() === today.toDateString()) {
        setDailyClaimed(true);
      }
    }

    // Subscribe to balance
    getUserCredits(auth.currentUser.uid).then(setBalance);

    // Subscribe to transaction ledger
    const unsub = listenToCreditTransactions(auth.currentUser.uid, (txs) => {
      setTransactions(txs);
      
      // Compute dynamic quest progress based on transaction logs
      const chatTxs = txs.filter(t => t.type === 'earn_ai' || t.description.includes('chat')).length;
      const imgTxs = txs.filter(t => t.description.includes('image') || t.description.includes('synthesis')).length;
      const communityTxs = txs.filter(t => t.type === 'earn_community' || t.type === 'spend_micabucurie').length;
      const securityTxs = txs.some(t => t.description.includes('panic') || t.description.includes('phrase') || t.description.includes('keyword'));

      setActiveAchievements(prev => prev.map(ach => {
        let progress = ach.progress;
        if (ach.id === 'ach-1') progress = chatTxs >= 1 ? 1 : 0;
        if (ach.id === 'ach-2') progress = Math.min(ach.max, imgTxs);
        if (ach.id === 'ach-3') progress = Math.min(ach.max, communityTxs);
        if (ach.id === 'ach-4') progress = securityTxs ? 1 : 0;
        
        return { ...ach, progress };
      }));
    });

    return () => unsub();
  }, [user]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Safe adjust function for both online/offline
  const triggerBalanceAdjustment = async (amount: number, type: ScutCreditsTransaction['type'], desc: string) => {
    if (!user || !auth.currentUser) {
      // Offline fallback storage
      const newBal = Math.max(0, balance + amount);
      setBalance(newBal);
      localStorage.setItem('local_scut_credits', String(newBal));

      const newTx: ScutCreditsTransaction = {
        id: 'tx-local-' + Math.random().toString(36).substring(2, 9),
        amount,
        type,
        description: desc,
        timestamp: new Date().toLocaleString()
      };
      const updatedTxs = [newTx, ...transactions];
      setTransactions(updatedTxs);
      localStorage.setItem('local_scut_credit_txs', JSON.stringify(updatedTxs));
      onAddLog('Local SVC Ledger Modified', `${amount > 0 ? '+' : ''}${amount} SVC: ${desc}`, amount > 0 ? 'billing' : 'security');
      return true;
    }

    try {
      if (amount < 0 && balance < Math.abs(amount)) {
        showNotification("Insufficient SCUT Credits for this platform purchase!");
        return false;
      }
      const finalBal = await earnCredits(auth.currentUser.uid, amount, type, desc);
      setBalance(finalBal);
      onAddLog('SVC Wallet Adjustment', `${amount > 0 ? '+' : ''}${amount} SCUT Credits processed`, 'billing');
      return true;
    } catch (err) {
      showNotification("Failed to update virtual ledger secure state.");
      return false;
    }
  };

  // Daily Check-In
  const handleDailyCheckIn = async () => {
    if (dailyClaimed) {
      showNotification("🔒 You have already claimed today's daily credits. Return tomorrow!");
      return;
    }
    setClaimingDaily(true);
    
    setTimeout(async () => {
      const succ = await triggerBalanceAdjustment(20, 'earn_community', 'Daily platform wellness check-in');
      if (succ) {
        setDailyClaimed(true);
        if (auth.currentUser) {
          localStorage.setItem(`scut_daily_checkin_${auth.currentUser.uid}`, new Date().toISOString());
        }
        showNotification("🎉 +20 SCUT Credits added securely to your virtual wallet!");
      }
      setClaimingDaily(false);
    }, 1200);
  };

  // Referral Submit
  const handleReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = referralCodeInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode.length < 5) {
      showNotification("Invalid code structure. Must be at least 5 alphanumeric characters.");
      return;
    }

    // Check if code was already used
    const usedCodeKey = `scut_ref_used_${cleanCode}_${auth.currentUser?.uid || 'local'}`;
    if (localStorage.getItem(usedCodeKey)) {
      showNotification("⚠️ You have already redeemed this referral code.");
      return;
    }

    const succ = await triggerBalanceAdjustment(50, 'earn_referral', `Redeemed network referral code: ${cleanCode}`);
    if (succ) {
      localStorage.setItem(usedCodeKey, 'true');
      setReferralCodeInput('');
      showNotification(`🎁 Success! +50 SCUT Credits claimed from referral link.`);
    }
  };

  // Spend Option Click
  const handlePurchaseOption = async (option: { title: string; cost: number; tag: string; action: () => void }) => {
    if (balance < option.cost) {
      showNotification(`Insufficient balance. You need ${option.cost} SVC, but currently have ${balance} SVC.`);
      return;
    }

    const confirmPurchase = window.confirm(`Spend ${option.cost} SVC for ${option.title}?`);
    if (!confirmPurchase) return;

    const desc = `Redeemed ${option.title} (${option.tag})`;
    const success = await triggerBalanceAdjustment(-option.cost, 'spend_ai', desc);
    if (success) {
      option.action();
    }
  };

  // Claim Achievement reward manually
  const claimQuestReward = async (achId: string, title: string, amount: number) => {
    const claimKey = `scut_quest_claimed_${achId}_${auth.currentUser?.uid || 'local'}`;
    if (localStorage.getItem(claimKey)) {
      showNotification("Reward already claimed for this milestone!");
      return;
    }

    const success = await triggerBalanceAdjustment(amount, 'earn_achievement', `Claimed milestone reward: ${title}`);
    if (success) {
      localStorage.setItem(claimKey, 'true');
      showNotification(`🏆 Milestone claimed! +${amount} SCUT Credits added.`);
    }
  };

  // Mock Invite Referral Code Generator
  const myReferralCode = auth.currentUser 
    ? `SCUT-${auth.currentUser.uid.substring(0, 5).toUpperCase()}-99` 
    : "SCUT-GUEST-77";

  // Filtered transactions
  const filteredTxs = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'earn') return tx.amount > 0;
    if (activeTab === 'spend') return tx.amount < 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-20 relative overflow-hidden">
      
      {/* Visual cyber backgrounds */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Header section with brand context */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                Ecosystem Utility
              </span>
              <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded">
                Non-Blockchain
              </span>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
              SCUT <span className="text-cyan-400">Virtual Rewards Wallet</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-light leading-relaxed">
              Earn internal platform credits by utilizing SCUT AI intelligence services, assisting peer networks in Mica Bucurie, and contributing to decentralized developer workflows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              Use SCUT AI
            </button>
            <button
              onClick={() => onNavigate('micabucurie')}
              className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              Mica Bucurie
            </button>
          </div>
        </div>

        {/* Top Wallet & Quick Actions Panel */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Glowing Credits Card Vault */}
          <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/20 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase text-cyan-400 block font-semibold">Ledger Balance</span>
                    <span className="text-[9px] font-mono text-slate-500">Virtual Reward Account</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-slate-300">SVC</span>
                </div>
              </div>

              <div className="py-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight font-display bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent">
                    {balance}
                  </span>
                  <span className="text-xs text-cyan-400 font-mono font-semibold">SVC</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-500 shrink-0" />
                  Estimated utility: ${(balance * 0.05).toFixed(2)} platform credits
                </p>
              </div>
            </div>

            <div className="border-t border-slate-800/80 pt-4 mt-4 space-y-3">
              <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-400 space-y-1.5 leading-relaxed">
                <div className="flex items-center gap-1 font-semibold text-cyan-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  Ecosystem Separation Warning
                </div>
                <p className="text-[9px]">
                  SCUT Credits (SVC) are non-speculative, strictly local platform rewards. They are independent of ERC-20 blockchain assets and carry no gas dependencies.
                </p>
              </div>
            </div>
          </div>

          {/* Daily Reward & Referral Claims */}
          <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
            
            {/* Daily Wellness Check-In Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">Daily Check-In Vault</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  Claim your daily loyalty rewards. Each 24-hour cycle allows you to inject +20 SVC into your secure wallet container.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-slate-400">Daily Bonus:</span>
                  <span className="text-sm font-bold font-mono text-white block">+20 SVC</span>
                </div>

                <button
                  onClick={handleDailyCheckIn}
                  disabled={claimingDaily || dailyClaimed}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dailyClaimed 
                      ? "bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed" 
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/10"
                  }`}
                >
                  {claimingDaily ? (
                    <span className="animate-pulse">Sinking transaction...</span>
                  ) : dailyClaimed ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Claimed Today
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4" />
                      Claim +20 Credits
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Redeem Referrals Box */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-mono">Referral Gateway</h3>
                </div>
                
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[9px] text-slate-500 block uppercase font-mono">My invite code</span>
                    <span className="text-xs font-mono font-bold text-slate-200">{myReferralCode}</span>
                  </div>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(myReferralCode);
                      showNotification("Referral invite code copied to clipboard!");
                    }}
                    className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    title="Copy Code"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleReferralCode} className="mt-4 pt-4 border-t border-slate-800/50 flex gap-2">
                <input 
                  type="text" 
                  value={referralCodeInput}
                  onChange={(e) => setReferralCodeInput(e.target.value)}
                  placeholder="Enter colleague invite code..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                />
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-500/10 cursor-pointer shrink-0"
                >
                  Redeem
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Tabs navigation for details panels */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* LEFT: Quests & Achievements checklist (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Award className="h-4 w-4 text-cyan-400" />
              <h2 className="font-display text-lg font-bold">Reward Milestones</h2>
            </div>

            <div className="space-y-4">
              {activeAchievements.map((ach) => {
                const isClaimed = !!localStorage.getItem(`scut_quest_claimed_${ach.id}_${auth.currentUser?.uid || 'local'}`);
                const isComplete = ach.progress >= ach.max;
                
                return (
                  <div 
                    key={ach.id}
                    className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 space-y-3 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{ach.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{ach.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
                        +{ach.reward} SVC
                      </span>
                    </div>

                    {/* Progress slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-slate-400">
                        <span>Progress</span>
                        <span>{ach.progress} / {ach.max}</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(ach.progress / ach.max) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {isClaimed ? (
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-slate-500" />
                          Claimed & Synced
                        </span>
                      ) : isComplete ? (
                        <button
                          onClick={() => claimQuestReward(ach.id, ach.title, ach.reward)}
                          className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[10px] rounded-lg cursor-pointer transition-all"
                        >
                          Claim Reward
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5" />
                          In Progress
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MIDDLE: Spending Store options (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Gift className="h-4 w-4 text-rose-400" />
              <h2 className="font-display text-lg font-bold">SVC Spend Portal</h2>
            </div>

            <div className="space-y-4">
              
              {/* Unlock Gemini Pro Pass */}
              <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[130px] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Premium AI Features</span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1.5">SCUT AI 1-Hour Pro Pass</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Unlocks premium Gemini 2.5 Pro processing tier</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 shrink-0">
                    100 SVC
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] text-slate-400">Immediate direct activation</span>
                  <button
                    onClick={() => handlePurchaseOption({
                      title: "1-Hour Gemini Pro Pass",
                      cost: 100,
                      tag: "AI PASS",
                      action: () => {
                        showNotification("🚀 Gemini 2.5 Pro reasoning has been unlocked for 1 hour!");
                      }
                    })}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 font-bold text-[10px] transition-all cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Marketplace Discount Code */}
              <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[130px] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-rose-500/10 border border-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Store Discount</span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1.5">Marketplace 15% Coupon</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Valid for templates or physical products</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 shrink-0">
                    150 SVC
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] text-slate-400">Delivered to secure inbox</span>
                  <button
                    onClick={() => handlePurchaseOption({
                      title: "Marketplace 15% Coupon Code",
                      cost: 150,
                      tag: "COUPON",
                      action: () => {
                        alert("🎉 Code acquired: SCUT-LOYALTY-15. Input this at Checkout to redeem your 15% discount!");
                      }
                    })}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 font-bold text-[10px] transition-all cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

              {/* Support Mica Bucurie */}
              <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-4 flex flex-col justify-between h-[130px] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">Charitable donation</span>
                    <h4 className="text-xs font-bold text-slate-200 mt-1.5">Mica Bucurie Donation</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Support volunteer crisis responders</p>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 shrink-0">
                    50 SVC
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[9px] text-slate-400">Awarded "Joy Donor" badge</span>
                  <button
                    onClick={() => handlePurchaseOption({
                      title: "Mica Bucurie safe space contribution",
                      cost: 50,
                      tag: "DONATE",
                      action: () => {
                        showNotification("❤️ Thank you for your kindness! You have earned the Mica Joy Supporter digital badge.");
                      }
                    })}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 font-bold text-[10px] transition-all cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT: Transaction History Ledger (1 column) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h2 className="font-display text-lg font-bold">Ledger History</h2>
              </div>

              <div className="flex gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-2 py-1 text-[8px] font-mono font-bold rounded-md cursor-pointer transition-all ${activeTab === 'all' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                >
                  ALL
                </button>
                <button 
                  onClick={() => setActiveTab('earn')}
                  className={`px-2 py-1 text-[8px] font-mono font-bold rounded-md cursor-pointer transition-all ${activeTab === 'earn' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                >
                  EARNS
                </button>
                <button 
                  onClick={() => setActiveTab('spend')}
                  className={`px-2 py-1 text-[8px] font-mono font-bold rounded-md cursor-pointer transition-all ${activeTab === 'spend' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}
                >
                  SPENDS
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredTxs.length === 0 ? (
                <div className="text-center py-12 border border-slate-900 bg-slate-900/10 rounded-2xl">
                  <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No matching credit transfers logged.</p>
                </div>
              ) : (
                filteredTxs.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex justify-between items-center p-3 bg-slate-900/20 border border-slate-900/80 rounded-xl hover:border-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        tx.amount > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {tx.amount > 0 ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs text-slate-200 font-semibold truncate block">{tx.description}</span>
                        <span className="text-[8px] text-slate-500 font-mono">{tx.timestamp}</span>
                      </div>
                    </div>
                    <span className={`text-xs font-mono font-bold ml-2 shrink-0 ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount} SVC
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Future Expansion & Token Economy FAQ Section */}
        <div className="border border-slate-900 bg-slate-900/20 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <h3 className="font-display text-sm font-bold tracking-wide uppercase font-mono">SCUT Rewards FAQ & System Rules</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-xs text-slate-400">
            <div className="space-y-2">
              <h5 className="font-bold text-slate-200">How do I accumulate SCUT Credits?</h5>
              <p className="font-light leading-relaxed">
                By conducting active AI queries, compiling complex code snippets, generating graphics through the Gemini API, or engaging in community channels such as Mica Bucurie or SCUT Chat.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-200">How is this different from the SCUT Token?</h5>
              <p className="font-light leading-relaxed">
                The SCUT Token is a decentralized ERC-20 on the Polygon mainnet with real gas costs and trading capabilities. SCUT Credits (SVC) are non-speculative, fully local rewards with zero blockchain overhead.
              </p>
            </div>
            <div className="space-y-2">
              <h5 className="font-bold text-slate-200">What are future expansion plans?</h5>
              <p className="font-light leading-relaxed">
                Future modules will enable dynamic API credit synchronization, allowing enterprise customers to convert credits directly into custom prompt packages and dedicated VM hosting pools.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Global Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
