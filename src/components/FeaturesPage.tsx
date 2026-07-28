/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Cpu, Bot, Code, Image, Database, Network, MessageSquare, Sparkles, Terminal, ShieldAlert 
} from 'lucide-react';

export default function FeaturesPage() {
  const coreFeatures = [
    {
      title: "Google Gemini 2.5 Engine",
      desc: "Connect directly to Google's highly performant multimodal weights. Get real-time text completions, logical reasoning, and creative synthesis.",
      icon: Cpu,
      accent: "text-cyan-400 bg-cyan-500/5 border-cyan-500/15"
    },
    {
      title: "Multimodal Visual Analysis",
      desc: "Drop screenshots, layout mockups, architectural plans, diagrams, or standard photos. SCUT AI parses visual details to output structured summaries.",
      icon: Image,
      accent: "text-teal-400 bg-teal-500/5 border-teal-500/15"
    },
    {
      title: "Real-time Code Assistance",
      desc: "Supports syntax highlighting, complete refactoring suggestions, performance optimization audits, and instant bug troubleshooting.",
      icon: Code,
      accent: "text-blue-400 bg-blue-500/5 border-blue-500/15"
    },
    {
      title: "Secure Custom API Keys",
      desc: "Generate production API keys with automatic log monitoring, usage limits, and custom CORS configurations directly in your console.",
      icon: Terminal,
      accent: "text-indigo-400 bg-indigo-500/5 border-indigo-500/15"
    },
    {
      title: "System Prompt Presets",
      desc: "Pre-load system prompt templates to specialize your chat sessions. Optimize SCUT AI to behave as an accountant, developer, or copywriter.",
      icon: Bot,
      accent: "text-yellow-400 bg-yellow-500/5 border-yellow-500/15"
    },
    {
      title: "Stripe Billing Infrastructure",
      desc: "Safely manage your plan upgrades and invoice billing cycles with our Stripe elements simulation. Reliable and scalable.",
      icon: Database,
      accent: "text-emerald-400 bg-emerald-500/5 border-emerald-500/15"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
            Product Deep-Dive
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight text-white leading-tight">
            High-Speed Multi-Model Intelligence
          </h1>
          <p className="text-sm text-slate-400 font-light leading-relaxed">
            Discover the features that make SCUT AI the ultimate workspace to build, design, code, and deploy AI-powered workflows.
          </p>
        </div>

        {/* Bento Grid layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreFeatures.map((f, i) => (
            <div 
              key={i}
              className="rounded-2xl bg-slate-900/40 border border-slate-850 p-8 space-y-4 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/[0.02] rounded-bl-full pointer-events-none group-hover:bg-cyan-500/5 transition-colors" />
              <div className={`p-3 rounded-xl border w-fit ${f.accent}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Dynamic section: Playground visualization */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12 relative overflow-hidden flex flex-col lg:flex-row gap-8 items-center">
          <div className="absolute top-0 right-0 h-44 w-44 bg-cyan-500/5 rounded-bl-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 lg:w-1/2">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Pristine Architecture</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white tracking-tight">
              Designed for latency-sensitive applications.
            </h2>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              We proxy client inputs safely to Gemini 2.5 weights. This guarantees absolute safety for your API secrets while maintaining near-instant completions (under 45ms average response latency).
            </p>
            <div className="pt-4 flex gap-6">
              <div>
                <span className="block text-xl font-bold text-white font-mono">42ms</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Response latency</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white font-mono">99.99%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Uptime SLA</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 bg-slate-950 rounded-2xl border border-slate-800 p-5 font-mono text-[11px] leading-relaxed text-slate-300 shadow-inner">
            <div className="flex items-center gap-1.5 pb-3 border-b border-slate-900 mb-4 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="ml-2">scut-api-test.py</span>
            </div>
            <p className="text-slate-500"># Import SCUT SDK client</p>
            <p><span className="text-cyan-400">from</span> scut_ai <span className="text-cyan-400">import</span> ScutClient</p>
            <p>client = ScutClient(api_key=<span className="text-emerald-400">"scut_sec_..."</span>)</p>
            <br />
            <p className="text-slate-500"># Generate content with Gemini Flash</p>
            <p>completion = client.chat.generate(</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;model=<span className="text-emerald-400">"gemini-2.5-flash"</span>,</p>
            <p>&nbsp;&nbsp;&nbsp;&nbsp;prompt=<span className="text-emerald-400">"Optimize SQL indexing query"</span></p>
            <p>)</p>
            <br />
            <p><span className="text-cyan-400">print</span>(completion.text)</p>
          </div>
        </div>

      </div>
    </div>
  );
}
