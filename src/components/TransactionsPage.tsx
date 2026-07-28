/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, ArrowDownLeft, Search, Filter, Download, 
  ExternalLink, Coins, Calendar, Tag, Layers, CheckCircle, Clock
} from 'lucide-react';

interface TransactionsPageProps {
  user: any;
  onNavigate: (page: string) => void;
}

export default function TransactionsPage({ user, onNavigate }: TransactionsPageProps) {
  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    { id: 'tx-001', type: 'in', title: 'Ecosystem Grant', desc: 'Received SCUT Core Incentive Reward', amount: '+1,500 POL', date: '2026-07-18', status: 'completed', hash: '0x8f2a...c5e2' },
    { id: 'tx-002', type: 'out', title: 'Adapter Fine-tuning', desc: 'SCUT Omni Fine-Tuning Pipeline charge', amount: '-45.00 POL', date: '2026-07-16', status: 'completed', hash: '0x12d5...f7e1' },
    { id: 'tx-003', type: 'in', title: 'Credits Purchase', desc: 'Converted 500 Credits to POL tokens', amount: '+500 POL', date: '2026-07-14', status: 'completed', hash: '0x94b3...12fa' },
    { id: 'tx-004', type: 'out', title: 'Marketplace Asset', desc: 'Purchased Document Classifier fine-tune', amount: '-15.00 POL', date: '2026-07-12', status: 'completed', hash: '0x32c4...78e9' },
    { id: 'tx-005', type: 'out', title: 'Workspace Node Transfer', desc: 'Transferred gas to @alex_scutdev', amount: '-120.00 POL', date: '2026-07-10', status: 'completed', hash: '0xaa1e...90bb' },
    { id: 'tx-006', type: 'in', title: 'Affiliate Share', desc: 'Shared link template payout', amount: '+35.50 POL', date: '2026-07-08', status: 'completed', hash: '0x7e88...2d34' },
  ];

  const filteredTxs = transactions.filter(tx => {
    const matchesFilter = filterType === 'all' || tx.type === filterType;
    const matchesSearch = tx.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded">Financial Audit</span>
            <span className="text-[10px] font-mono text-slate-500">Live Polygon Nodes Synced</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Layers className="h-8 w-8 text-indigo-400" />
            Transaction History
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Browse and export all incoming grants, node transfers, and custom smart contract payments on the SCUT ecosystem.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setFilterType('all')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'all' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              All Transactions
            </button>
            <button 
              onClick={() => setFilterType('in')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'in' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              Inflow
            </button>
            <button 
              onClick={() => setFilterType('out')}
              className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterType === 'out' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/10' : 'text-slate-400 hover:text-white'}`}
            >
              Outflow
            </button>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-850 hover:border-indigo-500/30 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-950/40 text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">ID & Type</th>
                  <th className="py-4 px-6">Transaction</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Gas Hash</th>
                  <th className="py-4 px-6 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-900/60 font-light">
                {filteredTxs.length > 0 ? (
                  filteredTxs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className={`p-2 rounded-xl border ${
                          tx.type === 'in' 
                            ? 'bg-emerald-500/5 border-emerald-500/15 text-emerald-400' 
                            : 'bg-indigo-500/5 border-indigo-500/15 text-indigo-400'
                        }`}>
                          {tx.type === 'in' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 uppercase">{tx.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-200">{tx.title}</div>
                        <div className="text-[10px] text-slate-500 font-light">{tx.desc}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-400">
                        {tx.date}
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px] text-slate-400">
                        <a href={`https://polygonscan.com/tx/${tx.hash}`} target="_blank" rel="noreferrer" className="hover:text-indigo-400 flex items-center gap-1">
                          {tx.hash}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className={`py-4 px-6 text-right font-bold text-sm ${tx.type === 'in' ? 'text-emerald-400' : 'text-slate-300'}`}>
                        {tx.amount}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-slate-500 font-light">
                      No matching transations found on active subnet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
