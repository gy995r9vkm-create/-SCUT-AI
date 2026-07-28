/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  KeyRound, Plus, Trash2, Check, Copy, Eye, EyeOff, Play, Terminal, ShieldAlert, Zap, BarChart2, CheckCircle
} from 'lucide-react';
import { ApiKey } from '../types';

interface ApiPageProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string) => void;
  onRevokeKey: (id: string) => void;
  userTier: string;
}

export default function ApiPage({ apiKeys, onCreateKey, onRevokeKey, userTier }: ApiPageProps) {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Sandbox playground states
  const [sandboxEndpoint, setSandboxEndpoint] = useState('/v1/chat/completions');
  const [sandboxPayload, setSandboxPayload] = useState(`{
  "model": "gemini-2.5-flash",
  "messages": [
    {"role": "user", "content": "How far is the Moon?"}
  ],
  "temperature": 0.7
}`);
  const [sandboxResponse, setSandboxResponse] = useState('');
  const [isCallingSandbox, setIsCallingSandbox] = useState(false);

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    if (userTier === 'free') {
      setError("Custom Developer API Keys are locked on the Free Starter tier. Upgrade to Pro or Business to generate production keys!");
      setTimeout(() => setError(''), 4500);
      return;
    }

    onCreateKey(newKeyName.trim());
    setNewKeyName('');
    setSuccess('API Credential minted successfully.');
    setTimeout(() => setSuccess(''), 2500);
  };

  const copyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleRunSandbox = async () => {
    setIsCallingSandbox(true);
    setSandboxResponse('// Connection handshake initiated...\n// Handing off packet to SCUT proxy...\n// Running real-time Gemini API queries...\n');

    try {
      const parsedPayload = JSON.parse(sandboxPayload); // validate payload is JSON

      const response = await fetch('/api/sandbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(parsedPayload)
      });

      const data = await response.json();
      setSandboxResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setSandboxResponse(JSON.stringify({
        "error": {
          "message": err.message || "An error occurred during API execution.",
          "type": "invalid_request_error",
          "code": "bad_json_or_network"
        }
      }, null, 2));
    } finally {
      setIsCallingSandbox(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-2.5 py-1 rounded-md">
              Secure Credentials
            </span>
            <h1 className="font-display text-3xl font-bold tracking-tight text-white mt-2">
              Developer API Keys
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Provision private bearer credentials to hook SCUT AI endpoints into your custom apps.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <BarChart2 className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-400">Monthly Keys Quota: </span>
            <span className="font-bold text-white font-mono">
              {userTier === 'free' ? '0 / 0' : userTier === 'pro' ? `${apiKeys.length} / 5` : 'Unlimited'}
            </span>
          </div>
        </div>

        {/* Status alert */}
        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-300 max-w-4xl">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-300 max-w-4xl">
            <ShieldAlert className="h-4 w-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* API Key management panel */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Create Key Card form */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-4">
            <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-cyan-400" /> Provision API Key
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Mint credentials to safely deploy. Always protect your secrets.
            </p>

            {userTier === 'free' ? (
              <div className="bg-red-500/5 rounded-xl border border-red-500/10 p-4 text-xs text-red-300 flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold uppercase tracking-wider">Upgrade Required</p>
                  <p className="mt-1">Custom API key generation is locked on the Free Starter tier. Access custom telemetry integrations by upgrading to Pro.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Credential Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. production-scut-chat"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Mint API Key
                </button>
              </form>
            )}
          </div>

          {/* Keys List table */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-4">
            <div>
              <h3 className="font-display text-base font-bold text-white">Active Bearer Credentials</h3>
              <p className="text-xs text-slate-500">Revoke keys immediately if compromised</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Key Secret</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3 text-center">Invocations</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {apiKeys.map((key) => {
                    const isRevealed = revealedIds.includes(key.id);
                    return (
                      <tr key={key.id}>
                        <td className="py-3 px-3 font-medium text-slate-200">{key.name}</td>
                        <td className="py-3 px-3 font-mono">
                          {isRevealed ? key.key : `${key.key.substring(0, 15)}••••••••`}
                        </td>
                        <td className="py-3 px-3 text-slate-400">{key.createdAt}</td>
                        <td className="py-3 px-3 text-center text-slate-300">{key.usageCount}</td>
                        <td className="py-3 px-3 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleReveal(key.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Reveal Key"
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => copyKey(key.key, key.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                            title="Copy Key"
                          >
                            {copiedId === key.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => onRevokeKey(key.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                            title="Revoke Key"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500">
                        No active credentials. {userTier === 'free' ? 'Upgrade to get started' : 'Provision a key above.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* API Playground Sandbox Console */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-cyan-400" /> API Sandbox Playground
            </h3>
            <p className="text-xs text-slate-400">Validate endpoints and request bodies instantly in our sandbox</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 rounded-3xl bg-slate-900 border border-slate-800 p-6 md:p-8">
            {/* Input payload panel */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">HTTP METHOD</label>
                  <span className="block px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 font-mono text-xs font-bold text-cyan-400 w-fit">
                    POST
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">ENDPOINT URL</label>
                  <input
                    type="text"
                    value={sandboxEndpoint}
                    onChange={(e) => setSandboxEndpoint(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-850 px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">REQUEST PAYLOAD (JSON)</label>
                <textarea
                  rows={6}
                  value={sandboxPayload}
                  onChange={(e) => setSandboxPayload(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleRunSandbox}
                disabled={isCallingSandbox}
                className="px-6 py-3 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isCallingSandbox ? (
                  <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Play className="h-3.5 w-3.5 fill-current" /> Execute Raw Request</>
                )}
              </button>
            </div>

            {/* Output response panel */}
            <div className="flex flex-col">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">HTTP RESPONSE PAYLOAD</label>
              <div className="flex-1 rounded-xl bg-slate-950 border border-slate-850 p-4 font-mono text-[11px] leading-relaxed text-slate-300 h-64 overflow-y-auto shadow-inner whitespace-pre">
                {sandboxResponse || '// Execute a request payload to inspect output.'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
