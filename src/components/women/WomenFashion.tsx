/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, ShoppingBag, Plus, Trash2, CheckCircle, 
  Sparkle, ArrowRight, Layers, Sliders, DollarSign, Wallet
} from 'lucide-react';
import { addToCart } from '../../lib/cart';

import { User, Language } from '../../types';
import { t } from '../../lib/translations';

interface WomenFashionProps {
  language?: Language;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onPayWithWallet?: (amount: string, description: string) => void;
  onNavigate?: (page: string) => void;
  showToast: (msg: string) => void;
}

interface WishlistItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  priority: 'High' | 'Medium' | 'Low';
  purchased: boolean;
}

export default function WomenFashion({ language = 'en', onAddLog, onPayWithWallet, onNavigate, showToast }: WomenFashionProps) {
  const [activeSeason, setActiveSeason] = useState<'Summer' | 'Autumn' | 'Winter' | 'Spring'>('Summer');
  const [addedCartProduct, setAddedCartProduct] = useState<any | null>(null);
  
  // Wardrobe planner choices
  const [selectedTop, setSelectedTop] = useState('Silk Cami');
  const [selectedBottom, setSelectedBottom] = useState('Linen Wide-Leg Trousers');
  const [selectedOuter, setSelectedOuter] = useState('Oversized Linen Blazer');
  const [selectedShoes, setSelectedShoes] = useState('Leather Strappy Sandals');
  const [selectedAccessory, setSelectedAccessory] = useState('Woven Straw Tote');
  const [savedOutfits, setSavedOutfits] = useState<{ id: string; name: string; top: string; bottom: string; outer: string; shoes: string; acc: string }[]>([]);
  const [outfitName, setOutfitName] = useState('');

  // Wishlist state
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { id: 'w-1', name: 'Vegan Leather Trench Coat', category: 'Coats', cost: 680, priority: 'High', purchased: false },
    { id: 'w-2', name: 'Gold Knot Statement Earrings', category: 'Accessories', cost: 120, priority: 'Medium', purchased: false },
    { id: 'w-3', name: 'Almond Pointed Mule Flats', category: 'Shoes', cost: 240, priority: 'High', purchased: false }
  ]);
  const [newWishName, setNewWishName] = useState('');
  const [newWishCost, setNewWishCost] = useState('');
  const [newWishCategory, setNewWishCategory] = useState('Dresses');
  const [newWishPriority, setNewWishPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const seasonalTrends = {
    Summer: {
      advice: "Light, breathable linens paired with minimal, structured gold details. Neutral tones are optimized for Mediterranean sunshine.",
      items: [
        { title: "Organic Flax Linen Set", luxury: "1,450 RON (Chloé)", budget: "280 RON (Zara)", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80" },
        { title: "Pointed Suede Mules", luxury: "3,200 RON (Manolo Blahnik)", budget: "340 RON (Mango)", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&auto=format&fit=crop&q=80" }
      ]
    },
    Autumn: {
      advice: "Luxurious double-breasted woolen trenches paired with high-quality ribbed turtlenecks and chocolate leather boots.",
      items: [
        { title: "Cashmere Ribbed Turtleneck", luxury: "4,100 RON (Loro Piana)", budget: "450 RON (Massimo Dutti)", image: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&auto=format&fit=crop&q=80" },
        { title: "Chocolate Riding Boots", luxury: "5,800 RON (Hermès)", budget: "620 RON (Uterqüe)", image: "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=400&auto=format&fit=crop&q=80" }
      ]
    },
    Winter: {
      advice: "Shearling-trimmed heavy jackets layered with fine thermal silks, and statement structural scarves in high contrast palettes.",
      items: [
        { title: "Shearling Moto Jacket", luxury: "9,500 RON (Toteme)", budget: "780 RON (H&M Premium)", image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80" },
        { title: "Alpaca Blanket Scarf", luxury: "1,200 RON (Acne Studios)", budget: "195 RON (Zara)", image: "https://images.unsplash.com/photo-1520635680457-3fb9279a05b4?w=400&auto=format&fit=crop&q=80" }
      ]
    },
    Spring: {
      advice: "Flowing organic cotton midi lengths layered with crisp cotton poplin shirting and delicate freshwater pearl accents.",
      items: [
        { title: "Freshwater Pearl Drop Set", luxury: "2,200 RON (Sophie Bille Brahe)", budget: "210 RON (COS)", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=80" },
        { title: "Poplin Blue Stripe Shirt", luxury: "1,600 RON (The Row)", budget: "180 RON (Zara)", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&auto=format&fit=crop&q=80" }
      ]
    }
  };

  const handleSaveOutfit = () => {
    const name = outfitName.trim();
    if (!name) {
      showToast("Please write a name for this capsule look.");
      return;
    }
    const newOutfit = {
      id: 'outfit-' + Math.random().toString(36).substring(2, 9),
      name,
      top: selectedTop,
      bottom: selectedBottom,
      outer: selectedOuter,
      shoes: selectedShoes,
      acc: selectedAccessory
    };
    setSavedOutfits(prev => [newOutfit, ...prev]);
    setOutfitName('');
    showToast(`Saved outfit plan "${name}" to your capsule collection!`);
  };

  const handleAddWish = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newWishName.trim();
    const costNum = parseFloat(newWishCost);
    if (!name || isNaN(costNum)) {
      showToast("Please enter a valid item name and budget cost.");
      return;
    }
    const newItem: WishlistItem = {
      id: 'wish-' + Math.random().toString(36).substring(2, 9),
      name,
      category: newWishCategory,
      cost: costNum,
      priority: newWishPriority,
      purchased: false
    };
    setWishlist(prev => [newItem, ...prev]);
    setNewWishName('');
    setNewWishCost('');
    showToast(`Added "${name}" to your premium wishlist tracker.`);
  };

  const handleDeleteWish = (id: string) => {
    setWishlist(prev => prev.filter(w => w.id !== id));
  };

  const handleCheckoutWish = async (item: WishlistItem) => {
    await addToCart({
      id: item.id,
      title: item.name,
      price: item.cost.toString(),
      author: 'Fashion Wishlist Item',
      category: item.category,
      images: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop&q=80'],
      acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
      quantity: 1,
      savedForLater: false
    });
    setWishlist(prev => prev.map(w => w.id === item.id ? { ...w, purchased: true } : w));
    setAddedCartProduct({ title: item.name, price: `${item.cost} USD` });
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-600 text-[10px] font-bold uppercase tracking-widest">Atelier</span>
              <Sparkles className="h-4.5 w-4.5 text-pink-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Fashion & Wardrobe Lookbook</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Plan sustainable capsules, track investment-grade fashion, cross-match budget lookalikes, and fund luxury wishes securely using SCUT Pay.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-pink-500/5 border border-pink-500/15 text-pink-700 rounded-2xl text-xs font-bold shadow-inner">
            <Layers className="h-4 w-4" />
            Capsule-Ready
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER: WARDROBE CAPSULE BUILDER & TRENDS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* INTERACTIVE CAPSULE BUILDER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="h-4.5 w-4.5 text-pink-500" />
                  Capsule Outfit Designer
                </h3>
                <p className="text-[11px] text-[#694e55]">Design modular sustainable outfits to beat decision-fatigue.</p>
              </div>
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg">Capsule Engine</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Controls */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">1. Core Top</label>
                  <select 
                    value={selectedTop}
                    onChange={e => setSelectedTop(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Silk Cami">Organic Silk Camisole</option>
                    <option value="Ribbed Knit Turtleneck">Ribbed Wool Turtleneck</option>
                    <option value="Poplin Button-Down">Tailored Cotton Poplin Shirt</option>
                    <option value="Cashmere Crewneck">Superfine Cashmere Crewneck</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">2. Bottom silhouette</label>
                  <select 
                    value={selectedBottom}
                    onChange={e => setSelectedBottom(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Linen Wide-Leg Trousers">Linen High-Waisted Wide-Leg Trousers</option>
                    <option value="Straight Wool Pants">Straight Tailored Wool Pants</option>
                    <option value="Silk Slip Skirt">Bias-Cut Mulberry Silk Slip Skirt</option>
                    <option value="Minimalist Pleated Shorts">Pleated Organic Cotton Shorts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">3. Outer Layer</label>
                  <select 
                    value={selectedOuter}
                    onChange={e => setSelectedOuter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Oversized Linen Blazer">Oversized Lightweight Linen Blazer</option>
                    <option value="Belted Trench Coat">Classic Belted Double-Breasted Trench</option>
                    <option value="Cozy Shearling Jacket">Aviator Shearling-Trimmed Jacket</option>
                    <option value="None">[No Outer Layer Layered]</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">4. Footwear</label>
                  <select 
                    value={selectedShoes}
                    onChange={e => setSelectedShoes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Leather Strappy Sandals">Handcrafted Leather Strappy Sandals</option>
                    <option value="Pointed Leather Mules">Pointed Butter-Soft Leather Mules</option>
                    <option value="Minimalist White Sneakers">Retro Eco-Leather White Sneakers</option>
                    <option value="Chelsea Suede Boots">Italian Suede Chelsea Boots</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">5. Accessory Highlight</label>
                  <select 
                    value={selectedAccessory}
                    onChange={e => setSelectedAccessory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Woven Straw Tote">Structured Woven Straw Summer Tote</option>
                    <option value="Crescent Leather Bag">Sleek Crescent Leather Shoulder Bag</option>
                    <option value="Pearl Drop Earrings">Baroque Pearl Drop Stud Earrings</option>
                    <option value="Silk Scarf">Botanical Dye Mulberry Silk Hair Scarf</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-500">Save Capsule Plan</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Minimalist Travel, Workwear Core"
                      value={outfitName}
                      onChange={e => setOutfitName(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#3b1c24] focus:outline-none focus:ring-1 focus:ring-pink-200"
                    />
                    <button
                      onClick={handleSaveOutfit}
                      className="px-4 py-2.5 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all text-xs font-bold cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>

              {/* Outfit Preview Display */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between relative">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Look Breakdown</h4>
                  
                  <div className="space-y-2 text-xs font-medium">
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Core Top:</span>
                      <span className="text-[#3b1c24] font-bold">{selectedTop}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Bottom:</span>
                      <span className="text-[#3b1c24] font-bold">{selectedBottom}</span>
                    </div>
                    {selectedOuter !== 'None' && (
                      <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                        <span className="text-slate-400">Outer Layer:</span>
                        <span className="text-[#3b1c24] font-bold">{selectedOuter}</span>
                      </div>
                    )}
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Footwear:</span>
                      <span className="text-[#3b1c24] font-bold">{selectedShoes}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="text-slate-400">Accessory:</span>
                      <span className="text-[#3b1c24] font-bold">{selectedAccessory}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-[#694e55] leading-relaxed text-center mt-4 bg-pink-500/5 p-2.5 rounded-xl border border-pink-500/10 font-semibold">
                  🌿 <strong>Cohesion Index</strong>: 98% (High-harmony Capsule combination optimized for seasonal overlap).
                </div>
              </div>
            </div>

            {/* Saved Outfits List */}
            {savedOutfits.length > 0 && (
              <div className="pt-4 border-t border-slate-50">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Your Saved Outfits ({savedOutfits.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedOutfits.map(outfit => (
                    <div key={outfit.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/50">
                        <span className="font-bold text-[#3b1c24]">{outfit.name}</span>
                        <button 
                          onClick={() => setSavedOutfits(prev => prev.filter(o => o.id !== outfit.id))}
                          className="text-red-500 hover:text-red-700 transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-500 space-y-1">
                        <div>Top: <span className="text-slate-800 font-semibold">{outfit.top}</span></div>
                        <div>Bottom: <span className="text-slate-800 font-semibold">{outfit.bottom}</span></div>
                        {outfit.outer !== 'None' && <div>Outer: <span className="text-slate-800 font-semibold">{outfit.outer}</span></div>}
                        <div>Shoes: <span className="text-slate-800 font-semibold">{outfit.shoes}</span></div>
                        <div>Acc: <span className="text-slate-800 font-semibold">{outfit.acc}</span></div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedTop(outfit.top);
                          setSelectedBottom(outfit.bottom);
                          setSelectedOuter(outfit.outer);
                          setSelectedShoes(outfit.shoes);
                          setSelectedAccessory(outfit.acc);
                          showToast(`Activated outfit outline "${outfit.name}"!`);
                        }}
                        className="w-full text-center py-1.5 rounded-lg bg-white border border-slate-100 font-bold text-[10px] text-pink-600 hover:text-pink-800 transition-all cursor-pointer"
                      >
                        Apply Setup
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SEASONAL TRENDS & BRANDS MATCHING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                <Sparkle className="h-4 w-4 text-rose-500 animate-spin" />
                Trends & Luxury Dupe Optimization
              </h3>
              
              <div className="flex gap-1">
                {(['Summer', 'Autumn', 'Winter', 'Spring'] as const).map(season => (
                  <button
                    key={season}
                    onClick={() => setActiveSeason(season)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer whitespace-nowrap transition-all ${
                      activeSeason === season 
                        ? 'bg-pink-500 text-white border-pink-500' 
                        : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {season}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <p className="text-xs text-[#694e55] leading-relaxed italic">
                “{seasonalTrends[activeSeason].advice}”
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seasonalTrends[activeSeason].items.map((item, index) => (
                  <div key={index} className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm flex">
                    <img referrerPolicy="no-referrer" src={item.image} alt={item.title} className="w-20 h-20 object-cover flex-shrink-0" />
                    <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                      <h4 className="text-[11px] font-bold text-[#3b1c24] truncate">{item.title}</h4>
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-slate-400">Luxury Brand:</span>
                          <span className="text-[#3b1c24] font-bold">{item.luxury}</span>
                        </div>
                        <div className="flex justify-between text-[9px] font-mono">
                          <span className="text-pink-500 font-bold">SCUT High-Street Dupe:</span>
                          <span className="text-emerald-600 font-extrabold">{item.budget}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRUSTED GLOBAL FASHION SOURCES */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
                Trusted Fashion & Trend Reference Hub
              </h3>
              <p className="text-[11px] text-[#694e55]">Discover verified outfit inspiration, global runway trends, and seasonal capsule edits from leading fashion authorities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Vogue Runway Collections",
                  desc: "Explore direct high-end seasonal collections, designer debuts, and runway captures.",
                  link: "https://www.vogue.com/runway",
                  source: "Vogue Runway Official",
                  category: "Seasonal Collections"
                },
                {
                  title: "Harper's Bazaar Fashion Trends",
                  desc: "Curated analyses of global fashion shifts, emerging color palettes, and styling guidelines.",
                  link: "https://www.harpersbazaar.com/fashion/",
                  source: "Harper's Bazaar Style",
                  category: "Fashion Trends"
                },
                {
                  title: "Who What Wear Style Ideas",
                  desc: "Daily outfit inspiration, shopping recommendations, and street style breakdowns.",
                  link: "https://www.whowhatwear.com/section/outfits",
                  source: "Who What Wear Style",
                  category: "Outfit Inspiration"
                },
                {
                  title: "Chanel Official Collections",
                  desc: "Direct access to haute couture, ready-to-wear lines, and campaign inspirations.",
                  link: "https://www.chanel.com/ro/fashion/",
                  source: "Chanel Fashion",
                  category: "Luxury Runway"
                }
              ].map((src, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-pink-50/10 border border-pink-100/30 flex flex-col justify-between space-y-3 hover:border-pink-300 transition-colors">
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded uppercase tracking-wider">{src.category}</span>
                    <h4 className="text-xs font-bold text-[#3b1c24]">{src.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-light">{src.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[140px]">{src.source}</span>
                    <a 
                      href={src.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-pink-500 hover:text-pink-700 flex items-center gap-1.5 hover:underline"
                    >
                      Verify Source <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#3b1c24] text-white rounded-2xl text-[10px] leading-relaxed flex items-start gap-2 font-mono">
              <span className="text-pink-400">✨</span>
              <span>Our digital atelier routes direct connections to official public houses. We support circular, high-durability investment purchases to minimize environmental footprint.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LUXURY WISHLIST & SCUT PAY */}
        <div className="space-y-8">
          
          {/* WISHLIST TRACKER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShoppingBag className="h-4 w-4 text-pink-500" />
                Wishlist & Savings Goals
              </h3>
              <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-2 py-0.5 rounded">Safe-Pay Link</span>
            </div>

            {/* Wishlist Add Form */}
            <form onSubmit={handleAddWish} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Item Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Silk Dress"
                    value={newWishName}
                    onChange={e => setNewWishName(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-[#3b1c24] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Cost (RON)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 450"
                    value={newWishCost}
                    onChange={e => setNewWishCost(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg px-2.5 py-1.5 text-xs text-[#3b1c24] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                  <select
                    value={newWishCategory}
                    onChange={e => setNewWishCategory(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="Dresses">Dresses</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Bags">Bags</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Coats">Coats</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Priority</label>
                  <select
                    value={newWishPriority}
                    onChange={e => setNewWishPriority(e.target.value as any)}
                    className="w-full bg-white border border-slate-100 rounded-lg px-2 py-1.5 text-xs text-[#3b1c24] focus:outline-none"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#3b1c24] hover:bg-black text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Add Item to Wishlist
              </button>
            </form>

            {/* Wishlist Items List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[300px] pr-1">
              {wishlist.map(item => (
                <div key={item.id} className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  item.purchased 
                    ? 'bg-emerald-500/5 border-emerald-500/20 opacity-75' 
                    : 'bg-slate-50/80 border-slate-100'
                }`}>
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate ${item.purchased ? 'line-through text-slate-400' : 'text-[#3b1c24]'}`}>
                        {item.name}
                      </span>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                        item.priority === 'High' ? 'bg-red-100 text-red-600' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-600">{item.cost} RON</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!item.purchased ? (
                      <>
                        <button
                          onClick={() => handleCheckoutWish(item)}
                          className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-[10px] rounded-lg shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Wallet className="h-3 w-3" /> Pay
                        </button>
                        <button
                          onClick={() => handleDeleteWish(item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Funded
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Added to Cart Choice Modal */}
      <AnimatePresence>
        {addedCartProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddedCartProduct(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-rose-100 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-[#3b1c24]">Added to Shopping Cart!</h3>
                <p className="text-xs font-bold text-rose-600">{addedCartProduct.title} ({addedCartProduct.price})</p>
                <p className="text-[11px] text-slate-500 font-medium">Item saved to your cart and synchronized with your account in Firestore.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setAddedCartProduct(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setAddedCartProduct(null);
                    localStorage.setItem('scut_marketplace_view', 'cart');
                    window.dispatchEvent(new Event('scut_cart_changed'));
                    if (onNavigate) onNavigate('marketplace');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
