/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Shield, Phone, MapPin, User, Users, Calendar, Briefcase, 
  ShoppingBag, Bell, EyeOff, Lock, Sparkles, Send, Plus, Search, 
  Filter, HelpCircle, CheckCircle, AlertTriangle, MessageSquare, 
  Star, Award, BookOpen, GraduationCap, TrendingUp, Handshake, 
  ArrowRight, ShieldAlert, HeartPulse, RefreshCw, Eye, Sparkle, Bot, Check, Play, Zap, Info,
  MessageCircle, X, Share2, Bookmark, UploadCloud, Image as ImageIcon, Sliders, ChevronDown, Flame
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { User as UserType, Language } from '../types';
import { addToCart } from '../lib/cart';
import WomenBeauty from './women/WomenBeauty';
import WomenFashion from './women/WomenFashion';
import WomenWellness from './women/WomenWellness';
import WomenFitness from './women/WomenFitness';
import WomenFun from './women/WomenFun';
import WomenLearning from './women/WomenLearning';
import WomenEvents from './women/WomenEvents';

interface ScutWomenPageProps {
  user: UserType | null;
  language?: Language;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onPayWithWallet?: (amount: string, description: string) => void;
}

interface EmergencyContact {
  id: string;
  name: string;
  relation: string;
  phone: string;
  isTrustedCircle: boolean;
}

interface SupportClinic {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  location: string;
  rating: number;
  reviewsCount: number;
}

interface HealthLog {
  date: string;
  mood: 'Calm' | 'Energetic' | 'Tired' | 'Anxious' | 'Joyful';
  hydration: number; // in Liters
  sleepHours: number;
  periodDay?: number;
}

interface CareerOpp {
  id: string;
  title: string;
  company: string;
  type: 'Scholarship' | 'Course' | 'Workshop' | 'Job';
  category: string;
  benefit: string;
}

interface SafeEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  joined: boolean;
  capacity: number;
  registeredCount: number;
}

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  company: string;
  available: boolean;
  matched: boolean;
  avatarUrl: string;
  bio: string;
}

interface WomenProduct {
  id: string;
  title: string;
  price: string;
  category: 'Wearables' | 'Health' | 'Software' | 'Handmade' | 'Courses' | 'Services';
  description: string;
  image: string;
  brand: string;
  rating: number;
}

interface PostReaction {
  love: number;
  insight: number;
  support: number;
  agree?: number;
  celebrate?: number;
  deepAnswer?: number;
}

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  group: string;
  creator: string;
  avatar: string;
  imageUrl?: string;
  time: string;
  reactions: PostReaction;
  userReactions: { [key: string]: boolean };
  isBookmarked: boolean;
  hasVoice?: boolean;
  isVideo?: boolean;
  isPinned?: boolean;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    userVoted?: boolean;
  };
  comments: { id: string; author: string; avatar: string; text: string; time: string; translatedText?: string }[];
}

// Elegant minimal decorative divider
const FloralDivider = () => (
  <div className="flex items-center justify-center gap-6 py-10 text-[#e6b2bb]/60">
    <div className="h-[1px] w-28 bg-gradient-to-r from-transparent to-[#e6b2bb]/80" />
    <div className="flex items-center gap-1.5 text-rose-300">
      <Sparkle className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
      <Heart className="h-4.5 w-4.5 fill-rose-100" />
      <Sparkle className="h-3 w-3 animate-spin" style={{ animationDuration: '6s' }} />
    </div>
    <div className="h-[1px] w-28 bg-gradient-to-l from-transparent to-[#e6b2bb]/80" />
  </div>
);

