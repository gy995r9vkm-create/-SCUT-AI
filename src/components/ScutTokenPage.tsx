import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, TrendingUp, Layers, Lock, Vote, Copy, ExternalLink, Wallet, DollarSign, 
  Check, Award, Compass, BookOpen, Clock, AlertCircle, ChevronRight, BarChart2,
  RefreshCw, CheckCircle2, Info, FileText, ArrowRight, ArrowUpRight, Shield, X
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  connectInjectedBrowserWallet, connectWalletConnectModal,
  sendScutTokenPayment, SCUT_TOKEN_ADDRESS 
} from '../lib/web3';

interface ScutTokenPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog?: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => void;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'Ecosystem' | 'Development' | 'Partnerships' | 'Finance';
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Passed' | 'Rejected' | 'Queued';
  endDate: string;
  creator: string;
  voted?: 'For' | 'Against';
}

interface Stake {
  id: string;
  amount: number;
  apy: number;
  startDate: string;
  durationDays: number;
  earned: number;
  claimed: boolean;
}

export default function ScutTokenPage({ user, onNavigate, onAddLog }: ScutTokenPageProps) {
  // Wallet state
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [scutBalance, setScutBalance] = useState(12500); // initial simulated balance
  const [maticBalance, setMaticBalance] = useState(45.2);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Stats & Chart State
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '1y'>('30d');
  const [price, setPrice] = useState(0.0425);
  const [change24h, setChange24h] = useState(8.42);
  const [isCopied, setIsCopied] = useState(false);

  // Staking states
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakingTier, setStakingTier] = useState<number>(1); // 1 = 30 days, 2 = 90 days, 3 = 365 days
  const [stakes, setStakes] = useState<Stake[]>([
    {
      id: 'st-1',
      amount: 5000,
      apy: 12,
      startDate: '2026-06-15',
      durationDays: 90,
      earned: 54.25,
      claimed: false
    }
  ]);

  // Governance States
  const [proposals, setProposals] = useState<Proposal[]>([
    {
      id: 'prop-1',
      title: 'Integrate SCUT Pay into Mica Bucurie App Store',
      description: 'Proposal to enable direct digital commerce checkouts for standard Romanian and international artisanal micro-shops using Polygon-based SCUT Token as a core payment option.',
      category: 'Ecosystem',
      votesFor: 842000,
      votesAgainst: 12500,
      status: 'Active',
      endDate: '2026-07-28',
      creator: '0xabc123...456'
    },
    {
      id: 'prop-2',
      title: 'Upgrade Chat Workspace Default Model to Gemini-3.1-Pro-Preview',
      description: 'Proposes utilizing ecosystem reserves to subsidize full Gemini-3.1-Pro-Preview queries for all certified SCUT Stakers holding tier Gold or higher without requiring traditional card subscriptions.',
      category: 'Development',
      votesFor: 1245000,
      votesAgainst: 95400,
      status: 'Passed',
      endDate: '2026-07-10',
      creator: '0x992ff...9a3'
    },
    {
      id: 'prop-3',
      title: 'SCUT Community Micro-Grants for Romanian Social Work Initiatives',
      description: 'Allocate 500,000 SCUT from the Community Treasury to finance non-profit social work campaigns focused on education and clean water in rural Transylvanian communities.',
      category: 'Finance',
      votesFor: 620000,
      votesAgainst: 4800,
      status: 'Active',
      endDate: '2026-07-25',
      creator: '0xfed456...a98'
    }
  ]);

  const contractAddress = '0x60Edb815e19E3270e027bE1aC6f9917297a21497';

  // Generate chart data based on timeframe
  const getChartData = () => {
    const basePrices = [0.031, 0.033, 0.032, 0.035, 0.034, 0.038, 0.037, 0.040, 0.039, 0.0425];
    if (timeframe === '24h') {
      return Array.from({ length: 24 }, (_, i) => ({
        name: `${i}:00`,
        Price: Number((0.040 + Math.sin(i / 3) * 0.002 + Math.random() * 0.001).toFixed(4))
      }));
    } else if (timeframe === '7d') {
      return Array.from({ length: 7 }, (_, i) => ({
        name: `Day ${i + 1}`,
        Price: Number((0.038 + (i * 0.0008) + Math.random() * 0.002).toFixed(4))
      }));
    } else if (timeframe === '30d') {
      return [
        { name: 'Jun 18', Price: 0.032 },
        { name: 'Jun 21', Price: 0.034 },
        { name: 'Jun 24', Price: 0.033 },
        { name: 'Jun 27', Price: 0.036 },
        { name: 'Jun 30', Price: 0.038 },
        { name: 'Jul 03', Price: 0.037 },
        { name: 'Jul 06', Price: 0.041 },
        { name: 'Jul 09', Price: 0.039 },
        { name: 'Jul 12', Price: 0.042 },
        { name: 'Jul 15', Price: 0.0415 },
        { name: 'Jul 17', Price: 0.0425 },
      ];
    } else {
      return Array.from({ length: 12 }, (_, i) => ({
        name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        Price: Number((0.015 + (i * 0.0025) + Math.sin(i) * 0.001).toFixed(4))
      }));
    }
  };

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const rand = (Math.random() - 0.48) * 0.0005;
        const nextPrice = Math.max(0.01, prev + rand);
        // Dynamic price change calculation
        const initialPrice = 0.038;
        const change = ((nextPrice - initialPrice) / initialPrice) * 100;
        setChange24h(Number(change.toFixed(2)));
        return Number(nextPrice.toFixed(4));
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    if (onAddLog) {
      onAddLog('Token Interaction', 'Copied token contract address to clipboard', 'security');
    }
  };

  const connectWallet = async (type: 'injected' | 'walletconnect' = 'injected') => {
    setIsConnecting(true);
    try {
      const walletState = type === 'injected'
        ? await connectInjectedBrowserWallet()
        : await connectWalletConnectModal();
      
      setWalletAddress(`${walletState.address.substring(0, 6)}...${walletState.address.substring(walletState.address.length - 4)}`);
      setScutBalance(parseFloat(walletState.scutBalance) || 12500);
      setMaticBalance(parseFloat(walletState.polBalance) || 45.2);
      setWalletConnected(true);
      setShowWalletModal(false);

      if (onAddLog) {
        onAddLog('Web3 Connection', `Successfully connected wallet ${walletState.address} via ${walletState.providerType} on Polygon`, 'security');
      }
      showNotification(`Connected ${walletState.providerType === 'injected' ? 'MetaMask / Extension' : 'WalletConnect'} on Polygon!`);
    } catch (err: any) {
      console.error(err);
      showNotification(err.message || 'Failed to connect Web3 Wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCreateStake = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0) return;
    if (amount > scutBalance) {
      showNotification("Insufficient SCUT balance to stake this amount.");
      return;
    }

    const apys = [5, 12, 28];
    const durations = [30, 90, 365];
    const selectedApy = apys[stakingTier - 1];
    const selectedDuration = durations[stakingTier - 1];

    const newStake: Stake = {
      id: `st-${Date.now()}`,
      amount,
      apy: selectedApy,
      startDate: new Date().toISOString().split('T')[0],
      durationDays: selectedDuration,
      earned: 0,
      claimed: false
    };

    setStakes([newStake, ...stakes]);
    setScutBalance(prev => prev - amount);
    setStakeAmount('');
    if (onAddLog) {
      onAddLog('SCUT Staking', `Staked ${amount} SCUT for ${selectedDuration} days at ${selectedApy}% APY`, 'billing');
    }
  };

  const handleClaimReward = (id: string) => {
    setStakes(prev => prev.map(s => {
      if (s.id === id) {
        if (!s.claimed) {
          setScutBalance(b => b + s.earned);
          if (onAddLog) {
            onAddLog('SCUT Reward Claimed', `Claimed ${s.earned.toFixed(2)} SCUT from active stake`, 'billing');
          }
          return { ...s, earned: 0, claimed: true };
        }
      }
      return s;
    }));
  };

  const handleVote = (proposalId: string, type: 'For' | 'Against') => {
    if (!walletConnected) {
      setShowWalletModal(true);
      return;
    }

    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        if (p.voted) return p; // already voted
        const increment = scutBalance; // 1 SCUT = 1 Vote power
        return {
          ...p,
          votesFor: type === 'For' ? p.votesFor + increment : p.votesFor,
          votesAgainst: type === 'Against' ? p.votesAgainst + increment : p.votesAgainst,
          voted: type
        };
      }
      return p;
    }));

    if (onAddLog) {
      onAddLog('DAO Governance', `Voted "${type}" on proposal "${proposalId}" with ${scutBalance} SCUT power`, 'security');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* HERO SECTION */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-900 pb-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Coins className="h-3.5 w-3.5 animate-pulse" />
            Official Polygon Token
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold tracking-tight text-white">
            The Governance & Utility Token of <span className="text-cyan-400">SCUT</span> Ecosystem
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            One native cryptographically secured asset running directly on the Polygon blockchain. 
            SCUT powers payments via SCUT Pay, unlocks business portal discounts, offers DAO voting rights, 
            and fuels Mica Bucurie’s premium artisanal digital commerce loops.
          </p>

          {/* Contract Address copy box */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 w-full max-w-md">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Contract</span>
              <span className="text-xs font-mono text-slate-300 select-all overflow-hidden text-ellipsis whitespace-nowrap">{contractAddress}</span>
              <button 
                onClick={handleCopyContract}
                className="ml-auto p-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {isCopied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <a 
              href={`https://polygonscan.com/token/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ExternalLink className="h-4 w-4" />
              Polygonscan
            </a>
          </div>
        </div>

        {/* Live Token Status Widget / Wallet connector */}
        <div className="w-full max-w-sm bg-slate-900/60 border border-slate-850 rounded-2xl p-6 shadow-xl space-y-6 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full filter blur-2xl" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Ecosystem Asset</h4>
                <p className="text-sm font-extrabold text-white">SCUT Token</p>
              </div>
            </div>
            
            {walletConnected ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {walletAddress}
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wallet className="h-3.5 w-3.5" />
                Connect Wallet
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-950/65 rounded-xl p-3 border border-slate-850">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SCUT Balance</span>
              <p className="text-base font-extrabold text-white mt-1">
                {walletConnected ? scutBalance.toLocaleString() : '—'} <span className="text-xs text-cyan-400 font-medium">SCUT</span>
              </p>
            </div>
            <div className="bg-slate-950/65 rounded-xl p-3 border border-slate-850">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gas (MATIC)</span>
              <p className="text-base font-extrabold text-white mt-1">
                {walletConnected ? maticBalance.toFixed(2) : '—'} <span className="text-xs text-slate-400 font-medium">MATIC</span>
              </p>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Supply</span>
              <span className="text-slate-200 font-mono font-bold">100,000,000 SCUT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Circulating Supply</span>
              <span className="text-slate-200 font-mono font-bold">34,500,000 SCUT</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Official Telegram</span>
              <a href="https://t.me/SCUT_Official" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-0.5 font-semibold">
                t.me/SCUT_Official <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS & ANALYTICS GRIDS */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Market Price</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono">${price.toFixed(4)}</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {change24h >= 0 ? '▲' : '▼'} {Math.abs(change24h)}%
                </span>
              </div>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
              {(['24h', '7d', '30d', '1y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    timeframe === tf
                      ? 'bg-slate-900 border border-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="Price" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Key Metrics Panel */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <BarChart2 className="h-4 w-4 text-cyan-400" />
                Token Metrics
              </h3>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Polygon Core</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Cap</span>
                  <p className="text-sm font-extrabold text-white font-mono mt-1">$4,250,000</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Liquidity Pool</span>
                  <p className="text-sm font-extrabold text-white font-mono mt-1">$845,200</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
              </div>

              <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">24h Vol (Uniswap)</span>
                  <p className="text-sm font-extrabold text-white font-mono mt-1">$124,560</p>
                </div>
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-slate-400 text-xs leading-relaxed flex gap-2.5">
            <Info className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              SCUT token contract is officially deployed on the Polygon Mainnet. Avoid spoof or copycat tokens with similar names. Always verify contract address matches official channels.
            </span>
          </div>
        </div>
      </div>

      {/* STAKING & COMMUNITY GOVERNANCE ROW */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Staking Center */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400 animate-pulse" />
              <h3 className="text-sm font-bold text-white">SCUT Staking Pool</h3>
            </div>
            <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">Up to 28% APY</span>
          </div>

          <form onSubmit={handleCreateStake} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stake Amount (SCUT)</label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 pr-16 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60"
                  disabled={!walletConnected}
                />
                <button
                  type="button"
                  onClick={() => setStakeAmount(scutBalance.toString())}
                  className="absolute right-3 top-2.5 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-xs font-bold text-cyan-400 cursor-pointer border border-slate-800"
                  disabled={!walletConnected}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Locked timeframe select */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lockup Period & Rewards tier</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tier: 1, label: '30 Days', apy: '5% APY', desc: 'Bronze Tier' },
                  { tier: 2, label: '90 Days', apy: '12% APY', desc: 'Silver Tier' },
                  { tier: 3, label: '365 Days', apy: '28% APY', desc: 'Gold Tier' }
                ].map((item) => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setStakingTier(item.tier)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      stakingTier === item.tier
                        ? 'bg-cyan-500/10 border-cyan-500/45 text-white'
                        : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-100">{item.label}</p>
                    <p className="text-sm font-extrabold text-cyan-400 mt-1">{item.apy}</p>
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {walletConnected ? (
              <button
                type="submit"
                disabled={!stakeAmount}
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-850 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10 cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <Lock className="h-4 w-4" />
                Initialize SCUT Stake Lock
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowWalletModal(true)}
                className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-900 font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <Wallet className="h-4 w-4" />
                Connect Wallet to Stake
              </button>
            )}
          </form>

          {/* Active Stakes */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Lockups</h4>
            {stakes.length === 0 ? (
              <p className="text-xs text-slate-500">No active stakes found. Stake your SCUT tokens to start generating APY.</p>
            ) : (
              <div className="space-y-2">
                {stakes.map((stk) => (
                  <div key={stk.id} className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white font-mono">{stk.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-cyan-400 uppercase font-mono tracking-widest font-bold">SCUT</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                        <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {stk.durationDays} Days Lock</span>
                        <span>•</span>
                        <span>Start: {stk.startDate}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Earned Rewards</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-emerald-400 font-mono">+{stk.earned.toFixed(2)} SCUT</span>
                        {!stk.claimed ? (
                          <button
                            onClick={() => handleClaimReward(stk.id)}
                            className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Claim
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Claimed</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DAO Governance Proposals */}
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-6 space-y-6">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">DAO Ecosystem Governance</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 font-mono">1 SCUT = 1 Vote Power</span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1">
            {proposals.map((prop) => {
              const totalVotes = prop.votesFor + prop.votesAgainst;
              const forPercent = totalVotes > 0 ? (prop.votesFor / totalVotes) * 100 : 0;
              const againstPercent = totalVotes > 0 ? (prop.votesAgainst / totalVotes) * 100 : 0;

              return (
                <div key={prop.id} className="bg-slate-950 border border-slate-850 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                      prop.status === 'Active' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {prop.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Ends: {prop.endDate}</span>
                  </div>

                  <h4 className="text-xs font-bold text-white hover:text-cyan-400 transition-colors">{prop.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{prop.description}</p>

                  {/* Vote Progress Bars */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">FOR: {prop.votesFor.toLocaleString()} ({forPercent.toFixed(1)}%)</span>
                      <span className="text-rose-400 font-bold">AGAINST: {prop.votesAgainst.toLocaleString()} ({againstPercent.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${forPercent}%` }} />
                      <div className="h-full bg-rose-500" style={{ width: `${againstPercent}%` }} />
                    </div>
                  </div>

                  {/* Voting Buttons */}
                  {prop.status === 'Active' && (
                    <div className="flex gap-2 pt-2 border-t border-slate-900">
                      {prop.voted ? (
                        <div className="w-full text-center py-1.5 rounded-lg bg-cyan-500/5 text-cyan-400 text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          You voted "{prop.voted}" with your SCUT weight
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleVote(prop.id, 'For')}
                            className="w-1/2 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            Vote FOR
                          </button>
                          <button
                            onClick={() => handleVote(prop.id, 'Against')}
                            className="w-1/2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            Vote AGAINST
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROADMAP & UTILITY GRID */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="border-b border-slate-900 pb-3 flex items-center gap-2">
          <Compass className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-display font-bold text-white">Ecosystem Roadmap & Utility Matrix</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Phase 1: SCUT AI Launch</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Establishing our proprietary multimodal workspace integrated with Web Search, Document Parsing, Voice processing, and premium localized AI streaming.
            </p>
            <span className="inline-block text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Phase 2: SCUT Pay & Token Staking</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unifying digital commerce with Polygon smart contracts, decentralized payment invoices, community staker APY models, and real-time ledger auditing.
            </p>
            <span className="inline-block text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider">In Progress</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Phase 3: Artisanal Marketplace</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developing Mica Bucurie’s premium local commerce marketplace and business portal, bringing hundreds of artisanal vendors onto the blockchain ecosystem.
            </p>
            <span className="inline-block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Scheduled Q4 2026</span>
          </div>

          <div className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Shield className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Phase 4: Multi-Chain Governance</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transitioning to full multi-chain DAO governance models, zero-knowledge payment receipts, localized compliance auditing, and secure enterprise REST APIs.
            </p>
            <span className="inline-block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Scheduled 2027</span>
          </div>
        </div>
      </div>

      {/* WEB3 WALLET SIMULATOR MODAL */}
      <AnimatePresence>
        {showWalletModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-display font-semibold text-slate-100">Connect a Web3 Wallet</h3>
                </div>
                <button
                  onClick={() => setShowWalletModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your preferred Polygon network provider to interact with the SCUT Staking and Governance modules.
              </p>

              <div className="space-y-2">
                {[
                  { name: 'MetaMask / Browser Extension', icon: '🦊', type: 'injected' as const },
                  { name: 'WalletConnect Protocol', icon: '🔗', type: 'walletconnect' as const },
                  { name: 'Coinbase Wallet / Mobile', icon: '🔵', type: 'injected' as const },
                  { name: 'SCUT Hosted Polygon Signer', icon: '📱', type: 'walletconnect' as const }
                ].map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => connectWallet(wallet.type)}
                    disabled={isConnecting}
                    className="w-full p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-cyan-500/40 text-left transition-all cursor-pointer flex items-center justify-between group disabled:opacity-55"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{wallet.icon}</span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white">{wallet.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </button>
                ))}
              </div>

              {isConnecting && (
                <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-semibold animate-pulse py-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Awaiting wallet signature...
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <Shield className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
