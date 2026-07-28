/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, MessageSquare, Sparkles, Video, Volume2, FileText, 
  LayoutDashboard, Globe, GraduationCap, Terminal, Cpu, Sliders, BookOpen, UserSquare,
  ChevronRight, Sparkle, Menu, X
} from 'lucide-react';

import ScutChatPage from './ScutChatPage';
import ChatWorkspace from './ChatWorkspace';
import ImageStudioPage from './ImageStudioPage';
import VoiceAiPage from './VoiceAiPage';
import AiSuitePages from './AiSuitePages';
import AiModelsPage from './AiModelsPage';
import PromptLibraryPage from './PromptLibraryPage';

interface ScutAiHubProps {
  user: any;
  chats: any[];
  folders: any[];
  activeChatId: string | null;
  onSelectChat: (id: string | null) => void;
  onCreateChat: (model?: string) => string;
  onDeleteChat: (id: string) => Promise<void>;
  onRenameChat: (id: string, title: string) => Promise<void>;
  onToggleFavorite: (id: string) => Promise<void>;
  onSendMessage: (chatId: string, content: string, attachment?: any, model?: string, searchGrounding?: boolean) => Promise<void>;
  onRegenerateMessage: (chatId: string) => Promise<void>;
  isGenerating: boolean;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
  onCreateFolder: (name: string) => Promise<void>;
  onDeleteFolder: (id: string) => Promise<void>;
  onMoveChatToFolder: (chatId: string, folderId: string | null) => Promise<void>;
  onTogglePinChat: (chatId: string) => Promise<void>;
  onToggleArchiveChat: (chatId: string) => Promise<void>;
  onDeleteMessage: (chatId: string, messageId: string) => Promise<void>;
  onEditMessage: (chatId: string, messageId: string, newContent: string) => Promise<void>;
  onStopGeneration: () => void;
  initialSubTab?: string;
}

