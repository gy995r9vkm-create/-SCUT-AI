/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, 
  Settings, Key, Layers, Globe, Mail, Landmark, PieChart, Users, CheckSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MerchantDashboardPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, desc: string, category: 'security' | 'billing' | 'api' | 'chat') => void;
}

export default function MerchantDashboardPage({ user, onNavigate, onAddLog }: MerchantDashboardPageProps) {
  const volumeData = [
    { month: 'Jan', volume: 12000, txCount: 140 },
    { month: 'Feb', volume: 18500, txCount: 210 },
    { month: 'Mar', volume: 24000, txCount: 310 },
    { month: 'Apr', volume: 38000, txCount: 460 },
    { month: 'May', volume: 55000, txCount: 680 },
    { month: 'Jun', volume: 84000, txCount: 940 },
    { month: 'Jul', volume: 112000, txCount: 1210 },
  ];

  const stats = [
    { label: "Net Volume Processed", value: "$112,000", change: "+42%", icon: DollarSign, color: "text-emerald-400" },
    { label: "Active Webhooks", value: "3 Endpoints", change: "Healthy", icon: Key, color: "text-cyan-400" },
    { label: "Merchant Account", value: "Active SLA", change: "Guaranteed", icon: ShieldCheck, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/25 px-1.5 py-0.5 rounded">Merchant Operations</span>
            <span className="text-[10px] font-mono text-slate-500">API Version: v2.4</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Briefcase className="h-8 w-8 text-indigo-400" />
            Merchant Dashboard
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Track business transaction throughput, monitor API checkouts, configure payouts, and manage on-chain corporate invoices.
          </p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono font-bold uppercase text-slate-400">{stat.label}</span>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-white">{stat.value}</h3>
                  <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{stat.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHART & DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Processing Volume History</h3>
              <span className="text-[10px] font-mono text-slate-500">POL & USD Value Linked</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: 11 }} />
                  <Area type="monotone" dataKey="volume" stroke="#6366f1" fillOpacity={1} fill="url(#colorVolume)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-4">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Webhook Settings</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Payout Destination</span>
                <input 
                  type="text" 
                  disabled 
                  value="scut-merchant-wallet-main"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-400 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono uppercase text-slate-500 block">Endpoint Webhook URL</span>
                <input 
                  type="text" 
                  placeholder="https://yourdomain.com/webhooks"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white"
                />
              </div>
              <button 
                onClick={() => onAddLog('Merchant Configuration Updated', 'Webhook target destination saved', 'security')}
                className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-display font-bold text-xs uppercase tracking-wider transition-all"
              >
                Save Integration
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
