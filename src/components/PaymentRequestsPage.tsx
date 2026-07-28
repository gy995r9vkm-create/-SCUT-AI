/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Check, Copy, Trash2, ArrowUpRight, Coins, ShieldCheck, 
  Link as LinkIcon, Smartphone, CreditCard, Send
} from 'lucide-react';

interface PaymentRequestsPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, desc: string, category: 'security' | 'billing' | 'api' | 'chat') => void;
}

export default function PaymentRequestsPage({ user, onNavigate, onAddLog }: PaymentRequestsPageProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('POL');
  const [description, setDescription] = useState('');
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const [requests, setRequests] = useState([
    { id: 'req-201', recipient: '@digital_nodes', amount: '150.00 POL', desc: 'SaaS fine-tuning adapter licensing', date: '2026-07-18', status: 'pending', url: 'https://scut.pay/pay/req-201' },
    { id: 'req-202', recipient: '@alpha_studio', amount: '500.00 CREDITS', desc: 'Workspace workspace allocation', date: '2026-07-16', status: 'paid', url: 'https://scut.pay/pay/req-202' },
    { id: 'req-203', recipient: '@romanian_scut', amount: '20.00 SCUT', desc: 'Mica Bucurie charity auction fee', date: '2026-07-15', status: 'expired', url: 'https://scut.pay/pay/req-203' }
  ]);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !amount) return;

    const newId = `req-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest = {
      id: newId,
      recipient,
      amount: `${amount} ${currency}`,
      desc: description || 'SCUT Core Transaction request',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      url: `https://scut.pay/pay/${newId}`
    };

    setRequests([newRequest, ...requests]);
    onAddLog('Created Payment Request', `Request ${newId} of ${amount} ${currency} to ${recipient}`, 'billing');
    
    // reset form
    setRecipient('');
    setAmount('');
    setDescription('');
  };

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const handleDelete = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-purple-400 bg-purple-500/10 border border-purple-500/15 px-1.5 py-0.5 rounded">Invoicing Module</span>
            <span className="text-[10px] font-mono text-slate-500">Auto-Escrow Enabled</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <CreditCard className="h-8 w-8 text-purple-400" />
            Payment Requests
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Create decentralized invoices, share instantaneous payment links, and monitor active customer billing.
          </p>
        </div>

        {/* WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Create Request form */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-purple-400" /> Generate New Invoice Link
              </h2>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Recipient Username or Wallet</label>
                  <input 
                    type="text"
                    required
                    placeholder="@digital_nodes or 0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-purple-400 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Amount</label>
                    <input 
                      type="number"
                      required
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-purple-400 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Asset</label>
                    <select 
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-purple-400 text-xs text-white focus:outline-none"
                    >
                      <option value="POL">POL</option>
                      <option value="SCUT">SCUT</option>
                      <option value="CREDITS">Credits</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Description / Reference</label>
                  <textarea 
                    placeholder="Describe service details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-purple-400 text-xs text-white placeholder-slate-600 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-display font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/10"
                >
                  <Send className="h-3.5 w-3.5" />
                  Generate Payment Request
                </button>
              </form>
            </div>
          </div>

          {/* List of Requests */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-purple-400" /> Active Billing & Escrows
            </h2>

            <div className="space-y-3">
              {requests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900/80 hover:border-slate-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-500 uppercase">{req.id}</span>
                      <span className="font-bold text-xs text-white">{req.recipient}</span>
                      <span className={`text-[8px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        req.status === 'paid' 
                          ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400' 
                          : req.status === 'pending'
                          ? 'bg-amber-500/10 border-amber-500/15 text-amber-400'
                          : 'bg-red-500/10 border-red-500/15 text-red-400'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-light">{req.desc}</div>
                    <div className="text-[9px] text-slate-500 font-mono">Issued on: {req.date}</div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 pt-2 sm:pt-0 border-slate-900">
                    <span className="font-mono text-sm font-bold text-slate-200">{req.amount}</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => handleCopy(req.id, req.url)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:border-purple-500/30 text-slate-400 hover:text-white transition-all"
                        title="Copy Request URL"
                      >
                        {isCopied === req.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <LinkIcon className="h-3.5 w-3.5" />}
                      </button>
                      <button 
                        onClick={() => handleDelete(req.id)}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all"
                        title="Delete Invoice"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
