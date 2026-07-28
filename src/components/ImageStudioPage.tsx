/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Image, Wand2, Download, Copy, RefreshCw, ZoomIn, Eye, Sparkles, Sliders, Trash2, Heart, ArrowRight } from 'lucide-react';
import { User } from '../types';

interface ImageStudioPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  aspectRatio: string;
  url: string;
  createdAt: string;
  isLiked?: boolean;
}

const STYLES_CONFIG = [
  { id: 'photorealistic', name: 'Photorealistic', desc: 'Ultra-detailed realistic render' },
  { id: 'anime', name: 'Anime/Manga', desc: 'Japanese cell-shaded animation style' },
  { id: 'digital-art', name: 'Digital Painting', desc: 'Vibrant colors and textured brush strokes' },
  { id: 'cyberpunk', name: 'Cyberpunk', desc: 'Neon lighting, high-tech dystopian vibe' },
  { id: 'surrealism', name: 'Surrealism', desc: 'Dream-like structures and fantasy art' },
  { id: 'minimalist', name: 'Minimalist Vect', desc: 'Flat shapes and clean vector lines' }
];

const RATIOS_CONFIG = [
  { id: '1:1', name: 'Square (1:1)', class: 'aspect-square' },
  { id: '16:9', name: 'Landscape (16:9)', class: 'aspect-video' },
  { id: '9:16', name: 'Portrait (9:16)', class: 'aspect-[9/16]' },
  { id: '4:3', name: 'Standard (4:3)', class: 'aspect-[4/3]' }
];

