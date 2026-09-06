/**
 * Translation engine for Egyptian Franco-Arabic.
 *
 * Smart transliteration with:
 *  - Arabic text normalization (diacritics, shadda, tanween)
 *  - Dictionary lookup (phrases + words)
 *  - Context-aware character mapping for unknown words
 *  - Vowel insertion between consonants
 *  - Egyptian dialect rules (ج→g, ق→2, ث→s, ذ→z, ظ→z)
 */

import {
  francoToArDict,
  arToFrancoDict,
  francoToArMap,
  arToFrancoMap,
  sortedArPhrases,
} from "./dictionary";

// ── Named constants ──
export const DEBOUNCE_MS = 300;
export const MAX_HISTORY = 5;
export const MAX_LAYOUT_WIDTH = 1200;

/**
 * Escape special regex characters in a string.
 */
export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Detect whether text contains Arabic script.
 */
export function isArabic(text) {
  return /[\u0600-\u06FF]/.test(text);
}

/**
 * Word-boundary-aware truncation.
 */
export function truncateAtBoundary(text, maxLen) {
  if (text.length <= maxLen) return text;
  let breakIdx = text.lastIndexOf(" ", maxLen);
  if (breakIdx < maxLen * 0.5) {
    breakIdx = maxLen;
    const char = text.charCodeAt(breakIdx);
    if (char >= 0xd800 && char <= 0xdbff) breakIdx--;
  }
  return text.substring(0, breakIdx) + "…";
}

// ═══════════════════════════════════════════════════════════════
//  Arabic text normalization
// ═══════════════════════════════════════════════════════════════

/**
 * Normalize Arabic text before translation:
 * 1. Handle shadda (ّ) by doubling the consonant
 * 2. Remove tashkeel (diacritics: fatha, damma, kasra, sukoon, tanween)
 * 3. Normalize hamza forms
 */
function normalizeArabic(text) {
  let w = text;

  // Step 1: Handle shadda (ّ) — double the preceding letter
  // Shadda + letter means the consonant is doubled
  w = w.replace(/(.)\u0651/g, "$1$1");  // letter + shadda → letter + letter
  w = w.replace(/\u0651(.)/g, "$1$1");  // shadda before letter (some encodings)

  // Step 2: Remove all tashkeel (diacritics)
  // U+064B=FATHATAN, U+064C=DAMMATAN, U+064D=KASRATAN
  // U+064E=FATHA, U+064F=DAMMA, U+0650=KASRA
  // U+0651=SHADDA (already handled), U+0652=SUKOON
  // U+0653-U+0657=other marks
  w = w.replace(/[\u064B-\u0657]/g, "");

  // Step 3: Normalize alif variants to plain ا
  w = w.replace(/[أإآ]/g, "ا");

  return w;
}

/**
 * Pre-computed normalized dictionary for Arabic→Franco lookup.
 * Maps normalized Arabic forms (no diacritics, unified alif) to Franco.
 * This ensures dictionary hits even after text normalization.
 */
const normalizedArToFrancoDict = {};

for (const [key, val] of Object.entries(arToFrancoDict)) {
  const nk = normalizeArabic(key);
  if (nk !== key) {
    normalizedArToFrancoDict[nk] = val;
  }
}
// Merge: normalized keys fill in gaps where original has diacritics
const arLookupDict = { ...arToFrancoDict, ...normalizedArToFrancoDict };

// Pre-sort all keys (longest first) for phrase matching
const allArLookupPhrases = Object.keys(arLookupDict).sort(
  (a, b) => b.length - a.length
);

// ═══════════════════════════════════════════════════════════════
//  Franco → Arabic translation
// ═══════════════════════════════════════════════════════════════

/**
 * Translate Franco text to Arabic script.
 * Uses dictionary lookup first (phrases then words), then character mapping.
 */
