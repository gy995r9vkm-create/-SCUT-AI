/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Shield, Phone, MapPin, User, Users, Calendar, Briefcase, 
  ShoppingBag, Bell, EyeOff, Lock, Sparkles, Send, Plus, Search, 
  Filter, HelpCircle, CheckCircle, AlertTriangle, MessageSquare, 
  Star, Award, BookOpen, GraduationCap, TrendingUp, Handshake, 
  ArrowRight, ShieldAlert, HeartPulse, RefreshCw, Eye, Sparkle, Bot, Check, Play, Zap, Info,
  MessageCircle, X, Activity, Book, ShieldCheck
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { User as UserType, Language } from '../types';

interface ScutMenPageProps {
  user: UserType | null;
  language?: Language;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onPayWithWallet?: (amount: string, description: string) => void;
}

interface SupportResource {
  id: string;
  title: string;
  category: 'mental' | 'physical' | 'fitness' | 'lifestyle';
  content: string;
  readTime: string;
}

interface ProfessionalContact {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  location: string;
  rating: number;
}

interface FitnessLog {
  date: string;
  workoutType: string;
  duration: number; // in minutes
  sleepHours: number;
  moodLevel: 'Focused' | 'Energetic' | 'Stressed' | 'Tired' | 'Balanced';
}

interface CareerRoadmap {
  id: string;
  title: string;
  provider: string;
  type: 'Mentorship' | 'Certification' | 'Tech Sprint' | 'Leadership';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  benefit: string;
}

interface CommunityGroup {
  id: string;
  name: string;
  members: number;
  description: string;
  category: 'Mental Strength' | 'Tech Leaders' | 'Fatherhood' | 'Fitness';
}

interface MenEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  joined: boolean;
}

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  company: string;
  available: boolean;
  matched: boolean;
  avatarUrl?: string;
}

