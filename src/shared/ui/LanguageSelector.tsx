import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '@/i18n';
import { Icons } from './Icons';

export interface LanguageSelectorProps {
  className?: string;
  variant?: 'minimal' | 'full';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  variant = 'minimal',
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('fairshift_language', code);
  };

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <Icons.Globe className="w-4 h-4 text-slate-500" />
          <span>{t('app.language')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language.startsWith(lang.code);
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all min-h-[44px] ${
                  isSelected
                    ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span className="text-sm font-medium">{lang.native}</span>
                <span className="text-xs text-slate-500">{lang.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <Icons.Globe className="w-4 h-4 text-slate-500 absolute left-2.5 pointer-events-none" aria-hidden="true" />
      <select
        value={i18n.language.slice(0, 2)}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguageCode)}
        aria-label={t('app.language')}
        className="pl-8 pr-7 py-1.5 text-xs sm:text-sm font-medium bg-white border border-slate-300 rounded-lg text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer min-h-[38px] appearance-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.code.toUpperCase()})
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 text-slate-400">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};
