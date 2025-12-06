import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../config/i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(i18n.language);
  const [languages] = useState([
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ]);

  useEffect(() => {
    // Update i18n when language changes
    i18n.changeLanguage(language);
    // Save to localStorage
    localStorage.setItem('bookhive_language', language);
  }, [language]);

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const value = {
    language,
    languages,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};