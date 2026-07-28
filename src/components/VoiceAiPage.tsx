/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, Play, Square, Mic, Sliders, RefreshCw, Star, Info, VolumeX, Download, Disc } from 'lucide-react';
import { User } from '../types';

interface VoiceAiPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface SpeechPreset {
  id: string;
  name: string;
  voiceURI: string;
  lang: string;
}

export default function VoiceAiPage({ user, onNavigate, onAddLog }: VoiceAiPageProps) {
  const [text, setText] = useState('Welcome to SCUT AI Multimodal Voice Synthesis. Experience real-time latency-free neural audio rendering directly inside your browser container.');
  const [pitch, setPitch] = useState(1);
  const [rate, setRate] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState('');
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(15));

  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        if (availableVoices.length > 0 && !selectedVoiceURI) {
          // Default to an English voice if available, otherwise first
          const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
          setSelectedVoiceURI(defaultVoice.voiceURI);
        }
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Simulate waves while speaking
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => Math.floor(Math.random() * 45) + 8));
      }, 100);
    } else {
      setWaveformBars(Array(24).fill(12));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSpeak = () => {
    if (!text.trim() || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // cancel any active speech

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find matching voice
    const activeVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (activeVoice) {
      utterance.voice = activeVoice;
    }
    
    utterance.pitch = pitch;
    utterance.rate = rate;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
    onAddLog('Voice Synthesized', `Spoke text of length ${text.length} with ${activeVoice?.name || 'default'}`, 'chat');
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Volume2 className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Speech Services</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Voice AI</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Real-time TTS (Text-to-Speech) orchestrator. Leverage high-quality local client runtimes with granular control.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Back to Chat Workspace
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Control Board (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Sliders className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">Acoustic Parameters</h2>
          </div>

          {/* Voice selector */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Target voice profiles</label>
            <select 
              value={selectedVoiceURI}
              onChange={(e) => setSelectedVoiceURI(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60"
            >
              {voices.length === 0 ? (
                <option value="">No System Voices Detected</option>
              ) : (
                voices.map((v, idx) => (
                  <option key={idx} value={v.voiceURI}>{v.name} ({v.lang})</option>
                ))
              )}
            </select>
          </div>

          {/* Speed Rate slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Synthesis Speed</span>
              <span className="text-cyan-400 font-mono">{rate}x</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-semibold">
              <span>Slower</span>
              <span>Fast Speed</span>
            </div>
          </div>

          {/* Pitch slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
              <span className="text-slate-400">Vocal Pitch</span>
              <span className="text-cyan-400 font-mono">{pitch}</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-slate-600 font-semibold">
              <span>Deep Voice</span>
              <span>High Pitch</span>
            </div>
          </div>

          {/* Audio stream details info */}
          <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-3 space-y-2 text-[10px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-300">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span>Synthesis Latency Info</span>
            </div>
            <p className="font-light">
              This module operates a client-side audio pipeline utilizing HTML5 Web Audio nodes. Spoken responses are rendered on-device with zero server roundtrip overhead.
            </p>
          </div>
        </div>

        {/* Right Studio Board (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visual Waveform & Audio Status Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center space-y-8 relative overflow-hidden shadow-xl">
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            
            {/* Spinning Disc / Logo */}
            <div className="relative">
              <div className={`p-6 rounded-full border border-slate-900 bg-slate-900/30 relative flex items-center justify-center ${isPlaying ? 'animate-pulse' : ''}`}>
                <Disc className={`h-12 w-12 text-cyan-400 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
              </div>
              {isPlaying && (
                <div className="absolute inset-0 border border-cyan-500/20 rounded-full animate-ping pointer-events-none" />
              )}
            </div>

            {/* Interactive wave visualizer bars */}
            <div className="flex items-center gap-1 h-16 w-full justify-center max-w-md px-4">
              {waveformBars.map((h, index) => (
                <motion.div
                  key={index}
                  animate={{ height: h }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className={`w-1.5 rounded-full ${isPlaying ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.4)]' : 'bg-slate-800'}`}
                />
              ))}
            </div>

            {/* Audio Stream parameters indicators */}
            <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 bg-slate-900/40 border border-slate-900 rounded-xl px-4 py-2">
              <span className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
                STATUS: {isPlaying ? 'STREAMING' : 'IDLE'}
              </span>
              <span>•</span>
              <span>PITCH: {pitch}</span>
              <span>•</span>
              <span>RATE: {rate}x</span>
            </div>
          </div>

          {/* Interactive Text Input and controls block */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Input Prompt / Text Document</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to convert to spoken voice..."
                className="w-full bg-slate-900 border border-slate-850 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-600 h-36 font-light leading-relaxed resize-none"
              />
            </div>

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setText('')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  Clear Sheet
                </button>
                <button
                  onClick={() => setText('Greetings. This is SCUT Voice Intelligence system. Proceeding with network telemetry audit logs verification.')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white cursor-pointer transition-all"
                >
                  Load Sample
                </button>
              </div>

              <div className="flex items-center gap-3">
                {isPlaying ? (
                  <button
                    onClick={handleStop}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-red-950/25"
                  >
                    <Square className="h-4 w-4" />
                    <span>Stop Wave</span>
                  </button>
                ) : (
                  <button
                    onClick={handleSpeak}
                    disabled={!text.trim()}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-500/10"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Generate Voice</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
