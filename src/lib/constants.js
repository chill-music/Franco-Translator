/**
 * Constants used across the application.
 */

// Translation engine
export const DEBOUNCE_MS = 300;
export const MAX_HISTORY = 5;
export const MAX_LAYOUT_WIDTH = 1200;
export const TRUNCATE_LEN = 60;
export const TOAST_DURATION_MS = 3500;

// Confidence thresholds
export const CONFIDENCE_HIGH = 60;
export const CONFIDENCE_MEDIUM = 25;

// Valid theme values (SEC-4)
export const VALID_THEMES = ["dark", "light"];
export const VALID_LANGS = ["en", "ar"];

// Direction modes
export const DIRECTIONS = {
  AUTO: "auto",
  F2A: "franco-to-arabic",
  A2F: "arabic-to-franco",
};
