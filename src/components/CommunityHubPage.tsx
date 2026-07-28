/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Heart, Shield, MessageSquare, Briefcase, Cpu, Coins, Calendar, Bell,
  Menu, X, Lock, CheckCircle, AlertTriangle, Send, Search, Plus, Star, Award, 
  MapPin, Phone, Video, MessageCircle, HelpCircle, ArrowRight, ShieldCheck, 
  UserPlus, UserMinus, UserCheck, PhoneCall, VideoOff, Volume2, ShieldAlert,
  ShoppingBag, Terminal, Flag
} from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { collection, doc, updateDoc, setDoc, getDoc, onSnapshot, addDoc, query, orderBy, limit } from 'firebase/firestore';

import ModeratorDashboard from './ModeratorDashboard';
import VideoPlayer from './VideoPlayer';
import { 
  checkContentSafety, getUserModStatus, handleAutomaticViolation, submitReport, 
  COMMUNITY_GUIDELINES, UserModStatus, ModerationReport 
} from '../lib/moderationEngine';

interface CommunityHubPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onUpdateUser: (updated: Partial<any>) => void;
  onPayWithWallet?: (amount: string, description: string) => void;
  initialSubTab?: string;
}

interface SocialMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
}

interface Thread {
  id: string;
  space: string;
  author: string;
  authorRole: string;
  title: string;
  content: string;
  videoUrl?: string;
  likes: number;
  replies: number;
  date: string;
}

