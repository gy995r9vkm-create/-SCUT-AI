/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Smartphone, Monitor, ShieldCheck, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

interface ConnectedDevicesPageProps {
  onNavigate: (page: string) => void;
}

export default function ConnectedDevicesPage({ onNavigate }: ConnectedDevicesPageProps) {
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'MacBook Pro (Chrome)', location: 'Bucharest, RO', current: true, ip: '194.102.23.41', date: 'Active Now' },
    { id: 'sess-2', device: 'Apple iPhone 15 Pro (Safari)', location: 'Cluj-Napoca, RO', current: false, ip: '82.137.9.112', date: '2 hours ago' },
    { id: 'sess-3', device: 'Linux Dev Container Node (Axios Client)', location: 'London, UK', current: false, ip: '109.224.15.54', date: 'July 18, 2026' }
  ]);

  const handleRevoke = (id: string) => {
    setSessions(sessions.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Security Credentials</span>
            <span className="text-[10px] font-mono text-slate-500">Node Validation Syncing</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Smartphone className="h-8 w-8 text-cyan-400" />
            Connected Devices
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Monitor and control active web sessions, hardware signing credentials, and revoke authorizations instantaneously.
          </p>
        </div>

        {/* DETAILS LIST */}
        <div className="p-6 rounded-3xl bg-slate-900/20 border border-slate-900 space-y-4">
          <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-cyan-400" /> Authorized Web Sessions
          </h2>

          <div className="space-y-4">
            {sessions.map((sess) => (
              <div key={sess.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-900/80 hover:border-slate-850 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-850 text-cyan-400">
                    {sess.device.includes('iPhone') ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs font-bold text-slate-200">{sess.device}</h3>
                      {sess.current && (
                        <span className="text-[8px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-light">{sess.location} • {sess.ip}</p>
                    <p className="text-[9px] font-mono text-slate-500">{sess.date}</p>
                  </div>
                </div>

                {!sess.current && (
                  <button 
                    onClick={() => handleRevoke(sess.id)}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-all self-end sm:self-auto cursor-pointer"
                    title="Terminate Session"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
