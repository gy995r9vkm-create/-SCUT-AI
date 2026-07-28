/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Search, Sparkles, BookOpen, Zap, ShieldCheck, 
  HelpCircle, MessageSquare, AlertTriangle, ChevronRight, Play, 
  CheckCircle2, Circle, ArrowRight, ExternalLink, RefreshCw, Send,
  Cpu, Wallet, ShoppingBag, Heart, Shield, Terminal, Database, 
  User, Settings, BarChart3, Image, Mic, Folder, Trophy, Award, 
  Info, LifeBuoy, Mail, Video, Code, Lock, Layers, Sliders, ChevronDown
} from 'lucide-react';
import { HELP_GUIDES, HelpGuideData } from './HelpGuides';
import VideoSearchSection from './VideoSearchSection';

interface ScutAcademyPageProps {
  onNavigate: (page: string) => void;
  initialModule?: string;
}

interface TutorialStep {
  id: string;
  title: string;
  desc: string;
  actionHint?: string;
}

interface TroubleshootingItem {
  symptom: string;
  cause: string;
  solution: string;
  codeSnippet?: string;
}

// Module metadata array covering all 21 requested modules
export const ACADEMY_MODULES = [
  { id: 'chat', name: 'SCUT AI', category: 'Core AI', icon: Sparkles, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'scutpay', name: 'SCUT Pay', category: 'Finance', icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'marketplace', name: 'Marketplace', category: 'Commerce', icon: ShoppingBag, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'scutchat', name: 'Community & Chat', category: 'Social', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'scutwomen', name: 'SCUT Women & Girls', category: 'Social', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'scutmen', name: 'SCUT Men & Boys', category: 'Social', icon: Shield, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'business', name: 'Business Portal', category: 'Enterprise', icon: Layers, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'dashboard', name: 'Dashboard', category: 'Core', icon: Database, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'wallet', name: 'Wallet', category: 'Finance', icon: Wallet, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'seller_studio', name: 'Seller Studio', category: 'Commerce', icon: ShoppingBag, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'developers', name: 'Developer Center', category: 'Dev', icon: Terminal, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'support_center', name: 'Support Center', category: 'Support', icon: LifeBuoy, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'profile', name: 'Profile Settings', category: 'Core', icon: User, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'admin', name: 'Admin Panel', category: 'Core', icon: Shield, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { id: 'sports_hub', name: 'Sports Hub', category: 'Social', icon: Trophy, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'rewards', name: 'Rewards', category: 'Finance', icon: Award, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { id: 'analytics', name: 'Analytics', category: 'Enterprise', icon: BarChart3, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: 'messages', name: 'Messages', category: 'Social', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { id: 'notifications', name: 'Notifications', category: 'Core', icon: Info, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  { id: 'micabucurie', name: 'Mica Bucurie', category: 'Social', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  { id: 'settings', name: 'System Settings', category: 'Core', icon: Settings, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
];

// Rich interactive step tutorials per module
const MODULE_TUTORIALS: Record<string, TutorialStep[]> = {
  chat: [
    { id: 'c1', title: 'Initialize Workspace Thread', desc: 'Click the "+" icon or navigate to SCUT AI to launch a fresh prompt context.', actionHint: 'Select Gemini 3.5 Flash for high-speed queries.' },
    { id: 'c2', title: 'Formulate Context-Rich Prompt', desc: 'Specify target programming language, input constraints, and desired output format.', actionHint: 'Use triple backticks ``` for markdown code formatting.' },
    { id: 'c3', title: 'Organize into Prompt Folders', desc: 'Tag your conversation threads into custom folders for instant retrieval.', actionHint: 'Star your favorite threads for quick sidebar access.' }
  ],
  scutpay: [
    { id: 'p1', title: 'Verify Wallet Ledger Balance', desc: 'Inspect available credit and token balances on the SCUT Pay dashboard.', actionHint: 'Ensure account authentication tier is active.' },
    { id: 'p2', title: 'Execute Secure Deposit', desc: 'Select standard credit pack or top up via Stripe card checkout.', actionHint: 'Promotional vouchers roll over automatically.' },
    { id: 'p3', title: 'Issue Payment Request', desc: 'Generate instant invoice link or QR address code for external peer payouts.', actionHint: 'Invoices include automatic tax auditing fields.' }
  ],
  marketplace: [
    { id: 'm1', title: 'Browse Product Listings', desc: 'Filter products by category (Prompts, AI Apps, Design Assets, Datasets).', actionHint: 'Check merchant verification badges and rating scores.' },
    { id: 'm2', title: 'Add to Cart or One-Click Buy', desc: 'Add desired items to your cart or purchase immediately using SCUT Credits.', actionHint: 'Cart balances persist across sessions.' },
    { id: 'm3', title: 'Download & Deploy Assets', desc: 'Extract digital zip files or copy prompt definitions directly into SCUT AI.', actionHint: 'Static analysis guarantees malware-free code.' }
  ],
  developers: [
    { id: 'd1', title: 'Mint New System API Key', desc: 'Navigate to Developer Center and click "Generate API Key".', actionHint: 'Copy key immediately; display is restricted post-generation.' },
    { id: 'd2', title: 'Configure Request Headers', desc: 'Include Bearer authorization header in your server HTTP requests.', actionHint: 'Default endpoint rate limit is set to 60 req/min.' },
    { id: 'd3', title: 'Test Stream Connection', desc: 'Send a curl test payload to verify real-time streaming response latency.', actionHint: 'Inspect live telemetry on the Analytics page.' }
  ]
};

// Rich Troubleshooting guides per module
const MODULE_TROUBLESHOOTING: Record<string, TroubleshootingItem[]> = {
  chat: [
    {
      symptom: 'Model Response Truncated or Cut Off Mid-Sentence',
      cause: 'Token limit reached or network socket buffer filled.',
      solution: 'Ask the assistant to "Continue from last line" or decrease input prompt length.',
      codeSnippet: 'prompt: "Continue generation from: [last sentence]"'
    },
    {
      symptom: 'Slow First Byte Response Time (> 2 seconds)',
      cause: 'High backend GPU queue traffic or complex reasoning mode enabled.',
      solution: 'Switch active model weight preset from Pro to Flash for sub-50ms execution.'
    }
  ],
  scutpay: [
    {
      symptom: 'Deposit Credit Not Reflected After Card Checkout',
      cause: 'Stripe webhook synchronization delay or pending bank clearance.',
      solution: 'Click "Refresh Balance Ledger" or check your email invoice receipt.',
      codeSnippet: 'window.dispatchEvent(new Event("scut_balance_updated"))'
    }
  ],
  developers: [
    {
      symptom: 'HTTP 429 Rate Limit Exceeded',
      cause: 'More than 60 requests sent in a 60-second window on standard tier.',
      solution: 'Implement exponential backoff retry algorithms or upgrade to Business API tier.',
      codeSnippet: 'await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));'
    }
  ]
};

export default function ScutAcademyPage({ onNavigate, initialModule = 'chat' }: ScutAcademyPageProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(initialModule);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'guides' | 'tutorials' | 'walkthrough' | 'faq' | 'troubleshooting' | 'ai_assistant'>('guides');
  
  // Interactive tutorial stepper progress state
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  
  // Interactive Walkthrough state
  const [simulatorInput, setSimulatorInput] = useState('');
  const [simulatorOutput, setSimulatorOutput] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // AI Assistant Q&A state inside Academy
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string; time: string }>>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Video Mock Player State
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const selectedModule = useMemo(() => {
    return ACADEMY_MODULES.find(m => m.id === selectedModuleId) || ACADEMY_MODULES[0];
  }, [selectedModuleId]);

  const guideData: HelpGuideData | undefined = HELP_GUIDES[selectedModuleId] || HELP_GUIDES['chat'];

  // Tutorials for active module
  const currentTutorials = MODULE_TUTORIALS[selectedModuleId] || [
    { id: 'gen1', title: `Get Started with ${selectedModule.name}`, desc: `Follow step-by-step instructions to configure and master the ${selectedModule.name} module.`, actionHint: 'Ensure your account session is authenticated.' },
    { id: 'gen2', title: 'Configure Primary Settings', desc: 'Set up preferences, notifications, and security options for optimal performance.', actionHint: 'Save changes in System Settings.' },
    { id: 'gen3', title: 'Master Advanced Features', desc: 'Utilize enterprise tools, keyboard shortcuts, and API integrations.', actionHint: 'Check Developer Documentation for API schemas.' }
  ];

  // Troubleshooting for active module
  const currentTroubleshooting = MODULE_TROUBLESHOOTING[selectedModuleId] || [
    {
      symptom: `Unexpected Error in ${selectedModule.name}`,
      cause: 'Stale browser session state or missing permissions.',
      solution: 'Refresh your active browser session or re-authenticate in Profile Settings.',
      codeSnippet: 'localStorage.clear(); window.location.reload();'
    },
    {
      symptom: 'Interface Elements Not Updating in Real Time',
      cause: 'Local WebSocket or event channel disconnected.',
      solution: 'Click the refresh icon on the top right or check system network status.'
    }
  ];

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulatorOutput(null);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulatorOutput(`[ACADEMY SIMULATOR OUTPUT - ${selectedModule.name.toUpperCase()}]\nStatus: OK (200)\nExecution Time: 38ms\nInput Processed: "${simulatorInput || 'Standard diagnostic payload'}"\nResult: Verified functional routing & state synchronization complete!`);
    }, 1200);
  };

  const handleAskAiAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const qText = aiQuestion;
    setAiQuestion('');
    setIsAiThinking(true);

    setTimeout(() => {
      setIsAiThinking(false);
      let answer = `Regarding **${selectedModule.name}**: `;
      if (qText.toLowerCase().includes('how') || qText.toLowerCase().includes('start')) {
        answer += `To start with ${selectedModule.name}, follow the Quick Start steps. Navigate to the module via the top directory bar, verify your account preferences, and use standard defaults.`;
      } else if (qText.toLowerCase().includes('cost') || qText.toLowerCase().includes('credit') || qText.toLowerCase().includes('pay')) {
        answer += `${selectedModule.name} uses standard SCUT Credits. You can check your remaining balance in the top header or top up inside SCUT Pay.`;
      } else if (qText.toLowerCase().includes('api') || qText.toLowerCase().includes('code') || qText.toLowerCase().includes('dev')) {
        answer += `You can integrate ${selectedModule.name} programmatically using your developer API key. Check the Developer Center tab for full OpenAPI specifications and SDK code snippets.`;
      } else {
        answer += `The ${selectedModule.name} module is fully optimized for speed, end-to-end security, and seamless cross-platform syncing. For further details, refer to the Beginner & Advanced guides above or submit a support ticket.`;
      }

      setAiAnswers(prev => [
        { q: qText, a: answer, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev
      ]);
    }, 1200);
  };

  // Filter modules based on search query
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return ACADEMY_MODULES;
    const q = searchQuery.toLowerCase();
    return ACADEMY_MODULES.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.category.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const ModuleIcon = selectedModule.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-20 px-4 sm:px-6 lg:px-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING & GLOBAL SEARCH */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-900 pb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
                SCUT Academy Official
              </span>
              <span className="text-[10px] font-mono text-slate-500">v2026.7.22 • 21 Modules Active</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white mt-2 tracking-tight flex items-center gap-3">
              Comprehensive Platform Documentation & Masterclass
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-light mt-1.5 max-w-3xl leading-relaxed">
              Master every component of the SCUT AI ecosystem. Explore quick start guides, step-by-step tutorials, interactive feature simulators, FAQs, troubleshooting steps, and live AI support.
            </p>
          </div>

          <div className="w-full lg:w-80 space-y-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search all 21 module manuals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-lg"
              />
            </div>
          </div>
        </div>

        {/* MODULE SELECTOR GRID / HORIZONTAL SCROLLER */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>Select Ecosystem Module ({filteredModules.length})</span>
            <span className="text-[10px] text-cyan-400 font-bold">Contextual Academy Active</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              const isSelected = selectedModuleId === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                    isSelected 
                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/50' 
                      : 'bg-slate-900/50 border-slate-850 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-1.5 rounded-xl border ${mod.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase">{mod.category}</span>
                  </div>
                  <span className="text-xs font-bold tracking-tight truncate mt-2">{mod.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE MODULE ACADEMY HERO */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-850 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-850 pb-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl border ${selectedModule.color} shrink-0`}>
                <ModuleIcon className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded">
                    {selectedModule.category} Module
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Verified Guide</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white mt-1">
                  {guideData?.title || `${selectedModule.name} Guide`}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {guideData?.subtitle || `Official SCUT Academy Manual for ${selectedModule.name}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onNavigate(selectedModule.id)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-bold text-xs hover:from-cyan-300 hover:to-teal-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10"
              >
                <span>Launch {selectedModule.name}</span>
                <ExternalLink className="h-4 w-4" />
              </button>
              <button 
                onClick={() => onNavigate('contact')}
                className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="h-4 w-4 text-cyan-400" />
                <span>Contact Support</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light bg-slate-950/60 border border-slate-850/80 p-4 rounded-2xl">
            {guideData?.description || `The ${selectedModule.name} module provides high-performance tools designed specifically for the SCUT AI ecosystem.`}
          </p>

          {/* MAIN TABS NAVIGATION */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-850 scrollbar-thin">
            {[
              { id: 'guides', label: 'Guides & Quick Start', icon: BookOpen },
              { id: 'tutorials', label: 'Step-by-Step Tutorials', icon: CheckCircle2 },
              { id: 'walkthrough', label: 'Interactive Walkthrough', icon: Zap },
              { id: 'faq', label: 'FAQ & Best Practices', icon: Info },
              { id: 'troubleshooting', label: 'Troubleshooting & Errors', icon: AlertTriangle },
              { id: 'ai_assistant', label: 'Academy AI Assistant', icon: Sparkles }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all border cursor-pointer ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold shadow-sm shadow-cyan-500/10' 
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="min-h-[360px] text-xs">
            
            {/* 1. GUIDES & QUICK START */}
            {activeTab === 'guides' && (
              <div className="space-y-8">
                
                {/* QUICK START STEPPERS */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Play className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                    Quick Start Checklist
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(guideData?.quickStart || [
                      'Open the module from your dashboard.',
                      'Configure your initial parameters.',
                      'Save changes and begin operations.'
                    ]).map((step, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-2 relative">
                        <span className="font-mono text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded">
                          STEP 0{idx + 1}
                        </span>
                        <p className="text-slate-200 font-medium leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BEGINNER & ADVANCED DUAL PANELS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Beginner Guide */}
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                      <div className="h-7 w-7 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">A</div>
                      <div>
                        <h4 className="text-sm font-bold text-emerald-400">{guideData?.beginnerGuide.title || 'Beginner Foundations'}</h4>
                        <span className="text-[10px] font-mono text-slate-500">Core Concepts & Basic Workflow</span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {(guideData?.beginnerGuide.steps || ['Initialize workspace', 'Input prompt', 'Review results']).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                          <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Advanced Guide */}
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                      <div className="h-7 w-7 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">B</div>
                      <div>
                        <h4 className="text-sm font-bold text-cyan-400">{guideData?.advancedGuide.title || 'Advanced Masterclass'}</h4>
                        <span className="text-[10px] font-mono text-slate-500">Power Features & API Controls</span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {(guideData?.advancedGuide.steps || ['Configure system keys', 'Optimize stream buffers', 'Export telemetry logs']).map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-slate-300 leading-relaxed">
                          <ChevronRight className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* VIDEO MOCK PREVIEW PLAYER & ARCHITECTURE DIAGRAM */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Video Mock Card */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-4 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Video className="h-4 w-4 text-cyan-400" />
                        <span>Interactive Video Tutorial: Masterclass</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Duration: 04:15 • 1080p HD</span>
                    </div>

                    <div className="aspect-video bg-slate-900 border border-slate-800 rounded-xl relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 to-slate-950/80 pointer-events-none" />
                      
                      {isPlayingVideo ? (
                        <div className="p-6 text-center space-y-3 z-10">
                          <div className="h-10 w-10 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-400 flex items-center justify-center mx-auto animate-spin">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <p className="text-xs font-mono text-cyan-400 font-bold">Streaming SCUT Academy Video Feed...</p>
                          <p className="text-[10px] text-slate-400">Rendering real-time screen capture for {selectedModule.name}</p>
                          <button 
                            onClick={() => setIsPlayingVideo(false)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-mono cursor-pointer"
                          >
                            Pause Preview
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setIsPlayingVideo(true)}
                          className="h-14 w-14 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center transition-all shadow-xl shadow-cyan-400/20 cursor-pointer group-hover:scale-110 z-10"
                        >
                          <Play className="h-6 w-6 fill-slate-950 ml-0.5" />
                        </button>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] font-mono text-slate-400 z-10">
                        <span>Chapter 1: Getting Started with {selectedModule.name}</span>
                        <span>01:24 / 04:15</span>
                      </div>
                    </div>
                  </div>

                  {/* Architecture Diagram Box */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-850 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <Layers className="h-4 w-4 text-cyan-400" />
                        <span>System Architecture Diagram</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Zero-Latency Flow</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 font-mono text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <span>Client React UI Layer</span>
                        <span className="text-cyan-400 font-bold">State Managed</span>
                      </div>
                      <div className="text-center text-slate-600 text-[10px]">↓ Encrypted WebSockets / HTTPS Tunnel</div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <span>Express Proxy Server</span>
                        <span className="text-emerald-400 font-bold">Port 3000 Ingress</span>
                      </div>
                      <div className="text-center text-slate-600 text-[10px]">↓ Authenticated SDK Dispatch</div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        <span>Firestore & Gemini Engine</span>
                        <span className="text-purple-400 font-bold">AES-256 Lock</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 2. STEP-BY-STEP TUTORIALS */}
            {activeTab === 'tutorials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Interactive Step-by-Step Stepper</h3>
                    <p className="text-slate-400 text-[11px]">Track your progress as you complete the learning steps for {selectedModule.name}.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      {Object.keys(completedSteps).filter(k => k.startsWith(selectedModuleId) && completedSteps[k]).length} / {currentTutorials.length} Completed
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentTutorials.map((tut, idx) => {
                    const stepKey = `${selectedModuleId}_${tut.id}`;
                    const isDone = !!completedSteps[stepKey];
                    return (
                      <div 
                        key={tut.id}
                        onClick={() => toggleStepCompletion(stepKey)}
                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                          isDone 
                            ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200' 
                            : 'bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-600 shrink-0" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${isDone ? 'text-emerald-400 line-through' : 'text-white'}`}>
                              Step {idx + 1}: {tut.title}
                            </h4>
                            {tut.actionHint && (
                              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded">
                                {tut.actionHint}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{tut.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. INTERACTIVE WALKTHROUGH SIMULATOR */}
            {activeTab === 'walkthrough' && (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      Live Feature Simulator: {selectedModule.name}
                    </h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Test module outputs and verify execution behaviors directly inside this interactive sandbox.
                    </p>
                  </div>

                  <form onSubmit={handleRunSimulator} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        Simulator Input Parameter
                      </label>
                      <input 
                        type="text" 
                        placeholder={`e.g. Test query or payload for ${selectedModule.name}...`}
                        value={simulatorInput}
                        onChange={(e) => setSimulatorInput(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSimulating}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-cyan-500/10 disabled:opacity-50"
                    >
                      {isSimulating ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-slate-950" />
                          <span>Executing Sandbox Request...</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 fill-slate-950" />
                          <span>Run Module Simulation</span>
                        </>
                      )}
                    </button>
                  </form>

                  {simulatorOutput && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs text-emerald-400"
                    >
                      <pre className="whitespace-pre-wrap leading-relaxed">{simulatorOutput}</pre>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* 4. FAQ & BEST PRACTICES */}
            {activeTab === 'faq' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3">
                    {(guideData?.faq || [
                      { q: `What is ${selectedModule.name}?`, a: `It is an integrated module in the SCUT AI ecosystem.` },
                      { q: 'Is my data secure?', a: 'Yes. All data is isolated and encrypted using AES-256.' }
                    ]).map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-1.5">
                        <p className="font-bold text-slate-100 flex items-center gap-1">
                          <span className="text-cyan-400 font-mono">Q.</span> {item.q}
                        </p>
                        <p className="text-slate-400 leading-relaxed pl-4">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                    Operational Best Practices
                  </h3>
                  <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3">
                    {(guideData?.bestPractices || [
                      'Keep account credentials secure at all times.',
                      'Check developer logs regularly.',
                      'Optimize query parameters for speed.'
                    ]).map((bp, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <Award className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                        <p className="text-slate-300 leading-relaxed font-medium">{bp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. TROUBLESHOOTING & ERRORS */}
            {activeTab === 'troubleshooting' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Known Symptoms & Resolution Steps</h3>
                </div>

                <div className="space-y-4">
                  {currentTroubleshooting.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3">
                      <div className="flex items-center gap-2 text-amber-400 font-bold">
                        <span className="font-mono text-[10px] bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          ISSUE #{idx + 1}
                        </span>
                        <h4>{item.symptom}</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="font-mono text-[10px] text-slate-500 uppercase">Probable Cause</span>
                          <p className="text-slate-300">{item.cause}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                          <span className="font-mono text-[10px] text-emerald-400 uppercase">Recommended Fix</span>
                          <p className="text-slate-300">{item.solution}</p>
                        </div>
                      </div>

                      {item.codeSnippet && (
                        <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 font-mono text-[11px] text-cyan-400">
                          <code>{item.codeSnippet}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. AI ASSISTANT IN ACADEMY */}
            {activeTab === 'ai_assistant' && (
              <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    SCUT Academy AI Assistant: {selectedModule.name}
                  </h3>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Ask any technical or functional question regarding {selectedModule.name} for instant AI guidance.
                  </p>
                </div>

                <form onSubmit={handleAskAiAssistant} className="flex gap-2">
                  <input 
                    type="text"
                    placeholder={`Ask a question about ${selectedModule.name} (e.g., "How do I set up webhooks?")...`}
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    disabled={isAiThinking || !aiQuestion.trim()}
                    className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-cyan-500/10 disabled:opacity-50"
                  >
                    {isAiThinking ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Ask AI</span>
                      </>
                    )}
                  </button>
                </form>

                {aiAnswers.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    {aiAnswers.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                          <span>Q: {item.q}</span>
                          <span className="text-slate-500">{item.time}</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-light">{item.a}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-600 font-mono text-xs">
                    No active queries asked yet. Type your question above to receive instant guidance.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* VIDEO TUTORIALS & MEDIA HUB SEARCH SECTION */}
          <div className="pt-8 border-t border-slate-900">
            <VideoSearchSection />
          </div>

          {/* FOOTER SLA & CONTACT */}
          <div className="pt-6 border-t border-slate-850 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Security Protocol: AES-256 GCM • SLA Response: &lt; 2 Hours</span>
            </div>
            <button
              onClick={() => onNavigate('contact')}
              className="text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer underline flex items-center gap-1"
            >
              <span>Need custom enterprise guidance? Submit SLA Ticket</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
