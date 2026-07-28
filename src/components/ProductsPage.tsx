/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, Plus, Trash2, Edit3, DollarSign, Tag, Check, ArrowUpRight
} from 'lucide-react';

interface ProductsPageProps {
  onNavigate: (page: string) => void;
}

export default function ProductsPage({ onNavigate }: ProductsPageProps) {
  const [products, setProducts] = useState([
    { id: 'p-1', name: 'Multimodal Legal Document Classifier', price: '15.00 POL', category: 'models', sales: 412 },
    { id: 'p-2', name: 'Full-stack Web3 Subscription Boilerplate', price: '5.50 POL', category: 'templates', sales: 284 },
    { id: 'p-3', name: 'Financial Analysis Prompt Ledger', price: '1.50 POL', category: 'prompts', sales: 1240 },
    { id: 'p-4', name: 'Real-time Gas Optimizer Tracker API', price: '10.00 POL', category: 'api', sales: 98 }
  ]);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('models');

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const newProd = {
      id: `p-${Math.floor(Math.random() * 1000)}`,
      name: newName,
      price: `${newPrice} POL`,
      category: newCategory,
      sales: 0
    };

    setProducts([newProd, ...products]);
    setNewName('');
    setNewPrice('');
  };

  const handleDelete = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded">Store Assets</span>
            <span className="text-[10px] font-mono text-slate-500">Polygon Chain Link Enabled</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Package className="h-8 w-8 text-emerald-400" />
            Products Directory
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Publish smart-contract assets, modify price models, track lifetime volume sales, and manage on-chain listings.
          </p>
        </div>

        {/* CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* New Product Form */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-5">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-400" /> List Digital Asset
              </h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Asset Title / Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="E.g., Medical Radiography Transformer Model"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-emerald-400 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">POL price</label>
                    <input 
                      type="number" 
                      required
                      placeholder="0.00"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-emerald-400 text-xs text-white placeholder-slate-600 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">License Type</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 focus:border-emerald-400 text-xs text-white focus:outline-none"
                    >
                      <option value="models">AI Weights</option>
                      <option value="templates">Developer Templates</option>
                      <option value="prompts">Prompts Pack</option>
                      <option value="api">API Endpoint</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all flex justify-center items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Publish Product
                </button>
              </form>
            </div>
          </div>

          {/* Active Listings */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Listed Storefront Artifacts</h2>
            <div className="space-y-3">
              {products.map((prod) => (
                <div key={prod.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900 flex justify-between items-center hover:border-slate-800 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-slate-500 uppercase">{prod.id}</span>
                      <span className="font-bold text-xs text-white">{prod.name}</span>
                    </div>
                    <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                      <div><span className="text-slate-500">CATEGORY:</span> {prod.category.toUpperCase()}</div>
                      <div><span className="text-slate-500">TOTAL SALES:</span> {prod.sales} purchases</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm font-bold text-emerald-400">{prod.price}</span>
                    <button 
                      onClick={() => handleDelete(prod.id)}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
