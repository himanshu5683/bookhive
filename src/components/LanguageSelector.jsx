import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { language, languages, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('common.language')}:
      </label>
      <select 
        id="language-select"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-dropdown"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;