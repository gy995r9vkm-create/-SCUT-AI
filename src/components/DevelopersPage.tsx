/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Terminal, Code, Cpu, BookOpen, Layers, Check, Copy } from 'lucide-react';

export default function DevelopersPage({ onNavigate }: { onNavigate?: (id: string) => void }) {
  const [activeTab, setActiveTab] = useState<'node' | 'python' | 'curl'>('node');
  const [copied, setCopied] = useState(false);

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const codeSamples = {
    node: {
      lang: "javascript",
      install: "npm install @google/genai",
      code: `import { GoogleGenAI } from '@google/genai';

// Initialize client with custom SCUT API secret
const ai = new GoogleGenAI({ 
  apiKey: process.env.SCUT_API_KEY 
});

// Generate highly-reasoned text response
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Write a modern React button styled with Tailwind',
});

console.log(response.text);`
    },
    python: {
      lang: "python",
      install: "pip install google-genai",
      code: `from google import genai
import os

# Initialize client with custom SCUT API secret
client = genai.Client(
    api_key=os.environ.get("SCUT_API_KEY")
)

# Call Gemini 2.5 Flash model weights
response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents='Summarize the main rules of clean code.',
)

print(response.text)`
    },
    curl: {
      lang: "bash",
      install: "# Direct REST payload",
      code: `curl -X POST "https://api.scut.ai/v1/chat/completions" \\
  -H "Authorization: Bearer $SCUT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      {"role": "user", "content": "How far is the Moon?"}
    ],
    "temperature": 0.7
  }'`
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
              Developer Documentation
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white leading-tight">
              Integration Workspace & SDK Guides
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl font-light">
              Integrate Google Gemini intelligence directly into your backend architecture. Build with absolute speed using official Google GenAI packages.
            </p>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('designsystem')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold font-display bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all duration-200 cursor-pointer shrink-0 shadow-lg shadow-cyan-500/10 border border-cyan-400/25 active:scale-98"
            >
              <span>Explore Design System</span>
              <Code className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Quickstart installation steps */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-6 space-y-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 w-fit font-bold font-mono text-xs">01</div>
            <h3 className="font-display font-bold text-sm text-white">Mint Credentials</h3>
            <p className="text-xs text-slate-400 leading-normal font-light">Navigate to the API Console and generate a custom secret key starting with <code>scut_sec_...</code>.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-6 space-y-3">
            <div className="p-2.5 rounded-xl bg-teal-500/5 border border-teal-500/10 text-teal-400 w-fit font-bold font-mono text-xs">02</div>
            <h3 className="font-display font-bold text-sm text-white">Install packages</h3>
            <p className="text-xs text-slate-400 leading-normal font-light">Install the standard <code>@google/genai</code> or <code>google-genai</code> package inside your root workspace.</p>
          </div>
          <div className="rounded-2xl bg-slate-900/30 border border-slate-850 p-6 space-y-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 w-fit font-bold font-mono text-xs">03</div>
            <h3 className="font-display font-bold text-sm text-white">Connect endpoints</h3>
            <p className="text-xs text-slate-400 leading-normal font-light">Export your API secret inside environmental variables and run code completions securely.</p>
          </div>
        </div>

        {/* Tabbed playground instructions */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Header controls tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center px-6 py-4 bg-slate-900/50 border-b border-slate-800 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('node')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'node' ? 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Node.js SDK
              </button>
              <button
                onClick={() => setActiveTab('python')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'python' ? 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python SDK
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'curl' ? 'bg-cyan-500/15 border border-cyan-500/25 text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                cURL CLI
              </button>
            </div>

            <button
              onClick={() => copyCode(codeSamples[activeTab].code)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer h-fit w-fit self-end sm:self-auto"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy Code Snippet'}
            </button>
          </div>

          {/* Installation line */}
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 text-xs font-mono flex items-center justify-between text-slate-400">
            <span>Terminal Installation Command:</span>
            <span className="text-cyan-400 select-all">{codeSamples[activeTab].install}</span>
          </div>

          {/* Code Body */}
          <div className="p-6 bg-slate-950/80 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
            {codeSamples[activeTab].code}
          </div>
        </div>

      </div>
    </div>
  );
}
