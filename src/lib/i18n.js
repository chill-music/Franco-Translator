/**
 * Multilingual UI strings for the FrancoAr application.
 */

export const uiStrings = {
  en: {
    appTitle: "Franco Translator",
    heroTitle: "Egyptian Arabic ↔ Franco",
    heroSub:
      "Translate between Egyptian Arabic and Franco-Arabic (Arabizi) instantly and accurately.",
    btnTranslate: "Translate",
    btnSwap: "Swap",
    btnCopy: "Copy",
    btnPaste: "Paste",
    btnClear: "Clear",
    btnGuide: "Guide",
    phArabic: "Type or paste Arabic text here…",
    phFranco: "Type or paste Franco text here…",
    lblArabic: "Arabic",
    lblFranco: "Franco",
    lblDetected: "Detected",
    toastCopied: "Copied to clipboard!",
    toastPasted: "Pasted!",
    toastPasteNotice: "Clipboard content will be used for translation.",
    toastError: "Translation failed.",
    historyTitle: "Recent Translations",
    historyClear: "Clear History",
    historyEmpty: "No history yet. Press {shortcut} to save.",
    confHigh: "High confidence",
    confMedium: "Medium confidence",
    confLow: "Low confidence",
    chars: "characters",
    words: "words",
    f1Title: "Bidirectional",
    f1Desc: "Translate seamlessly between Arabic script and Franco-Arabic in both directions.",
    f2Title: "Egyptian Dialect",
    f2Desc: "Built for Masri. Handles ق as 2 and ج as g natively.",
    f3Title: "Instant & Free",
    f3Desc: "Real-time translation as you type. No accounts or sign-ups required.",
    f4Title: "Smart Variants",
    f4Desc: "Understands 7abibi, 7abeeby, and habibi. Accepts all spelling variations.",
    aboutTitle: "About Franco Arabic",
    aboutDesc:
      "Franco-Arabic (or Arabizi) is a way of writing Egyptian Arabic using Latin letters and numbers. This tool helps bridge the gap between traditional Arabic script and the Franco-Arabic used in everyday digital communication.",
    guideTitle: "Franco Quick Reference Guide",
    guideNumbers: "Number-to-Letter Mappings",
    guideRules: "Egyptian Dialect Rules",
    guidePhrases: "Common Egyptian Phrases",
    guideNumNote: "Numbers inside words are phonetic symbols, NOT digits.",
    footer: "Built with ❤ for Egyptians",
    dirAuto: "Auto-detect",
    dirF2A: "Franco → Arabic",
    dirA2F: "Arabic → Franco",
    shortcutSave: "Ctrl+Enter",
    shortcutSaveMac: "Cmd+Enter",
  },
  ar: {
    appTitle: "مترجم الفرانكو",
    heroTitle: "عربي مصري ↔ فرانكو",
    heroSub: "ترجم بين العربي المصري والفرانكو فورياً وبدقة.",
    btnTranslate: "ترجم",
    btnSwap: "تبديل",
    btnCopy: "نسخ",
    btnPaste: "لصق",
    btnClear: "مسح",
    btnGuide: "دليل",
    phArabic: "اكتب عربي هنا…",
    phFranco: "اكتب فرانكو هنا…",
    lblArabic: "عربي",
    lblFranco: "فرانكو",
    lblDetected: "تم الكشف",
    toastCopied: "تم النسخ!",
    toastPasted: "تم اللصق!",
    toastPasteNotice: "سيتم استخدام محتوى الحافظة للترجمة.",
    toastError: "فشلت الترجمة.",
    historyTitle: "آخر الترجمات",
    historyClear: "مسح السجل",
    historyEmpty: "لا ترجمات بعد. اضغط {shortcut} للحفظ.",
    confHigh: "دقة عالية",
    confMedium: "دقة متوسطة",
    confLow: "دقة منخفضة",
    chars: "حرف",
    words: "كلمة",
    f1Title: "ثنائي الاتجاه",
    f1Desc: "ترجمة سلسة بين الخط العربي والفرانكو.",
    f2Title: "لهجة مصرية",
    f2Desc: "مصمم خصيصاً للمصري. ق بدل 2 و ج بدل g.",
    f3Title: "فوري ومجاني",
    f3Desc: "ترجمة فورية أثناء الكتابة. لا حاجة لحسابات.",
    f4Title: "تبديلات ذكية",
    f4Desc: "يفهم 7abibi و 7abeeby و habibi. يقبل كل الاختلافات.",
    aboutTitle: "عن الفرانكو",
    aboutDesc:
      "الفرانكو هي طريقة كتابة العربية بالحروف اللاتينية. تساعد هذه الأداة في سد الفجوة بين الخط العربي والفرانكو.",
    guideTitle: "دليل الفرانكو السريع",
    guideNumbers: "أرقام التعبير",
    guideRules: "قواعد اللهجة المصرية",
    guidePhrases: "عبارات مصرية شائعة",
    guideNumNote: "الأرقام داخل الكلمات هي رموز صوتية، ليست أرقاماً.",
    footer: "صُنع بـ ❤ للمصريين",
    dirAuto: "تلقائي",
    dirF2A: "فرانكو → عربي",
    dirA2F: "عربي → فرانكو",
    shortcutSave: "Ctrl+Enter",
    shortcutSaveMac: "Cmd+Enter",
  },
};

/**
 * Get a UI string, with optional interpolation.
 * Supports {key} placeholders.
 */
export function t(lang, key, vars) {
  let str = uiStrings[lang]?.[key] || uiStrings.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, v);
    }
  }
  return str;
}
