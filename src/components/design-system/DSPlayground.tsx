/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Button, Input, TextArea, Select, Toggle, Checkbox, Slider, 
  Card, GlowCard, BentoCard, MetricCard, Badge, Avatar, AvatarGroup, 
  Modal, Dropdown, Tabs, Table, AreaChartWidget, Notification, Skeleton, 
  EmptyState, ErrorState, ChatBubble, ChatInputBar, PricingCard, ProfileWidget, 
  SettingsGroup, Sidebar, Navbar 
} from './DSComponents';
import { 
  Cpu, Sparkles, Key, Activity, Shield, Coins, ShoppingBag, 
  MessageSquare, User, HelpCircle, FileText, CheckCircle, Code, Copy, 
  Terminal, Layers, AlertCircle, RefreshCw, Send, Image, Trash, Check, Info, Settings
} from 'lucide-react';

export default function DSPlayground({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [activeTab, setActiveTab] = useState('getting-started');
  
  // Interactive Component States
  // Buttons Tab
  const [isBtnLoading, setIsBtnLoading] = useState(false);
  const [btnValue, setBtnValue] = useState('Active user input');
  
  // Inputs Tab
  const [textInput, setTextInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [sliderVal, setSliderVal] = useState(50);
  const [toggleVal, setToggleVal] = useState(true);
  const [checkVal, setCheckVal] = useState(false);
  
  // Modals & Feedback Tab
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; type: 'success' | 'warning' | 'error' | 'info'; title: string; message: string }[]>([
    { id: '1', type: 'success', title: 'Smart Contract Compiled', message: 'The SCUT AI token contract compiled with zero warnings.' },
    { id: '2', type: 'info', title: 'System Synchronized', message: 'Decentralized Oracle feed refreshed successfully.' }
  ]);
  
  // Chat Tab
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', role: 'assistant' as const, content: 'Welcome to the SCUT AI playground! Choose a prompt below to see me analyze blockchain nodes.', timestamp: '10:42 AM', tokens: 42 },
    { id: '2', role: 'user' as const, content: 'Can you audit the gas cost of the SCUT Pay module?', timestamp: '10:43 AM' },
  ]);

  // Sidebar navigation sim
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarActive, setSidebarActive] = useState('dashboard');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2000);
  };

  // Pre-configured snippets for documentation
  const snippets = {
    button: `<Button variant="glow" size="md" icon={Sparkles}>
  Verify Blockchain Node
</Button>`,
    input: `<Input 
  label="API Access Key" 
  placeholder="sk-scut-..." 
  icon={Key} 
  error={inputError}
/>`,
    metricCard: `<MetricCard 
  title="Network Hash Rate" 
  value="184.5 GH/s" 
  trend={{ value: 12.4, isPositive: true }} 
  icon={Activity} 
/>`,
    glowCard: `<GlowCard>
  <h4 className="text-sm font-bold text-white">Quantum Node</h4>
  <p className="text-xs text-slate-400">Secured with deep blue/cyan light glows.</p>
</GlowCard>`,
    chatBubble: `<ChatBubble 
  role="assistant" 
  name="SCUT Core AI" 
  content="Decentralized smart contracts compiled..." 
  timestamp="12:45 PM" 
  tokens={142}
/>`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
      {/* Simulation Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        activeItem={sidebarActive} 
        onNavigate={(id) => setSidebarActive(id)} 
        items={[
          { id: 'dashboard', label: 'Playground Dash', icon: Cpu, badge: '9+' },
          { id: 'wallet', label: 'Wallet Sync', icon: Coins },
          { id: 'developers', label: 'API Keys', icon: Key },
          { id: 'security', label: 'Security Center', icon: Shield },
        ]}
        user={{
          name: 'Gabriel Paduraru',
          email: 'contact.gabrielpaduraru@gmail.com',
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen overflow-hidden">
        {/* Navbar Simulation */}
        <Navbar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          title="SCUT AI Design System Playground"
          onNotificationClick={() => {
            alert('Notifications panel active!');
          }}
          onProfileClick={() => {
            alert('User Profile Panel action');
          }}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl w-full mx-auto pb-24">
          
          {/* Cover Hero Branding Block */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-950 border border-slate-900 p-8 sm:p-10">
            <div className="absolute top-0 right-0 h-64 w-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
            
            <div className="max-w-2xl space-y-3 relative z-10">
              <Badge variant="cyan" size="md">Unique SCUT AI Identity</Badge>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
                Universal Premium Design System
              </h1>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                A custom suite of production-ready, highly accessible, and visually striking React components designed strictly for the SCUT platform. Built with deep blue/cyan hues, premium glassmorphism, responsive flexibility, and smooth layouts.
              </p>
              
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Button variant="primary" size="sm" icon={Terminal} onClick={() => setActiveTab('buttons')}>
                  Browse Components
                </Button>
                {onNavigate && (
                  <Button variant="outline" size="sm" onClick={() => onNavigate('home')}>
                    Back to Platform Home
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selector Section */}
          <div className="border-b border-slate-900">
            <Tabs 
              tabs={[
                { id: 'getting-started', label: 'Getting Started', icon: Layers },
                { id: 'buttons', label: 'Buttons & Input Controls', icon: Code },
                { id: 'cards', label: 'Cards & Grid Layouts', icon: ShoppingBag },
                { id: 'feedback', label: 'Feedback, Modals & Triggers', icon: AlertCircle },
                { id: 'chat-widgets', label: 'AI Chat Ecosystem', icon: MessageSquare },
                { id: 'data-displays', label: 'Data Display & Charts', icon: Activity },
              ]} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
              variant="line"
            />
          </div>

          {/* -------------------- 1. GETTING STARTED TAB -------------------- */}
          {activeTab === 'getting-started' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-cyan-400" /> Color Guidelines
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    The SCUT AI identity utilizes high-contrast slate levels, layered with glowing cyan borders and soft deep-blue translucent radial shadows.
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-900 text-center">
                      <div className="h-8 rounded bg-slate-950 border border-slate-800 mb-1" />
                      <span className="text-[10px] font-mono block font-bold">SLATE 950</span>
                      <span className="text-[9px] text-slate-500 block">#020617</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="h-8 rounded bg-slate-900 mb-1" />
                      <span className="text-[10px] font-mono block font-bold">SLATE 900</span>
                      <span className="text-[9px] text-slate-500 block">#0f172a</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-900/30 border border-blue-900/40 text-center">
                      <div className="h-8 rounded bg-blue-600 mb-1 shadow-md shadow-blue-600/25" />
                      <span className="text-[10px] font-mono block font-bold">DEEP BLUE</span>
                      <span className="text-[9px] text-slate-500 block">#2563eb</span>
                    </div>
                    <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-center">
                      <div className="h-8 rounded bg-cyan-500 mb-1 shadow-md shadow-cyan-500/25" />
                      <span className="text-[10px] font-mono block font-bold">NEON CYAN</span>
                      <span className="text-[9px] text-slate-500 block">#06b6d4</span>
                    </div>
                  </div>
                </Card>

                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <Cpu className="h-4.5 w-4.5 text-cyan-400" /> Typography Matrix
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    We use a strict font split: <strong>Inter / Sans</strong> for responsive, clear controls and readability, paired with <strong>JetBrains Mono</strong> for stats, hash values, wallet details, and terminal operations.
                  </p>
                  
                  <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 font-mono text-xs">
                    <div className="flex justify-between border-b border-slate-900 pb-1.5">
                      <span className="text-slate-500">sans-serif</span>
                      <span className="text-white font-sans">Inter font UI family</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-500">monospace</span>
                      <span className="text-cyan-400">JetBrains Mono data</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Bento Grid Design Pattern Highlight */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 font-mono text-left">Bento-Grid Showcase</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BentoCard accent="cyan" title="Autonomous Trading Bots" description="SCUT AI trains decentralized agents in real-time.">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono text-cyan-400">ACTIVE MODELS</span>
                      <Badge variant="cyan">4 Online</Badge>
                    </div>
                  </BentoCard>
                  <BentoCard accent="blue" title="SCUT Pay Ledger" description="Multi-currency gateway supporting automatic splits.">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono text-blue-400">AVERAGE SPEED</span>
                      <Badge variant="blue">0.4 sec</Badge>
                    </div>
                  </BentoCard>
                  <BentoCard accent="rose" title="Women & Girls Safety Network" description="Encrypted chat rooms and active emergency tokens.">
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-mono text-rose-400">REPORTS LOGGED</span>
                      <Badge variant="rose">Encrypted</Badge>
                    </div>
                  </BentoCard>
                </div>
              </div>
            </div>
          )}

          {/* -------------------- 2. BUTTONS & INPUT CONTROLS TAB -------------------- */}
          {activeTab === 'buttons' && (
            <div className="space-y-8">
              
              {/* Buttons Panel */}
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Responsive Button Matrix</h3>
                  <p className="text-xs text-slate-500 mt-1">Different visually striking variants supporting custom indicators, loading spinners, and glowing states.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary">Primary Cyan</Button>
                  <Button variant="secondary">Secondary Blue</Button>
                  <Button variant="outline">Outline Grey</Button>
                  <Button variant="ghost">Ghost State</Button>
                  <Button variant="danger">Danger Action</Button>
                  <Button variant="glow" icon={Sparkles}>Neon Glow</Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-slate-900 pt-4">
                  <Button variant="primary" size="sm" icon={Cpu}>Small Bot</Button>
                  <Button variant="glow" size="md" icon={Coins} isLoading={isBtnLoading} onClick={() => {
                    setIsBtnLoading(true);
                    setTimeout(() => setIsBtnLoading(false), 2000);
                  }}>
                    Interactive Click Loader
                  </Button>
                  <Button variant="secondary" size="lg" icon={Activity} iconPosition="right">
                    Large Trend
                  </Button>
                </div>

                {/* Code snippets disclosure */}
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">React Button Code Snippet</span>
                    <button 
                      onClick={() => copyToClipboard(snippets.button, 'btn-snip')} 
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSnippet === 'btn-snip' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedSnippet === 'btn-snip' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="text-[11px] font-mono text-cyan-400 leading-normal overflow-x-auto select-all">
                    {snippets.button}
                  </pre>
                </div>
              </Card>

              {/* Form Input Controls */}
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Form & Control Variables</h3>
                  <p className="text-xs text-slate-500 mt-1">Production-ready interactive fields with elegant focus glow borders and validation support.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Input 
                      label="Custom API key input" 
                      placeholder="sk-scutai-xxxx..." 
                      icon={Key} 
                      value={textInput}
                      onChange={(e) => {
                        setTextInput(e.target.value);
                        if (e.target.value.length > 0 && e.target.value.length < 8) {
                          setInputError('API Key must be at least 8 characters');
                        } else {
                          setInputError('');
                        }
                      }}
                      error={inputError}
                    />
                    
                    <Select 
                      label="Subscription Tier Filter" 
                      options={[
                        { value: 'free', label: 'Free Tier (10 Chats/Day)' },
                        { value: 'pro', label: 'Pro AI Architect' },
                        { value: 'business', label: 'Enterprise Suite' },
                      ]} 
                    />
                  </div>

                  <div className="space-y-5 bg-slate-950/40 p-5 rounded-2xl border border-slate-900">
                    <span className="text-[10px] font-bold font-mono text-slate-500 block uppercase">Continuous Sliders & Toggles</span>
                    
                    <Slider 
                      min={0} 
                      max={100} 
                      value={sliderVal} 
                      onChange={setSliderVal} 
                      label="SCUT AI Model Temperature" 
                      valueLabelSuffix="°C"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <Toggle 
                        checked={toggleVal} 
                        onChange={setToggleVal} 
                        label="Auto Gas Token Swap" 
                        description="Automatically converts ERC20." 
                      />
                      
                      <Checkbox 
                        checked={checkVal} 
                        onChange={setCheckVal} 
                        label="I accept all decentralized risk disclosures and audits." 
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* -------------------- 3. CARDS & GRID LAYOUTS TAB -------------------- */}
          {activeTab === 'cards' && (
            <div className="space-y-8">
              
              {/* Metric indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                  title="SCUT Wallet Balance" 
                  value="12,482.40 SCUT" 
                  subtext="Synced with Ethereum Node"
                  trend={{ value: 4.8, isPositive: true }} 
                  icon={Coins} 
                />
                <MetricCard 
                  title="AI Audit Run Count" 
                  value="942,012" 
                  subtext="Smart Contract Analysis"
                  trend={{ value: 24.1, isPositive: true }} 
                  icon={Cpu} 
                />
                <MetricCard 
                  title="API Keys Registered" 
                  value="14 Active" 
                  subtext="Across 3 development apps"
                  icon={Key} 
                />
                <MetricCard 
                  title="Platform Safe Score" 
                  value="99.98%" 
                  subtext="0 malicious attacks logged"
                  trend={{ value: 0.02, isPositive: true }} 
                  icon={Shield} 
                />
              </div>

              {/* Glowing Interactive Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlowCard className="space-y-4">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Shield className="h-5 w-5" />
                    <h4 className="text-sm font-bold text-white tracking-tight">Decentralized Threat Vault</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    This card is a <code>GlowCard</code>. Hover over it to experience the responsive cyan vector illumination background that follows user boundaries seamlessly. Excellent for premium highlight elements.
                  </p>
                  <Button variant="glow" size="sm" className="w-fit">Audit Vault</Button>
                </GlowCard>

                <Card className="space-y-4 text-left">
                  <h4 className="text-sm font-bold text-white tracking-tight">Standard Premium Slate Card</h4>
                  <p className="text-xs text-slate-400 font-light leading-relaxed">
                    Our standard card template utilizes a subtle translucent glass overlay using Tailwind's standard border boundaries and rich inner margins. It maintains high UI consistency.
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar name="Jane Doe" status="busy" />
                    <div>
                      <span className="text-xs font-bold block text-slate-200">Jane Doe</span>
                      <span className="text-[10px] text-slate-500 block font-mono">SCUT Core Dev</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* -------------------- 4. FEEDBACK, MODALS & TRIGGERS TAB -------------------- */}
          {activeTab === 'feedback' && (
            <div className="space-y-8">
              
              {/* Notification & Toast Systems */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight">Toast Notification System</h3>
                  <p className="text-xs text-slate-500">Toast designs for alerts, successes, warnings, and generic platform feedback notifications.</p>
                  
                  <div className="space-y-3.5">
                    {notifications.map((notif) => (
                      <Notification 
                        key={notif.id}
                        id={notif.id}
                        type={notif.type}
                        title={notif.title}
                        message={notif.message}
                        onClose={(id) => {
                          setNotifications(notifications.filter((n) => n.id !== id));
                        }}
                      />
                    ))}
                    
                    {notifications.length === 0 && (
                      <Button variant="outline" size="sm" onClick={() => setNotifications([
                        { id: '1', type: 'success', title: 'Smart Contract Compiled', message: 'The SCUT AI token contract compiled with zero warnings.' },
                        { id: '2', type: 'info', title: 'System Synchronized', message: 'Decentralized Oracle feed refreshed successfully.' }
                      ])}>
                        Re-generate Alerts
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Skeletons loader demonstration */}
                <Card className="space-y-4">
                  <h3 className="text-base font-bold text-white tracking-tight">Skeleton Loaders</h3>
                  <p className="text-xs text-slate-500">Shimmering layouts used during deep AI responses or pending smart-contract confirmation states.</p>
                  
                  <div className="p-5 border border-slate-900 bg-slate-950 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3 w-1/3" />
                        <Skeleton className="h-2 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-2.5 w-1/4" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Modals trigger demonstration */}
              <Card className="space-y-5 text-center py-10">
                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Modals & Dropdowns Drawer</h3>
                  <p className="text-xs text-slate-400">Accessible fullscreen modals with spring animations and background backdrop filter blur effects.</p>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button variant="glow" onClick={() => setIsModalOpen(true)}>
                    Trigger Demo Modal
                  </Button>
                  
                  <Dropdown 
                    trigger={<Button variant="outline">Interactive Dropdown Menu</Button>} 
                    items={[
                      { id: 'edit', label: 'Edit API Key', icon: Settings, onClick: () => alert('Edit Key Action') },
                      { id: 'admin', label: 'Admin Override', icon: Shield, onClick: () => alert('Admin Override Activated') },
                      { id: 'delete', label: 'Revoke Key Credentials', icon: Trash, danger: true, onClick: () => alert('Credentials Revoked') },
                    ]} 
                  />
                </div>

                <Modal 
                  isOpen={isModalOpen} 
                  onClose={() => setIsModalOpen(false)} 
                  title="Verify Smart Contract Credentials"
                  size="md"
                >
                  <div className="space-y-4 text-left">
                    <p className="text-xs text-slate-400 leading-relaxed font-light">
                      Please audit the transaction hash details below before approving the Gas Fee release inside SCUT Pay. Once executed, blocks cannot be modified.
                    </p>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">TX HASH:</span> <span className="text-cyan-400">0x84f9...f042</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">FROM:</span> <span className="text-slate-300">SCUT Platform Core</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">GAS FEE:</span> <span className="text-emerald-400">0.0042 ETH</span></div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-900">
                      <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                      <Button variant="primary" size="sm" onClick={() => {
                        setIsModalOpen(false);
                        alert('Smart contract verified and pushed to ledger!');
                      }}>Verify Ledger</Button>
                    </div>
                  </div>
                </Modal>
              </Card>

              {/* Empty State, Error State designs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EmptyState 
                  title="No Oracles Synced" 
                  description="You have not integrated any external decentralized data sources inside your project structure yet." 
                  icon={RefreshCw} 
                  actionLabel="Integrate Oracle"
                  onAction={() => alert('Oracle syncing process initiated...')}
                />
                
                <ErrorState 
                  title="Gas Audit Failure" 
                  message="The smart contract compiled correctly, but failed during mock deployment testing due to out-of-gas errors." 
                  details={`Deployment aborted at VM index 428.\nERROR: OUT_OF_GAS_RELEASE_V1\nCOMPILER: tsc v5.8.2\nGAS_LIMIT_EXCEEDED`}
                  onRetry={() => alert('Retrying gas calculations with a higher limit...')}
                />
              </div>
            </div>
          )}

          {/* -------------------- 5. AI CHAT ECOSYSTEM TAB -------------------- */}
          {activeTab === 'chat-widgets' && (
            <div className="space-y-6">
              <Card className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">AI Chat Components</h3>
                  <p className="text-xs text-slate-500 mt-1">Simulate a conversation with SCUT Core AI Engine using these beautifully tailored bubble cards.</p>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                  {chatMessages.map((msg) => (
                    <ChatBubble 
                      key={msg.id}
                      role={msg.role}
                      content={msg.content}
                      timestamp={msg.timestamp}
                      name={msg.role === 'user' ? 'User Developer' : 'SCUT Core AI'}
                      tokens={msg.tokens}
                    />
                  ))}
                </div>

                <div className="border-t border-slate-900 pt-4">
                  <ChatInputBar 
                    value={chatInput} 
                    onChange={setChatInput} 
                    onSubmit={() => {
                      if (chatInput.trim() === '') return;
                      const userMsg = { id: Date.now().toString(), role: 'user' as const, content: chatInput, timestamp: 'Just now' };
                      setChatMessages([...chatMessages, userMsg]);
                      setChatInput('');
                      
                      // Mock response
                      setTimeout(() => {
                        const botMsg = { id: (Date.now()+1).toString(), role: 'assistant' as const, content: 'Executing query on decentralized Ledger...', timestamp: 'Just now', tokens: 88 };
                        setChatMessages((prev) => [...prev, botMsg]);
                      }, 1000);
                    }}
                    placeholder="Ask SCUT AI to audit contracts..."
                    chips={[
                      'Explain SCUT Tokenomics',
                      'Audit my compiled contract',
                      'How is data protected on SCUT Women?',
                    ]}
                  />
                </div>
              </Card>

              {/* Profile Card & Pricing Columns compound display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileWidget 
                  name="Gabriel Paduraru" 
                  email="contact.gabrielpaduraru@gmail.com" 
                  tier="Pro AI Architect" 
                  stats={[
                    { label: 'Audits', value: 142 },
                    { label: 'Chats Left', value: '450/500' },
                    { label: 'Sync nodes', value: 4 }
                  ]}
                  bio="Full Stack Developer focused on compiling AI algorithms with high-performance Web3 blockchain networks."
                />

                <PricingCard 
                  tier="Pro AI Architect" 
                  price="$29" 
                  description="For individual developers and Web3 startup founders demanding unlimited smart contract audits."
                  features={[
                    'Priority GPU pipeline queues',
                    'Unlimited smart-contract gas audit runs',
                    'Full support for multi-sig payouts',
                    'SCUT Women platform integration access',
                  ]}
                  isPopular={true}
                  ctaText="Upgrade to Architect"
                  onCtaClick={() => alert('Pricing payment trigger!')}
                />
              </div>
            </div>
          )}

          {/* -------------------- 6. DATA DISPLAY & CHARTS TAB -------------------- */}
          {activeTab === 'data-displays' && (
            <div className="space-y-6">
              
              {/* Table System */}
              <Card className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Oracle Ledger Audit Logs</h3>
                  <p className="text-xs text-slate-500">Striped tables with premium contrast highlighting and status tag indicators.</p>
                </div>

                <Table 
                  headers={['TRANSACTION DATE', 'TYPE', 'GAS PAID', 'LEDGER STATUS']}
                  rows={[
                    [
                      <span className="font-mono text-slate-400">2026-07-18</span>,
                      <span className="font-bold text-white">ERC-20 Token Payout</span>,
                      <span className="font-mono text-cyan-400">0.0024 ETH</span>,
                      <Badge variant="emerald">Confirmed</Badge>
                    ],
                    [
                      <span className="font-mono text-slate-400">2026-07-17</span>,
                      <span className="font-bold text-white">AI Safety Check Run</span>,
                      <span className="font-mono text-slate-500">Free Tier</span>,
                      <Badge variant="cyan">Safe</Badge>
                    ],
                    [
                      <span className="font-mono text-slate-400">2026-07-16</span>,
                      <span className="font-bold text-white">Database Encryption Sync</span>,
                      <span className="font-mono text-cyan-400">0.0012 ETH</span>,
                      <Badge variant="rose">Delayed</Badge>
                    ],
                  ]}
                />
              </Card>

              {/* Area Chart visualization using Recharts */}
              <Card className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">AI Token Consumption Trends</h3>
                    <p className="text-xs text-slate-500 mt-1">Visual representation of daily token usage metrics over the last 6 days.</p>
                  </div>
                  <Badge variant="cyan">Avg: 310k TS</Badge>
                </div>

                <AreaChartWidget 
                  data={[
                    { name: 'Mon', value: 120 },
                    { name: 'Tue', value: 240 },
                    { name: 'Wed', value: 180 },
                    { name: 'Thu', value: 380 },
                    { name: 'Fri', value: 420 },
                    { name: 'Sat', value: 310 },
                  ]}
                  gradientColor="#06b6d4"
                  id="primary-cyan-playground"
                />
              </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
