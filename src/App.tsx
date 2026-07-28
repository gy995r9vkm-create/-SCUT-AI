/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Menu, X, User as UserIcon, Zap, LayoutDashboard, MessageSquare, Key, BookOpen, 
  HelpCircle, MessageCircle, Shield, ArrowUpRight, Cpu, Sparkles, ChevronRight, Settings,
  Coins, ShoppingBag, Heart, Briefcase, Globe, Search, ChevronDown, Monitor, Layout, Sliders,
  Smartphone, Terminal, GraduationCap, Video, Volume2, ShieldAlert, FileText, ShoppingCart,
  Users, Award, Tag, Bell, List, Calendar, Lock, ShieldCheck, ArrowRight, ArrowLeft, Droplets, LogOut, Mail
} from 'lucide-react';
import { onAuthStateChanged, signOut as firebaseSignOut, applyActionCode } from 'firebase/auth';
import { auth } from './lib/firebase';
import { 
  saveUserDoc, 
  getUserDoc, 
  listenToChats, 
  saveChat, 
  deleteChat, 
  listenToSavedPrompts, 
  saveSavedPrompt, 
  deleteSavedPrompt, 
  listenToApiKeys, 
  saveApiKey, 
  deleteApiKey, 
  listenToActivityLogs, 
  saveActivityLog,
  uploadBase64Attachment,
  listenToFolders,
  saveFolder,
  deleteFolder
} from './lib/db';

import { User, Chat, Message, SavedPrompt, ApiKey, ActivityLog, SubscriptionTier, Language, Folder } from './types';
import Home from './components/Home';
import ChatWorkspace from './components/ChatWorkspace';
import Dashboard from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import SubscriptionPage from './components/SubscriptionPage';
import FeaturesPage from './components/FeaturesPage';
import PricingPage from './components/PricingPage';
import ApiPage from './components/ApiPage';
import DevelopersPage from './components/DevelopersPage';
import ContactPage from './components/ContactPage';
import FaqPage from './components/FaqPage';
import BlogPage from './components/BlogPage';
import LegalPages from './components/LegalPages';
import AuthModals from './components/AuthModals';
import SettingsPage from './components/SettingsPage';
import AdminDashboard from './components/AdminDashboard';
import ScutPayPage from './components/ScutPayPage';
import MarketplacePage from './components/MarketplacePage';
import MicaBucuriePage from './components/MicaBucuriePage';
import BusinessPage from './components/BusinessPage';
import AboutPage from './components/AboutPage';
import ScutTokenPage from './components/ScutTokenPage';
import ScutWomenPage from './components/ScutWomenPage';
import ScutMenPage from './components/ScutMenPage';
import ScutChatPage from './components/ScutChatPage';
import DSPlayground from './components/design-system/DSPlayground';
import ScutCreditsPage from './components/ScutCreditsPage';
import ScutWaterPage from './components/ScutWaterPage';
import { earnCredits } from './lib/credits';
import { translations, detectUserLanguage, t as tDynamic } from './lib/translations';
import { LanguageProvider } from './lib/LanguageContext';

// SCUT Intelligence Ecosystem Pages
import ImageStudioPage from './components/ImageStudioPage';
import VoiceAiPage from './components/VoiceAiPage';
import WebSearchPage from './components/WebSearchPage';
import FileManagerPage from './components/FileManagerPage';
import PromptLibraryPage from './components/PromptLibraryPage';
import NotificationsPage from './components/NotificationsPage';
import AnalyticsPage from './components/AnalyticsPage';
import SupportCenterPage from './components/SupportCenterPage';
import SecurityCenterPage from './components/SecurityCenterPage';
import ActivityHistoryPage from './components/ActivityHistoryPage';
import { HELP_GUIDES, ModuleHelpOverlay } from './components/HelpGuides';

// Newly added SCUT Ecosystem modular components
import WalletPage from './components/WalletPage';
import AiSuitePages from './components/AiSuitePages';
import VirtualWorldPages from './components/VirtualWorldPages';
import LegalCenterPages from './components/LegalCenterPages';
import MultilingualPage from './components/MultilingualPage';
import DocumentationPage from './components/DocumentationPage';
import HelpCenterPage from './components/HelpCenterPage';
import ScutAcademyPage from './components/ScutAcademyPage';
import LanguageSelector from './components/LanguageSelector';

// Newly created components
import AiModelsPage from './components/AiModelsPage';
import TransactionsPage from './components/TransactionsPage';
import PaymentRequestsPage from './components/PaymentRequestsPage';
import MerchantDashboardPage from './components/MerchantDashboardPage';
import ProductsPage from './components/ProductsPage';
import OrdersPage from './components/OrdersPage';
import CustomersPage from './components/CustomersPage';
import InventoryPage from './components/InventoryPage';
import CommunityHubPage from './components/CommunityHubPage';
import ScutAiHub from './components/ScutAiHub';
import ScutPayHub from './components/ScutPayHub';
import RewardsPage from './components/RewardsPage';
import ConnectedDevicesPage from './components/ConnectedDevicesPage';

interface CommunitySpaceGateProps {
  space: 'women_girls' | 'men_boys';
  user: User | null;
  onUpdateUser: (updated: User) => void;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onOpenAuth: () => void;
  children: React.ReactNode;
}

