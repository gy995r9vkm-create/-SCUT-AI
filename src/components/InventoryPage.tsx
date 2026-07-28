/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Layers, CheckCircle, Sliders, AlertTriangle, RefreshCw } from 'lucide-react';

interface InventoryPageProps {
  onNavigate: (page: string) => void;
}

export default function InventoryPage({ onNavigate }: InventoryPageProps) {
  const items = [
    { name: 'Model Classifier Weights Key', sku: 'SKU-WEIGHT-01', stock: 'Unlimited (SaaS)', type: 'License Keys' },
    { name: 'Boilerplate Template ZIP Assets', sku: 'SKU-ZIP-REACT-05', stock: 'Unlimited (Download)', type: 'Source Assets' },
    { name: 'Financial Model API Key Quota', sku: 'SKU-API-QUOTA-FIN', stock: '85,000 / 100,000 reqs left', type: 'SaaS Quota' },
    { name: 'SLA Support Priority Token', sku: 'SKU-TOKEN-SLA-VIP', stock: '1 Active Node', type: 'SLA Priority' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded">Fulfillment Directory</span>
            <span className="text-[10px] font-mono text-slate-500">Node Sync Complete</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Layers className="h-8 w-8 text-amber-400" />
            Digital Inventory
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Browse and manage digital product inventory, track active license keys, and allocate API quota pools.
          </p>
        </div>

        {/* INVENTORY TABLE */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Listed Storefront Inventory</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-light divide-y divide-slate-900/60">
              <thead>
                <tr className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
                  <th className="py-3 pb-4">Digital Product / Quota Name</th>
                  <th className="py-3 pb-4">Asset SKU</th>
                  <th className="py-3 pb-4">Asset Type</th>
                  <th className="py-3 pb-4 text-right">Available Allocation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-4 font-semibold text-slate-200">{item.name}</td>
                    <td className="py-4 font-mono text-[10px] text-slate-400">{item.sku}</td>
                    <td className="py-4 text-slate-400 font-mono text-[10px]">{item.type}</td>
                    <td className="py-4 text-right font-bold font-mono text-slate-200 text-xs">{item.stock}</td>
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
