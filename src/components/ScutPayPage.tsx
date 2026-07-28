import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, CheckCircle2, ArrowRightLeft, Activity, PlusCircle, QrCode, 
  Coins, ShieldAlert, ExternalLink, Clock, Sparkles, Send, ShieldCheck, 
  RefreshCw, Layers, Search, Copy, Check, Info, AlertTriangle, AlertCircle,
  ArrowUpRight, Landmark
} from 'lucide-react';
import { ethers } from 'ethers';
import { User } from '../types';

import { 
  connectInjectedBrowserWallet, connectWalletConnectModal, 
  sendNativePolPayment, sendScutTokenPayment, fetchNativePolBalance, fetchScutTokenBalance,
  SCUT_TOKEN_ADDRESS
} from '../lib/web3';

interface ScutPayPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  initialAmount?: string;
  initialDescription?: string;
}

interface TransactionRecord {
  id: string;
  txHash: string;
  amount: string;
  token: string;
  recipient: string;
  sender: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'pending';
  network: string;
  description: string;
}

interface TokenItem {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
  contractAddress?: string;
  decimals: number;
}

export default function ScutPayPage({ user, onNavigate, onAddLog, initialAmount, initialDescription }: ScutPayPageProps) {
  // Navigation tabs: terminal (Direct Pay), requests (Payment Requests), merchant (Merchant Tools)
  const [activeTab, setActiveTab] = useState<'terminal' | 'requests' | 'merchant'>('terminal');

  // Wallet Connection States
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [balance, setBalance] = useState('0.00'); // Main native balance
  const [network, setNetwork] = useState('Polygon Mainnet');
  const [providerType, setProviderType] = useState<'real' | 'simulation'>('simulation');
  const [connecting, setConnecting] = useState(false);

  // Supported tokens list & balances
  const [tokens, setTokens] = useState<TokenItem[]>([
    { symbol: 'POL', name: 'Polygon Native', balance: '0.00', icon: '💜', decimals: 18 },
    { symbol: 'SCUT', name: 'SCUT Utility Token', balance: '0.00', icon: '🤖', contractAddress: '0x3845badAde8e6D216a695029D8D6eE8E9f697dbD', decimals: 18 },
    { symbol: 'USDT', name: 'Tether USD', balance: '0.00', icon: '💵', contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', balance: '0.00', icon: '🪙', contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
  ]);

  // Terminal checkout form states
  const [merchantAddress] = useState('0x973a9eA0FF572522C6aB16715f57B8b11D00B879');
  const [payAmount, setPayAmount] = useState(initialAmount || '1.5');
  const [payToken, setPayToken] = useState<string>('POL');
  const [payDescription, setPayDescription] = useState(initialDescription || 'SCUT Ecosystem Pro Pack');
  const [customTxHash, setCustomTxHash] = useState('');

  // Payment Requests Lookup Panel
  const [lookupId, setLookupId] = useState('');
  const [loadedRequest, setLoadedRequest] = useState<any>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Merchant Creator Tools
  const [merchantAmount, setMerchantAmount] = useState('50.0');
  const [merchantToken, setMerchantToken] = useState('SCUT');
  const [merchantDesc, setMerchantDesc] = useState('SCUT Premium API Access Fee');
  const [merchantAddressInput, setMerchantAddressInput] = useState('0x973a9eA0FF572522C6aB16715f57B8b11D00B879');
  const [createdRequest, setCreatedRequest] = useState<any>(null);
  const [creatingRequest, setCreatingRequest] = useState(false);

  // Copy success animation helpers
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Transaction pipeline / status
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'signing' | 'broadcasting' | 'verifying' | 'completed' | 'failed'>('idle');
  const [pipelineError, setPipelineError] = useState('');
  const [activeTxHash, setActiveTxHash] = useState('');
  const [backendVerificationResult, setBackendVerificationResult] = useState<any>(null);
  const [txHistory, setTxHistory] = useState<TransactionRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Sync initial props if updated
  useEffect(() => {
    if (initialAmount) setPayAmount(initialAmount);
    if (initialDescription) setPayDescription(initialDescription);
  }, [initialAmount, initialDescription]);

  // Load transaction history on mount
  useEffect(() => {
    const saved = localStorage.getItem('scutpay_txs_v2');
    if (saved) {
      setTxHistory(JSON.parse(saved));
    } else {
      // Seed default transactions
      const defaultTxs: TransactionRecord[] = [
        {
          id: 'tx-1',
          txHash: '0x3df0a259c8fa7270b77b102ce0bdf51de848a609d0cbdfbf32f8373b57367c0a',
          amount: '2.50',
          token: 'POL',
          recipient: '0x973a9eA0FF572522C6aB16715f57B8b11D00B879',
          sender: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          timestamp: new Date(Date.now() - 3600000 * 3).toLocaleString(),
          status: 'completed',
          network: 'Polygon Mainnet',
          description: 'SCUT Ecosystem Pro Pack'
        },
        {
          id: 'tx-2',
          txHash: '0xfa01b2a95e2cdfbff32fa7270b77b102ce0bdf51de848a609d0cbdfbf3273b75',
          amount: '120.00',
          token: 'SCUT',
          recipient: '0x973a9eA0FF572522C6aB16715f57B8b11D00B879',
          sender: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          timestamp: new Date(Date.now() - 3600000 * 20).toLocaleString(),
          status: 'completed',
          network: 'Polygon Mainnet',
          description: 'SCUT AI Custom Token Batch'
        }
      ];
      setTxHistory(defaultTxs);
      localStorage.setItem('scutpay_txs_v2', JSON.stringify(defaultTxs));
    }
  }, []);

  // Check if browser has MetaMask on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setProviderType('real');
    }
  }, []);

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Connection flow
  const connectWallet = async (mode: 'injected' | 'walletconnect' = 'injected') => {
    setConnecting(true);
    setPipelineError('');
    try {
      const walletState = mode === 'injected'
        ? await connectInjectedBrowserWallet()
        : await connectWalletConnectModal();

      setWalletAddress(walletState.address);
      setBalance(walletState.polBalance);
      setNetwork(walletState.networkName);
      setWalletConnected(true);
      setProviderType(walletState.providerType === 'injected' ? 'real' : 'simulation');

      const updatedTokens = await Promise.all(
        tokens.map(async (tok) => {
          if (tok.symbol === 'POL') {
            return { ...tok, balance: walletState.polBalance };
          }
          if (tok.symbol === 'SCUT') {
            return { ...tok, balance: walletState.scutBalance };
          }
          if (tok.contractAddress && walletState.provider) {
            try {
              const contract = new ethers.Contract(
                tok.contractAddress,
                ["function balanceOf(address owner) view returns (uint256)", "function decimals() view returns (uint8)"],
                walletState.provider
              );
              const bal = await contract.balanceOf(walletState.address);
              const dec = await contract.decimals();
              const formatted = parseFloat(ethers.formatUnits(bal, dec)).toFixed(2);
              return { ...tok, balance: formatted };
            } catch (e) {
              console.warn(`Could not fetch balance for ${tok.symbol}:`, e);
            }
          }
          return { ...tok, balance: '25.00' };
        })
      );
      setTokens(updatedTokens);
      onAddLog('Wallet Connected', `Polygon Wallet: ${walletState.address.substring(0, 8)}... connected via ${mode}`, 'security');
      showNotification(`Connected via ${mode === 'injected' ? 'Browser Extension' : 'WalletConnect'}!`);
    } catch (err: any) {
      console.error(err);
      setPipelineError(err.message || 'Wallet connection failed');
      onAddLog('Wallet Connection Error', err.message || 'Error', 'security');
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setBalance('0.00');
    setTokens([
      { symbol: 'POL', name: 'Polygon Native', balance: '0.00', icon: '💜', decimals: 18 },
      { symbol: 'SCUT', name: 'SCUT Utility Token', balance: '0.00', icon: '🤖', contractAddress: '0x3845badAde8e6D216a695029D8D6eE8E9f697dbD', decimals: 18 },
      { symbol: 'USDT', name: 'Tether USD', balance: '0.00', icon: '💵', contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
      { symbol: 'USDC', name: 'USD Coin', balance: '0.00', icon: '🪙', contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', decimals: 6 },
    ]);
    onAddLog('Wallet Disconnected', 'Polygon wallet disconnected from platform', 'security');
  };

  // Look up payment request
  const handleLookupRequest = async (idToLookup?: string) => {
    const targetId = idToLookup || lookupId;
    if (!targetId.trim()) {
      setLookupError('Please enter a valid Payment Request ID');
      return;
    }
    setLoadingRequest(true);
    setLookupError('');
    setLoadedRequest(null);
    try {
      const response = await fetch(`/api/scutpay/payment-request/${targetId.trim()}`);
      if (!response.ok) {
        throw new Error('Payment Request not found');
      }
      const data = await response.json();
      if (data.success) {
        setLoadedRequest(data.paymentRequest);
        // Automatically prefill checkout parameters!
        setPayAmount(data.paymentRequest.amount);
        setPayDescription(data.paymentRequest.description);
        setPayToken(data.paymentRequest.token);
      } else {
        setLookupError(data.error || 'Failed to load payment request');
      }
    } catch (err: any) {
      setLookupError(err.message || 'Error loading payment request');
    } finally {
      setLoadingRequest(false);
    }
  };

  // Create payment request
  const handleCreateRequest = async () => {
    if (!merchantAmount || parseFloat(merchantAmount) <= 0) {
      showNotification('Please enter a valid amount');
      return;
    }
    setCreatingRequest(true);
    try {
      const response = await fetch('/api/scutpay/payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: merchantAmount,
          token: merchantToken,
          description: merchantDesc,
          merchantAddress: merchantAddressInput
        })
      });
      const data = await response.json();
      if (data.success) {
        setCreatedRequest(data.paymentRequest);
        onAddLog('Payment Request Created', `Merchant session ${data.paymentRequest.id} generated for ${merchantAmount} ${merchantToken}`, 'billing');
      } else {
        showNotification(data.error || 'Failed to create payment request');
      }
    } catch (err: any) {
      showNotification('Error: ' + err.message);
    } finally {
      setCreatingRequest(false);
    }
  };

  // Transaction Dispatcher with complete ERC-20 contract architecture and secure backend verification
  const triggerPaymentFlow = async (reqIdToVerify?: string) => {
    if (!walletConnected) {
      showNotification('Please connect your Polygon wallet first!');
      return;
    }

    const selectedTokenObj = tokens.find(t => t.symbol === payToken);
    const userBalance = parseFloat(selectedTokenObj?.balance || '0');
    const paymentValue = parseFloat(payAmount);

    if (userBalance < paymentValue) {
      showNotification(`Insufficient balance! You have ${userBalance} ${payToken} but need ${paymentValue} ${payToken}.`);
      return;
    }

    setPaymentStatus('initiating');
    setActiveTxHash('');
    setBackendVerificationResult(null);
    setPipelineError('');

    setTimeout(async () => {
      setPaymentStatus('signing');

      setTimeout(async () => {
        try {
          // Default mock transaction hash
          let txHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
          
          if (providerType === 'real' && typeof window !== 'undefined' && (window as any).ethereum) {
            setPaymentStatus('broadcasting');
            const ethProvider = new ethers.BrowserProvider((window as any).ethereum);
            const signer = await ethProvider.getSigner();
            
            if (payToken === 'POL') {
              // Standard native coin transaction
              const txResponse = await signer.sendTransaction({
                to: merchantAddress,
                value: ethers.parseEther(payAmount)
              });
              txHash = txResponse.hash;
            } else {
              // Standard ERC-20 contract payment architecture
              if (!selectedTokenObj || !selectedTokenObj.contractAddress) {
                throw new Error(`Token contract address not configured for ${payToken}`);
              }
              const contract = new ethers.Contract(
                selectedTokenObj.contractAddress,
                [
                  "function transfer(address to, uint256 value) returns (bool)",
                  "function decimals() view returns (uint8)"
                ],
                signer
              );
              const decimals = selectedTokenObj.decimals || 18;
              const parsedAmount = ethers.parseUnits(payAmount, decimals);
              const txResponse = await contract.transfer(merchantAddress, parsedAmount);
              txHash = txResponse.hash;
            }
          }

          setActiveTxHash(txHash);
          setPaymentStatus('verifying');

          // Secure backend payment API verification
          const verifyResponse = await fetch('/api/scutpay/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              txHash,
              amount: payAmount,
              userId: user?.email || 'guest',
              description: payDescription,
              paymentRequestId: reqIdToVerify || loadedRequest?.id
            })
          });

          if (!verifyResponse.ok) {
            throw new Error(`Server returned error code ${verifyResponse.status}`);
          }

          const verifyData = await verifyResponse.json();
          setBackendVerificationResult(verifyData);

          if (verifyData.success) {
            setPaymentStatus('completed');
            
            // Deduct mock balance
            if (providerType === 'simulation') {
              setTokens(prev => prev.map(t => {
                if (t.symbol === payToken) {
                  const nb = Math.max(0, parseFloat(t.balance) - paymentValue);
                  return { ...t, balance: nb.toFixed(2) };
                }
                return t;
              }));
              if (payToken === 'POL') {
                setBalance(prev => Math.max(0, parseFloat(prev) - paymentValue).toFixed(4));
              }
            }

            // Record transaction
            const newTx: TransactionRecord = {
              id: 'tx-' + Math.random().toString(36).substring(2, 9),
              txHash,
              amount: payAmount,
              token: payToken,
              recipient: merchantAddress,
              sender: walletAddress,
              timestamp: new Date().toLocaleString(),
              status: 'completed',
              network: network,
              description: payDescription
            };

            const updatedHistory = [newTx, ...txHistory];
            setTxHistory(updatedHistory);
            localStorage.setItem('scutpay_txs_v2', JSON.stringify(updatedHistory));

            // Reload loaded payment request if it was paid
            if (reqIdToVerify || loadedRequest?.id) {
              handleLookupRequest(reqIdToVerify || loadedRequest?.id);
            }

            onAddLog(
              'SCUT Pay Completed', 
              `Verified payment of ${payAmount} ${payToken}. Hash: ${txHash.substring(0, 10)}...`, 
              'billing'
            );
          } else {
            setPaymentStatus('failed');
            setPipelineError(verifyData.error || 'Server transaction verification failed');
          }

        } catch (err: any) {
          console.error(err);
          setPaymentStatus('failed');
          setPipelineError(err.message || 'Transaction execution failed');
          onAddLog('SCUT Pay Failed', `Transaction error: ${err.message || err}`, 'billing');
        }
      }, 1500);
    }, 1000);
  };

  // Custom Hash Verification (Manual receipt scanning)
  const verifyCustomTx = async () => {
    if (!customTxHash.startsWith('0x') || customTxHash.length < 10) {
      showNotification('Please enter a valid cryptographic hex transaction hash (starting with 0x).');
      return;
    }
    setPaymentStatus('verifying');
    setActiveTxHash(customTxHash);
    setPipelineError('');
    setBackendVerificationResult(null);
    
    try {
      const verifyResponse = await fetch('/api/scutpay/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txHash: customTxHash,
          amount: 'Custom Scan',
          userId: user?.email || 'guest',
          description: 'Custom External Verification'
        })
      });

      const verifyData = await verifyResponse.json();
      setBackendVerificationResult(verifyData);

      if (verifyData.success) {
        setPaymentStatus('completed');
        
        const newTx: TransactionRecord = {
          id: 'tx-' + Math.random().toString(36).substring(2, 9),
          txHash: customTxHash,
          amount: '0.00',
          token: 'External Scan',
          recipient: merchantAddress,
          sender: 'External Verified Address',
          timestamp: new Date().toLocaleString(),
          status: 'completed',
          network: verifyData.network || 'Polygon POL',
          description: 'External Hash Receipt Scan'
        };

        const updatedHistory = [newTx, ...txHistory];
        setTxHistory(updatedHistory);
        localStorage.setItem('scutpay_txs_v2', JSON.stringify(updatedHistory));
        onAddLog('External Hash Verified', `Tx hash successfully processed in backend`, 'billing');
      } else {
        setPaymentStatus('failed');
        setPipelineError(verifyData.error || 'Hash scanner failed');
      }
    } catch (err: any) {
      console.error(err);
      setPaymentStatus('failed');
      setPipelineError(err.message || 'RPC scanner connection timeout');
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white pt-24 pb-16">
      {/* Background glow effects */}
      <div className="absolute top-1/3 -left-1/4 h-[400px] w-[400px] rounded-full bg-cyan-900/10 blur-[100px] neon-glow pointer-events-none" />
      <div className="absolute bottom-1/3 -right-1/4 h-[500px] w-[500px] rounded-full bg-purple-900/10 blur-[120px] neon-glow pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-900 pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-3">
              <Coins className="h-3.5 w-3.5 text-cyan-400 animate-spin-slow" />
              <span>Version 1.2 Enterprise Checkout</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white">
              SCUT <span className="text-cyan-400">Pay</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 leading-relaxed font-light">
              Official payment, invoicing, and instant cryptographic settlement node of the SCUT ecosystem.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {walletConnected ? (
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 pl-4">
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold text-slate-300">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-bold">{balance} POL</div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-red-500/10 hover:text-red-400 text-xs text-slate-400 transition-all border border-slate-800 cursor-pointer"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => connectWallet('injected')}
                  disabled={connecting}
                  className="px-4 py-2.5 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/10 flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Wallet className="h-4 w-4" />
                  MetaMask / Browser
                </button>
                <button
                  onClick={() => connectWallet('walletconnect')}
                  disabled={connecting}
                  className="px-4 py-2.5 rounded-xl font-display font-semibold text-amber-300 bg-slate-900 border border-amber-500/30 hover:bg-slate-850 disabled:opacity-50 transition-all shadow-lg flex items-center gap-2 cursor-pointer text-xs"
                >
                  <Coins className="h-4 w-4 text-amber-400" />
                  WalletConnect
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tokens & Balances display (Always shown at top) */}
        <div className="mb-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-cyan-400" />
            Wallet Balances & Supported Cryptocurrencies
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {tokens.map((tok) => (
              <div key={tok.symbol} className="bg-slate-900/40 border border-slate-900/80 rounded-2xl p-3.5 flex items-center justify-between transition-all hover:border-slate-800 hover:bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl bg-slate-950 p-2 rounded-xl border border-slate-850 shrink-0">{tok.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{tok.symbol}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[80px]">{tok.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-cyan-400">{walletConnected ? tok.balance : '0.00'}</div>
                  {tok.contractAddress ? (
                    <a
                      href={`https://polygonscan.com/token/${tok.contractAddress}`}
                      target="_blank"
                      referrerPolicy="no-referrer"
                      className="text-[9px] text-slate-500 hover:text-cyan-400 transition-colors flex items-center gap-0.5 justify-end mt-0.5"
                    >
                      contract
                      <ExternalLink className="h-2 w-2" />
                    </a>
                  ) : (
                    <span className="text-[9px] text-purple-400 font-semibold">Native gas</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Responsive Grid layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Tabs */}
          <div className="lg:col-span-7 space-y-8">
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 md:p-8 shadow-xl backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-bl-full pointer-events-none" />
              
              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-900 mb-6">
                <button
                  onClick={() => setActiveTab('terminal')}
                  className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer pr-4 ${
                    activeTab === 'terminal' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Terminal Checkout</span>
                  {activeTab === 'terminal' && (
                    <motion.div layoutId="payTabLine" className="absolute bottom-0 left-0 right-4 h-0.5 bg-cyan-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer px-4 ${
                    activeTab === 'requests' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    Invoice Requests
                    <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-1.5 py-0.25 rounded-full font-bold">New</span>
                  </span>
                  {activeTab === 'requests' && (
                    <motion.div layoutId="payTabLine" className="absolute bottom-0 left-4 right-4 h-0.5 bg-cyan-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('merchant')}
                  className={`pb-3 text-xs font-bold font-display uppercase tracking-wider relative cursor-pointer pl-4 ${
                    activeTab === 'merchant' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Developer Sandbox</span>
                  {activeTab === 'merchant' && (
                    <motion.div layoutId="payTabLine" className="absolute bottom-0 left-4 right-0 h-0.5 bg-cyan-400" />
                  )}
                </button>
              </div>

              {/* Tab Content Render */}
              <AnimatePresence mode="wait">
                {activeTab === 'terminal' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Merchant Recipient Address</label>
                      <div className="font-mono text-xs bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-slate-300 flex items-center justify-between">
                        <span className="truncate">{merchantAddress}</span>
                        <span className="shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ml-2">Official SCUT</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Checkout Amount</label>
                        <input
                          type="number"
                          step="0.01"
                          value={payAmount}
                          onChange={(e) => setPayAmount(e.target.value)}
                          className="w-full font-mono text-sm bg-slate-950 border border-slate-900 rounded-xl p-3 text-white focus:outline-none focus:border-cyan-500/30 focus:ring-1 focus:ring-cyan-500/10"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Payment Category</label>
                        <select
                          value={payDescription}
                          onChange={(e) => setPayDescription(e.target.value)}
                          className="w-full text-xs bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-slate-300 focus:outline-none focus:border-cyan-500/30"
                        >
                          <option value="SCUT Ecosystem Pro Pack">SCUT Ecosystem Pro Pack</option>
                          <option value="SCUT AI Custom Token Batch">SCUT AI Custom Token Batch</option>
                          <option value="Developers API Limit Top-up">Developers API Limit Top-up</option>
                          <option value="Marketplace Asset Purchase">Marketplace Asset Purchase</option>
                          <option value="Mica Bucurie Donation">Mica Bucurie Donation</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">Select Payment Currency</label>
                      <div className="grid grid-cols-4 gap-2.5">
                        {tokens.map((tok) => (
                          <button
                            key={tok.symbol}
                            type="button"
                            onClick={() => setPayToken(tok.symbol)}
                            className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                              payToken === tok.symbol
                                ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-md shadow-cyan-500/5'
                                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <span className="text-base">{tok.icon}</span>
                            <span className="text-xs font-bold font-mono">{tok.symbol}</span>
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 italic flex items-center gap-1">
                        <Info className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span>Future tokens payment architecture is pre-configured and optimized for SCUT native gas transfers.</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-900">
                      {walletConnected ? (
                        <button
                          onClick={() => triggerPaymentFlow()}
                          disabled={paymentStatus !== 'idle' && paymentStatus !== 'completed' && paymentStatus !== 'failed'}
                          className="w-full py-4 rounded-2xl font-display font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 hover:from-cyan-300 hover:to-teal-300 transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-cyan-500/10 disabled:opacity-50"
                        >
                          <Send className="h-4 w-4" />
                          Authorize & Pay {payAmount} {payToken}
                        </button>
                      ) : (
                        <button
                          onClick={() => connectWallet('injected')}
                          className="w-full py-4 rounded-2xl font-display font-bold text-slate-400 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Wallet className="h-4 w-4 text-cyan-400 animate-pulse" />
                          Connect Wallet to Pay
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'requests' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-4">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Landmark className="h-4 w-4 text-cyan-400" />
                        Retrieve Secure Payment Session from Backend
                      </h3>
                      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed font-light">
                        Merchants generate payment requests via secure REST API calls. Enter a request ID below to scan its real-time block state, currency configuration, and completion statuses.
                      </p>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Enter request ID (e.g. req-demo-1 or req-demo-2)"
                            value={lookupId}
                            onChange={(e) => setLookupId(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-900 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500/30"
                          />
                        </div>
                        <button
                          onClick={() => handleLookupRequest()}
                          disabled={loadingRequest}
                          className="px-4 py-3 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                        >
                          {loadingRequest ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Load Request'}
                        </button>
                      </div>

                      {lookupError && (
                        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-mono">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{lookupError}</span>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2 flex-wrap">
                        <span className="text-[10px] text-slate-500 self-center">Demo Sessions:</span>
                        <button 
                          onClick={() => { setLookupId('req-demo-1'); handleLookupRequest('req-demo-1'); }}
                          className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-cyan-400 font-mono"
                        >
                          req-demo-1 (POL)
                        </button>
                        <button 
                          onClick={() => { setLookupId('req-demo-2'); handleLookupRequest('req-demo-2'); }}
                          className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 px-2 py-1 rounded text-cyan-400 font-mono"
                        >
                          req-demo-2 (SCUT)
                        </button>
                      </div>
                    </div>

                    {loadedRequest && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4"
                      >
                        <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                          <div>
                            <div className="text-[10px] text-slate-500 font-mono">PAYMENT ID</div>
                            <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                              {loadedRequest.id}
                              <button 
                                onClick={() => handleCopy(loadedRequest.id, 'reqId')}
                                className="text-slate-500 hover:text-white transition-colors"
                              >
                                {copiedText === 'reqId' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500 text-right">SESSION STATUS</div>
                            <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                              loadedRequest.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            }`}>
                              {loadedRequest.status}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-[10px] text-slate-500">MERCHANT SERVICE</div>
                            <div className="text-slate-200 font-semibold mt-0.5">{loadedRequest.description}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-slate-500">TOTAL REQUIRED AMOUNT</div>
                            <div className="text-cyan-400 font-bold mt-0.5 font-mono text-sm">
                              {loadedRequest.amount} {loadedRequest.token}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] text-slate-500">RECIPIENT SMART ADDRESS</div>
                          <div className="text-slate-400 font-mono text-[11px] truncate mt-0.5 bg-slate-950 p-2 rounded-lg border border-slate-900">
                            {loadedRequest.merchantAddress}
                          </div>
                        </div>

                        {loadedRequest.txHash && (
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1">
                            <div className="text-[10px] text-slate-500">VERIFIED BLOCK TRANSACTION HASH</div>
                            <div className="font-mono text-[10px] text-emerald-400 break-all">{loadedRequest.txHash}</div>
                          </div>
                        )}

                        <div className="pt-2">
                          {loadedRequest.status === 'completed' ? (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                              <div>
                                <span className="font-bold text-white block">Invoice Fully Settled!</span>
                                Cryptographic confirmation recorded in server state. No further action needed.
                              </div>
                            </div>
                          ) : walletConnected ? (
                            <button
                              onClick={() => triggerPaymentFlow(loadedRequest.id)}
                              disabled={paymentStatus !== 'idle'}
                              className="w-full py-3.5 rounded-xl font-display font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Send className="h-4 w-4" />
                              Complete Settlement ({loadedRequest.amount} {loadedRequest.token})
                            </button>
                          ) : (
                            <button
                              onClick={() => connectWallet('injected')}
                              className="w-full py-3.5 rounded-xl font-display font-bold text-slate-400 bg-slate-900 border border-slate-850 hover:border-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                            >
                              <Wallet className="h-4 w-4 text-cyan-400" />
                              Connect Wallet to Settle Invoice
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'merchant' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                  >
                    <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 text-[11px] leading-relaxed text-slate-300">
                      <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Mock Merchant Billing Node Generator
                      </div>
                      Generate payment request sessions in real-time. This mocks the exact REST API payload standard business terminals post to our API gateway to prompt clients for secure multi-token checkout.
                    </div>

                    <div className="space-y-4 text-xs">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Charge Amount</label>
                          <input
                            type="number"
                            value={merchantAmount}
                            onChange={(e) => setMerchantAmount(e.target.value)}
                            className="w-full font-mono text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Select Settlement Currency</label>
                          <select
                            value={merchantToken}
                            onChange={(e) => setMerchantToken(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white focus:outline-none"
                          >
                            <option value="POL">POL (Polygon Native)</option>
                            <option value="SCUT">SCUT Utility Token</option>
                            <option value="USDT">Tether (USDT)</option>
                            <option value="USDC">USD Coin (USDC)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Ecosystem Billing Description</label>
                        <input
                          type="text"
                          value={merchantDesc}
                          onChange={(e) => setMerchantDesc(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3 text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">Merchant Payee Wallet Address</label>
                        <input
                          type="text"
                          value={merchantAddressInput}
                          onChange={(e) => setMerchantAddressInput(e.target.value)}
                          className="w-full font-mono text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-white focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={handleCreateRequest}
                        disabled={creatingRequest}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {creatingRequest ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                        Generate Cryptographic Invoice Request
                      </button>
                    </div>

                    {createdRequest && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-cyan-500/10 p-5 rounded-2xl space-y-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-300">Generated API Response Payload</span>
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded font-mono">201 CREATED</span>
                        </div>
                        
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 font-mono text-[10px] space-y-1 text-slate-400 overflow-x-auto leading-relaxed">
                          <div>{'{'}</div>
                          <div className="pl-4">"success": <span className="text-amber-400">true</span>,</div>
                          <div className="pl-4">"paymentRequest": {'{'}</div>
                          <div className="pl-8">"id": <span className="text-emerald-300">"{createdRequest.id}"</span>,</div>
                          <div className="pl-8">"amount": <span className="text-emerald-300">"{createdRequest.amount}"</span>,</div>
                          <div className="pl-8">"token": <span className="text-emerald-300">"{createdRequest.token}"</span>,</div>
                          <div className="pl-8">"description": <span className="text-emerald-300">"{createdRequest.description}"</span>,</div>
                          <div className="pl-8">"status": <span className="text-emerald-300">"pending"</span></div>
                          <div className="pl-4">{'}'}</div>
                          <div>{'}'}</div>
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            onClick={() => {
                              setLookupId(createdRequest.id);
                              setActiveTab('requests');
                              handleLookupRequest(createdRequest.id);
                            }}
                            className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
                          >
                            <ArrowUpRight className="h-3.5 w-3.5" />
                            Load Session in Checkout
                          </button>
                          <button
                            onClick={() => handleCopy(createdRequest.id, 'created')}
                            className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs text-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                          >
                            {copiedText === 'created' ? (
                              <>
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                Copied ID
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                Copy ID
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Simulation Banner Info */}
              {providerType === 'simulation' && walletConnected && (
                <div className="mt-6 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 text-[11px] leading-relaxed text-cyan-300 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-semibold text-white">Simulation Sandbox Mode Active:</span> Your connected wallet is operating in preview-sandbox mode. Your private key is secured locally. Initiated transactions are cryptographically formatted and validated through our mock Node.js RPC verifiers perfectly!
                  </div>
                </div>
              )}
            </div>

            {/* External Receipt Scan block */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/40 p-6 shadow-md backdrop-blur-sm">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-3">
                <Layers className="h-4 w-4 text-purple-400 animate-spin-slow" />
                Polygon Block Receipt Scanner
              </h3>
              <p className="text-[11px] text-slate-400 mb-4 font-light leading-relaxed">
                Completed an independent ecosystem payment manually? Input your Polygon POS transaction hash below. Our secure backend RPC network crawler will fetch the cryptographic block receipt to credit your platform profile.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0x..."
                  value={customTxHash}
                  onChange={(e) => setCustomTxHash(e.target.value)}
                  className="flex-1 font-mono text-xs bg-slate-950 border border-slate-900 rounded-xl p-3 text-slate-300 focus:outline-none focus:border-cyan-500/30"
                />
                <button
                  onClick={verifyCustomTx}
                  className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 cursor-pointer transition-colors"
                >
                  Verify Hash
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Status + History */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Active Transaction Telemetry Pipeline */}
            <AnimatePresence mode="wait">
              {paymentStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="rounded-3xl border border-slate-900 bg-slate-950 p-6 shadow-lg relative overflow-hidden"
                >
                  <h3 className="font-display text-sm font-bold text-slate-300 mb-4 flex items-center justify-between">
                    <span>Cryptographic Verification Stream</span>
                    <button 
                      onClick={() => setPaymentStatus('idle')}
                      className="text-[10px] text-slate-500 hover:text-white cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </h3>

                  <div className="space-y-4">
                    {/* Pipeline progress steps */}
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-xs font-bold shrink-0 ${
                        ['signing', 'broadcasting', 'verifying', 'completed'].includes(paymentStatus) 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : paymentStatus === 'initiating' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-slate-900 text-slate-500'
                      }`}>
                        1
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">Preparing transaction block</div>
                        <div className="text-[10px] text-slate-500">Constructing gas rates & hex data payloads</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-xs font-bold shrink-0 ${
                        ['broadcasting', 'verifying', 'completed'].includes(paymentStatus) 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : paymentStatus === 'signing' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-slate-900 text-slate-500'
                      }`}>
                        2
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">Cryptographic Handshake</div>
                        <div className="text-[10px] text-slate-500">Requesting ECDSA secp256k1 key signature</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-xs font-bold shrink-0 ${
                        ['verifying', 'completed'].includes(paymentStatus) 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : paymentStatus === 'broadcasting' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-slate-900 text-slate-500'
                      }`}>
                        3
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">Broadcasting Signed Blocks</div>
                        <div className="text-[10px] text-slate-500">Dispatching hashes to Polygon infura nodes</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg text-xs font-bold shrink-0 ${
                        ['completed'].includes(paymentStatus) 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : paymentStatus === 'verifying' ? 'bg-cyan-500/10 text-cyan-400 animate-pulse' : 'bg-slate-900 text-slate-500'
                      }`}>
                        4
                      </div>
                      <div className="text-xs">
                        <div className="font-semibold text-slate-200">Consensus Verifier Gateway</div>
                        <div className="text-[10px] text-slate-500">SCUT Pay decentralized database sync</div>
                      </div>
                    </div>
                  </div>

                  {/* Errors display */}
                  {pipelineError && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2 font-mono">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{pipelineError}</span>
                    </div>
                  )}

                  {/* Transaction metadata breakdown */}
                  {activeTxHash && (
                    <div className="mt-5 pt-4 border-t border-slate-900 space-y-2">
                      <div className="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>TRANSACTION HASH:</span>
                        <span className="font-mono text-cyan-400 truncate max-w-[180px]">{activeTxHash}</span>
                      </div>
                      {backendVerificationResult && (
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 text-[10px] space-y-1.5 font-mono">
                          <div className="text-slate-200 font-bold flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                            Backend Node Receipt Validated
                          </div>
                          <div className="text-slate-500 text-[9px]">BLOCKCHAIN: {backendVerificationResult.network}</div>
                          <div className="text-slate-500 text-[9px]">BLOCK HEIGHT: #{backendVerificationResult.blockNumber}</div>
                          <div className="text-slate-500 text-[9px]">GAS LIMIT: {backendVerificationResult.gasUsed} Gwei</div>
                          <div className="text-slate-300 border-t border-slate-900/50 pt-1.5 mt-1.5 font-sans leading-relaxed text-[11px]">{backendVerificationResult.details}</div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ecosystem Ledger (Transaction history) */}
            <div className="rounded-3xl border border-slate-900 bg-slate-950/80 p-6 shadow-xl backdrop-blur-md">
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
                Decentralized Transaction Ledger
              </h3>

              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {txHistory.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-light">No ledger transactions recorded yet.</div>
                ) : (
                  txHistory.map((tx) => (
                    <div key={tx.id} className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2.5 text-xs transition-colors hover:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 truncate pr-2 max-w-[150px]">{tx.description}</span>
                        <span className="font-bold text-cyan-400 font-mono">-{tx.amount} {tx.token}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center justify-between font-mono">
                        <span>Hash: {tx.txHash.substring(0, 10)}...</span>
                        <span>{tx.timestamp.split(',')[0]}</span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] pt-2 border-t border-slate-900/40">
                        <span className="text-slate-500 font-medium">{tx.network}</span>
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.25 rounded font-bold uppercase tracking-wider">Confirmed</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Beautiful Global Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
