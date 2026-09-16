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

      if (lang === 'hi') {
        if (status === 'GOOD') {
          text = `पानी की गुणवत्ता पूरी तरह सुरक्षित है। टीडीएस ${tds} पीपीएम, और गंदलापन ${turb} एनटीयू है। सुरक्षित पानी अंतिम टंकी में उपयोग के लिए उपलब्ध है।`;
        } else if (status === 'ATTENTION') {
          text = `सावधान। पानी आंशिक सुरक्षित है। टीडीएस ${tds} पीपीएम है। इस पानी को एक बार और छानने की आवश्यकता है।`;
        } else {
          text = `चेतावनी! पानी की गुणवत्ता खराब और असुरक्षित है। टीडीएस ${tds} पीपीएम और गंदलापन बहुत अधिक है। इसे सीधे न पिएं।`;
        }
      } else {
        // English
        if (status === 'GOOD') {
          text = `Water quality is verified safe. TDS is ${tds} ppm, turbidity is ${turb} NTU. Safe water is available in the final tank.`;
        } else if (status === 'ATTENTION') {
          text = `Attention needed. Water is partially safe. TDS is ${tds} ppm. One-time re-filtration is required before release.`;
        } else {
          text = `Critical alert. Water quality limits are exceeded. TDS is ${tds} ppm. Unsafe water; do not drink directly.`;
        }
      }
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = lang === 'hi' ? 0.90 : 0.95;
      utterance.pitch = 1.0;
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        const hiVoice = voices.find((v) => v.lang === 'hi-IN' || v.lang.startsWith('hi') || (v.name && v.name.toLowerCase().includes('hindi')));
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        const enVoice = voices.find((v) => v.lang === 'en-IN' || v.lang.startsWith('en') || (v.name && v.name.toLowerCase().includes('english')));
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
