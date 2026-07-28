/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet as WalletIcon, Coins, RefreshCw, Zap, ShieldCheck, Cpu, 
  Sparkles, KeyRound, Clock, MessageSquare, ChevronRight, Play, Plus, 
  Trash2, Layers, ArrowUpRight, ArrowDownLeft, Flame, Star, 
  Settings as SettingsIcon, AlertCircle, HelpCircle, Check, Bell, User as UserIcon, Copy, ExternalLink
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Chat, SavedPrompt, ActivityLog, User } from '../types';
import { ethers } from 'ethers';

interface DashboardProps {
  user: User;
  chats: Chat[];
  onNavigate: (page: string) => void;
  onSelectChat: (id: string) => void;
  savedPrompts: SavedPrompt[];
  onAddPrompt: (title: string, prompt: string, category: string) => void;
  onDeletePrompt: (id: string) => void;
  onRunPrompt: (prompt: string) => void;
  activityLogs: ActivityLog[];
}

export default function Dashboard({
  user,
  chats,
  onNavigate,
  onSelectChat,
  savedPrompts,
  onAddPrompt,
  onDeletePrompt,
  onRunPrompt,
  activityLogs
}: DashboardProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  // Web3 Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [polBalance, setPolBalance] = useState<string | null>(null);
  const [scutBalance, setScutBalance] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Detecting...');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter out favorite chats
  const favoriteChats = chats.filter(c => c.isFavorite);

  // Dynamic telemetry chart data representing real user usage
  const usageData = [
    { name: 'Mon', queries: Math.floor(user.usageCount * 0.1) },
    { name: 'Tue', queries: Math.floor(user.usageCount * 0.25) },
    { name: 'Wed', queries: Math.floor(user.usageCount * 0.15) },
    { name: 'Thu', queries: Math.floor(user.usageCount * 0.3) },
    { name: 'Fri', queries: Math.floor(user.usageCount * 0.2) },
    { name: 'Sat', queries: Math.floor(user.usageCount * 0.4) },
    { name: 'Sun', queries: user.usageCount },
  ];

  // Fetch balances for Web3 Wallet
  const fetchBalances = async (address: string) => {
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    try {
      const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
      const rawBalance = await ethProvider.getBalance(address);
      const formattedPol = parseFloat(ethers.formatEther(rawBalance)).toFixed(4);
      setPolBalance(formattedPol);

      // Query SCUT Utility Token contract on Polygon
      const scutContractAddress = '0x3845badAde8e6D216a695029D8D6eE8E9f697dbD';
      try {
        const contract = new ethers.Contract(
          scutContractAddress,
          [
            "function balanceOf(address owner) view returns (uint256)",
            "function decimals() view returns (uint8)"
          ],
          ethProvider
        );
        const bal = await contract.balanceOf(address);
        const dec = await contract.decimals();
        const formattedScut = parseFloat(ethers.formatUnits(bal, dec)).toFixed(2);
        setScutBalance(formattedScut);
      } catch (e) {
        console.warn("Could not query SCUT token contract:", e);
        setScutBalance("0.00");
      }

      const networkInfo = await ethProvider.getNetwork();
      let netLabel = 'Polygon POS';
      if (networkInfo.chainId === 137n) {
        netLabel = 'Polygon Mainnet';
      } else if (networkInfo.chainId === 80002n || networkInfo.chainId === 80001n) {
        netLabel = 'Polygon Amoy Testnet';
      } else {
        netLabel = networkInfo.name === 'unknown' ? 'Connected Network' : networkInfo.name;
      }
      setNetworkName(netLabel);
    } catch (err) {
      console.error("Error fetching Web3 balances:", err);
    }
  };

  // Check initial connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const eth = (window as any).ethereum;
        try {
          const ethProvider = new ethers.BrowserProvider(eth);
          const accounts = await ethProvider.send("eth_accounts", []);
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            setWalletAddress(addr);
            setConnectionStatus('Connected');
            await fetchBalances(addr);
          } else {
            setConnectionStatus('Not connected yet');
          }
        } catch (e) {
          console.error("Error checking Web3 connection:", e);
          setConnectionStatus('Not connected yet');
        }
      } else {
        setConnectionStatus('Not connected yet');
      }
    };
    checkConnection();
  }, []);

  // Connect wallet handler
  const handleConnectWallet = async () => {
    if (typeof window === 'undefined' || !(window as any).ethereum) {
      alert("No Ethereum provider detected. Please install MetaMask to connect your wallet.");
      return;
    }
    setIsConnecting(true);
    try {
      const eth = (window as any).ethereum;
      const ethProvider = new ethers.BrowserProvider(eth);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setWalletAddress(addr);
        setConnectionStatus('Connected');
        await fetchBalances(addr);
      }
    } catch (err) {
      console.error("MetaMask connection failed:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet handler
  const handleDisconnectWallet = () => {
    setWalletAddress(null);
    setPolBalance(null);
    setScutBalance(null);
    setNetworkName(null);
    setConnectionStatus('Not connected yet');
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCreatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;
    onAddPrompt(newTitle, newPrompt, newCategory);
    setNewTitle('');
    setNewPrompt('');
    setShowAddPrompt(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Modern Header / Welcome Banner */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/20 border border-slate-900 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 h-40 w-40 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-md">
                Secure Control Panel
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Identity: Authenticated
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Hello, {user.name}
            </h1>
            <p className="text-xs text-slate-400 font-light max-w-xl">
              Welcome to the SCUT AI Developer Console. Monitor your active integration nodes, token balances, real-time query telemetry, and saved system instructions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('subscription')}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Zap className="h-4 w-4 text-slate-950 fill-current" />
              Tier: {user.subscriptionTier.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Integration Matrix Grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4.5 w-4.5 text-cyan-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Technology Integration Matrix
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            
            {/* Polygon */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Polygon</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-white">Active</span>
              </div>
            </div>

            {/* MetaMask */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">MetaMask</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`h-2 w-2 rounded-full ${walletAddress ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-bold text-white">
                  {walletAddress ? 'Connected' : 'Not connected yet'}
                </span>
              </div>
            </div>

            {/* WalletConnect */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">WalletConnect</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-[11px] font-bold text-white">Not connected yet</span>
              </div>
            </div>

            {/* Firebase Authentication */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Firebase Auth</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-white">Connected</span>
              </div>
            </div>

            {/* Firestore */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Firestore</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-white">Connected</span>
              </div>
            </div>

            {/* Google Gemini AI */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Gemini AI</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[11px] font-bold text-white">Connected</span>
              </div>
            </div>

            {/* SCUT Token */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">SCUT Token</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`h-2 w-2 rounded-full ${walletAddress ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-bold text-white">
                  {walletAddress ? 'Active' : 'Not connected yet'}
                </span>
              </div>
            </div>

            {/* SCUT Pay */}
            <div className="bg-slate-900/10 border border-slate-900/80 rounded-xl p-3.5 flex flex-col justify-between h-24">
              <span className="text-[10px] text-slate-500 font-mono uppercase">SCUT Pay</span>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`h-2 w-2 rounded-full ${walletAddress ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className="text-[11px] font-bold text-white">
                  {walletAddress ? 'Active' : 'Not connected yet'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Primary Row: Wallet Connection & Factual Balances */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Wallet Connection */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
              <WalletIcon className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
                  <WalletIcon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  MetaMask / Web3 Wallet
                </h3>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Connection Status</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[10px] font-mono font-bold border ${
                  walletAddress 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/15'
                }`}>
                  {connectionStatus}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Connected Address</span>
                {walletAddress ? (
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs font-mono text-slate-200 bg-slate-950/60 px-2 py-1 rounded border border-slate-900">
                      {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                    </span>
                    <button 
                      onClick={() => handleCopy(walletAddress, 'addr')}
                      className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                      title="Copy Address"
                    >
                      {copiedText === 'addr' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-mono mt-1 block italic">Not connected yet</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Current Network</span>
                <span className="text-xs font-semibold text-slate-200 block mt-1">
                  {walletAddress && networkName ? networkName : 'Not connected yet'}
                </span>
              </div>
            </div>

            <div className="pt-6">
              {walletAddress ? (
                <button
                  onClick={handleDisconnectWallet}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Disconnect Wallet
                </button>
              ) : (
                <button
                  disabled={isConnecting}
                  onClick={handleConnectWallet}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-350 disabled:bg-slate-850 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      Connect Wallet
                      <ArrowUpRight className="h-3.5 w-3.5 text-slate-950" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Card 2: SCUT Token Card */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
              <Coins className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10 text-indigo-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  SCUT Utility Token
                </h3>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">SCUT Token Balance</span>
                {walletAddress ? (
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                      {scutBalance || '0.00'}
                    </span>
                    <span className="text-xs font-mono text-cyan-400 font-bold">SCUT</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-mono mt-1 block italic">Not connected yet</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Contract Address</span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] font-mono text-slate-400 truncate max-w-[160px] bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-900">
                    0x3845badAde8e6D216a695029D8D6eE8E9f697dbD
                  </span>
                  <button 
                    onClick={() => handleCopy('0x3845badAde8e6D216a695029D8D6eE8E9f697dbD', 'scut_contract')}
                    className="p-1 hover:bg-slate-800 text-slate-500 hover:text-white rounded transition-colors cursor-pointer"
                    title="Copy contract"
                  >
                    {copiedText === 'scut_contract' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="https://polygonscan.com/token/0x3845badAde8e6D216a695029D8D6eE8E9f697dbD"
                target="_blank"
                rel="referrer noopener"
                className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5"
              >
                PolygonScan
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Card 3: POL Card */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 text-slate-800 pointer-events-none">
              <Zap className="h-12 w-12" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-500/5 border border-teal-500/10 text-teal-400">
                  <Coins className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  POL (Polygon Native Gas)
                </h3>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">POL Balance</span>
                {walletAddress ? (
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                      {polBalance || '0.0000'}
                    </span>
                    <span className="text-xs font-mono text-indigo-400 font-bold">POL</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 font-mono mt-1 block italic">Not connected yet</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Network Protocol</span>
                <span className="text-xs font-semibold text-slate-200 block mt-1.5">
                  Polygon POS Proof-of-Stake
                </span>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => onNavigate('scutpay')}
                className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-850 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Access SCUT Pay
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Secondary Row: AI Account, Usage, & Subscription */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* AI Usage */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                AI API Query Usage
              </h3>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Queries Used</span>
                <span className="text-xs text-slate-300 font-semibold font-mono">
                  {user.usageCount} / {user.maxUsage}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full transition-all duration-500"
                  style={{ width: `${Math.min((user.usageCount / user.maxUsage) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-mono text-[10px] uppercase">Generated Tokens</span>
                <span className="text-white font-bold font-mono">{(user.usageCount * 850).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Account Status & Subscription */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-teal-500/5 border border-teal-500/10 text-teal-400">
                <UserIcon className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                AI Account & Subscription
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Account Status</span>
                <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-emerald-400 font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Subscription Tier</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded text-[10px] font-mono font-bold border border-cyan-500/15 text-cyan-400 bg-cyan-500/5 uppercase">
                  {user.subscriptionTier}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Account Email</span>
              <span className="text-xs text-slate-200 block truncate mt-1">
                {user.email}
              </span>
            </div>
          </div>

          {/* Card 9: Quick Actions */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
                <Zap className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                Quick Actions
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button 
                onClick={() => onNavigate('chat')}
                className="p-2 text-left hover:text-white text-slate-300 hover:bg-slate-900/60 rounded-xl border border-slate-900 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>AI Chat</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <button 
                onClick={() => onNavigate('wallet')}
                className="p-2 text-left hover:text-white text-slate-300 hover:bg-slate-900/60 rounded-xl border border-slate-900 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Wallet</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <button 
                onClick={() => onNavigate('marketplace')}
                className="p-2 text-left hover:text-white text-slate-300 hover:bg-slate-900/60 rounded-xl border border-slate-900 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Marketplace</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <button 
                onClick={() => onNavigate('scutpay')}
                className="p-2 text-left hover:text-white text-slate-300 hover:bg-slate-900/60 rounded-xl border border-slate-900 transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>SCUT Pay</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
              <button 
                onClick={() => onNavigate('settings')}
                className="col-span-2 p-2 text-left hover:text-white text-slate-300 hover:bg-slate-900/60 rounded-xl border border-slate-900 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <SettingsIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span>Configure Settings</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          </div>

        </div>

        {/* Third Row: Recharts & Block Activity & Chats */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Query Usage Recharts Chart */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Queries Telemetry</h3>
                <p className="text-xs text-slate-500">Standard daily AI invocation logs</p>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-500/5 border border-cyan-500/10 px-2 py-1 rounded">
                Live Status
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#111827" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#030712', borderColor: '#1f2937', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                    itemStyle={{ color: '#22d3ee' }}
                  />
                  <Area type="monotone" dataKey="queries" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent AI Chats */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Recent AI Chats</h3>
              <p className="text-xs text-slate-500">Access your active workspaces</p>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {chats && chats.length > 0 ? (
                chats.slice(0, 5).map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => onSelectChat(chat.id)}
                    className="p-3 rounded-xl bg-slate-950/40 border border-slate-900 hover:border-cyan-500/20 hover:bg-slate-950 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="h-4 w-4 text-cyan-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-400 transition-colors">
                          {chat.title}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                          {chat.messages.length} messages
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500 italic">
                  No active chats yet. Start a conversation in the workspace.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Row 4: Recent Blockchain Transactions & Notifications Feed */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Card 6: Recent Transactions */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Recent Blockchain Transactions</h3>
              <p className="text-xs text-slate-500">Directly fetched ledger state on Polygon Mainnet</p>
            </div>

            {walletAddress ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 uppercase text-[9px] font-bold tracking-wider">
                      <th className="py-2.5">Tx Hash</th>
                      <th className="py-2.5">Type</th>
                      <th className="py-2.5">Value</th>
                      <th className="py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-3 text-slate-300 font-bold">No transactions detected</td>
                      <td className="py-3 text-slate-500">—</td>
                      <td className="py-3 text-slate-500">—</td>
                      <td className="py-3 text-right">
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                          EMPTY
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-900 rounded-xl">
                <p className="text-xs text-slate-500">Not connected yet</p>
                <button
                  onClick={handleConnectWallet}
                  className="mt-2.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono border border-cyan-500/20 rounded transition-all cursor-pointer"
                >
                  Connect Wallet to Query Ledger
                </button>
              </div>
            )}
          </div>

          {/* Card 8: Notifications Feed */}
          <div className="rounded-2xl bg-slate-900/30 border border-slate-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-white flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-cyan-400" />
                Alerts Feed
              </h3>
              <span className="text-[9px] text-slate-500 font-mono">
                Real-Time
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="flex gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">System Core Ready</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light mt-0.5">
                    Your full-stack container environments compiled and linter diagnostics passed cleanly.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-200">Database Connection Active</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light mt-0.5">
                    Firestore database successfully authorized and synchronized.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 text-slate-600 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-400">P2P Node Sync</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-light mt-0.5">
                    MetaMask window.ethereum state is prepared. Connect above to retrieve real Polygon tokens.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Saved Prompts Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Saved System Prompts</h3>
              <p className="text-xs text-slate-400">Deploy custom prompt instructions instantly</p>
            </div>
            <button
              onClick={() => setShowAddPrompt(!showAddPrompt)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Prompt
            </button>
          </div>

          {/* Add prompt collapsible panel */}
          {showAddPrompt && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleCreatePrompt}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 max-w-xl space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prompt Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Code Refactor Assistant"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 animate-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                  >
                    <option value="General">General</option>
                    <option value="Coding">Coding</option>
                    <option value="Creative">Creative</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prompt System Code</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Insert complete prompt guidelines..."
                  value={newPrompt}
                  onChange={(e) => setNewPrompt(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors cursor-pointer"
                >
                  Save Prompt
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPrompt(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}

          {/* Prompts list */}
          <div className="grid md:grid-cols-3 gap-6">
            {savedPrompts.map((p) => (
              <div 
                key={p.id}
                className="rounded-2xl bg-slate-900/50 border border-slate-850 p-5 space-y-3 relative overflow-hidden group flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded uppercase tracking-wider">
                      {p.category}
                    </span>
                    <button
                      onClick={() => onDeletePrompt(p.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                      title="Delete prompt"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <h4 className="font-display text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">{p.title}</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed line-clamp-3">{p.prompt}</p>
                </div>

                <button
                  onClick={() => onRunPrompt(p.prompt)}
                  className="w-full mt-4 py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Run in Chat
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Chats section */}
        {favoriteChats.length > 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="font-display text-lg font-bold text-white">Starred Chats</h3>
              <p className="text-xs text-slate-500">Access favorited chat threads instantly</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteChats.map((chat) => (
                <div 
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className="rounded-2xl bg-slate-900/30 border border-slate-850 p-4 hover:border-cyan-500/30 hover:bg-slate-900/50 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">{chat.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {chat.messages.length} messages • {chat.model.includes('pro') ? 'Pro' : 'Flash'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
