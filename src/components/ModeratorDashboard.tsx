/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, AlertTriangle, CheckCircle, Ban, Volume2, VolumeX, ShieldAlert,
  Search, Flag, Trash2, Calendar, FileText, UserMinus, UserCheck, 
  Settings, Layers, RefreshCw, Eye, MessageSquare, AlertCircle
} from 'lucide-react';
import { 
  getAllReports, updateReportStatus, getAllModerationLogs, writeModerationLog,
  getUserModStatus, saveUserModStatus, handleAutomaticViolation, 
  ModerationReport, ModerationLog, UserModStatus, COMMUNITY_GUIDELINES
} from '../lib/moderationEngine';

interface ModeratorDashboardProps {
  user: any;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

export default function ModeratorDashboard({ user, onNavigate, onAddLog }: ModeratorDashboardProps) {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [selectedReport, setSelectedReport] = useState<ModerationReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'users' | 'logs' | 'policies'>('queue');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Users lookup status
  const [userStatusList, setUserStatusList] = useState<UserModStatus[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [targetUserName, setTargetUserName] = useState('');
  const [customMuteMin, setCustomMuteMin] = useState('60');

  useEffect(() => {
    loadModerationData();
  }, []);

  const loadModerationData = async () => {
    const repList = await getAllReports();
    const logList = await getAllModerationLogs();
    setReports(repList);
    setLogs(logList);

    // Mock some registered users status list for management
    const users = [
      { userId: 'bad-user-1', userName: 'SpammyGabi', violationsCount: 1, isBanned: false, muteUntil: null, lastViolationAt: '2026-07-20 09:30' },
      { userId: 'bad-user-2', userName: 'CasinoKing', violationsCount: 2, isBanned: false, muteUntil: new Date(Date.now() + 10 * 60 * 1000).toISOString(), lastViolationAt: '2026-07-20 10:10' },
      { userId: 'u-1', userName: 'Ana Maria Radu', violationsCount: 0, isBanned: false, muteUntil: null, lastViolationAt: null },
      { userId: 'u-2', userName: 'Mihai Daniel', violationsCount: 0, isBanned: false, muteUntil: null, lastViolationAt: null }
    ];
    setUserStatusList(users);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleResolveReport = async (reportId: string, actionType: 'resolve' | 'dismiss') => {
    const status = actionType === 'resolve' ? 'resolved' : 'dismissed';
    await updateReportStatus(reportId, status);
    
    // Log manual moderator action
    if (actionType === 'resolve' && selectedReport) {
      await writeModerationLog({
        id: 'log-' + Math.random().toString(36).substring(2, 9),
        moderatorId: user?.email || 'moderator',
        moderatorName: user?.name || 'Moderator',
        targetUserId: selectedReport.targetOwnerId,
        targetUserName: selectedReport.targetOwnerName,
        actionType: 'block_content',
        reason: `Manual verification of report: ${selectedReport.reason}`,
        details: `Report resolved. Flagged content: "${selectedReport.targetContent}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    showToast(`Report has been successfully marked as ${status.toUpperCase()}`);
    setSelectedReport(null);
    loadModerationData();
    onAddLog('Moderator Action', `Marked report ${reportId} as ${status}`, 'security');
  };

  const handleManualBan = async (userId: string, userName: string) => {
    const status = await getUserModStatus(userId, userName);
    const updated: UserModStatus = {
      ...status,
      isBanned: true,
      lastViolationAt: new Date().toISOString()
    };
    await saveUserModStatus(updated);

    await writeModerationLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      moderatorId: user?.email || 'moderator',
      moderatorName: user?.name || 'Moderator',
      targetUserId: userId,
      targetUserName: userName,
      actionType: 'ban',
      reason: 'Manual moderator intervention: Permanent community ban',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`User ${userName} has been permanently banned.`);
    loadModerationData();
    onAddLog('Manual Ban Issued', `Permanently banned ${userName} (${userId})`, 'security');
  };

  const handleManualUnban = async (userId: string, userName: string) => {
    const status = await getUserModStatus(userId, userName);
    const updated: UserModStatus = {
      ...status,
      isBanned: false
    };
    await saveUserModStatus(updated);

    await writeModerationLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      moderatorId: user?.email || 'moderator',
      moderatorName: user?.name || 'Moderator',
      targetUserId: userId,
      targetUserName: userName,
      actionType: 'unban',
      reason: 'Manual moderator pardon: Ban lifted',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`Ban lifted for user ${userName}.`);
    loadModerationData();
    onAddLog('Manual Ban Lifted', `Unbanned ${userName}`, 'security');
  };

  const handleManualMute = async (userId: string, userName: string, minutes: number) => {
    const status = await getUserModStatus(userId, userName);
    const muteUntil = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    const updated: UserModStatus = {
      ...status,
      muteUntil,
      lastViolationAt: new Date().toISOString()
    };
    await saveUserModStatus(updated);

    await writeModerationLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      moderatorId: user?.email || 'moderator',
      moderatorName: user?.name || 'Moderator',
      targetUserId: userId,
      targetUserName: userName,
      actionType: 'mute',
      reason: `Manual moderator mute for ${minutes} minutes`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`User ${userName} has been muted until ${new Date(muteUntil).toLocaleTimeString()}.`);
    loadModerationData();
    onAddLog('Manual Mute Issued', `Muted ${userName} for ${minutes} mins`, 'security');
  };

  const handleManualUnmute = async (userId: string, userName: string) => {
    const status = await getUserModStatus(userId, userName);
    const updated: UserModStatus = {
      ...status,
      muteUntil: null
    };
    await saveUserModStatus(updated);

    await writeModerationLog({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      moderatorId: user?.email || 'moderator',
      moderatorName: user?.name || 'Moderator',
      targetUserId: userId,
      targetUserName: userName,
      actionType: 'unmute',
      reason: 'Manual moderator unmute',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    showToast(`User ${userName} has been unmuted.`);
    loadModerationData();
    onAddLog('Manual Unmute Issued', `Unmuted ${userName}`, 'security');
  };

  const filteredReports = reports.filter(r => 
    r.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.targetOwnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.targetContent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.targetUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.actionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 min-h-[calc(100vh-64px)] font-sans relative">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-2xl shadow-emerald-950/20 max-w-sm"
          >
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
            <p className="text-xs font-semibold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
                  SCUT Trust & Safety HQ
                  <span className="text-[10px] font-mono tracking-widest text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded border border-red-400/20 uppercase font-bold">Moderator Mode</span>
                </h1>
                <p className="text-xs text-slate-500">Global moderation queue, real-time safety logs, and penalty controllers.</p>
              </div>
            </div>
          </div>
          <button 
            onClick={loadModerationData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
          </button>
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Unresolved Reports</p>
            <h3 className="text-2xl font-extrabold font-display text-red-400 mt-1">
              {reports.filter(r => r.status === 'pending').length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Awaiting manual validation</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Automated Filters Triggers</p>
            <h3 className="text-2xl font-extrabold font-display text-amber-400 mt-1">
              {logs.filter(l => l.moderatorId === 'system-bot').length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Auto-blocked content logs</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Muted Offenders</p>
            <h3 className="text-2xl font-extrabold font-display text-cyan-400 mt-1">
              {userStatusList.filter(u => u.muteUntil && new Date(u.muteUntil) > new Date()).length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Temporarily locked accounts</p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
            <p className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Permanent Bans</p>
            <h3 className="text-2xl font-extrabold font-display text-rose-500 mt-1">
              {userStatusList.filter(u => u.isBanned).length}
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">Repeat offenders blocklisted</p>
          </div>
        </div>

        {/* NAVIGATION & SEARCH TABS */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/20 p-2.5 border border-slate-900 rounded-2xl">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'queue', name: 'Reports Queue', icon: Flag, count: reports.filter(r => r.status === 'pending').length },
              { id: 'users', name: 'User Directory & Penalties', icon: ShieldAlert, count: 0 },
              { id: 'logs', name: 'Safety Logs', icon: FileText, count: 0 },
              { id: 'policies', name: 'Safety Rules & Lexicon', icon: Settings, count: 0 }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-red-500/10 border border-red-500/15 text-red-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-mono font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search reports or logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl py-1.5 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/30 transition-all font-mono"
            />
          </div>
        </div>

        {/* MAIN SPLIT VIEW OR CONTENT BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT AREA: MAIN TABS CONTENT */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* TAB: QUEUE */}
            {activeSubTab === 'queue' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white px-1">Active User Reports Queue</h3>
                {filteredReports.length === 0 ? (
                  <div className="bg-slate-900/20 border border-dashed border-slate-900 p-8 text-center rounded-2xl">
                    <CheckCircle className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Reports queue is completely clear!</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Platform community members are safe and respectful.</p>
                  </div>
                ) : (
                  filteredReports.map(report => (
                    <div 
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedReport?.id === report.id
                          ? 'bg-slate-900/60 border-red-500/30 shadow-lg shadow-red-950/10'
                          : 'bg-slate-900/30 border-slate-900 hover:bg-slate-900/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                            report.status === 'pending'
                              ? 'bg-red-400/10 text-red-400 border-red-400/20'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {report.targetType} report
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">ID: {report.id}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">{report.createdAt}</span>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs text-slate-400">
                          Reporter: <span className="text-white font-semibold">{report.reporterName}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          Accused Member: <span className="text-red-400 font-semibold">{report.targetOwnerName}</span>
                        </p>
                        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 my-2 font-mono text-[11px] text-slate-300 relative overflow-hidden">
                          <p className="leading-relaxed whitespace-pre-line">{report.targetContent}</p>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          Reason: <span className="text-amber-400">{report.reason}</span>
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB: DIRECTORY & PENALTIES */}
            {activeSubTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Manual Action Penalty Terminal</h4>
                    <p className="text-[9px] text-slate-500 font-mono">Issue mute or ban tokens manually</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-mono">TARGET USER EMAIL / ID</label>
                      <input 
                        type="text" 
                        placeholder="e.g. bad-user-1" 
                        value={targetUserId}
                        onChange={(e) => setTargetUserId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-slate-500 font-mono">TARGET USER NAME</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SpammyGabi" 
                        value={targetUserName}
                        onChange={(e) => setTargetUserName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => handleManualMute(targetUserId || 'bad-user-1', targetUserName || 'SpammyGabi', parseInt(customMuteMin))}
                      disabled={!targetUserId}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <VolumeX className="h-4 w-4" /> Mute User ({customMuteMin} mins)
                    </button>
                    <button
                      onClick={() => handleManualBan(targetUserId || 'bad-user-1', targetUserName || 'SpammyGabi')}
                      disabled={!targetUserId}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 disabled:opacity-50 transition-all cursor-pointer"
                    >
                      <Ban className="h-4 w-4" /> Permanent Ban
                    </button>
                    <div className="flex items-center gap-1 ml-auto shrink-0">
                      <span className="text-[10px] text-slate-500 font-mono">Mins:</span>
                      <input 
                        type="number" 
                        value={customMuteMin}
                        onChange={(e) => setCustomMuteMin(e.target.value)}
                        className="w-14 bg-slate-950 border border-slate-850 rounded-xl px-2 py-1 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white px-1">Ecosystem Infraction Register</h4>
                  <div className="border border-slate-900 rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900/40 text-[10px] text-slate-500 font-mono uppercase tracking-wider border-b border-slate-900">
                        <tr>
                          <th className="p-3">Member ID / Name</th>
                          <th className="p-3">Violations</th>
                          <th className="p-3">Mute Status</th>
                          <th className="p-3">Ban Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {userStatusList.map((usr) => {
                          const isMuted = usr.muteUntil && new Date(usr.muteUntil) > new Date();
                          return (
                            <tr key={usr.userId} className="hover:bg-slate-900/10 transition-all">
                              <td className="p-3">
                                <p className="font-semibold text-white">{usr.userName}</p>
                                <p className="text-[9px] text-slate-500 font-mono">{usr.userId}</p>
                              </td>
                              <td className="p-3">
                                <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                                  usr.violationsCount >= 3 
                                    ? 'bg-red-500/20 text-red-400' 
                                    : usr.violationsCount >= 1 
                                    ? 'bg-amber-500/20 text-amber-400' 
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {usr.violationsCount} infractions
                                </span>
                              </td>
                              <td className="p-3">
                                {isMuted ? (
                                  <span className="text-cyan-400 font-mono font-bold flex items-center gap-1 text-[10px]">
                                    <VolumeX className="h-3 w-3 animate-pulse" />
                                    Active (Until {new Date(usr.muteUntil!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px] font-mono flex items-center gap-1">
                                    <Volume2 className="h-3 w-3" /> Chat Allowed
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                {usr.isBanned ? (
                                  <span className="text-rose-500 font-mono font-extrabold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">BANNED</span>
                                ) : (
                                  <span className="text-emerald-400 font-mono font-semibold">Active</span>
                                )}
                              </td>
                              <td className="p-3 text-right space-x-1.5">
                                {isMuted ? (
                                  <button 
                                    onClick={() => handleManualUnmute(usr.userId, usr.userName)}
                                    className="px-2 py-1 text-[10px] font-bold bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg cursor-pointer"
                                  >
                                    Unmute
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleManualMute(usr.userId, usr.userName, 60)}
                                    className="px-2 py-1 text-[10px] font-bold bg-slate-900 hover:bg-slate-850 text-slate-400 rounded-lg cursor-pointer"
                                  >
                                    Mute 1h
                                  </button>
                                )}
                                {usr.isBanned ? (
                                  <button 
                                    onClick={() => handleManualUnban(usr.userId, usr.userName)}
                                    className="px-2 py-1 text-[10px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg cursor-pointer"
                                  >
                                    Unban
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => handleManualBan(usr.userId, usr.userName)}
                                    className="px-2 py-1 text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer"
                                  >
                                    Ban
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SAFETY LOGS */}
            {activeSubTab === 'logs' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white px-1">Trust & Safety Activity Logs</h3>
                <div className="space-y-2">
                  {filteredLogs.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 border border-slate-900 rounded-2xl">
                      No logs matching your criteria.
                    </div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="p-3.5 bg-slate-900/30 border border-slate-900 rounded-2xl flex items-start gap-3">
                        <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                          log.actionType === 'ban' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : log.actionType === 'mute' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                            : log.actionType === 'warning' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          <Shield className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-white">
                              {log.actionType.toUpperCase()}: <span className="text-slate-400">{log.targetUserName}</span>
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-relaxed">{log.reason}</p>
                          {log.details && (
                            <p className="text-[10px] text-slate-500 font-mono mt-1 bg-slate-950/40 px-2 py-1 rounded border border-slate-900/80">{log.details}</p>
                          )}
                          <p className="text-[9px] text-slate-500 font-mono mt-1.5 flex items-center gap-1">
                            <span>Authorized by:</span>
                            <span className="text-slate-400 font-semibold">{log.moderatorName}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB: RULES & POLICY */}
            {activeSubTab === 'policies' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Flag className="h-4 w-4 text-red-400" /> Active Community Guidelines
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">Governs automatic safety filters triggers</p>
                    <div className="space-y-3">
                      {COMMUNITY_GUIDELINES.map(g => (
                        <div key={g.id} className="p-3 bg-slate-950/40 rounded-xl border border-slate-900">
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-[9px] font-mono font-extrabold text-red-400 bg-red-400/10 px-1 rounded">{g.id.toUpperCase()}</span>
                            {g.title}
                          </p>
                          <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{g.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="h-4 w-4 text-amber-400" /> Auto-Safety Lexicon Index
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono">Banned/Violent vocabulary patterns parsed</p>
                    <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-900 font-mono text-[10px] leading-relaxed text-slate-400 space-y-2">
                      <p>
                        <strong className="text-red-400">English Abusive List:</strong> abuse, hateful, threaten, bitch, slut, whore, fuck, shit, asshole, cunt, dick, pussy, kill yourself, kys, die, murder.
                      </p>
                      <p>
                        <strong className="text-red-400">Romanian Abusive List:</strong> prost, proasta, tampit, cretin, idiot, muie, pizda, pula, coaie, cacat, curva, tarfa, jegos, mata, te omor, sa mori.
                      </p>
                      <p>
                        <strong className="text-amber-400">Spam Markers:</strong> viagra, casino, free money, spam, repeating chars count ({'>'}10), bulk URLs.
                      </p>
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/15 text-amber-400 text-[10px] font-sans font-semibold mt-4">
                        Heuristic algorithms filter inputs 100% on-the-fly and prevent publishing before it writes to Firestore.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT AREA: REPORT DETAIL SPECIFIC VIEW */}
          <div className="lg:col-span-4">
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 space-y-4 sticky top-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-900">
                <Eye className="h-4 w-4 text-red-400" /> Inspector Panel
              </h3>

              {selectedReport ? (
                <div className="space-y-4 text-left">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Report Information</span>
                    <p className="text-xs text-slate-300 font-mono">ID: {selectedReport.id}</p>
                    <p className="text-xs text-slate-300">Target Type: <strong className="uppercase font-mono text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">{selectedReport.targetType}</strong></p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Content Owner</span>
                    <p className="text-xs font-bold text-red-400">{selectedReport.targetOwnerName}</p>
                    <p className="text-[10px] text-slate-500 font-mono">Owner UID: {selectedReport.targetOwnerId}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Content in Question</span>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-slate-300 text-xs font-mono select-all">
                      {selectedReport.targetContent}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">Reporter Reason</span>
                    <p className="text-xs text-amber-400 font-medium leading-relaxed">{selectedReport.reason}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-900 space-y-2">
                    <button
                      onClick={() => handleResolveReport(selectedReport.id, 'resolve')}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Block & Delete Content
                    </button>
                    <button
                      onClick={() => handleResolveReport(selectedReport.id, 'dismiss')}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 transition-all cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" /> Dismiss / Clear Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-slate-500/40 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No report selected</p>
                  <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Select any active user report in the queue to inspect, resolve, or dismiss.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
