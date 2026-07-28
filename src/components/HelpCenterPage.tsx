/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  HelpCircle, Search, MessageSquare, LifeBuoy, FileText, 
  ArrowRight, ShieldCheck, Mail, CheckCircle, RefreshCw
} from 'lucide-react';

interface HelpCenterPageProps {
  onNavigate: (page: string) => void;
}

export default function HelpCenterPage({ onNavigate }: HelpCenterPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const faqs = [
    { q: 'What is the difference between Credits and SCUT Tokens?', a: 'SCUT Credits are stable computational units purchased directly via Stripe or earned via platform contributions, used to execute AI queries. SCUT Tokens are governance assets tied to platform liquidity pools, allowing stakeholders to participate in design votes.' },
    { q: 'Are my prompt queries stored or logged?', a: 'By default, we enforce a zero-logging policy. Conversations processed via our Express server bypass training loops entirely and are not stored unless you explicitly bookmark them into a folder.' },
    { q: 'How do I claim developer API access?', a: 'Simply navigate to the "Developers" tab in the main header and mint an API key inside the API manager. Developer accounts require a verified phone or active email node.' },
    { q: 'Does SCUT support offline local compilation?', a: 'Our front-end React package utilizes local states, but core multi-agent models require a connection to our low-latency backend proxy servers.' }
  ];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketDesc) return;
    
    setIsSubmitting(true);
    setTicketSuccess(false);

    setTimeout(() => {
      setIsSubmitting(false);
      setTicketSuccess(true);
      setTicketSubject('');
      setTicketDesc('');
      setTimeout(() => setTicketSuccess(false), 4500);
    }, 1500);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Support SLA</span>
              <span className="text-[10px] font-mono text-slate-500">Response SLA: &lt; 2 hours</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <LifeBuoy className="h-8 w-8 text-cyan-400" />
              Ecosystem Help Center
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              Search the official SCUT manuals, find immediate answers to product FAQs, or submit high-priority technical tickets directly to our engineers.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('contact')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Mail className="h-4 w-4" /> Open Ticket Form
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* FAQ INDEX & SEARCH (LEFT SIDE - col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-cyan-400" /> Search User Manuals & FAQs
              </h2>
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Type a question (e.g., 'credits', 'privacy')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-850 focus:border-cyan-400 text-xs text-white outline-none transition-all shadow-lg"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-2">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4 text-cyan-400 shrink-0" /> {faq.q}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-light pl-5">
                      {faq.a}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-600 font-mono text-xs">
                  No direct matches found. Try entering alternative terms.
                </div>
              )}
            </div>

          </div>

          {/* PRIORITY TICKET SUBMITTER (RIGHT SIDE - col-span-5) */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-cyan-400" />
                  Submit SLA Support Ticket
                </h2>
                <p className="text-slate-400 text-[11px] font-light mt-0.5">
                  Our network engineers monitor these queues 24/7/365 to resolve client billing, account lockouts, or API failures.
                </p>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Ticket Subject / Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Stripe payment failed to credit"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs font-medium text-white transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Describe Issue In Detail</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Provide error codes, account IDs, and expected outcomes to help us expedite your request..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs leading-relaxed text-white transition-all outline-none resize-none"
                  />
                </div>

                {ticketSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed font-mono flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Ticket created! Queue index # {Math.floor(Math.random() * 8900) + 1000} registered. A support staff will follow up.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Queuing Ticket...
                    </>
                  ) : (
                    'Dispatch Priority Ticket'
                  )}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
