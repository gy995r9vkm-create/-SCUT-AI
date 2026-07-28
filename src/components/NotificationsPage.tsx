/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, ShieldAlert, Sparkles, AlertCircle, Check, Trash2, Mail, MessageSquare, ToggleLeft, Settings, CheckCircle } from 'lucide-react';
import { User } from '../types';

interface NotificationsPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'security' | 'feature' | 'system';
  createdAt: string;
  isRead: boolean;
}

export default function NotificationsPage({ user, onNavigate, onAddLog }: NotificationsPageProps) {
  const [items, setItems] = useState<NotificationItem[]>([
    {
      id: 'nt-1',
      title: 'Successful Authentication Attempt',
      message: 'New login detected from IP 84.15.112.92 (London, UK) using Chrome/macOS.',
      type: 'security',
      createdAt: '7/18/2026, 11:10 AM',
      isRead: false
    },
    {
      id: 'nt-2',
      title: 'Multimodal Image Studio Launched',
      message: 'You have been granted early access to the neural image asset synthesis modules.',
      type: 'feature',
      createdAt: '7/18/2026, 09:30 AM',
      isRead: false
    },
    {
      id: 'nt-3',
      title: 'Monthly Token Allocation Renewed',
      message: 'Your pro membership tier usage bounds have been refreshed. Next billing date: 8/18/2026.',
      type: 'system',
      createdAt: '7/18/2026, 00:01 AM',
      isRead: true
    }
  ]);

  // Channel settings
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [marketingAlerts, setMarketingAlerts] = useState(false);

  const handleMarkAsRead = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
  };

  const handleClearAll = async () => {
    setItems([]);
    await onAddLog('Cleared Alerts Feed', 'Flushed all system alerts from the main feed', 'security');
  };

  const handleToggleChannel = async (channel: string, current: boolean, setter: (v: boolean) => void) => {
    setter(!current);
    await onAddLog('Channel Preference Modified', `Preference "${channel}" toggled to ${!current}`, 'security');
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Bell className="h-5 w-5 animate-bounce" />
            <span className="text-xs uppercase tracking-widest font-bold">Account Center</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Alerts & Notifications</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Monitor real-time security logs, system maintenance alerts, and customized feature releases.
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
        
        {/* Left Preference Settings (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
            <Settings className="h-4 w-4 text-cyan-400" />
            <h2 className="text-xs uppercase tracking-wider font-bold text-slate-300">Dispatch Preference</h2>
          </div>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-cyan-400" /> Email Reports</span>
                <p className="text-[10px] text-slate-500 font-light">Dispatches monthly activity reports & billing invoices.</p>
              </div>
              <button 
                onClick={() => handleToggleChannel('Email Reports', emailAlerts, setEmailAlerts)}
                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex ${emailAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'}`}
              >
                <div className="w-4 h-4 bg-slate-950 rounded-full shadow-md" />
              </button>
            </div>

            {/* Critical Security */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5 text-red-400" /> Urgent Security Alerts</span>
                <p className="text-[10px] text-slate-500 font-light">Immediate dispatches for strange logins or revoked credentials.</p>
              </div>
              <button 
                onClick={() => handleToggleChannel('Security Alerts', securityAlerts, setSecurityAlerts)}
                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex ${securityAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'}`}
              >
                <div className="w-4 h-4 bg-slate-950 rounded-full shadow-md" />
              </button>
            </div>

            {/* Feature releases */}
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Feature Releases</span>
                <p className="text-[10px] text-slate-500 font-light">Announcements of new neural models and developer tools.</p>
              </div>
              <button 
                onClick={() => handleToggleChannel('Feature Releases', marketingAlerts, setMarketingAlerts)}
                className={`w-10 h-5 rounded-full p-0.5 cursor-pointer transition-colors flex ${marketingAlerts ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'}`}
              >
                <div className="w-4 h-4 bg-slate-950 rounded-full shadow-md" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Live Feed Table (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300">Live Telemetry Alerts</h2>
            {items.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[10px] uppercase font-bold text-red-400 hover:text-red-350 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Feed
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="py-24 text-center text-slate-600 space-y-3">
              <CheckCircle className="h-10 w-10 mx-auto text-green-500/20" />
              <p className="text-xs font-semibold">Workspace completely silent</p>
              <p className="text-[10px] text-slate-700">No telemetry log alerts or security warnings pending review.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-xl flex items-start justify-between gap-4 transition-all ${
                    alert.isRead 
                    ? 'bg-slate-900/20 border-slate-900 text-slate-400' 
                    : 'bg-slate-900/60 border-slate-850 text-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {alert.type === 'security' ? (
                        <ShieldAlert className="h-4 w-4 text-red-400" />
                      ) : alert.type === 'feature' ? (
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-cyan-500" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          alert.type === 'security' ? 'bg-red-500/10 text-red-400' : 'bg-cyan-500/10 text-cyan-400'
                        }`}>
                          {alert.type}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">{alert.createdAt}</span>
                      </div>
                      <h4 className="text-xs font-semibold">{alert.title}</h4>
                      <p className="text-[11px] leading-relaxed font-light text-slate-400">
                        {alert.message}
                      </p>
                    </div>
                  </div>

                  {!alert.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="p-1 text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 rounded cursor-pointer transition-all shrink-0"
                      title="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
