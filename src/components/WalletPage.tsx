/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, RefreshCw, 
  Plus, Send, Settings, Eye, EyeOff, Sparkles, CreditCard,
  DollarSign, Coins, TrendingUp, HelpCircle, Check, Copy, ExternalLink, AlertCircle
} from 'lucide-react';
import { 
  connectInjectedBrowserWallet, connectWalletConnectModal, 
  fetchNativePolBalance, fetchScutTokenBalance, sendNativePolPayment, sendScutTokenPayment,
  SCUT_TOKEN_ADDRESS, POLYGON_MAINNET
} from '../lib/web3';

interface WalletPageProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, desc: string, category: 'security' | 'billing' | 'api' | 'chat') => void;
}

export default function WalletPage({ user, onNavigate, onAddLog }: WalletPageProps) {
  const [obscureBalance, setObscureBalance] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferAsset, setTransferAsset] = useState<'credits' | 'tokens' | 'pol'>('pol');
  const [transferDesc, setTransferDesc] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Web3 Wallet state
  const [web3Connected, setWeb3Connected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [polBalance, setPolBalance] = useState('0.0000');
  const [tokenBalance, setTokenBalance] = useState('12500.00');
  const [creditsBalance, setCreditsBalance] = useState(2450);
  const [signer, setSigner] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Conversion Calculator states
  const [calcAmount, setCalcAmount] = useState('100');
  const [calcSource, setCalcSource] = useState<'USD' | 'CREDITS' | 'TOKEN' | 'POL'>('USD');

  // Connect Web3 Browser Wallet / WalletConnect
  const handleConnectWallet = async (type: 'injected' | 'walletconnect') => {
    setConnecting(true);
    try {
      const walletState = type === 'injected' 
        ? await connectInjectedBrowserWallet() 
        : await connectWalletConnectModal();
      
      setWeb3Connected(true);
      setWalletAddress(walletState.address);
      setPolBalance(walletState.polBalance);
      setTokenBalance(walletState.scutBalance);
      setSigner(walletState.signer);

      onAddLog(
        'Connected Polygon Web3 Wallet',
        `Connected wallet ${walletState.address.substring(0, 8)}... (${walletState.providerType}) on ${walletState.networkName}`,
        'security'
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to connect Web3 Wallet');
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferTarget || !transferAmount) return;
    
    setIsProcessing(true);
    setTransferSuccess(false);
    setTxHash(null);

    try {
      if (transferAsset === 'pol' || transferAsset === 'tokens') {
        if (!web3Connected || !signer) {
          // Auto connect hosted wallet if user isn't connected yet
          const walletState = await connectWalletConnectModal();
          setWeb3Connected(true);
          setWalletAddress(walletState.address);
          setSigner(walletState.signer);
          
          if (transferAsset === 'pol') {
            const res = await sendNativePolPayment(walletState.signer, transferTarget, transferAmount);
            setTxHash(res.txHash);
          } else {
            const res = await sendScutTokenPayment(walletState.signer, transferTarget, transferAmount);
            setTxHash(res.txHash);
          }
        } else {
          if (transferAsset === 'pol') {
            const res = await sendNativePolPayment(signer, transferTarget, transferAmount);
            setTxHash(res.txHash);
          } else {
            const res = await sendScutTokenPayment(signer, transferTarget, transferAmount);
            setTxHash(res.txHash);
          }
        }
      } else {
        // Credits internal transfer
        setCreditsBalance(prev => Math.max(0, prev - parseFloat(transferAmount)));
      }

      setTransferSuccess(true);
      onAddLog(
        'Executed Wallet Transfer',
        `Transferred ${transferAmount} ${transferAsset.toUpperCase()} to ${transferTarget}`,
        'billing'
      );
      setTransferTarget('');
      setTransferAmount('');
      setTransferDesc('');
    } catch (err: any) {
      console.error('Transfer error:', err);
      alert(err.message || 'Transfer failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const fiatEquivalent = (parseFloat(polBalance) * 0.55) + (parseFloat(tokenBalance) * 0.0425) + (creditsBalance / 10);

  const calculateConversion = () => {
    const val = parseFloat(calcAmount) || 0;
    if (calcSource === 'USD') {
      return { credits: val * 10, tokens: val * 23.5, pol: val * 1.82 };
    } else if (calcSource === 'CREDITS') {
      return { usd: val / 10, tokens: val * 2.35, pol: val * 0.182 };
    } else if (calcSource === 'TOKEN') {
      return { usd: val * 0.0425, credits: val * 0.425, pol: val * 0.077 };
    } else {
      return { usd: val * 0.55, credits: val * 5.5, tokens: val * 12.94 };
    }
  };

  const conversionResult = calculateConversion();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Financial Suite</span>
              <span className="text-[10px] font-mono text-slate-500">Node: Pay-Sec-3</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <Wallet className="h-8 w-8 text-cyan-400" />
              SCUT Digital Wallet
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              Manage cryptographic tokens, computational credits, and multi-currency ledgers inside the sandboxed SCUT ecosystem.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('scutpay')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin-slow" /> Swap Assets
            </button>
            <button 
              onClick={() => onNavigate('credits')}
              className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Deposit
            </button>
          </div>
        </div>

        {/* LEDGER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DIGITAL DEBIT CARD */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-cyan-400" /> Secure Card Profile
            </h2>
            
            <div className="relative h-56 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950 border border-cyan-500/15 p-6 overflow-hidden shadow-2xl flex flex-col justify-between group">
              {/* Decorative Mesh Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_60%)] pointer-events-none" />
              <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl group-hover:bg-cyan-500/20 transition-all duration-700" />
              
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-extrabold">SCUT BEARER PROXY</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.name || 'VALID GUEST'}</p>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-6 w-6 rounded bg-slate-850 border border-slate-800 flex items-center justify-center">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  </div>
                  <button 
                    onClick={() => setObscureBalance(!obscureBalance)}
                    className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {obscureBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="my-2 z-10">
                <p className="text-[10px] font-mono tracking-wider text-slate-500 uppercase font-semibold">Ledger Net Worth</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-3xl font-display font-extrabold text-white tracking-tight">
                    {obscureBalance ? '••••••' : `$${fiatEquivalent.toFixed(2)}`}
                  </span>
                  <span className="text-xs font-mono text-cyan-400">USD</span>
                </div>
              </div>

              <div className="flex justify-between items-end z-10">
                <div>
                  <p className="text-[9px] font-mono text-slate-500 tracking-wider">SECURE ID NUMBER</p>
                  <p className="text-xs font-mono text-slate-300 tracking-widest">•••• •••• •••• 9283</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-mono text-slate-500 tracking-wider">TIER</p>
                  <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-teal-400 bg-teal-500/10 border border-teal-500/15 px-1.5 py-0.5 rounded">
                    {user?.subscriptionTier || 'Free'}
                  </span>
                </div>
              </div>
            </div>

            {/* WEB3 WALLET CONNECTION BOX */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5 text-cyan-400" /> Polygon Web3 Connection
                </span>
                {web3Connected && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    Connected
                  </span>
                )}
              </div>

              {web3Connected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-xs font-mono text-slate-300 font-bold truncate max-w-[180px]">
                      {walletAddress}
                    </span>
                    <button onClick={copyAddress} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer">
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>POL Native Balance:</span>
                    <span className="text-white font-bold">{polBalance} POL</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleConnectWallet('injected')}
                    disabled={connecting}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    MetaMask / Extension
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConnectWallet('walletconnect')}
                    disabled={connecting}
                    className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    WalletConnect
                  </button>
                </div>
              )}
            </div>

            {/* BALANCE ACCRUALS */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Coins className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">Credits</span>
                </div>
                <p className="text-lg font-display font-bold text-white">
                  {obscureBalance ? '••••' : creditsBalance.toLocaleString()}
                </p>
                <p className="text-[9px] font-mono text-slate-500">10 Credits = $1.00</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">SCUT Tokens</span>
                </div>
                <p className="text-lg font-display font-bold text-white">
                  {obscureBalance ? '••••' : tokenBalance}
                </p>
                <p className="text-[9px] font-mono text-slate-500">1 Token = $0.04</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-1">
                <div className="flex items-center gap-1 text-slate-400">
                  <Coins className="h-3.5 w-3.5 text-purple-400" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">POL Native</span>
                </div>
                <p className="text-lg font-display font-bold text-white">
                  {obscureBalance ? '••••' : polBalance}
                </p>
                <p className="text-[9px] font-mono text-slate-500">Polygon Network</p>
              </div>
            </div>

          </div>

          {/* TRANSFER PORTAL */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Send className="h-4 w-4 text-cyan-400" />
                Peer-to-Peer Transfer
              </h2>
              <p className="text-slate-400 text-[11px] font-light mt-0.5">
                Instantly transfer credits, POL, or SCUT tokens to any verified wallet address or user handle.
              </p>
            </div>

            <form onSubmit={handleTransfer} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recipient Address / User</label>
                <input 
                  type="text"
                  required
                  placeholder="0x... or @username"
                  value={transferTarget}
                  onChange={(e) => setTransferTarget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs font-medium text-white transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Transfer Asset</label>
                  <select 
                    value={transferAsset}
                    onChange={(e: any) => setTransferAsset(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="pol">POL (Polygon Native)</option>
                    <option value="tokens">SCUT Tokens</option>
                    <option value="credits">Credits (Standard)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Amount</label>
                  <input 
                    type="number"
                    required
                    step="any"
                    min="0.001"
                    placeholder="e.g. 10"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs font-mono text-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reference Note (Optional)</label>
                <input 
                  type="text"
                  placeholder="e.g. Prompt package buyback"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 hover:border-slate-800 focus:border-cyan-400 text-xs font-medium text-white transition-all outline-none"
                />
              </div>

              {transferSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs leading-relaxed font-mono space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Transfer executed on Polygon blockchain!</span>
                  </div>
                  {txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-400 underline flex items-center gap-1 font-mono"
                    >
                      View on PolygonScan: {txHash.substring(0, 16)}... <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? 'Verifying Ledger...' : 'Authenticate Transfer'}
              </button>
            </form>
          </div>

          {/* CALCULATOR & FX widget */}
          <div className="lg:col-span-1 p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-cyan-400" />
                Asset Conversion Rate
              </h2>
              <p className="text-slate-400 text-[11px] font-light mt-0.5">
                Estimate values instantly between fiat currencies, API credits, and governance tokens.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Source Asset</label>
                  <select 
                    value={calcSource}
                    onChange={(e: any) => setCalcSource(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="CREDITS">Credits</option>
                    <option value="TOKEN">SCUT Token</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Input Amount</label>
                  <input 
                    type="number"
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-900/60 space-y-3 font-mono text-xs">
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">ESTIMATED CONVERSIONS</div>
                
                {calcSource !== 'USD' && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>US Dollars (USD):</span>
                    <span className="text-cyan-400 font-bold">${(conversionResult.usd || 0).toFixed(2)}</span>
                  </div>
                )}
                {calcSource !== 'CREDITS' && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Ecosystem Credits:</span>
                    <span className="text-cyan-400 font-bold">{(conversionResult.credits || 0).toLocaleString()}</span>
                  </div>
                )}
                {calcSource !== 'TOKEN' && (
                  <div className="flex justify-between items-center text-slate-300">
                    <span>SCUT Tokens:</span>
                    <span className="text-cyan-400 font-bold">{(conversionResult.tokens || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/20 p-3 rounded-xl border border-slate-900/60">
                <HelpCircle className="h-4 w-4 text-slate-500 shrink-0" />
                <p className="text-[10px] text-slate-500 leading-relaxed font-light">
                  Rates are tied to decentralized liquidity indices and platform operational scales. Subject to change dynamically.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* LEDGER ACTIVITY HISTORY */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900/80 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-cyan-400" />
            Ecosystem Transaction History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-850 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Destination / Node</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-200">tx_82103982a</td>
                  <td className="py-3 px-4">2026-07-19 04:12</td>
                  <td className="py-3 px-4 flex items-center gap-1 text-emerald-400"><ArrowDownLeft className="h-3.5 w-3.5" /> Deposit</td>
                  <td className="py-3 px-4">Stripe Checkout Node</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">+1,500 Credits</td>
                  <td className="py-3 px-4 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15">SETTLED</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-200">tx_10283749c</td>
                  <td className="py-3 px-4">2026-07-18 19:45</td>
                  <td className="py-3 px-4 flex items-center gap-1 text-rose-400"><ArrowUpRight className="h-3.5 w-3.5" /> Compute Expense</td>
                  <td className="py-3 px-4">Ares Image Engine</td>
                  <td className="py-3 px-4 font-bold text-rose-400">-50 Credits</td>
                  <td className="py-3 px-4 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15">SETTLED</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-200">tx_92810398b</td>
                  <td className="py-3 px-4">2026-07-17 11:30</td>
                  <td className="py-3 px-4 flex items-center gap-1 text-rose-400"><ArrowUpRight className="h-3.5 w-3.5" /> Transfer</td>
                  <td className="py-3 px-4">@scut_women_girls</td>
                  <td className="py-3 px-4 font-bold text-rose-400">-250 Credits</td>
                  <td className="py-3 px-4 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15">SETTLED</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-200">tx_48210394e</td>
                  <td className="py-3 px-4">2026-07-15 08:15</td>
                  <td className="py-3 px-4 flex items-center gap-1 text-emerald-400"><ArrowDownLeft className="h-3.5 w-3.5" /> Reward</td>
                  <td className="py-3 px-4">Daily Platform Check-in</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">+10 Credits</td>
                  <td className="py-3 px-4 text-right"><span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/15">SETTLED</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
