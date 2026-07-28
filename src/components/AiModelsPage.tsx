/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Cpu, Sparkles, Terminal, Sliders, Play, Settings, RefreshCw, 
  CheckCircle, Server, Activity, BarChart2, ShieldAlert
} from 'lucide-react';

interface AiModelsPageProps {
  onNavigate: (page: string) => void;
}

export default function AiModelsPage({ onNavigate }: AiModelsPageProps) {
  const [selectedModel, setSelectedModel] = useState('scut-omni-v1');
  const [epochs, setEpochs] = useState(10);
  const [learningRate, setLearningRate] = useState(0.0001);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const models = [
    { id: 'scut-omni-v1', name: 'SCUT Omni Flash v1', status: 'Online', type: 'Multimodal', params: '1.2T', requests: '124K' },
    { id: 'scut-reasoning-v2', name: 'SCUT Reasoning Deep v2', status: 'Online', type: 'Reasoning', params: '640B', requests: '89K' },
    { id: 'scut-vision-v1', name: 'SCUT Vision Transformer', status: 'Online', type: 'Vision', params: '110B', requests: '45K' },
    { id: 'scut-voice-synth', name: 'SCUT Voice Generator Pro', status: 'Standby', type: 'TTS / Audio', params: '80B', requests: '12K' },
  ];

  const handleStartFineTuning = () => {
    if (isTraining) return;
    setIsTraining(true);
    setTrainingLogs([]);
    setProgress(0);

    const logs = [
      'Initializing SCUT Adapter pipeline...',
      'Mapping neural weights to server-side layers...',
      'Batch size configured: 128. GPU acceleration online.',
      'Epoch 1/10 - Loss: 1.45 - Accuracy: 74.2%',
      'Epoch 3/10 - Loss: 0.92 - Accuracy: 85.8%',
      'Epoch 5/10 - Loss: 0.51 - Accuracy: 93.1%',
      'Epoch 8/10 - Loss: 0.28 - Accuracy: 97.4%',
      'Epoch 10/10 - Loss: 0.12 - Accuracy: 99.2%',
      'Fine-tuning complete. Deploying model to edge gateways...'
    ];

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logs.length) {
        setTrainingLogs(prev => [...prev, logs[currentLogIndex]]);
        setProgress(Math.min(((currentLogIndex + 1) / logs.length) * 100, 100));
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="border-b border-slate-900 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/15 px-1.5 py-0.5 rounded">Core Models</span>
            <span className="text-[10px] font-mono text-slate-500">Latency: ~48ms</span>
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white mt-1.5 tracking-tight flex items-center gap-2.5">
            <Cpu className="h-8 w-8 text-cyan-400" />
            AI Models Registry
          </h1>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1">
            Browse official SCUT core neural weights, monitor compute logs, and spin up custom fine-tuning pipelines.
          </p>
        </div>

        {/* WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Models List & Status */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-cyan-400" /> Available Neural Core Models
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {models.map((model) => (
                  <div 
                    key={model.id}
                    onClick={() => setSelectedModel(model.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                      selectedModel === model.id 
                        ? 'bg-cyan-500/5 border-cyan-500/30 shadow-lg' 
                        : 'bg-slate-900/40 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-bold font-mono tracking-wider text-white uppercase">{model.name}</h3>
                      <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                        model.status === 'Online'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {model.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
                      <div>
                        <span className="block text-[8px] text-slate-500">TYPE</span>
                        {model.type}
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500">PARAMS</span>
                        {model.params}
                      </div>
                      <div>
                        <span className="block text-[8px] text-slate-500">QUERIES</span>
                        {model.requests}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-900 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-cyan-400" /> Model Performance Metrics
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center py-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Inference Speed</span>
                  <span className="text-base font-bold text-cyan-400">120 tokens/s</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Avg Accuracy</span>
                  <span className="text-base font-bold text-emerald-400">99.84%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">Active Context</span>
                  <span className="text-base font-bold text-purple-400">2M Tokens</span>
                </div>
              </div>
            </div>
          </div>

          {/* Fine Tuning Panel */}
          <div className="lg:col-span-5">
            <div className="p-6 rounded-3xl bg-slate-900/30 border border-slate-900 space-y-6">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  Spin Custom Fine-Tuning Pipeline
                </h2>
                <p className="text-slate-400 text-[11px] font-light mt-0.5">
                  Configure active layers and learning weight constraints to adapt SCUT core models to custom private directories.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Training Epochs ({epochs})</label>
                  <input 
                    type="range"
                    min="1"
                    max="50"
                    value={epochs}
                    onChange={(e) => setEpochs(Number(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Base Learning Rate ({learningRate})</label>
                  <select 
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 focus:border-cyan-400 text-xs text-white"
                  >
                    <option value={0.01}>0.01 (Aggressive)</option>
                    <option value={0.001}>0.001 (Recommended)</option>
                    <option value={0.0001}>0.0001 (High-Precision)</option>
                    <option value={0.00001}>0.00001 (Micro-Adjustment)</option>
                  </select>
                </div>

                {isTraining && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Neural Mapping Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-900">
                      <div className="bg-cyan-400 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {trainingLogs.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-850 h-32 overflow-y-auto font-mono text-[9px] text-slate-400 leading-relaxed space-y-1">
                    {trainingLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <span className="text-cyan-400 shrink-0">&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={handleStartFineTuning}
                  disabled={isTraining}
                  className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-extrabold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isTraining ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Finetuning Pipeline Active...
                    </>
                  ) : (
                    'Initiate Fine-Tuning'
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