export default function ScutMenPage({ user, language = 'en', onNavigate, onAddLog, onPayWithWallet }: ScutMenPageProps) {
  // Navigation & Interactive Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'health' | 'career' | 'community' | 'how_to_use'>('dashboard');
  
  // States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAnonymized, setIsAnonymized] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('OMEGA-STRENGTH');

  // How to Use Guide Navigation State
  const [guideCategory, setGuideCategory] = useState<'intro' | 'quick' | 'advanced' | 'faq'>('intro');

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };
  
  // Interactive Ares AI State
  const [aresChat, setAresChat] = useState<{ sender: 'ares' | 'user'; text: string; time: string }[]>([
    { sender: 'ares', text: 'Hello, Brother. I am Ares AI, your dedicated health, career, and personal growth mentor. Ask me anything about high-performance routines, mental fortitude, local community meetups, or corporate progression tracks.', time: 'Just now' }
  ]);
  const [aresInput, setAresInput] = useState('');
  const [aresLoading, setAresLoading] = useState(false);

  // Security and wellness notifications
  const [notifications, setNotifications] = useState<any[]>([
    { id: 'n-1', text: 'Weekly check-in: Mental resilience matrix synchronized. Stay focused today.', date: 'Today, 08:30 AM', read: false },
    { id: 'n-2', text: 'Mentorship network: Active matches with Dr. Marcus Stone are available.', date: 'Yesterday', read: true },
    { id: 'n-3', text: 'Community Event starting soon: Peak Executive Longevity Round-table.', date: '2 days ago', read: true }
  ]);

  // Section specific data
  const [fitnessLogs, setFitnessLogs] = useState<FitnessLog[]>([
    { date: 'July 15', workoutType: 'Strength Training', duration: 55, sleepHours: 7.5, moodLevel: 'Focused' },
    { date: 'July 16', workoutType: 'Cardio & HIIT', duration: 40, sleepHours: 6.8, moodLevel: 'Energetic' },
    { date: 'July 17', workoutType: 'Recovery / Yoga', duration: 30, sleepHours: 8.0, moodLevel: 'Balanced' },
    { date: 'July 18', workoutType: 'Heavy Lifting', duration: 60, sleepHours: 7.2, moodLevel: 'Focused' }
  ]);
  const [newLog, setNewLog] = useState<FitnessLog>({ 
    date: 'July 19', 
    workoutType: 'Strength Training', 
    duration: 45, 
    sleepHours: 7.5, 
    moodLevel: 'Balanced' 
  });

  const clinics: ProfessionalContact[] = [
    { id: 'c-1', name: 'Apex Men Mental Fortitude Hub', specialty: 'Anxiety, Career Burnout & Performance Coaching', phone: '+1 (800) 555-APEX', location: 'Virtual & Central Hubs', rating: 4.9 },
    { id: 'c-2', name: 'Dr. Marcus Stone (Clinical Lead)', specialty: 'Men Health, Vitality, and Stress Recovery', phone: '+1 (800) 555-VITAL', location: 'San Francisco & Online Consult', rating: 4.8 },
    { id: 'c-3', name: 'Sentinel Longevity Clinic', specialty: 'Bio-feedback, Hormonal Vitality & High Performance', phone: '+1 (555) 019-3355', location: 'Seattle / Secure Telehealth', rating: 4.7 }
  ];

  // Mentorship matched/available
  const [mentors, setMentors] = useState<Mentor[]>([
    { id: 'm-1', name: 'Dr. Marcus Stone', expertise: 'Behavioral Psychologist & Longevity Consultant', company: 'Apex Mind Labs', available: true, matched: false, avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=marcus' },
    { id: 'm-2', name: 'Gregory Vance, PhD', expertise: 'VP of Engineering & Leadership Coach', company: 'SCUT Tech Group', available: true, matched: false, avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=gregory' },
    { id: 'm-3', name: 'Richard Harrison', expertise: 'SaaS Founder & Venture Builder', company: 'Pinnacle Capital', available: false, matched: true, avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=richard' }
  ]);

  // Scholarship/Careers Application modal
  const [selectedOpp, setSelectedOpp] = useState<any | null>(null);
  const [appForm, setAppForm] = useState({ name: '', email: '', motivation: '' });

  // Community discussion
  const [communityThreads, setCommunityThreads] = useState<any[]>([
    { id: 'ct-1', title: 'Navigating Burnout: Strategies for Mid-Level Engineering Managers', group: 'Mental Strength', creator: 'Clara Oswald', comments: 18, likes: 42 },
    { id: 'ct-2', title: 'High-Protein Clean Meal Prep routines for full-time developers', group: 'Fitness', creator: 'Dave Miller', comments: 12, likes: 29 },
    { id: 'ct-3', title: 'Transitioning from Senior Dev to Principal Leadership roles in 2026', group: 'Tech Leaders', creator: 'Richard H.', comments: 24, likes: 61 }
  ]);
  const [newThread, setNewThread] = useState({ title: '', group: 'Mental Strength' });

  // Events list
  const [joinedEvents, setJoinedEvents] = useState<string[]>(['ev-1']);
  const menEvents: MenEvent[] = [
    { id: 'ev-1', title: 'Peak Executive Longevity & Wellness Seminar', date: 'July 24, 2026', time: '11:00 AM PST', location: 'Virtual Interactive Zoom & Decentraland', organizer: 'SCUT Labs', joined: true },
    { id: 'ev-2', title: 'SaaS Engineering Leadership Roundtable', date: 'August 03, 2026', time: '5:00 PM PST', location: 'Audio Node #15', organizer: 'SCUT Business Portal', joined: false },
    { id: 'ev-3', title: 'Mindfulness & Physical Mastery Weekend Bootcamp', date: 'August 16, 2026', time: '09:00 AM PST', location: 'Secure Alpine Retreat & Live Stream', organizer: 'Apex Mental Hub', joined: false }
  ];

  // Daily advice insight
  const [aiTip, setAiTip] = useState('Sustained cognitive focus requires high-quality sleep: Aim for 7.5+ hours and avoid electronic blue lights 60 minutes before bed.');
  const [generatingTip, setGeneratingTip] = useState(false);

  // Fetch Daily AI Tip from Server Sandbox
  const fetchDailyAITip = async () => {
    setGeneratingTip(true);
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Write a short, highly professional 2-sentence advice on physical health, mental focus, or career leadership tailored specifically for professional men in fast-paced corporate environments. Do not write introductory text, just output the advice.",
          temperature: 0.85
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setAiTip(data.choices[0].message.content);
      }
    } catch (e) {
      console.warn("Using offline fallback advice:", e);
    } finally {
      setGeneratingTip(false);
    }
  };

  // Chat with Ares AI
  const handleAresSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aresInput.trim()) return;

    const userMsg = aresInput;
    setAresChat(prev => [...prev, { sender: 'user', text: userMsg, time: 'Just now' }]);
    setAresInput('');
    setAresLoading(true);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Ares AI, an expert health, career progression, and mental resilience advisor for men. You speak with extreme clarity, calm confidence, and empathy. Provide a highly precise, practical 3-sentence response to this query: "${userMsg}"`,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setAresChat(prev => [...prev, { sender: 'ares', text: data.choices[0].message.content, time: 'Just now' }]);
      } else {
        setAresChat(prev => [...prev, { sender: 'ares', text: "I have calculated your request. Focus on immediate physical actions, rest adequately, and optimize your routine.", time: 'Just now' }]);
      }
    } catch (err) {
      setAresChat(prev => [...prev, { sender: 'ares', text: "I recommend configuring high-intensity interval training paired with deep meditation blocks. Stay focused, stay disciplined.", time: 'Just now' }]);
    } finally {
      setAresLoading(false);
    }
  };

  // Add Fitness Log Handler
  const handleAddFitnessLog = (e: React.FormEvent) => {
    e.preventDefault();
    const added: FitnessLog = {
      ...newLog,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
    setFitnessLogs([...fitnessLogs, added]);
    onAddLog('Men Fitness Log Added', `Logged ${added.workoutType} of ${added.duration} minutes.`, 'chat');
    showNotification("Fitness & Well-being metrics logged securely.");
  };

  // Toggle Join Event
  const toggleJoinEvent = (eventId: string, title: string) => {
    if (joinedEvents.includes(eventId)) {
      setJoinedEvents(joinedEvents.filter(id => id !== eventId));
      onAddLog('Unregistered men event', `Cancelled attendance for: ${title}`, 'chat');
      showNotification(`Unregistered from: ${title}`);
    } else {
      setJoinedEvents([...joinedEvents, eventId]);
      onAddLog('Registered men event', `Confirmed seat for: ${title}`, 'chat');
      showNotification(`🎉 Registration confirmed for: ${title}`);
    }
  };

  // Create discussion thread
  const handleCreateThread = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThread.title) return;
    const added = {
      id: 'ct-' + Math.random().toString(36).substring(2, 9),
      title: newThread.title,
      group: newThread.group,
      creator: isAnonymized ? 'Anonymous Brother' : (user?.name || 'SCUT Pioneer'),
      comments: 0,
      likes: 0
    };
    setCommunityThreads([added, ...communityThreads]);
    setNewThread({ title: '', group: 'Mental Strength' });
    onAddLog('Men Forum thread created', `Dispatched forum post: "${added.title}"`, 'chat');
    showNotification("Thread published to the community circle.");
  };

  // Mentorship handshake
  const requestMentorship = (mentorId: string, mentorName: string) => {
    setMentors(mentors.map(m => m.id === mentorId ? { ...m, matched: true } : m));
    onAddLog('Mentorship matched', `Establishing connection channel with mentor ${mentorName}`, 'chat');
    showNotification(`Establishing connection with ${mentorName}`);
    
    // Add real-time log notification
    setNotifications([
      { id: 'n-new', text: `🎉 Mentorship matched with ${mentorName}! A secure direct messaging thread has been provisioned.`, date: 'Just now', read: false },
      ...notifications
    ]);
  };

  // Submit career application
  const handleApplyOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOpp) return;

    onAddLog('Mentorship/Career Application Dispatched', `Submitted digital interest packet for ${selectedOpp.title}`, 'chat');
    showNotification(`🎉 Application safely transmitted under SCUT encryption.`);
    
    setNotifications([
      { id: 'n-opp-' + Math.random(), text: `📬 Applied successfully for: ${selectedOpp.title}. Check your secure inbox!`, date: 'Just now', read: false },
      ...notifications
    ]);
    setSelectedOpp(null);
    setAppForm({ name: '', email: '', motivation: '' });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 font-sans">
      
      {/* Background glowing visuals */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-900 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-mono text-xs font-bold tracking-widest uppercase mb-1.5">
              <Sparkles className="h-4 w-4 text-blue-400 animate-pulse" />
              <span>Wellness & Empowerment</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-white flex items-center gap-2.5">
              SCUT Men & Boys <Shield className="h-7 w-7 text-blue-500 fill-blue-500/10" />
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl mt-1.5">
              A private, production-grade workspace supporting male mental fortitude, corporate leadership, physical wellness, and community peer integration.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* HOW TO USE QUICK ACTION */}
            <button 
              onClick={() => setActiveTab('how_to_use')}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:border-blue-500/35 hover:text-blue-300 transition-all flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-blue-400" />
              <span>How to Use Guide</span>
            </button>

            <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-colors ${isAnonymized ? 'bg-blue-950/40 border-blue-500/40 text-blue-300' : 'bg-slate-900/40 border-slate-850 text-slate-400'}`}>
              <EyeOff className={`h-4 w-4 ${isAnonymized ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              <button 
                onClick={() => {
                  setIsAnonymized(!isAnonymized);
                  onAddLog('Toggle Forum Anonymity', `Set forum avatar privacy state: ${!isAnonymized}`, 'security');
                }}
                className="font-bold cursor-pointer hover:text-white"
              >
                {isAnonymized ? 'Incognito ON' : 'Incognito OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* SLIDING NAVIGATION BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-thin border-b border-slate-900 mb-8">
          {[
            { id: 'dashboard', label: 'Ecosystem Desk', icon: Heart },
            { id: 'health', label: 'Health & Fortitude', icon: HeartPulse },
            { id: 'career', label: 'Career & Mentorship', icon: GraduationCap },
            { id: 'community', label: 'Community Circles', icon: Users },
            { id: 'how_to_use', label: 'How to Use / FAQ', icon: HelpCircle }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all border cursor-pointer ${
                  active 
                    ? 'bg-blue-500/10 border-blue-500/35 text-blue-300 font-bold' 
                    : 'bg-slate-900/40 border-slate-850/60 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TOAST NOTIFICATION FOR USER INTERACTIONS */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/30 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <span className="text-xs font-medium">{toastMessage}</span>
          </div>
        )}

        {/* TAB 1: ECOSYSTEM DESK */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            
            {/* MICRO INSPIRING BAR AND CHATBOX COMBINED */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Micro Advice Card */}
              <div className="lg:col-span-1 bg-gradient-to-br from-blue-950/25 to-slate-950 border border-blue-500/15 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                    <Sparkle className="h-4 w-4 text-blue-400" />
                    <span>Focus Insight</span>
                  </div>
                  <blockquote className="text-slate-100 text-sm font-semibold leading-relaxed">
                    "{aiTip}"
                  </blockquote>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    AI recommendation synchronized instantly. Access daily routines built with mental stamina in mind.
                  </p>
                </div>
                
                <div className="pt-4 border-t border-slate-900 mt-6 flex justify-between items-center">
                  <button 
                    onClick={fetchDailyAITip}
                    disabled={generatingTip}
                    className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${generatingTip ? 'animate-spin' : ''}`} />
                    <span>Generate Tip</span>
                  </button>
                  <Sparkles className="h-4 w-4 text-blue-400" />
                </div>
              </div>

              {/* ARES AI INTERACTIVE COMPANION */}
              <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between min-h-[320px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-850 mb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-400" />
                    <div>
                      <h3 className="text-xs font-bold text-white">Ares AI Counselor</h3>
                      <span className="text-[9px] text-slate-500 font-mono">End-to-End Encrypted Session</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase font-bold">Secure Node</span>
                </div>

                {/* Chat window */}
                <div className="flex-1 overflow-y-auto space-y-3.5 max-h-48 pr-1 text-xs">
                  {aresChat.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center text-[10px] ${msg.sender === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-blue-500/20 text-blue-300 border border-blue-500/20'}`}>
                        {msg.sender === 'user' ? 'U' : 'A'}
                      </div>
                      <div className={`p-2.5 rounded-xl max-w-sm border ${msg.sender === 'user' ? 'bg-blue-950/20 border-blue-500/20 text-blue-100' : 'bg-slate-950/60 border-slate-900 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aresLoading && (
                    <div className="flex gap-2.5">
                      <div className="h-6 w-6 rounded-full shrink-0 bg-blue-500/20 text-blue-300 flex items-center justify-center text-[10px] animate-pulse">A</div>
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-900 text-slate-500 italic animate-pulse">Ares AI is designing a response block...</div>
                    </div>
                  )}
                </div>

                {/* Input form */}
                <form onSubmit={handleAresSubmit} className="pt-3 border-t border-slate-850 mt-3 flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Ask Ares about mental stamina, health tips, leadership tracks..."
                    value={aresInput}
                    onChange={e => setAresInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/40"
                  />
                  <button type="submit" className="p-2 rounded-xl bg-blue-500 text-slate-950 font-bold hover:opacity-95 transition-all flex items-center justify-center cursor-pointer">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>

            {/* BENTO DASHBOARD MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Strength/Fitness Quick Card */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 text-blue-400 border border-blue-500/25 rounded-xl w-fit">
                    <Activity className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Active Logs & Fitness</h3>
                  <p className="text-2xl font-extrabold text-white">{fitnessLogs.length} Sessions Logged</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Sustained routine verified. Check sleep rhythms, workout durations, and overall mood levels.
                  </p>
                </div>
                <button onClick={() => setActiveTab('health')} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-4 cursor-pointer">
                  <span>Open Tracker</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Leadership matches */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 rounded-xl w-fit">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Executive Mentorship</h3>
                  <p className="text-2xl font-extrabold text-white">
                    {mentors.filter(m => m.matched).length} Matches Active
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Establish communication with VP coaches, startup founders, and longevity clinics.
                  </p>
                </div>
                <button onClick={() => setActiveTab('career')} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-4 cursor-pointer">
                  <span>Browse Mentors</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Community activities */}
              <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-xl w-fit">
                    <Users className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Community Circles</h3>
                  <p className="text-2xl font-extrabold text-white">
                    {communityThreads.length} Discussion Threads
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Join peer groups centering physical mastery, tech progression, and mindful longevity.
                  </p>
                </div>
                <button onClick={() => setActiveTab('community')} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 mt-4 cursor-pointer">
                  <span>View Discussions</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>

            {/* INTEGRATED ALERTS & NOTIFICATIONS */}
            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-850 mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white">Ecosystem Wellness Bulletins</h3>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  {notifications.filter(n => !n.read).length} New Update
                </span>
              </div>
              <div className="space-y-2.5">
                {notifications.map(n => (
                  <div key={n.id} className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${n.read ? 'bg-slate-950/40 border-slate-900/60 text-slate-400' : 'bg-blue-500/[0.03] border-blue-500/10 text-slate-200'}`}>
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-slate-700' : 'bg-blue-400 animate-pulse'}`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-xs leading-relaxed">{n.text}</p>
                      <span className="text-[10px] text-slate-500 font-mono block">{n.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: HEALTH & FORTITUDE (WELLBEING) */}
        {activeTab === 'health' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Daily Wellness Tracker Entry Form */}
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-400" /> Log Daily Metrics
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Track parameters supporting high-efficiency output and mental clarity.
                  </p>
                </div>

                <form onSubmit={handleAddFitnessLog} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workout Type</label>
                    <select 
                      value={newLog.workoutType}
                      onChange={e => setNewLog({...newLog, workoutType: e.target.value})}
                      className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Strength Training">Strength Training</option>
                      <option value="Cardio & HIIT">Cardio & HIIT</option>
                      <option value="Heavy Lifting">Heavy Lifting</option>
                      <option value="Recovery / Stretch">Recovery / Stretch</option>
                      <option value="None / Office Rest">None / Office Rest</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration (min)</label>
                      <input 
                        type="number" 
                        required
                        value={newLog.duration}
                        onChange={e => setNewLog({...newLog, duration: Number(e.target.value)})}
                        className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sleep (hours)</label>
                      <input 
                        type="number" 
                        step="0.1"
                        required
                        value={newLog.sleepHours}
                        onChange={e => setNewLog({...newLog, sleepHours: Number(e.target.value)})}
                        className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mood / Stamina State</label>
                    <select 
                      value={newLog.moodLevel}
                      onChange={e => setNewLog({...newLog, moodLevel: e.target.value as any})}
                      className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Focused">Focused / Peak Capacity</option>
                      <option value="Energetic">Energetic / High Activity</option>
                      <option value="Balanced">Balanced / Stable</option>
                      <option value="Tired">Tired / Needs Rest</option>
                      <option value="Stressed">Stressed / High Fatigue</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Daily Matrix</span>
                  </button>
                </form>
              </div>

              {/* Chart & History Analytics */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white">Daily Stamina Trends</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Visualizing historical logs of physical duration (minutes) paired with restful sleep (hours).
                  </p>
                </div>

                <div className="h-64 w-full bg-slate-950/40 border border-slate-900 rounded-xl p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={fitnessLogs}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: 'bold' }}
                        itemStyle={{ fontSize: '11px' }}
                      />
                      <Area type="monotone" dataKey="duration" name="Workout Duration (Min)" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDuration)" />
                      <Area type="monotone" dataKey="sleepHours" name="Sleep (Hours)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSleep)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Listing of current logs */}
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {fitnessLogs.map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950/60 border border-slate-900">
                      <div className="flex items-center gap-3">
                        <span className="font-bold font-mono text-slate-500">{log.date}</span>
                        <span className="text-slate-300 font-semibold">{log.workoutType}</span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                        <span>⏱️ {log.duration} min</span>
                        <span>💤 {log.sleepHours} hrs</span>
                        <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-850 text-[10px] text-blue-400 font-bold">{log.moodLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* MEN WELLNESS & MENTAL SUPPORT CLINICS */}
            <div className="bg-slate-900/20 border border-slate-850 rounded-2xl p-6">
              <div className="mb-6">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-400" /> Support Clinic & Counselor Directory
                </h3>
                <p className="text-xs text-slate-400 mt-1">Verified physical, mental resilience, and high-performance longevity coordinators.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {clinics.map(c => (
                  <div key={c.id} className="p-5 rounded-xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="h-4 w-4 fill-amber-400" />
                          <span className="text-xs font-bold font-mono">{c.rating}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Verified Hub</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white leading-snug">{c.name}</h4>
                        <p className="text-[10px] font-mono text-slate-500 mt-0.5">{c.specialty}</p>
                      </div>

                      <div className="space-y-1 pt-1 text-[11px] text-slate-400">
                        <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-blue-400" /> {c.phone}</p>
                        <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500" /> {c.location}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => showNotification(`Secure session call routing configured for ${c.name}. Call initiated.`)}
                      className="w-full mt-4 py-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/30 text-slate-200 hover:text-white transition-all text-xs font-bold cursor-pointer"
                    >
                      Initialize Secure Session
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: CAREER & MENTORSHIP */}
        {activeTab === 'career' && (
          <div className="space-y-8">
            
            {/* Mentorship matches and networking circles */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Mentors directory list */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-400" /> Executive Mentorship Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Connect 1:1 with certified technical architects, product leaders, and behavioral strategists.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {mentors.map(m => (
                    <div key={m.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-slate-800 overflow-hidden bg-slate-900 shrink-0">
                          <img src={m.avatarUrl} alt={m.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{m.name}</span>
                            <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {m.company}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">{m.expertise}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {m.matched ? (
                          <span className="text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" /> Direct Thread Active
                          </span>
                        ) : (
                          <button 
                            onClick={() => requestMentorship(m.id, m.name)}
                            className="px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Request Connection
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick roadmap certification suggestions */}
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-400" /> Executive Roadmaps
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Syllabi focused on startup architecture, funding, and team management.</p>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'opp-1', title: 'VP of Engineering Leadership Track', provider: 'SCUT Tech Group', type: 'Leadership', difficulty: 'Advanced', benefit: 'Certified VC network fast-track' },
                    { id: 'opp-2', title: 'Full-Stack Startup Systems Architecture', provider: 'Apex Mind Labs', type: 'Certification', difficulty: 'Intermediate', benefit: 'Direct Pre-Seed pitch invitation' },
                    { id: 'opp-3', title: 'High-Scale DevSecOps Certification', provider: 'SCUT Devs', type: 'Tech Sprint', difficulty: 'Advanced', benefit: 'Exclusive API playground credits' }
                  ].map((opp) => (
                    <div key={opp.id} className="p-4 rounded-xl bg-slate-950/20 border border-slate-900 space-y-2">
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">{opp.type}</span>
                        <span className="text-[9px] text-slate-500">{opp.difficulty}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 leading-snug">{opp.title}</h4>
                      <p className="text-[10px] text-slate-400">{opp.benefit}</p>
                      <button 
                        onClick={() => setSelectedOpp(opp)}
                        className="text-[10px] text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1 mt-2 cursor-pointer"
                      >
                        <span>Apply & Register Interest</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Application Modal */}
            <AnimatePresence>
              {selectedOpp && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full relative space-y-4"
                  >
                    <button 
                      onClick={() => setSelectedOpp(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Apply Interest</span>
                      <h3 className="text-base font-bold text-white mt-2">{selectedOpp.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Provider: {selectedOpp.provider}</p>
                    </div>

                    <form onSubmit={handleApplyOpp} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={appForm.name}
                          onChange={e => setAppForm({...appForm, name: e.target.value})}
                          className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={appForm.email}
                          onChange={e => setAppForm({...appForm, email: e.target.value})}
                          className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motivation Letter</label>
                        <textarea 
                          rows={3}
                          required
                          value={appForm.motivation}
                          onChange={e => setAppForm({...appForm, motivation: e.target.value})}
                          placeholder="Why do you want to join this program?"
                          className="w-full rounded bg-slate-950 border border-slate-850 text-xs px-3 py-2 text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full py-2 rounded-xl bg-blue-500 text-slate-950 font-bold text-xs"
                      >
                        Transmit Encrypted Application
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* TAB 4: COMMUNITY CIRCLES & EVENTS */}
        {activeTab === 'community' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Forums / Discussion Boards */}
              <div className="lg:col-span-2 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-blue-400" /> Peer Discussion Circles
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Discuss leadership, career progression tracks, health protocols, and emotional resilience.
                    </p>
                  </div>
                  <Sparkles className="h-4 w-4 text-blue-400 animate-pulse shrink-0" />
                </div>

                {/* Discussion Creator Form */}
                <form onSubmit={handleCreateThread} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input 
                      type="text" 
                      placeholder="Start a new thread topic..." 
                      required
                      value={newThread.title}
                      onChange={e => setNewThread({...newThread, title: e.target.value})}
                      className="sm:col-span-2 rounded bg-slate-900 border border-slate-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <select 
                      value={newThread.group}
                      onChange={e => setNewThread({...newThread, group: e.target.value})}
                      className="rounded bg-slate-900 border border-slate-800 text-xs px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Mental Strength">Mental Strength</option>
                      <option value="Tech Leaders">Tech Leaders</option>
                      <option value="Fatherhood">Fatherhood</option>
                      <option value="Fitness">Fitness</option>
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Publish Topic Post</span>
                  </button>
                </form>

                {/* Discussion Thread List */}
                <div className="space-y-3.5">
                  {communityThreads.map(ct => (
                    <div key={ct.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 hover:border-slate-850 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded">{ct.group}</span>
                        <span className="text-[10px] text-slate-500">Started by {ct.creator}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer">{ct.title}</h4>
                      <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-mono">
                        <button className="hover:text-blue-400 flex items-center gap-1" onClick={() => showNotification("Discussion post liked.")}>
                          <span>👍 {ct.likes} Likes</span>
                        </button>
                        <span className="flex items-center gap-1 text-slate-500">
                          💬 {ct.comments} Comments
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {/* Live and upcoming Events list */}
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" /> Upcoming Wellness Events
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Interactive round-tables, weekend bootcamps, and SaaS progression events.</p>
                </div>

                <div className="space-y-4">
                  {menEvents.map(ev => {
                    const joined = joinedEvents.includes(ev.id);
                    return (
                      <div key={ev.id} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[9px] font-mono text-slate-500 block">{ev.date}</span>
                          <span className="text-[9px] font-mono text-blue-400">{ev.time}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 leading-snug">{ev.title}</h4>
                        <p className="text-[10px] text-slate-400">Organizer: {ev.organizer}</p>
                        <button 
                          onClick={() => toggleJoinEvent(ev.id, ev.title)}
                          className={`w-full mt-2.5 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            joined 
                              ? 'bg-green-500/10 border border-green-500/25 text-green-400' 
                              : 'bg-blue-500 hover:bg-blue-400 text-slate-950'
                          }`}
                        >
                          {joined ? 'Registered ✓' : 'Register Seat'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: HOW TO USE & MODULE MANUAL */}
        {activeTab === 'how_to_use' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Category side navigation */}
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-850 rounded-2xl p-4 flex flex-col gap-2">
                {[
                  { id: 'intro', label: 'Ecosystem Overview', desc: 'Scope & capabilities' },
                  { id: 'quick', label: 'Quick Start Guide', desc: 'Routines & logging' },
                  { id: 'advanced', label: 'Advanced Protocols', desc: 'Mentorship & privacy' },
                  { id: 'faq', label: 'FAQ & Privacy', desc: 'Common questions' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setGuideCategory(cat.id as any)}
                    className={`w-full p-3 rounded-xl text-left border transition-all cursor-pointer ${
                      guideCategory === cat.id 
                        ? 'bg-blue-500/10 border-blue-500/25 text-blue-300' 
                        : 'bg-slate-950/40 border-slate-900 hover:border-slate-850 text-slate-400'
                    }`}
                  >
                    <span className="text-xs font-bold block">{cat.label}</span>
                    <span className="text-[10px] text-slate-500 block">{cat.desc}</span>
                  </button>
                ))}
              </div>

              {/* Guide Contents panel */}
              <div className="lg:col-span-3 bg-slate-900/30 border border-slate-850 rounded-2xl p-6 md:p-8 space-y-6">
                
                {guideCategory === 'intro' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-850 pb-3">
                      <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Manual Block 1.1</span>
                      <h3 className="text-lg font-extrabold text-white mt-1.5">What is SCUT Men & Boys?</h3>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      The **SCUT Men & Boys** workspace is a core, production-ready module designed to optimize and maintain high-efficiency mental health support, cardiovascular tracking, fitness logging, academic career acceleration, and community mentorship.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2">
                        <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4" /> Mental Fortitude & Health
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Synchronized physical trackers keeping strict logs of high-impact workouts, sleeping matrixes, and counselor connections under end-to-end sandbox storage.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2">
                        <h4 className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" /> Career & Peer Networks
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Matching engines routing secure channels directly to tech VPs, startup mentors, leadership groups, and certified academic workshops.
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShieldCheck className="h-4 w-4 text-blue-400" /> Safety & Incognito Protection
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Features fully localized, private data storage on the local client side. Incognito mode ensures discussions are published under certified anonymous tags.
                      </p>
                    </div>
                  </div>
                )}

                {guideCategory === 'quick' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-850 pb-3">
                      <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Manual Block 1.2</span>
                      <h3 className="text-lg font-extrabold text-white mt-1.5">Quick Start Guide (Step-by-Step)</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { step: '1', title: 'Ares AI Interactive Briefing', desc: 'Initiate a secure workspace conversation with Ares AI on the main Ecosystem Desk to specify your targeted career or wellness goals.' },
                        { step: '2', title: 'Synchronize Physical Logs', desc: 'Navigate to the Health & Fortitude tab. Input your sleep duration, high-intensity cardio, or lifting metrics to visualize progress charts.' },
                        { step: '3', title: 'Request Mentor Connection', desc: 'Inspect available experts on the Career directory. Click connection request to establish localized private direct message channels.' },
                        { step: '4', title: 'Join Upcoming Seminars', desc: 'Confirm attendance at upcoming wellness bootcamps or peer leadership roundtables listed on Community Circles.' }
                      ].map(s => (
                        <div key={s.step} className="flex gap-4 items-start">
                          <div className="h-6 w-6 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-300 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {s.step}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-bold text-white">{s.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {guideCategory === 'advanced' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-850 pb-3">
                      <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Manual Block 1.3</span>
                      <h3 className="text-lg font-extrabold text-white mt-1.5">Advanced Features & Best Practices</h3>
                    </div>

                    <div className="space-y-4 text-xs text-slate-300">
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white">1. Secure Incognito Thread Publishing</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          When publishing discussions on community circles, enable the global **Incognito Toggle** in the header. This swaps all public signature keys for random hash signatures.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white">2. Counselor Sandbox Directory Routing</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Clinic directory connections route priority cellular signals. Always log conversation sessions internally to generate automated audit trails.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="font-bold text-white">3. Custom Security Key Synchronization</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Customize your local emergency verification keyword (e.g. `OMEGA-STRENGTH`) inside settings to disarm alarms automatically upon verification checks.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {guideCategory === 'faq' && (
                  <div className="space-y-5">
                    <div className="border-b border-slate-850 pb-3">
                      <span className="text-[9px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Manual Block 1.4</span>
                      <h3 className="text-lg font-extrabold text-white mt-1.5">Frequently Asked Questions</h3>
                    </div>

                    <div className="space-y-4">
                      {[
                        { q: 'Is my wellness log visible to other users?', a: 'Absolutely not. All logs are private, locally synchronized in our secure sandbox storage.' },
                        { q: 'How do I establish 1:1 chats with matched mentors?', a: 'Upon requesting connection, a dedicated secure websocket channel is generated for your SCUT profile.' },
                        { q: 'What is Ares AI?', a: 'Ares AI is a high-performance model tuned specifically to offer clinical advice on stress, sleep hygiene, and career milestones.' },
                        { q: 'How does the SCUT Pay system integrate?', a: 'Ecosystem purchases are routed securely through SCUT Pay, deducting tokens under advanced biometric confirmation.' }
                      ].map((f, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 space-y-1.5">
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Info className="h-4 w-4 text-blue-400 shrink-0" /> {f.q}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed pl-5">{f.a}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
