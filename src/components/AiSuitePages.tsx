/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, Cpu, Sparkles, Terminal, FileText, Video, Code, Languages, 
  BookOpen, Briefcase, UserSquare, Sliders, Play, Send, CheckCircle, 
  ChevronRight, RefreshCw, Layers, ShieldCheck, Download, Code2
} from 'lucide-react';

interface AiSuitePagesProps {
  module: 'agents' | 'tools' | 'documents' | 'video' | 'code' | 'translator' | 'learning' | 'workspace' | 'avatar';
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, desc: string, category: 'security' | 'billing' | 'api' | 'chat') => void;
}

export default function AiSuitePages({ module, user, onNavigate, onAddLog }: AiSuitePagesProps) {
  const [inputText, setInputText] = useState('');
  const [isComputing, setIsComputing] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [temperature, setTemperature] = useState(0.7);

  // Specific states for different modules
  const [selectedAgent, setSelectedAgent] = useState('agent_researcher');
  const [selectedLanguage, setSelectedLanguage] = useState('romanian');
  const [selectedTopic, setSelectedTopic] = useState('ai_principles');

  const handleRunTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    setIsComputing(true);
    setOutputResult(null);

    setTimeout(() => {
      setIsComputing(false);
      onAddLog(
        `AI Computation: ${module}`,
        `Executed AI request with length: ${inputText.length} characters`,
        'api'
      );

      // Generate contextually accurate simulated outputs based on module
      if (module === 'agents') {
        setOutputResult(`[AGENT DEPLOYED: @${selectedAgent.toUpperCase()}]\n\nTask initiated: "${inputText}"\n\nPhase 1: Query expansion initiated...\nPhase 2: Scraping regional knowledge databases (index 1289)...\nPhase 3: Synthesizing results...\n\n[RECOMMENDATION OUTLINE]:\n1. Establish explicit legal safeguards in compliance with SCUT protocols.\n2. Scale local computational buffers using additional high-fidelity tokens.\n3. Conduct comprehensive cross-checking through standard Gemini neural routing.`);
      } else if (module === 'tools') {
        setOutputResult(`[SCUT UTILITY PIPELINE COMPLETE]\n\nProcessed Input: "${inputText}"\n\n- Entity Extraction: Recognized 4 active developer tokens.\n- Sentiment Score: 0.94 (Highly positive/constructive).\n- Semantic Classification: Engineering Roadmap / Systems Development.`);
      } else if (module === 'documents') {
        setOutputResult(`# SCUT Executive Document Summary\n\n**Generated On:** ${new Date().toLocaleDateString()}\n**Scope:** Analysis of input context\n\n## Core Findings\nWe analyzed the input text and extracted these main segments:\n- **Topic Focus:** Advanced computing integration.\n- **Primary Intent:** Structural expansion and system navigation updates.\n- **Next Steps:** Compile dependencies, trigger regression linters, and initiate platform deployment loops.`);
      } else if (module === 'video') {
        setOutputResult(`[SCUT VIDEO SYNTHESIS METADATA]\n\nScene Prompt: "${inputText}"\nAspect Ratio: 16:9\nGenerated Resolution: 1080p Full-Fidelity (60fps)\nDuration: 8.5 seconds\n\nDownload Link: scut_ai_render_draft_${Math.random().toString(36).substring(2, 7)}.mp4`);
      } else if (module === 'code') {
        setOutputResult(`// SCUT AI Compiler Output — Optimized TypeScript Code\n\ninterface ScutQueryContext {\n  query: string;\n  bearerToken: string;\n  timestamp: number;\n}\n\n/**\n * Orchestrates standard bearer proxy requests\n */\nexport async function routeProxyRequest(ctx: ScutQueryContext): Promise<boolean> {\n  console.log(\`[SCUT ROUTER] Processing sequence: \${ctx.query}\`);\n  try {\n    const response = await fetch('https://api.scut.ai/v1/compute', {\n      method: 'POST',\n      headers: {\n        'Authorization': \`Bearer \${ctx.bearerToken}\`,\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({ prompt: ctx.query })\n    });\n    return response.ok;\n  } catch (err) {\n    console.error('[ROUTE ERROR]', err);\n    return false;\n  }\n}`);
      } else if (module === 'translator') {
        setOutputResult(`[SCUT TRANSLATION GATEWAY]\n\nSource: Auto-Detect (English)\nTarget Language: ${selectedLanguage.toUpperCase()}\n\nOriginal Text: "${inputText}"\n\nTranslation Output:\n${
          selectedLanguage === 'romanian' 
            ? `"Am integrat cu succes toate modulele ecologice în navigația SCUT AI. Platforma este gata pentru rulări de înaltă fidelitate."`
            : `"Hemos integrado con éxito todos los módulos ecológicos en la navegación de SCUT AI. La plataforma está lista para ejecuciones de alta fidelidad."`
        }`);
      } else if (module === 'learning') {
        setOutputResult(`## SCUT Academy Learning Curriculum: ${selectedTopic.toUpperCase()}\n\n### Objective\nTo master standard interface routing models and ecosystem frameworks.\n\n### Core Lessons\n1. **Theoretical Foundations:** Overview of non-HMR Vite systems and container-ingress proxies.\n2. **Database Integration:** Direct Firestore schema creation and secure authorization state locks.\n3. **Practical Challenge:** Route 40+ modules cleanly inside an active layout switch.\n\nReady to take the test? Contact support for verified developer certification!`);
      } else if (module === 'workspace') {
        setOutputResult(`[SCUT WORKSPACE MANAGER]\n\nActive Project: SCUT AI Ecosystem (v2.6)\nSynchronized Files: 45 files\nLinter Status: Green (0 warnings)\n\nWorkspace Session securely locked in Firebase. Run "compile_applet" to deploy current changes.`);
      } else {
        setOutputResult(`[AVATAR RENDER MATRIX]\n\nAvatar Preset: Premium Cybernetic Humanoid\nEmotion Modifier: Neutral/Focused\nRendering Seeds: seed_${Math.random().toString(36).substring(2, 7)}\n\nAvatar visual mesh computed successfully. Ready to bind with your profile!`);
      }
    }, 1500);
  };

  const getModuleConfig = () => {
    switch (module) {
      case 'agents':
        return {
          title: 'AI Multi-Agent Swarm',
          subtitle: 'Autonomic Agent Orchestration',
          icon: Bot,
          color: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
          placeholder: 'Define the agent\'s tactical scope or write instructions for the research swarm...',
          runText: 'Deploy Swarm'
        };
      case 'tools':
        return {
          title: 'AI Utilities Engine',
          subtitle: 'Granular NLP & Telemetry Processors',
          icon: Cpu,
          color: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
          placeholder: 'Paste raw telemetry data, logs, or unformatted text to analyze...',
          runText: 'Process Utilities'
        };
      case 'documents':
        return {
          title: 'AI Document Studio',
          subtitle: 'Semantic Summary & Vectorization',
          icon: FileText,
          color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5',
          placeholder: 'Enter a research prompt, article content, or document brief...',
          runText: 'Synthesize Document'
        };
      case 'video':
        return {
          title: 'AI Video Synthesizer',
          subtitle: 'Text-to-Video Cinematic Renderers',
          icon: Video,
          color: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
          placeholder: 'Describe the scene, lighting, camera motion, and cinematic theme in full detail...',
          runText: 'Render Video'
        };
      case 'code':
        return {
          title: 'AI Code Oracle',
          subtitle: 'Zero-Latency Coding & Script Compiler',
          icon: Code,
          color: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/5',
          placeholder: 'Write a software prompt, algorithm description, or describe a bug to resolve...',
          runText: 'Compile Code'
        };
      case 'translator':
        return {
          title: 'AI Translation Gateway',
          subtitle: 'Neural Accent & Dialect Resolvers',
          icon: Languages,
          color: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
          placeholder: 'Enter the paragraph or sentence you wish to translate securely...',
          runText: 'Translate Text'
        };
      case 'learning':
        return {
          title: 'AI Learning Academy',
          subtitle: 'Personalized Adaptive Syllabus Generatives',
          icon: BookOpen,
          color: 'text-teal-400 border-teal-500/25 bg-teal-500/5',
          placeholder: 'Describe what skills, technologies, or subjects you want to master...',
          runText: 'Construct Syllabus'
        };
      case 'workspace':
        return {
          title: 'AI Unified Workspace',
          subtitle: 'Sandboxed Development & Context Containers',
          icon: Briefcase,
          color: 'text-sky-400 border-sky-500/25 bg-sky-500/5',
          placeholder: 'Enter specific software development plans or deployment instructions...',
          runText: 'Initialize Workspace'
        };
      case 'avatar':
        return {
          title: 'AI Avatar Studio',
          subtitle: 'Neural Mesh & Vocal Persona Customizers',
          icon: UserSquare,
          color: 'text-fuchsia-400 border-fuchsia-500/25 bg-fuchsia-500/5',
          placeholder: 'Describe the visual features, gear, theme, and personality model for your virtual representation...',
          runText: 'Synthesize Avatar'
        };
    }
  };

  const config = getModuleConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Intelligence Suite</span>
              <span className="text-[10px] font-mono text-slate-500">Service: Neural-Engine-v4</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${config.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              {config.title}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              {config.subtitle}. Fast-path routing backed directly by enterprise Gemini models.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Open Chat Workspace
            </button>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CONTROL BOARD (LEFT PANEL) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-900 space-y-6">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-cyan-400" /> Operational Controls
              </h2>

              <form onSubmit={handleRunTask} className="space-y-5">
                
                {/* SELECTS & SWITCHES SPECIFIC TO CHOSEN MODULE */}
                {module === 'agents' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Agent Specialty</label>
                    <select 
                      value={selectedAgent} 
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                    >
                      <option value="agent_researcher">Research & Synthesis Swarm</option>
                      <option value="agent_coder">Advanced Code Architect</option>
                      <option value="agent_auditor">Security Compliance Validator</option>
                    </select>
                  </div>
                )}

                {module === 'translator' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Language</label>
                    <select 
                      value={selectedLanguage} 
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                    >
                      <option value="romanian">Romanian (Limba Română)</option>
                      <option value="spanish">Spanish (Español)</option>
                      <option value="french">French (Français)</option>
                    </select>
                  </div>
                )}

                {module === 'learning' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Target Learning Discipline</label>
                    <select 
                      value={selectedTopic} 
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                    >
                      <option value="ai_principles">SCUT Intelligence Guidelines</option>
                      <option value="typescript_apis">Advanced Web Services & APIs</option>
                      <option value="financial_ledgers">Ecosystem Audits & Micro-ledgers</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Temperature (Creativity)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={temperature}
                      onChange={(e) => setTemperature(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 h-1 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-cyan-400 w-8 text-right">{temperature}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Input Specification</label>
                  <textarea 
                    rows={5}
                    required
                    placeholder={config.placeholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs leading-relaxed text-slate-100 transition-all outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isComputing}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isComputing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Computing Solution...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {config.runText}
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* PRESETS OR METADATA WIDGET */}
            <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-900 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Module Key Diagnostics</h4>
              <div className="space-y-2 text-[11px] font-mono text-slate-500">
                <div className="flex justify-between">
                  <span>Engine Routing Status:</span>
                  <span className="text-emerald-400">ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span>Compute Allocation Pack:</span>
                  <span className="text-slate-300">Bearer Cluster v2</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage Rate Per Submission:</span>
                  <span className="text-amber-400">1 Credit / Click</span>
                </div>
              </div>
            </div>

          </div>

          {/* SIMULATOR & WORKSPACE TERMINAL (RIGHT PANEL) */}
          <div className="lg:col-span-7">
            <div className="h-full rounded-3xl bg-slate-950 border border-slate-900/80 overflow-hidden flex flex-col shadow-2xl">
              
              {/* Terminal Title Bar */}
              <div className="px-5 py-3.5 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/50" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">SCUT Intelligence Terminal</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">GPU ACTIVE</span>
              </div>

              {/* Terminal Content Screen */}
              <div className="flex-1 p-6 font-mono text-xs text-slate-300 overflow-y-auto space-y-4 min-h-[350px]">
                {isComputing ? (
                  <div className="space-y-2 animate-pulse text-cyan-400">
                    <p>&gt; Authenticating compute session on Bearer routing cluster...</p>
                    <p>&gt; Mapping semantic vector weights...</p>
                    <p>&gt; Triggering localized Gemini proxy nodes...</p>
                  </div>
                ) : outputResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <div className="text-[10px] text-slate-500 flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> TASK COMPLETED SUCCESSFULLY
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(outputResult);
                          alert('Copied output successfully.');
                        }}
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[9px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Copy Result
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] text-slate-200 bg-slate-900/20 p-4 rounded-xl border border-slate-900/40">
                      {outputResult}
                    </pre>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
                    <Terminal className="h-12 w-12 text-slate-800 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400">Sandbox Console Ready</p>
                      <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                        Provide input on the left panel and compile to execute actions within the certified SCUT environment.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
