/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LifeBuoy, Search, Mail, MessageSquare, ShieldAlert, CheckCircle, Clock, Send, ChevronDown, RefreshCw, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface SupportCenterPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'resolved' | 'pending';
  createdAt: string;
}

const FAQ_KNOWLEDGE_BASE = [
  {
    q: 'How do I generate API keys?',
    a: 'Navigate to the API Keys tab in your dashboard, click "Mint Key", describe the key purpose, and copy the bearer token instantly.'
  },
  {
    q: 'What is the SCUT virtual credit currency?',
    a: 'Credits fuel our high-concurrency model synthesis. You can earn credits automatically by talking to the co-pilot or participating in network campaigns.'
  },
  {
    q: 'How does the Sandbox mode bypass work?',
    a: 'For developer workspace iterations, the sandbox bypass generates a secure offline session that accesses mocks so you can test navigation before configuring Google Cloud consoles.'
  }
];

export default function SupportCenterPage({ user, onNavigate, onAddLog }: SupportCenterPageProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('billing');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: 't-104', subject: 'Invoice #1092 Verification', category: 'billing', status: 'resolved', createdAt: '7/15/2026' },
    { id: 't-105', subject: 'API Latency Telemetry EU-WEST', category: 'technical', status: 'open', createdAt: '7/18/2026' }
  ]);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setIsSubmitting(true);

    setTimeout(async () => {
      const newTicket: SupportTicket = {
        id: 't-' + Math.floor(Math.random() * 1000),
        subject: subject.trim(),
        category,
        status: 'open',
        createdAt: new Date().toLocaleDateString()
      };

      setTickets([newTicket, ...tickets]);
      setIsSubmitting(false);
      setSubject('');
      setMessage('');
      await onAddLog('Created Support Ticket', `Ticket Subject: "${newTicket.subject}"`, 'security');
    }, 1500);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <LifeBuoy className="h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold">Helpdesk Core</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Support Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Get technical assistance and documentation resources for SCUT AI workloads. Open SLA tickets and track resolution status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Back to Chat Workspace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Ticket Creation Form & My Tickets (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Support Ticket Submission Form */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300 border-b border-slate-900 pb-3">Open Support Ticket</h2>
            
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ticket Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="billing">Billing & Subscription</option>
                    <option value="technical">Technical Model Latency</option>
                    <option value="api">API Keys & Endpoints</option>
                    <option value="security">Authentication & Privacy</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Short Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of the query..."
                    className="w-full bg-slate-900 border border-slate-850 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-600"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Detailed Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain your problem, adding any stack traces or request identifiers..."
                  className="w-full bg-slate-900 border border-slate-850 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-600 h-28 leading-relaxed resize-none"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !subject.trim() || !message.trim()}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Filing ticket...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit SLA Ticket</span>
                      <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Ticket Listing rows */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300">My Support Tickets</h2>
            
            <div className="space-y-2">
              {tickets.map(tk => (
                <div key={tk.id} className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 font-mono">ID: {tk.id}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850 text-[8px] uppercase font-bold text-slate-400">{tk.category}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-200 truncate">{tk.subject}</p>
                    <span className="text-[9px] text-slate-500 block">{tk.createdAt}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                    tk.status === 'resolved' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : tk.status === 'pending' 
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {tk.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Help accordion / Quick Contacts (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick FAQ / Knowledge base */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300 border-b border-slate-900 pb-3">Knowledge Base</h2>
            
            <div className="space-y-2">
              {FAQ_KNOWLEDGE_BASE.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-900 pb-2.5">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-all ${activeFaq === idx ? 'rotate-180' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-[11px] text-slate-400 mt-1 font-light leading-relaxed"
                    >
                      {faq.a}
                    </motion.p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Global contacts info */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300">Support Contacts</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              We provide guaranteed SLAs for enterprise and business account tiers. Contact our telemetry coordinators.
            </p>

            <div className="space-y-2.5 text-[11px]">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-400">Security / GRC:</span>
                <span className="font-mono text-white">grc@scut.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-400">Technical Ops:</span>
                <span className="font-mono text-white">noc@scut.ai</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
