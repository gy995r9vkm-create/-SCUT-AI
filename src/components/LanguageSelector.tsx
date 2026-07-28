/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, Search, ChevronDown } from 'lucide-react';
import { Language } from '../types';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isCompact?: boolean;
}

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
];

export default function LanguageSelector({ currentLanguage, onLanguageChange, isCompact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLangs = SUPPORTED_LANGUAGES.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) || 
    l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
          isOpen 
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/10' 
            : 'bg-slate-900/90 border-slate-800 hover:border-cyan-500/40 text-slate-200 hover:text-white'
        } ${
          isCompact 
            ? 'px-2 py-1 text-[11px] font-bold' 
            : 'px-3 py-1.5 text-xs font-bold'
        }`}
        title="Change Platform Language (🌍)"
        aria-label="Language Selector"
      >
        <span className="text-sm">🌍</span>
        <span className="font-mono uppercase text-[11px] font-extrabold text-cyan-400">
          {activeLang.flag} {activeLang.code.toUpperCase()}
        </span>
        <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 p-2 space-y-2 max-h-96 overflow-hidden flex flex-col"
          >
            {/* Header / Search */}
            <div className="p-1 space-y-2 border-b border-slate-900 pb-2 shrink-0">
              <div className="flex items-center justify-between px-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                <span>Select Language</span>
                <span className="text-cyan-400 font-extrabold">28 Languages</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search language..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Language Options List */}
            <div className="overflow-y-auto space-y-0.5 scrollbar-thin max-h-60 pr-1">
              {filteredLangs.length > 0 ? (
                filteredLangs.map((lang) => {
                  const isSelected = lang.code === currentLanguage;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/25' 
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{lang.flag}</span>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-100">{lang.nativeName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{lang.name}</span>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-500 font-mono">
                  No languages found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
