/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, Languages, Check, HelpCircle, ArrowRight, Sparkles, 
  RefreshCw, Cpu, CheckCircle, Search
} from 'lucide-react';

interface MultilingualPageProps {
  currentLanguage: 'en' | 'ro' | 'es' | 'zh' | 'de';
  onLanguageChange: (lang: 'en' | 'ro' | 'es' | 'zh' | 'de') => void;
  onNavigate: (page: string) => void;
}

export default function MultilingualPage({ currentLanguage, onLanguageChange, onNavigate }: MultilingualPageProps) {
  const [selectedLang, setSelectedLang] = useState<'en' | 'ro' | 'es' | 'zh' | 'de'>(currentLanguage);
  const [simText, setSimText] = useState('Welcome to the SCUT AI platform. All active nodes are operating securely.');
  const [isTranslating, setIsTranslating] = useState(false);
  const [transOutput, setTransOutput] = useState<string | null>(null);

  const availableLanguages = [
    { code: 'en', label: 'English (US)', region: 'Global Host', activeNodes: 24, status: 'Optimal' },
    { code: 'ro', label: 'Română (Romanian)', region: 'Bucharest Node', activeNodes: 12, status: 'Optimal' },
    { code: 'es', label: 'Español (Spanish)', region: 'Madrid Node', activeNodes: 18, status: 'Optimal' },
    { code: 'zh', label: '中文 (Simplified Chinese)', region: 'Hong Kong Node', activeNodes: 28, status: 'Optimal' },
    { code: 'de', label: 'Deutsch (German)', region: 'Frankfurt Node', activeNodes: 16, status: 'Optimal' }
  ];

  const translationsSim = {
    en: 'Welcome to the SCUT AI platform. All active nodes are operating securely.',
    ro: 'Bine ați venit pe platforma SCUT AI. Toate nodurile active funcționează în condiții de siguranță.',
    es: 'Bienvenido a la plataforma SCUT AI. Todos los nodos activos funcionan de forma segura.',
    zh: '欢迎来到 SCUT AI 平台。所有活动节点均在安全运行。',
    de: 'Willkommen auf der SCUT AI Plattform. Alle aktiven Knoten arbeiten sicher.'
  };

  const handleApplyGlobalLanguage = (code: 'en' | 'ro' | 'es' | 'zh' | 'de') => {
    setSelectedLang(code);
    onLanguageChange(code);
    alert(`Ecosystem system-wide localization updated to: ${code.toUpperCase()}`);
  };

  const handleTranslateSandbox = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText) return;
    setIsTranslating(true);
    setTransOutput(null);

    setTimeout(() => {
      setIsTranslating(false);
      // Give simulated translations or back-translate based on selected option
      const translated = translationsSim[selectedLang] || simText;
      setTransOutput(translated);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Global Routing</span>
              <span className="text-[10px] font-mono text-slate-500">Service: Loc-Gateway-v2</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <Languages className="h-8 w-8 text-cyan-400" />
              Global Multilingual Support
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              Configure system-wide language nodes, customize real-time transcription, and map localized context structures.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('settings')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer"
            >
              System Settings
            </button>
          </div>
        </div>

        {/* INTERACTIVE CONTROLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* SYSTEM LOCATIONS RACK (LEFT) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-900 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-cyan-400" /> Localization Clusters
                </h2>
                <span className="text-[10px] font-mono text-slate-500">Active: 5 regions</span>
              </div>

              <div className="space-y-3">
                {availableLanguages.map((lang) => {
                  const isCurrent = currentLanguage === lang.code;
                  return (
                    <div 
                      key={lang.code}
                      onClick={() => handleApplyGlobalLanguage(lang.code as any)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center group ${
                        isCurrent 
                          ? 'bg-cyan-500/10 border-cyan-500/25 text-white' 
                          : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{lang.label}</span>
                          <span className="text-[8px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded uppercase tracking-wider">{lang.code}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono">{lang.region} — {lang.activeNodes} Nodes Active</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {lang.status}
                        </span>
                        {isCurrent && (
                          <div className="h-5 w-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* REAL-TIME TRANSLATOR SANDBOX (RIGHT) */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" /> Real-time Translation Sandbox
                </h2>
                <p className="text-slate-400 text-[11px] font-light mt-0.5">
                  Test prompt translations between English and your active global localization language cluster.
                </p>
              </div>

              <form onSubmit={handleTranslateSandbox} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[11px] font-mono">
                    <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block mb-1">Source Cluster</span>
                    <span>English (US) [Global Hub]</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 text-[11px] font-mono flex justify-between items-center">
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[9px] tracking-wider block mb-1">Target Cluster</span>
                      <span className="text-cyan-400 font-bold">{availableLanguages.find(l => l.code === selectedLang)?.label}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Input Text</label>
                  <textarea 
                    rows={4}
                    required
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs leading-relaxed text-white transition-all outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isTranslating}
                  className="px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-900 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isTranslating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Routing Gateway...
                    </>
                  ) : (
                    'Simulate Global Translation'
                  )}
                </button>
              </form>

              {/* TRANSLATION RESPONSE */}
              {transOutput && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-900 space-y-3 font-mono">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> Translation Node Synchronized
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    {transOutput}
                  </p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
