// NeerSetu_JJ Voice Assistance Service
// Uses Web Speech API (speechSynthesis) with graceful degradation

import { i18n } from '../i18n/i18nEngine.js';

class SpeechService {
  constructor() {
    this.isSupported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    this.isSpeaking = false;
  }

  isAvailable() {
    return this.isSupported;
  }

  speakStatus(reading, language = null) {
    if (!this.isSupported) {
      console.warn('Speech synthesis not supported on this device');
      return false;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const lang = language || i18n.getLang();
    let text = '';

    if (!reading) {
      text = lang === 'hi' 
        ? 'कोई नया माप उपलब्ध नहीं है।' 
        : 'No measurement data available.';
    } else {
      const status = reading.water_status;
      const tds = reading.tds || 0;
      const turb = reading.turbidity || 0;

      if (lang === 'hi' || lang === 'nag') {
        if (status === 'GOOD') {
          text = `पानी की गुणवत्ता तय सीमा के भीतर है। टीडीएस ${tds} पीपीएम है, और गंदलापन ${turb} एनटीयू है। पानी सामान्य उपयोग के लिए ठीक है।`;
        } else if (status === 'ATTENTION') {
          text = `चेतावनी। पानी की गुणवत्ता पर ध्यान दें। टीडीएस ${tds} पीपीएम है। छानना या उबालना आवश्यक है।`;
        } else {
          text = `खतरा। पानी की गुणवत्ता खराब है। टीडीएस ${tds} पीपीएम और गंदलापन अधिक है। सीधे न पिएं।`;
        }
      } else if (lang === 'sat' || lang === 'kru' || lang === 'mun') {
        // Phonetic Hindi/Regional speech for tribal regional languages
        if (status === 'GOOD') {
          text = `Dak' bugi gea. TDS ${tds} menak'a. Saaf dak' kana.`;
        } else if (status === 'ATTENTION') {
          text = `Dak' re dhyan em me. TDS ${tds} menak'a. Chhanao dorkar.`;
        } else {
          text = `Kharab dak' kana. Nu aalo. TDS ${tds} menak'a.`;
        }
      } else {
        // English
        if (status === 'GOOD') {
          text = `Water quality is within configured limits. TDS is ${tds} ppm, turbidity is ${turb} NTU. Safe for normal rural use.`;
        } else if (status === 'ATTENTION') {
          text = `Attention needed. Water quality requires checking. TDS is ${tds} ppm. Filtration advised.`;
        } else {
          text = `Critical alert. Water quality limits exceeded. TDS is ${tds} ppm. Do not consume directly.`;
        }
      }
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for low-literacy clarity
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi' || lang === 'nag') {
        const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.name.includes('Hindi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        const enVoice = voices.find((v) => v.lang.startsWith('en-IN') || v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onstart = () => { this.isSpeaking = true; };
      utterance.onend = () => { this.isSpeaking = false; };
      utterance.onerror = () => { this.isSpeaking = false; };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (e) {
      console.warn('Speech error:', e);
      return false;
    }
  }

  stop() {
    if (this.isSupported) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

export const speechService = new SpeechService();
