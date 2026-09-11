/**
 * GuidePanel component — displays the Franco quick reference guide.
 * UX-1: Uses CSS logical property for slide direction (RTL-aware).
 */

import { useMemo } from "react";
import { t } from "../lib/i18n";
import { CloseIcon } from "./Icons";

// Static data (CQ-2: module-level constants)
const GUIDE_NUMBERS = [
  ["2", "ء / أ / إ / ق", "Hamza / Qaf"],
  ["3", "ع", "Ayn"],
  ["3'", "غ", "Ghayn (or gh)"],
  ["5", "خ", "Kha (or kh / 7')"],
  ["6", "ط", "Emphatic Ta"],
  ["7", "ح", "Pharyngeal Ha"],
  ["8", "غ", "Alternate for ghayn (input only)"],
  ["9", "ص", "Emphatic Sad"],
];

const GUIDE_RULES = [
  ["ج = g", "gameel (not jameel)"],
  ["ق = 2", "2alb (not qalb)"],
  ["ث = s/t", "talata (not thalatha)"],
  ["What = eh", "not shu"],
  ["Where = fein", "not wayn"],
  ["How = ezzay", "not keef"],
];

const GUIDE_PHRASES = [
  ["7abibi", "حبيبي"],
  ["ma3lesh", "معليش"],
  ["ezzayak", "إزيك"],
  ["yalla", "يلا"],
  ["keda", "كده"],
  ["el7amdulillah", "الحمد لله"],
  ["ba7ebak", "بحبك"],
  ["shokran", "شكراً"],
];

export function GuidePanel({ show, onClose, uiLang }) {
  if (!show) return null;

  return (
    <div className="guide-overlay">
      <div className="backdrop" onClick={onClose} />
      <div className="guide-panel" role="dialog" aria-label={t(uiLang, "guideTitle")}>
        <div className="guide-header">
          <h2 className="guide-title">{t(uiLang, "guideTitle")}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>
        <div className="guide-body">
          {/* Number Mappings */}
          <h3 className="guide-section-title">{t(uiLang, "guideNumbers")}</h3>
          <p className="guide-note">{t(uiLang, "guideNumNote")}</p>
          <table className="guide-table">
            <thead>
              <tr>
                <th>Franco</th>
                <th>Arabic</th>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_NUMBERS.map((row, i) => (
                <tr key={i}>
                  <td className="franco-cell">{row[0]}</td>
                  <td className="arabic-cell">{row[1]}</td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Dialect Rules */}
          <h3 className="guide-section-title">{t(uiLang, "guideRules")}</h3>
          <table className="guide-table">
            <thead>
              <tr>
                <th>Rule</th>
                <th>Example</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_RULES.map((row, i) => (
                <tr key={i}>
                  <td className="arabic-cell">{row[0]}</td>
                  <td className="franco-cell">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Common Phrases */}
          <h3 className="guide-section-title">{t(uiLang, "guidePhrases")}</h3>
          <table className="guide-table">
            <thead>
              <tr>
                <th>Franco</th>
                <th>Arabic</th>
              </tr>
            </thead>
            <tbody>
              {GUIDE_PHRASES.map((row, i) => (
                <tr key={i}>
                  <td className="franco-cell">{row[0]}</td>
                  <td className="arabic-cell">{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
