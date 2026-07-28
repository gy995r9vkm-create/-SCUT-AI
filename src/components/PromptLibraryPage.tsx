/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bookmark, Search, Cpu, ArrowUpRight, Copy, Terminal, Star, Sparkles, Filter, ChevronRight, Check } from 'lucide-react';
import { User, SavedPrompt } from '../types';

interface PromptLibraryPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onRunPrompt: (prompt: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface CustomPromptPreset {
  id: string;
  title: string;
  category: 'engineering' | 'business' | 'creative' | 'legal' | 'science';
  description: string;
  prompt: string;
  isStared?: boolean;
}

export default function PromptLibraryPage({ user, onNavigate, onRunPrompt, onAddLog }: PromptLibraryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'engineering' | 'business' | 'creative' | 'legal' | 'science'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [presets, setPresets] = useState<CustomPromptPreset[]>([
    {
      id: 'pr-1',
      title: 'Advanced API Refactoring Co-Pilot',
      category: 'engineering',
      description: 'Refactor Express/TypeScript endpoint routing logic, adding clean error schemas and response payloads.',
      prompt: 'Refactor the following Express and TypeScript router endpoints. Inject comprehensive try-catch statements, structured JSON error bodies matching standard RFC-7807, and type-safe response schemas. Keep logic strictly modular:\n\n[INSERT CODE HERE]'
    },
    {
      id: 'pr-2',
      title: 'Dense Financial Trend Synthesizer',
      category: 'business',
      description: 'Analyze raw corporate ledger logs and synthesize projections, key risk drivers, and margin models.',
      prompt: 'Analyze the following quarterly ledger statements. Extrapolate standard margin metrics, identify the top three operational overhead cost drivers, and output a structured financial table containing a bull, neutral, and bear projection model for the upcoming quarter:\n\n[INSERT LEDGER DATA]'
    },
    {
      id: 'pr-3',
      title: 'Creative Brand Metaphor Orchestrator',
      category: 'creative',
      description: 'Synthesize memorable visual metaphors and messaging blueprints for early stage tech offerings.',
      prompt: 'Generate five memorable brand metaphors and accompanying messaging blueprints for a new tech product. Focus on simple, humble, and literal associations. Avoid low-quality sales-pitch phrases or bloated copy:\n\n[INSERT PRODUCT BRIEF]'
    },
    {
      id: 'pr-4',
      title: 'Regulatory Audit Compliance Scanner',
      category: 'legal',
      description: 'Examine policy terms sheets for data residency conflicts or excessive user tracking declarations.',
      prompt: 'Review this regulatory policy contract against European GDPR framework rules. Specifically flag any data residency telemetry clauses, third-party trackers with missing consent controls, or high-risk privacy liabilities:\n\n[INSERT TERMS CONTRACT]'
    },
    {
      id: 'pr-5',
      title: 'Quantum Mechanical Latency Assessor',
      category: 'science',
      description: 'Simulate high-concurrency routing and compute execution times using quantum logic state nodes.',
      prompt: 'Simulate the algorithmic execution delays and packet collisions when scaling compute queues through quantum logic state registers. Highlight maximum coherence timelines and decoherence ratios:\n\n[INSERT SPECIFICATIONS]'
    }
  ]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRun = async (promptText: string, title: string) => {
    onRunPrompt(promptText);
    await onAddLog('Prompt Executed', `Ran preset template: "${title}"`, 'chat');
  };

  const filteredPresets = presets.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Bookmark className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Prompt Engineering</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Prompt Library</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            A curated catalog of enterprise prompt systems. Streamline your micro-routing contexts with pre-tested weights templates.
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
        
        {/* Left Categories Selector (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Filter className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">Catalog Filters</h2>
          </div>

          <div className="flex flex-col gap-1.5">
            {(['all', 'engineering', 'business', 'creative', 'legal', 'science'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full py-2.5 px-3 rounded-xl border text-left text-xs capitalize font-bold transition-all cursor-pointer flex items-center justify-between ${
                  activeCategory === cat 
                  ? 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400' 
                  : 'border-transparent text-slate-400 hover:bg-slate-900/60 hover:text-slate-300'
                }`}
              >
                <span>{cat}</span>
                <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Search, Catalog Grid & Parameters (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Prompt search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompt templates, system instructions, and roles presets..."
              className="w-full bg-slate-950 border border-slate-900 rounded-2xl pl-10 pr-4 py-3.5 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-500 shadow-md"
            />
          </div>

          {/* Catalog presets cards */}
          <div className="space-y-4">
            {filteredPresets.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-2xl py-16 text-center text-slate-500">
                <Bookmark className="h-10 w-10 mx-auto text-slate-800 mb-3" />
                <p className="text-xs font-semibold">No preset templates matched</p>
                <p className="text-[10px] text-slate-600 mt-1">Refine your search terms or select another catalog category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPresets.map(preset => (
                  <div
                    key={preset.id}
                    className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-cyan-500/20 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/5 border border-cyan-500/15 text-[9px] uppercase font-bold text-cyan-400">
                            {preset.category}
                          </span>
                          <span className="text-[9px] text-slate-600 font-mono">PRESET: {preset.id}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(preset.id, preset.prompt)}
                            className="p-1.5 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-850 cursor-pointer transition-all flex items-center gap-1"
                            title="Copy parameters"
                          >
                            {copiedId === preset.id ? (
                              <Check className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                            <span className="text-[9px] font-bold uppercase">{copiedId === preset.id ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-white">{preset.title}</h3>
                      <p className="text-xs text-slate-400 font-light leading-relaxed">{preset.description}</p>
                    </div>

                    {/* Pre-formatted text area preview */}
                    <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-400 max-h-24 overflow-y-auto leading-relaxed select-text scrollbar-thin">
                      {preset.prompt}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-900/40">
                      <button
                        onClick={() => handleRun(preset.prompt, preset.title)}
                        className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-display font-bold flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>Deploy in Chat</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
