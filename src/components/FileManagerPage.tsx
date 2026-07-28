/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Upload, Folder, Trash2, Download, Eye, File, RefreshCw, Layers, Plus, Edit2, Check, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface FileManagerPageProps {
  user: User | null;
  onNavigate: (page: string) => void;
  onAddLog: (action: string, details: string, type: 'chat' | 'billing' | 'api' | 'security') => Promise<void>;
}

interface UserFile {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
}

export default function FileManagerPage({ user, onNavigate, onAddLog }: FileManagerPageProps) {
  const [files, setFiles] = useState<UserFile[]>(() => {
    const cached = localStorage.getItem('scut_user_files');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: 'f-1', name: 'api_integration_spec.json', size: '24.5 KB', type: 'application/json', uploadedAt: '7/18/2026, 11:00 AM' },
      { id: 'f-2', name: 'scut_platform_logo.png', size: '156 KB', type: 'image/png', uploadedAt: '7/18/2026, 10:30 AM' },
      { id: 'f-3', name: 'telemetry_logs_july.txt', size: '1.2 MB', type: 'text/plain', uploadedAt: '7/17/2026, 04:15 PM' }
    ];
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');
  const [activePreview, setActivePreview] = useState<UserFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (uploadedList: FileList) => {
    setIsUploading(true);
    setTimeout(async () => {
      const newFiles: UserFile[] = [];
      for (let i = 0; i < uploadedList.length; i++) {
        const item = uploadedList[i];
        const sizeStr = item.size > 1024 * 1024 
          ? (item.size / (1024 * 1024)).toFixed(1) + ' MB' 
          : (item.size / 1024).toFixed(1) + ' KB';
        
        newFiles.push({
          id: 'f-' + Math.random().toString(36).substring(2, 9),
          name: item.name,
          size: sizeStr,
          type: item.type || 'application/octet-stream',
          uploadedAt: new Date().toLocaleString()
        });
      }

      const updated = [...newFiles, ...files];
      setFiles(updated);
      localStorage.setItem('scut_user_files', JSON.stringify(updated));
      setIsUploading(false);
      
      for (const nf of newFiles) {
        await onAddLog('Uploaded File', `File: ${nf.name} (${nf.size})`, 'security');
      }
    }, 1500);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDownloadFile = (file: UserFile) => {
    const sampleContent = file.name.endsWith('.json')
      ? JSON.stringify({ name: file.name, size: file.size, type: file.type, downloadedAt: new Date().toISOString() }, null, 2)
      : file.name.endsWith('.txt')
      ? `SCUT AI DOCUMENT FILE\nFile: ${file.name}\nType: ${file.type}\nUploaded At: ${file.uploadedAt}\n\nSCUT AI - Telemetry verified document payload.`
      : `SCUT AI BINARY PAYLOAD FOR FILE: ${file.name}\nTimestamp: ${new Date().toISOString()}`;
      
    const blob = new Blob([sampleContent], { type: file.type || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = async (id: string, name: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    localStorage.setItem('scut_user_files', JSON.stringify(updated));
    await onAddLog('Deleted File', `Removed file: ${name}`, 'security');
    if (activePreview?.id === id) setActivePreview(null);
  };

  const startRename = (file: UserFile) => {
    setEditingFileId(file.id);
    setEditingFileName(file.name);
  };

  const saveRename = (id: string) => {
    if (!editingFileName.trim()) return;
    const updated = files.map(f => f.id === id ? { ...f, name: editingFileName.trim() } : f);
    setFiles(updated);
    localStorage.setItem('scut_user_files', JSON.stringify(updated));
    setEditingFileId(null);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto w-full text-white min-h-screen">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Folder className="h-5 w-5" />
            <span className="text-xs uppercase tracking-widest font-bold">Storage Workspace</span>
          </div>
          <h1 className="text-3xl font-bold font-display">File Manager</h1>
          <p className="text-xs text-slate-400 mt-1 font-light max-w-xl">
            Administer and upload document assets, dataset corpora, and system images securely stored in cloud firestore indices.
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
        
        {/* Left Drag/Drop & Storage Info (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerUpload}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[220px] ${
              isDragging 
              ? 'border-cyan-400 bg-cyan-500/10' 
              : 'border-slate-850 bg-slate-950 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple 
              onChange={handleFileChange} 
            />
            
            {isUploading ? (
              <div className="space-y-3">
                <RefreshCw className="h-10 w-10 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-semibold">Streaming to Storage...</p>
                <p className="text-[10px] text-slate-500 font-light">Analyzing content chunks</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-cyan-500/5 rounded-full border border-cyan-500/15 inline-block text-cyan-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300">Drag & Drop Documents Here</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-light">or click to browse local files system</p>
                </div>
                <span className="inline-block px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[9px] font-semibold text-slate-400">
                  JSON, PNG, PDF, TXT (Max 50MB)
                </span>
              </div>
            )}
          </div>

          {/* Storage telemetry meter */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
              <span className="text-slate-400">Available Storage</span>
              <span className="text-cyan-400 font-mono">1.4 MB / 5.0 GB</span>
            </div>
            
            {/* Meter Bar */}
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-[2%]" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-[10px] pt-1">
              <div className="space-y-0.5">
                <span className="text-slate-500">Tier Limit:</span>
                <span className="text-white font-semibold block uppercase">{user?.subscriptionTier || 'free'} Space</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500">Stored Files:</span>
                <span className="text-white font-semibold block">{files.length} uploads</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Uploaded files list table (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <h2 className="text-xs uppercase tracking-widest font-bold text-slate-300">Uploaded Data Assets</h2>
            <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">Index size: {files.length}</span>
          </div>

          {files.length === 0 ? (
            <div className="py-16 text-center text-slate-600">
              <File className="h-10 w-10 mx-auto text-slate-800 mb-3" />
              <p className="text-xs font-semibold">No files are currently indexes</p>
              <p className="text-[10px] text-slate-700 mt-1">Upload specs or datasets to use as system contexts.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
              {files.map(file => (
                <div 
                  key={file.id}
                  className="p-3 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-900 hover:border-slate-800 rounded-xl flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-slate-950 rounded-lg text-cyan-400 border border-slate-850 shrink-0">
                      <FileText className="h-4 w-4" />
                    </div>
                    
                    <div className="min-w-0">
                      {editingFileId === file.id ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            value={editingFileName}
                            onChange={(e) => setEditingFileName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRename(file.id); }}
                          />
                          <button 
                            onClick={() => saveRename(file.id)}
                            className="p-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-all cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-slate-200 truncate">{file.name}</p>
                          <button 
                            onClick={() => startRename(file)}
                            className="p-0.5 text-slate-500 hover:text-white transition-all cursor-pointer"
                          >
                            <Edit2 className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 mt-0.5">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>{file.type}</span>
                        <span>•</span>
                        <span>{file.uploadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => handleDownloadFile(file)}
                      className="p-2 text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 rounded-lg transition-all cursor-pointer border border-cyan-500/20"
                      title="Download File"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => setActivePreview(file)}
                      className="p-2 text-slate-400 hover:text-white bg-slate-950 hover:bg-slate-950/80 rounded-lg transition-all cursor-pointer border border-slate-850"
                      title="Quick Preview"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFile(file.id, file.name)}
                      className="p-2 text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-950/30 rounded-lg transition-all cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* File Quick Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setActivePreview(null)} />
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300">File Ingestion Preview</h3>
              </div>
              <button 
                onClick={() => setActivePreview(null)}
                className="text-xs text-slate-500 hover:text-white bg-slate-900 rounded px-2.5 py-1 cursor-pointer font-bold"
              >
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2">
                <span className="text-[10px] text-slate-500 font-mono">FILE_METADATA_HEADER</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-light">
                  <div>
                    <span className="text-slate-500">File Name:</span>
                    <p className="font-semibold text-slate-200">{activePreview.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mime Type:</span>
                    <p className="font-semibold text-slate-200">{activePreview.type}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">File Size:</span>
                    <p className="font-semibold text-slate-200">{activePreview.size}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Timestamp:</span>
                    <p className="font-semibold text-slate-200">{activePreview.uploadedAt}</p>
                  </div>
                </div>
              </div>

              {/* Mock preview content box */}
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-400 overflow-y-auto max-h-[160px] leading-relaxed">
                <span className="text-slate-600 block mb-2">// Sample Content Preview</span>
                {activePreview.name.endsWith('.json') ? (
                  <pre>{`{\n  "status": "indexed",\n  "version": "1.0.0",\n  "telemetry": true,\n  "payload": {\n    "routing_delay": "12ms",\n    "weights_calibrated": true\n  }\n}`}</pre>
                ) : activePreview.name.endsWith('.txt') ? (
                  <p>SCUT AI TELEMETRY DISPATCH INGESTION LOGS\n--------------------------------------------\n[11:00:15] INBOUND SECURE PROXY REQUEST\n[11:00:16] COMPLETED DISPATCH RESPONSE (200 OK)</p>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 justify-center py-6">
                    <AlertCircle className="h-4 w-4" />
                    <span>In-browser binary previews are constrained for safety.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleDownloadFile(activePreview)}
                className="flex-grow py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-display font-bold text-center rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="h-4 w-4" />
                <span>Download Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
