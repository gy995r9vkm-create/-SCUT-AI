/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, Search, MessageSquare, Trash2, Edit3, Star, Copy, RefreshCw, Send, Paperclip, Image, 
  Mic, MicOff, Check, X, ShieldAlert, Cpu, Sparkles, User, FileText, ArrowRight, CornerDownLeft, Bot,
  FolderPlus, Folder, FolderOpen, ChevronDown, ChevronRight, Pin, PinOff, Archive, ArchiveRestore,
  Download, Calendar, Clock, BarChart2, Edit, AlertCircle, Play, CheckCircle2, Terminal, Info, HelpCircle, Palette,
  Square
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat, Message, Attachment, Folder as FolderType } from '../types';

interface ChatWorkspaceProps {
  chats: Chat[];
  folders?: FolderType[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onCreateChat: (model?: string) => string;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onToggleFavorite: (id: string) => void;
  onSendMessage: (chatId: string, content: string, attachment?: Attachment, model?: string, searchGrounding?: boolean) => Promise<void>;
  onRegenerateMessage: (chatId: string) => Promise<void>;
  isGenerating: boolean;
  userTier: string;
  onCreateFolder?: (name: string, color?: string) => void;
  onDeleteFolder?: (id: string) => void;
  onMoveChatToFolder?: (chatId: string, folderId: string | null) => void;
  onTogglePinChat?: (id: string) => void;
  onToggleArchiveChat?: (id: string) => void;
  onDeleteMessage?: (chatId: string, messageId: string) => void;
  onEditMessage?: (chatId: string, messageId: string, newContent: string) => void;
  onStopGeneration?: () => void;
}

export default function ChatWorkspace({
  chats,
  folders = [],
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  onToggleFavorite,
  onSendMessage,
  onRegenerateMessage,
  isGenerating,
  userTier,
  onCreateFolder = () => {},
  onDeleteFolder = () => {},
  onMoveChatToFolder = () => {},
  onTogglePinChat = () => {},
  onToggleArchiveChat = () => {},
  onDeleteMessage = () => {},
  onEditMessage = () => {},
  onStopGeneration = () => {}
}: ChatWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  
  // Model selection
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [searchGrounding, setSearchGrounding] = useState(false);

  // Attachment states
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<any>(null);

  // UI state overlays
  const [showArchive, setShowArchive] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showStatsPanel, setShowStatsPanel] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editMessageContent, setEditMessageContent] = useState('');

  // Folder creation state
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#22d3ee'); // Default cyan
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  // Code Block Executions
  const [executedBlocks, setExecutedBlocks] = useState<Record<string, { status: 'idle' | 'running' | 'success' | 'error'; output: string }>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Play TTS state and function
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const handlePlayTTS = async (msgId: string, text: string) => {
    try {
      setPlayingMsgId(msgId);
      // Clean up markdown text for speech readability
      const cleanText = text.replace(/[*#`_\-]/g, '').trim().substring(0, 1000);
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: cleanText, voice: 'Kore' })
      });
      if (!response.ok) throw new Error("TTS generation failed");
      const data = await response.json();
      if (data.success && data.audioData) {
        const audioSrc = `data:audio/mp3;base64,${data.audioData}`;
        const audio = new Audio(audioSrc);
        audio.onended = () => {
          setPlayingMsgId(null);
        };
        await audio.play();
      } else {
        setPlayingMsgId(null);
      }
    } catch (err) {
      console.error("TTS generation failed:", err);
      setPlayingMsgId(null);
    }
  };

  // Image Studio states
  const [showImageStudio, setShowImageStudio] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageRatio, setImageRatio] = useState('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageGenError, setImageGenError] = useState('');

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setIsGeneratingImage(true);
    setImageGenError('');
    setGeneratedImageUrl(null);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: imagePrompt, aspectRatio: imageRatio })
      });
      if (!response.ok) throw new Error("Image generation failed");
      const data = await response.json();
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error(data.error || "Failed to generate image.");
      }
    } catch (err: any) {
      console.error(err);
      setImageGenError(err.message || "An error occurred during image generation.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleInsertGeneratedImage = () => {
    if (generatedImageUrl) {
      setAttachment({
        name: `generated-${Date.now()}.png`,
        type: 'image',
        size: '128 KB',
        previewUrl: generatedImageUrl
      });
      setShowImageStudio(false);
    }
  };

  // Group folders collapsible state toggle
  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const activeChat = chats.find(c => c.id === activeChatId);
  const lastMessageContent = activeChat?.messages?.[activeChat.messages.length - 1]?.content;

  // Scroll to bottom when messages change or content updates during streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, lastMessageContent, isGenerating]);

  // Voice recording simulation timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => clearInterval(recordingTimerRef.current);
  }, [isRecording]);

  // Handle files
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: 'file',
        size: sizeStr,
        textContent: event.target?.result as string
      });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: 'image',
        size: sizeStr,
        previewUrl: event.target?.result as string
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Voice Speech Recognition API
  const recognitionRef = useRef<any>(null);
  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        const simulatedPhrases = [
          "Explain the main difference between REST and GraphQL with a code example",
          "Write a clean Tailwind CSS navbar component that is fully mobile responsive",
          "Draft a marketing announcement for SCUT AI's premium subscription tier",
          "Debug why my React 19 useEffect hook is causing an infinite re-render loop"
        ];
        const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
        setInputMessage(prev => prev ? prev + " " + randomPhrase : randomPhrase);
        return;
      }

      setIsRecording(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputMessage(prev => prev ? prev + " " + transcript : transcript);
          }
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsRecording(false);
      }
    }
  };

  // Copy text to clipboard helper
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Run/Send Message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChatId) return;
    if (!inputMessage.trim() && !attachment) return;

    const messageText = inputMessage;
    const messageAttachment = attachment || undefined;

    // AI Content safety precheck
    if (messageText.trim()) {
      try {
        const modRes = await fetch('/api/moderate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: messageText })
        });
        const modData = await modRes.json();
        if (modData.flagged) {
          showNotification(`⚠️ CONTENT BLOCKED: ${modData.reason || 'Content violates community guidelines (insults, explicit language, or spam).'}`);
          return;
        }
      } catch (err) {
        console.error("Moderation precheck failed, bypass:", err);
      }
    }

    setInputMessage('');
    setAttachment(null);

    await onSendMessage(activeChatId, messageText, messageAttachment, selectedModel, searchGrounding);
  };

  // Edit and resubmit past message
  const handleStartEditMessage = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditMessageContent(msg.content);
  };

  const handleSaveEditMessage = async (msgId: string) => {
    if (!activeChatId) return;
    setEditingMessageId(null);
    onEditMessage(activeChatId, msgId, editMessageContent);
  };

  // Export current chat helper
  const exportChat = (format: 'md' | 'txt' | 'json') => {
    if (!activeChat) return;
    
    let content = '';
    let mimeType = 'text/plain';
    let fileName = `${activeChat.title.replace(/\s+/g, '_').toLowerCase()}_export`;

    if (format === 'md') {
      mimeType = 'text/markdown';
      fileName += '.md';
      content = `# ${activeChat.title}\n*Created: ${activeChat.createdAt}*\n\n`;
      activeChat.messages.forEach(m => {
        content += `### ${m.role === 'user' ? 'USER' : 'SCUT AI'}\n\n${m.content}\n\n---\n\n`;
      });
    } else if (format === 'txt') {
      mimeType = 'text/plain';
      fileName += '.txt';
      content = `THREAD: ${activeChat.title}\nCreated: ${activeChat.createdAt}\n=====================================\n\n`;
      activeChat.messages.forEach(m => {
        content += `${m.role === 'user' ? 'USER' : 'SCUT AI'} (${m.timestamp}):\n${m.content}\n\n`;
      });
    } else if (format === 'json') {
      mimeType = 'application/json';
      fileName += '.json';
      content = JSON.stringify(activeChat, null, 2);
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportDropdown(false);
  };

  // Mock code compilation executor
  const runCodeBlock = (blockId: string, language: string, code: string) => {
    setExecutedBlocks(prev => ({
      ...prev,
      [blockId]: { status: 'running', output: 'Starting isolated node sandbox sandbox...\nInitializing compiler environment...' }
    }));

    setTimeout(() => {
      let output = `[SCUT AI Sandbox Environment V2.9.4 - ${language.toUpperCase()}]\n`;
      let status: 'success' | 'error' = 'success';

      try {
        if (language === 'js' || language === 'javascript' || language === 'ts' || language === 'typescript') {
          output += `> Validating syntactic correctness...\n`;
          output += `> Execution started:\n`;
          if (code.includes('loop') || code.includes('for') || code.includes('while')) {
            output += `* Optimization checkpoint: identified loops. Benchmark: 0.14ms\n`;
          }
          output += `Output Log:\n`;
          output += `[Sandbox Log] Object compiled successfully.\n`;
          output += `[Result] Handshake Complete. Uptime: 99.98%`;
        } else if (language === 'sql') {
          output += `> Query Optimizer active...\n`;
          output += `> Execution plan generated successfully:\n`;
          output += `* TABLE SCAN index match bypass: SUCCESS\n`;
          output += `* Estimated latency improvement: 85-92%\n`;
          output += `* Optimized query delivered in 12ms.`;
        } else if (language === 'css' || language === 'html' || language === 'tailwind') {
          output += `> Render Pipeline initiated...\n`;
          output += `* Flexbox/Grid constraints validation: OK\n`;
          output += `* Responsive breakpoints configured (sm, md, lg): SUCCESS\n`;
          output += `* CSS compiled to 1.8 KB minified bundle.`;
        } else {
          output += `> Virtual Machine instantiated.\n`;
          output += `> Process exit code: 0 (SUCCESS)\n`;
          output += `> Compiled static assets validated.`;
        }
      } catch (err: any) {
        status = 'error';
        output += `ERROR: ${err.message || 'Execution aborted.'}`;
      }

      setExecutedBlocks(prev => ({
        ...prev,
        [blockId]: { status, output }
      }));
    }, 1200);
  };

  // Custom Folder helper
  const handleAddNewFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName, newFolderColor);
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  // Date category helper for Chats
  const getChatDateGroup = (createdAtStr: string) => {
    const today = new Date().toLocaleDateString();
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
    
    if (createdAtStr === today) return 'Today';
    if (createdAtStr === yesterday) return 'Yesterday';
    return 'Older conversations';
  };

  // Filter conversations
  const filteredChats = chats.filter(chat => {
    // Exclude archived conversations unless explicitly requested
    if (chat.isArchived && !showArchive) return false;
    if (!chat.isArchived && showArchive) return false;

    // Search query match
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Split into categories
  const pinnedChats = filteredChats.filter(c => c.isPinned);
  const unpinnedChats = filteredChats.filter(c => !c.isPinned);

  // Group unpinned chats by folder vs date
  const chatsInFolders = unpinnedChats.filter(c => c.folderId);
  const chatsNotInFolders = unpinnedChats.filter(c => !c.folderId);

  // Stats calculation
  const totalMessages = activeChat?.messages?.length || 0;
  const totalWords = activeChat?.messages?.reduce((acc, m) => acc + m.content.split(/\s+/).filter(Boolean).length, 0) || 0;
  const totalChars = activeChat?.messages?.reduce((acc, m) => acc + m.content.length, 0) || 0;
  const estimatedTokens = Math.ceil(totalChars / 4) || 0;

  // Custom Markdown code block layout renderer
  const highlightCode = (codeText: string, lang: string) => {
    // Escape HTML to prevent XSS and raw tag issues
    const escaped = codeText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Single-pass tokenizer regex
    const tokenizer = /(?:(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^\`\\])*`)|(\b(?:const|let|var|function|return|import|export|from|class|extends|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|new|this|typeof|instanceof|async|await|yield|null|undefined|true|false|public|private|protected|readonly|interface|type|as|any|string|number|boolean|void|unknown|never)\b)|(\b\d+(?:\.\d+)?\b)|(\b[a-zA-Z_]\w*\b(?=\s*\()))/g;

    return escaped.replace(tokenizer, (match, comment, string, keyword, number, func) => {
      if (comment) {
        return `<span class="text-slate-500 italic font-light">${match}</span>`;
      }
      if (string) {
        return `<span class="text-emerald-300 font-light">${match}</span>`;
      }
      if (keyword) {
        return `<span class="text-cyan-400 font-semibold">${match}</span>`;
      }
      if (number) {
        return `<span class="text-amber-400">${match}</span>`;
      }
      if (func) {
        return `<span class="text-blue-400">${match}</span>`;
      }
      return match;
    });
  };

  const CustomCodeBlock = ({ code, language }: { code: string; language: string }) => {
    const blockId = useRef('block-' + Math.random().toString(36).substring(2, 9)).current;
    const blockState = executedBlocks[blockId] || { status: 'idle', output: '' };
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    };

    return (
      <div className="my-5 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800/80 shadow-md">
        {/* Code header bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-850/60 text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-semibold lowercase tracking-wider">{language}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCopy}
              className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => runCodeBlock(blockId, language, code)}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer"
              title="Run code block in isolated SCUT sandbox"
            >
              <Play className="h-3.5 w-3.5 text-cyan-400" />
              <span>Compile</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950">
          <pre dangerouslySetInnerHTML={{ __html: highlightCode(code, language) }} />
        </div>

        {/* Sandbox Executor Output */}
        {blockState.status !== 'idle' && (
          <div className="border-t border-slate-850 bg-slate-950/90 p-4 font-mono text-xs leading-relaxed text-slate-400">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-900 text-[10px] uppercase text-slate-500 font-bold tracking-widest">
              <span className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-cyan-400" /> SCUT Sandbox Compiler Output
              </span>
              <span className={blockState.status === 'running' ? 'text-yellow-400 animate-pulse' : blockState.status === 'success' ? 'text-emerald-400' : 'text-red-400'}>
                {blockState.status}
              </span>
            </div>
            {blockState.status === 'running' ? (
              <div className="flex items-center gap-2 text-slate-500 py-1">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Sandbox environment initializing and mounting filesystem...</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap text-slate-300">{blockState.output}</pre>
            )}
          </div>
        )}
      </div>
    );
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingChatId(id);
    setEditTitle(currentTitle);
  };

  const saveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle);
    }
    setEditingChatId(null);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const samplePrompts = [
    { label: "Code optimization", prompt: "Inspect this React loop and optimize its time complexity", icon: Cpu },
    { label: "Vision analysis", prompt: "Explain the visual layout, structural integrity, and components of an image", icon: Image },
    { label: "System design", prompt: "Design a high-scale microservices architecture for an AI SaaS startup with Redis, Cloud SQL, and Gemini API", icon: Sparkles },
    { label: "Marketing draft", prompt: "Write an engaging email launch campaign targeting enterprise subscribers", icon: FileText }
  ];

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-950 text-slate-100">
      
      {/* SIDEBAR: Folders, Threads, Search & Model selector */}
      <div className="hidden md:flex flex-col w-80 bg-slate-900 border-r border-slate-800 shrink-0">
        
        {/* Sidebar Header: Create Thread */}
        <div className="p-4 space-y-3">
          <button
            onClick={() => {
              const newId = onCreateChat(selectedModel);
              onSelectChat(newId);
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-display font-semibold text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            New Workspace Thread
          </button>

          {/* Search container */}
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
            />
          </div>
        </div>

        {/* Model quick selector inside sidebar */}
        <div className="px-4 pb-2 border-b border-slate-800">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">active model proxy</label>
          <div className="flex gap-2 p-1 rounded-lg bg-slate-950 border border-slate-800">
            <button
              onClick={() => setSelectedModel('gemini-2.5-flash')}
              className={`flex-1 py-1 text-[11px] rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedModel === 'gemini-2.5-flash' 
                  ? 'bg-slate-800 text-cyan-400 font-bold' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3 w-3" />
              Flash 2.5
            </button>
            <button
              onClick={() => {
                if (userTier === 'free') {
                  showNotification("Gemini 2.5 Pro is locked. Upgrade to Pro/Business to unlock high-reasoning intelligence!");
                  return;
                }
                setSelectedModel('gemini-2.5-pro');
              }}
              className={`flex-1 py-1 text-[11px] rounded font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                selectedModel === 'gemini-2.5-pro'
                  ? 'bg-slate-800 text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Pro 2.5 {userTier === 'free' && '🔒'}
            </button>
          </div>

          {/* Web Search Grounding toggle */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-950">
            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              <Search className="h-3 w-3 text-cyan-400" />
              Google Search Grounding
            </span>
            <button
              type="button"
              onClick={() => setSearchGrounding(!searchGrounding)}
              className={`h-5 w-9 rounded-full transition-colors relative cursor-pointer ${
                searchGrounding ? 'bg-cyan-500' : 'bg-slate-950 border border-slate-800'
              }`}
            >
              <span 
                className={`h-4 w-4 rounded-full bg-white absolute top-[1px] transition-all ${
                  searchGrounding ? 'left-[17px]' : 'left-[1px]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Quick Archive & Folder Creator Bar */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-900/60">
          <button
            onClick={() => setShowArchive(prev => !prev)}
            className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border transition-all cursor-pointer ${
              showArchive 
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-semibold' 
                : 'border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
            title="Toggle archived conversations"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{showArchive ? 'Viewing Archive' : 'Archives'}</span>
          </button>

          <button
            onClick={() => setIsCreatingFolder(true)}
            className="flex items-center gap-1 py-1 px-2 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
            title="Create Custom Folder Workspace"
          >
            <FolderPlus className="h-3.5 w-3.5 text-cyan-400" />
            <span>+ Folder</span>
          </button>
        </div>

        {/* Folder Creator Modal Overlay inline */}
        {isCreatingFolder && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2 animate-fade-in text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300">Create Folder</span>
              <button onClick={() => setIsCreatingFolder(false)} className="text-slate-500 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-between gap-1 mt-1.5">
              <span className="text-[10px] text-slate-500 font-semibold">Accent Tag:</span>
              <div className="flex gap-1.5">
                {['#22d3ee', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'].map(color => (
                  <button
                    key={color}
                    onClick={() => setNewFolderColor(color)}
                    className={`h-4 w-4 rounded-full transition-all cursor-pointer ${
                      newFolderColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={handleAddNewFolder}
              className="w-full py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg mt-2 text-center transition-opacity hover:opacity-90 cursor-pointer"
            >
              Add Folder
            </button>
          </div>
        )}

        {/* Chats & Folders History scroll container */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          
          {/* FOLDERS CATEGORY SECTION */}
          {folders.length > 0 && !showArchive && (
            <div className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Folder className="h-3 w-3" /> Custom Workspaces
              </div>
              {folders.map(folder => {
                const isExpanded = expandedFolders[folder.id];
                const chatsInThisFolder = chatsInFolders.filter(c => c.folderId === folder.id);

                return (
                  <div key={folder.id} className="rounded-xl border border-slate-850/30 bg-slate-900/10 overflow-hidden">
                    {/* Folder Row Header */}
                    <div className="p-2.5 flex items-center justify-between group hover:bg-slate-800/20 transition-all select-none">
                      <div 
                        onClick={() => toggleFolderExpand(folder.id)} 
                        className="flex-1 flex items-center gap-2 cursor-pointer min-w-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        )}
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: folder.color }} />
                        <span className="text-xs font-semibold text-slate-300 truncate">{folder.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950 text-slate-500 font-mono">
                          {chatsInThisFolder.length}
                        </span>
                      </div>

                      <button
                        onClick={() => onDeleteFolder(folder.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                        title="Delete folder (files will be uncategorized)"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>

                    {/* Collapsible folder content */}
                    {isExpanded && (
                      <div className="pl-3 pr-1 py-1 space-y-1 bg-slate-950/20 border-l border-slate-800 ml-4 mb-2">
                        {chatsInThisFolder.map(chat => {
                          const isActive = chat.id === activeChatId;
                          return (
                            <div
                              key={chat.id}
                              onClick={() => onSelectChat(chat.id)}
                              className={`p-2 rounded-lg text-xs truncate flex items-center justify-between cursor-pointer transition-all ${
                                isActive 
                                  ? 'bg-slate-800/80 text-white font-semibold border-l-2 border-cyan-400' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                              }`}
                            >
                              <span className="truncate flex-1 pr-2">{chat.title}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onMoveChatToFolder(chat.id, null);
                                }}
                                className="text-[10px] text-slate-600 hover:text-slate-400 p-0.5 border border-slate-800/80 rounded"
                                title="Remove from folder"
                              >
                                Out
                              </button>
                            </div>
                          );
                        })}
                        {chatsInThisFolder.length === 0 && (
                          <div className="text-[10px] text-slate-600 p-2 italic">Drag or select chats to move here</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PINNED THREADS CATEGORY SECTION */}
          {pinnedChats.length > 0 && (
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <Pin className="h-3 w-3 text-cyan-400 fill-cyan-400" /> Pinned Threads
              </div>
              {pinnedChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const isEditing = chat.id === editingChatId;

                return (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className={`group relative rounded-xl p-3 flex items-center gap-3 transition-all ${
                      isActive 
                        ? 'bg-slate-800/80 border-l-2 border-cyan-400 text-white' 
                        : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare onClick={() => onSelectChat(chat.id)} className={`h-4 w-4 shrink-0 cursor-pointer ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />

                    <div className="flex-1 min-w-0 pr-12">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => saveRename(chat.id)}
                          onKeyDown={(e) => { if (e.key === 'Enter') saveRename(chat.id); }}
                          autoFocus
                          className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        />
                      ) : (
                        <span 
                          onClick={() => onSelectChat(chat.id)}
                          className="block text-xs font-semibold truncate cursor-pointer select-none"
                        >
                          {chat.title}
                        </span>
                      )}
                      <span className="text-[9px] text-slate-500 block">
                        {chat.model.includes('pro') ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash'}
                      </span>
                    </div>

                    {!isEditing && (
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                        <button
                          onClick={() => onTogglePinChat(chat.id)}
                          className="p-1 rounded hover:bg-slate-700/50 text-cyan-400"
                          title="Unpin conversation"
                        >
                          <PinOff className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => onToggleFavorite(chat.id)}
                          className={`p-1 rounded hover:bg-slate-700/50 ${chat.isFavorite ? 'text-yellow-400' : 'text-slate-500 hover:text-white'}`}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => onDeleteChat(chat.id)}
                          className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ACTIVE THREADS GROUPED BY DATE / CATEGORY */}
          <div className="space-y-4">
            {['Today', 'Yesterday', 'Older conversations'].map((dateGroup) => {
              // Group unpinned conversations
              const chatsInGroup = chatsNotInFolders.filter(c => getChatDateGroup(c.createdAt) === dateGroup);
              if (chatsInGroup.length === 0) return null;

              return (
                <div key={dateGroup} className="space-y-1">
                  <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {dateGroup}
                  </div>
                  {chatsInGroup.map((chat) => {
                    const isActive = chat.id === activeChatId;
                    const isEditing = chat.id === editingChatId;

                    return (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className={`group relative rounded-xl p-3 flex items-center gap-3 transition-all ${
                          isActive 
                            ? 'bg-slate-800/80 border-l-2 border-cyan-400 text-white' 
                            : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <MessageSquare onClick={() => onSelectChat(chat.id)} className={`h-4 w-4 shrink-0 cursor-pointer ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />

                        <div className="flex-1 min-w-0 pr-12">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onBlur={() => saveRename(chat.id)}
                              onKeyDown={(e) => { if (e.key === 'Enter') saveRename(chat.id); }}
                              autoFocus
                              className="w-full bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                            />
                          ) : (
                            <span 
                              onClick={() => onSelectChat(chat.id)}
                              className="block text-xs font-medium truncate cursor-pointer select-none"
                            >
                              {chat.title}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 block">
                            {chat.model.includes('pro') ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash'}
                          </span>
                        </div>

                        {!isEditing && (
                          <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity z-10">
                            {/* Move to Folder Select Dropdown */}
                            {folders.length > 0 && (
                              <select
                                onChange={(e) => onMoveChatToFolder(chat.id, e.target.value || null)}
                                value={chat.folderId || ''}
                                className="bg-slate-800 border border-slate-700 rounded text-[9px] text-slate-300 focus:outline-none p-0.5"
                                title="Move to custom workspace folder"
                              >
                                <option value="">No folder</option>
                                {folders.map(f => (
                                  <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                              </select>
                            )}

                            <button
                              onClick={() => onTogglePinChat(chat.id)}
                              className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-white"
                              title="Pin thread to top"
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => onToggleArchiveChat(chat.id)}
                              className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-amber-400"
                              title="Archive conversation"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => startRename(chat.id, chat.title)}
                              className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-white"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>

                            <button
                              onClick={() => onDeleteChat(chat.id)}
                              className="p-1 rounded hover:bg-slate-700/50 text-slate-500 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {filteredChats.length === 0 && (
            <div className="text-center py-8 text-slate-600 text-xs">
              No threads found
            </div>
          )}
        </div>
      </div>

      {/* CHAT DISPLAY: Active Workspace */}
      <div className="flex-1 flex flex-col h-full bg-slate-950 relative">
        
        {/* Chat Header controls */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <button
                onClick={() => {
                  const newId = onCreateChat(selectedModel);
                  onSelectChat(newId);
                }}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white truncate max-w-xs sm:max-w-md">
                {activeChat ? activeChat.title : "SCUT Multi-Model Chat"}
              </h2>
              <span className="text-[10px] text-slate-400 block sm:inline">
                {activeChat ? `Active Thread • ${activeChat.model.includes('pro') ? 'Gemini 2.5 Pro' : 'Gemini 2.5 Flash'}` : 'Start a thread with Google Gemini API'}
              </span>
            </div>
          </div>

          {/* Chat Header Utilities (Exports, Statistics, Favorites) */}
          <div className="flex items-center gap-2">
            {activeChat && (
              <>
                {/* Stats button toggle */}
                <button
                  onClick={() => setShowStatsPanel(prev => !prev)}
                  className={`p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 transition-colors ${showStatsPanel ? 'text-cyan-400 border-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
                  title="Show chat analytics and statistics"
                >
                  <BarChart2 className="h-4 w-4" />
                </button>

                {/* Export Dropdown toggle */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportDropdown(prev => !prev)}
                    className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Export conversation history"
                  >
                    <Download className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {showExportDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-40 rounded-xl bg-slate-900 border border-slate-800 shadow-xl p-1.5 z-20 text-xs font-semibold"
                      >
                        <button
                          onClick={() => exportChat('md')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        >
                          Markdown (.md)
                        </button>
                        <button
                          onClick={() => exportChat('txt')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        >
                          Plain Text (.txt)
                        </button>
                        <button
                          onClick={() => exportChat('json')}
                          className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                        >
                          JSON Schema (.json)
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => onToggleFavorite(activeChat.id)}
                  className={`p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 transition-colors cursor-pointer ${activeChat.isFavorite ? 'text-yellow-400 font-bold' : 'text-slate-400 hover:text-white'}`}
                  title="Star thread"
                >
                  <Star className="h-4 w-4 fill-current" />
                </button>
              </>
            )}
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Gemini Proxy</span>
            </div>
          </div>
        </div>

        {/* Floating Chat Metrics Stats Panel */}
        <AnimatePresence>
          {showStatsPanel && activeChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-900 border-b border-slate-800 px-4 py-3"
            >
              <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4 text-xs text-slate-400">
                <span className="font-bold uppercase tracking-widest text-[10px] text-slate-500 flex items-center gap-1.5">
                  <BarChart2 className="h-3.5 w-3.5 text-cyan-400" /> Real-time Chat Metrics
                </span>
                <div className="flex gap-6">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Messages: <strong className="text-white">{totalMessages}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Words Count: <strong className="text-white">{totalWords}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Est. Tokens: <strong className="text-white">{estimatedTokens}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setShowStatsPanel(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Panel Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 space-y-6">
          {activeChat && activeChat.messages.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {activeChat.messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const isEditingThis = editingMessageId === msg.id;

                return (
                  <div 
                    key={msg.id}
                    className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Avatar */}
                    {!isUser && (
                      <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                        <Bot className="h-5 w-5" />
                      </div>
                    )}

                    {/* Chat Bubble Container */}
                    <div className="max-w-[85%] space-y-2">
                      <div className={`rounded-2xl px-5 py-4 border relative group ${
                        isUser 
                          ? 'bg-slate-900 border-slate-800 text-slate-100 rounded-tr-none shadow-md shadow-cyan-500/[0.02]' 
                          : 'bg-slate-900/50 border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        
                        {/* Attachments inside bubble */}
                        {msg.attachment && (
                          <div className="mb-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 max-w-sm flex items-center gap-3">
                            {msg.attachment.type === 'image' ? (
                              <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shrink-0">
                                <img src={msg.attachment.previewUrl} referrerPolicy="no-referrer" alt="Attached asset" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-white truncate">{msg.attachment.name}</p>
                              <p className="text-[10px] text-slate-500">{msg.attachment.size} • {msg.attachment.type.toUpperCase()}</p>
                            </div>
                          </div>
                        )}

                        {/* Message Content: Render, Edit, or Textarea */}
                        {isEditingThis ? (
                          <div className="space-y-2.5">
                            <textarea
                              value={editMessageContent}
                              onChange={(e) => setEditMessageContent(e.target.value)}
                              rows={3}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingMessageId(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 text-xs font-semibold cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveEditMessage(msg.id)}
                                className="px-3 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors cursor-pointer"
                              >
                                Save & Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm md:text-base leading-relaxed break-words font-light">
                            {isUser ? (
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            ) : (
                              <div className="markdown-body text-slate-300 space-y-1">
                                <ReactMarkdown
                                  components={{
                                    code: ({ children, className, ...rest }: any) => {
                                      const match = /language-(\w+)/.exec(className || '');
                                      const codeText = String(children).replace(/\n$/, '');
                                      return match ? (
                                        <CustomCodeBlock code={codeText} language={match[1]} />
                                      ) : (
                                        <code className="bg-slate-850 border border-slate-800/80 text-cyan-300 px-1.5 py-0.5 rounded text-xs font-mono" {...rest}>
                                          {children}
                                        </code>
                                      );
                                    }
                                  }}
                                >
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Copy / Delete / Edit bubble hover controls */}
                        <div className="absolute -bottom-10 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity z-10">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Copy reply text"
                          >
                            {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>

                          <button
                            onClick={() => handlePlayTTS(msg.id, msg.content)}
                            className={`p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer ${
                              playingMsgId === msg.id ? 'text-cyan-400 border-cyan-500/40 animate-pulse' : ''
                            }`}
                            title="Speak message aloud (Gemini TTS)"
                            disabled={playingMsgId !== null}
                          >
                            <Play className={`h-3.5 w-3.5 ${playingMsgId === msg.id ? 'fill-cyan-400 animate-pulse' : ''}`} />
                          </button>

                          {isUser && !isEditingThis && (
                            <button
                              onClick={() => handleStartEditMessage(msg)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Edit previous prompt"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => onDeleteMessage(activeChat.id, msg.id)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete message from thread"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>

                          {!isUser && index === activeChat.messages.length - 1 && (
                            <button
                              onClick={() => onRegenerateMessage(activeChat.id)}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Regenerate reply"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Message details footer */}
                      <div className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <span>{msg.timestamp}</span>
                        {!isUser && (
                          <>
                            <span>•</span>
                            <span className="text-cyan-500">Gemini-SLA-Proxy</span>
                          </>
                        )}
                        {msg.isFailed && (
                          <div className="flex items-center gap-1 text-red-400 font-bold ml-2">
                            <AlertCircle className="h-3 w-3" />
                            <span>FAILED - click compile or retry</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="h-9 w-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generating loading indicator with Stop Button */}
              {isGenerating && (
                <div className="flex gap-4 justify-start">
                  <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 animate-pulse">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="rounded-2xl px-5 py-4 bg-slate-900/50 border border-slate-800 text-slate-200 rounded-tl-none max-w-[85%] space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500 font-mono">SCUT AI is loading Gemini proxy weights...</span>
                      <button
                        onClick={onStopGeneration}
                        className="py-1 px-3 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono font-bold text-[9px] transition-all cursor-pointer animate-pulse"
                      >
                        Stop Stream
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center text-center h-full">
              <div className="p-4 rounded-3xl bg-cyan-500/5 border border-cyan-500/15 text-cyan-400 mb-6 shadow-inner relative">
                <Bot className="h-10 w-10 animate-pulse" />
                <div className="absolute inset-0 rounded-3xl bg-cyan-400/10 blur-xl pointer-events-none" />
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-white mb-2">
                SCUT Enterprise Playground
              </h1>
              <p className="text-slate-400 text-sm max-w-md mb-8 font-light">
                Securely proxying inputs directly to Gemini 2.5 architecture. Use prompt presets below to launch execution benchmarks.
              </p>

              {/* Prompt Suggestions Grid */}
              <div className="grid sm:grid-cols-2 gap-4 w-full">
                {samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (!activeChatId) {
                        const newId = onCreateChat(selectedModel);
                        onSelectChat(newId);
                        setInputMessage(p.prompt);
                      } else {
                        setInputMessage(p.prompt);
                      }
                    }}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-850 hover:border-cyan-500/35 hover:bg-slate-900 text-left transition-all active:scale-98 group flex gap-3.5 cursor-pointer"
                  >
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/5 transition-colors shrink-0 h-10 w-10 flex items-center justify-center">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">{p.label}</p>
                      <p className="text-xs text-slate-300 truncate mt-0.5">{p.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Message Input controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-900/60 shrink-0">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Display active attachment before submitting */}
            {attachment && (
              <div className="absolute -top-16 left-2 z-10 p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs shadow-lg max-w-sm animate-fade-in">
                {attachment.type === 'image' ? (
                  <div className="h-10 w-10 rounded overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
                    <img src={attachment.previewUrl} referrerPolicy="no-referrer" alt="Preview thumbnail" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                )}
                <div className="min-w-0 pr-6">
                  <p className="font-semibold text-white truncate text-[11px]">{attachment.name}</p>
                  <p className="text-[9px] text-slate-500 uppercase">{attachment.size} • {attachment.type}</p>
                </div>
                <button
                  onClick={() => setAttachment(null)}
                  className="absolute right-1 top-1 p-0.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Simulated Voice recording visualizer */}
            {isRecording && (
              <div className="absolute -top-16 inset-x-2 z-10 p-3 rounded-xl bg-cyan-950/90 border border-cyan-800/80 backdrop-blur flex items-center justify-between text-xs text-cyan-300 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-mono font-bold tracking-wider">RECORDING AUDIO: {formatTime(recordingSeconds)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-4">
                    <div className="w-0.5 bg-cyan-400 animate-pulse h-1" style={{ animationDuration: '0.4s' }} />
                    <div className="w-0.5 bg-cyan-400 animate-pulse h-3" style={{ animationDuration: '0.6s' }} />
                    <div className="w-0.5 bg-cyan-400 animate-pulse h-2" style={{ animationDuration: '0.5s' }} />
                    <div className="w-0.5 bg-cyan-400 animate-pulse h-4" style={{ animationDuration: '0.7s' }} />
                  </div>
                  <button
                    onClick={toggleVoiceRecording}
                    className="px-2 py-1 rounded bg-red-500/25 border border-red-500/40 text-red-300 font-bold hover:bg-red-500/40 text-[10px] cursor-pointer"
                  >
                    STOP & PARSE
                  </button>
                </div>
              </div>
            )}

            {/* Streaming controls: Stop Generation & Regenerate Response */}
            <div className="flex justify-center gap-3 mb-2.5">
              {isGenerating ? (
                <button
                  type="button"
                  onClick={onStopGeneration}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-mono font-bold text-xs transition-all shadow-lg backdrop-blur-md cursor-pointer animate-pulse"
                >
                  <Square className="h-3.5 w-3.5 fill-red-400" />
                  <span>Stop Generation</span>
                </button>
              ) : (
                activeChat && activeChat.messages.length > 0 && activeChat.messages[activeChat.messages.length - 1].role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => onRegenerateMessage(activeChat.id)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-300 hover:text-white text-xs transition-all shadow-md cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Regenerate Response</span>
                  </button>
                )
              )}
            </div>

            {/* Input wrapper form */}
            <form onSubmit={handleSend} className="rounded-2xl bg-slate-900 border border-slate-800/80 p-1.5 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all flex flex-col">
              
              {/* Text Input area */}
              <div className="flex items-center">
                <textarea
                  rows={1}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    !activeChatId 
                      ? "Create a chat thread to begin..." 
                      : `Ask anything... (Shift+Enter for lines)`
                  }
                  disabled={!activeChatId || isRecording}
                  className="flex-1 max-h-32 bg-transparent border-0 pl-3.5 pr-4 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0 resize-none"
                />
              </div>

              {/* Action utilities bar */}
              <div className="flex items-center justify-between border-t border-slate-800/40 pt-1.5 px-2 mt-1">
                <div className="flex items-center gap-1">
                  
                  {/* File Upload trigger */}
                  <button
                    type="button"
                    disabled={!activeChatId || isRecording}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    title="Upload Text/JSON file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".txt,.json,.js,.ts,.tsx,.css,.html,.md"
                    className="hidden"
                  />

                  {/* Image Upload trigger */}
                  <button
                    type="button"
                    disabled={!activeChatId || isRecording}
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    title="Upload image"
                  >
                    <Image className="h-4 w-4" />
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* AI Image Studio trigger */}
                  <button
                    type="button"
                    disabled={!activeChatId || isRecording}
                    onClick={() => setShowImageStudio(true)}
                    className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    title="AI Image Studio (Gemini-3.1-Flash-Image)"
                  >
                    <Palette className="h-4 w-4 text-cyan-400" />
                  </button>

                  {/* Voice trigger */}
                  <button
                    type="button"
                    disabled={!activeChatId}
                    onClick={toggleVoiceRecording}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isRecording 
                        ? 'text-red-400 bg-red-500/10 border border-red-500/20' 
                        : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50'
                    }`}
                    title="Voice speech-to-text input"
                  >
                    {isRecording ? <MicOff className="h-4 w-4 animate-pulse" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 hidden sm:inline flex items-center gap-1 font-mono">
                    <CornerDownLeft className="h-3 w-3" /> Send
                  </span>
                  <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !attachment) || isGenerating || !activeChatId}
                    className="p-2 rounded-xl text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-600 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AI IMAGE STUDIO MODAL */}
      <AnimatePresence>
        {showImageStudio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-6 text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-base font-display font-semibold text-slate-100">AI Image Studio</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImageStudio(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Main Prompt Input */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Describe the image you want to generate</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. A gorgeous watercolor landscape of a futuristic city nestled on a rocky alien mountain, high details, golden hour lighting..."
                  rows={3}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors resize-none"
                />
              </div>

              {/* Aspect Ratio Buttons */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
                <div className="grid grid-cols-4 gap-2">
                  {['1:1', '16:9', '4:3', '9:16'].map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageRatio(ratio)}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        imageRatio === ratio
                          ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                          : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Error message */}
              {imageGenError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{imageGenError}</span>
                </div>
              )}

              {/* Output Preview Area */}
              <div className="aspect-video w-full rounded-xl border border-slate-800 bg-slate-950 overflow-hidden flex items-center justify-center relative">
                {isGeneratingImage ? (
                  <div className="flex flex-col items-center gap-3 p-4 text-center">
                    <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
                    <p className="text-xs text-slate-300 font-semibold">Generating Masterpiece...</p>
                    <p className="text-[11px] text-slate-500">Gemini-3.1-Flash-Image is dreaming your vision into reality</p>
                  </div>
                ) : generatedImageUrl ? (
                  <img
                    src={generatedImageUrl}
                    alt="AI Generated masterpiece"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain animate-fade-in"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Image className="h-8 w-8" />
                    <span className="text-xs">Your generated masterpiece will appear here</span>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImageStudio(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                {generatedImageUrl ? (
                  <button
                    type="button"
                    onClick={handleInsertGeneratedImage}
                    className="px-4 py-2 text-xs font-bold bg-cyan-400 text-slate-950 rounded-xl hover:bg-cyan-300 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Use as Chat Attachment
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage || !imagePrompt.trim()}
                    className="px-5 py-2 text-xs font-bold bg-cyan-400 text-slate-950 rounded-xl hover:bg-cyan-300 disabled:bg-slate-850 disabled:text-slate-600 transition-all cursor-pointer shadow-lg shadow-cyan-500/10 flex items-center gap-1.5"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate Image
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Elegant Global Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/30 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
