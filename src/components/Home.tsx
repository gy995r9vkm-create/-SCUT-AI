/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Cpu, Zap, ShieldCheck, Star, Users, MessageSquare, Terminal, Droplets, Play, Video } from 'lucide-react';
import ChatWorkspace from './ChatWorkspace';
import VideoPlayer from './VideoPlayer';
import VideoSearchSection from './VideoSearchSection';
import { Chat } from '../types';
import { useTranslation } from '../lib/LanguageContext';

interface HomeProps {
  onNavigate: (page: string) => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateChat: (model?: string) => string;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onToggleFavorite: (id: string) => void;
  onSendMessage: (chatId: string, content: string, attachment?: any) => Promise<void>;
  onRegenerateMessage: (chatId: string) => Promise<void>;
  isGenerating: boolean;
  userTier: string;
}

export default function Home({ 
  onNavigate, 
  onOpenAuth, 
  isLoggedIn,
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onToggleFavorite,
  onSendMessage,
  onRegenerateMessage,
  isGenerating,
  userTier
}: HomeProps) {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };

  const pillars = [
    { label: t("Core AI Engine"), value: "Gemini 2.5", icon: Cpu, desc: t("High-fidelity, multimodally capable model weights.") },
    { label: t("Interactive Dev Sandbox"), value: "Live APIs", icon: Terminal, desc: t("Mint credentials and run real JSON payloads in real time.") },
    { label: t("Durable Cloud Storage"), value: "Firestore", icon: ShieldCheck, desc: t("Securely persists session data, history, and preferences.") },
    { label: t("Ecosystem Portals"), value: "60+ Modules", icon: Bot, desc: t("Deeply unified tools spanning business, chat, and community.") }
  ];

  const highlights = [
    {
      title: t("Intelligent Conversational Workspace"),
      desc: t("An intuitive interface optimized for high-consequence reasoning, rapid research, and creative generation with robust contextual understanding."),
      icon: MessageSquare,
      color: "from-cyan-500 to-teal-400"
    },
    {
      title: t("Multimodal Visual Analysis"),
      desc: t("Seamlessly upload images, schemas, and documents. SCUT AI breaks down visual representations to explain logic and output relevant solutions."),
      icon: Bot,
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: t("Developer Sandbox & Credentials"),
      desc: t("Generate custom bearer keys, test queries within our live API Sandbox Playground, and integrate Gemini routing securely."),
      icon: Terminal,
      color: "from-indigo-500 to-cyan-400"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-cyan-900/10 blur-[120px] neon-glow pointer-events-none" />
      <div className="absolute top-2/3 -right-1/4 h-[600px] w-[600px] rounded-full bg-indigo-900/10 blur-[130px] neon-glow pointer-events-none" />

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-semibold mb-6 backdrop-blur-md"
          >
            <Zap className="h-3.5 w-3.5 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span>{t("Unified Gemini-Powered Intelligence Workspace")}</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-gradient leading-none mb-6 sm:mb-8"
          >
            {t("Intelligence Amplified.")}<br />
            {t("Meet")} <span className="text-cyan-400">SCUT AI</span>.
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed mb-8 sm:mb-10"
          >
            {t("A cohesive production-ready portal. Manage secure bearer API keys, run custom sandbox requests, utilize persistent multi-device chat histories, and navigate our multi-module ecosystem.")}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 mb-16 px-4"
          >
            <button
              onClick={() => isLoggedIn ? onNavigate('chat') : onOpenAuth()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-display font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 hover:brightness-110 active:brightness-95 transition-all shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer text-xs sm:text-sm"
            >
              {t("Start Chatting Free")}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('scutwater')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-display font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 hover:bg-cyan-500/25 hover:border-cyan-400 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm shadow-md shadow-cyan-500/10"
            >
              <Droplets className="h-4 w-4 text-cyan-400 animate-pulse" />
              <span>{t("SCUT Water Network 🌊")}</span>
            </button>

            <button
              onClick={() => onNavigate('features')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-display font-medium text-slate-200 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-white transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              {t("Explore Capabilities")}
            </button>
          </motion.div>

          {/* Interactive Video Hub & Search Section */}
          <motion.div variants={itemVariants} className="max-w-5xl mx-auto mb-16 text-left">
            <VideoSearchSection />
          </motion.div>

          {/* Real Interactive SCUT AI Chat Playground */}
          <motion.div
            variants={itemVariants}
            className="relative rounded-2xl border border-slate-800/80 bg-slate-950 overflow-hidden shadow-2xl shadow-cyan-500/5 max-w-5xl mx-auto h-[600px] md:h-[700px] text-left"
          >
            <ChatWorkspace
              chats={chats}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onCreateChat={onCreateChat}
              onDeleteChat={onDeleteChat}
              onRenameChat={onRenameChat}
              onToggleFavorite={onToggleFavorite}
              onSendMessage={onSendMessage}
              onRegenerateMessage={onRegenerateMessage}
              isGenerating={isGenerating}
              userTier={userTier}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Factual Core Pillars Section */}
      <div className="border-y border-slate-900 bg-slate-950/40 backdrop-blur-md relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {pillars.map((pillar, i) => (
              <div key={i} className="flex items-start sm:items-center gap-4 px-4">
                <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 shrink-0">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-semibold">{pillar.label}</div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">{pillar.value}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-light">{pillar.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gradient">
            {t("Engineered for Precision Workflows")}
          </h2>
          <p className="text-slate-400 mt-4 leading-relaxed font-light text-sm sm:text-base">
            {t("SCUT AI matches clean, accessible interface design with Google Gemini API models to provide a stable, responsive developer-focused workspace.")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((h, i) => (
            <div 
              key={i}
              className="relative rounded-2xl glass-panel p-8 hover:border-cyan-500/30 hover:bg-slate-900/10 hover:-translate-y-0.5 transition-all group overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
              <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-cyan-400 inline-block mb-6">
                <h.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-3">{h.title}</h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-light">{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Quick-CTA Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">
        <div className="relative rounded-3xl overflow-hidden glass-panel-heavy p-8 md:p-12 text-center border-cyan-500/20">
          {/* Neon blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            {t("Ready to unleash elite intelligence?")}
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 font-light text-sm md:text-base leading-relaxed">
            {t("Create an account in seconds. Access free premium chats, run system prompt mockups, and inspect comprehensive usage panels.")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => isLoggedIn ? onNavigate('chat') : onOpenAuth()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {t("Get Started Now")} <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('pricing')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-display font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
            >
              {t("View Plans & Pricing")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
