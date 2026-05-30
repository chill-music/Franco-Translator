/**
 * localStorage utilities with safe access (SEC-3, SEC-4).
 */

import { VALID_THEMES, VALID_LANGS } from "./constants";

/**
 * Safe localStorage.getItem — wrapped in try/catch for Safari private browsing.
 */
export function safeGetItem(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe localStorage.setItem — wrapped in try/catch.
 * PERF-5: Uses requestIdleCallback when available for debounced writes.
 */
export function safeSetItem(key, value) {
  const write = () => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // QuotaExceededError or private browsing — silently ignore
    }
  };
  if ("requestIdleCallback" in window) {
    requestIdleCallback(write);
  } else {
    write();
  }
}

/**
 * Validate and sanitise the stored theme value (SEC-4).
 * Only 'dark' or 'light' are accepted; anything else defaults to 'dark'.
 */
export function getValidatedTheme() {
  const raw = safeGetItem("franco-theme", "dark");
  return VALID_THEMES.includes(raw) ? raw : "dark";
}

/**
 * Validate and sanitise the stored language value.
 */
export function getValidatedLang() {
  const raw = safeGetItem("franco-lang", "en");
  return VALID_LANGS.includes(raw) ? raw : "en";
}

/**
 * Safe localStorage.getItem + JSON.parse for history.
 */
export function getStoredHistory() {
  try {
    return JSON.parse(safeGetItem("franco-history", "[]"));
  } catch {
    return [];
  }
}
