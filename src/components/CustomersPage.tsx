/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Users, Mail, ShieldCheck, DollarSign, Search } from 'lucide-react';

interface CustomersPageProps {
  onNavigate: (page: string) => void;
}

export default function CustomersPage({ onNavigate }: CustomersPageProps) {
  const customers = [
    { name: 'Acme Corporates LLC', email: 'billing@acme.com', spent: '$14,200', activeLicenses: 5, status: 'VIP Customer' },
    { name: 'Sovereign Nodes Group', email: 'support@sovereign.net', spent: '$8,450', activeLicenses: 2, status: 'Enterprise' },
    { name: 'Hyperion Analytics', email: 'admin@hyperion.io', spent: '$3,120', activeLicenses: 1, status: 'Pro Partner' },
    { name: 'Digital Labs team', email: 'dev@digital.net', spent: '$1,500', activeLicenses: 1, status: 'Pro' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded">Store CRM</span>
            <span className="text-[10px] font-mono text-slate-500">GDPR Compliant</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Users className="h-8 w-8 text-indigo-400" />
            Customer Directory
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Browse corporate accounts, track customer on-chain licensing volume, and issue custom product support.
          </p>
        </div>

        {/* CLIENT DIRECTORY TABLE */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Merchant Client Registry</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light divide-y divide-slate-900/60">
              <thead>
                <tr className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 pb-4">Client Name</th>
                  <th className="py-3 pb-4">Email</th>
                  <th className="py-3 pb-4">Total Volume Spent</th>
                  <th className="py-3 pb-4">Licenses</th>
                  <th className="py-3 pb-4 text-right">Corporate Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {customers.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 font-semibold text-slate-200">{cust.name}</td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">{cust.email}</td>
                    <td className="py-4 text-slate-300 font-mono font-bold">{cust.spent}</td>
                    <td className="py-4 text-slate-300 font-mono">{cust.activeLicenses} licenses</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded border bg-indigo-500/10 border-indigo-500/15 text-indigo-400">
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
