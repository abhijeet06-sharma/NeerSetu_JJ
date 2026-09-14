// NeerSetu_JJ Water Standards & Safety Engine
// Grounded on BIS 10500:2012 Drinking Water Specifications with configurable thresholds

export const DEFAULT_THRESHOLDS = {
  tds: {
    unit: 'ppm',
    acceptable: 500,    // Desirable limit BIS 10500
    permissible: 1000,  // Configurable alert threshold
    critical: 2000      // Max permissible without alternate source
  },
  turbidity: {
    unit: 'NTU',
    acceptable: 1.0,    // Desirable limit BIS 10500
    permissible: 3.5,   // Rural attention threshold
    critical: 5.0       // Max permissible limit
  },
  ph: {
    unit: '',
    minAcceptable: 6.5,
    maxAcceptable: 8.5,
    minPermissible: 6.0,
    maxPermissible: 9.0
  },
  temperature: {
    unit: '°C',
    min: 15.0,
    max: 38.0
  }
};

class StandardsConfig {
  constructor() {
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('neersetu_thresholds');
      if (saved) {
        this.thresholds = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Using default water thresholds');
    }
  }

  saveThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    localStorage.setItem('neersetu_thresholds', JSON.stringify(this.thresholds));
  }

  resetToDefault() {
    this.thresholds = { ...DEFAULT_THRESHOLDS };
    localStorage.removeItem('neersetu_thresholds');
  }

  /**
   * Evaluates telemetry values against configured thresholds
   * Returns: 'GOOD' | 'ATTENTION' | 'CRITICAL' | 'NO_DATA'
   */
  evaluateQuality(reading) {
    if (!reading || reading.tds === undefined || reading.turbidity === undefined) {
      return {
        status: 'NO_DATA',
        issues: ['No measurement values available']
      };
    }

    const { tds, turbidity, ph } = reading;
    const t = this.thresholds;
    const issues = [];
    let isCritical = false;
    let isAttention = false;

    // 1. Evaluate TDS
    if (tds > t.tds.critical) {
      isCritical = true;
      issues.push(`TDS (${tds} ppm) exceeds permissible limit (${t.tds.critical} ppm)`);
    } else if (tds > t.tds.acceptable) {
      isAttention = true;
      issues.push(`TDS (${tds} ppm) is above desirable level (${t.tds.acceptable} ppm)`);
    }

    // 2. Evaluate Turbidity
    if (turbidity > t.turbidity.critical) {
      isCritical = true;
      issues.push(`Turbidity (${turbidity} NTU) exceeds limit (${t.turbidity.critical} NTU)`);
    } else if (turbidity > t.turbidity.acceptable) {
      isAttention = true;
      issues.push(`Turbidity (${turbidity} NTU) slightly elevated above ${t.turbidity.acceptable} NTU`);
    }

    // 3. Evaluate pH if present
    if (ph !== undefined && ph !== null) {
      if (ph < t.ph.minPermissible || ph > t.ph.maxPermissible) {
        isCritical = true;
        issues.push(`pH (${ph}) is outside permissible range (${t.ph.minPermissible} - ${t.ph.maxPermissible})`);
      } else if (ph < t.ph.minAcceptable || ph > t.ph.maxAcceptable) {
        isAttention = true;
        issues.push(`pH (${ph}) is outside desirable range (${t.ph.minAcceptable} - ${t.ph.maxAcceptable})`);
      }
    }

    if (isCritical) {
      return { status: 'CRITICAL', issues };
    }
    if (isAttention) {
      return { status: 'ATTENTION', issues };
    }
    return { status: 'GOOD', issues: ['All parameters within configured BIS 10500 limits'] };
  }
}

export const standardsConfig = new StandardsConfig();
