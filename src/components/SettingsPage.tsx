/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings2, Sun, Moon, Languages, BrainCircuit, Sliders, ShieldCheck, Save, Check, Bell
} from 'lucide-react';
import { User, Language } from '../types';
import { translations, LANGUAGES_CONFIG } from '../lib/translations';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (updated: Partial<User>) => void;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  currentTheme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export default function SettingsPage({
  user,
  onUpdateUser,
  currentLanguage,
  onLanguageChange,
  currentTheme,
  onThemeChange
}: SettingsPageProps) {
  const [theme, setThemeState] = useState<'dark' | 'light'>(currentTheme);
  const [language, setLanguageState] = useState<Language>(currentLanguage);
  const [defaultModel, setDefaultModel] = useState<string>('gemini-3.5-flash');
  const [temperature, setTemperature] = useState<number>(0.7);
  const [telemetryAlerts, setTelemetryAlerts] = useState<boolean>(true);
  const [success, setSuccess] = useState<string>('');

  const t = translations[language] || translations.en;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Apply changes instantly
    onThemeChange(theme);
    onLanguageChange(language);
    
    // Persist to user object (synced with Firestore)
    onUpdateUser({
      theme,
      language
    });

    setSuccess(t.settings_success);
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-24 pb-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings2 className="h-8 w-8 text-cyan-400" />
            {t.settings_title}
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            {t.settings_desc}
          </p>
        </div>

        {/* Status Alert */}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-sm text-emerald-300"
          >
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>{success}</span>
          </motion.div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          {/* Theme & Localization Settings Panel */}
          <div className="rounded-2xl bg-slate-900/40 border border-slate-850 p-6 space-y-6">
            
            {/* Visual Interface Theme */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  {theme === 'dark' ? <Moon className="h-4 w-4 text-cyan-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
                  {t.theme_label}
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  {t.theme_desc}
                </p>
              </div>

              <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-850 shrink-0">
                <button
                  type="button"
                  onClick={() => setThemeState('dark')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    theme === 'dark' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' 
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Cosmic Dark
                </button>
                <button
                  type="button"
                  onClick={() => setThemeState('light')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    theme === 'light' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/15' 
                      : 'text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Crisp Light
                </button>
              </div>
            </div>

            {/* System Language Selector */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Languages className="h-4 w-4 text-cyan-400" />
                  {t.language_label}
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  {t.language_desc}
                </p>
              </div>

              <div className="w-full sm:w-48 shrink-0">
                <select
                  value={language}
                  onChange={(e) => setLanguageState(e.target.value as Language)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                >
                  {LANGUAGES_CONFIG.map((cfg) => (
                    <option key={cfg.code} value={cfg.code}>
                      {cfg.flag} {cfg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Default Generation Weights */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800/60">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4 text-cyan-400" />
                  {t.model_pref_label}
                </h3>
                <p className="text-xs text-slate-400 max-w-md">
                  {t.model_pref_desc}
                </p>
              </div>

              <div className="w-full sm:w-48 shrink-0">
                <select
                  value={defaultModel}
                  onChange={(e) => setDefaultModel(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-850 px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/60"
                >
                  <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Reasoning)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Legacy)</option>
                </select>
              </div>
            </div>

            {/* Creative temperature slider */}
            <div className="space-y-3 pb-6 border-b border-slate-800/60">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  Generation Temperature (Creativity)
                </h3>
                <span className="font-mono font-bold text-cyan-400 text-xs">{temperature}</span>
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
                <span>Optimized Defaults (0.7)</span>
                <span>Highly Creative (1.5)</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex justify-between items-center bg-slate-950/60 rounded-xl p-4 border border-slate-850">
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-white">Security Telemetry Logs</p>
                <p className="text-[10px] text-slate-500">Keep track of secure auth logins and API mint operations</p>
              </div>
              <button
                type="button"
                onClick={() => setTelemetryAlerts(!telemetryAlerts)}
                className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                  telemetryAlerts ? 'bg-cyan-400' : 'bg-slate-800'
                }`}
              >
                <div 
                  className={`bg-slate-950 w-5 h-5 rounded-full shadow-md transform duration-300 ${
                    telemetryAlerts ? 'translate-x-4' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-display font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/10 active:scale-95"
            >
              <Save className="h-4 w-4" />
              {t.save_settings}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
