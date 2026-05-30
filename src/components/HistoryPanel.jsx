/**
 * HistoryPanel component — shows recent translations.
 */

import { t } from "../lib/i18n";
import { ChevronDownIcon, ArrowRightIcon } from "./Icons";

export function HistoryPanel({ show, onToggle, history, onClear, onSelect, uiLang }) {
  return (
    <div className="history-section">
      <button className="history-toggle" onClick={onToggle}>
        {t(uiLang, "historyTitle")} <ChevronDownIcon rotated={show} />
      </button>
      {show && (
        <div className="history-panel">
          <div className="history-header">
            <button className="btn-icon history-clear-btn" onClick={onClear}>
              {t(uiLang, "historyClear")}
            </button>
          </div>
          {history.length === 0 ? (
            <div className="history-empty">{t(uiLang, "historyEmpty", {
              shortcut: navigator.platform?.includes("Mac")
                ? t(uiLang, "shortcutSaveMac")
                : t(uiLang, "shortcutSave"),
            })}</div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item"
                onClick={() => onSelect(item.input)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && onSelect(item.input)}
              >
                <div className="history-item-row">
                  <div className="history-item-text">
                    <span className="history-input">{item.input}</span>
                    <span className="history-arrow"><ArrowRightIcon /></span>
                    <span className="history-output">{item.output}</span>
                  </div>
                  <span className="history-time">{item.time}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
