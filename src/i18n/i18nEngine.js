// NeerSetu_JJ Reactive i18n Engine
import { TRANSLATIONS } from './translations.js';

class I18nEngine {
  constructor() {
    const saved = localStorage.getItem('neersetu_lang');
    this.currentLang = (saved === 'en' || saved === 'hi') ? saved : 'hi';
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = this.currentLang;
    }
    this.subscribers = new Set();
  }

  getLang() {
    return this.currentLang;
  }

  setLang(lang) {
    if (lang !== 'hi' && lang !== 'en') {
      lang = 'hi';
    }
    this.currentLang = lang;
    localStorage.setItem('neersetu_lang', lang);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = lang;
    }
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
      { code: 'hi', label: 'हिन्दी (Hindi)', native: 'हिन्दी', short: 'HIN' },
      { code: 'en', label: 'English', native: 'English', short: 'ENG' }
    ];
  }
}

export const i18n = new I18nEngine();