export default function ImageStudioPage({ user, onNavigate, onAddLog }: ImageStudioPageProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generations, setGenerations] = useState<GeneratedImage[]>(() => {
    const cached = localStorage.getItem('scut_generated_images');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      {
        id: 'img-1',
        prompt: 'Futuristic floating city wrapped in digital neon grids, high resolution, octanerender',
        style: 'cyberpunk',
        aspectRatio: '16:9',
        url: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=800&q=80',
        createdAt: '7/18/2026, 11:00 AM',
        isLiked: true
      },
      {
        id: 'img-2',
        prompt: 'Minimalist white cat wearing cyan glasses looking out the window of a spaceship',
        style: 'minimalist',
        aspectRatio: '1:1',
        url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        createdAt: '7/18/2026, 10:45 AM',
        isLiked: false
      }
    ];
  });
  const [activePreview, setActivePreview] = useState<GeneratedImage | null>(null);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    setTimeout(async () => {
      // Build a beautiful visual seed depending on prompt & style using picsum/unsplash keywords
      const seed = Math.floor(Math.random() * 1000);
      const queryKeywords = prompt.split(' ').slice(0, 3).join(',');
      const styleTag = STYLES_CONFIG.find(s => s.id === selectedStyle)?.name || 'art';
      const finalUrl = `https://images.unsplash.com/featured/?sig=${seed}&${encodeURIComponent(queryKeywords)},${encodeURIComponent(styleTag)}`;
      
      const newImg: GeneratedImage = {
        id: 'img-' + Math.random().toString(36).substring(2, 9),
        prompt: prompt.trim(),
        style: selectedStyle,
        aspectRatio: selectedRatio,
        url: finalUrl,
        createdAt: new Date().toLocaleString(),
        isLiked: false
      };

      const updated = [newImg, ...generations];
      setGenerations(updated);
      localStorage.setItem('scut_generated_images', JSON.stringify(updated));
      setIsGenerating(false);
      setPrompt('');
      await onAddLog('Generated Image', `Prompt: "${newImg.prompt.substring(0, 30)}..."`, 'chat');
    }, 2500);
  };

  const handleToggleLike = (id: string) => {
    const updated = generations.map(img => img.id === id ? { ...img, isLiked: !img.isLiked } : img);
    setGenerations(updated);
    localStorage.setItem('scut_generated_images', JSON.stringify(updated));
  };

  const handleDelete = (id: string) => {
    const updated = generations.filter(img => img.id !== id);
    setGenerations(updated);
    localStorage.setItem('scut_generated_images', JSON.stringify(updated));
    if (activePreview?.id === id) setActivePreview(null);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Image className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Creative Suite</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Image Studio</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Co-pilot for high-fidelity vector and pixel assets. Powered by Google AI weights and prompt engineering parameters.
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
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">Studio Settings</h2>
          </div>

          {/* Model selection */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Diffusion Engine</label>
            <select className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60">
              <option value="scut-im-v4">SCUT Image Flux v4.0</option>
              <option value="imagen-3">Google Imagen 3 (Pro)</option>
              <option value="gemini-visual">Gemini Ultra Multimodal Synthesis</option>
            </select>
          </div>

          {/* Ratio choices */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aspect Ratio</label>
            <div className="grid grid-cols-2 gap-2">
              {RATIOS_CONFIG.map(ratio => (
                <button
                  key={ratio.id}
                  onClick={() => setSelectedRatio(ratio.id)}
                  className={`py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                    selectedRatio === ratio.id 
                    ? 'border-cyan-500/50 bg-cyan-500/5 text-cyan-400' 
                    : 'border-slate-850 bg-slate-900/60 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-semibold">{ratio.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style list */}
          <div className="space-y-2">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Artistic Direction</label>
            <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {STYLES_CONFIG.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStyle(st.id)}
                  className={`w-full py-2 px-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col ${
                    selectedStyle === st.id 
                    ? 'border-cyan-500/50 bg-cyan-500/5 text-cyan-400' 
                    : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold">{st.name}</span>
                  <span className="text-[9px] text-slate-500 font-light">{st.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Pro parameters info */}
          <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 text-[10px] leading-relaxed text-slate-400">
            <Sparkles className="h-4 w-4 text-cyan-400 mb-1.5" />
            <p className="font-light">
              <span className="font-semibold text-cyan-400">Pro tip:</span> Try adding technical render prompts like <code className="text-white">"octane render, raytraced, unreal engine 5, volumetrics"</code> for realistic outputs.
            </p>
          </div>
        </div>

        {/* Right Generator and Grid Canvas (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main generator prompt bar */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-stretch gap-3 shadow-lg">
            <div className="relative flex-grow flex items-center">
              <Wand2 className="absolute left-3.5 h-4 w-4 text-cyan-400" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to imagine..."
                className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-500"
                onKeyDown={(e) => { if (e.key === 'Enter') handleGenerate(); }}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <span>Imagine Asset</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Grid of generated assets */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest font-bold text-slate-400">Generation History</h3>
            
            {generations.length === 0 ? (
              <div className="border border-dashed border-slate-900 rounded-2xl py-16 text-center text-slate-500">
                <Image className="h-10 w-10 mx-auto text-slate-700 mb-3" />
                <p className="text-xs font-semibold">No assets imagined yet</p>
                <p className="text-[10px] text-slate-600 mt-1">Submit your first descriptive prompt to start rendering.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generations.map(img => {
                  const ratioClass = RATIOS_CONFIG.find(r => r.id === img.aspectRatio)?.class || 'aspect-square';
                  return (
                    <motion.div
                      layoutId={`img-card-${img.id}`}
                      key={img.id}
                      className="group relative bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-md flex flex-col"
                    >
                      {/* Image viewport */}
                      <div className={`relative w-full ${ratioClass} bg-slate-900 overflow-hidden`}>
                        <img 
                          src={img.url} 
                          alt={img.prompt}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-4">
                          <div className="flex gap-2 w-full justify-end">
                            <button
                              onClick={() => setActivePreview(img)}
                              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white cursor-pointer transition-all border border-slate-800"
                              title="Full screen view"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <a
                              href={img.url}
                              target="_blank"
                              rel="noreferrer"
                              download={`scut-asset-${img.id}.jpg`}
                              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-cyan-400 cursor-pointer transition-all border border-slate-800"
                              title="Download Asset"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </a>
                            <button
                              onClick={() => handleToggleLike(img.id)}
                              className={`p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 cursor-pointer transition-all border border-slate-800 ${img.isLiked ? 'text-red-500' : 'text-slate-400'}`}
                            >
                              <Heart className="h-3.5 w-3.5 fill-current" />
                            </button>
                            <button
                              onClick={() => handleDelete(img.id)}
                              className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-950 text-red-400 cursor-pointer transition-all border border-red-950/40"
                              title="Purge"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Text info block */}
                      <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                        <p className="text-xs leading-relaxed text-slate-300 font-light line-clamp-2">
                          "{img.prompt}"
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 capitalize font-semibold text-slate-400">{img.style}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-semibold text-slate-400">{img.aspectRatio}</span>
                          </div>
                          <span>{img.createdAt}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Full preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActivePreview(null)} />
          
          <div className="relative max-w-4xl w-full bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
            <div className="flex-grow bg-slate-900 flex items-center justify-center overflow-hidden max-h-[50vh] md:max-h-full">
              <img 
                src={activePreview.url} 
                alt={activePreview.prompt} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="w-full md:w-80 p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-900 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Asset Details</span>
                  <button 
                    onClick={() => setActivePreview(null)}
                    className="text-xs text-slate-400 hover:text-white cursor-pointer font-bold px-2 py-1 bg-slate-900 rounded-lg"
                  >
                    Close
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Descriptive Prompt</label>
                  <p className="text-xs leading-relaxed text-slate-300 font-light">
                    "{activePreview.prompt}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-2.5">
                    <span className="text-slate-500 block">Style Preset</span>
                    <span className="text-white font-semibold capitalize mt-0.5 block">{activePreview.style}</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 rounded-xl p-2.5">
                    <span className="text-slate-500 block">Aspect Ratio</span>
                    <span className="text-white font-semibold mt-0.5 block">{activePreview.aspectRatio}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={activePreview.url}
                  target="_blank"
                  rel="noreferrer"
                  download={`scut-${activePreview.id}.jpg`}
                  className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download High-Res</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activePreview.prompt);
                    alert("Prompt copied to clipboard!");
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 font-sans font-semibold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Prompt Parameters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
