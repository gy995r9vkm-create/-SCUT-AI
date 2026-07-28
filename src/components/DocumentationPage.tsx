/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Code, Terminal, Server, Key, ShieldCheck, ChevronRight,
  Search, Copy, Check, FileText, Cpu, Settings, ExternalLink
} from 'lucide-react';

interface DocumentationPageProps {
  onNavigate: (page: string) => void;
}

export default function DocumentationPage({ onNavigate }: DocumentationPageProps) {
  const [activeSection, setActiveSection] = useState('quickstart');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const sections = [
    { id: 'quickstart', label: 'Ecosystem Quickstart', icon: BookOpen },
    { id: 'auth', label: 'API Authorization', icon: Key },
    { id: 'models', label: 'Proxy Routing Models', icon: Cpu },
    { id: 'rate_limits', label: 'Billing & Rate Limits', icon: ShieldCheck }
  ];

  const codeSnippets = {
    bash: `curl -X POST https://api.scut.ai/v1/compute \\
  -H "Authorization: Bearer scut_sec_live_9a8b7c..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-2.5-flash-scut",
    "prompt": "Optimize system-wide route headers"
  }'`,
    node: `import { ScutClient } from '@scut/sdk';

const scut = new ScutClient({ apiKey: 'scut_sec_live_9a8b7c...' });

const response = await scut.compute({
  prompt: 'Analyze active multi-agent cluster telemetry',
  temperature: 0.7
});

console.log(response.result);`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Developer Sandbox</span>
              <span className="text-[10px] font-mono text-slate-500">API Version: v1.4.2</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <Code className="h-8 w-8 text-cyan-400" />
              SCUT Technical Documentation
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              Integrate localized microservices, query the decentralized Gemini routing proxies, and issue secure developer credentials.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('api')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Key className="h-4 w-4" /> Mint API Keys
            </button>
            <button 
              onClick={() => onNavigate('developers')}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer"
            >
              Developer Center
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* NAVIGATION SIDEBAR */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold px-3">Documentation Index</div>
            <nav className="space-y-1">
              {sections.map((sec) => {
                const SecIcon = sec.icon;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeSection === sec.id 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SecIcon className="h-4 w-4" />
                      {sec.label}
                    </div>
                    <ChevronRight className={`h-3 w-3 transition-transform ${activeSection === sec.id ? 'rotate-90 text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* DOCUMENTATION VIEWPORT */}
          <div className="lg:col-span-9 p-8 rounded-3xl bg-slate-900/20 border border-slate-900 leading-relaxed text-sm text-slate-300 font-light space-y-6">
            
            {activeSection === 'quickstart' && (
              <div className="space-y-6">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Terminal className="h-6 w-6 text-cyan-400" />
                  Ecosystem Quickstart Guide
                </h2>
                <p>
                  SCUT AI operates a low-latency proxy engine that intercepts conversational queries and handles routing safely across high-performance Gemini API endpoints.
                </p>

                <div className="space-y-3">
                  <h3 className="font-display text-sm font-bold text-white uppercase font-mono tracking-wider">1. Base Gateway Endpoint</h3>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 font-mono text-xs text-slate-400 flex justify-between items-center">
                    <span>https://api.scut.ai/v1/compute</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/15 px-1.5 py-0.5 rounded">HTTP POST</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-sm font-bold text-white uppercase font-mono tracking-wider">2. Sample Request Body (Bash curl)</h3>
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.bash, 'bash')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedCode === 'bash' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      {copiedCode === 'bash' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                    {codeSnippets.bash}
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'auth' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Key className="h-6 w-6 text-cyan-400" />
                  Authorization Protocol
                </h2>
                <p>
                  Every request transmitted to the SCUT API gateway must specify a valid Bearer token inside the <code className="text-cyan-400 font-mono bg-slate-950 px-1 py-0.5 rounded text-xs">Authorization</code> header.
                </p>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400 text-xs leading-relaxed font-mono">
                  <strong>CRITICAL SECURITY PROTOCOL:</strong> API keys are secret credentials and carry full account credit capabilities. Never commit secret key strings to public GitHub repositories or expose them on client-side JS bundles.
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-display text-sm font-bold text-white uppercase font-mono tracking-wider">Node.js Integration Code</h3>
                    <button 
                      onClick={() => copyToClipboard(codeSnippets.node, 'node')}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedCode === 'node' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      {copiedCode === 'node' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                    {codeSnippets.node}
                  </pre>
                </div>
              </div>
            )}

            {activeSection === 'models' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Cpu className="h-6 w-6 text-cyan-400" />
                  Proxy Routing Models
                </h2>
                <p>
                  SCUT coordinates several specialized routing weights tailored for low latency and complex multimodal workflows.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">GEMINI-2.5-FLASH</span>
                    <h4 className="text-xs font-bold text-white pt-2">Optimized Flash Compute</h4>
                    <p className="text-xs text-slate-500">Perfect for chat agents, language translation, and high-frequency queries. Average latency: 320ms.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-900 space-y-1">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/15 px-1.5 py-0.5 rounded">GEMINI-2.5-PRO</span>
                    <h4 className="text-xs font-bold text-white pt-2">Deep Cognitive Agent</h4>
                    <p className="text-xs text-slate-500">Tailored for complex coding structures, security audit scans, and massive multi-file summaries.</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'rate_limits' && (
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-cyan-400" />
                  Rate Limits & Billing Tier
                </h2>
                <p>
                  Ecosystem requests are tracked in credits. Rate limits are applied dynamically based on your registered membership subscription.
                </p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left font-mono text-xs text-slate-400">
                    <thead>
                      <tr className="border-b border-slate-850 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                        <th className="py-2.5 px-4">Membership Level</th>
                        <th className="py-2.5 px-4">Requests / Minute</th>
                        <th className="py-2.5 px-4">Cost / Execution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40">
                      <tr>
                        <td className="py-3 px-4 font-bold text-slate-200">Free Tier</td>
                        <td className="py-3 px-4">15 RPM</td>
                        <td className="py-3 px-4">1.5 Credits</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-cyan-400">Pro Tier</td>
                        <td className="py-3 px-4">120 RPM</td>
                        <td className="py-3 px-4">1.0 Credit</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 font-bold text-teal-400">Business / Enterprise</td>
                        <td className="py-3 px-4">Unlimited</td>
                        <td className="py-3 px-4">0.8 Credits</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