export default function ScutWomenPage({ user, language = 'en', onNavigate, onAddLog, onPayWithWallet }: ScutWomenPageProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'safety' | 'health' | 'career' | 'community' | 'marketplace' | 'privacy' | 'beauty' | 'fashion' | 'wellness' | 'fitness' | 'learning' | 'events' | 'fun' | 'ai_assistant'>('dashboard');
  
  // States
  const [panicActive, setPanicActive] = useState(false);
  const [panicStep, setPanicStep] = useState<number>(0);
  const [invisibleMode, setInvisibleMode] = useState(false);
  const [customKeyword, setCustomKeyword] = useState('ALPHA-SAFE');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [currentFilter, setCurrentFilter] = useState<'All' | 'Wearables' | 'Health' | 'Software'>('All');
  const [purchasedProductId, setPurchasedProductId] = useState<string | null>(null);
  const [addedCartProduct, setAddedCartProduct] = useState<any | null>(null);

  // File Upload states inside Community tab
  const [composerAttachedImage, setComposerAttachedImage] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stories & Voice Notes States
  const [selectedStory, setSelectedStory] = useState<{ creator: string; avatar: string; mediaUrl: string; caption: string } | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [hasVoiceAttachment, setHasVoiceAttachment] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };
  
  // Athena Companion Chat
  const [athenaChat, setAthenaChat] = useState<{ sender: 'athena' | 'user'; text: string; time: string }[]>([
    { sender: 'athena', text: 'Welcome, pioneer. I am Athena AI, your secure companion. Ask me anything about physical safety protocols, startup seed metrics, or wellness trackers.', time: 'Just now' }
  ]);
  const [athenaInput, setAthenaInput] = useState('');
  const [athenaLoading, setAthenaLoading] = useState(false);

  // Quick prompt presets for user engagement
  const athenaPresets = [
    { label: "Check my location safety", text: "Perform a spatial risk check of my current geographic coordinates and sweeps." },
    { label: "Startup funding strategies", text: "What are the key metrics for raising seed capital as a female founder?" },
    { label: "Cycle & productivity tips", text: "How should I structure my work schedule based on the Follicular phase?" },
    { label: "Menstrual phase wellness", text: "What are evidence-based recommendations for managing energy drops during the menstrual phase?" },
    { label: "Healthy relationship communication", text: "What are the top three communication habits for establishing emotional safety in a relationship?" }
  ];

  // Community Feed Posts (Master Social System)
  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: 'p-1',
      title: 'Venture Capital Raising Insights for Female Pioneers',
      content: 'Just successfully closed our bridge round! For anyone pitching this month: focus heavily on your proprietary zero-trust compliance. It was our primary selling point. Feel free to reach out for pitch-deck audits!',
      group: 'Entrepreneurs',
      creator: 'Clara Oswald',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
      time: '2 hours ago',
      reactions: { love: 24, insight: 15, support: 19 },
      userReactions: {},
      isBookmarked: false,
      comments: [
        { id: 'c-1', author: 'Diana Prince', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', text: 'Absolutely crucial advice. Investors are heavily prioritizing security right now.', time: '1 hour ago' }
      ]
    },
    {
      id: 'p-2',
      title: 'Building a Decentralized Escort Circle for London Tech Week',
      content: 'We are organizing peer-to-peer safe transit groups for evening events during the conference. We will run localized GPS-shielded channels. Let me know if you want to join our trust circle coordinates!',
      group: 'Safety Circles',
      creator: 'Fiona Gallagher',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      time: '5 hours ago',
      reactions: { love: 31, insight: 8, support: 42 },
      userReactions: {},
      isBookmarked: true,
      comments: []
    }
  ]);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerContent, setComposerContent] = useState('');
  const [composerGroup, setComposerGroup] = useState('Entrepreneurs');
  const [composerAnonymous, setComposerAnonymous] = useState(false);
  const [expandedPostComments, setExpandedPostComments] = useState<{ [postId: string]: boolean }>({ 'p-1': true });
  const [newCommentTexts, setNewCommentTexts] = useState<{ [postId: string]: string }>({});

  const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);

  // Preset mockup high-quality gallery photos to easily attach
  const presetPhotos = [
    { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80', label: 'Tech Space' },
    { url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80', label: 'Yoga Zen' },
    { url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&auto=format&fit=crop&q=80', label: 'Coding' }
  ];

  // Support Contacts
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { id: 'ec-1', name: 'Elena Smith', relation: 'Sister', phone: '+1 (555) 019-2834', isTrustedCircle: true },
    { id: 'ec-2', name: 'Sarah Miller', relation: 'Partner', phone: '+1 (555) 014-9988', isTrustedCircle: true },
    { id: 'ec-3', name: 'SCUT Cyber-Sentinel Node', relation: 'Autonomous Bot', phone: '911-PRO-SCUT', isTrustedCircle: false }
  ]);
  const [newContact, setNewContact] = useState({ name: '', relation: '', phone: '' });

  // Clinics
  const clinics: SupportClinic[] = [
    { id: 'c-1', name: 'SafeHaven Counseling Collective', specialty: 'Crisis Support & Mental Wellness', phone: '+1 (800) 555-SAFE', location: 'Virtual & San Francisco offices', rating: 4.9, reviewsCount: 142 },
    { id: 'c-2', name: 'Athena Legal Advocacy Centre', specialty: 'Legal Rights & Tech Venture Auditing', phone: '+1 (800) 555-LEGAL', location: 'Online Cryptographic Consultations', rating: 4.8, reviewsCount: 115 },
    { id: 'c-3', name: 'Elysian Health and Gyn', specialty: 'Holistic Reproductive & Physical Well-being', phone: '+1 (555) 011-2244', location: 'Seattle Central Hub', rating: 4.7, reviewsCount: 78 }
  ];

  // Health Cycle States
  const [cycleDay, setCycleDay] = useState(14);
  const [cycleLength, setCycleLength] = useState(28);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([
    { date: 'Jul 18', mood: 'Calm', hydration: 2.2, sleepHours: 7.5, periodDay: 11 },
    { date: 'Jul 19', mood: 'Energetic', hydration: 1.8, sleepHours: 8.0, periodDay: 12 },
    { date: 'Jul 20', mood: 'Joyful', hydration: 2.5, sleepHours: 6.8, periodDay: 13 },
    { date: 'Jul 21', mood: 'Calm', hydration: 2.1, sleepHours: 7.2, periodDay: 14 }
  ]);
  const [newLog, setNewLog] = useState<HealthLog>({ date: 'Jul 22', mood: 'Joyful', hydration: 2.0, sleepHours: 8 });

  // Mentors
  const [mentors, setMentors] = useState<Mentor[]>([
    { id: 'm-1', name: 'Elena Rostova', expertise: 'Director of AI @ Neurola', company: 'Neurola Labs', available: true, matched: false, avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', bio: 'AI researcher specialized in zero-knowledge compliance and neural network safety.' },
    { id: 'm-2', name: 'Patricia Higgins', expertise: 'FinTech Founder & Seed VC Partner', company: 'Apex Ascent Fund', available: true, matched: false, avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', bio: 'Helped seed 14+ tech startups. Advises female pioneers on pre-seed and cap-table structuring.' },
    { id: 'm-3', name: 'Diana Prince', expertise: 'Principal Cybersecurity Architect', company: 'Fortress Core', available: false, matched: true, avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80', bio: 'Specialist in decentralized network architecture, privacy-preserving schemas, and firmware shields.' }
  ]);
  const [isMatchingMentorId, setIsMatchingMentorId] = useState<string | null>(null);

  // Safe Events list
  const [joinedEvents, setJoinedEvents] = useState<string[]>(['ev-1']);
  const safeEvents: SafeEvent[] = [
    { id: 'ev-1', title: 'Women Founders Pitch Showcase & Seed Day', date: 'Jul 28, 2026', time: '10:00 AM PST', location: 'SCUT Virtual Auditorium #2', organizer: 'SCUT Capital', joined: true, capacity: 150, registeredCount: 142 },
    { id: 'ev-2', title: 'Physical Self-Defense & Tracking Sweeps Class', date: 'Aug 04, 2026', time: '04:00 PM PST', location: 'District Safehouse Node #11', organizer: 'Sentinel Guard', joined: false, capacity: 50, registeredCount: 22 },
    { id: 'ev-3', title: 'Decentralized Cryptography Masterclass', date: 'Aug 18, 2026', time: '09:00 AM PST', location: 'London Web3 Lounge', organizer: 'Athena Legal Team', joined: false, capacity: 100, registeredCount: 45 }
  ];

  // Premium Products Catalog
  const [products, setProducts] = useState<WomenProduct[]>([
    { id: 'wp-1', title: 'SCUT Sentinel Biometric Safety Wristband', price: '45.00', category: 'Wearables', description: 'Luxury sleek bracelet that registers high-heartbeat stress signatures to trigger a private distress alert.', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400&auto=format&fit=crop&q=80', brand: 'SCUT Guard Labs', rating: 4.9 },
    { id: 'wp-2', title: 'Holistic Organic Neuro-Wellness Tea Bundle', price: '19.99', category: 'Health', description: 'Artisanal collection of adaptogenic formulas and sleep remedies tailored for elite high-stress founders.', image: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=400&auto=format&fit=crop&q=80', brand: 'SafeHaven Botanicals', rating: 4.8 },
    { id: 'wp-3', title: 'Sentinel Cybersecurity Personal Vault', price: '29.00', category: 'Software', description: 'Military-grade end-to-end local hardware key, premium VPN, and secure metadata sweepers.', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80', brand: 'Sentinel Defense', rating: 5.0 },
    { id: 'wp-4', title: 'Transylvanian Organic Rose Hydration Serum', price: '39.00', category: 'Health', description: 'Deep-hydration skin barrier cream using pure local Transylvanian organic rosehip oils.', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&auto=format&fit=crop&q=80', brand: 'Elysian Health', rating: 4.9 },
    { id: 'wp-5', title: 'Organic Flax Linen Double-Breasted Trench', price: '150.00', category: 'Wearables', description: 'Crisp, premium tailored breathable trench made of 100% organic regional flax fibers.', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80', brand: 'Atelier Sourcing', rating: 4.8 },
    { id: 'wp-6', title: 'Diaspora Hand-woven Linen Crop Shrug', price: '85.00', category: 'Handmade', description: 'Delicately knit shrug crafted by traditional weavers using organic local silk cotton blends.', image: 'https://images.unsplash.com/photo-1520635680457-3fb9279a05b4?w=400&auto=format&fit=crop&q=80', brand: 'Carpathian Crafts', rating: 5.0 },
    { id: 'wp-7', title: 'Female Venture Pitch Deck Legal XML Bundle', price: '25.00', category: 'Software', description: 'A complete pre-seed to Series A legal framework package and pitch desk metrics slides.', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', brand: 'Athena Legal Partners', rating: 4.7 },
    { id: 'wp-8', title: 'Follicular Productivity Masterclass Sprints', price: '50.00', category: 'Courses', description: 'Comprehensive high-level video masterclass on syncing high-stakes tech sprints with your endocrine phases.', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&auto=format&fit=crop&q=80', brand: 'Learning Academy Pro', rating: 4.9 },
    { id: 'wp-9', title: 'Intellectual Property & SaaS Patent Counsel', price: '120.00', category: 'Services', description: '1-hour secure video session with registered patent attorney specializing in decentralized web services.', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', brand: 'SCUT Legal Network', rating: 4.8 }
  ]);

  // Extended states for SCUT Rewards & Gamification
  const [rewards, setRewards] = useState({
    points: 2450,
    level: 3,
    reputation: 98,
    dailyClaimed: false,
    streak: 4,
    badges: ['First Post', 'Elite Safety Defender', 'Venture Pioneer'],
    history: [
      { id: 'rh-1', action: 'Daily Reward Claimed', points: 50, date: 'Today' },
      { id: 'rh-2', action: 'Handshake Match with Mentor', points: 100, date: 'Yesterday' },
      { id: 'rh-3', action: 'Security Checklist Completed', points: 200, date: '3 days ago' }
    ]
  });

  // Global search states
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);

  // Global search click handler
  const handleGlobalSearchItemClick = (type: string, tab: 'community' | 'career' | 'marketplace' | 'events') => {
    setActiveTab(tab);
    setShowSearchDrawer(false);
    setGlobalSearchQuery('');
    showNotification(`Navigated to ${tab} via global search.`);
  };

  // Connection and Trust Circle friends
  const [connections, setConnections] = useState([
    { id: 'conn-1', name: 'Elena Rostova', role: 'AI Director', reputation: 99, status: 'Online', avatar: '👩‍💻', scutId: 'SCUT-NODE-9901' },
    { id: 'conn-2', name: 'Patricia Higgins', role: 'Apex VC Partner', reputation: 98, status: 'Offline', avatar: '👩‍💼', scutId: 'SCUT-NODE-9902' },
    { id: 'conn-3', name: 'Clara Oswald', role: 'SaaS Founder', reputation: 97, status: 'Online', avatar: '🙋‍♀️', scutId: 'SCUT-NODE-9903' }
  ]);
  const [newConnectionId, setNewConnectionId] = useState('');

  // Super Administrator mode
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return localStorage.getItem('scut_super_admin') === 'true';
  });

  // Custom community circles/groups
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('All');
  const [savedOnlyFilter, setSavedOnlyFilter] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivate, setNewGroupPrivate] = useState(false);

  // Community groups and circles index
  const [communityGroups, setCommunityGroups] = useState([
    { id: 'cg-1', name: 'Beauty Lab', description: 'Skincare chemistry & local botanical compounds', category: 'Beauty', isPrivate: false, membersCount: 124, icon: '🧴' },
    { id: 'cg-2', name: 'Fashion Trends', description: 'Seasonal collections, style, and design inspiration', category: 'Fashion', isPrivate: false, membersCount: 95, icon: '👗' },
    { id: 'cg-3', name: 'SaaS Sprints', description: 'Venture fundraising & product delivery logs', category: 'Business', isPrivate: false, membersCount: 89, icon: '💼' },
    { id: 'cg-4', name: 'Diaspora Moms', description: 'Balancing founder schedules & parenting sanity', category: 'Moms', isPrivate: false, membersCount: 45, icon: '🍼' },
    { id: 'cg-5', name: 'STEM Scholars', description: 'Female undergrads in advanced computer engineering', category: 'Students', isPrivate: false, membersCount: 167, icon: '🎓' },
    { id: 'cg-6', name: 'Gaming Guild', description: 'Cooperative multiplayer, networking, and game dev', category: 'Gaming', isPrivate: false, membersCount: 54, icon: '🎮' },
    { id: 'cg-7', name: 'Wanderlust', description: 'Safe travel guides and exploration logs', category: 'Travel', isPrivate: false, membersCount: 72, icon: '✈️' },
    { id: 'cg-8', name: 'Wellness Circles', description: 'Meditation, physical training, and balance', category: 'Wellness', isPrivate: false, membersCount: 110, icon: '🧘‍♀️' },
    { id: 'cg-9', name: 'Private Cap-Table Room', description: 'Uncensored equity reviews & angel checks', category: 'Private', isPrivate: true, membersCount: 12, icon: '🔐' }
  ]);
  const customGroups = communityGroups;
  const setCustomGroups = setCommunityGroups;

  const [joinedGroups, setJoinedGroups] = useState<string[]>(['Entrepreneurs', 'Safety Circles', 'Beauty Lab', 'STEM Scholars']);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [activeGroupFilter, setActiveGroupFilter] = useState('All');

  // Interactive Poll Composer & Post States
  const [composerHasPoll, setComposerHasPoll] = useState(false);
  const [composerPollOptions, setComposerPollOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [composerIsVideo, setComposerIsVideo] = useState(false);
  const [pollVotes, setPollVotes] = useState<Record<string, number>>({});
  const [translatedPosts, setTranslatedPosts] = useState<Record<string, { title: string; content: string }>>({});

  // Verification center
  const [userVerified, setUserVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyName, setVerifyName] = useState('');
  const [verifyIdType, setVerifyIdType] = useState('Professional ID');
  const [verifyDocName, setVerifyDocName] = useState('');

  // Followed creators
  const [followedUsers, setFollowedUsers] = useState<string[]>(['Patricia Higgins', 'Clara Oswald']);

  // Audio & video post play tracking
  const [videoPlayingId, setVideoPlayingId] = useState<string | null>(null);
  const activeVideoPlayId = videoPlayingId;
  const setActiveVideoPlayId = setVideoPlayingId;

  // Mentorship category filter & become mentor modal
  const [activeMentorCategory, setActiveMentorCategory] = useState<'all' | 'career' | 'business' | 'beauty' | 'wellness'>('all');
  const [showBecomeMentorModal, setShowBecomeMentorModal] = useState(false);
  const [newMentorName, setNewMentorName] = useState('');
  const [newMentorExpertise, setNewMentorExpertise] = useState('');
  const [newMentorCompany, setNewMentorCompany] = useState('');
  const [newMentorCategory, setNewMentorCategory] = useState<'career' | 'business' | 'beauty' | 'wellness'>('career');
  const [newMentorBio, setNewMentorBio] = useState('');

  // Active client library of digital purchased courses/downloads
  const [purchasedLibrary, setPurchasedLibrary] = useState<{id: string, title: string, category: string, accessKey: string, date: string}[]>([
    { id: 'lib-1', title: 'SCUT Sentinel Biometric Safety Wristband', category: 'Wearables', accessKey: 'TRACK-9918-FEDEX', date: 'Jul 21, 2026' }
  ]);

  // Live streaming states
  const [liveStreamStatus, setLiveStreamStatus] = useState<'idle' | 'watching' | 'broadcasting'>('idle');
  const [activeStreamId, setActiveStreamId] = useState<string | null>(null);
  const [streamChat, setStreamChat] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'Adina', text: 'This presentation slide looks gorgeous!', time: '1m ago' },
    { sender: 'Patricia', text: 'Amazing metrics. Loving the real-time structure.', time: 'Just now' }
  ]);
  const [streamChatInput, setStreamChatInput] = useState('');
  const [streamViewerCount, setStreamViewerCount] = useState(124);
  const [heartsDriftingCount, setHeartsDriftingCount] = useState(0);
  const [newStreamTitle, setNewStreamTitle] = useState('');
  const [newStreamCategory, setNewStreamCategory] = useState('Beauty');
  const [newStreamDate, setNewStreamDate] = useState('Today at 19:30');
  const [showScheduleStreamModal, setShowScheduleStreamModal] = useState(false);
  const [streamSchedule, setStreamSchedule] = useState([
    { id: 'st-1', title: 'Live Skincare Routine & Adaptation Balms', category: 'Beauty', date: 'Today at 19:30', host: 'Adina Dumitru' },
    { id: 'st-2', title: 'Follicular Phase Energy Sprints & Pilates', category: 'Fitness', date: 'Tomorrow at 09:00', host: 'Elena Rostova' },
    { id: 'st-3', title: 'Pre-Seed Funding Metrics for B2B Startups', category: 'Business', date: 'Aug 14, 18:00', host: 'Patricia Higgins' }
  ]);

  // AI custom specialist
  const [activeAIPerspective, setActiveAIPerspective] = useState('Security Analyst');

  const founders = [
    { name: 'Sarah Jenkins', brand: 'EcoSustained Goods', niche: 'Sustainable Logistics', logo: '🌿', bio: 'Manufacturing 100% biodegradable custom boxes and packages for secure d2c retailers.' },
    { name: 'Irina Vance', brand: 'CyberVance Consulting', niche: 'Zero-Trust Audits', logo: '🛡️', bio: 'Cryptographic assessments, identity key pairing setups, and localized security sweeps.' }
  ];

  // Daily advice state
  const [aiTip, setAiTip] = useState('Metadata Shielding: Check your cloud storage configuration and strip GPS EXIF tags from public images.');
  const [generatingTip, setGeneratingTip] = useState(false);

  // Fetch AI tip
  const fetchDailyAITip = async () => {
    setGeneratingTip(true);
    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: "Write an elite, highly practical 1-sentence digital security or physical safety tip for professional women working in tech. Do not use introductory text, keep it incredibly precise and sophisticated.",
          temperature: 0.8
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        setAiTip(data.choices[0].message.content);
        showNotification("Refreshed secure intelligence report.");
      }
    } catch (e) {
      console.warn("Using offline intelligence:", e);
    } finally {
      setGeneratingTip(false);
    }
  };

  // Athena AI Message submit
  const handleAthenaSubmit = async (textToSend?: string) => {
    const queryText = textToSend || athenaInput;
    if (!queryText.trim()) return;

    setAthenaChat(prev => [...prev, { sender: 'user', text: queryText, time: 'Just now' }]);
    if (!textToSend) setAthenaInput('');
    setAthenaLoading(true);

    try {
      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are Athena AI, a highly elite, secure digital companion, mentor, and business advisor specialized in digital privacy, cap-table metrics, spatial safety, healthy relationships, and physical/reproductive wellness for women. Respond to: "${queryText}" with a highly valuable, professional, 2-to-3 sentence tactical recommendation. If the query concerns medical health, menstrual cycles, pregnancy, contraception, or wellness, always provide evidence-based info but explicitly append a friendly, mandatory advisory to consult with a qualified healthcare practitioner for customized medical guidance. Keep it cohesive and concise. No intro text.`,
          temperature: 0.7
        })
      });
      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
         setAthenaChat(prev => [...prev, { sender: 'athena', text: data.choices[0].message.content, time: 'Just now' }]);
      } else {
        setAthenaChat(prev => [...prev, { sender: 'athena', text: "I have registered your safety queries. For health-related matters, always secure customized assessments with your clinical provider.", time: 'Just now' }]);
      }
    } catch (err) {
      setAthenaChat(prev => [...prev, { sender: 'athena', text: "Local telemetry registers secured. Note: Aligned with clinical consensus, always verify reproductive or physiological wellness choices with a healthcare practitioner.", time: 'Just now' }]);
    } finally {
      setAthenaLoading(false);
    }
  };

  // Drag-and-Drop file uploads
  const handleFileDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleFileDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setComposerAttachedImage(event.target.result as string);
          showNotification(`Successfully staged ${file.name} (secured locally)`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setComposerAttachedImage(event.target.result as string);
          showNotification(`Successfully attached ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Add emergency contact
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    const added: EmergencyContact = {
      id: 'ec-' + Math.random().toString(36).substring(2, 9),
      name: newContact.name,
      relation: newContact.relation || 'Contact',
      phone: newContact.phone,
      isTrustedCircle: true
    };
    setEmergencyContacts([...emergencyContacts, added]);
    setNewContact({ name: '', relation: '', phone: '' });
    onAddLog('Emergency Contact Added', `Authorized ${added.name} as a secure guardian`, 'security');
    showNotification(`Added ${added.name} to trust circle.`);
  };

  // Silent Panic SOS Sequence
  const triggerPanicSOS = () => {
    setPanicActive(true);
    setPanicStep(1);
    onAddLog('SOS ACTIVE DETECTED', 'Emergency satellite relay active. Dispatching geo coordinates.', 'security');

    setTimeout(() => setPanicStep(2), 1200);
    setTimeout(() => setPanicStep(3), 2500);
  };

  const cancelPanicSOS = () => {
    setPanicActive(false);
    setPanicStep(0);
    onAddLog('SOS Disarmed', 'Emergency cleared. Safe identity token verified.', 'security');
    showNotification("Security shield disarmed. Alert canceled.");
  };

  // Predictive Health metrics
  const getCycleStatus = () => {
    if (cycleDay <= 5) return { status: 'Menstrual Rest Phase', color: 'from-rose-400 to-pink-500', bg: 'bg-rose-500/10 text-rose-600 border-rose-300/30', desc: 'Slight energy drop. Recommended: Hydration, 8 hours sleep, slow-tempo coding.' };
    if (cycleDay <= 12) return { status: 'Follicular Creative Sprints', color: 'from-pink-400 to-rose-400', bg: 'bg-pink-500/10 text-pink-600 border-pink-300/30', desc: 'Estrogen is climbing. Elite strategic window for pitches, venture meetings, and zero-error compiles.' };
    if (cycleDay <= 16) return { status: 'Peak Ovulatory Focus', color: 'from-amber-400 to-rose-400', bg: 'bg-amber-500/10 text-amber-700 border-amber-300/30', desc: 'Maximum cognitive bandwidth, excellent verbal negotiation & startup leadership confidence.' };
    return { status: 'Luteal Reflection Phase', color: 'from-rose-300 to-pink-400', bg: 'bg-rose-400/10 text-rose-500 border-rose-300/20', desc: 'Energy levels tapering. Wrap up critical sprints; transition into testing and core reviews.' };
  };
  const cycleStatus = getCycleStatus();

  // Handle post submit
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim()) return;

    const newPost: CommunityPost = {
      id: 'p-' + Math.random().toString(36).substring(2, 9),
      title: composerTitle || 'Ecosystem Discussion Topic',
      content: composerContent,
      group: composerGroup,
      creator: composerAnonymous ? 'Anonymous Sentinel' : (user?.name || 'SCUT Pioneer'),
      avatar: composerAnonymous 
        ? 'https://api.dicebear.com/7.x/bottts/svg?seed=anonymous' 
        : (user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
      imageUrl: composerAttachedImage || undefined,
      time: 'Just now',
      reactions: { love: 0, insight: 0, support: 0 },
      userReactions: {},
      isBookmarked: false,
      hasVoice: hasVoiceAttachment,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setComposerTitle('');
    setComposerContent('');
    setComposerAttachedImage(null);
    setHasVoiceAttachment(false);
    onAddLog('Community post published', `Dispatched thread inside "${composerGroup}" circle`, 'chat');
    showNotification("Ecosystem post successfully transmitted under encryption!");
  };

  // React to post
  const handleReact = (postId: string, type: 'love' | 'insight' | 'support') => {
    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      const reacted = p.userReactions[`${postId}-${type}`];
      const reactions = { ...p.reactions };
      reactions[type] = reacted ? reactions[type] - 1 : reactions[type] + 1;
      const userReactions = { ...p.userReactions, [`${postId}-${type}`]: !reacted };
      return { ...p, reactions, userReactions };
    }));
    onAddLog('Post Reaction', `Reacted ${type} to thread: ${postId}`, 'chat');
  };

  // Bookmark toggle
  const toggleBookmark = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p));
    showNotification("Bookmark status updated.");
  };

  // Add Comment
  const handleAddComment = (postId: string) => {
    const text = newCommentTexts[postId];
    if (!text || !text.trim()) return;

    setPosts(posts.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: [
          ...p.comments,
          {
            id: 'c-' + Math.random().toString(36).substring(2, 9),
            author: user?.name || 'SCUT Pioneer',
            avatar: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            text: text,
            time: 'Just now'
          }
        ]
      };
    }));

    setNewCommentTexts({ ...newCommentTexts, [postId]: '' });
    onAddLog('Comment added', `Appended response to thread ${postId}`, 'chat');
  };

  // Mentorship connection request
  const requestMentorship = (mentorId: string, mentorName: string) => {
    setIsMatchingMentorId(mentorId);
    onAddLog('Mentorship matched', `Establishing handshake sequence with ${mentorName}`, 'chat');
    
    setTimeout(() => {
      setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, matched: true } : m));
      setIsMatchingMentorId(null);
      showNotification(`🎉 Cryptographic connection established with ${mentorName}!`);
      // Award rewards points
      addRewardsPoints(40, `Mentorship handshake: ${mentorName}`);
    }, 1500);
  };

  // Dynamic reward points setter
  const addRewardsPoints = (val: number, action: string) => {
    setRewards(prev => {
      const newPoints = prev.points + val;
      const newHistory = [
        { id: 'rh-' + Math.random().toString(36).substring(2, 6), action, points: val, date: 'Just now' },
        ...prev.history
      ];
      const newLevel = Math.floor(newPoints / 1000) + 1;
      if (newLevel > prev.level) {
        setTimeout(() => showNotification(`🎉 CONGRATULATIONS! You have advanced to Community Level ${newLevel}!`), 1200);
      }
      return {
        ...prev,
        points: newPoints,
        level: newLevel,
        history: newHistory.slice(0, 10)
      };
    });
    showNotification(`+${val} SCUT Points Earned! 🚀`);
  };

  // Claim daily check-in reward
  const handleClaimDaily = () => {
    if (rewards.dailyClaimed) {
      showNotification("You have already secured your check-in rewards for today.");
      return;
    }
    setRewards(prev => ({
      ...prev,
      dailyClaimed: true,
      points: prev.points + 100,
      streak: prev.streak + 1,
      history: [
        { id: 'rh-daily-' + Date.now(), action: 'Daily Node Check-In', points: 100, date: 'Just now' },
        ...prev.history
      ]
    }));
    showNotification("Check-in accepted! Added +100 points & updated daily streak! 🌟");
    onAddLog('Daily Reward Claimed', 'Received 100 loyalty points', 'billing');
  };

  // Super administrator mode toggle
  const handleToggleAdminMode = (checked: boolean) => {
    setIsAdminMode(checked);
    localStorage.setItem('scut_super_admin', checked ? 'true' : 'false');
    showNotification(checked ? "👑 Super Administrator Mode: Unrestricted Access Overrides Enabled." : "Administrator privileges disabled.");
    onAddLog('Admin Mode Toggled', `Override: ${checked}`, 'security');
  };

  // Following community creators
  const toggleFollowCreator = (username: string) => {
    const isFollowing = followedUsers.includes(username);
    if (isFollowing) {
      setFollowedUsers(followedUsers.filter(u => u !== username));
      showNotification(`Stopped following ${username}`);
    } else {
      setFollowedUsers([...followedUsers, username]);
      showNotification(`Now following ${username}!`);
      addRewardsPoints(15, `Followed ${username}`);
    }
  };

  // Submit poll voting option
  const handlePollVote = (postId: string, optionIndex: number) => {
    const voteKey = `${postId}-voted`;
    if (pollVotes[voteKey] !== undefined) {
      showNotification("You have already submitted your response to this poll.");
      return;
    }

    setPollVotes(prev => ({ ...prev, [voteKey]: optionIndex }));
    setPosts(prev => prev.map(p => {
      if (p.id !== postId || !p.poll) return p;
      const options = [...p.poll.options];
      options[optionIndex] = {
        ...options[optionIndex],
        votes: options[optionIndex].votes + 1
      };
      return {
        ...p,
        poll: { ...p.poll, options }
      };
    }));
    showNotification("Feedback recorded. Thank you for voting!");
    addRewardsPoints(10, "Voted in Community Poll");
  };

  // Translate post text dynamically
  const handleTranslatePost = (postId: string, title?: string, content?: string) => {
    if (translatedPosts[postId]) {
      // Toggle off
      setTranslatedPosts(prev => {
        const copy = { ...prev };
        delete copy[postId];
        return copy;
      });
      showNotification("Restored original language.");
    } else {
      const originalTitle = title || '';
      const originalContent = content || '';
      const translatedTitle = originalTitle.includes("Venture") ? "Oportunități de finanțare prin venture capital" : `[Tradus] ${originalTitle}`;
      const translatedContent = originalContent.includes("successfully") 
        ? "Tocmai am încheiat cu succes runda noastră punte! Pentru oricine face pitch în această lună: concentrați-vă pe conformitatea dvs. de securitate proprietară zero-trust." 
        : `[Tradus în Română] ${originalContent}`;

      setTranslatedPosts(prev => ({
        ...prev,
        [postId]: {
          title: translatedTitle,
          content: translatedContent
        }
      }));
      showNotification("SCUT AI Translate: Text translated to Romanian.");
    }
  };

  // Become a registered Mentor application
  const submitBecomeMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentorName || !newMentorExpertise || !newMentorBio) {
      showNotification("Please complete all required verification fields.");
      return;
    }
    const addedMentor: Mentor = {
      id: 'm-' + Math.random().toString(36).substring(2, 9),
      name: newMentorName,
      expertise: newMentorExpertise,
      company: newMentorCompany || 'Independent Mentor',
      available: true,
      matched: false,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: newMentorBio
    };
    setMentors([addedMentor, ...mentors]);
    setNewMentorName('');
    setNewMentorExpertise('');
    setNewMentorCompany('');
    setNewMentorBio('');
    setShowBecomeMentorModal(false);
    showNotification("🎉 Application submitted! Credentials verified by Athena Shield.");
    addRewardsPoints(100, "Registered as Verified Mentor");
    onAddLog('Mentor Registered', `Self-submitted as expert: ${addedMentor.name}`, 'chat');
  };

  // Create custom circle groups
  const submitCreateGroup = (e?: React.FormEvent | string, categoryOrDesc?: string, isPriv?: boolean) => {
    if (e && typeof e !== 'string') {
      if (e.preventDefault) e.preventDefault();
    }
    
    let name = '';
    let desc = '';
    let priv = false;

    if (typeof e === 'string') {
      name = e;
      desc = categoryOrDesc || 'Custom community workspace';
      priv = !!isPriv;
    } else {
      if (!newGroupName.trim()) {
        showNotification("Please define a valid community circle title.");
        return;
      }
      name = newGroupName;
      desc = newGroupDesc || 'Custom community workspace';
      priv = newGroupPrivate;
    }

    const newGroup = {
      id: 'cg-' + Math.random().toString(36).substring(2, 6),
      name,
      description: desc,
      category: categoryOrDesc || 'General',
      isPrivate: priv,
      membersCount: 1,
      icon: priv ? '🔐' : '🌸'
    };
    setCommunityGroups([newGroup, ...communityGroups]);
    setJoinedGroups([...joinedGroups, name]);
    
    if (typeof e !== 'string') {
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPrivate(false);
      setShowCreateGroupModal(false);
    }

    showNotification(`Circle "${newGroup.name}" created and encrypted successfully!`);
    addRewardsPoints(50, `Created group: ${newGroup.name}`);
    onAddLog('Community Circle Created', `Deployed group node: ${newGroup.name}`, 'chat');
  };

  // Submit profile verification
  const handleSubmitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyName || !verifyDocName) {
      showNotification("Please upload and name your identity credentials.");
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setUserVerified(true);
      setIsVerifying(false);
      showNotification("🛡️ Identity verified! Professional security shield issued.");
      addRewardsPoints(200, "Completed KYC Verification");
      onAddLog('KYC ID Checked', `Issued professional shield: ${verifyName}`, 'security');
    }, 1500);
  };

  // Connect trusted companion
  const handleConnectFriend = (e: React.FormEvent | string) => {
    let inputVal = '';
    if (typeof e === 'string') {
      inputVal = e;
    } else {
      if (e && e.preventDefault) e.preventDefault();
      inputVal = newConnectionId;
    }

    if (!inputVal.trim()) return;
    const isAlreadyConnected = connections.some(c => c.id === inputVal || c.name.toLowerCase() === inputVal.toLowerCase());
    if (isAlreadyConnected) {
      showNotification("This companion is already connected inside your network.");
      return;
    }
    const addedFriend = {
      id: 'conn-' + Math.random().toString(36).substring(2, 6),
      name: inputVal,
      role: 'SCUT Registered Pioneer',
      reputation: 96,
      status: 'Online',
      avatar: '👩',
      scutId: 'SCUT-NODE-' + Math.floor(1000 + Math.random() * 9000)
    };
    setConnections([...connections, addedFriend]);
    if (typeof e !== 'string') {
      setNewConnectionId('');
    }
    showNotification(` Handshake sent to ${inputVal}. Companion accepted connection!`);
    addRewardsPoints(25, `Connected with ${inputVal}`);
  };

  // Streaming Actions
  const handleSendStreamMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streamChatInput.trim()) return;
    setStreamChat(prev => [
      ...prev,
      { sender: 'You (Pioneer)', text: streamChatInput, time: 'Just now' }
    ]);
    setStreamChatInput('');
    // Randomize incoming chatter responses
    setTimeout(() => {
      const bots = ['Elena', 'Clara', 'Diana', 'Patricia'];
      const comments = ['Incredible guidance!', 'Where can we buy the serum?', 'Thank you for explaining this clearly.', 'Very useful legal tip.'];
      const randomBot = bots[Math.floor(Math.random()*bots.length)];
      const randomComment = comments[Math.floor(Math.random()*comments.length)];
      setStreamChat(prev => [...prev, { sender: randomBot, text: randomComment, time: 'Just now' }]);
    }, 1500);
  };

  const handleSendLoveToStream = () => {
    setHeartsDriftingCount(prev => prev + 1);
    addRewardsPoints(2, "Sent Support Reactions to Stream");
  };

  const handleTipStreamer = (amount: number) => {
    if (rewards.points < amount) {
      showNotification("Insufficient SCUT loyalty points to complete tipping transaction.");
      return;
    }
    setRewards(prev => ({
      ...prev,
      points: prev.points - amount,
      history: [
        { id: 'rh-tip-' + Date.now(), action: `Tipped Streamer (${amount} pts)`, points: -amount, date: 'Just now' },
        ...prev.history
      ]
    }));
    const tipHash = '0x' + Math.random().toString(16).substring(2, 10) + '...' + Math.random().toString(16).substring(2, 6);
    showNotification(`💸 Tipped ${amount} points to host! Secure TX: ${tipHash}`);
  };

  const handleScheduleStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle || !newStreamDate) {
      showNotification("Please specify a stream title and scheduling date.");
      return;
    }
    const stream = {
      id: 'st-' + Math.random().toString(36).substring(2, 9),
      title: newStreamTitle,
      category: newStreamCategory,
      date: newStreamDate,
      host: verifyName || 'SCUT Pioneer'
    };
    setStreamSchedule([stream, ...streamSchedule]);
    setNewStreamTitle('');
    setShowScheduleStreamModal(false);
    showNotification(`Stream scheduled: "${stream.title}"`);
    addRewardsPoints(50, `Scheduled Live Stream: ${stream.title}`);
  };

  // Administrator Controls
  const handleAdminDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    showNotification("👑 [ADMIN] Thread instantly deleted from community feeds.");
    onAddLog('Admin Action', `Force deleted thread: ${postId}`, 'security');
  };

  const handleAdminEditPost = (postId: string, newContent?: string) => {
    let editVal = newContent;
    if (editVal === undefined) {
      const prompted = prompt("Edit thread content as Super Admin:", "Sourcing certified safety guidelines...");
      if (prompted === null) return;
      editVal = prompted;
    }
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editVal! } : p));
    showNotification("👑 [ADMIN] Post content force-edited under system override.");
    onAddLog('Admin Action', `Force edited content of thread: ${postId}`, 'security');
  };

  const handleAdminDeleteComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.filter(c => c.id !== commentId)
      };
    }));
    showNotification("👑 [ADMIN] Comment force deleted.");
    onAddLog('Admin Action', `Force deleted comment: ${commentId}`, 'security');
  };

  const handleAdminPinPost = (postId: string, pinState?: boolean) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isPinned: pinState !== undefined ? pinState : !p.isPinned };
      }
      return p;
    }));
    showNotification("👑 [ADMIN] Post pinned/unpinned state updated.");
  };

  // Safe buy handler with dynamic library registration & cart sync
  const handlePurchase = async (product: WomenProduct) => {
    setPurchasedProductId(product.id);
    onAddLog('Marketplace Purchase Initiated', `Dispatched cart order for ${product.title}`, 'billing');
    
    await addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      author: product.brand,
      category: product.category,
      images: [product.image],
      acceptedCurrencies: ['scut_token', 'crypto_pol', 'crypto_matic', 'crypto_usdc', 'crypto_usdt', 'card'],
      quantity: 1,
      savedForLater: false,
      isDigital: true,
      details: product.description
    });

    setPurchasedProductId(null);
    setAddedCartProduct(product);
  };

  // Filtered catalog
  const filteredProducts = products.filter(p => currentFilter === 'All' || p.category === currentFilter);

  return (
    <div className="relative min-h-screen bg-gradient-to-tr from-[#fffbfd] via-[#fff3f5] to-[#fffcfd] text-[#422e33] pt-24 pb-20 font-sans overflow-x-hidden antialiased">
      
      {/* Absolute Luxurious Design Ornaments */}
      <div className="absolute top-12 right-12 h-[35rem] w-[35rem] rounded-full bg-rose-200/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-24 left-12 h-[45rem] w-[45rem] rounded-full bg-pink-100/30 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-amber-100/15 blur-[100px] pointer-events-none" />

      {/* Elegant minimalist botanical vector background */}
      <div className="absolute top-28 right-[-6rem] opacity-[0.06] pointer-events-none transform rotate-12 scale-110">
        <svg viewBox="0 0 100 100" className="w-[30rem] h-[30rem] text-rose-800" fill="none" stroke="currentColor" strokeWidth="0.8">
          <path d="M50,90 Q40,60 30,30 Q60,10 70,50 Q45,70 50,90 Z" />
          <circle cx="30" cy="30" r="8" fill="currentColor" fillOpacity="0.1" />
          <circle cx="70" cy="50" r="10" fill="currentColor" fillOpacity="0.1" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* GLOBAL INTEGRATION CONTROL RAIL */}
        <div className="bg-white/80 backdrop-blur-md border border-rose-200/50 rounded-3xl p-4 mb-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#8a6b73]" />
            </div>
            <input 
              type="text" 
              placeholder="Search across all circles, mentors, events..." 
              value={globalSearchQuery}
              onChange={(e) => {
                setGlobalSearchQuery(e.target.value);
                setShowSearchDrawer(e.target.value.trim().length > 0);
              }}
              className="block w-full pl-10 pr-4 py-2 text-xs bg-rose-50/30 border border-[#ebd0d5] rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent text-[#3b1c24] placeholder-[#a4878f] transition-all"
            />
            {globalSearchQuery && (
              <button 
                onClick={() => { setGlobalSearchQuery(''); setShowSearchDrawer(false); }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8a6b73] hover:text-rose-500 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* DYNAMIC SYSTEM POINTS & REWARD TRACKER */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 bg-rose-100/40 px-3 py-1.5 rounded-xl border border-rose-200/35">
              <Award className="h-4 w-4 text-rose-500" />
              <span>Lv. <strong className="text-rose-700">{rewards.level}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-100/40 px-3 py-1.5 rounded-xl border border-rose-200/35">
              <Flame className="h-4 w-4 text-orange-500 animate-pulse" />
              <span>Streak: <strong className="text-[#3b1c24]">{rewards.streak} days</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-rose-100/40 px-3 py-1.5 rounded-xl border border-rose-200/35">
              <Sparkles className="h-4 w-4 text-rose-500" />
              <span>Points: <strong className="text-[#3b1c24]">{rewards.points}</strong></span>
            </div>
            <button 
              onClick={handleClaimDaily}
              disabled={rewards.dailyClaimed}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                rewards.dailyClaimed 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/40' 
                  : 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95 shadow-sm'
              }`}
            >
              {rewards.dailyClaimed ? '✓ Claimed Today' : 'Claim Daily +100'}
            </button>
          </div>

          {/* SUPER ADMINISTRATOR CONTROL SWITCH */}
          <div className="flex items-center gap-2 bg-slate-900/5 px-3 py-1.5 rounded-xl border border-slate-300/20">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600 flex items-center gap-1">
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${isAdminMode ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
              Super Admin Mode
            </span>
            <input 
              type="checkbox" 
              checked={isAdminMode} 
              onChange={(e) => handleToggleAdminMode(e.target.checked)}
              className="sr-only peer"
              id="admin-toggle-switch"
            />
            <label 
              htmlFor="admin-toggle-switch"
              className="relative w-8 h-4 bg-slate-300 rounded-full cursor-pointer peer-checked:bg-rose-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-4"
            />
          </div>
        </div>

        {/* GLOBAL SEARCH RESULTS BOX */}
        <AnimatePresence>
          {showSearchDrawer && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border-2 border-rose-200 rounded-3xl p-6 mb-6 shadow-lg z-50 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
                <h3 className="text-sm font-bold text-[#3b1c24] flex items-center gap-1.5">
                  <Search className="h-4.5 w-4.5 text-rose-500" />
                  Global Telemetry Results for "{globalSearchQuery}"
                </h3>
                <button onClick={() => { setGlobalSearchQuery(''); setShowSearchDrawer(false); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-96 overflow-y-auto pr-2">
                {/* MATCHED COMMUNITY DISCUSSIONS */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Matched Discussions</h4>
                  {posts.filter(p => p.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.content.toLowerCase().includes(globalSearchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No threads found.</p>
                  ) : (
                    posts.filter(p => p.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.content.toLowerCase().includes(globalSearchQuery.toLowerCase())).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => handleGlobalSearchItemClick('post', 'community')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50/50 border border-transparent hover:border-rose-200/40 transition-all text-xs cursor-pointer"
                      >
                        <span className="font-semibold block text-[#3b1c24] truncate">{p.title}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{p.content}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* MATCHED REGISTERED MENTORS */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Matched Mentors</h4>
                  {mentors.filter(m => m.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || m.expertise.toLowerCase().includes(globalSearchQuery.toLowerCase()) || m.bio.toLowerCase().includes(globalSearchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No mentors found.</p>
                  ) : (
                    mentors.filter(m => m.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || m.expertise.toLowerCase().includes(globalSearchQuery.toLowerCase()) || m.bio.toLowerCase().includes(globalSearchQuery.toLowerCase())).map(m => (
                      <button 
                        key={m.id}
                        onClick={() => handleGlobalSearchItemClick('mentor', 'career')}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-rose-50/50 border border-transparent hover:border-rose-200/40 transition-all text-xs cursor-pointer"
                      >
                        <span className="font-semibold block text-[#3b1c24] truncate">{m.name}</span>
                        <span className="text-[10px] text-slate-500 block truncate">{m.expertise} • {m.company}</span>
                      </button>
                    ))
                  )}
                </div>

                {/* MATCHED SERVICES, COURSES & PRODUCTS */}
                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Marketplace & Events</h4>
                  {products.filter(p => p.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(globalSearchQuery.toLowerCase())).length === 0 && safeEvents.filter(e => e.title.toLowerCase().includes(globalSearchQuery.toLowerCase())).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No matches found.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {products.filter(p => p.title.toLowerCase().includes(globalSearchQuery.toLowerCase()) || p.description.toLowerCase().includes(globalSearchQuery.toLowerCase())).map(p => (
                        <button 
                          key={p.id}
                          onClick={() => handleGlobalSearchItemClick('product', 'marketplace')}
                          className="w-full text-left p-2 rounded-xl hover:bg-rose-50/50 text-xs block cursor-pointer"
                        >
                          <span className="font-semibold block text-[#3b1c24] truncate">{p.title}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{p.price} USD • {p.category}</span>
                        </button>
                      ))}
                      {safeEvents.filter(e => e.title.toLowerCase().includes(globalSearchQuery.toLowerCase())).map(e => (
                        <button 
                          key={e.id}
                          onClick={() => handleGlobalSearchItemClick('event', 'events')}
                          className="w-full text-left p-2 rounded-xl hover:bg-rose-50/50 text-xs block cursor-pointer"
                        >
                          <span className="font-semibold block text-emerald-800 truncate">{e.title}</span>
                          <span className="text-[10px] text-emerald-600 block truncate">{e.date} • {e.location}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUPER ADMINISTRATOR MODE ACTIVE OVERLAY BANNER */}
        {isAdminMode && (
          <div className="bg-gradient-to-r from-[#2c000e] via-[#451025] to-[#12052c] text-white rounded-3xl p-5 mb-8 border border-rose-500/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-rose-500/10 skew-x-12 pointer-events-none" />
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[9px] font-bold uppercase tracking-widest">Active System Override</span>
                <span className="text-xs font-bold text-rose-300 font-mono">SCUT SUPER ADMINISTRATOR PROFILE ACTIVE</span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xl">
                You have unrestricted administrative clearance. Moderate threads, delete posts instantly, edit community circles, access locked channels, and test cryptographic nodes.
              </p>
            </div>
            <div className="flex gap-2 relative z-10">
              <button 
                onClick={() => {
                  setPosts(prev => prev.map(p => ({ ...p, isPinned: true })));
                  showNotification("[ADMIN] Pinning all active discussions.");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-semibold border border-white/15 transition-all cursor-pointer"
              >
                Pin All Threads
              </button>
              <button 
                onClick={() => {
                  setRewards(prev => ({ ...prev, points: 5000, level: 6 }));
                  showNotification("[ADMIN] Loyalty Points system reset to 5,000 pts.");
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-[10px] font-semibold shadow-sm transition-all cursor-pointer"
              >
                Reset Points to 5000
              </button>
            </div>
          </div>
        )}
        
        {/* PREMIUM UPPER HEADER HERO */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#ebd0d5] mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 font-mono text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
              <Sparkles className="h-4 w-4 text-rose-400 animate-pulse" />
              <span>Pioneer Secure Suite</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#3b1c24] flex items-center gap-3">
              SCUT Women & Girls <Heart className="h-8 w-8 text-rose-500 fill-rose-500/10 animate-pulse" />
            </h1>
            <p className="text-[#694e55] text-sm max-w-2xl mt-2 leading-relaxed font-light">
              An elegant, cryptographically protected, premium workspace supporting female technology founders, ensuring spatial & network safety, and hosting local health tracking dashboards.
            </p>
          </div>

          {/* ACTIVE DISARM AND SECURITY ACTION TRAY */}
          <div className="flex items-center gap-3">
            {!panicActive ? (
              <button 
                onClick={triggerPanicSOS}
                className="px-5 py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-rose-400 via-pink-500 to-[#c59588] hover:-translate-y-0.5 active:scale-98 transition-all shadow-[0_10px_30px_rgba(244,63,94,0.2)] flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer border border-rose-300/40"
              >
                <ShieldAlert className="h-4.5 w-4.5 animate-bounce" />
                <span>Silent SOS Portal</span>
              </button>
            ) : (
              <button 
                onClick={cancelPanicSOS}
                className="px-5 py-3.5 rounded-2xl font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition-all flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer shadow-md"
              >
                <RefreshCw className="h-4 w-4 animate-spin text-rose-500" />
                <span>Disarm SOS Active</span>
              </button>
            )}

            <button 
              onClick={() => {
                setInvisibleMode(!invisibleMode);
                onAddLog('GPS Shield Toggle', `Switched IP spoof tracker to: ${!invisibleMode}`, 'security');
                showNotification(invisibleMode ? "GPS Geolocation tracking online." : "GPS Geolocation fully shielded.");
              }}
              className={`p-3.5 rounded-2xl border flex items-center gap-2 text-xs transition-all duration-300 cursor-pointer ${
                invisibleMode 
                  ? 'bg-rose-50 border-rose-200 text-rose-600 font-semibold shadow-sm' 
                  : 'bg-white/80 border-[#ebd0d5] text-[#694e55] hover:bg-white'
              }`}
            >
              <EyeOff className={`h-4.5 w-4.5 ${invisibleMode ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline font-mono tracking-wider">{invisibleMode ? 'GPS: SHIELDED' : 'GPS: RAW'}</span>
            </button>
          </div>
        </div>

        {/* PANIC ACTIVE BROADCAST ALARM SCREEN */}
        <AnimatePresence>
          {panicActive && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-br from-[#fff0f2] via-[#ffeef1] to-white border border-rose-300/60 rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden backdrop-blur-xl shadow-[0_20px_50px_rgba(244,63,94,0.15)]"
            >
              <div className="absolute top-0 right-0 h-44 w-44 bg-rose-400/5 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200/40 text-[10px] font-bold font-mono tracking-widest uppercase animate-pulse">
                    🚨 SECURITY BEACON BROADCASTING
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#3b1c24]">Satellite Communication Relay Tunnel Engaged</h2>
                  <p className="text-[#694e55] text-xs sm:text-sm max-w-2xl leading-relaxed">
                    Encrypting and relaying local telemetry GPS coordinates to emergency services and your trusted group contacts list.
                  </p>
                  
                  <div className="space-y-2 pt-2 border-t border-rose-200/40">
                    <div className="flex items-center gap-2.5 text-xs">
                      <div className={`h-2.5 w-2.5 rounded-full ${panicStep >= 1 ? 'bg-rose-500 animate-ping' : 'bg-[#e6b2bb]'}`} />
                      <span className={panicStep >= 1 ? 'text-rose-600 font-medium' : 'text-[#8a6a71]'}>
                        [STAGE 1] Syncing orbital geo-coordinates (Lat: 37.7749° N, Lon: 122.4194° W)...
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <div className={`h-2.5 w-2.5 rounded-full ${panicStep >= 2 ? 'bg-rose-500 animate-ping' : 'bg-[#e6b2bb]'}`} />
                      <span className={panicStep >= 2 ? 'text-rose-600 font-medium' : 'text-[#8a6a71]'}>
                        [STAGE 2] Dispatched priority alert logs via cellular gateway to {emergencyContacts.filter(c => c.isTrustedCircle).length} active guardians...
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <div className={`h-2.5 w-2.5 rounded-full ${panicStep >= 3 ? 'bg-[#0d9488] animate-ping' : 'bg-[#e6b2bb]'}`} />
                      <span className={panicStep >= 3 ? 'text-[#0d9488] font-bold' : 'text-[#8a6a71]'}>
                        [STAGE 3] Cryptographic end-to-end telemetry vault is open. Local recordings streamed.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center gap-2 min-w-[160px] w-full md:w-auto p-4 bg-white/40 rounded-2xl border border-white/60">
                  <span className="text-[10px] text-rose-500 font-bold uppercase tracking-widest animate-pulse">Disarm code required</span>
                  <button 
                    onClick={cancelPanicSOS}
                    className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#3b1c24] text-white hover:bg-black transition-all font-bold text-xs tracking-wider uppercase cursor-pointer shadow-lg shadow-rose-900/10"
                  >
                    DISARM SHIELD
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LUXURIOUS STICKY SUB-NAVIGATION BAR */}
        <div className="sticky top-0 z-40 bg-white/60 backdrop-blur-md border border-white/40 shadow-[0_4px_30px_rgba(243,212,217,0.1)] rounded-2xl p-2 mb-8 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: 'dashboard', label: 'Ecosystem Desk', icon: Heart },
            { id: 'safety', label: 'Safety Hub', icon: Shield },
            { id: 'beauty', label: 'Beauty Studio', icon: Sparkles },
            { id: 'fashion', label: 'Fashion Lookbook', icon: ShoppingBag },
            { id: 'wellness', label: 'Wellness & Health', icon: HeartPulse },
            { id: 'fitness', label: 'Fitness Sprints', icon: Zap },
            { id: 'career', label: 'Careers & Founders', icon: GraduationCap },
            { id: 'community', label: 'Community Circles', icon: Users },
            { id: 'marketplace', label: 'Safe Marketplace', icon: ShoppingBag },
            { id: 'learning', label: 'Learning Academy', icon: BookOpen },
            { id: 'events', label: 'Meetups & Events', icon: Calendar },
            { id: 'fun', label: 'Fun & Rewards', icon: Flame },
            { id: 'ai_assistant', label: 'Athena AI Desk', icon: Bot },
            { id: 'privacy', label: 'Privacy Center', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 whitespace-nowrap transition-all duration-300 border cursor-pointer ${
                  active 
                    ? 'bg-gradient-to-r from-rose-50 to-[#ffe9ed] border-rose-200/80 text-[#3b1c24] shadow-md shadow-rose-100/30 font-bold' 
                    : 'bg-transparent border-transparent text-[#694e55] hover:text-[#3b1c24] hover:bg-white/40'
                }`}
              >
                <Icon className={`h-4 w-4 transition-colors ${active ? 'text-rose-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ANIMATED ROUTER TABS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* TAB 1: ECOSYSTEM DESK (DASHBOARD) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                
                {/* ATHENA COMPANION AND ADVICE PANEL */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left advice */}
                  <div className="lg:col-span-1 bg-gradient-to-br from-[#fff6f8] to-white border border-[#ebd0d5] rounded-3xl p-6.5 flex flex-col justify-between relative overflow-hidden shadow-xl shadow-rose-100/10">
                    <div className="absolute -top-10 -right-10 text-rose-300/10 transform rotate-45 pointer-events-none">
                      <Heart className="w-40 h-40 fill-current" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-rose-500 font-mono text-[9px] font-bold uppercase tracking-widest">
                        <Sparkle className="h-4 w-4 text-rose-400" />
                        <span>Real-Time Security Intelligence</span>
                      </div>
                      <blockquote className="text-[#3b1c24] text-sm font-semibold leading-relaxed italic border-l-2 border-rose-300 pl-3">
                        "{aiTip}"
                      </blockquote>
                      <p className="text-[11px] text-[#694e55] leading-relaxed">
                        This micro-advice is compiled locally based on threat index scans and workspace privacy sweeping.
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-[#f2dbe0] mt-6 flex justify-between items-center">
                      <button 
                        onClick={fetchDailyAITip}
                        disabled={generatingTip}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <RefreshCw className={`h-3 w-3 ${generatingTip ? 'animate-spin' : ''}`} />
                        <span>Sync Secure Advice</span>
                      </button>
                      <Sparkles className="h-4 w-4 text-rose-400" />
                    </div>
                  </div>

                  {/* ATHENA SECURE AI MESSENGER */}
                  <div className="lg:col-span-2 bg-white/70 backdrop-blur-md border border-[#ebd0d5] rounded-3xl p-6 flex flex-col justify-between min-h-[350px] shadow-xl shadow-rose-100/5">
                    <div className="flex items-center justify-between pb-3.5 border-b border-[#f2dbe0] mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
                          <Bot className="h-5 w-5 text-rose-500" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wide">Athena Intelligence Companion</h3>
                          <span className="text-[9px] text-[#694e55] font-mono block">Offline-First Cryptographic Sandbox</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase font-bold">Node Secure</span>
                    </div>

                    {/* Chat dialog window */}
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[14rem] pr-1.5 text-xs">
                      {athenaChat.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.sender === 'user' ? 'bg-[#3b1c24] text-white' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                            {msg.sender === 'user' ? 'U' : 'A'}
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-[80%] border ${msg.sender === 'user' ? 'bg-rose-500/10 border-rose-200 text-[#3b1c24] rounded-tr-none' : 'bg-white border-slate-100 text-[#3b1c24] rounded-tl-none shadow-sm'}`}>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      {athenaLoading && (
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-full shrink-0 bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] animate-pulse">A</div>
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 italic animate-pulse rounded-tl-none shadow-sm">
                            Athena is computing risk matrix...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick prompts */}
                    <div className="pt-3.5 flex flex-wrap gap-2">
                      {athenaPresets.map((pr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAthenaSubmit(pr.text)}
                          disabled={athenaLoading}
                          className="px-3 py-1.5 rounded-lg bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/40 text-[10px] font-semibold text-rose-700 cursor-pointer transition-all"
                        >
                          ✨ {pr.label}
                        </button>
                      ))}
                    </div>

                    {/* Input box */}
                    <form onSubmit={(e) => { e.preventDefault(); handleAthenaSubmit(); }} className="pt-3 border-t border-[#f2dbe0] mt-3 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type safe query here (e.g., Explain Follicular phase business benefits...)"
                        value={athenaInput}
                        onChange={e => setAthenaInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-[#3b1c24] placeholder-slate-400 focus:outline-none focus:border-rose-400"
                      />
                      <button type="submit" className="px-4 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold hover:opacity-95 transition-all flex items-center justify-center cursor-pointer shadow-md shadow-rose-200">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                </div>

                <FloralDivider />

                {/* CORE ECOSYSTEM BENTO STATS CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Emergency Status */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_10px_35px_rgba(243,212,217,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(243,212,217,0.25)] transition-all duration-300">
                    <div className="space-y-4">
                      <div className="p-3 bg-rose-50 text-rose-500 border border-rose-100 rounded-2xl w-fit">
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Active Safe Ring</h3>
                        <p className="text-2xl font-black text-[#3b1c24] mt-1">{emergencyContacts.length} Contacts Linked</p>
                      </div>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        Automated panic broadcasts scheduled. Security protocols synchronized with satellite cell towers.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('safety')} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 mt-5 cursor-pointer">
                      <span>Refine Circles</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Health predictions */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_10px_35px_rgba(243,212,217,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(243,212,217,0.25)] transition-all duration-300">
                    <div className="space-y-4">
                      <div className="p-3 bg-pink-50 text-pink-500 border border-pink-100 rounded-2xl w-fit">
                        <HeartPulse className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">{cycleStatus.status}</h3>
                        <p className="text-2xl font-black text-[#3b1c24] mt-1">Cycle Day {cycleDay}</p>
                      </div>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        {cycleStatus.desc.substring(0, 110)}...
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('health')} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 mt-5 cursor-pointer">
                      <span>Log Metrics</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Mentors */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_10px_35px_rgba(243,212,217,0.15)] hover:-translate-y-1 hover:shadow-[0_15px_45px_rgba(243,212,217,0.25)] transition-all duration-300">
                    <div className="space-y-4">
                      <div className="p-3 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl w-fit">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Global Mentorship</h3>
                        <p className="text-2xl font-black text-[#3b1c24] mt-1">
                          {mentors.filter(m => m.matched).length} Handshaked Expert
                        </p>
                      </div>
                      <p className="text-xs text-[#694e55] leading-relaxed font-light">
                        You have connected with Diana Prince (Fortress Core Principal Cybersecurity Architect). Safe chat is unlocked.
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('career')} className="text-xs text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1.5 mt-5 cursor-pointer">
                      <span>Browse Pioneers</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>

                </div>

                {/* RECENT NOTIFICATIONS STREAM */}
                <div className="bg-white/50 border border-[#ebd0d5]/80 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-500">
                        <Bell className="h-4 w-4" />
                      </div>
                      <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wider">Suite Security Advisories</h3>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                      1 Active Signal
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { id: 1, text: "Zero-Knowledge identity logs verified. Your community credential signature is secure.", time: "Today, 11:15 AM", priority: false },
                      { id: 2, text: "Mentorship matchmaking refresh: 2 new venture coaches have published availability slots.", time: "Yesterday", priority: true }
                    ].map(n => (
                      <div key={n.id} className="p-4 rounded-2xl bg-white border border-slate-50 flex items-start gap-3 hover:border-rose-100 transition-colors">
                        <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.priority ? 'bg-amber-400' : 'bg-rose-400'}`} />
                        <div className="flex-1 space-y-1">
                          <p className="text-xs leading-relaxed font-medium text-[#3b1c24]">{n.text}</p>
                          <span className="text-[9px] text-slate-400 font-mono block">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: SAFETY CENTER & EMERGENCY CIRCLES */}
            {activeTab === 'safety' && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Circles card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)] relative">
                    <div className="absolute top-4 right-4 text-rose-500/5">
                      <Heart className="w-16 h-16 fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <Phone className="h-5 w-5 text-rose-500" /> Emergency Circle Guardians
                      </h3>
                      <p className="text-xs text-[#694e55] mt-1 leading-relaxed">
                        Add and configure trust contacts. These devices receive private geolocation SMS texts when Silent SOS triggers.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {emergencyContacts.map(c => (
                        <div key={c.id} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-100 flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#3b1c24]">{c.name}</span>
                              <span className="text-[9px] font-mono font-bold bg-rose-50 border border-rose-100 text-rose-500 px-1.5 py-0.5 rounded-lg">
                                {c.relation}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-slate-400">{c.phone}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            {c.isTrustedCircle ? (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-xl font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Active Link
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl font-medium">
                                Automated Hub
                              </span>
                            )}
                            
                            {c.id !== 'ec-3' && (
                              <button 
                                onClick={() => {
                                  setEmergencyContacts(emergencyContacts.filter(item => item.id !== c.id));
                                  onAddLog('Emergency Contact Purged', `Removed ${c.name} from distress broadcast list`, 'security');
                                  showNotification(`Purged ${c.name} from trust ring.`);
                                }}
                                className="p-1.5 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all cursor-pointer text-xs font-black"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add contact form */}
                    <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100 space-y-3.5">
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block">Register New Guardian</span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <input 
                          type="text" 
                          placeholder="Contact Name" 
                          required
                          value={newContact.name}
                          onChange={e => setNewContact({...newContact, name: e.target.value})}
                          className="rounded-xl bg-white border border-slate-200/60 text-xs px-3 py-2.5 text-[#3b1c24] focus:outline-none focus:border-rose-300"
                        />
                        <input 
                          type="text" 
                          placeholder="Relation (Sister, etc.)" 
                          value={newContact.relation}
                          onChange={e => setNewContact({...newContact, relation: e.target.value})}
                          className="rounded-xl bg-white border border-slate-200/60 text-xs px-3 py-2.5 text-[#3b1c24] focus:outline-none focus:border-rose-300"
                        />
                        <input 
                          type="text" 
                          placeholder="Mobile Number" 
                          required
                          value={newContact.phone}
                          onChange={e => setNewContact({...newContact, phone: e.target.value})}
                          className="rounded-xl bg-white border border-slate-200/60 text-xs px-3 py-2.5 text-[#3b1c24] focus:outline-none focus:border-rose-300"
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-3 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-md"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Authorize Safe Guardian Link</span>
                      </button>
                    </form>
                  </div>

                  {/* Digital tracking sweeper instruction guide */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <Shield className="h-5 w-5 text-rose-500" /> Spatial & Identity Shields
                      </h3>
                      <p className="text-xs text-[#694e55] mt-1 leading-relaxed">
                        Follow our localized system guidelines to sweep hardware and spoof coordinates.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { title: 'Sweeping Unwanted Magnetic Tracker Tags', cat: 'Physical Safety', read: '5 min read', desc: 'Secure diagnostics instruction to scan and locate unauthorized GPS tags attached to vehicular chassis or bags.' },
                        { title: 'Local Cryptographic Signature Setup', cat: 'Network Defense', read: '4 min read', desc: 'How to utilize your SCUT decentralized ID keys to mask browser cookies and hide coordinates on forum pages.' },
                        { title: 'Verifying Secure Hotel Node Wifi Networks', cat: 'Travel Safeguard', read: '3 min read', desc: 'Establishing double proxy relays when logging into unsecured public accommodation wifi terminals.' }
                      ].map((g, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-[#fffcfd] border border-[#ebd0d5]/60 hover:border-rose-300 transition-all cursor-pointer">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[9px] font-mono font-bold uppercase bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.5 rounded-full">{g.cat}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{g.read}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#3b1c24]">{g.title}</h4>
                          <p className="text-[11px] text-[#694e55] mt-1 leading-relaxed">{g.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* CLINIC HELP DIRECTORIES */}
                <div className="bg-white/70 border border-[#ebd0d5] rounded-3xl p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-rose-500" /> Support Clinic Directories
                      </h3>
                      <p className="text-xs text-[#694e55] mt-1 leading-relaxed">Verified legal counsel collectives, professional psychological therapists, and crisis safehouses.</p>
                    </div>
                    <Sparkle className="h-8 w-8 text-rose-300/40" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {clinics.map(c => (
                      <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-100 flex flex-col justify-between shadow-sm hover:border-rose-200 transition-all duration-300">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="h-3.5 w-3.5 fill-amber-400 stroke-amber-500" />
                              <span className="text-xs font-bold font-mono">{c.rating}</span>
                              <span className="text-[9px] text-slate-400 font-mono">({c.reviewsCount})</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">Verified</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#3b1c24]">{c.name}</h4>
                            <p className="text-[10px] text-rose-500 font-semibold mt-0.5">{c.specialty}</p>
                          </div>
                          <p className="text-[11px] text-[#694e55] leading-relaxed font-light">{c.location}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between gap-3">
                          <span className="text-[10px] font-mono text-slate-400">{c.phone}</span>
                          <a 
                            href={`tel:${c.phone}`}
                            onClick={() => onAddLog('Support Hotline Dialed', `Connected to support counselor at ${c.name}`, 'security')}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-50/50 hover:bg-rose-500 hover:text-white text-rose-500 font-bold text-[10px] transition-all cursor-pointer border border-rose-100"
                          >
                            Dial Hotline
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: CONFIDENTIAL HEALTH TRACKER */}
            {activeTab === 'health' && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Predictive Dial Phase */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)] flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Predictive Cycle Engine</h3>
                      <p className="text-xs text-[#694e55] mt-1 leading-relaxed">Adjust logs below to compute physiological parameters locally.</p>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono font-medium">
                          <span className="text-slate-500">Typical Cycle Length</span>
                          <span className="text-rose-500 font-bold">{cycleLength} Days</span>
                        </div>
                        <input 
                          type="range" 
                          min={21} 
                          max={35}
                          value={cycleLength}
                          onChange={e => {
                            setCycleLength(Number(e.target.value));
                            if (cycleDay > Number(e.target.value)) setCycleDay(Number(e.target.value));
                          }}
                          className="w-full accent-rose-500 cursor-pointer h-1 bg-rose-100 rounded-lg appearance-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono font-medium">
                          <span className="text-slate-500">Current Day of Cycle</span>
                          <span className="text-pink-500 font-bold">Day {cycleDay}</span>
                        </div>
                        <input 
                          type="range" 
                          min={1} 
                          max={cycleLength}
                          value={cycleDay}
                          onChange={e => setCycleDay(Number(e.target.value))}
                          className="w-full accent-pink-500 cursor-pointer h-1 bg-rose-100 rounded-lg appearance-none"
                        />
                      </div>
                    </div>

                    {/* Interactive glowing visual ring */}
                    <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#fffbfe] to-[#fff5f7] border border-rose-100 flex flex-col items-center justify-center text-center space-y-3.5 relative shadow-inner">
                      <div className="relative h-28 w-28 rounded-full border-4 border-dashed border-rose-100 flex items-center justify-center shadow-lg shadow-rose-100/50">
                        <div className="absolute inset-2.5 rounded-full border border-rose-200/60 flex flex-col items-center justify-center p-2 bg-white">
                          <span className="text-[9px] text-slate-400 font-bold font-mono uppercase">Day</span>
                          <span className="text-3xl font-black text-rose-500 leading-none">{cycleDay}</span>
                          <span className="text-[8px] text-slate-400 font-mono mt-1">of {cycleLength}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#3b1c24] px-2.5 py-1 rounded-full bg-white border border-rose-100 shadow-sm inline-block">
                          {cycleStatus.status}
                        </span>
                        <p className="text-[11px] text-[#694e55] leading-relaxed mt-2 font-light">{cycleStatus.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Log Symptom Parameter Form */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 flex flex-col justify-between shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-black text-[#3b1c24]">Log Sandbox Symptoms</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Save health metrics without compromising privacy.</p>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase font-mono text-[#694e55] tracking-wider font-bold">Current Mood Indicator</label>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {['Calm', 'Energetic', 'Tired', 'Anxious', 'Joyful'].map(moodOption => (
                              <button
                                key={moodOption}
                                onClick={() => setNewLog({ ...newLog, mood: moodOption as any })}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${newLog.mood === moodOption ? 'bg-rose-500 border-rose-500 text-white shadow-sm shadow-rose-200' : 'bg-white border-slate-200/80 text-slate-500 hover:border-rose-300'}`}
                              >
                                {moodOption}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Water Consumption</span>
                            <span className="text-rose-500 font-bold">{newLog.hydration} Liters</span>
                          </div>
                          <input 
                            type="range" 
                            min={0.5} 
                            max={4.0} 
                            step={0.1}
                            value={newLog.hydration}
                            onChange={e => setNewLog({ ...newLog, hydration: Number(e.target.value) })}
                            className="w-full accent-rose-400 cursor-pointer h-1 bg-rose-50 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">Sleep Duration</span>
                            <span className="text-pink-500 font-bold">{newLog.sleepHours} Hours</span>
                          </div>
                          <input 
                            type="range" 
                            min={3} 
                            max={12} 
                            step={0.5}
                            value={newLog.sleepHours}
                            onChange={e => setNewLog({ ...newLog, sleepHours: Number(e.target.value) })}
                            className="w-full accent-pink-400 cursor-pointer h-1 bg-rose-50 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        const addedLog: HealthLog = {
                          date: 'Jul ' + (18 + healthLogs.length),
                          mood: newLog.mood,
                          hydration: newLog.hydration,
                          sleepHours: newLog.sleepHours,
                          periodDay: cycleDay
                        };
                        setHealthLogs([addedLog, ...healthLogs]);
                        onAddLog('Symptom Log Updated', `Saved local symptom file: sleep ${newLog.sleepHours}h, hydration ${newLog.hydration}L`, 'chat');
                        showNotification("Symptom log filed securely on device cache.");
                      }}
                      className="w-full py-3 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-xs tracking-wider uppercase cursor-pointer transition-all mt-6 shadow-md"
                    >
                      Save Secure Entry Log
                    </button>
                  </div>

                  {/* Recharts Analytics Chart */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-4 flex flex-col justify-between shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24]">Confidential Sleep Cycles</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Dynamic sleep patterns from local storage logs.</p>
                    </div>

                    <div className="h-40 w-full bg-slate-50/50 border border-slate-100 rounded-2xl p-2 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[...healthLogs].reverse()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f2dbe0" opacity={0.5} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} />
                          <YAxis stroke="#94a3b8" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#ebd0d5', borderRadius: '12px', fontSize: '11px', color: '#3b1c24' }} />
                          <Area type="monotone" dataKey="sleepHours" stroke="#f43f5e" strokeWidth={2} fillOpacity={0.15} fill="url(#colorSleepGradient)" />
                          <defs>
                            <linearGradient id="colorSleepGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-[#694e55] leading-relaxed">
                      <span className="font-bold text-rose-500 block">Ecosystem Health Intelligence:</span>
                      <p>Your sleep statistics indicate balanced neural restoration. Hydrate regularly during Creative Follicular Windows for peak cognitive performance.</p>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: CAREERS, EDUCATION, & DEEP MENTORSHIP */}
            {activeTab === 'career' && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Careers */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-rose-500" /> Scholarships & Bootcamps
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Access secure grants and technical development certificates in zero-knowledge scaling.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { id: 'o-1', title: 'Ada Lovelace Zero-Knowledge Grant', org: 'SCUT Labs Group', category: 'Scholarship', benefit: '$12,000 equity-free research stipend + private API endpoints' },
                        { id: 'o-2', title: 'Rust Cryptography Intensive Course', org: 'Sentinel Academic Alliance', category: 'Course', benefit: 'Certified secure architect status + 1:1 expert mentor matches' },
                        { id: 'o-3', title: 'Female Founders Venture Masterclass', org: 'Apex Ascent Fund', category: 'Workshop', benefit: 'Private pitch evaluation session with leading seed capital partners' }
                      ].map((opp) => (
                        <div key={opp.id} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col justify-between hover:border-rose-200 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-500 border border-rose-100 px-2.5 py-0.5 rounded-full">
                              {opp.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{opp.org}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#3b1c24] mb-1">{opp.title}</h4>
                          <p className="text-[11px] text-[#694e55] leading-relaxed font-light">{opp.benefit}</p>
                          
                          <button 
                            onClick={() => {
                              onAddLog('Syllabus Packet Downloaded', `Requested details for: ${opp.title}`, 'chat');
                              showNotification(`Transmitting syllabus document for ${opp.title} securely.`);
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 mt-3 w-fit cursor-pointer"
                          >
                            <span>Read Full Syllabus</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Founders Hub */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6.5 space-y-6 shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-rose-500" /> Female Founders Hub
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Discover and transact B2B with verified female-led pioneer brands.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {founders.map((f, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-100 flex gap-4 hover:border-rose-200 transition-colors">
                          <div className="text-3xl p-3 bg-rose-50 rounded-2xl h-fit border border-rose-100 flex items-center justify-center">
                            {f.logo}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-bold text-[#3b1c24]">{f.brand}</h4>
                              <span className="text-[10px] text-slate-400 font-mono">By {f.name}</span>
                            </div>
                            <span className="text-[9px] font-mono text-rose-500 font-bold tracking-wider uppercase block">{f.niche}</span>
                            <p className="text-[11px] text-[#694e55] leading-relaxed font-light">{f.bio}</p>
                            
                            <div className="flex items-center gap-4 pt-2">
                              <button 
                                onClick={() => {
                                  onAddLog('B2B Connection Request', `Sent contact query to ${f.brand}`, 'chat');
                                  showNotification(`Sent encrypted B2B interest query to ${f.brand}.`);
                                }}
                                className="text-[9px] bg-rose-50/50 hover:bg-rose-500 hover:text-white text-rose-500 border border-rose-100 px-3 py-1 rounded-xl font-bold transition-all cursor-pointer"
                              >
                                Send Secure Query
                              </button>
                              <span className="text-[10px] text-amber-600 font-mono font-semibold flex items-center gap-0.5">★ 5.0 Rating</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* MENTORSHIP INTEGRATION */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-[0_15px_45px_rgba(243,212,217,0.1)]">
                  <div className="mb-6 flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                        <Handshake className="h-5 w-5 text-rose-500" /> Deep Mentorship Pairings
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">Handshake with industry guides to coordinate startup benchmarks securely.</p>
                    </div>
                    
                    <button 
                      onClick={() => onNavigate('scutchat')}
                      className="px-4 py-2 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-500 hover:text-white text-rose-500 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Launch SCUT Chat</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mentors.map(m => (
                      <div key={m.id} className="p-5 rounded-2xl bg-white border border-slate-100 flex flex-col justify-between shadow-sm hover:border-rose-200 transition-all duration-300">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-semibold">{m.company}</span>
                            {m.available ? (
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Ready</span>
                            ) : (
                              <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">Paired</span>
                            )}
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <img src={m.avatarUrl} alt={m.name} className="h-11 w-11 rounded-full border border-slate-100 bg-white object-cover shadow-sm shrink-0" referrerPolicy="no-referrer" />
                            <div>
                              <h4 className="text-xs font-bold text-[#3b1c24]">{m.name}</h4>
                              <p className="text-[10px] text-rose-500 font-bold leading-normal">{m.expertise}</p>
                              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-light">{m.bio}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-50 mt-4">
                          {m.matched ? (
                            <div className="space-y-2">
                              <span className="w-full py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-[10px] flex items-center justify-center gap-1">
                                <Check className="h-3.5 w-3.5" /> Connection Handshaked
                              </span>
                              <button
                                onClick={() => onNavigate('scutchat')}
                                className="w-full py-2 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                              >
                                <MessageCircle className="h-3 w-3" />
                                <span>Message on SCUT Chat</span>
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => requestMentorship(m.id, m.name)}
                              disabled={isMatchingMentorId === m.id}
                              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 hover:opacity-95 text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                            >
                              {isMatchingMentorId === m.id ? (
                                <>
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                  <span>Locking Link...</span>
                                </>
                              ) : (
                                <span>Request Safe Handshake</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 5: COMMUNITY BOARDS & SAFE EVENTS (MASTER SOCIAL FEED & COMPOSE WITH UPLOAD) */}
            {activeTab === 'community' && (
              <div className="space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* LEFT SIDEBAR: COMMUNITY CIRCLES INDEX (4 cols on large screens) */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wider flex items-center gap-2">
                          <Users className="h-4.5 w-4.5 text-rose-500" />
                          <span>Ecosystem Circles</span>
                        </h3>
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {communityGroups.length} total
                        </span>
                      </div>

                      {/* Group Search Filter */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder="Search circles..." 
                          value={groupSearchQuery}
                          onChange={(e) => setGroupSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 text-[11px] border border-slate-200/60 focus:outline-none focus:border-rose-400"
                        />
                      </div>

                      {/* Group Circle List */}
                      <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                        {communityGroups
                          .filter(g => g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) || g.category.toLowerCase().includes(groupSearchQuery.toLowerCase()))
                          .map((g) => {
                            const isJoined = joinedGroups.includes(g.name);
                            const isSelected = activeGroupFilter === g.name;
                            const isPrivate = g.isPrivate;

                            return (
                              <div 
                                key={g.id}
                                className={`group p-2.5 rounded-2xl border transition-all flex flex-col gap-1.5 cursor-pointer ${
                                  isSelected 
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200/50' 
                                    : 'bg-[#fffcfd]/40 border-rose-100 hover:bg-rose-50/50 hover:border-rose-200'
                                }`}
                                onClick={() => setActiveGroupFilter(isSelected ? 'All' : g.name)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-base shrink-0">{g.icon}</span>
                                    <div className="truncate">
                                      <span className={`text-[11px] font-bold block truncate ${isSelected ? 'text-white' : 'text-[#3b1c24]'}`}>
                                        {g.name}
                                      </span>
                                      <span className={`text-[9px] font-mono block ${isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                                        {g.category} • {g.membersCount} members
                                      </span>
                                    </div>
                                  </div>

                                  {isPrivate && (
                                    <span className={`shrink-0 p-1 rounded-full ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                      <Lock className="h-3 w-3" />
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-rose-200/20">
                                  <span className={`text-[9px] font-mono ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                    {isPrivate ? '🔑 Private' : '🌐 Public'}
                                  </span>

                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isJoined) {
                                        setJoinedGroups(joinedGroups.filter(name => name !== g.name));
                                        showNotification(`Departed ${g.name} circle.`);
                                      } else {
                                        if (isPrivate && !isAdminMode) {
                                          showNotification(`Request sent to ${g.name} administrators. Super Admin Bypass is off.`);
                                        } else {
                                          setJoinedGroups([...joinedGroups, g.name]);
                                          showNotification(isAdminMode && isPrivate ? `👑 [ADMIN BYPASS] Instant entrance to Private circle: ${g.name}` : `Successfully synchronized into ${g.name}!`);
                                        }
                                      }
                                    }}
                                    className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                      isJoined 
                                        ? isSelected ? 'bg-rose-600 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200/30'
                                        : isSelected ? 'bg-white text-rose-600' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-200/30'
                                    }`}
                                  >
                                    {isJoined ? '✓ Joined' : isPrivate && !isAdminMode ? 'Request' : 'Join'}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>

                      {/* CREATE NEW CIRCLE TRIGGER */}
                      <button 
                        onClick={() => {
                          const name = prompt("Enter new Circle name:");
                          if (!name) return;
                          const category = prompt("Enter category (e.g., Beauty, Moms, Students, Career):", "General");
                          const isPriv = confirm("Is this circle cryptographically private?");
                          submitCreateGroup(name, category || "General", isPriv);
                        }}
                        className="w-full py-2.5 rounded-xl border border-dashed border-rose-300 hover:border-rose-500 text-rose-500 hover:bg-rose-50/50 font-bold text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Form Custom Circle</span>
                      </button>
                    </div>

                    {/* INTERACTIVE CONNECTIONS (TRUST COMPANIONS) */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle className="h-4.5 w-4.5 text-rose-500" />
                          <span>Trusted Connections</span>
                        </h3>
                        <p className="text-[9px] text-slate-400 mt-0.5">Encrypted companion peer-to-peer index.</p>
                      </div>

                      <div className="space-y-2">
                        {connections.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-2xl bg-rose-50/20 border border-rose-100 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{c.avatar}</span>
                              <div>
                                <span className="font-bold text-[#3b1c24] block">{c.name}</span>
                                <span className="text-[9px] text-slate-400 block font-mono">{c.scutId}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] text-[#3b1c24] font-semibold block">Rep: {c.reputation}</span>
                              <span className="text-[8px] text-emerald-600 font-bold block">● {c.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ADD COMPANION FIELD */}
                      <div className="pt-2 border-t border-slate-100 flex gap-1.5">
                        <input 
                          type="text" 
                          id="scut-companion-id-input"
                          placeholder="Paste Peer SCUT ID..." 
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[10px] text-[#3b1c24] focus:outline-none focus:border-rose-400"
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById('scut-companion-id-input') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              handleConnectFriend(input.value);
                              input.value = '';
                            } else {
                              showNotification("Please enter a valid SCUT network node address.");
                            }
                          }}
                          className="px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase transition-all cursor-pointer"
                        >
                          Link
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MIDDLE COLUMN: SOCIAL COMPOSER & POST FEED (6 cols on large screens) */}
                  <div className="lg:col-span-6 space-y-6">

                    {/* ACTIVE PEER STORIES BAR */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-4 shadow-sm space-y-2.5">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Active Peer Stories</span>
                      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
                        
                        {/* Add story action */}
                        <div 
                          onClick={() => {
                            showNotification("Pushed a transient story look securely to peers. Stripped telemetry logs!");
                            onAddLog('Uploaded Secure Story', 'Staged anonymous 24h lookup item', 'chat');
                          }}
                          className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                        >
                          <div className="h-12 w-12 rounded-full border-2 border-dashed border-rose-300 flex items-center justify-center bg-rose-50/40 hover:bg-rose-100/40 transition-all">
                            <Plus className="h-4 w-4 text-rose-500" />
                          </div>
                          <span className="text-[8px] font-bold text-slate-400">Add Story</span>
                        </div>

                        {/* Stories rows */}
                        {[
                          { creator: 'Clara Oswald', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', mediaUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80', caption: 'Brainstorming startup logistics in Bucharest!' },
                          { creator: 'Diana Prince', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', mediaUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80', caption: 'Zero-knowledge audits are finalized.' },
                          { creator: 'Fiona Gallagher', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', mediaUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80', caption: 'Loving the new biometric wristband sample! 💖' },
                          { creator: 'Elena Rostova', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', mediaUrl: 'https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=800&auto=format&fit=crop&q=80', caption: 'Herbal remedies & adaptogens for high-performance.' }
                        ].map((story, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setSelectedStory(story)}
                            className="flex flex-col items-center gap-1 cursor-pointer shrink-0"
                          >
                            <div className="h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-rose-400 via-pink-500 to-amber-400 hover:scale-105 transition-all">
                              <img src={story.avatar} alt={story.creator} className="h-full w-full object-cover rounded-full border border-white" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[8px] font-bold text-slate-500 truncate max-w-[50px]">{story.creator.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ACTIVE GROUP BANNER FILTER DISPLAY */}
                    {activeGroupFilter !== 'All' && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-between text-xs font-semibold text-rose-700">
                        <span>Viewing posts only in circle: <strong>{activeGroupFilter}</strong></span>
                        <button 
                          onClick={() => setActiveGroupFilter('All')}
                          className="px-2 py-0.5 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-800 text-[9px] uppercase cursor-pointer"
                        >
                          Clear Filter
                        </button>
                      </div>
                    )}

                    {/* MULTI-MEDIA RICH SOCIAL COMPOSER */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-6.5 shadow-sm space-y-4">
                      <div className="flex justify-between items-center gap-4 border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-rose-500" /> Start Safe Conversation
                        </h3>
                        
                        {/* Anonymizer profile toggle */}
                        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500">Anonymous Signature</span>
                          <button 
                            type="button"
                            onClick={() => {
                              setComposerAnonymous(!composerAnonymous);
                              showNotification(composerAnonymous ? "Real name signature enabled." : "Signature fully anonymized.");
                            }}
                            className={`w-9 h-5.5 rounded-full p-0.5 transition-colors cursor-pointer ${composerAnonymous ? 'bg-rose-500' : 'bg-slate-300'}`}
                          >
                            <div className={`w-4.5 h-4.5 rounded-full bg-white shadow-sm transform duration-200 ${composerAnonymous ? 'translate-x-3.5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleCreatePost} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input 
                            type="text" 
                            placeholder="Post Title / Topic heading" 
                            required
                            value={composerTitle}
                            onChange={e => setComposerTitle(e.target.value)}
                            className="sm:col-span-2 rounded-xl bg-slate-50/50 border border-slate-200/60 text-xs px-3 py-2.5 text-[#3b1c24] focus:outline-none focus:border-rose-300"
                          />
                          <select 
                            value={composerGroup}
                            onChange={e => setComposerGroup(e.target.value)}
                            className="rounded-xl bg-slate-50/50 border border-slate-200/60 text-xs px-2.5 py-2.5 text-[#3b1c24] focus:outline-none focus:border-rose-300 cursor-pointer font-semibold"
                          >
                            {communityGroups.map(g => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </div>

                        <textarea 
                          placeholder="What would you like to discuss with the community circle? Encrypted client-side..." 
                          required
                          value={composerContent}
                          onChange={e => setComposerContent(e.target.value)}
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200/60 text-xs px-3.5 py-3 text-[#3b1c24] focus:outline-none focus:border-rose-300 min-h-[5.5rem] leading-relaxed"
                        />

                        {/* TOGGLE TO INCLUDE INTERACTIVE POLL */}
                        <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                              <Sliders className="h-3.5 w-3.5 text-rose-500" />
                              Include Community Poll
                            </span>
                            <button 
                              type="button"
                              onClick={() => {
                                setComposerHasPoll(!composerHasPoll);
                                if (!composerHasPoll) {
                                  setComposerPollOptions(["Agree completely", "Needs development", "Disagree"]);
                                  showNotification("Community Poll questionnaire attached.");
                                } else {
                                  showNotification("Poll removed.");
                                }
                              }}
                              className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                composerHasPoll ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {composerHasPoll ? 'Attached' : '+ Attach'}
                            </button>
                          </div>

                          {composerHasPoll && (
                            <div className="space-y-2 pt-1">
                              {composerPollOptions.map((opt, oIdx) => (
                                <input 
                                  key={oIdx}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const nextOpts = [...composerPollOptions];
                                    nextOpts[oIdx] = e.target.value;
                                    setComposerPollOptions(nextOpts);
                                  }}
                                  placeholder={`Option ${oIdx + 1}`}
                                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-[#3b1c24]"
                                />
                              ))}
                            </div>
                          )}
                        </div>

                        {/* TOGGLE AS VIDEO POST / REEL */}
                        <div className="flex items-center justify-between bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                            <Play className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                            Publish as Playable Reel Video Post
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setComposerIsVideo(!composerIsVideo);
                              showNotification(composerIsVideo ? "Regular post format restored." : "Post format switched to Playable Reel!");
                            }}
                            className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase transition-all ${
                              composerIsVideo ? 'bg-[#3b1c24] text-white shadow-sm' : 'bg-white border text-slate-500'
                            }`}
                          >
                            {composerIsVideo ? 'Reel Active' : 'Normal'}
                          </button>
                        </div>

                        {/* Drag-and-Drop Image Uploader */}
                        <div 
                          onDragOver={handleFileDragOver}
                          onDragLeave={handleFileDragLeave}
                          onDrop={handleFileDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className={`p-4 rounded-xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                            isDraggingFile 
                              ? 'border-rose-400 bg-rose-50/60' 
                              : composerAttachedImage 
                                ? 'border-emerald-300 bg-emerald-50/30' 
                                : 'border-slate-200 hover:border-rose-300 bg-slate-50/20'
                          }`}
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleManualFileSelect}
                            accept="image/*"
                            className="hidden"
                          />
                          {composerAttachedImage ? (
                            <div className="flex items-center gap-3">
                              <img src={composerAttachedImage} className="h-10 w-10 object-cover rounded-lg border" alt="staged upload" />
                              <div className="text-left">
                                <span className="text-[10px] font-bold text-emerald-700 block">✓ Image Staged (Secured locally)</span>
                                <span className="text-[9px] text-slate-400 block">Click or drag another to replace</span>
                              </div>
                              <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setComposerAttachedImage(null); }}
                                className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <UploadCloud className="h-6 w-6 text-slate-400" />
                              <span className="text-[10px] text-slate-500 font-semibold">Drag & drop photo here, or <span className="text-rose-500">browse file</span></span>
                              <span className="text-[9px] text-slate-400 block font-mono">Accepts PNG, JPG (automatically metadata-swept)</span>
                            </>
                          )}
                        </div>

                        {/* Preset quick-attach items */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1 pb-2 border-b border-slate-50">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">Demo Pics:</span>
                            <div className="flex gap-1.5">
                              {presetPhotos.map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => { setComposerAttachedImage(p.url); showNotification(`Attached ${p.label} photo.`); }}
                                  className="px-2 py-1 rounded border text-[9px] bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-700 font-medium cursor-pointer transition-colors"
                                >
                                  🖼️ {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* INTERACTIVE VOICE MEMO RECORDER */}
                          <div className="flex items-center gap-2">
                            {isRecordingVoice ? (
                              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl animate-pulse text-rose-600">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Recording Secure Voice...</span>
                                <div className="flex gap-0.5 items-end h-3">
                                  <div className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite]" style={{ height: '80%' }} />
                                  <div className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite_0.1s]" style={{ height: '40%' }} />
                                  <div className="w-0.5 bg-rose-500 animate-[bounce_0.8s_infinite_0.2s]" style={{ height: '90%' }} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsRecordingVoice(false);
                                    setHasVoiceAttachment(true);
                                    showNotification("Voice memo encryption finished and staged.");
                                  }}
                                  className="ml-2 px-2 py-0.5 bg-[#3b1c24] hover:bg-black text-white text-[9px] font-bold rounded-lg cursor-pointer"
                                >
                                  Stop
                                </button>
                              </div>
                            ) : hasVoiceAttachment ? (
                              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700">
                                <span className="text-[10px] font-bold">🎙️ Voice Staged (4.8s)</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setHasVoiceAttachment(false);
                                    showNotification("Voice memo attachment removed.");
                                  }}
                                  className="p-0.5 hover:bg-emerald-100 rounded-full text-slate-400 hover:text-rose-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsRecordingVoice(true);
                                  showNotification("Recording secure microphone sample (client-side only)...");
                                }}
                                className="px-3 py-1.5 rounded-xl border border-[#ebd0d5] bg-white text-rose-600 hover:bg-rose-50 font-bold text-[10px] uppercase transition-colors cursor-pointer flex items-center gap-1"
                              >
                                🎙️ Record Voice Memo
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button 
                            type="submit" 
                            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-[#3b1c24] hover:opacity-95 text-white font-bold text-xs tracking-wider uppercase cursor-pointer transition-all shadow-md"
                          >
                            Encrypt & Publish Thread
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* DYNAMIC POST FEED CARDS */}
                    <div className="space-y-6">
                      {posts
                        .filter(p => activeGroupFilter === 'All' || p.group === activeGroupFilter)
                        .map(p => {
                          const isFollowing = followedUsers.includes(p.creator);
                          const isTranslated = !!translatedPosts[p.id];
                          const hasVoted = !!p.poll?.userVoted;

                          return (
                            <div key={p.id} className="bg-white border border-rose-100 rounded-3xl p-6.5 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 relative">
                              
                              {/* Pin status ribbon at top */}
                              {p.isPinned && (
                                <div className="absolute top-4 right-14 bg-amber-500 text-white px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <span>👑 Pinned Thread</span>
                                </div>
                              )}

                              {/* User details header */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img src={p.avatar} alt={p.creator} className="h-9.5 w-9.5 rounded-full bg-slate-50 object-cover border border-slate-100 shadow-sm" referrerPolicy="no-referrer" />
                                  <div>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="text-xs font-black text-[#3b1c24]">{p.creator}</span>
                                      
                                      {/* Verified badge representation */}
                                      <span className="text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                        Verified Expert
                                      </span>

                                      {/* Follow User Control Button */}
                                      <button 
                                        onClick={() => toggleFollowCreator(p.creator)}
                                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider cursor-pointer ${
                                          isFollowing 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'
                                        }`}
                                      >
                                        {isFollowing ? '✓ Following' : '+ Follow'}
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[9px] font-mono font-bold bg-rose-50 text-rose-500 border border-rose-100 px-2 py-0.2 rounded-full block">
                                        {p.group}
                                      </span>
                                      <span className="text-[9px] font-mono font-semibold text-slate-400">({p.time})</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* Bookmark Toggle */}
                                  <button 
                                    onClick={() => toggleBookmark(p.id)}
                                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${p.isBookmarked ? 'bg-amber-50 border-amber-200 text-amber-500' : 'bg-transparent border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                                  >
                                    <Bookmark className="h-4 w-4" />
                                  </button>
                                  
                                  {/* Share Menu Toggle */}
                                  <div className="relative">
                                    <button 
                                      onClick={() => setActiveShareMenu(activeShareMenu === p.id ? null : p.id)}
                                      className="p-2 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 cursor-pointer"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </button>
                                    
                                    {activeShareMenu === p.id && (
                                      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 p-2 space-y-1 text-xs">
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            showNotification("Copied secured path hash to clipboard!");
                                            setActiveShareMenu(null);
                                          }}
                                          className="w-full text-left p-1.5 rounded hover:bg-rose-50 text-[#3b1c24] font-medium"
                                        >
                                          🔗 Copy Secure Link Hash
                                        </button>
                                        <button 
                                          onClick={() => {
                                            showNotification("Thread shared to private Emergency ring.");
                                            setActiveShareMenu(null);
                                          }}
                                          className="w-full text-left p-1.5 rounded hover:bg-rose-50 text-rose-600 font-medium"
                                        >
                                          📡 Relay to Trust Circles
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Content area */}
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-4">
                                  <h4 className="text-xs font-bold text-[#3b1c24] tracking-tight leading-snug">
                                    {isTranslated ? `[RO] ${translatedPosts[p.id].title}` : p.title}
                                  </h4>

                                  {/* Translation Button */}
                                  <button
                                    onClick={() => handleTranslatePost(p.id, p.title, p.content)}
                                    className="p-1.5 rounded-lg border border-rose-100 bg-rose-50/40 text-rose-600 hover:bg-rose-500 hover:text-white transition-all text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                                    title="Translate Romanian/English"
                                  >
                                    <span>🌐 Translate</span>
                                    <span className="font-mono text-[8px] opacity-75">{isTranslated ? 'EN' : 'RO'}</span>
                                  </button>
                                </div>

                                <p className="text-xs text-[#694e55] leading-relaxed font-light whitespace-pre-line">
                                  {isTranslated ? translatedPosts[p.id].content : p.content}
                                </p>
                                
                                {/* Image rendering */}
                                {p.imageUrl && (
                                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                                    <img src={p.imageUrl} alt="post attachment" className="w-full max-h-80 object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                )}

                                {/* INTERACTIVE POLLS SYSTEM */}
                                {p.poll && (
                                  <div className="p-4 rounded-2xl bg-rose-50/20 border border-rose-100 space-y-2.5">
                                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Circle Interactive Question</span>
                                    <div className="space-y-2">
                                      {p.poll.options.map((opt, optIdx) => {
                                        const votes = opt.votes;
                                        const totalVotes = p.poll ? p.poll.options.reduce((sum, o) => sum + o.votes, 0) || 1 : 1;
                                        const percentage = Math.round((votes / totalVotes) * 100);

                                        return (
                                          <button
                                            key={optIdx}
                                            disabled={hasVoted}
                                            onClick={() => handlePollVote(p.id, optIdx)}
                                            className="w-full text-left relative overflow-hidden p-2.5 rounded-xl border border-slate-200 bg-white hover:border-rose-300 transition-all text-xs cursor-pointer block"
                                          >
                                            <div className="absolute top-0 bottom-0 left-0 bg-rose-100/40 transition-all duration-500" style={{ width: `${percentage}%` }} />
                                            <div className="relative z-10 flex justify-between font-medium">
                                              <span className="text-[#3b1c24]">{opt.text}</span>
                                              <span className="text-rose-600 font-mono">{percentage}% ({votes} votes)</span>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    <span className="text-[8px] text-slate-400 block italic">
                                      {hasVoted ? '✓ Your cryptographic vote registered' : 'Select an option to contribute peer research anonymously'}
                                    </span>
                                  </div>
                                )}

                                {/* INTERACTIVE VIDEO PLAYER SIMULATION */}
                                {p.isVideo && (
                                  <div className="rounded-2xl overflow-hidden border border-slate-200 relative aspect-video bg-black flex items-center justify-center">
                                    {activeVideoPlayId === p.id ? (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-950 text-white p-6 text-center">
                                        <div className="flex gap-1.5 items-end h-8">
                                          <div className="w-1 bg-rose-500 animate-[bounce_0.6s_infinite]" style={{ height: '70%' }} />
                                          <div className="w-1 bg-rose-500 animate-[bounce_0.6s_infinite_0.1s]" style={{ height: '40%' }} />
                                          <div className="w-1 bg-rose-500 animate-[bounce_0.6s_infinite_0.2s]" style={{ height: '95%' }} />
                                          <div className="w-1 bg-rose-500 animate-[bounce_0.6s_infinite_0.3s]" style={{ height: '50%' }} />
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block animate-pulse">Streaming Encrypted Sandbox Footage</span>
                                          <span className="text-xs text-slate-400 mt-1 block">Audio stream & video rendering running locally inside Web Worker</span>
                                        </div>
                                        <button 
                                          onClick={() => setActiveVideoPlayId(null)}
                                          className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-[10px] font-bold rounded-lg uppercase cursor-pointer"
                                        >
                                          Pause
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white cursor-pointer" onClick={() => setActiveVideoPlayId(p.id)}>
                                        <div className="h-14 w-14 rounded-full bg-rose-500 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-rose-500/20">
                                          <Play className="h-6 w-6 text-white fill-white ml-1" />
                                        </div>
                                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-rose-300 mt-3">Play Sourced video reel (4K H.265)</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Voice memo if present */}
                                {p.hasVoice && (
                                  <div className="rounded-2xl border border-rose-100 bg-rose-50/20 p-3.5 flex items-center gap-3.5">
                                    <button 
                                      onClick={() => {
                                        showNotification("Simulating secure voice note playback... 🎙️");
                                        onAddLog('Audio Playback', `Played 4.8s peer voice note on thread ${p.id}`, 'chat');
                                      }}
                                      className="h-9 w-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
                                    >
                                      ▶️
                                    </button>
                                    <div className="flex-1 space-y-1">
                                      <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400 uppercase">
                                        <span>Encrypted Voice Attachment</span>
                                        <span>4.8s</span>
                                      </div>
                                      <div className="flex gap-0.5 items-center h-5 pt-1">
                                        {[20, 45, 60, 25, 80, 55, 30, 40, 75, 50, 20, 60, 45, 70, 30, 25, 50, 40, 85, 30, 20].map((hVal, idx) => (
                                          <div key={idx} className="flex-1 bg-rose-200 rounded-full hover:bg-rose-400 transition-colors" style={{ height: `${hVal}%` }} />
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Interactive reactions */}
                              <div className="flex items-center gap-3 pt-3.5 border-t border-slate-50 text-[10px] font-mono text-slate-500 flex-wrap">
                                <button 
                                  onClick={() => handleReact(p.id, 'love')}
                                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                    p.userReactions[`${p.id}-love`] 
                                      ? 'bg-rose-50 border-rose-200 text-rose-500 scale-105' 
                                      : 'bg-slate-50/50 border-slate-100 hover:border-rose-100'
                                  }`}
                                >
                                  <span>❤️ Love</span>
                                  <span>{p.reactions.love}</span>
                                </button>
                                <button 
                                  onClick={() => handleReact(p.id, 'insight')}
                                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                    p.userReactions[`${p.id}-insight`] 
                                      ? 'bg-amber-50 border-amber-200 text-amber-600 scale-105' 
                                      : 'bg-slate-50/50 border-slate-100 hover:border-rose-100'
                                  }`}
                                >
                                  <span>✨ Inspire</span>
                                  <span>{p.reactions.insight}</span>
                                </button>
                                <button 
                                  onClick={() => handleReact(p.id, 'support')}
                                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all ${
                                    p.userReactions[`${p.id}-support`] 
                                      ? 'bg-pink-50 border-pink-200 text-pink-500 scale-105' 
                                      : 'bg-slate-50/50 border-slate-100 hover:border-rose-100'
                                  }`}
                                >
                                  <span>💪 Support</span>
                                  <span>{p.reactions.support}</span>
                                </button>

                                <button 
                                  onClick={() => setExpandedPostComments({ ...expandedPostComments, [p.id]: !expandedPostComments[p.id] })}
                                  className="ml-auto text-rose-500 hover:text-rose-600 font-bold transition-colors cursor-pointer"
                                >
                                  {expandedPostComments[p.id] ? 'Hide Comments' : `Show Comments (${p.comments.length})`}
                                </button>
                              </div>

                              {/* SUPER ADMINISTRATOR DIRECT UNRESTRICTED MODERATION OVERLAY */}
                              {isAdminMode && (
                                <div className="bg-slate-900 text-white rounded-2xl p-3 border border-rose-500/30 flex items-center justify-between gap-4 text-xs font-mono">
                                  <span className="text-amber-400">👑 [SUPER ADMIN OVERRIDES]</span>
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleAdminPinPost(p.id, !p.isPinned)}
                                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 cursor-pointer"
                                    >
                                      {p.isPinned ? 'Unpin' : 'Pin Post'}
                                    </button>
                                    <button 
                                      onClick={() => {
                                        const newBody = prompt("Modify post body override:", p.content);
                                        if (newBody !== null) handleAdminEditPost(p.id, newBody);
                                      }}
                                      className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                                    >
                                      Edit Content
                                    </button>
                                    <button 
                                      onClick={() => handleAdminDeletePost(p.id)}
                                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                                    >
                                      Delete Thread
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* INTERACTIVE COMMENTS RESPONSES */}
                              <AnimatePresence>
                                {expandedPostComments[p.id] && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden space-y-3 pt-3.5 border-t border-slate-100"
                                  >
                                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Handshaked Responses</span>
                                    
                                    {/* Comments list */}
                                    {p.comments.length > 0 ? (
                                      <div className="space-y-3 pl-2.5 border-l-2 border-rose-100">
                                        {p.comments.map(c => (
                                          <div key={c.id} className="text-xs space-y-1.5 p-2 bg-slate-50/40 rounded-xl border border-transparent hover:border-rose-100 transition-all">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-2">
                                                <img src={c.avatar} alt={c.author} className="h-5.5 w-5.5 rounded-full object-cover" referrerPolicy="no-referrer" />
                                                <span className="font-bold text-[#3b1c24]">{c.author}</span>
                                                <span className="text-[9px] text-slate-400 font-mono">({c.time})</span>
                                              </div>

                                              {/* Admin Delete Comment */}
                                              {isAdminMode && (
                                                <button 
                                                  onClick={() => handleAdminDeleteComment(p.id, c.id)}
                                                  className="text-[9px] bg-rose-100 hover:bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded cursor-pointer font-bold"
                                                >
                                                  Remove
                                                </button>
                                              )}
                                            </div>
                                            <p className="text-slate-600 leading-relaxed pl-7.5 font-light">{c.text}</p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-[11px] text-slate-400 italic font-light">No comments published yet. Thread remains clean.</p>
                                    )}

                                    {/* Add comment input */}
                                    <div className="flex gap-2 pt-2.5">
                                      <input 
                                        type="text" 
                                        placeholder="Write verified response..."
                                        value={newCommentTexts[p.id] || ''}
                                        onChange={e => setNewCommentTexts({ ...newCommentTexts, [p.id]: e.target.value })}
                                        onKeyDown={e => { if (e.key === 'Enter') handleAddComment(p.id); }}
                                        className="flex-1 bg-slate-50/50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs text-[#3b1c24] focus:outline-none focus:border-rose-300"
                                      />
                                      <button 
                                        onClick={() => handleAddComment(p.id)}
                                        className="px-3 py-2 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                                      >
                                        Post
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </div>
                          );
                        })}
                    </div>

                  </div>

                  {/* RIGHT COLUMN: EVENTS RSVP & REWARDS BADGES NETWORK (3 cols on large screens) */}
                  <div className="lg:col-span-3 space-y-6">
                    
                    {/* CONFIDENTIAL SOURCED EVENTS */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="h-4.5 w-4.5 text-rose-500" />
                          <span>Sourced Events</span>
                        </h3>
                        <p className="text-[9px] text-slate-400 mt-0.5">Sourced virtual & local physical panels.</p>
                      </div>

                      <div className="space-y-4">
                        {safeEvents.map(ev => {
                          const isJoined = joinedEvents.includes(ev.id);
                          return (
                            <div key={ev.id} className="p-3.5 rounded-2xl bg-[#fffcfd]/80 border border-[#ebd0d5]/60 hover:border-rose-200 transition-colors flex flex-col justify-between text-xs">
                              <div className="space-y-1.5 mb-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[8px] font-mono font-bold text-rose-500 uppercase">{ev.organizer}</span>
                                  <span className="text-[8px] font-mono font-semibold text-slate-400">
                                    {ev.registeredCount}/{ev.capacity} spots
                                  </span>
                                </div>
                                <h4 className="font-bold text-[#3b1c24] leading-snug">{ev.title}</h4>
                                <span className="text-[9px] text-pink-500 font-semibold block">{ev.date} @ {ev.time}</span>
                                <p className="text-[9px] text-slate-400 font-mono">📍 {ev.location}</p>
                              </div>

                              <button 
                                onClick={() => {
                                  if (isJoined) {
                                    setJoinedEvents(joinedEvents.filter(id => id !== ev.id));
                                    onAddLog('Unregistered safe event', `Cancelled coordinate ticket for ${ev.title}`, 'chat');
                                    showNotification(`Canceled reservations for: ${ev.title}`);
                                  } else {
                                    setJoinedEvents([...joinedEvents, ev.id]);
                                    onAddLog('Registered safe event', `Sourced attendance seat for ${ev.title}`, 'chat');
                                    showNotification(`Reserved secure coordinate seat: ${ev.title}`);
                                  }
                                }}
                                className={`w-full py-2 rounded-xl text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                                  isJoined 
                                    ? 'bg-slate-50 border border-slate-200/50 text-slate-400 hover:text-rose-600 font-bold' 
                                    : 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-sm'
                                }`}
                              >
                                {isJoined ? '✓ Coordinator seat locked' : 'RSVP Free Spot'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* INTERACTIVE ACHIEVEMENTS & DAILY CHECK-IN PROGRESS CARD */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
                      <div>
                        <h3 className="text-xs font-black text-[#3b1c24] uppercase tracking-wider flex items-center gap-1.5">
                          <Award className="h-4.5 w-4.5 text-rose-500" />
                          <span>Ecosystem Rewards</span>
                        </h3>
                        <p className="text-[9px] text-slate-400 mt-0.5">Build peer reputation by helping founders.</p>
                      </div>

                      {/* Daily calendar check in visualizer */}
                      <div className="p-3 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Daily check-in sequence</span>
                        <div className="grid grid-cols-7 gap-1">
                          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const active = day <= rewards.streak;
                            return (
                              <div 
                                key={day} 
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[9px] font-bold ${
                                  active 
                                    ? 'bg-gradient-to-tr from-rose-400 to-pink-500 text-white shadow-sm' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                <span>D{day}</span>
                                {active && <span className="text-[7px]">✓</span>}
                              </div>
                            );
                          })}
                        </div>
                        <span className="text-[8px] text-slate-400 block italic">Check-in daily for bonus multiplier!</span>
                      </div>

                      {/* Achievement Badge Collections */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Unlocked Badges</span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { id: 'b-1', icon: '👑', name: 'Elite Founder', desc: 'Advanced to Level 5+' },
                            { id: 'b-2', icon: '🩺', name: 'Verified Scholar', desc: 'Fully reviewed safety files' },
                            { id: 'b-3', icon: '📡', name: 'Node Operator', desc: 'Established 3+ local circles' },
                            { id: 'b-4', icon: '🤝', name: 'Safe Guide', desc: 'Linked companion network' }
                          ].map((badge) => {
                            const isUnlocked = badge.id === 'b-1' ? rewards.level >= 5 : true;
                            return (
                              <div 
                                key={badge.id} 
                                className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[9px] font-bold transition-all ${
                                  isUnlocked 
                                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                                }`}
                                title={badge.desc}
                              >
                                <span>{badge.icon}</span>
                                <span>{badge.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Rewards ledger log history */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block">Reputation History</span>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {rewards.history.map((h) => (
                            <div key={h.id} className="flex justify-between items-center text-[9px] text-[#694e55] py-0.5">
                              <span className="truncate max-w-[130px] font-medium">{h.action}</span>
                              <span className="text-emerald-600 font-mono font-bold font-semibold shrink-0">+{h.points} pts</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* TAB 6: SAFE MARKETPLACE */}
            {activeTab === 'marketplace' && (
              <div className="space-y-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebd0d5] pb-4">
                  <div>
                    <h3 className="text-sm font-black text-[#3b1c24]">Sourced Premium Products</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">Settle secure peer transactions instantly with SCUT Pay.</p>
                  </div>

                  <div className="flex gap-2.5">
                    {(['All', 'Wearables', 'Health', 'Software'] as const).map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setCurrentFilter(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          currentFilter === cat 
                            ? 'bg-rose-500 border-rose-500 text-white shadow-sm' 
                            : 'bg-white border-slate-200/60 text-slate-500 hover:text-rose-600 hover:border-rose-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden flex flex-col justify-between shadow-[0_15px_45px_rgba(243,212,217,0.08)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(243,212,217,0.15)] transition-all duration-300">
                      <div className="relative h-48 bg-[#fff5f7] overflow-hidden">
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-3 left-3 text-[9px] font-mono font-bold bg-white/90 border border-slate-200 text-rose-500 px-2.5 py-1 rounded-full uppercase shadow-sm">{p.brand}</span>
                        <span className="absolute bottom-3 right-3 text-xs font-mono font-bold bg-[#3b1c24] border border-[#3b1c24] px-2.5 py-1 rounded-full text-white shadow-sm">${p.price}</span>
                      </div>

                      <div className="p-5.5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-rose-500 uppercase tracking-widest block font-mono font-bold">{p.category}</span>
                            <span className="text-[10px] text-amber-500 font-bold font-mono">★ {p.rating}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#3b1c24] leading-snug">{p.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-light">{p.description}</p>
                        </div>

                        <button 
                          onClick={() => handlePurchase(p)}
                          disabled={purchasedProductId === p.id}
                          className="w-full py-3 rounded-xl bg-[#3b1c24] hover:bg-black disabled:bg-rose-900/10 text-white font-bold text-xs tracking-wider uppercase cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          {purchasedProductId === p.id ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin text-white" />
                              <span>Saddling Gateway...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-3.5 w-3.5" />
                              <span>Purchase via SCUT Pay (${p.price})</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB 7: PRIVACY CENTER */}
            {activeTab === 'privacy' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-8 shadow-[0_15px_45px_rgba(243,212,217,0.1)] relative">
                <div className="absolute right-6 top-6 text-rose-500/5">
                  <Lock className="h-20 w-20" />
                </div>
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black text-[#3b1c24] flex items-center gap-2">
                    <Lock className="h-6 w-6 text-rose-500" /> Suite Privacy Shield Setup
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Configure your physical beacon panic coordinates and sandbox credentials.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  <div className="space-y-6">
                    
                    {/* Tracker Shielding Toggle */}
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between gap-4 items-start shadow-sm hover:border-rose-100 transition-colors">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#3b1c24] block">Spoof IP Coordinates Routing</span>
                        <p className="text-[11px] text-[#694e55] leading-relaxed font-light">
                          Prevent other general users inside discussion assemblies from resolving your geographical network coordinates.
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setInvisibleMode(!invisibleMode);
                          onAddLog('GPS Shield State Toggled', `Configured network coordinates spoofing: ${!invisibleMode}`, 'security');
                          showNotification(!invisibleMode ? "IP Shield ON" : "IP Shield Disarmed");
                        }}
                        className={`w-10 h-6.5 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${invisibleMode ? 'bg-rose-500' : 'bg-slate-300'}`}
                      >
                        <div className={`w-5 h-5.5 rounded-full bg-white shadow transform duration-200 ${invisibleMode ? 'translate-x-4' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {/* Local cache lock indicator */}
                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex justify-between gap-4 items-start shadow-sm">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-[#3b1c24] block">Symptom Log Caching</span>
                        <p className="text-[11px] text-[#694e55] leading-relaxed font-light">
                          Confidential health cycles bypass cloud synchronization to prevent metadata sweeping.
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full shrink-0 uppercase tracking-wider">
                        Local Locked
                      </span>
                    </div>

                  </div>

                  {/* Secret Panic Phrase setup */}
                  <div className="p-6 rounded-2xl bg-rose-50/20 border border-rose-100/60 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider block">Crisis Word Trigger</h4>
                      <p className="text-[11px] text-[#694e55] leading-relaxed mt-1 font-light">
                        Configure a custom panic word. Entering this word into any messaging interface triggers instant Silent SOS coordinates streaming.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[9px] font-mono text-slate-400 uppercase font-bold tracking-wider">Secret Phrase</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={customKeyword}
                          onChange={e => setCustomKeyword(e.target.value.toUpperCase())}
                          className="flex-1 rounded-xl bg-white border border-slate-200/80 text-xs px-3.5 py-2.5 text-[#3b1c24] font-mono tracking-widest uppercase focus:outline-none focus:border-rose-300"
                        />
                        <button 
                          onClick={() => {
                            onAddLog('Panic phrase modified', `Configured key: ${customKeyword}`, 'security');
                            showNotification("Secret trigger updated successfully.");
                          }}
                          className="px-4.5 py-2.5 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-xs cursor-pointer transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white border border-rose-100/50 text-[10px] text-[#694e55] flex items-start gap-2 leading-relaxed font-light">
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>
                        Keep this phrase strictly confidential. Entering it accidentally in public assemblies will engage cellular SMS alerts to your guardians.
                      </span>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB: BEAUTY */}
            {activeTab === 'beauty' && (
              <WomenBeauty language={language} onAddLog={onAddLog} onPayWithWallet={onPayWithWallet} onNavigate={onNavigate} showToast={showNotification} />
            )}

            {/* TAB: FASHION */}
            {activeTab === 'fashion' && (
              <WomenFashion language={language} onAddLog={onAddLog} onPayWithWallet={onPayWithWallet} showToast={showNotification} />
            )}

            {/* TAB: WELLNESS */}
            {activeTab === 'wellness' && (
              <WomenWellness onAddLog={onAddLog} showToast={showNotification} />
            )}

            {/* TAB: FITNESS */}
            {activeTab === 'fitness' && (
              <WomenFitness onAddLog={onAddLog} showToast={showNotification} />
            )}

            {/* TAB: LEARNING */}
            {activeTab === 'learning' && (
              <WomenLearning onAddLog={onAddLog} showToast={showNotification} />
            )}

            {/* TAB: EVENTS */}
            {activeTab === 'events' && (
              <WomenEvents onAddLog={onAddLog} onPayWithWallet={onPayWithWallet} showToast={showNotification} />
            )}

            {/* TAB: FUN */}
            {activeTab === 'fun' && (
              <WomenFun onAddLog={onAddLog} showToast={showNotification} />
            )}

            {/* TAB: AI ASSISTANT (Dedicated Athena AI Desk) */}
            {activeTab === 'ai_assistant' && (
              <div className="bg-white/70 backdrop-blur-md border border-[#ebd0d5] rounded-3xl p-6.5 shadow-xl shadow-rose-100/5 space-y-6">
                <div className="flex items-center justify-between pb-3.5 border-b border-[#f2dbe0]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100">
                      <Bot className="h-6 w-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#3b1c24] uppercase tracking-wide">Athena Custom AI Expert Desk</h3>
                      <span className="text-[10px] text-[#694e55] font-mono block">Offline-First Cryptographic Sandbox Engine</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-2.5 py-1 rounded-full uppercase font-bold">Node Secure</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Expert selection column */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Select Expert Specialization</span>
                    {[
                      { role: 'Security Analyst', details: 'Specialized in spatial threats, risk analysis, de-escalation, and privacy shielding metrics.' },
                      { role: 'Beauty & Fashion Curator', details: 'Specialized in adaptogenic skincare formulas, botanical products, and personal lookbook audits.' },
                      { role: 'Venture & Finance Architect', details: 'Specialized in seed capital raises, cap-table structuring, B2B niches, and financial growth.' }
                    ].map((roleObj, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          showNotification(`Switched companion perspective to ${roleObj.role}!`);
                          setAthenaChat([
                            { sender: 'athena', text: `Greetings. I am your specialized Athena ${roleObj.role}. How can I consult on your professional or physical metrics today?`, time: 'Just now' }
                          ]);
                          onAddLog('Changed AI Role', `Activated specialist: ${roleObj.role}`, 'chat');
                        }}
                        className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-rose-50/50 border border-slate-100 hover:border-rose-200/60 transition-all cursor-pointer space-y-1"
                      >
                        <h4 className="text-xs font-bold text-[#3b1c24]">{roleObj.role}</h4>
                        <p className="text-[10px] text-slate-400 font-light leading-relaxed">{roleObj.details}</p>
                      </button>
                    ))}
                  </div>

                  {/* Chat interface column (expanded) */}
                  <div className="lg:col-span-2 bg-slate-50/40 border border-slate-100 rounded-3xl p-5 flex flex-col justify-between min-h-[400px]">
                    {/* Chat dialog window */}
                    <div className="flex-1 overflow-y-auto space-y-4 max-h-[18rem] pr-1.5 text-xs">
                      {athenaChat.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`h-7 w-7 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold ${msg.sender === 'user' ? 'bg-[#3b1c24] text-white' : 'bg-rose-50 text-rose-500 border border-rose-100'}`}>
                            {msg.sender === 'user' ? 'U' : 'A'}
                          </div>
                          <div className={`p-3.5 rounded-2xl max-w-[80%] border ${msg.sender === 'user' ? 'bg-rose-500/10 border-rose-200 text-[#3b1c24] rounded-tr-none' : 'bg-white border-slate-100 text-[#3b1c24] rounded-tl-none shadow-sm'}`}>
                            <p className="leading-relaxed">{msg.text}</p>
                          </div>
                        </div>
                      ))}
                      {athenaLoading && (
                        <div className="flex gap-3">
                          <div className="h-7 w-7 rounded-full shrink-0 bg-rose-50 text-rose-500 flex items-center justify-center text-[10px] animate-pulse">A</div>
                          <div className="p-3.5 rounded-2xl bg-white border border-slate-100 text-slate-400 italic animate-pulse rounded-tl-none shadow-sm">
                            Athena is analyzing query...
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form input */}
                    <form onSubmit={(e) => { e.preventDefault(); handleAthenaSubmit(); }} className="pt-3.5 border-t border-slate-100 mt-3.5 flex gap-2">
                      <input
                        type="text"
                        placeholder="Query Athena Expert Desk (e.g., Guide me through pre-seed round valuation benchmarks...)"
                        value={athenaInput}
                        onChange={e => setAthenaInput(e.target.value)}
                        className="flex-1 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-[#3b1c24] placeholder-slate-400 focus:outline-none focus:border-rose-400"
                      />
                      <button type="submit" className="px-5 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold transition-all flex items-center justify-center cursor-pointer shadow-md">
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

      </div>

      {/* GLOBAL TOAST FLOATING BANNER */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-white border-2 border-rose-200 text-[#3b1c24] px-5 py-3 rounded-2xl shadow-[0_15px_45px_rgba(243,212,217,0.35)] flex items-center gap-3"
          >
            <div className="p-1 rounded-lg bg-rose-50 text-rose-500">
              <Sparkles className="h-4.5 w-4.5 text-rose-500" />
            </div>
            <span className="text-xs font-bold tracking-wide">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECURE COMMUNITY STORY MODAL */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-sm w-full bg-[#1c0d10] border border-rose-950/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[550px] justify-between text-white"
            >
              <button 
                onClick={() => setSelectedStory(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Story Timer Bar */}
              <div className="absolute top-3 left-4 right-12 z-40 flex gap-1 h-1">
                <div className="h-full bg-rose-500 rounded-full w-full animate-pulse" />
              </div>

              {/* Creator details */}
              <div className="p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center gap-2.5 z-30">
                <img src={selectedStory.avatar} className="h-8 w-8 object-cover rounded-full border border-rose-300" alt={selectedStory.creator} referrerPolicy="no-referrer" />
                <div>
                  <h4 className="text-xs font-bold text-white">{selectedStory.creator}</h4>
                  <span className="text-[8px] font-mono text-rose-300 uppercase tracking-widest block">24h Temporary Feed</span>
                </div>
              </div>

              {/* Main Media Content */}
              <div className="flex-1 flex items-center justify-center overflow-hidden bg-black relative">
                <img src={selectedStory.mediaUrl} className="w-full h-full object-cover" alt="story content" referrerPolicy="no-referrer" />
              </div>

              {/* Story Caption / Actions */}
              <div className="p-5 bg-gradient-to-t from-black/90 via-black/80 to-transparent space-y-3 z-30">
                <p className="text-xs text-slate-200 leading-relaxed text-center font-light italic">
                  "{selectedStory.caption}"
                </p>
                <div className="pt-2 border-t border-white/10 flex justify-center gap-4">
                  <button 
                    onClick={() => {
                      showNotification(`Sent secure direct connection wave to ${selectedStory.creator}!`);
                      onAddLog('Story Link Query', `Sent handshaked chat request to ${selectedStory.creator}`, 'chat');
                    }}
                    className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-[10px] uppercase rounded-xl transition-all cursor-pointer"
                  >
                    Send Direct Wave 👋
                  </button>
                  <button 
                    onClick={() => {
                      showNotification("Love reaction registered!");
                    }}
                    className="p-2 bg-white/10 rounded-xl text-rose-400 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    ❤️
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Added to Cart Choice Modal */}
      <AnimatePresence>
        {addedCartProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAddedCartProduct(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-rose-100 rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-center">
              <div className="h-12 w-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-[#3b1c24]">Added to Shopping Cart!</h3>
                <p className="text-xs font-bold text-rose-600">{addedCartProduct.title} (${addedCartProduct.price})</p>
                <p className="text-[11px] text-slate-500 font-medium">Cart badge updated and synchronized with your account in Firestore.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => setAddedCartProduct(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer hover:bg-slate-200"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => {
                    setAddedCartProduct(null);
                    localStorage.setItem('scut_marketplace_view', 'cart');
                    window.dispatchEvent(new Event('scut_cart_changed'));
                    if (onNavigate) onNavigate('marketplace');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-[#3b1c24] hover:bg-black text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Proceed to Checkout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
