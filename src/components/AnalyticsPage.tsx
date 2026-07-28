/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Cpu, Activity, Clock, Sliders, ChevronDown, RefreshCw, ArrowRight, Wallet, PieChart as PieIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AnalyticsPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

const HOURLY_QUERY_DATA = [
  { time: '00:00', queries: 400, latency: 120 },
  { time: '04:00', queries: 250, latency: 95 },
  { time: '08:00', queries: 800, latency: 160 },
  { time: '12:00', queries: 1200, latency: 210 },
  { time: '16:00', queries: 950, latency: 180 },
  { time: '20:00', queries: 700, latency: 145 },
  { time: '24:00', queries: 500, latency: 110 }
];

const MODEL_USAGE_DATA = [
  { name: 'Gemini 2.5 Flash', value: 65, color: '#22d3ee' },
  { name: 'Gemini 2.5 Pro', value: 20, color: '#a855f7' },
  { name: 'Imagen 3 Visual', value: 10, color: '#10b981' },
  { name: 'Audio/TTS Synthesis', value: 5, color: '#f59e0b' }
];

const CREDIT_LOGS_DATA = [
  { date: 'Jul 12', earned: 30, consumed: 15 },
  { date: 'Jul 13', earned: 20, consumed: 25 },
  { date: 'Jul 14', earned: 50, consumed: 10 },
  { date: 'Jul 15', earned: 15, consumed: 40 },
  { date: 'Jul 16', earned: 45, consumed: 20 },
  { date: 'Jul 17', earned: 60, consumed: 15 },
  { date: 'Jul 18', earned: 25, consumed: 35 }
];

export default function AnalyticsPage({ user, onNavigate, onAddLog }: AnalyticsPageProps) {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1200);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Diagnostics Hub</span>
          </div>
          <h1 className="text-3xl font-bold font-display">System Analytics</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Live telemetry dashboard tracking model processing volumes, response latencies, credits cache ratios, and compute overheads.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
          
          <button 
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Back to Chat Workspace
          </button>
        </div>
      </div>

      {/* Grid of four key-performance indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Total processing requests */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Bearer Dispatches</span>
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Cpu className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display">12,482</span>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-semibold mt-1">
              <span>+14.2%</span>
              <span className="text-slate-500 font-normal">vs previous day</span>
            </div>
          </div>
        </div>

        {/* Latency averages */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Average Latency</span>
            <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display">142ms</span>
            <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-semibold mt-1">
              <span>-12.4%</span>
              <span className="text-slate-500 font-normal">response speedup</span>
            </div>
          </div>
        </div>

        {/* Compute Reliability */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">SLA Delivery</span>
            <div className="p-1.5 bg-green-500/10 rounded-lg text-green-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display">99.99%</span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mt-1">
              <span>0 active packet errors</span>
            </div>
          </div>
        </div>

        {/* Dynamic Credit Pool */}
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full filter blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">SCUT credit cache</span>
            <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold font-display">{user?.scutCredits !== undefined ? user.scutCredits : 100}</span>
            <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 font-semibold mt-1">
              <span>Tier: {user?.subscriptionTier || 'free'}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main telemetry charts (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Query Load vs Processing Latency Area Chart */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300">Live Traffic Load</h3>
                <p className="text-[10px] text-slate-500 font-light">Hourly dispatches and telemetry response delay.</p>
              </div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={HOURLY_QUERY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="queriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 10 }} />
                  <Area type="monotone" dataKey="queries" stroke="#22d3ee" fillOpacity={1} fill="url(#queriesGrad)" strokeWidth={2} name="Dispatches" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Credit earning vs consumption Bar Chart */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300">Wallet Logs Metrics</h3>
              <p className="text-[10px] text-slate-500 font-light">Earning campaigns vs compute consumption ledger.</p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CREDIT_LOGS_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={9} />
                  <YAxis stroke="#64748b" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 10 }} />
                  <Bar dataKey="earned" fill="#10b981" radius={[4, 4, 0, 0]} name="Earned Credits" />
                  <Bar dataKey="consumed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Consumed Credits" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right breakdown and geographical loads (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Models Ratio Pie chart */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-cyan-400" /> Model Share
            </h3>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MODEL_USAGE_DATA}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {MODEL_USAGE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#1e293b', fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legends list */}
            <ul className="space-y-1.5 text-[10px]">
              {MODEL_USAGE_DATA.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-400 font-light">{item.name}</span>
                  </div>
                  <span className="font-bold text-white">{item.value}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Geographical telemetry node dispatches */}
          <div className="bg-slate-950 border border-slate-900 p-5 rounded-2xl space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-green-400" /> Telemetry Nodes
            </h3>
            
            <div className="space-y-3 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node EU-WEST (London)</span>
                <span className="text-green-400 font-mono font-bold">12ms • ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node US-EAST (N. Virginia)</span>
                <span className="text-green-400 font-mono font-bold">42ms • ACTIVE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Node APAC-SOUTH (Singapore)</span>
                <span className="text-green-400 font-mono font-bold">78ms • ACTIVE</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
