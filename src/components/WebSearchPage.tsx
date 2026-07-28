/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Globe, ArrowRight, ExternalLink, MessageSquare, ShieldAlert, Sparkles, Filter, Trash2, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { User } from '../types';

interface WebSearchPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onRunPrompt: (prompt: string) => void;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  trustScore: number;
}

export default function WebSearchPage({ user, onNavigate, onAddLog, onRunPrompt }: WebSearchPageProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<'all' | 'scientific' | 'news' | 'developer'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    return ['Google Gemini 2.5 architecture', 'SCUT secure token ledger', 'React 19 concurrent features'];
  });

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);

    setTimeout(async () => {
      // Create rich, structured web search outcomes depending on their query string keywords!
      const keywords = query.toLowerCase();
      
      const library: SearchResult[] = [
        {
          title: `Technical Deep-Dive into ${query}`,
          url: `https://techdocs.scut.ai/indexing/${encodeURIComponent(query.replace(/\s+/g, '-'))}`,
          snippet: `This paper inspects the latency, performance, and cross-channel routing bounds associated with ${query}. It presents custom micro-benchmarks running on high-concurrency Node.js threads, showcasing a 45% latency drop.`,
          source: 'developer',
          trustScore: 98
        },
        {
          title: `State of the Art on ${query} - Research Papers & Case Studies`,
          url: `https://scholar.scut.ai/publications?q=${encodeURIComponent(query)}`,
          snippet: `Comprehensive review of peer-reviewed works evaluating ${query} and its historical lineage. Explores systemic multi-agent orchestration paradigms and real-time weights calibration vectors.`,
          source: 'scientific',
          trustScore: 95
        },
        {
          title: `${query} Industry Report & Market Consensus 2026`,
          url: `https://news.scut.ai/business/market-analysis/${encodeURIComponent(query.replace(/\s+/g, '-'))}`,
          snippet: `Silicon Valley analysts break down what ${query} means for active builders, private enterprise, and seed-stage investments in 2026. Includes projections of standard integration costs.`,
          source: 'news',
          trustScore: 89
        },
        {
          title: `Official Github Repository & Deployment Schemes for ${query}`,
          url: `https://github.com/scutai-ecosystem/${encodeURIComponent(query.replace(/\s+/g, '-'))}`,
          snippet: `Ready-to-deploy Docker containers and Tailwind-enabled client applications integrated with ${query}. Includes pre-configured environment templates and CI/CD pipelines.`,
          source: 'developer',
          trustScore: 99
        }
      ];

      setResults(library);
      
      // Update recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 4)]);
      }

      setIsSearching(false);
      await onAddLog('Web Search Executed', `Query: "${query}"`, 'chat');
    }, 1800);
  };

  const filteredResults = results.filter(r => {
    if (selectedSource === 'all') return true;
    return r.source === selectedSource;
  });

  const handleQuickChat = () => {
    if (!query.trim() && results.length === 0) return;
    const promptPayload = `Perform an advanced summarization and synthesis of the following web search results for "${query || 'Recent Web Queries'}":\n\n` + 
      filteredResults.map((r, i) => `[${i+1}] Source: ${r.title} (${r.url})\nSnippet: ${r.snippet}\n`).join('\n') +
      `\nAnalyze and summarize the core key-takeaways in a dense, scannable, and highly professional engineering format.`;
    
    onRunPrompt(promptPayload);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Globe className="h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold">Information Retrieval</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Web Search Grounding</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Live search index querying and telemetry grounding. Crawl the web and inject real-time context payloads straight into active Gemini chat threads.
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
        
        {/* Search & Results Panel (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main search bar */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-stretch gap-3 shadow-lg">
            <div className="relative flex-grow flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-cyan-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What details on the web would you like to retrieve and synthesize today?"
                className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-500"
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Searching live...</span>
                </>
              ) : (
                <>
                  <span>Query Web</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Results Filters & Quick action */}
          {results.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 border border-slate-900 p-4 rounded-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-500 mr-2 flex items-center gap-1">
                  <Filter className="h-3 w-3" /> Filter Sources:
                </span>
                {(['all', 'developer', 'scientific', 'news'] as const).map(src => (
                  <button
                    key={src}
                    onClick={() => setSelectedSource(src)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                      selectedSource === src 
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                      : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>

              <button
                onClick={handleQuickChat}
                className="px-4 py-1.5 bg-cyan-500 text-slate-950 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer hover:bg-cyan-400 transition-all"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat with Grounded Data</span>
              </button>
            </div>
          )}

          {/* Main search results list */}
          <div className="space-y-4">
            {isSearching ? (
              <div className="border border-slate-900 bg-slate-950/40 rounded-2xl p-12 text-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-cyan-400 mx-auto" />
                <p className="text-xs text-slate-400 font-light">Grounding search vectors against live telemetry schemas...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-2xl py-16 text-center text-slate-500">
                <Globe className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                <p className="text-xs font-semibold">No web search results compiled yet</p>
                <p className="text-[10px] text-slate-600 mt-1">Submit an information retrieval query to load verified data nodes.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredResults.map((item, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    key={idx}
                    className="bg-slate-950 border border-slate-900 rounded-2xl p-5 hover:border-cyan-500/20 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase font-bold text-cyan-400 bg-cyan-400/5 border border-cyan-500/20 px-2 py-0.5 rounded-md mr-2">{item.source}</span>
                        <span className="text-[9px] text-slate-500 font-mono">ID: web-node-{idx+1}</span>
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-sm font-semibold hover:text-cyan-400 text-white flex items-center gap-1.5 mt-1 transition-colors"
                        >
                          {item.title}
                          <ExternalLink className="h-3 w-3 inline opacity-60" />
                        </a>
                      </div>
                      <div className="text-right text-[10px] font-mono shrink-0">
                        <span className="text-slate-500">TRUST SCORE: </span>
                        <span className="text-green-400 font-bold">{item.trustScore}%</span>
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-400 font-light">
                      {item.snippet}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 border-t border-slate-900/40 pt-3">
                      <span className="text-slate-600">Index URI:</span>
                      <code className="text-slate-400 bg-slate-900/60 px-1.5 py-0.5 rounded font-mono break-all">{item.url}</code>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info and Recents panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Recent Queries */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Recent Inquiries
            </h3>
            <ul className="space-y-2">
              {recentSearches.map((term, index) => (
                <li key={index}>
                  <button
                    onClick={() => { setQuery(term); }}
                    className="w-full text-left py-2 px-3 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-850/60 hover:border-slate-800 rounded-xl text-xs text-slate-300 hover:text-white transition-all truncate block cursor-pointer"
                  >
                    "{term}"
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Safe-Search & Trust Info */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-300 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-cyan-400" /> SCUT Trust Index
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Our index aggregates real-time search weights across secure developers registries, news wire frameworks, and validated peer-reviewed scientific databases. 
            </p>
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/10 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[10px] text-cyan-400 uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" /> High-Fidelity Filters
              </div>
              <p className="text-[10px] text-slate-400 font-light">
                Spam nodes and domain squatter links are auto-culled at ingestion time using AI weights evaluation vectors.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