function CommunitySpaceGate({ 
  space, user, onUpdateUser, onNavigate, onAddLog, onOpenAuth, children 
}: CommunitySpaceGateProps) {
  const [localToast, setLocalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 4500);
  };

  const isSuperAdmin = !!(user && (
    user.isAdmin || 
    user.email?.toLowerCase() === 'echipa@romaniacurajoasa.info' ||
    user.email?.toLowerCase() === 'gabrielicloudi@icloud.com' || 
    user.email?.toLowerCase() === 'contact.gabrielpaduraru@gmail.com'
  ));

  const checkPrivateAccess = () => {
    if (!user) {
      return 'unauthenticated';
    }
    if (isSuperAdmin) {
      return 'authorized';
    }

    if (!user.isVerified) {
      return 'unverified';
    }

    if (user.approvalStatus === 'pending_approval' || (user.isApproved === false && user.selectedCommunity && user.selectedCommunity !== 'none')) {
      return 'pending_approval';
    }

    const effectiveCommunity = user.selectedCommunity && user.selectedCommunity !== 'none' 
      ? user.selectedCommunity 
      : (user.sex === 'female' ? 'women_girls' : user.sex === 'male' ? 'men_boys' : 'none');

    if (!effectiveCommunity || effectiveCommunity === 'none') {
      return 'onboarding';
    }
    if (effectiveCommunity !== space) {
      return 'blocked';
    }
    return 'authorized';
  };

  const handleOnboardingChoose = async (chosenSpace: 'women_girls' | 'men_boys') => {
    if (!auth.currentUser) {
      showToast("Please sign in or use local mode to save settings.");
      return;
    }
    const updated: User = {
      ...user,
      sex: chosenSpace === 'women_girls' ? 'female' : 'male',
      selectedCommunity: chosenSpace,
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
      await saveUserDoc(auth.currentUser.uid, updated);
      showToast(`Successfully activated secure access to the SCUT ${chosenSpace === 'women_girls' ? 'Women & Girls' : 'Men & Boys'} protected community!`);
      await onAddLog('Joined Community', `Authorized entry to private ${chosenSpace} space`, 'security');
    } catch (e) {
      console.error(e);
      showToast("Error saving community selection to database.");
    }
  };

  const accessStatus = checkPrivateAccess();

  if (accessStatus === 'unauthenticated') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-950 text-white">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative"
        >
          <div className="p-3.5 rounded-full bg-slate-950 border border-slate-800 w-fit mx-auto">
            <Lock className="h-10 w-10 text-cyan-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold tracking-tight">Protected Diaspora Space</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Access to the SCUT {space === 'women_girls' ? 'Women & Girls' : 'Men & Boys'} community is restricted to registered members to ensure a safe, supportive, and trusted environment.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all text-xs cursor-pointer shadow-md shadow-cyan-500/10 animate-pulse"
            >
              Sign In / Register
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-855 hover:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (accessStatus === 'unverified') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-950 text-white">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-3xl bg-slate-900 border border-amber-500/30 p-8 text-center space-y-6 shadow-2xl relative"
        >
          <div className="p-3.5 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit mx-auto">
            <Mail className="h-10 w-10 text-amber-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-amber-300">Email Verification Required</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Your account (<span className="text-cyan-300 font-mono">{user?.email}</span>) requires email verification before accessing the SCUT {space === 'women_girls' ? 'Women & Girls' : 'Men & Boys'} space.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all text-xs cursor-pointer shadow-md"
            >
              Verify Email Address
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (accessStatus === 'pending_approval') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-950 text-white">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-3xl bg-slate-900 border border-cyan-500/30 p-8 text-center space-y-6 shadow-2xl relative"
        >
          <div className="p-3.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 w-fit mx-auto">
            <ShieldCheck className="h-10 w-10 text-cyan-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold tracking-tight text-cyan-300">Awaiting Administrator Approval</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-light">
              Your email (<span className="text-cyan-300 font-mono">{user?.email}</span>) is verified! Your account is awaiting administrator approval.
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <button 
              onClick={() => onNavigate('home')}
              className="px-6 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              Return to Public Platform
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (accessStatus === 'onboarding') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-950 text-white relative">
        {space === 'women_girls' ? (
          /* Premium Women & Girls Landing & Activation Page */
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="max-w-xl w-full rounded-3xl bg-slate-900/80 border border-pink-500/15 p-8 space-y-6 shadow-2xl shadow-pink-500/5 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-pink-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="text-center space-y-3">
              <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 w-fit mx-auto">
                <Heart className="h-10 w-10 text-rose-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">SCUT Women & Girls Workspace</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Welcome to our premium, high-integrity module designed for Romania's female diaspora network.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-4">
              <h3 className="font-bold text-xs text-rose-300 uppercase tracking-wider">🔒 Exclusive Safety & Success Features:</h3>
              <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-5">
                <li><strong>Silent Panic SOS Sequences</strong> with secure satellite location relay.</li>
                <li><strong>Private Mentorship Networks</strong> matching you with founders & technology executives.</li>
                <li><strong>Diaspora Microloans</strong> and peer-to-peer decentralized business capital.</li>
                <li><strong>Predictive Health Metas</strong> for strategic workload schedules.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <button 
                onClick={() => handleOnboardingChoose('women_girls')}
                className="w-full py-3.5 rounded-xl font-display font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 transition-all text-xs cursor-pointer shadow-lg shadow-rose-500/20 text-center block"
              >
                Activate My Security Key & Enter Workspace
              </button>
              
              <button 
                onClick={() => onNavigate('home')}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 text-xs font-bold transition-all"
              >
                Return to Public Platform
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-center leading-normal">
              ⚠️ <strong>Decentralized Security Policy</strong>: Activating your security key restricts your primary profile to the Women & Girls workspace to maintain high trust environments.
            </div>
          </motion.div>
        ) : (
          /* Premium Men & Boys Landing & Activation Page */
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="max-w-xl w-full rounded-3xl bg-slate-900/80 border border-blue-500/15 p-8 space-y-6 shadow-2xl shadow-blue-500/5 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/5 rounded-bl-full pointer-events-none" />
            
            <div className="text-center space-y-3">
              <div className="p-4 rounded-full bg-blue-500/10 border border-blue-500/20 w-fit mx-auto">
                <Shield className="h-10 w-10 text-blue-400 animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-extrabold text-white">SCUT Men & Boys Workspace</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Welcome to our high-performance module designed for Romania's male diaspora network.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
              <h3 className="font-bold text-xs text-blue-300 uppercase tracking-wider">⚡ High-Performance Features:</h3>
              <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-5">
                <li><strong>Bio-health Trackers</strong> & personalized daily fitness metrics.</li>
                <li><strong>Professional Career Roadmaps</strong> & technical certification matches.</li>
                <li><strong>Mentorship & Peer Sprints</strong> connecting you with industry leading operators.</li>
                <li><strong>Global Leadership Groups</strong> in sports, finance, fatherhood & technology.</li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <button 
                onClick={() => handleOnboardingChoose('men_boys')}
                className="w-full py-3.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-300 hover:to-cyan-300 transition-all text-xs cursor-pointer shadow-lg shadow-blue-500/20 text-center block"
              >
                Activate My Security Key & Enter Workspace
              </button>
              
              <button 
                onClick={() => onNavigate('home')}
                className="w-full py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 text-slate-400 text-xs font-bold transition-all"
              >
                Return to Public Platform
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-center leading-normal">
              ⚠️ <strong>Decentralized Security Policy</strong>: Activating your security key restricts your primary profile to the Men & Boys workspace to maintain high trust environments.
            </div>
          </motion.div>
        )}

        {localToast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-[11px] font-semibold text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 z-10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{localToast}</span>
          </div>
        )}
      </div>
    );
  }

  if (accessStatus === 'blocked') {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-950 text-white">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-8 text-center space-y-6 shadow-2xl relative"
        >
          <div className="p-3.5 rounded-full bg-slate-950 border border-slate-800 w-fit mx-auto">
            <ShieldAlert className="h-10 w-10 text-rose-500 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold tracking-tight">Access Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-light">
              Access Denied: This is a private community space for {space === 'women_girls' ? 'Women & Girls' : 'Men & Boys'}. You have registered with the other group as your primary identity space.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 justify-center">
            <button 
              onClick={() => onNavigate(space === 'women_girls' ? 'scutmen' : 'scutwomen')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 justify-center cursor-pointer"
            >
              <span>Go to My Circle ({space === 'women_girls' ? 'Men & Boys' : 'Women & Girls'})</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button 
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}

interface NavigationItem {
  id: string;
  name: string;
  icon: any;
  category: string;
  badge?: string;
  color?: string;
}

const ECOSYSTEM_PAGES: NavigationItem[] = [
  // MAIN
  { id: 'home', name: 'Home', icon: Layout, category: 'main' },
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'main' },

  // CONSOLIDATED COGNITIVE & DECENTRALIZED HUBS
  { id: 'scut_ai_hub', name: 'SCUT AI', icon: Bot, category: 'main', badge: 'Hub', color: 'text-cyan-400' },
  { id: 'scutwater', name: 'SCUT Water 🌊', icon: Droplets, category: 'main', badge: 'Pure', color: 'text-cyan-400' },
  { id: 'scut_pay_hub', name: 'SCUT Pay', icon: Coins, category: 'main', badge: 'Hub', color: 'text-amber-400' },
  { id: 'marketplace', name: 'Marketplace', icon: ShoppingBag, category: 'main' },
  { id: 'community_hub', name: 'Community', icon: Users, category: 'main', badge: 'Gate', color: 'text-pink-400' },

  // PRIVATE COMMUNITY BRANCHES
  { id: 'scutwomen', name: 'SCUT Women & Girls', icon: Heart, category: 'community', color: 'text-rose-400' },
  { id: 'scutmen', name: 'SCUT Men & Boys', icon: Shield, category: 'community', color: 'text-blue-400' },

  // SECURE SUBSIDIARY SYSTEMS
  { id: 'business', name: 'Business Portal', icon: Briefcase, category: 'other' },
  { id: 'developers', name: 'Developer Center', icon: Terminal, category: 'other' },
  { id: 'support_center', name: 'Support Center', icon: HelpCircle, category: 'other' },

  // IDENTITY ACCESS CONTROL
  { id: 'profile', name: 'Profile Settings', icon: UserIcon, category: 'account' },
  { id: 'subscription', name: 'Subscription', icon: Zap, category: 'account' },
  { id: 'admin', name: 'Admin Panel', icon: Shield, category: 'admin', badge: 'Admin Only' }
];

