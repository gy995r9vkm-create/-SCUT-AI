/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, CheckCircle, Clock, XCircle, ArrowUpRight, Search } from 'lucide-react';

interface OrdersPageProps {
  onNavigate: (page: string) => void;
}

export default function OrdersPage({ onNavigate }: OrdersPageProps) {
  const orders = [
    { id: 'ORD-5481', customer: 'alpha_studio@scut.net', product: 'Full-stack Web3 Subscription Boilerplate', amount: '5.50 POL', status: 'completed', date: '2026-07-18' },
    { id: 'ORD-5480', customer: 'digital_nodes@scut.net', product: 'Multimodal Legal Document Classifier', amount: '15.00 POL', status: 'completed', date: '2026-07-17' },
    { id: 'ORD-5479', customer: 'curious_dev@scut.net', product: 'Financial Analysis Prompt Ledger', amount: '1.50 POL', status: 'pending', date: '2026-07-16' },
    { id: 'ORD-5478', customer: 'polygon_team@scut.net', product: 'Real-time Gas Optimizer Tracker API', amount: '10.00 POL', status: 'failed', date: '2026-07-15' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Storefront Logs</span>
            <span className="text-[10px] font-mono text-slate-500">Escrow Protected</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="h-8 w-8 text-cyan-400" />
            Orders Tracker
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Audit store transaction logs, monitor escrow status, and verify client licenses.
          </p>
        </div>

        {/* LISTINGS */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Order Logs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light divide-y divide-slate-900/60">
              <thead>
                <tr className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 pb-4">Order ID</th>
                  <th className="py-3 pb-4">Customer</th>
                  <th className="py-3 pb-4">Product</th>
                  <th className="py-3 pb-4">Date</th>
                  <th className="py-3 pb-4">Status</th>
                  <th className="py-3 pb-4 text-right">Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 font-mono text-[10px] text-slate-500">{ord.id}</td>
                    <td className="py-4 font-semibold text-slate-300">{ord.customer}</td>
                    <td className="py-4 text-slate-300">{ord.product}</td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">{ord.date}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                        ord.status === 'completed'
                          ? 'bg-emerald-500/10 border-emerald-500/15 text-emerald-400'
                          : ord.status === 'pending'
                          ? 'bg-amber-500/10 border-amber-500/15 text-amber-400'
                          : 'bg-red-500/10 border-red-500/15 text-red-400'
                      }`}>
                        {ord.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                        {ord.status === 'pending' && <Clock className="h-3 w-3 animate-pulse" />}
                        {ord.status === 'failed' && <XCircle className="h-3 w-3" />}
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-200">{ord.amount}</td>
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