export default function ScutAiHub({
  user, chats, folders, activeChatId, onSelectChat, onCreateChat, onDeleteChat,
  onRenameChat, onToggleFavorite, onSendMessage, onRegenerateMessage, isGenerating,
  onNavigate, onAddLog, onCreateFolder, onDeleteFolder, onMoveChatToFolder,
  onTogglePinChat, onToggleArchiveChat, onDeleteMessage, onEditMessage, onStopGeneration,
  initialSubTab = 'ai_chat'
}: ScutAiHubProps) {
  const [activeTab, setActiveTab] = useState<string>(initialSubTab);
  const [subSidebarOpen, setSubSidebarOpen] = useState(false);

  // Sync subTab if initialSubTab changes
  useEffect(() => {
    setActiveTab(initialSubTab);
  }, [initialSubTab]);

  const aiTools = [
    { id: 'ai_chat', name: 'AI Chat (SCUT Chat)', desc: 'Real-time multi-person & group AI channels', icon: MessageSquare, color: 'text-cyan-400 bg-cyan-500/10' },
    { id: 'assistant', name: 'AI Assistant', desc: 'Secure full-screen Gemini playground & code sandbox', icon: Bot, color: 'text-purple-400 bg-purple-500/10' },
    { id: 'image_studio', name: 'AI Image Generator', desc: 'Create beautiful multi-aspect high fidelity assets', icon: Sparkles, color: 'text-amber-400 bg-amber-500/10' },
    { id: 'ai_video', name: 'AI Video Synthesizer', desc: 'Text-to-Video Cinematic Renderers', icon: Video, color: 'text-rose-400 bg-rose-500/10' },
    { id: 'voice_ai', name: 'AI Voice Engine', desc: 'High-fidelity voice synthesis & audio generation', icon: Volume2, color: 'text-teal-400 bg-teal-500/10' },
    { id: 'ai_documents', name: 'AI Documents', desc: 'Semantic summary, parsing, and vectorization', icon: FileText, color: 'text-indigo-400 bg-indigo-500/10' },
    { id: 'ai_workspace', name: 'AI Workspace', desc: 'Sandboxed development context containers', icon: LayoutDashboard, color: 'text-sky-400 bg-sky-500/10' },
    { id: 'ai_translator', name: 'AI Translator Gateway', desc: 'Neural accent and global dialect translation', icon: Globe, color: 'text-emerald-400 bg-emerald-500/10' },
    { id: 'ai_learning', name: 'AI Learning Academy', desc: 'Adaptive customized syllabus & tech curriculum', icon: GraduationCap, color: 'text-yellow-400 bg-yellow-500/10' },
    { id: 'ai_code', name: 'AI Code Oracle', desc: 'Zero-latency programming & typescript helper', icon: Terminal, color: 'text-pink-400 bg-pink-500/10' },
    { id: 'ai_agents', name: 'AI Agents Swarm', desc: 'Autonomic task orchestration & research loops', icon: Cpu, color: 'text-blue-400 bg-blue-500/10' },
    { id: 'ai_models', name: 'AI Models Catalog', desc: 'Configure weights & advanced parameters', icon: Sliders, color: 'text-orange-400 bg-orange-500/10' },
    { id: 'prompt_library', name: 'Prompt Library', desc: 'Optimized index of enterprise safe prompts', icon: BookOpen, color: 'text-violet-400 bg-violet-500/10' },
    { id: 'ai_avatar', name: 'AI Avatar Studio', desc: 'Neural mesh & vocal persona synthesizer', icon: UserSquare, color: 'text-fuchsia-400 bg-fuchsia-500/10' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setSubSidebarOpen(false);
    onAddLog('Navigated SCUT AI Hub', `Opened AI module: ${tabId}`, 'chat');
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'ai_chat':
        return <ScutChatPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'assistant':
        return (
          <div className="h-[calc(100vh-64px)] w-full">
            <ChatWorkspace 
              chats={chats}
              folders={folders}
              activeChatId={activeChatId}
              onSelectChat={onSelectChat}
              onCreateChat={onCreateChat}
              onDeleteChat={onDeleteChat}
              onRenameChat={onRenameChat}
              onToggleFavorite={onToggleFavorite}
              onSendMessage={onSendMessage}
              onRegenerateMessage={onRegenerateMessage}
              isGenerating={isGenerating}
              userTier={user ? user.subscriptionTier : 'free'}
              onCreateFolder={onCreateFolder}
              onDeleteFolder={onDeleteFolder}
              onMoveChatToFolder={onMoveChatToFolder}
              onTogglePinChat={onTogglePinChat}
              onToggleArchiveChat={onToggleArchiveChat}
              onDeleteMessage={onDeleteMessage}
              onEditMessage={onEditMessage}
              onStopGeneration={onStopGeneration}
            />
          </div>
        );
      case 'image_studio':
        return <ImageStudioPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'voice_ai':
        return <VoiceAiPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_video':
        return <AiSuitePages module="video" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_documents':
        return <AiSuitePages module="documents" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_workspace':
        return <AiSuitePages module="workspace" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_translator':
        return <AiSuitePages module="translator" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_learning':
        return <AiSuitePages module="learning" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_code':
        return <AiSuitePages module="code" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_agents':
        return <AiSuitePages module="agents" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      case 'ai_models':
        return <AiModelsPage onNavigate={onNavigate} />;
      case 'prompt_library':
        return (
          <PromptLibraryPage 
            user={user} 
            onNavigate={onNavigate} 
            onRunPrompt={(pText) => {
              handleTabClick('assistant');
              setTimeout(() => {
                const chatInput = document.getElementById('chat-input') as HTMLTextAreaElement | null;
                if (chatInput) {
                  chatInput.value = pText;
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                  chatInput.focus();
                }
              }, 400);
            }} 
            onAddLog={onAddLog} 
          />
        );
      case 'ai_avatar':
        return <AiSuitePages module="avatar" user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
      default:
        return <ScutChatPage user={user} onNavigate={onNavigate} onAddLog={onAddLog} />;
    }
  };

  const activeTool = aiTools.find(t => t.id === activeTab);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-950 text-slate-100 min-h-[calc(100vh-64px)] relative overflow-hidden">
      
      {/* MOBILE TRIGGER */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-850 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-display font-extrabold text-sm text-white">SCUT AI Hub</span>
        </div>
        <button 
          onClick={() => setSubSidebarOpen(!subSidebarOpen)}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          {subSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* SUB-SIDEBAR FOR SCUT AI */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-30 md:z-10
        w-64 bg-slate-900/50 border-r border-slate-900/80 p-4 flex flex-col gap-4 shrink-0 h-full
        transition-transform duration-300 transform md:transform-none
        ${subSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center gap-2 px-2 py-1">
          <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Bot className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-sm text-white flex items-center gap-1.5">
              SCUT AI <span className="text-[9px] font-mono font-bold tracking-widest text-cyan-400 bg-cyan-400/10 px-1 py-0.5 rounded border border-cyan-400/20">v2.6</span>
            </h2>
            <p className="text-[10px] text-slate-500 font-mono">Cognitive Orchestration Suite</p>
          </div>
        </div>

        {/* TOOL MATRIX LIST */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
          <div className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-500 px-2.5 mb-2">Available Intelligence Engines</div>
          {aiTools.map((tool) => {
            const IconComponent = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleTabClick(tool.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500/10 border border-cyan-500/15 text-white font-bold' 
                    : 'hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg border border-slate-800 ${isActive ? tool.color : 'bg-slate-950 text-slate-500'}`}>
                  <IconComponent className="h-3.5 w-3.5" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold leading-none">{tool.name}</p>
                  <p className="text-[9px] text-slate-500 font-normal truncate mt-0.5">{tool.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* COMPUTE BALANCE BRIEF */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
            <span>SCUT Credit Balance</span>
            <Sparkle className="h-3 w-3 text-cyan-400 animate-spin-slow" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-white">{user?.scutCredits !== undefined ? user.scutCredits : 100}</span>
            <span className="text-[10px] font-semibold text-cyan-400 font-mono">CRD</span>
          </div>
          <button 
            onClick={() => onNavigate('scutpay')}
            className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 text-[10px] font-bold text-slate-300 border border-slate-800 transition-all text-center cursor-pointer"
          >
            Refill Credits
          </button>
        </div>
      </aside>

      {/* MAIN HUB ENGINE WINDOW */}
      <main className="flex-1 flex flex-col relative overflow-hidden h-[calc(100vh-64px)] md:h-auto">
        <div className="flex-1 overflow-y-auto w-full relative">
          {renderActiveComponent()}
        </div>
      </main>

      {/* Overlay backdrop for mobile sub-sidebar */}
      {subSidebarOpen && (
        <div 
          onClick={() => setSubSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
        />
      )}

    </div>
  );
}
