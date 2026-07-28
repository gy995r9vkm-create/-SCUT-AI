import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { Language } from '../types';
import { tDynamic } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (keyOrText: string, defaultVal?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (keyOrText: string, defaultVal?: string) => defaultVal || keyOrText,
});

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}> = ({ children, currentLanguage, onLanguageChange }) => {
  const t = useCallback((keyOrText: string, defaultVal?: string) => {
    return tDynamic(currentLanguage, keyOrText, defaultVal || keyOrText);
  }, [currentLanguage]);

  const value = useMemo(() => ({
    language: currentLanguage,
    setLanguage: onLanguageChange,
    t
  }), [currentLanguage, onLanguageChange, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export const useTranslation = () => {
  const { language, setLanguage, t } = useLanguage();
  return { language, setLanguage, t };
};

