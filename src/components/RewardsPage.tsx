/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Award, Zap, CheckCircle, RefreshCw, Star, ArrowUpRight } from 'lucide-react';

interface RewardsPageProps {
  onNavigate: (page: string) => void;
}

export default function RewardsPage({ onNavigate }: RewardsPageProps) {
  const challenges = [
    { title: 'API Key Generation', desc: 'Activate 1 custom API endpoint', reward: '100 CREDITS', progress: 100, completed: true },
    { title: 'Smart Contract Transfer', desc: 'Initiate a transaction transfer via SCUT Wallet', reward: '250 CREDITS', progress: 100, completed: true },
    { title: 'Adapter Fine-Tuning', desc: 'Train any custom core adapter model', reward: '500 CREDITS', progress: 40, completed: false }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded">Ecosystem Perks</span>
            <span className="text-[10px] font-mono text-slate-500">Tier: Elite Contributor</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Award className="h-8 w-8 text-amber-400" />
            Platform Rewards
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Complete active development quests, spin up validator nodes, and redeem free compute credits.
          </p>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-amber-400 font-bold block">Available Balance</span>
              <h3 className="text-2xl font-extrabold text-white">4,850 CREDITS</h3>
            </div>
            <Zap className="h-10 w-10 text-amber-400 animate-pulse" />
          </div>

          <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[9px] font-mono uppercase text-indigo-400 font-bold block">Lifetime Earned</span>
              <h3 className="text-2xl font-extrabold text-white">12,500 CREDITS</h3>
            </div>
            <Star className="h-10 w-10 text-indigo-400" />
          </div>
        </div>

        {/* QUESTS LIST */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Core Developer Challenges</h2>
          <div className="space-y-4">
            {challenges.map((quest, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-slate-200">{quest.title}</h3>
                    {quest.completed && (
                      <span className="text-[8px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <CheckCircle className="h-2.5 w-2.5" /> Claimed
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-light">{quest.desc}</p>
                  
                  {/* Progress bar */}
                  <div className="w-full sm:w-48 pt-1 flex items-center gap-2">
                    <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${quest.progress}%` }} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{quest.progress}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-900">
                  <span className="font-mono text-xs font-bold text-amber-400">{quest.reward}</span>
                  <button 
                    disabled={!quest.completed}
                    className="px-4 py-1.5 rounded-xl text-[10px] font-bold font-display uppercase tracking-wider disabled:bg-slate-950 disabled:text-slate-600 bg-amber-400 text-slate-950 hover:bg-amber-300 transition-all cursor-pointer"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
