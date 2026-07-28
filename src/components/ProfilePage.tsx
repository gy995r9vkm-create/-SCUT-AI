/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, Mail, Calendar, ShieldCheck, CreditCard, Key, Settings2, LogOut, Check, Save,
  AlertCircle, Shield, Bell, Eye, EyeOff, Lock, Users, MessageSquare, Phone, Heart
} from 'lucide-react';
import { User as UserType } from '../types';

interface ProfilePageProps {
  user: UserType;
  onUpdateUser: (updated: Partial<UserType>) => void;
  onSignOut: () => void;
}

export default function ProfilePage({ user, onUpdateUser, onSignOut }: ProfilePageProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [success, setSuccess] = useState('');
  
  // Custom interface parameters (simulated)
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('You are SCUT AI, a high-reasoning Gemini assistant.');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // New Community Circle, Sex, and Privacy Settings state
  const [sex, setSex] = useState<'female' | 'male' | undefined>(
    user.sex || (user.selectedCommunity === 'women_girls' ? 'female' : user.selectedCommunity === 'men_boys' ? 'male' : undefined)
  );
  const [selectedCommunity, setSelectedCommunity] = useState<'women_girls' | 'men_boys' | 'none'>(user.selectedCommunity || 'none');
  const [whoCanMessageMe, setWhoCanMessageMe] = useState<'all' | 'friends' | 'none'>(user.privacySettings?.whoCanMessageMe || 'all');
  const [whoCanCallMe, setWhoCanCallMe] = useState<'all' | 'friends' | 'none'>(user.privacySettings?.whoCanCallMe || 'all');
  const [whoCanInviteMe, setWhoCanInviteMe] = useState<'all' | 'friends' | 'none'>(user.privacySettings?.whoCanInviteMe || 'all');
  const [whoCanSeeProfile, setWhoCanSeeProfile] = useState<'all' | 'members' | 'none'>(user.privacySettings?.whoCanSeeProfile || 'all');
  const [whoCanSeeOnlineStatus, setWhoCanSeeOnlineStatus] = useState<'all' | 'members' | 'none'>(user.privacySettings?.whoCanSeeOnlineStatus || 'all');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ 
      name, 
      email,
      sex,
      selectedCommunity,
      privacySettings: {
        whoCanMessageMe,
        whoCanCallMe,
        whoCanInviteMe,
        whoCanSeeProfile,
        whoCanSeeOnlineStatus
      }
    });
    setSuccess('Profile details and privacy shields successfully synchronized.');
    setTimeout(() => setSuccess(''), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">Profile Workspace</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your telemetry metadata, subscription, and playground defaults.</p>
        </div>

        {/* Status Alert */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-300">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar and Meta */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full bg-slate-950 border-2 border-cyan-500/40 p-1 overflow-hidden">
                <img 
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`} 
                  alt={user.name} 
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-1 right-1 h-4.5 w-4.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>

            <div>
              <h3 className="font-display text-lg font-bold text-white">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>

            <div className="w-full pt-4 border-t border-slate-800 space-y-2.5 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" /> Joined</span>
                <span className="font-semibold text-slate-200">{user.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Verified</span>
                <span className="font-semibold text-emerald-400">SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-slate-500" /> Billing plan</span>
                <span className="font-semibold text-cyan-400 uppercase">{user.subscriptionTier}</span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-850 hover:bg-red-500/10 hover:border-red-500/30 text-xs font-semibold text-slate-300 hover:text-red-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Account
            </button>
          </div>

          {/* Right Column: Update details & Preferences */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Account Settings form */}
            <form onSubmit={handleSaveProfile} className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-4">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-cyan-400" /> Account Settings
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/10"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Changes
                </button>
              </div>
            </form>

            {/* Community Circles & Privacy Shields */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-6">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-pink-400" /> Community Circles & Privacy Shields
              </h3>

              {/* Community Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Your Declared Community Circle</label>
                <p className="text-[10px] text-slate-500 leading-normal">
                  To protect the integrity of safe spaces, once set, you are filtered into the respective private community channels. Access is strictly separated between Women & Girls and Men & Boys.
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => { setSelectedCommunity('women_girls'); setSex('female'); }}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCommunity === 'women_girls' || sex === 'female'
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart className="h-5 w-5 mx-auto mb-1.5" />
                    <span className="text-xs leading-none">Women & Girls</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedCommunity('men_boys'); setSex('male'); }}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCommunity === 'men_boys' || sex === 'male'
                        ? 'bg-blue-500/10 border-blue-500/40 text-blue-300 font-bold'
                        : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="h-5 w-5 mx-auto mb-1.5" />
                    <span className="text-xs leading-none">Men & Boys</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSelectedCommunity('none'); setSex(undefined); }}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedCommunity === 'none' && !sex
                        ? 'bg-slate-800 border-slate-700 text-slate-300'
                        : 'bg-slate-950 border-slate-850 text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <Users className="h-5 w-5 mx-auto mb-1.5" />
                    <span className="text-xs leading-none">Unallocated</span>
                  </button>
                </div>
              </div>

              {/* Comprehensive Privacy Settings Grid */}
              <div className="pt-2 border-t border-slate-800 space-y-4">
                <label className="block text-xs font-semibold text-slate-300">Privacy Permissions Matrix</label>
                
                <div className="grid sm:grid-cols-2 gap-4 text-xs">
                  {/* Message permission */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block font-medium">Who can Direct Message you</span>
                    <select
                      value={whoCanMessageMe}
                      onChange={(e) => setWhoCanMessageMe(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 p-2 text-xs text-white focus:outline-none focus:border-pink-500/60"
                    >
                      <option value="all">Everyone (Publicly open)</option>
                      <option value="friends">Friends Only</option>
                      <option value="none">No One (Isolated mode)</option>
                    </select>
                  </div>

                  {/* Call permission */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block font-medium">Who can Call you</span>
                    <select
                      value={whoCanCallMe}
                      onChange={(e) => setWhoCanCallMe(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 p-2 text-xs text-white focus:outline-none focus:border-pink-500/60"
                    >
                      <option value="all">Everyone</option>
                      <option value="friends">Friends Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>

                  {/* Group Invite permission */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block font-medium">Who can Invite you to Groups</span>
                    <select
                      value={whoCanInviteMe}
                      onChange={(e) => setWhoCanInviteMe(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 p-2 text-xs text-white focus:outline-none focus:border-pink-500/60"
                    >
                      <option value="all">Everyone</option>
                      <option value="friends">Friends Only</option>
                      <option value="none">No One</option>
                    </select>
                  </div>

                  {/* See Profile permission */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block font-medium">Who can see your Profile details</span>
                    <select
                      value={whoCanSeeProfile}
                      onChange={(e) => setWhoCanSeeProfile(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 p-2 text-xs text-white focus:outline-none focus:border-pink-500/60"
                    >
                      <option value="all">Everyone</option>
                      <option value="members">Community Members Only</option>
                      <option value="none">Private (Hidden mode)</option>
                    </select>
                  </div>

                  {/* See Online status permission */}
                  <div className="space-y-1.5">
                    <span className="text-slate-400 block font-medium">Who can see your Online status</span>
                    <select
                      value={whoCanSeeOnlineStatus}
                      onChange={(e) => setWhoCanSeeOnlineStatus(e.target.value as any)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-850 p-2 text-xs text-white focus:outline-none focus:border-pink-500/60"
                    >
                      <option value="all">Everyone</option>
                      <option value="members">Community Members Only</option>
                      <option value="none">Private (Invisible)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Explicit save profile details button */}
              <div className="flex justify-end pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-pink-400 hover:bg-pink-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-pink-500/10"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Circle & Privacy Settings
                </button>
              </div>
            </div>

            {/* Model defaults preferences */}
            <div className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-6">
              <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                <Shield className="h-4 w-4 text-cyan-400" /> Advanced Model Defaults
              </h3>

              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-medium text-slate-300">Model Temperature (Creativity)</label>
                  <span className="font-mono font-bold text-cyan-400">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-950 rounded-lg appearance-none"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Deterministic (0.0)</span>
                  <span>Creative (1.0)</span>
                  <span>Hyper-vibrant (1.5)</span>
                </div>
              </div>

              {/* System Instructions Default */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-300">Default System Instruction Prompt</label>
                <textarea
                  rows={2}
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-white focus:outline-none focus:border-cyan-500/60 resize-none font-mono"
                />
              </div>

              {/* Telemetry Switch alerts */}
              <div className="flex justify-between items-center bg-slate-950/60 rounded-xl p-4 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-white">Real-time Telemetry Notifications</p>
                  <p className="text-[10px] text-slate-500">Dispatch audit notifications regarding key generations</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    notificationsEnabled ? 'bg-cyan-400' : 'bg-slate-800'
                  }`}
                >
                  <div 
                    className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform duration-300 ${
                      notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`} 
                  />
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
