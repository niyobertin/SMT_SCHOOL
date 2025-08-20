import { useTranslation } from '../contexts/TranslationContext';

type LanguageCode = 'en' | 'fr' | 'rw';

interface Language {
  code: LanguageCode;
  name: string;
}

export const useLanguage = () => {
  const { t, language, setLanguage } = useTranslation();
  
  // Map of language codes to their display names
  const languages: Record<LanguageCode, string> = {
    en: 'English',
    fr: 'Français',
    rw: 'Kinyarwanda'
  };

  return {
    t,
    language,
    setLanguage: (code: LanguageCode) => setLanguage(code),
    languages: Object.entries(languages).map(([code, name]) => ({
      code: code as LanguageCode,
      name
    })) as Language[]
  };
};

export default useLanguage;
