import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Language, languages, translations, Translations } from './translations';
import { supabase } from '@/integrations/supabase/client';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languages: typeof languages;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGS: Language[] = ['en', 'fr', 'es', 'de', 'it', 'pt', 'pl'];

const getBrowserLanguage = (): Language => {
  const browserLang = navigator.language.split('-')[0];
  return SUPPORTED_LANGS.includes(browserLang as Language) ? (browserLang as Language) : 'en';
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getBrowserLanguage);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes to load user's saved locale
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data } = await (supabase as any)
          .from('profiles')
          .select('locale')
          .eq('id', uid)
          .maybeSingle();

        if (data?.locale && SUPPORTED_LANGS.includes(data.locale as Language)) {
          setLanguageState(data.locale as Language);
          document.documentElement.lang = data.locale;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;

    // Persist to profile if logged in
    if (userId) {
      (supabase as any)
        .from('profiles')
        .update({ locale: lang })
        .eq('id', userId)
        .then(() => {});
    }
  }, [userId]);

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
