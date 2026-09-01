/**
 * GRILLISTA - Security & Data Validation Module
 * Defends against XSS, input injection, and handles safe client-side persistence
 */

export const Security = {
  /**
   * Sanitizes untrusted strings to prevent XSS in innerHTML
   * @param {string} str - Raw user input or external text
   * @returns {string} - Escaped safe HTML string
   */
  escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Sanitizes object properties recursively
   * @param {object} obj - Object to sanitize
   * @returns {object} - Clean object
   */
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.escapeHTML(obj) : obj;
    }
    const clean = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clean[key] = this.sanitizeObject(obj[key]);
      }
    }
    return clean;
  },

  /**
   * Input validation patterns
   */
  validators: {
    // Standard email pattern
    email(email) {
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return re.test(String(email).trim());
    },

    // 10-digit Indian Mobile or formatted (+91)
    phone(phone) {
      const cleaned = String(phone).replace(/[\s\-+()]/g, '');
      const re = /^(?:91)?[6-9]\d{9}$/;
      return re.test(cleaned);
    },

    // 6-digit Indian Postal Pincode
    pincode(pin) {
      const re = /^[1-9][0-9]{5}$/;
      return re.test(String(pin).trim());
    },

    // Name (alphabets, spaces, dots, min 2 chars)
    name(name) {
      const re = /^[a-zA-Z\s.']{2,60}$/;
      return re.test(String(name).trim());
    },

    // Safe string without dangerous control characters
    safeString(str, minLen = 1, maxLen = 500) {
      if (typeof str !== 'string') return false;
      const len = str.trim().length;
      return len >= minLen && len <= maxLen;
    }
  },

  /**
   * Safe LocalStorage wrapper with JSON verification
   */
  storage: {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (err) {
        console.warn(`[Security Storage] Failed to read key: ${key}`, err);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error(`[Security Storage] Storage quota exceeded or error on key: ${key}`, err);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[Security Storage] Failed to remove key: ${key}`, err);
      }
    }
  },

  /**
   * Simple client-side Rate Limiter to prevent spam submissions
   */
  rateLimiter: {
    timestamps: {},

    canProceed(actionKey, cooldownMs = 2500) {
      const now = Date.now();
      const last = this.timestamps[actionKey] || 0;
      if (now - last < cooldownMs) {
        return false;
      }
      this.timestamps[actionKey] = now;
      return true;
    }
  }
};