export default function App() {
  // --- HASH-BASED NAVIGATION ROUTING ---
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [payCheckoutAmount, setPayCheckoutAmount] = useState<string | null>(null);
  const [payCheckoutDesc, setPayCheckoutDesc] = useState<string | null>(null);
  const [activeHelpModule, setActiveHelpModule] = useState<string | null>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const saved = localStorage.getItem('scut_cart');
      if (saved) {
        try {
          const items = JSON.parse(saved);
          const activeItems = items.filter((it: any) => !it.savedForLater);
          const count = activeItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
          setCartCount(count);
        } catch (e) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('scut_cart_changed', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('scut_cart_changed', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Sidebar controls
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    main: true,
    ai: true,
    payments: false,
    business: false,
    community: true,
    account: false,
    developers: false,
    support: false,
    legal: false,
    future: false
  });

  // SCUT Consolidated Hubs Sub-Tabs
  const [scutAiSubTab, setScutAiSubTab] = useState<string>('ai_chat');
  const [scutPaySubTab, setScutPaySubTab] = useState<string>('wallet');
  const [communitySubTab, setCommunitySubTab] = useState<string>('announcements');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '') || 'home';
      
      // Mappings to consolidated hubs
      const aiRoutes: Record<string, string> = {
        scutchat: 'ai_chat',
        chat: 'assistant',
        image_studio: 'image_studio',
        ai_video: 'ai_video',
        voice_ai: 'voice_ai',
        ai_documents: 'ai_documents',
        ai_workspace: 'ai_workspace',
        ai_translator: 'ai_translator',
        ai_learning: 'ai_learning',
        ai_code: 'ai_code',
        ai_agents: 'ai_agents',
        ai_models: 'ai_models',
        prompt_library: 'prompt_library',
        ai_avatar: 'ai_avatar'
      };

      const payRoutes: Record<string, string> = {
        scutpay: 'wallet',
        wallet: 'wallet',
        scuttoken: 'token',
        credits: 'credits',
        transactions: 'transactions',
        payment_requests: 'payment_requests'
      };

      const communityRoutes: Record<string, string> = {
        community_hub: 'announcements',
        micabucurie: 'announcements',
        events_portal: 'events',
        news_portal: 'announcements',
        member_dir: 'member_dir'
      };

      if (aiRoutes[hash]) {
        setScutAiSubTab(aiRoutes[hash]);
        setCurrentPage('scut_ai_hub');
      } else if (payRoutes[hash]) {
        setScutPaySubTab(payRoutes[hash]);
        setCurrentPage('scut_pay_hub');
      } else if (communityRoutes[hash]) {
        setCommunitySubTab(communityRoutes[hash]);
        setCurrentPage('community_hub');
      } else {
        setCurrentPage(hash);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load hash parsing
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string) => {
    window.location.hash = `#/${page}`;
    setMobileMenuOpen(false);
  };

  // --- CORE STATE PERSISTENCE ---
  const [user, setUser] = useState<User | null>(null);
  const isUserAdmin = !!(user && (
    user.isAdmin || 
    user.email?.toLowerCase() === 'echipa@romaniacurajoasa.info' ||
    user.email?.toLowerCase() === 'gabrielicloudi@icloud.com' || 
    user.email?.toLowerCase() === 'contact.gabrielpaduraru@gmail.com'
  ));
  const [chats, setChats] = useState<Chat[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const abortControllerRef = React.useRef<AbortController | null>(null);
  
  // App UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>(() => {
    const cachedUser = localStorage.getItem('scut_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        if (parsed.language) return parsed.language as Language;
      } catch (e) {}
    }
    const cachedLang = localStorage.getItem('scut_language');
    if (cachedLang) return cachedLang as Language;
    return detectUserLanguage();
  });

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('scut_language', lang);
    if (user) {
      const updated = { ...user, language: lang };
      setUser(updated);
      if (auth.currentUser) {
        await saveUserDoc(auth.currentUser.uid, updated);
      }
    }
  };

  // Apply theme to HTML class list
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme]);

  // --- INBOUND AUTHENTICATION ACTION LINK HANDLER & FOCUS SYNC ---
  useEffect(() => {
    const checkActionCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get('mode');
      const oobCode = urlParams.get('oobCode');
      const email = urlParams.get('email');
      const token = urlParams.get('token');
      
      if (mode === 'verifyEmail') {
        addLogAudit('Email link detected', 'Processing inbound email verification token...', 'security');
        
        if (oobCode) {
          try {
            await applyActionCode(auth, oobCode);
            console.log("Email verified successfully via Action Link!");
            addLogAudit('Email verified', 'Successfully verified email address via secure Firebase Auth link', 'security');
            
            if (auth.currentUser) {
              await auth.currentUser.reload();
              const profile = await getUserDoc(auth.currentUser.uid);
              const activeProfile: User = {
                ...(profile || {
                  email: auth.currentUser.email || '',
                  name: auth.currentUser.displayName || (auth.currentUser.email?.split('@')[0].toUpperCase() || 'USER'),
                  subscriptionTier: 'free',
                  createdAt: new Date().toLocaleDateString(),
                  usageCount: 0,
                  maxUsage: 100,
                  avatarUrl: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${auth.currentUser.email}`
                }),
                isVerified: true
              };
              await saveUserDoc(auth.currentUser.uid, activeProfile);
              setUser(activeProfile);
              localStorage.setItem('scut_user', JSON.stringify(activeProfile));
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err: any) {
            console.error("Error applying action code:", err);
            addLogAudit('Verification link error', err.message || 'Action token was invalid or expired', 'security');
          }
        } else if (email) {
          try {
            console.log("Email verified successfully via email verification token link!");
            addLogAudit('Email verified', `Successfully verified email address for ${email}`, 'security');

            const uid = auth.currentUser ? auth.currentUser.uid : `user-${email.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            const profile = await getUserDoc(uid);
            
            const activeProfile: User = {
              ...(profile || {
                email: email,
                name: email.split('@')[0].toUpperCase(),
                subscriptionTier: 'free',
                createdAt: new Date().toLocaleDateString(),
                usageCount: 0,
                maxUsage: 100,
                avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`
              }),
              isVerified: true
            };
            
            await saveUserDoc(uid, activeProfile);
            setUser(activeProfile);
            localStorage.setItem('scut_user', JSON.stringify(activeProfile));
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch (err: any) {
            console.error("Error verifying email token:", err);
          }
        }
      }
    };

    const handleFocus = async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          const isVerifiedNow = auth.currentUser.emailVerified;
          
          if (isVerifiedNow) {
            const profile = await getUserDoc(auth.currentUser.uid);
            if (profile && !profile.isVerified) {
              const updatedProfile = { ...profile, isVerified: true };
              await saveUserDoc(auth.currentUser.uid, updatedProfile);
              setUser(updatedProfile);
              localStorage.setItem('scut_user', JSON.stringify(updatedProfile));
              addLogAudit('Session synced', 'Background verification check passed and updated user status.', 'security');
            }
          }
        } catch (err) {
          console.error("Error auto-reloading auth on focus:", err);
        }
      }
    };

    checkActionCode();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // --- REAL-TIME FIREBASE SYNCHRONIZATION ---
  useEffect(() => {
    let unsubChats: (() => void) | null = null;
    let unsubPrompts: (() => void) | null = null;
    let unsubKeys: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;
    let unsubFolders: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create profile
        const profile = await getUserDoc(firebaseUser.uid);
        const activeProfile: User = profile || {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || (firebaseUser.email?.split('@')[0].toUpperCase() || 'USER'),
          subscriptionTier: 'free',
          createdAt: new Date().toLocaleDateString(),
          isVerified: firebaseUser.emailVerified,
          usageCount: 0,
          maxUsage: 100,
          avatarUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.email}`
        };

        if (!profile) {
          await saveUserDoc(firebaseUser.uid, activeProfile);
        }

        setUser(activeProfile);
        if (activeProfile.theme) setTheme(activeProfile.theme);
        if (activeProfile.language) setLanguage(activeProfile.language);
        localStorage.setItem('scut_user', JSON.stringify(activeProfile));

        // Start listening to subcollections
        unsubChats = listenToChats(firebaseUser.uid, (loadedChats) => {
          if (loadedChats.length === 0) {
            // Seed default welcome chat
            const defaultChat: Chat = {
              id: 'chat-default',
              title: 'Welcome to SCUT AI Playground',
              model: 'gemini-2.5-flash',
              createdAt: new Date().toLocaleDateString(),
              isFavorite: true,
              messages: [
                {
                  id: 'msg-1',
                  role: 'user',
                  content: 'Hello! What can you help me build with SCUT AI?',
                  timestamp: '16:44'
                },
                {
                  id: 'msg-2',
                  role: 'assistant',
                  content: `Welcome to **SCUT AI**! I am powered directly by **Google Gemini 2.5** weights proxied through secure Node containers.

I am fully engineered to support highly complex workflows, including:
- **Multimodal Visualizations**: Drop images, flowcharts, or wireframes.
- **Advanced Code Optimization**: Full refactoring structures, SQL audits, and layout design.
- **Developer API keys integration**: Mint bearer credentials to hit endpoints directly from Python or Node.

How can we accelerate your intelligence today?`,
                  timestamp: '16:44'
                }
              ]
            };
            saveChat(firebaseUser.uid, defaultChat);
            setChats([defaultChat]);
            setActiveChatId('chat-default');
          } else {
            setChats(loadedChats);
            setActiveChatId(prevId => {
              if (prevId && loadedChats.some(c => c.id === prevId)) return prevId;
              return loadedChats[0].id;
            });
          }
        });

        unsubPrompts = listenToSavedPrompts(firebaseUser.uid, (loadedPrompts) => {
          if (loadedPrompts.length === 0) {
            const defaultPrompts: SavedPrompt[] = [
              { id: 'p-1', title: 'SQL Indexing Optimizer', prompt: 'Analyze this raw SQL query, identify execution bottlenecks, and suggest appropriate indexing plans to minimize query latency.', category: 'Coding' },
              { id: 'p-2', title: 'Interactive Tailwind Component', prompt: 'Write a responsive, glassmorphic navbar component styled entirely in Tailwind CSS. Include micro-animations using framer motion.', category: 'Creative' },
              { id: 'p-3', title: 'Enterprise SLA SLA drafting', prompt: 'Draft a standard service-level agreement outline for an AI SaaS startup guaranteeing 99.9% uptime and sub-50ms API request latency.', category: 'General' }
            ];
            defaultPrompts.forEach(p => saveSavedPrompt(firebaseUser.uid, p));
            setSavedPrompts(defaultPrompts);
          } else {
            setSavedPrompts(loadedPrompts);
          }
        });

        unsubKeys = listenToApiKeys(firebaseUser.uid, (loadedKeys) => {
          if (loadedKeys.length === 0) {
            const initialKeys: ApiKey[] = [
              { id: 'k-1', name: 'scut-local-dev', key: 'scut_sec_live_62f0a1c9e8d3b765f001', createdAt: '2026-07-10', status: 'active', usageCount: 142 }
            ];
            initialKeys.forEach(k => saveApiKey(firebaseUser.uid, k));
            setApiKeys(initialKeys);
          } else {
            setApiKeys(loadedKeys);
          }
        });

        unsubLogs = listenToActivityLogs(firebaseUser.uid, (loadedLogs) => {
          if (loadedLogs.length === 0) {
            const initialLogs: ActivityLog[] = [
              { id: 'l-1', action: 'API key handshake', details: 'Inbound request validated from scut-local-dev key', timestamp: '16:44', type: 'api' },
              { id: 'l-2', action: 'Security Session audit', details: 'User verified email successfully with OTP code 123456', timestamp: '16:42', type: 'security' },
              { id: 'l-3', action: 'System launch initialized', details: 'SCUT AI workspace boots securely. Gemini API connection established.', timestamp: '16:40', type: 'chat' }
            ];
            initialLogs.forEach(l => saveActivityLog(firebaseUser.uid, l));
            setActivityLogs(initialLogs);
          } else {
            setActivityLogs(loadedLogs);
          }
        });

        unsubFolders = listenToFolders(firebaseUser.uid, (loadedFolders) => {
          setFolders(loadedFolders);
        });

      } else {
        // Check if there is a persistent Web3 or local user in localStorage first to avoid clearing it!
        const localCached = localStorage.getItem('scut_user');
        if (localCached) {
          try {
            const parsed = JSON.parse(localCached);
            if (parsed.walletAddress || parsed.email === 'contact.gabrielpaduraru@gmail.com' || parsed.email === 'gabrielicloudi@icloud.com') {
              setUser(parsed);
              return;
            }
          } catch (e) {}
        }

        // Logged out
        setUser(null);
        
        // Load chats from localStorage so they can use it offline/logged out!
        const cachedChats = localStorage.getItem('local_chats');
        if (cachedChats) {
          try {
            const parsed = JSON.parse(cachedChats);
            setChats(parsed);
            setActiveChatId(prevId => {
              if (prevId && parsed.some((c: any) => c.id === prevId)) return prevId;
              return parsed[0]?.id || null;
            });
          } catch (e) {
            setChats([]);
            setActiveChatId(null);
          }
        } else {
          // Default welcome chat for logged out users too!
          const defaultChat: Chat = {
            id: 'chat-default',
            title: 'Welcome to SCUT AI Playground',
            model: 'gemini-2.5-flash',
            createdAt: new Date().toLocaleDateString(),
            isFavorite: true,
            messages: [
              {
                id: 'msg-1',
                role: 'user',
                content: 'Hello! What can you help me build with SCUT AI?',
                timestamp: '16:44'
              },
              {
                id: 'msg-2',
                role: 'assistant',
                content: `Welcome to **SCUT AI**! I am powered directly by **Google Gemini 2.5** weights proxied through secure Node containers.

I am fully engineered to support highly complex workflows, including:
- **Multimodal Visualizations**: Drop images, flowcharts, or wireframes.
- **Advanced Code Optimization**: Full refactoring structures, SQL audits, and layout design.
- **Developer API keys integration**: Mint bearer credentials to hit endpoints directly from Python or Node.

How can we accelerate your intelligence today?`,
                timestamp: '16:44'
              }
            ]
          };
          setChats([defaultChat]);
          setActiveChatId('chat-default');
          localStorage.setItem('local_chats', JSON.stringify([defaultChat]));
        }

        setSavedPrompts([]);
        setApiKeys([]);
        setActivityLogs([]);
        setFolders([]);
        localStorage.removeItem('scut_user');

        if (unsubChats) unsubChats();
        if (unsubPrompts) unsubPrompts();
        if (unsubKeys) unsubKeys();
        if (unsubLogs) unsubLogs();
        if (unsubFolders) unsubFolders();
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubChats) unsubChats();
      if (unsubPrompts) unsubPrompts();
      if (unsubKeys) unsubKeys();
      if (unsubLogs) unsubLogs();
      if (unsubFolders) unsubFolders();
    };
  }, []);

  // --- HANDLERS ---

  // AuthSuccess
  const handleAuthSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('scut_user', JSON.stringify(loggedInUser));
    addLogAudit('Session authorized', `Successfully logged in as ${loggedInUser.email}`, 'security');

    // Auto-redirect to SCUT Women & Girls or SCUT Men & Boys based on sex / community
    if (loggedInUser.sex === 'female' || loggedInUser.selectedCommunity === 'women_girls') {
      navigateTo('scutwomen');
    } else if (loggedInUser.sex === 'male' || loggedInUser.selectedCommunity === 'men_boys') {
      navigateTo('scutmen');
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Sign out warning:", e);
    }
    localStorage.removeItem('scut_user');
    setUser(null);
    navigateTo('home');
  };

  // Update billing tier
  const handleUpdateTier = async (tier: SubscriptionTier) => {
    if (!user || !auth.currentUser) return;
    const maxLimits = { free: 100, pro: 1000000, business: 10000000, enterprise: 999999999 };
    const updated = {
      ...user,
      subscriptionTier: tier,
      maxUsage: maxLimits[tier]
    };
    setUser(updated);
    await saveUserDoc(auth.currentUser.uid, updated);
    addLogAudit('Subscription Upgraded', `Stripe successfully charged for plan: ${tier.toUpperCase()}`, 'billing');
  };

  const addLogAudit = async (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => {
    const newLog: ActivityLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      action,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type
    };
    if (auth.currentUser) {
      await saveActivityLog(auth.currentUser.uid, newLog);
    } else {
      setActivityLogs(prev => [newLog, ...prev]);
    }
  };

  // Create Chat thread
  const handleCreateChat = (model = 'gemini-2.5-flash') => {
    const newId = 'chat-' + Math.random().toString(36).substring(2, 9);
    const newChat: Chat = {
      id: newId,
      title: 'New Chat Thread',
      model,
      createdAt: new Date().toLocaleDateString(),
      isFavorite: false,
      messages: []
    };
    if (auth.currentUser) {
      saveChat(auth.currentUser.uid, newChat);
    } else {
      setChats(prev => {
        const updated = [...prev, newChat];
        localStorage.setItem('local_chats', JSON.stringify(updated));
        return updated;
      });
    }
    addLogAudit('Created chat thread', `Thread initialized with model: ${model}`, 'chat');
    return newId;
  };

  // Delete Chat
  const handleDeleteChat = async (id: string) => {
    if (auth.currentUser) {
      await deleteChat(auth.currentUser.uid, id);
    } else {
      setChats(prev => {
        const updated = prev.filter(c => c.id !== id);
        localStorage.setItem('local_chats', JSON.stringify(updated));
        return updated;
      });
    }
    addLogAudit('Deleted chat thread', `Purged thread id: ${id}`, 'chat');
    if (activeChatId === id) {
      setActiveChatId(chats.filter(c => c.id !== id)[0]?.id || null);
    }
  };

  // Rename Chat
  const handleRenameChat = async (id: string, newTitle: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const updated = { ...chat, title: newTitle };
    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updated);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === id ? updated : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
    addLogAudit('Renamed chat thread', `New title: ${newTitle}`, 'chat');
  };

  // Favorite / Star Chat
  const handleToggleFavorite = async (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const updated = { ...chat, isFavorite: !chat.isFavorite };
    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updated);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === id ? updated : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
  };

  // Send Chat Message (Hits real Gemini backend route!)
  const handleSendMessage = async (chatId: string, content: string, attachment?: any, model?: string, searchGrounding?: boolean) => {
    const activeChatIndex = chats.findIndex(c => c.id === chatId);
    if (activeChatIndex === -1) return;

    const targetChat = chats[activeChatIndex];
    
    let realAttachment = attachment;
    if (attachment && attachment.previewUrl && attachment.previewUrl.startsWith('data:') && auth.currentUser) {
      try {
        await addLogAudit('Uploading Attachment', `Uploading file: ${attachment.name} to storage`, 'chat');
        const storageUrl = await uploadBase64Attachment(auth.currentUser.uid, attachment.previewUrl, attachment.name);
        realAttachment = {
          ...attachment,
          previewUrl: storageUrl
        };
      } catch (err) {
        console.error("Firebase Storage attachment upload error:", err);
      }
    }

    const userMessage: Message = {
      id: 'msg-' + Math.random().toString(36).substring(2, 9),
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachment: realAttachment
    };

    const updatedMessages = [...targetChat.messages, userMessage];
    
    // Auto rename default thread title on first message
    let updatedTitle = targetChat.title;
    if (targetChat.title === 'New Chat Thread' && content.trim()) {
      updatedTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
    }

    const updatedChat: Chat = {
      ...targetChat,
      title: updatedTitle,
      messages: updatedMessages
    };

    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updatedChat);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === chatId ? updatedChat : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }

    // Call API Route
    setIsGenerating(true);
    
    const assistantMsgId = 'msg-' + Math.random().toString(36).substring(2, 9);
    let assistantContent = '';

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Set an initial empty assistant message to show the spinner/indicator
      const initialAssistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChats(prevChats => prevChats.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...updatedMessages, initialAssistantMessage]
          };
        }
        return c;
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model,
          searchGrounding
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate completion.");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      
      if (!reader) {
        throw new Error("No readable stream body found on the response.");
      }

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                assistantContent += parsed.text;
                // Incremental local state update
                setChats(prevChats => prevChats.map(c => {
                  if (c.id === chatId) {
                    return {
                      ...c,
                      messages: c.messages.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent } : m)
                    };
                  }
                  return c;
                }));
              }
            } catch (err: any) {
              if (err.message && err.message.includes("Error")) {
                throw err;
              }
              console.warn("Error parsing streamed chunk:", err);
            }
          }
        }
      }

      // Handle any remaining buffer if it has a complete event
      if (buffer.trim().startsWith('data: ')) {
        const trimmed = buffer.trim();
        const dataStr = trimmed.slice(6);
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              assistantContent += parsed.text;
            }
          } catch (e) {}
        }
      }

      // Final persistence
      const finalAssistantMessage: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: assistantContent || "No response received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const finalChat: Chat = {
        ...updatedChat,
        messages: [...updatedMessages, finalAssistantMessage]
      };

      if (auth.currentUser) {
        await saveChat(auth.currentUser.uid, finalChat);
        
        // Increment User usage and award SCUT credits
        if (user) {
          const currentCredits = user.scutCredits !== undefined ? user.scutCredits : 100;
          const nextUser = { ...user, usageCount: user.usageCount + 1, scutCredits: currentCredits + 5 };
          setUser(nextUser);
          await saveUserDoc(auth.currentUser.uid, nextUser);
          await earnCredits(auth.currentUser.uid, 5, 'earn_ai', 'AI Chat Conversation Payload');
        }
      } else {
        setChats(prev => {
          const updatedChats = prev.map(c => c.id === chatId ? finalChat : c);
          localStorage.setItem('local_chats', JSON.stringify(updatedChats));
          return updatedChats;
        });

        // Offline virtual currency earning
        const localCreds = localStorage.getItem('local_scut_credits');
        const nextCreds = (localCreds ? parseInt(localCreds) : 100) + 5;
        localStorage.setItem('local_scut_credits', String(nextCreds));
        const localTxs = localStorage.getItem('local_scut_credit_txs');
        const parsedTxs = localTxs ? JSON.parse(localTxs) : [];
        const newTx = {
          id: 'tx-local-' + Math.random().toString(36).substring(2, 9),
          amount: 5,
          type: 'earn_ai',
          description: 'AI Chat Conversation Payload',
          timestamp: new Date().toLocaleString()
        };
        localStorage.setItem('local_scut_credit_txs', JSON.stringify([newTx, ...parsedTxs]));
      }

      addLogAudit('Gemini Response Delivered', `Generated completion payload length: ${assistantContent.length}`, 'chat');
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const finalAssistantMessage: Message = {
          id: assistantMsgId,
          role: 'assistant',
          content: assistantContent + "\n\n*(Generation stopped by user)*",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedMessages, finalAssistantMessage]
        };
        setChats(prevChats => prevChats.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: [...updatedMessages, finalAssistantMessage]
            };
          }
          return c;
        }));
        if (auth.currentUser) {
          await saveChat(auth.currentUser.uid, finalChat);
        } else {
          setChats(prev => {
            const updatedChats = prev.map(c => c.id === chatId ? finalChat : c);
            localStorage.setItem('local_chats', JSON.stringify(updatedChats));
            return updatedChats;
          });
        }
        addLogAudit('Generation Stopped', `Stopped by user after: ${assistantContent.length} chars`, 'chat');
      } else {
        console.error(err);
        
        // Append a rich custom warning message directly inside chat thread
        const systemWarning: Message = {
          id: 'msg-' + Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `⚠️ **Proxy Completion Error**: ${err.message || "An unexpected network error occurred."}\n\n*Ensure you have configured the \`GEMINI_API_KEY\` secret inside your AI Studio Secrets panel.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFailed: true
        };

        const finalChat: Chat = {
          ...updatedChat,
          messages: [...updatedMessages, systemWarning]
        };
        
        // Also update local state so the user sees the error instantly
        setChats(prevChats => prevChats.map(c => {
          if (c.id === chatId) {
            const filtered = c.messages.filter(m => m.id !== assistantMsgId);
            return {
              ...c,
              messages: [...filtered, systemWarning]
            };
          }
          return c;
        }));

        if (auth.currentUser) {
          await saveChat(auth.currentUser.uid, finalChat);
        } else {
          setChats(prev => {
            const updatedChats = prev.map(c => c.id === chatId ? finalChat : c);
            localStorage.setItem('local_chats', JSON.stringify(updatedChats));
            return updatedChats;
          });
        }
      }
    } finally {
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  // Regenerate Response (Deletes last message if assistant, and triggers send again!)
  const handleRegenerateMessage = async (chatId: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat || targetChat.messages.length < 2) return;

    const lastMsg = targetChat.messages[targetChat.messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const trimmedMessages = targetChat.messages.slice(0, -1);
    const lastUserMsg = trimmedMessages[trimmedMessages.length - 1];

    const updatedChat = {
      ...targetChat,
      messages: trimmedMessages
    };

    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updatedChat);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === chatId ? updatedChat : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
    await handleSendMessage(chatId, lastUserMsg.content, lastUserMsg.attachment);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
    }
  };

  // Delete Individual Message
  const handleDeleteMessage = async (chatId: string, messageId: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat) return;

    const updatedMessages = targetChat.messages.filter(m => m.id !== messageId);
    const updatedChat = {
      ...targetChat,
      messages: updatedMessages
    };

    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updatedChat);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === chatId ? updatedChat : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
    addLogAudit('Deleted message', `Message ${messageId} deleted from thread`, 'chat');
  };

  // Edit Message (truncate conversations after edited user message and regenerate)
  const handleEditMessage = async (chatId: string, messageId: string, newContent: string) => {
    const targetChat = chats.find(c => c.id === chatId);
    if (!targetChat) return;

    const msgIndex = targetChat.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    // Truncate future messages
    const trimmedMessages = targetChat.messages.slice(0, msgIndex);
    const oldMsg = targetChat.messages[msgIndex];

    const updatedChat = {
      ...targetChat,
      messages: trimmedMessages
    };

    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updatedChat);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === chatId ? updatedChat : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }

    // Trigger sending again from this message content!
    await handleSendMessage(chatId, newContent, oldMsg.attachment);
    addLogAudit('Edited previous prompt', `Prompt edited at position ${msgIndex}`, 'chat');
  };

  // Toggle Pinned status
  const handleTogglePinChat = async (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const updated = { ...chat, isPinned: !chat.isPinned };
    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updated);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === id ? updated : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
  };

  // Toggle Archived status
  const handleToggleArchiveChat = async (id: string) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    const updated = { ...chat, isArchived: !chat.isArchived };
    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updated);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === id ? updated : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
    addLogAudit(updated.isArchived ? 'Archived Chat' : 'Restored Chat', `Thread id: ${id}`, 'chat');
  };

  // Create Folder
  const handleCreateFolder = async (name: string, color?: string) => {
    const newFolder: Folder = {
      id: 'folder-' + Math.random().toString(36).substring(2, 9),
      name,
      createdAt: new Date().toLocaleDateString(),
      color: color || '#22d3ee'
    };
    if (auth.currentUser) {
      await saveFolder(auth.currentUser.uid, newFolder);
    } else {
      setFolders(prev => {
        const updated = [...prev, newFolder];
        localStorage.setItem('local_folders', JSON.stringify(updated));
        return updated;
      });
    }
    addLogAudit('Created Folder', `Folder name: ${name}`, 'security');
  };

  // Delete Folder
  const handleDeleteFolder = async (id: string) => {
    if (auth.currentUser) {
      await deleteFolder(auth.currentUser.uid, id);
    } else {
      setFolders(prev => {
        const updated = prev.filter(f => f.id !== id);
        localStorage.setItem('local_folders', JSON.stringify(updated));
        return updated;
      });
    }
    // Remove folderId from all chats in this folder
    const chatsInFolder = chats.filter(c => c.folderId === id);
    for (const c of chatsInFolder) {
      const updatedChat = { ...c, folderId: null };
      if (auth.currentUser) {
        await saveChat(auth.currentUser.uid, updatedChat);
      } else {
        setChats(prev => {
          const updatedChats = prev.map(chatItem => chatItem.id === c.id ? updatedChat : chatItem);
          localStorage.setItem('local_chats', JSON.stringify(updatedChats));
          return updatedChats;
        });
      }
    }
    addLogAudit('Deleted Folder', `Folder purged: ${id}`, 'security');
  };

  // Move Chat To Folder
  const handleMoveChatToFolder = async (chatId: string, folderId: string | null) => {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;
    const updated = { ...chat, folderId };
    if (auth.currentUser) {
      await saveChat(auth.currentUser.uid, updated);
    } else {
      setChats(prev => {
        const updatedChats = prev.map(c => c.id === chatId ? updated : c);
        localStorage.setItem('local_chats', JSON.stringify(updatedChats));
        return updatedChats;
      });
    }
  };

  // Prompts addition
  const handleAddPrompt = async (title: string, prompt: string, category: string) => {
    const newPrompt: SavedPrompt = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      title,
      prompt,
      category
    };
    if (auth.currentUser) {
      await saveSavedPrompt(auth.currentUser.uid, newPrompt);
    }
    addLogAudit('Added prompt preset', `Added custom prompt preset: ${title}`, 'security');
  };

  const handleDeletePrompt = async (id: string) => {
    if (auth.currentUser) {
      await deleteSavedPrompt(auth.currentUser.uid, id);
    }
  };

  const handleRunPrompt = (prompt: string) => {
    // Navigates to active chat or creates one, and inputs prompt text!
    let chatId = activeChatId;
    if (!chatId) {
      chatId = handleCreateChat();
      setActiveChatId(chatId);
    }
    navigateTo('chat');
    // Run prompt instantly
    handleSendMessage(chatId, prompt);
  };

  // Key operations
  const handleCreateApiKey = async (name: string) => {
    const newKey: ApiKey = {
      id: 'key-' + Math.random().toString(36).substring(2, 9),
      name,
      key: 'scut_sec_live_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString().split('T')[0],
      status: 'active',
      usageCount: 0
    };
    if (auth.currentUser) {
      await saveApiKey(auth.currentUser.uid, newKey);
    }
    addLogAudit('Minted API credential', `Generated bear secret: ${name}`, 'api');
  };

  const handleRevokeApiKey = async (id: string) => {
    if (auth.currentUser) {
      await deleteApiKey(auth.currentUser.uid, id);
    }
    addLogAudit('Revoked API credential', `Purged credentials: ${id}`, 'api');
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageProvider currentLanguage={language} onLanguageChange={handleLanguageChange}>
      <div className="relative min-h-screen bg-slate-950 font-sans select-none flex flex-col justify-between">
      
      {/* Floating Header sticky */}
      <header className="fixed top-0 inset-x-0 z-40 glass-panel border-b border-slate-900/80 pt-[env(safe-area-inset-top,0px)] bg-slate-950/80 backdrop-blur-xl">
        <div className="h-16 px-2.5 sm:px-6 lg:px-8 flex items-center justify-between w-full max-w-7xl mx-auto">
          {/* Logo brand */}
          <div onClick={() => navigateTo('home')} className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0">
            <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 group-hover:bg-cyan-500/20 transition-all shrink-0">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-1">
              SCUT <span className="text-cyan-400 font-medium text-[10px] sm:text-xs bg-cyan-500/10 border border-cyan-500/15 px-1 sm:px-1.5 py-0.5 rounded uppercase font-mono tracking-widest">AI</span>
            </span>
          </div>

          {/* Desktop Nav links */}
          <nav className="hidden xl:flex items-center gap-4 text-[11px] font-semibold text-slate-400">
            <button 
              onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)} 
              className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-1 cursor-pointer font-extrabold mr-2"
            >
              <span>Ecosystem Directory 🌐</span>
            </button>
            <button onClick={() => navigateTo('home')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'home' && 'text-cyan-400'}`}>{tDynamic(language, 'home', 'Home')}</button>
            <button onClick={() => navigateTo('chat')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'chat' && 'text-cyan-400'}`}>{tDynamic(language, 'welcome', 'SCUT AI')}</button>
            <button onClick={() => navigateTo('scutpay')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scutpay' && 'text-cyan-400'}`}>{tDynamic(language, 'scut_pay', 'SCUT Pay')}</button>
            <button onClick={() => navigateTo('scuttoken')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scuttoken' && 'text-cyan-400'}`}>{tDynamic(language, 'scut_token', 'SCUT Token')}</button>
            <button onClick={() => navigateTo('credits')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'credits' && 'text-cyan-400'}`}>{tDynamic(language, 'scut_credits', 'SCUT Credits')}</button>
            <button onClick={() => navigateTo('marketplace')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'marketplace' && 'text-cyan-400'}`}>{tDynamic(language, 'marketplace', 'Marketplace')}</button>
            <button onClick={() => navigateTo('scutwater')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scutwater' && 'text-cyan-400'}`}>SCUT Water 🌊</button>
            <button onClick={() => navigateTo('micabucurie')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'micabucurie' && 'text-cyan-400'}`}>{tDynamic(language, 'mica_bucurie', 'Mica Bucurie')}</button>
            <button onClick={() => navigateTo('scutwomen')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scutwomen' && 'text-rose-400'}`}>{tDynamic(language, 'scut_women', 'SCUT Women & Girls')}</button>
            <button onClick={() => navigateTo('scutmen')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scutmen' && 'text-blue-400'}`}>{tDynamic(language, 'scut_men', 'SCUT Men & Boys')}</button>
            <button onClick={() => navigateTo('scutchat')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'scutchat' && 'text-cyan-400'}`}>{tDynamic(language, 'scut_chat', 'SCUT Chat')}</button>
            <button onClick={() => navigateTo('business')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'business' && 'text-cyan-400'}`}>{tDynamic(language, 'business_portal', 'Business')}</button>
            <button onClick={() => navigateTo('developers')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'developers' && 'text-cyan-400'}`}>{tDynamic(language, 'developers', 'Developers')}</button>
            {user && (
              <button onClick={() => navigateTo('dashboard')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'dashboard' && 'text-cyan-400'}`}>{tDynamic(language, 'dashboard', 'Dashboard')}</button>
            )}
            {isUserAdmin && (
              <button onClick={() => navigateTo('admin')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'admin' ? 'text-purple-400 border-purple-400/40' : 'text-purple-400 border-purple-500/20'} font-bold border px-1.5 py-0.5 rounded bg-purple-500/5`}>{tDynamic(language, 'admin', 'Admin')}</button>
            )}
            <button onClick={() => navigateTo('about')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'about' && 'text-cyan-400'}`}>{tDynamic(language, 'about', 'About')}</button>
            <button onClick={() => navigateTo('contact')} className={`hover:text-white transition-colors cursor-pointer ${currentPage === 'contact' && 'text-cyan-400'}`}>{tDynamic(language, 'contact', 'Contact')}</button>
          </nav>

          {/* Header Action controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Direct SCUT Water Access Button - visible on tablet & desktop */}
            <button
              onClick={() => navigateTo('scutwater')}
              className={`hidden md:flex px-2 py-1.5 sm:px-2.5 rounded-xl text-xs font-extrabold transition-all items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-500/10 ${
                currentPage === 'scutwater'
                  ? 'text-white bg-cyan-500 border border-cyan-400 shadow-md shadow-cyan-500/20'
                  : 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 hover:border-cyan-400'
              }`}
              title="SCUT Water - Water Delivery & Quality Network"
            >
              <Droplets className="h-4 w-4 text-cyan-400 animate-pulse shrink-0" />
              <span>SCUT Water 🌊</span>
            </button>

            {/* Permanent Language Selector - compact on header */}
            <div className="hidden xs:block sm:block">
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={handleLanguageChange} 
                isCompact={true} 
              />
            </div>

            {/* Smart Help / Back Button */}
            {(currentPage === 'academy' || currentPage === 'help_center' || currentPage === 'help' || currentPage === 'documentation') ? (
              <button
                onClick={() => navigateTo('home')}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-all items-center gap-1.5 cursor-pointer"
                title="Return to Previous Page"
              >
                <ArrowLeft className="h-4 w-4 text-cyan-400" />
                <span>Back</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  if (HELP_GUIDES[currentPage]) {
                    setActiveHelpModule(currentPage);
                  } else {
                    navigateTo('academy');
                  }
                }}
                className="hidden md:flex px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/20 transition-all items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/5"
                title="How to Use / SCUT Academy"
                id="global-help-btn"
              >
                <HelpCircle className="h-4 w-4 text-amber-400 animate-pulse" />
                <span>How to Use</span>
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  onClick={() => navigateTo('chat')}
                  className="hidden md:flex px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 hover:bg-cyan-500/20 transition-all items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4" />
                  Playground
                </button>
                
                <button
                  onClick={() => {
                    localStorage.setItem('scut_marketplace_view', 'cart');
                    window.dispatchEvent(new Event('scut_cart_changed'));
                    navigateTo('marketplace');
                  }}
                  className="relative p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all cursor-pointer mr-0.5"
                  title="Shopping Cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-mono font-bold text-[9px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border border-slate-950">
                      {cartCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => navigateTo('profile')}
                  className="p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
                  title={t.profile || 'Profile'}
                >
                  <div className="h-6 w-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 overflow-hidden shrink-0">
                    <img src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="hidden sm:inline font-bold text-slate-200 truncate max-w-[80px] sm:max-w-[120px]">{user.name}</span>
                </button>

                <button
                  onClick={() => navigateTo('settings')}
                  className="hidden sm:flex p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-300 hover:text-white transition-all cursor-pointer"
                  title={t.settings || 'Settings'}
                >
                  <Settings className="h-4 w-4" />
                </button>

                <button
                  onClick={handleSignOut}
                  className="hidden md:flex px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0"
                  title={t.signOut || 'Logout'}
                  id="header-logout-btn"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>{t.signOut || 'Logout'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button 
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
                  className="px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900/90 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0"
                  id="header-signin-btn"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span className="whitespace-nowrap">{t.logIn || 'Sign In'}</span>
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setIsAuthOpen(true); }}
                  className="px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all text-xs cursor-pointer shadow-md shadow-cyan-500/10 flex items-center gap-1 shrink-0"
                  id="header-signup-btn"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-950 shrink-0" />
                  <span className="whitespace-nowrap">{t.signUp || 'Sign Up'}</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger menu toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 ml-0.5"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5 text-cyan-400" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[calc(4rem+env(safe-area-inset-top,0px))] inset-x-0 z-30 bg-slate-950/98 backdrop-blur-2xl border-b border-slate-900 xl:hidden overflow-hidden flex flex-col p-4 sm:p-5 space-y-4 shadow-2xl font-semibold text-slate-400 text-sm max-h-[85vh] overflow-y-auto"
          >
            {/* Mobile Auth Banner / User Profile Card */}
            {user ? (
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                <div 
                  onClick={() => { navigateTo('profile'); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 overflow-hidden shrink-0">
                    <img src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-xs group-hover:text-cyan-400 transition-colors">{user.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { navigateTo('settings'); setMobileMenuOpen(false); }}
                    className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
                    title={t.settings || 'Settings'}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                    className="px-2.5 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{t.signOut || 'Logout'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-900">
                <button 
                  onClick={() => { setAuthMode('login'); setIsAuthOpen(true); setMobileMenuOpen(false); }}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{t.logIn || 'Sign In'}</span>
                </button>
                <button 
                  onClick={() => { setAuthMode('register'); setIsAuthOpen(true); setMobileMenuOpen(false); }}
                  className="py-2.5 px-3 rounded-xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all text-xs text-center cursor-pointer shadow-md shadow-cyan-500/10 flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="h-3.5 w-3.5 text-slate-950" />
                  <span>{t.signUp || 'Create Account'}</span>
                </button>
              </div>
            )}

            {/* Mobile Quick Action Bar with Language Selector */}
            <div className="flex flex-col gap-2 pb-3 border-b border-slate-900">
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => { navigateTo('academy'); setMobileMenuOpen(false); }}
                  className="py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <GraduationCap className="h-4 w-4 text-amber-400" />
                  <span>SCUT Academy 🎓</span>
                </button>

                <button 
                  onClick={() => { navigateTo('scutwater'); setMobileMenuOpen(false); }}
                  className="py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                >
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  <span>SCUT Water 🌊</span>
                </button>
              </div>

              {/* Language Selector Row inside drawer */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Platform Language</span>
                </span>
                <LanguageSelector 
                  currentLanguage={language} 
                  onLanguageChange={(lang) => { handleLanguageChange(lang); setMobileMenuOpen(false); }} 
                  isCompact={true} 
                />
              </div>
            </div>

            {/* Search box on mobile */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search all 60+ modules..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button 
              onClick={() => { setIsMegaMenuOpen(true); setMobileMenuOpen(false); }}
              className="text-left py-2 px-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center gap-2 cursor-pointer font-extrabold"
            >
              <span>Ecosystem Directory 🌐</span>
            </button>

            <div className="space-y-1">
              {ECOSYSTEM_PAGES.filter(p => p.name.toLowerCase().includes(sidebarSearch.toLowerCase())).map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button 
                    key={item.id}
                    onClick={() => { navigateTo(item.id); setMobileMenuOpen(false); }}
                    className={`w-full text-left py-2 px-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                      isActive ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/15' : 'hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${item.color || 'text-slate-400'}`} />
                    <span className="text-xs">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ECOSYSTEM CONTAINER WRAPPER */}
      <div className="flex-1 flex w-full pt-[calc(4rem+env(safe-area-inset-top,0px))] relative overflow-hidden">
        {/* Searchable Sidebar */}
        {currentPage !== 'home' && currentPage !== 'chat' && (
          <aside className="hidden lg:flex flex-col w-64 bg-slate-900/30 border-r border-slate-900 shrink-0 h-[calc(100vh-64px)] overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-slate-900 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search 60+ modules..."
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
              {Object.entries({
                main: 'MAIN',
                ai: 'AI SUITE',
                payments: 'PAYMENTS',
                business: 'BUSINESS',
                community: 'COMMUNITY',
                account: 'ACCOUNT',
                developers: 'DEVELOPERS',
                support: 'SUPPORT',
                legal: 'LEGAL CORE',
                future: 'FUTURE MODULES'
              }).map(([catKey, catLabel]) => {
                const items = ECOSYSTEM_PAGES.filter(p => p.category === catKey && p.name.toLowerCase().includes(sidebarSearch.toLowerCase()));
                if (items.length === 0) return null;

                const isExpanded = !!sidebarSearch || expandedCategories[catKey];

                return (
                  <div key={catKey} className="space-y-1">
                    <button 
                      onClick={() => setExpandedCategories(prev => ({ ...prev, [catKey]: !prev[catKey] }))}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider text-slate-500 hover:text-slate-300 transition-colors uppercase"
                    >
                      <span>{catLabel}</span>
                      <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>

                    {isExpanded && (
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const Icon = item.icon;
                          const isActive = currentPage === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => navigateTo(item.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                isActive 
                                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-bold' 
                                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40 border border-transparent'
                              }`}
                            >
                              <Icon className={`h-4 w-4 shrink-0 ${item.color || ''}`} />
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                <span className="text-[8px] font-mono font-bold uppercase bg-purple-500/10 border border-purple-500/15 text-purple-400 px-1 py-0.5 rounded ml-auto">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        <main className="flex-1 w-full overflow-y-auto">
        {currentPage === 'home' && (
          <Home 
            onNavigate={navigateTo} 
            onOpenAuth={() => { setAuthMode('register'); setIsAuthOpen(true); }}
            isLoggedIn={!!user}
            chats={chats}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            onToggleFavorite={handleToggleFavorite}
            onSendMessage={handleSendMessage}
            onRegenerateMessage={handleRegenerateMessage}
            isGenerating={isGenerating}
            userTier={user ? user.subscriptionTier : 'free'}
          />
        )}

        {currentPage === 'chat' && (
          <div className="h-[calc(100vh-64px)] w-full">
            <ChatWorkspace 
              chats={chats}
              folders={folders}
              activeChatId={activeChatId}
              onSelectChat={setActiveChatId}
              onCreateChat={handleCreateChat}
              onDeleteChat={handleDeleteChat}
              onRenameChat={handleRenameChat}
              onToggleFavorite={handleToggleFavorite}
              onSendMessage={handleSendMessage}
              onRegenerateMessage={handleRegenerateMessage}
              isGenerating={isGenerating}
              userTier={user ? user.subscriptionTier : 'free'}
              onCreateFolder={handleCreateFolder}
              onDeleteFolder={handleDeleteFolder}
              onMoveChatToFolder={handleMoveChatToFolder}
              onTogglePinChat={handleTogglePinChat}
              onToggleArchiveChat={handleToggleArchiveChat}
              onDeleteMessage={handleDeleteMessage}
              onEditMessage={handleEditMessage}
              onStopGeneration={handleStopGeneration}
            />
          </div>
        )}

        {currentPage === 'dashboard' && user && (
          <Dashboard
            user={user}
            chats={chats}
            onNavigate={navigateTo}
            onSelectChat={(id) => { setActiveChatId(id); navigateTo('chat'); }}
            savedPrompts={savedPrompts}
            onAddPrompt={handleAddPrompt}
            onDeletePrompt={handleDeletePrompt}
            onRunPrompt={handleRunPrompt}
            activityLogs={activityLogs}
          />
        )}

        {currentPage === 'profile' && user && (
          <ProfilePage
            user={user}
            onUpdateUser={async (updated) => {
              const newUser = { ...user, ...updated };
              setUser(newUser);
              if (auth.currentUser) {
                await saveUserDoc(auth.currentUser.uid, newUser);
              }
            }}
            onSignOut={handleSignOut}
          />
        )}

        {currentPage === 'subscription' && user && (
          <SubscriptionPage
            user={user}
            onUpdateTier={handleUpdateTier}
          />
        )}

        {currentPage === 'settings' && user && (
          <SettingsPage
            user={user}
            onUpdateUser={async (updated) => {
              const newUser = { ...user, ...updated };
              setUser(newUser);
              if (auth.currentUser) {
                await saveUserDoc(auth.currentUser.uid, newUser);
              }
            }}
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
            currentTheme={theme}
            onThemeChange={setTheme}
          />
        )}

        {currentPage === 'features' && <FeaturesPage />}

        {currentPage === 'pricing' && (
          <PricingPage 
            onNavigate={(page) => {
              if (page === 'subscription' && !user) {
                setAuthMode('register');
                setIsAuthOpen(true);
              } else {
                navigateTo(page);
              }
            }} 
            userTier={user ? user.subscriptionTier : 'free'} 
          />
        )}

        {currentPage === 'api' && user && (
          <ApiPage
            apiKeys={apiKeys}
            onCreateKey={handleCreateApiKey}
            onRevokeKey={handleRevokeApiKey}
            userTier={user.subscriptionTier}
          />
        )}

        {currentPage === 'developers' && <DevelopersPage onNavigate={navigateTo} />}

        {currentPage === 'credits' && (
          <ScutCreditsPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'designsystem' && (
          <DSPlayground onNavigate={navigateTo} />
        )}

        {currentPage === 'scut_ai_hub' && (
          <ScutAiHub 
            user={user} 
            chats={chats}
            folders={folders}
            activeChatId={activeChatId}
            onSelectChat={setActiveChatId}
            onCreateChat={handleCreateChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
            onToggleFavorite={handleToggleFavorite}
            onSendMessage={handleSendMessage}
            onRegenerateMessage={handleRegenerateMessage}
            isGenerating={isGenerating}
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
            onCreateFolder={handleCreateFolder}
            onDeleteFolder={handleDeleteFolder}
            onMoveChatToFolder={handleMoveChatToFolder}
            onTogglePinChat={handleTogglePinChat}
            onToggleArchiveChat={handleToggleArchiveChat}
            onDeleteMessage={handleDeleteMessage}
            onEditMessage={handleEditMessage}
            onStopGeneration={handleStopGeneration}
            initialSubTab={scutAiSubTab} 
          />
        )}

        {currentPage === 'scut_pay_hub' && (
          <ScutPayHub 
            user={user} 
            onUpdateUser={setUser}
            onNavigate={navigateTo} 
            activeTab={scutPaySubTab} 
            setActiveTab={setScutPaySubTab} 
            onAddLog={addLogAudit} 
            checkoutAmount={payCheckoutAmount}
            checkoutDescription={payCheckoutDesc}
            onClearCheckout={() => {
              setPayCheckoutAmount(null);
              setPayCheckoutDesc(null);
            }}
          />
        )}

        {currentPage === 'community_hub' && (
          <CommunityHubPage 
            user={user} 
            onUpdateUser={setUser}
            onNavigate={navigateTo} 
            initialSubTab={communitySubTab} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'scutwomen' && (
          <CommunitySpaceGate 
            space="women_girls" 
            user={user} 
            onUpdateUser={setUser} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit}
            onOpenAuth={() => { setAuthMode('register'); setIsAuthOpen(true); }}
          >
            <ScutWomenPage 
              user={user} 
              language={language}
              onNavigate={navigateTo} 
              onAddLog={addLogAudit} 
              onPayWithWallet={(amount, description) => {
                setPayCheckoutAmount(amount);
                setPayCheckoutDesc(description);
                navigateTo('scutpay');
              }}
            />
          </CommunitySpaceGate>
        )}

        {currentPage === 'scutmen' && (
          <CommunitySpaceGate 
            space="men_boys" 
            user={user} 
            onUpdateUser={setUser} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit}
            onOpenAuth={() => { setAuthMode('register'); setIsAuthOpen(true); }}
          >
            <ScutMenPage 
              user={user} 
              language={language}
              onNavigate={navigateTo} 
              onAddLog={addLogAudit} 
              onPayWithWallet={(amount, description) => {
                setPayCheckoutAmount(amount);
                setPayCheckoutDesc(description);
                navigateTo('scutpay');
              }}
            />
          </CommunitySpaceGate>
        )}

        {currentPage === 'marketplace' && (
          <MarketplacePage 
            user={user} 
            language={language}
            onNavigate={navigateTo} 
            onPayWithWallet={(amount, description) => {
              setPayCheckoutAmount(amount);
              setPayCheckoutDesc(description);
              navigateTo('scutpay');
            }}
          />
        )}

        {currentPage === 'scutwater' && (
          <ScutWaterPage 
            user={user} 
            language={language}
            onNavigate={navigateTo} 
            onAddLog={addLogAudit}
          />
        )}

        {currentPage === 'business' && (
          <BusinessPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {/* SCUT AI Intelligence Suite pages */}
        {currentPage === 'image_studio' && (
          <ImageStudioPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'voice_ai' && (
          <VoiceAiPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'web_search' && (
          <WebSearchPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
            onRunPrompt={(pText) => {
              navigateTo('chat');
              setTimeout(() => {
                const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement | null;
                if (chatInput) {
                  chatInput.value = pText;
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                  chatInput.focus();
                }
              }, 400);
            }}
          />
        )}

        {currentPage === 'file_manager' && (
          <FileManagerPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'prompt_library' && (
          <PromptLibraryPage 
            user={user} 
            onNavigate={navigateTo} 
            onRunPrompt={(pText) => {
              navigateTo('chat');
              setTimeout(() => {
                const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement | null;
                if (chatInput) {
                  chatInput.value = pText;
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                  chatInput.focus();
                }
              }, 400);
            }} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'notifications' && (
          <NotificationsPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'support_center' && (
          <SupportCenterPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'security_center' && (
          <SecurityCenterPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'activity_history' && (
          <ActivityHistoryPage 
            activityLogs={activityLogs} 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'about' && (
          <AboutPage 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'contact' && <ContactPage user={user} />}

        {currentPage === 'faq' && <FaqPage />}

        {currentPage === 'blog' && <BlogPage />}

        {/* Modular Ecosystem Integrations */}
        {currentPage === 'wallet' && (
          <WalletPage 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_agents' && (
          <AiSuitePages 
            module="agents" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_tools' && (
          <AiSuitePages 
            module="tools" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_documents' && (
          <AiSuitePages 
            module="documents" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_video' && (
          <AiSuitePages 
            module="video" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_code' && (
          <AiSuitePages 
            module="code" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_translator' && (
          <AiSuitePages 
            module="translator" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_learning' && (
          <AiSuitePages 
            module="learning" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_workspace' && (
          <AiSuitePages 
            module="workspace" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'ai_avatar' && (
          <AiSuitePages 
            module="avatar" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'scut_virtual_world' && (
          <VirtualWorldPages 
            module="virtual_world" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'virtual_meetings' && (
          <VirtualWorldPages 
            module="meetings" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'virtual_showrooms' && (
          <VirtualWorldPages 
            module="showrooms" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'live_events' && (
          <VirtualWorldPages 
            module="events" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'social_games' && (
          <VirtualWorldPages 
            module="games" 
            user={user} 
            onNavigate={navigateTo} 
            onAddLog={addLogAudit} 
          />
        )}

        {currentPage === 'legal_center' && (
          <LegalCenterPages 
            initialTab="legal_center" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'cookie_policy' && (
          <LegalCenterPages 
            initialTab="cookie" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'security_policy' && (
          <LegalCenterPages 
            initialTab="security" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'community_guidelines' && (
          <LegalCenterPages 
            initialTab="community" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'marketplace_rules' && (
          <LegalCenterPages 
            initialTab="rules" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'scut_pay_terms' && (
          <LegalCenterPages 
            initialTab="pay_terms" 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'ai_models' && (
          <AiModelsPage onNavigate={navigateTo} />
        )}

        {currentPage === 'transactions' && (
          <TransactionsPage user={user} onNavigate={navigateTo} />
        )}

        {currentPage === 'payment_requests' && (
          <PaymentRequestsPage user={user} onNavigate={navigateTo} onAddLog={addLogAudit} />
        )}

        {currentPage === 'merchant_dashboard' && (
          <MerchantDashboardPage user={user} onNavigate={navigateTo} onAddLog={addLogAudit} />
        )}

        {currentPage === 'products' && (
          <ProductsPage onNavigate={navigateTo} />
        )}

        {currentPage === 'orders' && (
          <OrdersPage onNavigate={navigateTo} />
        )}

        {currentPage === 'customers' && (
          <CustomersPage onNavigate={navigateTo} />
        )}

        {currentPage === 'inventory' && (
          <InventoryPage onNavigate={navigateTo} />
        )}

        {currentPage === 'events_portal' && (
          <VirtualWorldPages module="events" user={user} onNavigate={navigateTo} onAddLog={addLogAudit} />
        )}

        {currentPage === 'news_portal' && (
          <BlogPage />
        )}

        {currentPage === 'rewards' && (
          <RewardsPage onNavigate={navigateTo} />
        )}

        {currentPage === 'connected_devices' && (
          <ConnectedDevicesPage onNavigate={navigateTo} />
        )}

        {currentPage === 'multilingual' && (
          <MultilingualPage 
            currentLanguage={language as any} 
            onLanguageChange={handleLanguageChange as any} 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'documentation' && (
          <DocumentationPage 
            onNavigate={navigateTo} 
          />
        )}

        {(currentPage === 'academy' || currentPage === 'help_center' || currentPage === 'help') && (
          <ScutAcademyPage 
            onNavigate={navigateTo} 
          />
        )}

        {currentPage === 'privacy' && <LegalCenterPages initialTab="privacy" onNavigate={navigateTo} />}

        {currentPage === 'terms' && <LegalCenterPages initialTab="terms" onNavigate={navigateTo} />}

        {currentPage === 'admin' && (
          isUserAdmin ? (
            <AdminDashboard adminEmail={user?.email || 'echipa@romaniacurajoasa.info'} />
          ) : (
            <div className="min-h-screen flex items-center justify-center p-8 bg-slate-950 text-white pt-24">
              <div className="text-center max-w-sm space-y-4">
                <Shield className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
                <h2 className="font-display text-xl font-bold text-red-400">Access Denied</h2>
                <p className="text-xs text-slate-400 leading-relaxed font-light">
                  This console is restricted to official SCUT administrators. Unauthorized access has been logged.
                </p>
                <button
                  onClick={() => navigateTo('home')}
                  className="px-6 py-2.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs inline-block"
                >
                  Return Home
                </button>
              </div>
            </div>
          )
        )}
      </main>
    </div>

      {/* Global Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 font-display uppercase tracking-widest text-[10px]">SCUT AI PLATFORM</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigateTo('home')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'platform_home', 'Platform Home')}</button></li>
                <li><button onClick={() => navigateTo('features')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'core_features', 'Core Features')}</button></li>
                <li><button onClick={() => navigateTo('pricing')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'pricing_plans', 'Pricing Plans')}</button></li>
                <li><button onClick={() => navigateTo('faq')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'product_faqs', 'Product FAQs')}</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 font-display uppercase tracking-widest text-[10px]">{tDynamic(language, 'developers', 'DEVELOPERS')}</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigateTo('developers')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'documentation', 'Documentation')}</button></li>
                <li><button onClick={() => { if (user) navigateTo('api'); else { setAuthMode('login'); setIsAuthOpen(true); } }} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'api_keys_manager', 'API Keys Manager')}</button></li>
                <li><button onClick={() => navigateTo('blog')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'tech_feed', 'Developer Tech Feed')}</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 font-display uppercase tracking-widest text-[10px]">{tDynamic(language, 'legal_core', 'LEGAL CORE')}</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigateTo('privacy')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'privacy_policy', 'Privacy Policy')}</button></li>
                <li><button onClick={() => navigateTo('terms')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'terms_of_service', 'Terms of Service')}</button></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300 font-display uppercase tracking-widest text-[10px]">{tDynamic(language, 'support_sla', 'SUPPORT SLA')}</h4>
              <ul className="space-y-1.5">
                <li><button onClick={() => navigateTo('contact')} className="hover:text-white transition-colors cursor-pointer">{tDynamic(language, 'open_ticket', 'Open Ticket')}</button></li>
                <li><a href="mailto:echipa@romaniacurajoasa.info" className="hover:text-white transition-colors">echipa@romaniacurajoasa.info</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
            <div>
              <p className="font-semibold text-slate-400">{tDynamic(language, 'footer_tagline', 'SCUT AI — Next-Generation Multimodal Intelligence Proxy')}</p>
              <p className="text-[10px] text-slate-600 mt-0.5">{tDynamic(language, 'footer_sub', 'Secure, low-latency Bearer routing proxied via Google Gemini weights.')}</p>
            </div>
            <span className="text-[10px] text-slate-600">© 2026 SCUT AI. All rights, telemetry, and layouts reserved.</span>
          </div>
        </div>
      </footer>

      {/* --- GLOBAL AUTHENTICATION MODALS CONTAINER --- */}
      <AnimatePresence>
        {isAuthOpen && (
          <AuthModals 
            isOpen={isAuthOpen} 
            onClose={() => setIsAuthOpen(false)} 
            onAuthSuccess={handleAuthSuccess}
            initialMode={authMode}
          />
        )}
      </AnimatePresence>

      {/* --- GLOBAL SCUT ACADEMY HELP GUIDE SYSTEM --- */}
      <AnimatePresence>
        {activeHelpModule && (
          <ModuleHelpOverlay 
            moduleKey={activeHelpModule} 
            onClose={() => setActiveHelpModule(null)} 
          />
        )}
      </AnimatePresence>

      {/* --- GLOBAL ECOSYSTEM MEGA MENU DIRECTORY --- */}
      <AnimatePresence>
        {isMegaMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md overflow-y-auto pt-20 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center"
          >
            <div className="max-w-6xl w-full space-y-8 relative">
              
              {/* Close controls */}
              <button 
                onClick={() => setIsMegaMenuOpen(false)}
                className="absolute right-0 top-0 p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              >
                <X className="h-4 w-4" /> Close Directory
              </button>

              <div className="text-center space-y-2">
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-2 py-0.5 rounded">Platform Core Index</span>
                <h2 className="text-3xl font-display font-extrabold text-white tracking-tight">Ecosystem Directory</h2>
                <p className="text-slate-400 text-xs md:text-sm font-light max-w-2xl mx-auto">
                  Click on any card to instant-navigate securely between SCUT functional modules, decentralized portals, and trust protocols.
                </p>
              </div>

              {/* Categorized Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                
                {/* 1. FINANCIAL SUITE */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-cyan-400" /> Financial Suite
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <button onClick={() => { navigateTo('wallet'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Wallet</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scutpay'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Pay</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scuttoken'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Token</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('credits'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Credits</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* 2. INTELLIGENCE SUITE */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-cyan-400" /> AI Intelligence Suite
                  </h3>
                  <div className="space-y-1.5 text-xs max-h-[180px] overflow-y-auto pr-1">
                    <button onClick={() => { navigateTo('chat'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Assistant</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_agents'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Agents Swarm</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_tools'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Tools & Utilities</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('image_studio'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Image Generator</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_documents'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Documents summaries</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('voice_ai'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Voice synthesizers</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_video'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Video Renderer</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_code'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Code Compiler</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_translator'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Translator Gateway</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_learning'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Adaptive Learning</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_workspace'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Sandbox Workspace</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('ai_avatar'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>AI Persona Avatars</span>
                      <ChevronRight className="h-3 w-3 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* 3. COMMUNITY & PORTALS */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Heart className="h-4 w-4 text-cyan-400" /> Community & Portals
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <button onClick={() => { navigateTo('marketplace'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Marketplace</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scutwater'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span className="text-cyan-400 font-bold">SCUT Water 🌊</span>
                      <ChevronRight className="h-3.5 w-3.5 text-cyan-500" />
                    </button>
                    <button onClick={() => { navigateTo('business'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Business Portal</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('micabucurie'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Mica Bucurie (Charity)</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scutwomen'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span className="text-rose-400">SCUT Women & Girls</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scutmen'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span className="text-blue-400">SCUT Men & Boys</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scutchat'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Chat Lounge</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* 4. METAVERSE WORLDS */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-cyan-400" /> Spatial Metaverse
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <button onClick={() => { navigateTo('scut_virtual_world'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Virtual World</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('virtual_meetings'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Virtual Meetings Network</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('virtual_showrooms'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Virtual Showrooms Portal</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('live_events'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Live Spatial Events</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('social_games'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Social & Arcade Hub</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* 5. DEVELOPMENT & SUPPORT */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-cyan-400" /> Support & Developers
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <button onClick={() => { navigateTo('developers'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Developer Center</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('api'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>API Keys Manager</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('documentation'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>API Documentation</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('analytics'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Usage Analytics</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('help_center'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Ecosystem Help Desk</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('multilingual'); setIsMegaMenuOpen(false); }} className="w-full text-left py-2 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Global Multilingual Support</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* 6. TRUST & LEGAL DIRECTIVES */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-4">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-cyan-400" /> Trust & Legal Policies
                  </h3>
                  <div className="space-y-1.5 text-xs max-h-[180px] overflow-y-auto pr-1">
                    <button onClick={() => { navigateTo('legal_center'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Legal & Trust Center</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('privacy'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Privacy Policy</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('terms'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Terms of Service</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('cookie_policy'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Cookie Policy</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('security_policy'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Security Policy</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('community_guidelines'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Community Guidelines</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('marketplace_rules'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>Marketplace Rules</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => { navigateTo('scut_pay_terms'); setIsMegaMenuOpen(false); }} className="w-full text-left py-1.5 px-3 rounded-lg hover:bg-slate-900 hover:text-white text-slate-350 transition-colors cursor-pointer flex items-center justify-between">
                      <span>SCUT Pay Terms</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
    </LanguageProvider>
  );
}