export function translateFrancoToArabic(text) {
  // Step 1: Try phrase matching on the full text first (handles "el beit" → البيت)
  let w = text.toLowerCase().replace(/[^a-z0-9'\s]/g, "");
  
  // Sort Franco phrases longest-first for matching
  const francoPhrases = Object.keys(francoToArDict)
    .filter(k => k.includes(" "))
    .sort((a, b) => b.length - a.length);
  
  // Build a map of phrase positions to avoid overlapping
  const replacements = [];
  for (const phrase of francoPhrases) {
    let idx = w.indexOf(phrase);
    while (idx !== -1) {
      // Check this position doesn't overlap with an existing replacement
      const overlaps = replacements.some(r => 
        (idx >= r.start && idx < r.end) || (r.start >= idx && r.start < idx + phrase.length)
      );
      if (!overlaps) {
        replacements.push({ start: idx, end: idx + phrase.length, phrase, arabic: francoToArDict[phrase] });
      }
      idx = w.indexOf(phrase, idx + 1);
    }
  }
  
  // Sort replacements by position
  replacements.sort((a, b) => a.start - b.start);
  
  // If we have phrase matches, rebuild the text with those replaced
  if (replacements.length > 0) {
    let result = "";
    let lastEnd = 0;
    // We need to map positions from the cleaned string back to the original
    // Simpler approach: just replace phrases directly in the original text
    let originalText = text;
    for (const rep of replacements) {
      // Find the phrase in the original text (case-insensitive)
      const regex = new RegExp(escapeRegExp(rep.phrase), "gi");
      originalText = originalText.replace(regex, rep.arabic);
    }
    // Now process any remaining Franco text that wasn't matched by phrases
    return processRemainingFranco(originalText);
  }
  
  return processRemainingFranco(text);
}

/**
 * Process remaining Franco text token-by-token with dictionary lookup and character mapping.
 */
function processRemainingFranco(text) {
  const tokens = text.split(/(\s+|[.,!؟?؛;:'"()\-])/);
  const result = tokens.map((token) => {
    if (/^\s+$/.test(token) || /^[.,!؟?؛;:'"()\-]+$/.test(token)) return token;
    if (/[\u0600-\u06FF]/.test(token)) return token; // Already Arabic
    const lower = token.toLowerCase().replace(/[^a-z0-9']/g, "");
    if (!lower) return token;
    // Pure digit runs are literal numbers (phone numbers, quantities), not Franco words
    if (/^[0-9]+$/.test(lower)) return token;
    // Dictionary lookup
    if (francoToArDict[lower]) return francoToArDict[lower];
    // Character mapping for unknown words
    let w = lower;
    for (const [regex, replacement] of francoToArMap) {
      w = w.replace(new RegExp(regex.source, "gi"), replacement);
    }
    return w;
  });
  return result.join("");
}

// ═══════════════════════════════════════════════════════════════
//  Arabic → Franco translation (SMART ENGINE)
// ═══════════════════════════════════════════════════════════════

/**
 * Check if an Arabic character is a consonant (not a long vowel or taa marbouta).
 */
function isArConsonant(ch) {
  return "بتددرزسفعكلمنهجخحصضطظعغفقشذثئؤء".includes(ch);
}

/**
 * Check if an Arabic character is a long vowel carrier.
 */
function isArVowel(ch) {
  return "اوىة".includes(ch);
}

/**
 * Smart transliteration of a single Arabic word to Franco.
 * Handles context-dependent mapping for ي (y/i), و (w/o), ة (a),
 * and inserts vowels between consonants.
 */
function smartTransliterateWord(word) {
  // Check dictionary one more time for single words
  if (arLookupDict[word]) return arLookupDict[word];

  let result = "";
  let i = 0;
  const len = word.length;

  while (i < len) {
    const ch = word[i];
    const next = i + 1 < len ? word[i + 1] : "";
    const prev = i > 0 ? word[i - 1] : "";

    // ── Skip any remaining diacritics ──
    if (/[^\u0600-\u06FF]/.test(ch) && !isArConsonant(ch) && !isArVowel(ch)) {
      i++;
      continue;
    }

    // ── ي (yaa) — context dependent ──
    if (ch === "ي") {
      if (i === len - 1) {
        // ي at end of word → "i" (حبيبي→7abibi, هيجي→hayigi)
        result += "i";
      } else if (next && isArConsonant(next) && next !== "ي") {
        // ي before a consonant → consonant "y" + default vowel
        // (هيجي→hayigi, يوم→youm, بيقول→bye2ol)
        result += "y";
        // Insert default vowel after y if next is consonant
        // The "a" or "i" depends on context, default to "i" after y
        const nextNext = i + 2 < len ? word[i + 2] : "";
        if (nextNext && isArVowel(nextNext)) {
          // There's a vowel coming after the consonant, just add y
          // The vowel will be handled when we get to it
        } else {
          result += "i";
        }
      } else if (next === "ا" || next === "و") {
        // ي before long vowel → "y" consonant (يوم→youm, يعني→ya3ni)
        result += "y";
      } else if (next === "ي") {
        // Double ي → "yy" or "eyy"
        result += "yy";
        i++; // skip the second ي
      } else {
        // ي as long vowel → "ee" or "i"
        result += "i";
      }
      i++;
      continue;
    }

    // ── و (waaw) — context dependent ──
    if (ch === "و") {
      if (i === 0) {
        // و at start of word → likely "w" consonant (واحد→wahed, ولا→wala)
        if (next && (next === "ا" || next === "ي")) {
          result += "w";
        } else {
          result += "w";
        }
      } else if (prev && isArConsonant(prev)) {
        // و after a consonant
        if (next && (next === "ا" || next === "ي")) {
          // و before a long vowel → "w" (موقع→maw2i3)
          result += "w";
        } else if (next && isArConsonant(next)) {
          // و between two consonants → "o" vowel (شغل→shoghl)
          result += "o";
        } else {
          // و at end of word or before nothing → "o"
          result += "o";
        }
      } else {
        // و after a vowel → "w" consonant or "ou"
        if (next && (next === "ا" || next === "ي")) {
          result += "w";
        } else {
          result += "o";
        }
      }
      i++;
      continue;
    }

    // ── ا (alif) ──
    if (ch === "ا") {
      result += "a";
      i++;
      continue;
    }

    // ── آ (alif with madda) ──
    if (ch === "آ") {
      result += "aa";
      i++;
      continue;
    }

    // ── ة (taa marbouta) ──
    if (ch === "ة") {
      if (i === len - 1) {
        // ة at end of word → "a" (كبيرة→kabeera→kabeera, حلوة→7elwa)
        result += "a";
      } else {
        // ة in middle (rare, like morphological) → "t"
        result += "t";
      }
      i++;
      continue;
    }

    // ── ى (alif maqsura) ──
    if (ch === "ى") {
      result += "a";
      i++;
      continue;
    }

    // ── Consonant with vowel insertion ──
    // Before mapping the consonant, check if we need to insert a vowel
    // between the previous output consonant and this one.
    if (isArConsonant(ch)) {
      const prevOutput = result.slice(-1);
      // A Franco consonant: NOT a, e, i, o, u (those are vowels)
      const francoConsonants = /[btfkdrlmnszghq2345679']/i;
      // Also check multi-char ending like 'sh' — last char 'h' is consonant
      const isPrevConsonant = prevOutput && francoConsonants.test(prevOutput);

      // Apply consonant mapping
      let mapped = false;
      for (const [regex, replacement] of arToFrancoMap) {
        if (regex.test(ch)) {
          // Insert vowel "a" between adjacent consonants
          if (isPrevConsonant) {
            result += "a";
          }
          result += replacement;
          mapped = true;
          break;
        }
      }

      if (!mapped) {
        if (isPrevConsonant) {
          result += "a";
        }
        result += ch;
      }
      i++;
      continue;
    }

    // ── Fallback: pass through unknown character ──
    result += ch;
    i++;
  }

  return result;
}

/**
 * Translate Arabic text to Franco using the smart engine.
 */
export function translateArabicToFranco(text) {
  // Step 1: Normalize Arabic (remove diacritics, handle shadda, normalize alif)
  let normalized = normalizeArabic(text);

  // Step 2: Dictionary phrase replacement (longest first, literal split/join)
  // Uses arLookupDict which includes normalized forms for diacritic-free matching
  for (const phrase of allArLookupPhrases) {
    if (normalized.includes(phrase)) {
      normalized = normalized.split(phrase).join(arLookupDict[phrase]);
    }
  }

  // Step 3: Split into tokens and process each
  // We need to identify which parts are still Arabic (need transliteration)
  // and which have already been converted by the dictionary
  const tokens = normalized.split(/(\s+|[.,!؟?؛;:'"()\-])/);
  const result = tokens.map((token) => {
    if (/^\s+$/.test(token) || /^[.,!؟?؛;:'"()\-]+$/.test(token)) return token;
    if (!token) return token;

    // Check if this token still contains Arabic characters
    if (!/[\u0600-\u06FF]/.test(token)) return token; // Already converted

    // Split mixed tokens (e.g., "elبيت" from partial phrase match)
    // Process each Arabic sub-token separately
    return splitAndTransliterate(token);
  });

  return result.join("");
}

/**
 * Split a mixed token into Arabic and non-Arabic parts,
 * transliterate only the Arabic parts.
 */
function splitAndTransliterate(token) {
  // Split by Arabic/non-Arabic boundaries
  const parts = token.split(/([\u0600-\u06FF]+)/);
  return parts.map((part) => {
    if (/[\u0600-\u06FF]/.test(part)) {
      return smartTransliterateWord(part);
    }
    return part;
  }).join("");
}

// ═══════════════════════════════════════════════════════════════
//  Common API
// ═══════════════════════════════════════════════════════════════

/**
 * Translate text in a given direction, or auto-detect.
 */
export function doTranslate(text, direction) {
  if (!text.trim()) return "";
  if (direction === "franco-to-arabic") return translateFrancoToArabic(text);
  if (direction === "arabic-to-franco") return translateArabicToFranco(text);
  if (isArabic(text)) return translateArabicToFranco(text);
  return translateFrancoToArabic(text);
}

/**
 * Compute a confidence score (0-100) based on dictionary match ratio.
 */
export function getConfidence(text, direction) {
  if (!text.trim()) return 0;
  const isAr = isArabic(text);
  const dict = isAr ? arToFrancoDict : francoToArDict;
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9'\u0600-\u06FF\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return 0;
  let matchCount = 0;
  for (const w of words) {
    if (dict[w]) matchCount++;
  }
  return Math.round((matchCount / words.length) * 100);
}

/**
 * Map confidence score to a label key.
 */
export function getConfidenceLabel(score) {
  if (score >= 60) return "high";
  if (score >= 25) return "medium";
  if (score > 0) return "low";
  return "none";
}
