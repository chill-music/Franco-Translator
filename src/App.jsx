/**
 * FrancoAr — Egyptian Franco ↔ Arabic Translator
 *
 * Main application component. Decomposed into custom hooks and sub-components
 * per Phase 3 architecture requirements.
 */

import { useState, useEffect, useCallback } from "react";
import { t } from "./lib/i18n";
import { getValidatedLang } from "./lib/storage";
import { safeSetItem } from "./lib/storage";
import { DIRECTIONS, TOAST_DURATION_MS, VALID_LANGS } from "./lib/constants";
import { isArabic } from "./lib/translator";
import { useTheme } from "./hooks/useTheme";
import { useHistory } from "./hooks/useHistory";
import { useTranslation } from "./hooks/useTranslation";
import { TranslatorPanel } from "./components/TranslatorPanel";
import { GuidePanel } from "./components/GuidePanel";
import { HistoryPanel } from "./components/HistoryPanel";
import { SunIcon, MoonIcon, SwapIcon } from "./components/Icons";
import "./index.css";

function App() {
  // ── URL params: shortcuts (?dir=), share_target (?text=), lang links (?lang=) ──
  const urlParams = new URLSearchParams(window.location.search);
  const paramLang = urlParams.get("lang");
  const paramDir = urlParams.get("dir");
  const sharedText = urlParams.get("text") || urlParams.get("title") || "";
  const initialDirection =
    paramDir === "f2a" ? DIRECTIONS.F2A :
    paramDir === "a2f" ? DIRECTIONS.A2F :
    DIRECTIONS.AUTO;

  // ── Theme ──
  const { theme, toggleTheme } = useTheme();

  // ── Language ──
  const [uiLang, setUiLang] = useState(
    VALID_LANGS.includes(paramLang) ? paramLang : getValidatedLang()
  );

  useEffect(() => {
    safeSetItem("franco-lang", uiLang);
    document.documentElement.lang = uiLang === "ar" ? "ar" : "en";
    document.documentElement.dir = uiLang === "ar" ? "rtl" : "ltr";
  }, [uiLang]);

  // ── Panels ──
  const [showGuide, setShowGuide] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // ── Translation ──
  const {
    direction, setDirection,
    inputText, setInputText,
    outputText, confidence, confidenceLabel,
    inputLabel, outputLabel, inputPlaceholder,
    inputIsArabic, outputIsArabic,
    handleSwap, handleTranslate, handleClear,
  } = useTranslation(uiLang, t, initialDirection, sharedText);

  // ── History ──
  const { history, addToHistory, clearHistory } = useHistory();

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), TOAST_DURATION_MS); // UX-5: 3.5s duration
  }, []);

  // ── Clipboard handlers ──
  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(t(uiLang, "toastCopied"));
    } catch {
      showToast("Clipboard access denied");
    }
  }, [uiLang, showToast]);

  const handlePaste = useCallback(async (isOutputBox) => {
    try {
      const text = await navigator.clipboard.readText();
      // SEC-5: Notify user clipboard content may be stored
      showToast(t(uiLang, "toastPasteNotice"));
      if (isOutputBox) {
        setInputText(text);
        setDirection(isArabic(text) ? DIRECTIONS.A2F : DIRECTIONS.F2A);
      } else {
        setInputText(text);
      }
    } catch {
      showToast("Please allow clipboard access");
    }
  }, [uiLang, showToast, setInputText, setDirection]);

  // ── Translate + save ──
  const onTranslate = useCallback(() => {
    const result = handleTranslate();
    if (result) addToHistory(result.inputText, result.outputText);
  }, [handleTranslate, addToHistory]);

  // ── Keyboard shortcuts (BUG-4: Esc closes panels first) ──
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        onTranslate();
      } else if (e.key === "Escape") {
        // BUG-4: Close panels before clearing
        if (showGuide) { setShowGuide(false); return; }
        if (showHistory) { setShowHistory(false); return; }
        // Only clear if no panels are open
        handleClear();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTranslate, handleClear, showGuide, showHistory]);

  // ── Language toggle ──
  const toggleLang = useCallback(() => {
    setUiLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  // ── Direction selector ──
  const directionOptions = [
    { val: DIRECTIONS.AUTO, label: t(uiLang, "dirAuto") },
    { val: DIRECTIONS.F2A, label: t(uiLang, "dirF2A") },
    { val: DIRECTIONS.A2F, label: t(uiLang, "dirA2F") },
  ];

  // ── Shortcut label (UX-7) ──
  const isMac = navigator.platform?.includes("Mac");
  const shortcutKey = isMac
    ? t(uiLang, "shortcutSaveMac")
    : t(uiLang, "shortcutSave");

  return (
    <div className="app-root">
      {/* ── Navigation ── */}
      <nav className="navbar" data-theme={theme}>
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon">
              <span className="ar-text brand-letter">ع</span>F
            </div>
            <span className="brand-title">{t(uiLang, "appTitle")}</span>
          </div>
          <div className="navbar-actions">
            <button className="btn-icon guide-btn" onClick={() => setShowGuide(true)}>
              {t(uiLang, "btnGuide")}
            </button>
            <button className="btn-icon lang-btn" onClick={toggleLang}>
              {uiLang === "en" ? "ع" : "EN"}
            </button>
            <button className="btn-icon theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className="hero">
        <h1 className="hero-title">{t(uiLang, "heroTitle")}</h1>
        <p className="hero-sub">{t(uiLang, "heroSub")}</p>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* Direction selector */}
        <div className="direction-selector">
          {directionOptions.map((opt) => (
            <button
              key={opt.val}
              className={`direction-btn ${direction === opt.val ? "active" : ""}`}
              onClick={() => setDirection(opt.val)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Translator panels */}
        <div className="translator-grid">
          <TranslatorPanel
            label={inputLabel}
            placeholder={inputPlaceholder}
            isArabic={inputIsArabic}
            value={inputText}
            onChange={setInputText}
            onCopy={() => handleCopy(inputText)}
            onPaste={() => handlePaste(false)}
            onClear={handleClear}
            uiLang={uiLang}
          />

          {/* Swap button — UX-6: hidden on mobile, shown in header on mobile */}
          <div className="swap-container desktop-only">
            <button className="swap-btn" onClick={handleSwap} title={t(uiLang, "btnSwap")} aria-label={t(uiLang, "btnSwap")}>
              <SwapIcon />
            </button>
          </div>

          <TranslatorPanel
            label={outputLabel}
            isArabic={outputIsArabic}
            isOutput
            value={outputText}
            confidenceScore={confidence}
            confidenceLabel={confidenceLabel}
            onCopy={() => handleCopy(outputText)}
            onPaste={() => handlePaste(true)}
            uiLang={uiLang}
          />
        </div>

        {/* Translate button */}
        <div className="translate-btn-container">
          <button className="btn-primary" onClick={onTranslate}>
            {t(uiLang, "btnTranslate")}
          </button>
        </div>

        {/* History */}
        <HistoryPanel
          show={showHistory}
          onToggle={() => setShowHistory((v) => !v)}
          history={history}
          onClear={clearHistory}
          onSelect={(text) => { setInputText(text); setShowHistory(false); }}
          uiLang={uiLang}
        />
      </main>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="features-grid">
          {[
            { icon: "⇄", title: t(uiLang, "f1Title"), desc: t(uiLang, "f1Desc") },
            { icon: "🇪🇬", title: t(uiLang, "f2Title"), desc: t(uiLang, "f2Desc") },
            { icon: "⚡", title: t(uiLang, "f3Title"), desc: t(uiLang, "f3Desc") },
            { icon: "🧠", title: t(uiLang, "f4Title"), desc: t(uiLang, "f4Desc") },
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── About ── */}
      <section className="about-section">
        <h2 className="about-title">{t(uiLang, "aboutTitle")}</h2>
        <p className="about-desc">{t(uiLang, "aboutDesc")}</p>
      </section>

      {/* ── Footer ── */}
      <footer className="app-footer">
        {t(uiLang, "footer")} | FrancoAr v2.0 ·{" "}
        <a href="privacy-policy.html" style={{ color: "var(--accent-secondary)" }}>
          Privacy Policy
        </a>
      </footer>

      {/* ── Guide Panel (overlay) ── */}
      <GuidePanel
        show={showGuide}
        onClose={() => setShowGuide(false)}
        uiLang={uiLang}
      />

      {/* ── Toast ── */}
      {toast && <div className="toast-msg">{toast}</div>}
    </div>
  );
}

export default App;
