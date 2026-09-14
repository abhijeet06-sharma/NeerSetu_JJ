// NeerSetu_JJ Reactive i18n Engine
import { TRANSLATIONS } from './translations.js';

class I18nEngine {
  constructor() {
    this.currentLang = localStorage.getItem('neersetu_lang') || 'hi'; // Default Hindi for Jharkhand rural accessibility
    this.subscribers = new Set();
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (!TRANSLATIONS[lang]) {
      console.warn(`Language ${lang} not supported, defaulting to Hindi`);
      lang = 'hi';
    }
    this.currentLang = lang;
    localStorage.setItem('neersetu_lang', lang);
    this.notify();
  }

  t(key, fallback = '') {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.en;
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach((cb) => cb(this.currentLang));
  }

  getSupportedLanguages() {
    return [
      { code: 'hi', label: 'हिन्दी (Hindi)', native: 'हिन्दी' },
      { code: 'en', label: 'English', native: 'English' },
      { code: 'sat', label: 'Santhali (ᱥᱟᱱᱛᱟᱲᱤ)', native: 'ᱥᱟᱱᱛᱟᱲᱤ' },
      { code: 'nag', label: 'Nagpuri (नागपुरी)', native: 'नागपुरी' },
      { code: 'kru', label: 'Kurukh (कुड़ुख़)', native: 'कुड़ुख़' },
      { code: 'mun', label: 'Mundari (मुंडारी)', native: 'मुंडारी' }
    ];
  }
}

export const i18n = new I18nEngine();
