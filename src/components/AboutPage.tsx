import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, Globe, Star, Users, ArrowUpRight, Cpu, 
  Sparkles, Layers, Terminal, Heart
} from 'lucide-react';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const team = [
    { name: "Gabriel Paduraru", role: "Founder & Chief Architect", desc: "Decentralized software engineer and cloud infrastructure specialist leading SCUT's ecosystem expansion.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel" },
    { name: "SCUT Core Engineers", role: "AI Weights & Web3 Protocol Contributors", desc: "Global collective of specialists backing low-latency blockchain and LLM gateways.", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ScutCore" }
  ];

  const values = [
    { title: "Sovereign Intelligence", desc: "We link top-tier, raw multimodal LLM outputs with decentralized APIs to provide uncensored, performant tools.", icon: Cpu },
    { title: "On-Chain Consensus", desc: "By integrating Polygon networks and SCUT Pay checkout tunnels, we make transaction processing transparent and instant.", icon: Layers },
    { title: "Absolute Security", desc: "No public-facing API keys, stateful encryption, audited JWT contexts, and absolute data control in client hands.", icon: ShieldCheck }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-900/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-900/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-3">
            <Globe className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
            <span>The Main Domain: scutpay.com</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
            Welcome to the <span className="text-cyan-400">SCUT Ecosystem</span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Unifying high-speed artificial intelligence proxy routes, decentralized Polygon payment lanes, and developer utilities under a single identity.
          </p>
        </div>

        {/* Mission Statement block */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-8 shadow-xl relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <h2 className="font-display text-xl font-bold text-white mb-4">Our Core Philosophy</h2>
          <p className="text-slate-300 text-sm leading-relaxed font-light mb-6">
            We believe that high-performance intelligence shouldn't be confined to isolated chat widgets. The SCUT Platform transforms standard multimodal AI models into robust, modular pieces of a larger ecosystem. 
            From **SCUT Pay** (blockchain payment rails) to **SCUT Marketplace** (decentralized prompt and model hubs) and **Mica Bucurie** (positive energy systems), everything connects cleanly. One authentication, one dashboard, one unified user interface.
          </p>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <button
              onClick={() => onNavigate('chat')}
              className="px-6 py-2.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs cursor-pointer"
            >
              Start SCUT AI Playground
            </button>
            <button
              onClick={() => onNavigate('features')}
              className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
            >
              Read Feature Set
            </button>
          </div>
        </div>

        {/* Values Grid */}
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-slate-200 text-center">Architectural Foundations</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div key={i} className="rounded-2xl border border-slate-900 bg-slate-950/40 p-6 space-y-4">
                  <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 inline-block">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-sm font-bold text-white">{v.title}</h4>
                  <p className="text-slate-400 text-xs font-light leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Grid */}
        <div className="space-y-6">
          <h3 className="font-display text-lg font-bold text-slate-200 text-center">Ecosystem Leadership</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((t, i) => (
              <div key={i} className="rounded-2xl border border-slate-900 bg-slate-950 p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
                  <img src={t.avatar} alt={t.name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display text-sm font-bold text-white">{t.name}</h4>
                  <span className="text-[10px] text-cyan-400 font-bold block">{t.role}</span>
                  <p className="text-slate-400 text-xs font-light leading-relaxed pt-1.5">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Closing card */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-8 text-center relative overflow-hidden">
          <Heart className="h-8 w-8 text-rose-400 mx-auto fill-rose-500/10 mb-4 animate-pulse" />
          <h3 className="font-display text-base font-bold text-white">Join the SCUT Revolution</h3>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed mt-2 mb-6 font-light">
            Become a part of a unified ecosystem built for high-consequence corporate, personal, and developer needs.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="px-6 py-2.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs inline-block cursor-pointer"
          >
            Get In Touch
          </button>
        </div>

      </div>
    </div>
  );
}
