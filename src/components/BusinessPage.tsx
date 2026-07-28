import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Briefcase, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, 
  Settings, Key, Layers, Globe, Mail, Landmark, PieChart, Users, CheckSquare
} from 'lucide-react';
import { User } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BusinessPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

export default function BusinessPage({ user, onNavigate, onAddLog }: BusinessPageProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'invoices' | 'settings'>('analytics');
  
  // Simulated analytics data for business merchant volume
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
    { label: "Active Integrations", value: "6 dApps", change: "Healthy", icon: Layers, color: "text-cyan-400" },
    { label: "Ecosystem Customers", value: "3.4K", change: "+18%", icon: Users, color: "text-indigo-400" },
    { label: "SLA Support Queue", value: "< 5 mins", change: "Guaranteed", icon: ShieldCheck, color: "text-purple-400" },
  ];

  // Invoices list
  const [invoices, setInvoices] = useState([
    { id: 'inv-1024', customer: 'Acme Corporates LLC', amount: '450.00 POL', status: 'paid', date: '2026-07-15' },
    { id: 'inv-1025', customer: 'Sovereign Nodes Group', amount: '1,200.00 POL', status: 'pending', date: '2026-07-16' },
    { id: 'inv-1026', customer: 'Hyperion Analytics', amount: '85.50 POL', status: 'paid', date: '2026-07-14' },
  ]);

  // Merchant setup state
  const [webhookUrl, setWebhookUrl] = useState('https://api.yourcompany.com/scutpay-webhook');
  const [merchantName, setMerchantName] = useState(user?.name || 'My Business LLC');
  const [payoutCurrency, setPayoutCurrency] = useState('POL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onAddLog('Merchant Updated', `Webhook and payout configurations updated for ${merchantName}`, 'security');
    showNotification('Merchant settings saved successfully!');
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* Background blobs */}
      <div className="absolute top-1/4 -right-1/4 h-[400px] w-[400px] rounded-full bg-indigo-900/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="border-b border-slate-900 pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-medium mb-3">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
              <span>Merchant & Corporate Hub</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              SCUT <span className="text-indigo-400">Business</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed font-light">
              Connect your applications, manage on-chain invoicing, track high-throughput payments, and leverage priority SLA support.
            </p>
          </div>

          {/* Quick Tabs switcher */}
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'analytics' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'invoices' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'settings' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/15' : 'text-slate-400 hover:text-white'
              }`}
            >
              Gateway Setup
            </button>
          </div>
        </div>

        {/* Dynamic Render based on Active Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((st, i) => {
                const Icon = st.icon;
                return (
                  <div key={i} className="rounded-2xl border border-slate-900 bg-slate-950 p-6 flex items-center gap-4 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-16 w-16 bg-slate-900/20 rounded-bl-full pointer-events-none" />
                    <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${st.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{st.label}</span>
                      <div className="font-display text-xl font-bold text-white mt-0.5">{st.value}</div>
                      <span className={`text-[10px] font-semibold block mt-0.5 ${st.change.startsWith('+') ? 'text-emerald-400' : 'text-indigo-400'}`}>
                        {st.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Area Chart box */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-8 shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-200">Revenue Flow & Micro-gas Telemetry</h3>
                  <p className="text-slate-500 text-xs mt-0.5 font-light">Ecosystem payment gateway traffic monitored over last 7 cycles.</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-[10px] text-slate-400 font-mono font-bold">
                  <Globe className="h-3.5 w-3.5 text-indigo-400 animate-spin-slow" />
                  <span>Polygon POS Network</span>
                </div>
              </div>

              <div className="h-[300px] w-full pr-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b50" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="font-display text-base font-bold text-slate-200">On-Chain Corporate Ledger</h3>
                <p className="text-slate-500 text-xs mt-0.5 font-light">Monitor, search, and verify issued invoice contracts.</p>
              </div>
              <button 
                onClick={() => showNotification('New invoice template generated in draft mode.')}
                className="px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-450 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                Create Invoice Draft
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-950" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    <th className="pb-4">Invoice ID</th>
                    <th className="pb-4">Client</th>
                    <th className="pb-4">Billing Date</th>
                    <th className="pb-4">Amount</th>
                    <th className="pb-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300 font-light">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/30 transition-colors">
                      <td className="py-4 font-mono font-semibold text-slate-400">#{inv.id}</td>
                      <td className="py-4 text-slate-200">{inv.customer}</td>
                      <td className="py-4 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-4 font-semibold font-mono text-white">{inv.amount}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-block font-bold text-[9px] uppercase px-2 py-0.5 rounded tracking-wide ${
                          inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15' : 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-8 shadow-xl">
            <h3 className="font-display text-base font-bold text-slate-200 mb-2">Checkout Gateway Configurations</h3>
            <p className="text-slate-500 text-xs font-light mb-6 border-b border-slate-900 pb-4">
              Provision webhooks, define payout routing rules, and obtain custom developer signatures.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Corporate Merchant Name</label>
                  <input
                    type="text"
                    required
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Settlement Asset Type</label>
                  <select
                    value={payoutCurrency}
                    onChange={(e) => setPayoutCurrency(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-indigo-500/30"
                  >
                    <option value="POL">Polygon POL (Native)</option>
                    <option value="USDC">Bridged USDC Stablecoin</option>
                    <option value="EUR">Ecosystem Euro (Virtual)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Webhook Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full font-mono text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500/30"
                />
                <span className="text-[10px] text-slate-500 mt-1.5 block font-light leading-relaxed">
                  We send POST payloads with on-chain payment hashes and customer receipts to this endpoint in under 150ms.
                </span>
              </div>

              <div className="pt-4 border-t border-slate-900 flex gap-3">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl font-display font-semibold text-slate-950 bg-indigo-400 hover:bg-indigo-300 transition-all text-xs cursor-pointer"
                >
                  Save Gateway Config
                </button>
                <button
                  type="button"
                  onClick={() => showNotification('Webhook ping generated: Status 200 OK')}
                  className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Test Connection (Ping)
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Custom Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-500/30 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
}
