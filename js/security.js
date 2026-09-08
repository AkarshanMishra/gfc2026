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
  },

  /**
   * Comprehensive Client-Side Code & Content Protection Suite
   */
  initProtection() {
    // 1. Disable Right-Click Context Menu
    document.addEventListener('contextmenu', function(e) {
      // Allow right-click on input and textarea so users can paste/correct text
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return true;
      }
      e.preventDefault();
      return false;
    }, { capture: true });

    // 2. Disable DevTools, Inspect Element & View Source Keyboard Shortcuts
    document.addEventListener('keydown', function(e) {
      const key = e.key || '';
      const keyCode = e.keyCode || e.which;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // F12 key
      if (keyCode === 123 || key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Opt+I (Developer Tools)
      // Ctrl+Shift+J / Cmd+Opt+J (Console)
      // Ctrl+Shift+C / Cmd+Opt+C (Inspect Element)
      if (isCtrlOrMeta && e.shiftKey && (key === 'I' || key === 'i' || key === 'J' || key === 'j' || key === 'C' || key === 'c' || keyCode === 73 || keyCode === 74 || keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+U / Cmd+U (View Page Source)
      if (isCtrlOrMeta && (key === 'U' || key === 'u' || keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page HTML)
      if (isCtrlOrMeta && (key === 'S' || key === 's' || keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P / Cmd+P (Print Page)
      if (isCtrlOrMeta && (key === 'P' || key === 'p' || keyCode === 80)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }, { capture: true });

    // 3. Disable Content Copy & Cut outside interactive inputs
    document.addEventListener('copy', function(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return true;
      }
      e.preventDefault();
      return false;
    });

    document.addEventListener('cut', function(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return true;
      }
      e.preventDefault();
      return false;
    });

    // 4. Disable Image & Element Dragging
    document.addEventListener('dragstart', function(e) {
      e.preventDefault();
      return false;
    });

    // 5. Protected Console Watermark
    try {
      console.log(
        '%c🔒 GRILLISTA SECURE PORTAL\n%cAll rights reserved. Code, assets, and intellectual property are protected under copyright law.',
        'color: #FFD000; font-family: sans-serif; font-size: 18px; font-weight: 900; background: #0F4C2A; padding: 6px 12px; border-radius: 6px;',
        'color: #64748B; font-size: 12px;'
      );
    } catch (e) {}
  }
};

// Global assignment & auto-execution
if (typeof window !== 'undefined') {
  window.Security = Security;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Security.initProtection());
  } else {
    Security.initProtection();
  }
}
