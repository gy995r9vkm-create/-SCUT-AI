/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Heart, Bot, Send, Trash2, CheckCircle, 
  BookOpen, Star, Sparkle, Zap, ArrowRight, Eye, Play, ArrowLeft, Loader2
} from 'lucide-react';
import { addToCart } from '../../lib/cart';

import { User, Language } from '../../types';
import { t } from '../../lib/translations';

interface WomenBeautyProps {
  language?: Language;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onPayWithWallet?: (amount: string, description: string) => void;
  onNavigate?: (page: string) => void;
  showToast: (msg: string) => void;
}

interface BeautyTutorial {
  id: string;
  title: string;
  category: 'Skincare' | 'Makeup' | 'Nails' | 'Hair';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  time: string;
  rating: number;
  steps: string[];
  image: string;
}

export default function WomenBeauty({ language = 'en', onAddLog, onPayWithWallet, onNavigate, showToast }: WomenBeautyProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'skincare' | 'makeup' | 'nails' | 'hair' | 'perfumes'>('all');
  const [addedCartProduct, setAddedCartProduct] = useState<any | null>(null);
  
  // AI Beauty Assistant State
  const [skinType, setSkinType] = useState('Combination');
  const [skinConcern, setSkinConcern] = useState('Hydration & Brightening');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiChat, setAiChat] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: 'Hello gorgeous! I am your personal SCUT AI Beauty & Skincare Companion. Select your skin attributes above or ask me about nails, makeup lookbooks, hair repair, or personalized fragrances!' }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Wardrobe / Look planner state
  const [selectedNailColor, setSelectedNailColor] = useState('#ffb3c1');
  const [selectedNailShape, setSelectedNailShape] = useState('Almond');
  const [selectedMakeupVibe, setSelectedMakeupVibe] = useState('Dewy Rose');
  const [savedLooks, setSavedLooks] = useState<{ id: string; name: string; nailColor: string; nailShape: string; makeupVibe: string }[]>([]);
  const [lookNameInput, setLookNameInput] = useState('');

  // Tutorial progress state
  const [activeTutorial, setActiveTutorial] = useState<BeautyTutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const beautyItems = [
    { id: 'b-1', title: 'Velvet Rose Hand Cure', category: 'skincare', price: '120 RON', rating: 4.9, image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80', desc: 'Premium organic hand cream infused with natural Transylvanian rose oils.' },
    { id: 'b-2', title: 'Satin Silk Lip Tint', category: 'makeup', price: '95 RON', rating: 4.8, image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&auto=format&fit=crop&q=80', desc: 'Hydrating, smudge-proof crimson lip tint with a soft matte finish.' },
    { id: 'b-3', title: 'Glass Gel Top Coat', category: 'nails', price: '70 RON', rating: 5.0, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&auto=format&fit=crop&q=80', desc: 'Ultra-glossy UV shield protective top coat for high-integrity manicures.' },
    { id: 'b-4', title: 'Argan Elixir Hair Serum', category: 'hair', price: '185 RON', rating: 4.9, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=80', desc: 'Pure cold-pressed Moroccan argan oil for damage repair & split ends.' },
    { id: 'b-5', title: 'Ambre D’Or Perfume', category: 'perfumes', price: '450 RON', rating: 4.7, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=80', desc: 'A captivating warm amber scent with sweet jasmine & vanilla highlights.' },
    { id: 'b-6', title: 'Hyaluronic Water Surge', category: 'skincare', price: '160 RON', rating: 4.8, image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?w=400&auto=format&fit=crop&q=80', desc: 'Local botanical water serum with double hyaluronic molecular weight.' }
  ];

  const tutorials: BeautyTutorial[] = [
    {
      id: 't-1',
      title: '7-Step Glass Skin Skincare Routine',
      category: 'Skincare',
      difficulty: 'Beginner',
      time: '15 mins',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&auto=format&fit=crop&q=80',
      steps: [
        'Double Cleanse: Use an oil-based cleanser followed by a hydrating water cleanser.',
        'Gentle Exfoliation: Pat in a mild PHA or Lactic Acid toner to remove dull cells.',
        'Hydrating Toner: Apply 3 layers of rose botanical toner for deep moisture bounce.',
        'Treatment Essence: Pat in snail mucin or ginseng essence to rebuild the natural skin barrier.',
        'Brightening Serum: Smooth 3-4 drops of pure Niacinamide or stable Vitamin C oil.',
        'Deep Hydration Seal: Apply a lipid-rich ceramide cream to lock in moisture.',
        'Sun Barrier: Seal with broad-spectrum SPF 50 mineral sunscreen.'
      ]
    },
    {
      id: 't-2',
      title: '90s French Almond Nail Art At-Home',
      category: 'Nails',
      difficulty: 'Intermediate',
      time: '30 mins',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400&auto=format&fit=crop&q=80',
      steps: [
        'File and Shape: Shape nails into a soft, tapered almond outline.',
        'Nail Prep: Buff nail plates and apply a dehydrator + base coat.',
        'Base Color: Apply two thin coats of a semi-sheer nude pink gel polish and cure.',
        'The Smile Line: Use a fine detail liner brush dipped in high-pigment white gel to draw the smile outline.',
        'Fill in Tip: Carefully paint the tips white, ensuring a symmetric, elegant curve.',
        'Clean up: Wipe away any spills with a flat brush dipped in acetone.',
        'Top Seal: Apply Glass Gel top coat and cure under UV lamp for 60 seconds.'
      ]
    },
    {
      id: 't-3',
      title: 'No-Makeup Dewy Glow Lookbook',
      category: 'Makeup',
      difficulty: 'Beginner',
      time: '10 mins',
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      steps: [
        'Prep: Apply high-hydration cream to secure a plump, glossy skin base.',
        'Conceal selectively: Spot-conceal only where needed (under-eyes, redness) using a dewy concealer.',
        'Flushed Cheeks: Tap rose cream blush onto the high points of the cheeks and blend upwards.',
        'Feathered Brows: Brush brows upward using clear sculpting brow soap or gel.',
        'Soft Lashes: Curl eyelashes and apply one coat of brown mascara for natural length.',
        'Lip Tint: Tap a soft crimson lip tint onto the center of the lips and blend out with fingers.'
      ]
    }
  ];

  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    const queryText = aiPrompt.trim();
    if (!queryText) return;

    const userMessage = { role: 'user' as const, content: queryText };
    setAiChat(prev => [...prev, userMessage]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Athena Beauty AI, a premium personal beauty consultant for women. Skin Type: ${skinType}, Main Concern: ${skinConcern}. The user asks: "${queryText}". Give a luxurious, highly specialized, scientifically accurate 2-3 sentence beauty recommendation. Use an encouraging, elite tone. No introductory text.`,
          temperature: 0.75
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setAiChat(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
        await onAddLog('AI Beauty Query', `Sought routine guidance for ${skinType} / ${skinConcern}`, 'api');
      } else {
        setAiChat(prev => [...prev, { role: 'assistant', content: "Our diagnostic matrix indicates high skin integrity. Maintain standard cellular hydration and botanical nourishment." }]);
      }
    } catch (err) {
      setAiChat(prev => [...prev, { role: 'assistant', content: "Secure botanical buffer online. Recommending organic rosehip seed oil and a silk pillowcase to maximize moisture retention." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveLook = () => {
    const lookName = lookNameInput.trim();
    if (!lookName) {
      showToast("Please enter a name for this custom look.");
      return;
    }
    const newLook = {
      id: 'look-' + Math.random().toString(36).substring(2, 9),
      name: lookName,
      nailColor: selectedNailColor,
      nailShape: selectedNailShape,
      makeupVibe: selectedMakeupVibe
    };
    setSavedLooks(prev => [newLook, ...prev]);
    setLookNameInput('');
    showToast(`Saved look "${lookName}" to your digital wardrobe wardrobe list!`);
  };

  const handleBuyProduct = async (product: typeof beautyItems[0]) => {
    await addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      author: 'SCUT Beauty Curator',
      category: product.category,
      images: [product.image],
      acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
      quantity: 1,
      savedForLater: false,
      details: product.desc
    });
    setAddedCartProduct(product);
  };

  const filteredItems = activeCategory === 'all' 
    ? beautyItems 
    : beautyItems.filter(item => item.category === activeCategory);

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-50/40 via-[#fff0f2]/30 to-[#fdf2f4]/40 border border-rose-200/40 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-400/5 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-600 text-[10px] font-bold uppercase tracking-widest">Premium Care</span>
              <Sparkles className="h-4.5 w-4.5 text-rose-400 animate-pulse" />
            </div>
            <h2 className="text-3xl font-display font-extrabold text-[#3b1c24] tracking-tight">Beauty Studio</h2>
            <p className="text-xs text-[#694e55] max-w-xl leading-relaxed">
              Unlock organic regional formulas, step-by-step beauty lookbooks, an interactive custom look planner, and diagnostic care with AI Athena.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/60 p-3 rounded-2xl border border-rose-100 shadow-sm w-fit">
            <div className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-[11px] font-bold text-[#3b1c24] uppercase tracking-wider">Athena Beauty AI Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT & CENTER COLUMNS: LOOK PLANNER & CURATED MARKETPLACE */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* LOOK PLANNER */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                  <Sparkle className="h-4 w-4 text-rose-500 animate-pulse" />
                  Custom Beauty & Nail Planner
                </h3>
                <p className="text-[11px] text-[#694e55]">Mix styles to create and save signature lookbooks.</p>
              </div>
              <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg">Interactive Simulator</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Controls */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Nail Base Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={selectedNailColor}
                      onChange={e => setSelectedNailColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{selectedNailColor}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Nail Shape Preference</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Almond', 'Stiletto', 'Square'].map(shape => (
                      <button
                        key={shape}
                        onClick={() => setSelectedNailShape(shape)}
                        className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                          selectedNailShape === shape 
                            ? 'bg-rose-500/10 border-rose-300 text-rose-700' 
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500">Makeup Tone Vibe</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Dewy Rose', 'Glow Peach', 'Latte Matte'].map(vibe => (
                      <button
                        key={vibe}
                        onClick={() => setSelectedMakeupVibe(vibe)}
                        className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                          selectedMakeupVibe === vibe 
                            ? 'bg-pink-500/10 border-pink-300 text-pink-700' 
                            : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {vibe}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-500">Save Look As</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Summer Gala, Brunch Date"
                      value={lookNameInput}
                      onChange={e => setLookNameInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#3b1c24] focus:outline-none focus:ring-1 focus:ring-rose-200"
                    />
                    <button
                      onClick={handleSaveLook}
                      className="px-4 py-2.5 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all text-xs font-bold cursor-pointer"
                    >
                      Save Look
                    </button>
                  </div>
                </div>
              </div>

              {/* Visual Preview Display */}
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 h-28 w-28 bg-[#fdf2f4] rounded-full filter blur-xl pointer-events-none" />
                <div className="space-y-3 relative">
                  <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Look Render</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-400">Nail Color</span>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3.5 w-3.5 rounded-full border border-slate-200" style={{ backgroundColor: selectedNailColor }} />
                        <span className="font-semibold text-[#3b1c24]">{selectedNailColor}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-400">Nail Shape</span>
                      <span className="font-semibold text-rose-600">{selectedNailShape}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-400">Makeup Concept</span>
                      <span className="font-semibold text-pink-600">{selectedMakeupVibe}</span>
                    </div>
                  </div>
                </div>

                {/* Hand / Nails Visual Representation */}
                <div className="flex items-center justify-center py-4 bg-white/40 rounded-xl border border-white/60 mt-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <div key={n} className="flex flex-col items-center">
                        <div 
                          className="w-4 h-8 rounded-t-full border border-slate-200 shadow-inner transition-all duration-500" 
                          style={{ 
                            backgroundColor: selectedNailColor,
                            borderRadius: selectedNailShape === 'Square' ? '2px 2px 0 0' : selectedNailShape === 'Stiletto' ? '12px 12px 0 0' : '999px 999px 0 0',
                            height: selectedNailShape === 'Stiletto' ? '38px' : '32px'
                          }} 
                        />
                        <span className="text-[8px] font-mono text-slate-300 mt-1">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Saved Looks List */}
            {savedLooks.length > 0 && (
              <div className="pt-4 border-t border-slate-50">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Your Custom Lookbooks ({savedLooks.length})</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {savedLooks.map(look => (
                    <div key={look.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#3b1c24] truncate max-w-[100px]">{look.name}</span>
                        <div className="h-3 w-3 rounded-full border border-slate-200" style={{ backgroundColor: look.nailColor }} />
                      </div>
                      <div className="text-[9px] text-slate-500 space-y-0.5 font-medium">
                        <div>Shape: <span className="text-rose-500 font-bold">{look.nailShape}</span></div>
                        <div>Makeup: <span className="text-pink-500 font-bold">{look.makeupVibe}</span></div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedNailColor(look.nailColor);
                          setSelectedNailShape(look.nailShape);
                          setSelectedMakeupVibe(look.makeupVibe);
                          showToast(`Activated look "${look.name}"!`);
                        }}
                        className="text-[10px] text-center w-full font-bold text-rose-600 hover:text-rose-800 transition-all cursor-pointer bg-white py-1 rounded-md border border-slate-100"
                      >
                        Load Look
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CURATED BEAUTY FORMULAS & PRODUCTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />
                Pure Regional Formulations
              </h3>
              
              <div className="flex items-center gap-1 overflow-x-auto">
                {['all', 'skincare', 'makeup', 'nails', 'hair', 'perfumes'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat as any)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase border cursor-pointer whitespace-nowrap transition-all ${
                      activeCategory === cat 
                        ? 'bg-rose-500 text-white border-rose-500' 
                        : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-rose-100/10 transition-all flex flex-col md:flex-row h-full">
                  <div className="w-full md:w-32 h-32 relative flex-shrink-0">
                    <img referrerPolicy="no-referrer" src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#3b1c24]/90 text-white font-mono text-[9px] font-bold uppercase">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#3b1c24]">{item.title}</h4>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span className="text-[10px] font-bold">{item.rating}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 line-clamp-2">{item.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-[#3b1c24]">{item.price}</span>
                      <button
                        onClick={() => handleBuyProduct(item)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-[10px] font-bold cursor-pointer"
                      >
                        Order via SCUT Pay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BEAUTY TUTORIALS */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
              Interactive Beauty Tutorials
            </h3>

            <AnimatePresence mode="wait">
              {!activeTutorial ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tutorials.map(tut => (
                    <div key={tut.id} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 hover:bg-white transition-all p-3 flex flex-col justify-between space-y-3">
                      <div className="relative rounded-xl overflow-hidden h-28">
                        <img referrerPolicy="no-referrer" src={tut.image} alt={tut.title} className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded-lg text-[9px] font-bold text-slate-600">{tut.time}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md">{tut.difficulty}</span>
                        <h4 className="text-xs font-bold text-[#3b1c24] line-clamp-2 leading-snug">{tut.title}</h4>
                      </div>
                      <button
                        onClick={() => {
                          setActiveTutorial(tut);
                          setCurrentStep(0);
                        }}
                        className="w-full py-2 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all text-[10px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Play className="h-3 w-3 fill-white" />
                        Start Tutorial
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono font-bold text-rose-500 uppercase">{activeTutorial.category} • STEP-BY-STEP</span>
                      <h4 className="text-xs font-bold text-[#3b1c24]">{activeTutorial.title}</h4>
                    </div>
                    <button
                      onClick={() => setActiveTutorial(null)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-1 cursor-pointer bg-slate-50 px-2.5 py-1 rounded-lg"
                    >
                      <ArrowLeft className="h-3 w-3" /> All Tutorials
                    </button>
                  </div>

                  {/* Step progress meter */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex justify-between text-xs font-mono font-medium">
                        <span className="text-slate-400 uppercase tracking-widest text-[9px]">Tutorial Progress</span>
                        <span className="text-rose-500 font-bold">{Math.round(((currentStep + 1) / activeTutorial.steps.length) * 100)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / activeTutorial.steps.length) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Active Step Content */}
                  <div className="p-6 bg-rose-50/20 border border-rose-100/40 rounded-2xl space-y-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-rose-500 text-white font-mono font-bold flex items-center justify-center text-xs">
                        {currentStep + 1}
                      </div>
                      <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Active Instruction</span>
                    </div>
                    <p className="text-xs text-[#3b1c24] font-medium leading-relaxed bg-white p-4 rounded-xl border border-rose-100/20 shadow-sm">
                      {activeTutorial.steps[currentStep]}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                      disabled={currentStep === 0}
                      className="px-4 py-2.5 rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50 transition-all text-xs font-bold disabled:opacity-40"
                    >
                      Previous Step
                    </button>

                    {currentStep < activeTutorial.steps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        className="px-5 py-2.5 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all text-xs font-bold flex items-center gap-1.5"
                      >
                        Next Step <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          showToast(`Finished tutorial! Points rewarded +15 SCUT.`);
                          onAddLog('Beauty Tutorial Completed', `Finished: ${activeTutorial.title}`, 'billing');
                          setActiveTutorial(null);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white transition-all text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 cursor-pointer"
                      >
                        <CheckCircle className="h-4.5 w-4.5" /> Complete Tutorial
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* TRUSTED GLOBAL BEAUTY & SKINCARE SOURCES */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
                Trusted Beauty & Skincare Reference Hub
              </h3>
              <p className="text-[11px] text-[#694e55]">Discover expert beauty tutorials, nail inspiration, skincare routines, and official hairstyles from audited global authorities.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Skincare Routines & Guides",
                  desc: "Clinically validated routines, ingredient analysis, and specific concerns advice.",
                  link: "https://www.paulaschoice.com/skin-care-advice",
                  source: "Paula's Choice Skincare Advice",
                  category: "Skincare"
                },
                {
                  title: "Byrdie Makeup & Nail Trends",
                  desc: "The premier source for makeup inspiration, tutorials, and seasonal nail art.",
                  link: "https://www.byrdie.com/makeup",
                  source: "Byrdie Beauty",
                  category: "Makeup & Nails"
                },
                {
                  title: "Allure Hairstyles & Cuts Guide",
                  desc: "Official hair inspiration, styling techniques, and hair type routines.",
                  link: "https://www.allure.com/hair-ideas",
                  source: "Allure Hair",
                  category: "Hairstyles"
                },
                {
                  title: "Cosmopolitan Beauty Tutorials",
                  desc: "Step-by-step beauty tutorials, cosmetic reviews, and product tests.",
                  link: "https://www.cosmopolitan.com/style-beauty/beauty/",
                  source: "Cosmopolitan Beauty",
                  category: "Tutorials"
                }
              ].map((src, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100/40 flex flex-col justify-between space-y-3 hover:border-rose-300 transition-colors">
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded uppercase tracking-wider">{src.category}</span>
                    <h4 className="text-xs font-bold text-[#3b1c24]">{src.title}</h4>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-light">{src.desc}</p>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-semibold text-slate-400 truncate max-w-[140px]">{src.source}</span>
                    <a 
                      href={src.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1.5 hover:underline"
                    >
                      Verify Source <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-[#3b1c24] text-white rounded-2xl text-[10px] leading-relaxed flex items-start gap-2 font-mono">
              <span className="text-rose-400">⚡</span>
              <span>SCUT network coordinates direct connections to verified public portals. We encourage exploring official resources for scientific formulations.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI BEAUTY & SKIN CLINICIAN */}
        <div className="space-y-8">
          
          {/* AI SKIN DIAGNOSTIC PRE-CHOICES */}
          <div className="bg-gradient-to-br from-[#3b1c24] to-[#1e0e12] rounded-3xl p-6 shadow-2xl text-white space-y-5 relative overflow-hidden border border-rose-950/20">
            <div className="absolute -bottom-12 -left-12 h-28 w-28 bg-pink-500/10 rounded-full filter blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15">
                <Bot className="h-5 w-5 text-rose-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-rose-300 uppercase tracking-widest">Diagnostic Settings</h3>
                <h4 className="text-xs font-bold text-white">AI Diagnostic Assistant</h4>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Your Skin Profile</label>
                <select
                  value={skinType}
                  onChange={e => setSkinType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option className="text-slate-900" value="Combination">Combination Skin</option>
                  <option className="text-slate-900" value="Dry & Flaky">Dry & Flaky Skin</option>
                  <option className="text-slate-900" value="Oily & Acne-Prone">Oily & Acne-Prone Skin</option>
                  <option className="text-slate-900" value="Highly Sensitive">Highly Sensitive Skin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Primary Target Concern</label>
                <select
                  value={skinConcern}
                  onChange={e => setSkinConcern(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option className="text-slate-900" value="Hydration & Brightening">Hydration & Brightening</option>
                  <option className="text-slate-900" value="Fine Lines & Anti-Aging">Fine Lines & Anti-Aging</option>
                  <option className="text-slate-900" value="Acne & Redness Healing">Acne & Redness Healing</option>
                  <option className="text-slate-900" value="Barrier Repair & Calming">Barrier Repair & Calming</option>
                </select>
              </div>
            </div>

            {/* QUICK PRE-PROMPTS */}
            <div className="space-y-2 pt-2">
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider">Ask Quick Advice</span>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  "Draft a 3-step evening routine",
                  "What triggers my combination skin?",
                  "Best organic face oils for winter"
                ].map((txt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setAiPrompt(txt);
                    }}
                    className="text-[10px] text-left px-3 py-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-200 transition-all cursor-pointer"
                  >
                    {txt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CHAT DISPLAY */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_15px_45px_rgba(243,212,217,0.1)] flex flex-col justify-between h-[380px]">
            <div className="overflow-y-auto space-y-3.5 pr-1 flex-1 scrollbar-thin">
              {aiChat.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-rose-500 text-white rounded-tr-none' 
                      : 'bg-slate-50 border border-slate-100 text-[#3b1c24] rounded-tl-none font-medium'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 text-slate-400 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Athena is analyzing routine parameters...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleAskAi} className="pt-3 border-t border-slate-100 mt-3 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask Athena about skin, hair, makeup, or perfumes..."
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-[#3b1c24] focus:outline-none focus:ring-1 focus:ring-rose-200"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="p-2.5 rounded-xl bg-[#3b1c24] hover:bg-black text-white transition-all cursor-pointer disabled:opacity-40"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
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