export default function CommunityHubPage({
  user, onNavigate, onAddLog, onUpdateUser, onPayWithWallet, initialSubTab = 'announcements'
}: CommunityHubPageProps) {
  const [activeTab, setActiveTab] = useState<string>(initialSubTab);
  const [subSidebarOpen, setSubSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trust & Safety States
  const [acceptedGuidelines, setAcceptedGuidelines] = useState(() => {
    return localStorage.getItem('scut_accepted_guidelines') === 'true';
  });
  const [guidelinesModalOpen, setGuidelinesModalOpen] = useState(!acceptedGuidelines);
  const [safetyWarning, setSafetyWarning] = useState<{ open: boolean; message: string; category?: string; penalty?: string } | null>(null);
  const [reportingItem, setReportingItem] = useState<{ type: 'message' | 'profile' | 'listing' | 'review' | 'file'; id: string; ownerName: string; ownerId: string; content: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [moderatorDashboardOpen, setModeratorDashboardOpen] = useState(false);

  // Community onboarding states
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [selectedCommunityChoice, setSelectedCommunityChoice] = useState<'women_girls' | 'men_boys' | null>(null);

  // Social & Real-time Direct Messages State
  const [activeChatUser, setActiveChatUser] = useState<any | null>(null);
  const [directMessages, setDirectMessages] = useState<Record<string, SocialMessage[]>>({});
  const [dmInput, setDmInput] = useState('');
  
  // Call simulation states
  const [activeCall, setActiveCall] = useState<{ type: 'voice' | 'video'; user: any } | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);

  // Group chat simulation
  const [groupChats, setGroupChats] = useState<any[]>([
    { id: 'gc-1', name: 'Global SCUT Developers', membersCount: 142, messages: [] }
  ]);
  const [activeGroupChat, setActiveGroupChat] = useState<any | null>(null);
  const [groupInput, setGroupInput] = useState('');

  // Forum threads state
  const [threads, setThreads] = useState<Thread[]>([
    { id: 't-0', space: 'announcements', author: 'SCUT Moderator', authorRole: 'Platform HQ', title: 'Platform Ecosystem Video Demo & Guidelines', content: 'Watch the official video demonstration showing SCUT AI, SCUT Water, SCUT Pay and decentralization features.', videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso', likes: 112, replies: 24, date: 'Just now' },
    { id: 't-1', space: 'developers', author: 'Alex_SCUTDev', authorRole: 'Core Dev', title: 'Speeding up multi-chain consensus on SCUT Nodes', content: 'We are currently analyzing optimizations for consensus layers. Adding localized validators in Berlin has dropped block propagation latency by 140ms.', likes: 32, replies: 9, date: '1 hour ago' },
    { id: 't-2', space: 'crypto', author: 'CosmicTrader', authorRole: 'Hedge Node Operator', title: 'SCUT Token (POL) Liquidity Pools Expansion', content: 'Our liquidity mining rewards program for POL pairs begins next Monday. Be prepared to lock your liquidity for high APR multipliers!', likes: 45, replies: 12, date: '3 hours ago' },
    { id: 't-3', space: 'business', author: 'Elena R.', authorRole: 'Startup Capital Founder', title: 'Diaspora Microloans & Decentralized Credit Hubs', content: 'We are launching the diaspora microfinance module. Connecting Romanian business owners worldwide to raise peer-to-peer business credits.', likes: 58, replies: 16, date: 'Yesterday' }
  ]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');
  const [newThreadVideoUrl, setNewThreadVideoUrl] = useState('');
  const [threadModalOpen, setThreadModalOpen] = useState(false);

  // Simulated directory of community members
  const [members, setMembers] = useState<any[]>([
    { id: 'u-1', name: 'Ana Maria Radu', community: 'women_girls', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ana', role: 'AI Safety Advocate', location: 'Cluj-Napoca', isOnline: true },
    { id: 'u-2', name: 'Mihai Daniel', community: 'men_boys', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=mihai', role: 'Node Operator', location: 'Bucharest', isOnline: true },
    { id: 'u-3', name: 'Sophia Sterling', community: 'women_girls', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sophia', role: 'UX Director', location: 'London', isOnline: false },
    { id: 'u-4', name: 'Vlad Popescu', community: 'men_boys', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=vlad', role: 'Security Engineer', location: 'Timișoara', isOnline: true },
    { id: 'u-5', name: 'Gabi Paduraru', community: 'men_boys', avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=gabi', role: 'Founder & Architect', location: 'Iași', isOnline: true }
  ]);

  // Sync subTab changes
  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  // Timer for active calls
  useEffect(() => {
    let interval: any;
    if (activeCall) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCall]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Safe emergency triggers
  const handleOnboardingChoose = async (community: 'women_girls' | 'men_boys') => {
    if (!auth.currentUser) {
      showNotification("Please sign in or use local mode to save settings.");
      return;
    }
    const updated = {
      ...user,
      selectedCommunity: community,
      privacySettings: user?.privacySettings || {
        whoCanMessageMe: 'all',
        whoCanCallMe: 'all',
        whoCanInviteMe: 'all',
        whoCanSeeProfile: 'all',
        whoCanSeeOnlineStatus: 'all'
      }
    };
    onUpdateUser(updated);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        selectedCommunity: community,
        privacySettings: updated.privacySettings
      });
      showNotification(`Successfully joined the SCUT ${community === 'women_girls' ? 'Women & Girls' : 'Men & Boys'} protected community!`);
      setOnboardingOpen(false);
      onAddLog('Joined Community', `Authorized entry to private ${community} space`, 'security');
    } catch (e) {
      console.error(e);
      showNotification("Error saving community selection to database.");
    }
  };

  const checkPrivateAccess = (space: 'women_girls' | 'men_boys') => {
    if (!user) {
      return 'unauthenticated';
    }
    const isSuperAdmin = !!(user && (
      user.isAdmin || 
      user.email?.toLowerCase() === 'echipa@romaniacurajoasa.info' ||
      user.email?.toLowerCase() === 'gabrielicloudi@icloud.com' || 
      user.email?.toLowerCase() === 'contact.gabrielpaduraru@gmail.com'
    ));
    if (isSuperAdmin) {
      return 'authorized';
    }
    if (!user.selectedCommunity || user.selectedCommunity === 'none') {
      return 'onboarding';
    }
    if (user.selectedCommunity !== space) {
      return 'blocked';
    }
    return 'authorized';
  };

  const handleSpaceClick = (spaceId: string) => {
    if (spaceId === 'women_girls') {
      const status = checkPrivateAccess('women_girls');
      if (status === 'unauthenticated') {
        showNotification("Authentication is required to enter the protected Women & Girls community.");
        return;
      }
      if (status === 'onboarding') {
        setOnboardingOpen(true);
        setSelectedCommunityChoice('women_girls');
        return;
      }
      if (status === 'blocked') {
        showNotification("Access Denied: This is a private community space for Women & Girls.");
        return;
      }
    } else if (spaceId === 'men_boys') {
      const status = checkPrivateAccess('men_boys');
      if (status === 'unauthenticated') {
        showNotification("Authentication is required to enter the protected Men & Boys community.");
        return;
      }
      if (status === 'onboarding') {
        setOnboardingOpen(true);
        setSelectedCommunityChoice('men_boys');
        return;
      }
      if (status === 'blocked') {
        showNotification("Access Denied: This is a private community space for Men & Boys.");
        return;
      }
    }
    setActiveTab(spaceId);
    setSubSidebarOpen(false);
    onAddLog('Navigated Community Hub', `Opened channel: ${spaceId}`, 'chat');
  };

  // Direct Messaging Actions
  const handleSendDM = async (userId: string) => {
    if (!dmInput.trim()) return;

    // Check user moderation status
    const modStatus = await getUserModStatus(user?.email || 'current_user', user?.name || 'You');
    if (modStatus.isBanned) {
      setSafetyWarning({
        open: true,
        message: 'You have been PERMANENTLY BANNED from the SCUT community due to repeated violations.',
        category: 'Banned Account',
        penalty: 'Account Disabled'
      });
      return;
    }
    
    if (modStatus.muteUntil && new Date(modStatus.muteUntil) > new Date()) {
      setSafetyWarning({
        open: true,
        message: `You are temporarily MUTED and cannot send messages until ${new Date(modStatus.muteUntil).toLocaleTimeString()}.`,
        category: 'Active Penalty',
        penalty: 'Temporary Mute'
      });
      return;
    }

    // Run safety classification check
    const safetyResult = checkContentSafety(dmInput);
    if (!safetyResult.isSafe) {
      // Automatic violation escalation
      const autoViolation = await handleAutomaticViolation(
        user?.email || 'current_user',
        user?.name || 'You',
        dmInput,
        safetyResult.category || 'Abusive Content'
      );
      
      setSafetyWarning({
        open: true,
        message: safetyResult.reason || 'Content blocked.',
        category: safetyResult.category,
        penalty: autoViolation.penaltyMessage
      });
      
      setDmInput(''); // clear flagged message text
      return;
    }

    const newMessage: SocialMessage = {
      id: 'dm-' + Math.random().toString(36).substring(2, 9),
      senderId: user?.email || 'current_user',
      senderName: user?.name || 'You',
      senderAvatar: user?.avatarUrl || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user',
      text: dmInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDirectMessages(prev => {
      const currentList = prev[userId] || [];
      return { ...prev, [userId]: [...currentList, newMessage] };
    });
    setDmInput('');
    onAddLog('Direct Message Sent', `Sent message to member ${userId}`, 'chat');
  };

  const handleStartCall = (member: any, type: 'voice' | 'video') => {
    setActiveCall({ type, user: member });
    onAddLog('Call Initialized', `Started ${type} call with ${member.name}`, 'security');
  };

  const handleToggleFollow = (memberId: string) => {
    const isFollowing = user?.following?.includes(memberId);
    let nextFollowing = user?.following ? [...user.following] : [];
    if (isFollowing) {
      nextFollowing = nextFollowing.filter((id: string) => id !== memberId);
      showNotification(`Unfollowed ${members.find(m => m.id === memberId)?.name}`);
    } else {
      nextFollowing.push(memberId);
      showNotification(`Following ${members.find(m => m.id === memberId)?.name}`);
    }
    onUpdateUser({ ...user, following: nextFollowing });
    onAddLog('Social Update', `Modified following state of ${memberId}`, 'chat');
  };

  const handleSendFriendRequest = (memberId: string) => {
    showNotification(`Friend request sent successfully to ${members.find(m => m.id === memberId)?.name}`);
    onAddLog('Social Update', `Dispatched friend request to ${memberId}`, 'chat');
  };

  // Forums Actions
  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    // Check user status
    const modStatus = await getUserModStatus(user?.email || 'current_user', user?.name || 'You');
    if (modStatus.isBanned) {
      setSafetyWarning({
        open: true,
        message: 'You have been PERMANENTLY BANNED from the SCUT community due to repeated violations.',
        category: 'Banned Account',
        penalty: 'Account Disabled'
      });
      return;
    }
    
    if (modStatus.muteUntil && new Date(modStatus.muteUntil) > new Date()) {
      setSafetyWarning({
        open: true,
        message: `You are temporarily MUTED and cannot post threads until ${new Date(modStatus.muteUntil).toLocaleTimeString()}.`,
        category: 'Active Penalty',
        penalty: 'Temporary Mute'
      });
      return;
    }

    // Safety checks on title and content
    const combinedText = `${newThreadTitle} ${newThreadContent}`;
    const safetyResult = checkContentSafety(combinedText);
    if (!safetyResult.isSafe) {
      // Escalation of penalty
      const autoViolation = await handleAutomaticViolation(
        user?.email || 'current_user',
        user?.name || 'You',
        combinedText,
        safetyResult.category || 'Abusive Content'
      );
      
      setSafetyWarning({
        open: true,
        message: safetyResult.reason || 'Content blocked.',
        category: safetyResult.category,
        penalty: autoViolation.penaltyMessage
      });
      
      // Clear inputs to protect space
      setNewThreadTitle('');
      setNewThreadContent('');
      setThreadModalOpen(false);
      return;
    }

    const newThread: Thread = {
      id: 'thread-' + Math.random().toString(36).substring(2, 9),
      space: activeTab,
      author: user?.name || 'Anonymous Peer',
      authorRole: user?.subscriptionTier === 'free' ? 'Standard Member' : 'Premium Pioneer',
      title: newThreadTitle,
      content: newThreadContent,
      videoUrl: newThreadVideoUrl.trim() || undefined,
      likes: 1,
      replies: 0,
      date: 'Just now'
    };
    setThreads(prev => [newThread, ...prev]);
    setNewThreadTitle('');
    setNewThreadContent('');
    setNewThreadVideoUrl('');
    setThreadModalOpen(false);
    showNotification("Discussion thread posted successfully!");
    onAddLog('Community Forum', `Created discussion thread in space: ${activeTab}`, 'chat');
  };

  const handleLikeThread = (threadId: string) => {
    setThreads(prev => prev.map(t => t.id === threadId ? { ...t, likes: t.likes + 1 } : t));
    onAddLog('Community Forum', `Liked discussion thread ${threadId}`, 'chat');
  };

  // Sidebar Channels definitions
  const communitySpaces = [
    // PUBLIC SHARED CHANNELS
    { id: 'general', name: 'General Community', category: 'shared', desc: 'Global assembly for SCUT members', icon: Users, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'marketplace_comm', name: 'Marketplace Community', category: 'shared', desc: 'Peer-to-peer trading discussion', icon: ShoppingBag, color: 'text-yellow-400 bg-yellow-500/10' },
    { id: 'business_hub', name: 'Business Hub', category: 'shared', desc: 'Decentralized enterprises & microcredits', icon: Briefcase, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'ai_lounge', name: 'AI Lounge', category: 'shared', desc: 'Model architectures & prompt synthesis', icon: Cpu, color: 'text-cyan-400 bg-cyan-500/10' },
    { id: 'developers_forum', name: 'Developers Sandbox', category: 'shared', desc: 'Compile queries & test APIs together', icon: Terminal, color: 'text-pink-400 bg-pink-500/10' },
    { id: 'crypto_arena', name: 'Crypto & POL Arena', category: 'shared', desc: 'Token liquidity, staking, and node gas', icon: Coins, color: 'text-purple-400 bg-purple-500/10' },
    { id: 'events', name: 'Diaspora Events', category: 'shared', desc: 'Hackathons & physical meetups', icon: Calendar, color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'announcements', name: 'Announcements', category: 'shared', desc: 'Ecosystem development roadmaps', icon: Bell, color: 'text-teal-400 bg-teal-500/10' },
    { id: 'member_dir', name: 'Member Directory & Chat', category: 'shared', desc: 'Direct message, follow & secure calls', icon: Users, color: 'text-violet-400 bg-violet-500/10' }
  ];

  if (moderatorDashboardOpen) {
    return (
      <div className="flex-1 flex flex-col bg-slate-950 min-h-[calc(100vh-64px)]">
        <div className="bg-slate-900 border-b border-slate-850 px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-slate-400 font-mono font-bold">SCUT Trust & Safety Node</span>
          </div>
          <button
            onClick={() => setModeratorDashboardOpen(false)}
            className="text-xs px-3 py-1 bg-slate-850 hover:bg-slate-800 rounded-lg text-red-400 font-bold border border-red-500/20 cursor-pointer"
          >
            ← Return to Community Chat
          </button>
        </div>
        <ModeratorDashboard user={user} onNavigate={onNavigate} onAddLog={onAddLog} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 text-slate-100 min-h-[calc(100vh-64px)] relative overflow-hidden">
      
      {/* MOBILE TRIGGER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Users className="h-4 w-4" />
          </div>
          <span className="font-display font-extrabold text-sm text-white">Community Arena</span>
        </div>
        <button 
          onClick={() => setSubSidebarOpen(!subSidebarOpen)}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          {subSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* SUB-SIDEBAR FOR COMMUNITY SPACES */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 md:z-10
        w-64 bg-slate-900/50 border-r border-slate-900/80 p-4 flex flex-col gap-4 shrink-0 h-full
        transition-transform duration-300 transform md:transform-none
        ${subSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center gap-2 px-2 py-1">
          <div className="p-1.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400">
            <Users className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
              SCUT Hub <span className="text-[9px] font-mono font-bold tracking-widest text-pink-400 bg-pink-400/10 px-1 py-0.5 rounded border border-pink-400/20">Global</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">Diaspora Social Assembly</p>
          </div>
        </div>

        {/* CHANNELS ACCORDION */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          
          {/* PUBLIC SHARED CHANNELS */}
          <div className="space-y-1">
            <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500 px-2.5">Public Shared Assembly</div>
            {communitySpaces.filter(s => s.category === 'shared').map((space) => {
              const IconComponent = space.icon;
              const isActive = activeTab === space.id;
              return (
                <button
                  key={space.id}
                  onClick={() => handleSpaceClick(space.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-slate-900 border border-slate-800 text-white font-bold' 
                      : 'hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg border border-slate-800 ${isActive ? space.color : 'bg-slate-950 text-slate-600'}`}>
                    <IconComponent className="h-3.5 w-3.5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold leading-none">{space.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 truncate font-normal">{space.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* ACCESS STATUS BRAND */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 space-y-1.5">
          <p className="text-[9px] font-mono text-slate-500 uppercase leading-none">Your Identity Shield</p>
          <div className="flex items-center gap-1.5 mt-1 animate-fade-in">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-white uppercase truncate">
              {user?.selectedCommunity === 'women_girls' ? 'Women & Girls Circle' : user?.selectedCommunity === 'men_boys' ? 'Men & Boys Circle' : 'Unallocated Peer'}
            </span>
          </div>

          <button
            onClick={() => setModeratorDashboardOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 mt-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl transition-all cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5" /> Trust & Safety HQ
          </button>
        </div>
      </aside>

      {/* CORE VIEWPORT */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-[calc(100vh-64px)] md:h-auto">
        <div className="flex-1 overflow-y-auto w-full relative p-6">
          
          <AnimatePresence mode="wait">
            
            {/* SHARED PUBLIC DISCUSSION SPACE FORUMS */}
            {activeTab !== 'member_dir' && (
              <motion.div key="forums" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-pink-400 bg-pink-500/10 border border-pink-500/15 px-1.5 py-0.5 rounded">Shared Public Arena</span>
                    <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2">
                      {communitySpaces.find(s => s.id === activeTab)?.name}
                    </h1>
                    <p className="text-slate-400 text-xs md:text-sm mt-1 font-light">
                      {communitySpaces.find(s => s.id === activeTab)?.desc}. Open to both community branches for collective growth.
                    </p>
                  </div>
                  <button 
                    onClick={() => setThreadModalOpen(true)}
                    className="px-4 py-2.5 bg-pink-500 hover:bg-pink-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-pink-500/10"
                  >
                    <Plus className="h-4 w-4" /> Start New Discussion
                  </button>
                </div>

                {/* THREADS LIST */}
                <div className="space-y-4">
                  {threads.filter(t => t.space === activeTab || activeTab === 'general').map((thread) => (
                    <div key={thread.id} className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 transition-all space-y-4 relative overflow-hidden">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-display font-bold text-xs text-white uppercase">
                            {thread.author[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-white">{thread.author}</span>
                              <span className="text-[9px] font-mono uppercase tracking-widest text-pink-400 bg-pink-500/5 px-1.5 py-0.5 border border-pink-500/10 rounded">{thread.authorRole}</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-100 mt-1.5 leading-snug">{thread.title}</h3>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{thread.date}</span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pl-13">{thread.content}</p>

                      {thread.videoUrl && (
                        <div className="pl-13 pt-2 max-w-3xl">
                          <VideoPlayer
                            url={thread.videoUrl}
                            title={thread.title}
                            description={`Community video attachment shared by ${thread.author}`}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-4 pl-13 pt-3 border-t border-slate-900/60 text-[10px] font-mono text-slate-400">
                        <button onClick={() => handleLikeThread(thread.id)} className="flex items-center gap-1.5 hover:text-pink-400 transition-colors cursor-pointer">
                          <Heart className="h-4 w-4" /> {thread.likes} Likes
                        </button>
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="h-4 w-4" /> {thread.replies} Replies
                        </div>
                        <button 
                          onClick={() => setReportingItem({
                            type: 'message',
                            id: thread.id,
                            ownerName: thread.author,
                            ownerId: thread.author,
                            content: `${thread.title}: ${thread.content}`
                          })}
                          className="flex items-center gap-1.5 hover:text-red-400 transition-colors ml-auto cursor-pointer"
                        >
                          <Flag className="h-4 w-4" /> Report Thread
                        </button>
                      </div>
                    </div>
                  ))}

                  {threads.filter(t => t.space === activeTab || activeTab === 'general').length === 0 && (
                    <div className="text-center py-16 rounded-3xl border border-dashed border-slate-900 space-y-2">
                      <MessageCircle className="h-10 w-10 text-slate-700 mx-auto animate-pulse" />
                      <p className="text-xs font-bold text-slate-400">No Discussions Active Yet</p>
                      <p className="text-[11px] text-slate-600">Be the pioneer! Start the very first thread in this shared public circle.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* MEMBER DIRECTORY & SOCIAL DM HUB */}
            {activeTab === 'member_dir' && (
              <motion.div key="directory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto space-y-8 pb-12">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-violet-400 bg-violet-500/10 border border-violet-500/15 px-1.5 py-0.5 rounded">Social Ecosystem Upgrade</span>
                  <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2">
                    Member Directory & Unified Messenger
                  </h1>
                  <p className="text-slate-400 text-xs md:text-sm mt-1 font-light">
                    Establish secure links with diaspora members. Exchanged messages and calls are protected under client configurations.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Members Directory Column */}
                  <div className="lg:col-span-5 space-y-4">
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Platform Pioneers ({members.length})</h2>
                    <div className="space-y-3">
                      {members.map((member) => {
                        const isFollowing = user?.following?.includes(member.id);
                        return (
                          <div key={member.id} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-850 transition-all flex justify-between items-center">
                            <div className="flex items-center gap-3 truncate">
                              <div className="relative shrink-0">
                                <img src={member.avatarUrl} alt={member.name} className="h-10 w-10 rounded-full bg-slate-950 border border-slate-800" />
                                {member.isOnline && (
                                  <span className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                                )}
                              </div>
                              <div className="truncate">
                                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                                  {member.name}
                                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                                    member.community === 'women_girls' ? 'bg-pink-500/10 text-pink-400' : 'bg-blue-500/10 text-blue-400'
                                  }`}>
                                    {member.community === 'women_girls' ? 'W&G' : 'M&B'}
                                  </span>
                                </h3>
                                <p className="text-[10px] text-slate-400 mt-0.5">{member.role} • {member.location}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Direct Message trigger */}
                              <button 
                                onClick={() => setActiveChatUser(member)}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
                              {/* Call buttons */}
                              <button 
                                onClick={() => handleStartCall(member, 'voice')}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Phone className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleStartCall(member, 'video')}
                                className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                <Video className="h-3.5 w-3.5" />
                              </button>
                              {/* Follow Toggle */}
                              <button 
                                onClick={() => handleToggleFollow(member.id)}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isFollowing 
                                    ? 'bg-pink-500/10 border-pink-500/25 text-pink-400' 
                                    : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-white'
                                }`}
                              >
                                <Star className="h-3.5 w-3.5 fill-current" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Message Window Column */}
                  <div className="lg:col-span-7">
                    {activeChatUser ? (
                      <div className="h-[480px] rounded-3xl bg-slate-950 border border-slate-900 flex flex-col overflow-hidden shadow-2xl">
                        {/* Chat Header */}
                        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-900 flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <img src={activeChatUser.avatarUrl} alt={activeChatUser.name} className="h-9 w-9 rounded-full bg-slate-950 border border-slate-800" />
                            <div>
                              <h3 className="text-xs font-bold text-white">{activeChatUser.name}</h3>
                              <p className="text-[10px] text-slate-500 leading-none mt-0.5">{activeChatUser.role}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setActiveChatUser(null)}
                            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Chat Messages Screen */}
                        <div className="flex-1 p-5 overflow-y-auto space-y-4">
                          {(directMessages[activeChatUser.id] || []).map((msg) => {
                            const isMe = msg.senderId === (user?.email || 'current_user');
                            return (
                              <div key={msg.id} className={`flex gap-2 max-w-md ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                                <img src={msg.senderAvatar} alt={msg.senderName} className="h-7 w-7 rounded-full bg-slate-900 shrink-0" />
                                <div className="relative group flex items-center gap-2">
                                  <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                                    isMe ? 'bg-violet-500 text-white rounded-tr-none' : 'bg-slate-900 text-slate-100 rounded-tl-none'
                                  }`}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <p className={`text-[8px] text-right ${isMe ? 'text-white/70' : 'text-slate-500'}`}>{msg.timestamp}</p>
                                  </div>
                                  {!isMe && (
                                    <button 
                                      onClick={() => setReportingItem({
                                        type: 'message',
                                        id: msg.id,
                                        ownerName: msg.senderName,
                                        ownerId: msg.senderId,
                                        content: msg.text
                                      })}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                                      title="Report Message"
                                    >
                                      <Flag className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          {(directMessages[activeChatUser.id] || []).length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 py-12 text-slate-600">
                              <MessageCircle className="h-10 w-10 text-slate-800 animate-pulse" />
                              <p className="text-xs font-bold text-slate-500">Secure Direct Message Channel</p>
                              <p className="text-[10px] max-w-xs mx-auto">
                                Say hello to Ana or Gabi to test active peer-to-peer decentralized communication arrays.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Chat Input */}
                        <form 
                          onSubmit={(e) => { e.preventDefault(); handleSendDM(activeChatUser.id); }}
                          className="p-4 border-t border-slate-900 bg-slate-900/20 flex gap-2"
                        >
                          <input 
                            type="text"
                            placeholder={`Type message to ${activeChatUser.name}...`}
                            value={dmInput}
                            onChange={(e) => setDmInput(e.target.value)}
                            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-400"
                          />
                          <button 
                            type="submit"
                            className="p-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-white transition-colors cursor-pointer"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="h-[480px] rounded-3xl border border-slate-900 flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <Users className="h-12 w-12 text-slate-800 animate-pulse" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400">Select a member to chat</p>
                          <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
                            Direct messages are fully isolated and protected based on each member's private privacy control choices.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ACCESS SYSTEM GATE ONBOARDING OVERLAY */}
      <AnimatePresence>
        {onboardingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-850 p-8 space-y-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setOnboardingOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>

              {selectedCommunityChoice === 'women_girls' ? (
                /* Women & Girls Activation Modality */
                <div className="space-y-5 text-center">
                  <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit mx-auto">
                    <Heart className="h-10 w-10 text-rose-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-display font-extrabold text-white">Join SCUT Women & Girls</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Unlock access to safety hotlines, secure peer-to-peer chats, female leadership mentorship pools, and business workspaces.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOnboardingChoose('women_girls')}
                    className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-500/10 cursor-pointer"
                  >
                    Activate My Secure Workspace Access
                  </button>
                </div>
              ) : (
                /* Men & Boys Activation Modality */
                <div className="space-y-5 text-center">
                  <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mx-auto">
                    <Shield className="h-10 w-10 text-blue-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-display font-extrabold text-white">Join SCUT Men & Boys</h2>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Unlock access to biometric monitors, career roadmap builders, technology mentorship sprints, and professional peers.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleOnboardingChoose('men_boys')}
                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-500/10 cursor-pointer"
                  >
                    Activate My Secure Workspace Access
                  </button>
                </div>
              )}

              <div className="text-[10px] text-slate-500 text-center max-w-md mx-auto leading-normal">
                ⚠️ **Identity Workspace Policy**: To keep our community spaces safe, choosing this circle restricts your primary profile's community permissions to this protected workspace.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CALLING EMULATOR SCREEN */}
      <AnimatePresence>
        {activeCall && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-850 p-8 text-center space-y-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> SECURE TUNNEL
              </div>

              <div className="space-y-4">
                <div className="relative mx-auto h-24 w-24">
                  <img src={activeCall.user.avatarUrl} alt={activeCall.user.name} className="h-full w-full rounded-full bg-slate-950 border-2 border-violet-500/40 p-1" />
                  <span className="absolute bottom-1 right-1 h-5 w-5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeCall.user.name}</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{activeCall.user.role}</p>
                </div>
                <div className="text-xs text-violet-400 font-mono tracking-wider">
                  {activeCall.type.toUpperCase()} CALL ACTIVE: {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                </div>
              </div>

              {/* Animated audio waves */}
              <div className="flex justify-center items-center gap-1.5 h-12">
                {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, idx) => (
                  <motion.div 
                    key={idx}
                    animate={{ height: isMuted ? 4 : [val * 3, val * 6, val * 3] }}
                    transition={{ repeat: Infinity, duration: 1.2 + idx * 0.05 }}
                    className="w-1 rounded-full bg-violet-400"
                  />
                ))}
              </div>

              {/* Calling Tools Controls */}
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full border transition-all cursor-pointer ${
                    isMuted 
                      ? 'bg-red-500/15 border-red-500/25 text-red-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <Volume2 className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={() => setIsCamOff(!isCamOff)}
                  className={`p-4 rounded-full border transition-all cursor-pointer ${
                    isCamOff 
                      ? 'bg-red-500/15 border-red-500/25 text-red-400' 
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <VideoOff className="h-5 w-5" />
                </button>

                <button 
                  onClick={() => { setActiveCall(null); showNotification("Call ended successfully."); }}
                  className="p-4 rounded-full bg-red-500 text-white hover:bg-red-400 transition-all cursor-pointer"
                >
                  <PhoneCall className="h-5 w-5 rotate-135" />
                </button>
              </div>

              <div className="text-[9px] font-mono text-slate-500">
                End-to-End Cryptography: SHA-256 Signal Protocol Node Client
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE THREAD MODAL */}
      <AnimatePresence>
        {threadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.form 
              onSubmit={handleCreateThread}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full rounded-3xl bg-slate-900 border border-slate-850 p-6 space-y-4 shadow-2xl relative"
            >
              <button 
                type="button"
                onClick={() => setThreadModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>

              <h2 className="text-lg font-display font-extrabold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-pink-400" /> Start Discussion Thread
              </h2>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Topic Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter short, descriptive title..."
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Discussion Prompt Context</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe your inquiry, tech proposal, or trading deal in full detail..."
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Optional Video Link (YouTube, Vimeo, MP4) 🎬
                  </label>
                  <input 
                    type="url"
                    placeholder="e.g. https://www.youtube.com/watch?v=... or .mp4 URL"
                    value={newThreadVideoUrl}
                    onChange={(e) => setNewThreadVideoUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setThreadModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-pink-500 hover:bg-pink-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg shadow-pink-500/10 cursor-pointer"
                >
                  Publish Discussion
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* 1. COMMUNITY GUIDELINES AGREEMENT ONBOARDING */}
      <AnimatePresence>
        {guidelinesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-850 p-6 space-y-5 shadow-2xl relative text-left"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-850">
                <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
                  <Shield className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-white">SCUT Safe Community Policy</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Accept community guidelines to participate</p>
                </div>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                <p className="text-xs text-slate-400 leading-relaxed font-light font-sans">
                  Welcome to SCUT Platform. To keep our global diaspora network safe, supportive, and highly collaborative, you must agree to follow our Core Community Guidelines:
                </p>
                {COMMUNITY_GUIDELINES.map((guide, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-900 space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span className="text-[9px] font-mono bg-red-400/10 text-red-400 px-1 py-0.5 rounded border border-red-400/15">#{idx + 1}</span>
                      {guide.title}
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">{guide.text}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  localStorage.setItem('scut_accepted_guidelines', 'true');
                  setAcceptedGuidelines(true);
                  setGuidelinesModalOpen(false);
                  showNotification("Community Guidelines Accepted!");
                }}
                className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/10 cursor-pointer text-center block"
              >
                I Agree & Bind to SCUT Terms
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. AUTOMATED CONTENT MODERATION WARNING WARNING */}
      <AnimatePresence>
        {safetyWarning && safetyWarning.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-red-500/20 p-6 space-y-4 shadow-2xl relative text-left"
            >
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-850">
                <div className="p-1.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400">
                  <AlertTriangle className="h-5 w-5 text-red-400 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-white">Community Safety Interception</h3>
                  <p className="text-[10px] text-slate-500 font-mono">Content violated SCUT Community Guidelines</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/10 text-slate-300 space-y-2 text-xs">
                <p className="leading-relaxed text-red-400 font-semibold">{safetyWarning.message}</p>
                {safetyWarning.category && (
                  <p className="text-[10px] font-mono text-slate-500">
                    Category: <strong className="text-slate-300 font-semibold">{safetyWarning.category}</strong>
                  </p>
                )}
              </div>

              {safetyWarning.penalty && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 space-y-1">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none">Automatic Penalties Escalation</p>
                  <p className="text-xs font-bold text-amber-400 mt-1">{safetyWarning.penalty}</p>
                </div>
              )}

              <button
                type="button"
                onClick={() => setSafetyWarning(null)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer text-center block"
              >
                Acknowledge and Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. SUBMIT A COMMUNITY REPORT MODAL */}
      <AnimatePresence>
        {reportingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-850 p-6 space-y-4 shadow-2xl relative text-left"
            >
              <button
                type="button"
                onClick={() => setReportingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-400" /> Report Content / Profile
              </h3>

              <div className="space-y-3 pt-1">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900 text-xs text-slate-400">
                  <p>Target Type: <strong className="uppercase font-mono text-slate-300">{reportingItem.type}</strong></p>
                  <p className="mt-1">Content Owner: <strong className="text-slate-300">{reportingItem.ownerName}</strong></p>
                  {reportingItem.content && (
                    <p className="mt-2 text-[10px] font-mono text-slate-500 italic bg-slate-950 p-2 rounded border border-slate-900 max-h-16 overflow-y-auto">
                      "{reportingItem.content}"
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-mono font-bold">REASON FOR REPORTING</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe how this violates community rules (e.g. harrassment, slurs, explicit files, spam)..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setReportingItem(null)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:bg-slate-850 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!reportReason.trim()) return;
                    await submitReport({
                      reporterId: user?.email || 'reporter',
                      reporterName: user?.name || 'Anonymous reporter',
                      targetId: reportingItem.id,
                      targetType: reportingItem.type,
                      targetContent: reportingItem.content || `Profile of user: ${reportingItem.ownerName}`,
                      targetOwnerId: reportingItem.ownerId,
                      targetOwnerName: reportingItem.ownerName,
                      reason: reportReason
                    });
                    setReportingItem(null);
                    setReportReason('');
                    showNotification("Thank you. Report filed successfully and routed to Moderator HQ.");
                    onAddLog('Report Submitted', `Filed report on ${reportingItem.type} owned by ${reportingItem.ownerName}`, 'security');
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white shadow-2xl flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
