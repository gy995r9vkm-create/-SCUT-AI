/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Globe, Users, Presentation, Tv, Gamepad2, Play, Users2, Calendar, 
  MapPin, Star, Sparkles, MessageSquare, ShieldAlert, Mic, Video,
  Cpu, LayoutGrid, MonitorPlay, ArrowRight, UserCheck
} from 'lucide-react';

interface VirtualWorldPagesProps {
  module: 'virtual_world' | 'meetings' | 'showrooms' | 'events' | 'games';
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, desc: string, category: 'security' | 'billing' | 'api' | 'chat') => void;
}

export default function VirtualWorldPages({ module, user, onNavigate, onAddLog }: VirtualWorldPagesProps) {
  const [selectedRoom, setSelectedRoom] = useState('lobby_prime');
  const [micActive, setMicActive] = useState(false);
  const [camActive, setCamActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleJoinWorld = () => {
    setIsConnecting(true);
    setIsConnected(false);
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
      onAddLog(
        'Connected to Virtual Gateway',
        `Joined virtual room: ${selectedRoom} as ${user?.name || 'Guest'}`,
        'security'
      );
    }, 1800);
  };

  const getModuleConfig = () => {
    switch (module) {
      case 'virtual_world':
        return {
          title: 'SCUT Virtual World',
          subtitle: 'Persistent Multimodal 3D Sandbox',
          icon: Globe,
          color: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5',
          description: 'A shared virtual dimension featuring interactive hubs, avatar meeting zones, and secure operational centers.'
        };
      case 'meetings':
        return {
          title: 'Virtual Meetings Network',
          subtitle: 'Spatial Conferencing & Presentation Nodes',
          icon: Presentation,
          color: 'text-blue-400 border-blue-500/25 bg-blue-500/5',
          description: 'Host dynamic video, audio, or complete 3D spatial meetings with zero latency and high-security file encryption.'
        };
      case 'showrooms':
        return {
          title: 'Virtual Showrooms Portal',
          subtitle: 'Spatial Product Displays & Asset Galleries',
          icon: LayoutGrid,
          color: 'text-indigo-400 border-indigo-500/25 bg-indigo-500/5',
          description: 'Immersive corporate display systems for physical or digital products, smart contracts, and real estate demos.'
        };
      case 'events':
        return {
          title: 'Live Spatial Events',
          subtitle: 'Global Broadcaster & Conference Halls',
          icon: Tv,
          color: 'text-rose-400 border-rose-500/25 bg-rose-500/5',
          description: 'Attend live broadcasts, keynotes, development product reveals, and community panels in real-time.'
        };
      case 'games':
        return {
          title: 'Social & Arcade Hub',
          subtitle: 'Distributed Arcade & Cooperative Arenas',
          icon: Gamepad2,
          color: 'text-amber-400 border-amber-500/25 bg-amber-500/5',
          description: 'Compete in sandbox puzzles, complete educational quizzes, and interact with peers to score free SCUT Credits.'
        };
    }
  };

  const config = getModuleConfig();
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Spatial Metaverse</span>
              <span className="text-[10px] font-mono text-slate-500">Service: WebGL-Tunnel-6</span>
            </div>
            <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl border ${config.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              {config.title}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm font-light mt-1 max-w-2xl">
              {config.subtitle}. {config.description}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 transition-all cursor-pointer"
            >
              Back to Desk
            </button>
          </div>
        </div>

        {/* METAVERSE INTERACTIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CONTROL RACK */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-900 space-y-6">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-cyan-400" /> Gateway Connection
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Select Room Destination</label>
                  <select 
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs font-mono text-slate-200 outline-none"
                  >
                    <option value="lobby_prime">SCUT Plaza (Main Lobby)</option>
                    <option value="conferencing_a">Auditorium Zenith (Meetings)</option>
                    <option value="showroom_alpha">Gallery Horizon (Showroom)</option>
                    <option value="gaming_zone">Cyber Arcade (Games & Social)</option>
                  </select>
                </div>

                <div className="flex justify-between items-center gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                  <span className="text-xs font-mono text-slate-300">Device Checks:</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setMicActive(!micActive)}
                      className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${micActive ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      title="Toggle Microphone"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setCamActive(!camActive)}
                      className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${camActive ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                      title="Toggle Camera"
                    >
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleJoinWorld}
                  disabled={isConnecting || isConnected}
                  className="w-full py-3.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-900 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isConnecting ? 'Opening Portal Tunnel...' : isConnected ? 'Connected' : 'Synchronize Connection'}
                </button>
              </div>
            </div>

            {/* UPCOMING HALL EVENTS */}
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-rose-400" /> Upcoming Spatial Events
              </h3>
              
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-tight">Gemini Model Integrations FAQ</h4>
                    <p className="text-[10px] text-slate-500 font-mono">Auditorium Zenith — Today, 14:00 UTC</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/15">LIVE SOON</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-white leading-tight">Ecosystem Token Governance Ballots</h4>
                    <p className="text-[10px] text-slate-500 font-mono">SCUT Executive Plaza — July 22, 10:00</p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500">SCHED</span>
                </div>
              </div>
            </div>

          </div>

          {/* SIMULATED VIEWPORT GRID */}
          <div className="lg:col-span-8">
            <div className="aspect-video w-full rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden relative shadow-2xl flex flex-col justify-between">
              
              {/* DECORATIVE RADIAL GLOW */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.04),transparent_70%)] pointer-events-none" />

              {/* Viewport Header */}
              <div className="p-4 bg-slate-900/40 border-b border-slate-900/60 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">Viewport: {selectedRoom.toUpperCase()}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-mono text-slate-500">WebGL 2.0</span>
                  <span className="text-[9px] font-mono text-slate-500">60 FPS</span>
                </div>
              </div>

              {/* Center Content Simulation */}
              <div className="flex-1 flex flex-col items-center justify-center p-8 z-10 text-center relative overflow-hidden">
                {isConnecting ? (
                  <div className="space-y-4 animate-pulse">
                    <Cpu className="h-12 w-12 text-cyan-400 mx-auto animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white font-mono">INITIALIZING WEBGL RENDERING SHADERS</p>
                      <p className="text-[10px] text-slate-500 font-mono">Synchronizing spatial vector assets...</p>
                    </div>
                  </div>
                ) : isConnected ? (
                  <div className="space-y-6">
                    {/* AVATAR LIST IN ROOM */}
                    <div className="flex items-center justify-center -space-x-3">
                      <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-cyan-500/20 overflow-hidden shadow-lg">
                        <img src={user?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=user`} className="h-full w-full object-cover" />
                      </div>
                      <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-rose-500/20 overflow-hidden shadow-lg">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=clara" className="h-full w-full object-cover" />
                      </div>
                      <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-amber-500/20 overflow-hidden shadow-lg">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=mario" className="h-full w-full object-cover" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-display font-extrabold text-cyan-400 tracking-tight">Portal Lobby Synced</h3>
                      <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                        You have entered **{selectedRoom.toUpperCase()}**. Move your camera around or trigger safe audio grids in the left panel.
                      </p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => {
                          onAddLog('Virtual Shout', 'Broadcasted a greetings packet to the room', 'chat');
                          alert('Greetings packet broadcasted.');
                        }}
                        className="px-4 py-2 bg-slate-900 border border-slate-800 text-xs font-bold rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="h-4 w-4" /> Say Hello
                      </button>
                      <button 
                        onClick={() => setIsConnected(false)}
                        className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-xs font-bold rounded-xl text-rose-400 hover:bg-rose-500/20 transition-all cursor-pointer"
                      >
                        Disconnect Portal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-sm">
                    <Globe className="h-16 w-16 text-slate-800 mx-auto animate-pulse" />
                    <div className="space-y-1.5">
                      <p className="text-sm font-bold text-slate-400">WebGL Spatial Feed Offline</p>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Please select your room destination and click **Synchronize Connection** in the gateway control board to trigger the 3D rendering pipeline.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Viewport Footer */}
              <div className="p-4 bg-slate-900/20 border-t border-slate-900/60 flex justify-between items-center z-10 shrink-0 text-[10px] font-mono text-slate-500">
                <span>Latency: 12ms</span>
                <span>Active Peers: 3 in lobby</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
