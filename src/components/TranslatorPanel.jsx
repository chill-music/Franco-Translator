/**
 * TranslatorPanel — single input or output panel.
 * UX-2: Output uses a readonly textarea for native mobile text selection.
 */

import { t } from "../lib/i18n";
import { CONFIDENCE_HIGH, CONFIDENCE_MEDIUM } from "../lib/constants";

export function TranslatorPanel({
  label,
  placeholder,
  isArabic: isAr,
  isOutput = false,
  value,
  onChange,
  confidenceScore = 0,
  confidenceLabel = "none",
  onCopy,
  onPaste,
  onClear,
  uiLang,
}) {
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const confidenceColor =
    confidenceScore >= CONFIDENCE_HIGH
      ? "var(--accent-success)"
      : confidenceScore >= CONFIDENCE_MEDIUM
      ? "var(--accent-warning)"
      : "var(--text-secondary)";

  return (
    <div className="box-card">
      <div className="box-header">
        <div className="box-header-left">
          <span className="box-label">{label}</span>
          {isOutput && confidenceLabel !== "none" && (
            <span
              className="confidence-dot"
              style={{ backgroundColor: confidenceColor }}
              title={`${confidenceScore}%`}
            />
          )}
        </div>
        <div className="box-header-actions">
          <button className="btn-icon" onClick={onCopy} title={t(uiLang, "btnCopy")}>
            {t(uiLang, "btnCopy")}
          </button>
          <button className="btn-icon" onClick={onPaste} title={t(uiLang, "btnPaste")}>
            {t(uiLang, "btnPaste")}
          </button>
        </div>
      </div>

      {isOutput ? (
        <textarea
          className={isAr ? "ar-text" : "fr-text"}
          readOnly
          value={value || (uiLang === "ar" ? "الترجمة ستظهر هنا…" : "Translation will appear here…")}
          placeholder={placeholder}
          aria-label="Output text"
        />
      ) : (
        <textarea
          className={isAr ? "ar-text" : "fr-text"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Input text"
        />
      )}

      <div className="box-footer">
        <span className="box-stats">
          {value.length} {t(uiLang, "chars")} | {wordCount} {t(uiLang, "words")}
          {isOutput && confidenceLabel !== "none" && ` • ${confidenceScore}%`}
        </span>
        {onClear && (
          <button className="btn-icon clear-btn" onClick={onClear}>
            {t(uiLang, "btnClear")}
          </button>
        )}
      </div>
    </div>
  );
}
