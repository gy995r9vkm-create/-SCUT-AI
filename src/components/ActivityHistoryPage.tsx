/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity, Search, Download, Trash2, Cpu, Filter, ShieldCheck, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { ActivityLog } from '../types';

interface ActivityHistoryPageProps {
  activityLogs: ActivityLog[];
  onNavigate: (page: string) => void;
  onClearLogs?: () => void;
}

export default function ActivityHistoryPage({ activityLogs, onNavigate, onClearLogs }: ActivityHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'chat' | 'billing' | 'api' | 'security'>('all');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  // Filter logs
  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || log.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Paginated logs
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activityLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "scut_telemetry_logs.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = "ID,Action,Details,Type,Timestamp\n";
    const rows = activityLogs.map(log => 
      `"${log.id}","${log.action.replace(/"/g, '""')}","${log.details.replace(/"/g, '""')}","${log.type}","${log.timestamp}"`
    ).join('\n');
    
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "scut_telemetry_logs.csv");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Activity className="h-5 w-5 animate-pulse" />
            <span className="text-xs uppercase tracking-widest font-bold">Telemetry Trails</span>
          </div>
          <h1 className="text-3xl font-bold font-display">Activity History</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Inspect a verified cryptographic audit ledger of account logins, credit transactions, model dispatches, and key generations.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all text-slate-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          <button 
            onClick={() => onNavigate('chat')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0"
          >
            Back to Chat Workspace
          </button>
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl flex flex-col">
        
        {/* Table Filters header block */}
        <div className="p-4 bg-slate-950 border-b border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPageNum(1); }}
              placeholder="Search audit trail logs..."
              className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/60 placeholder-slate-550"
            />
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-slate-500 mr-2 flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> Type:</span>
            {(['all', 'chat', 'billing', 'api', 'security'] as const).map(type => (
              <button
                key={type}
                onClick={() => { setSelectedType(type); setCurrentPageNum(1); }}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  selectedType === type 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-slate-900/45 border-slate-850 text-slate-450 hover:border-slate-800 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Data Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-[9px] text-slate-500 font-bold uppercase tracking-widest bg-slate-900/10">
                <th className="py-3 px-5">Timestamp</th>
                <th className="py-3 px-5">Type Category</th>
                <th className="py-3 px-5">Action Event</th>
                <th className="py-3 px-5">Log Details / Telemetry</th>
                <th className="py-3 px-5">Trace Token</th>
              </tr>
            </thead>
            <tbody className="text-xs font-light divide-y divide-slate-900/60">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-600">
                    <Activity className="h-8 w-8 mx-auto text-slate-800 mb-2" />
                    <p className="text-xs font-semibold">No logs synchronized in this index view</p>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log, idx) => (
                  <tr key={log.id || idx} className="hover:bg-slate-900/10 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-[10px] text-slate-450">{log.timestamp}</td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold tracking-wider ${
                        log.type === 'security' 
                        ? 'bg-red-500/10 text-red-400' 
                        : log.type === 'billing' 
                        ? 'bg-yellow-500/10 text-yellow-400' 
                        : log.type === 'api' 
                        ? 'bg-purple-500/10 text-purple-400' 
                        : 'bg-cyan-500/10 text-cyan-400'
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-250">{log.action}</td>
                    <td className="py-3.5 px-5 text-slate-400 font-light truncate max-w-xs">{log.details}</td>
                    <td className="py-3.5 px-5 font-mono text-[9px] text-slate-600">{log.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-900 flex items-center justify-between gap-4 text-xs">
          <span className="text-slate-500 text-[10px]">
            Showing {(currentPageNum - 1) * itemsPerPage + 1} - {Math.min(currentPageNum * itemsPerPage, filteredLogs.length)} of {filteredLogs.length} logs
          </span>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNum(prev => Math.max(prev - 1, 1))}
              disabled={currentPageNum === 1}
              className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg disabled:opacity-40 transition-colors cursor-pointer text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-[10px] text-slate-400">Page {currentPageNum} of {totalPages}</span>
            <button
              onClick={() => setCurrentPageNum(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPageNum === totalPages}
              className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg disabled:opacity-40 transition-colors cursor-pointer text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
