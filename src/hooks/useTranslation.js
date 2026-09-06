/**
 * useTranslation hook — manages translation state, auto-translation, and direction.
 *
 * BUG-5 FIX: "t" (UI strings) is NOT in the auto-translate useEffect deps.
 * PERF-7: Uses React.startTransition for non-urgent output updates.
 */

import { useState, useEffect, useRef, useCallback, startTransition } from "react";
import { doTranslate, getConfidence, isArabic, getConfidenceLabel } from "../lib/translator";
import { DIRECTIONS, DEBOUNCE_MS } from "../lib/constants";

export function useTranslation(uiLang, t, initialDirection = DIRECTIONS.AUTO, initialInput = "") {
  const [direction, setDirection] = useState(initialDirection);
  const [inputText, setInputText] = useState(initialInput);
  const [outputText, setOutputText] = useState("");
  const [detectedLabel, setDetectedLabel] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [confidenceLabel, setConfidenceLabel] = useState("none");
  const timerRef = useRef(null);

  // Auto-translate on input change (BUG-5: t removed from deps)
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (inputText.trim()) {
        let dir = direction;
        if (dir === DIRECTIONS.AUTO) dir = isArabic(inputText) ? DIRECTIONS.A2F : DIRECTIONS.F2A;
        const result = doTranslate(inputText, dir);
        const score = getConfidence(inputText, dir);
        // PERF-7: Mark output update as non-urgent transition
        startTransition(() => {
          setOutputText(result);
          setConfidence(score);
          setConfidenceLabel(getConfidenceLabel(score));
        });
        if (direction === DIRECTIONS.AUTO) {
          setDetectedLabel(isArabic(inputText) ? t(uiLang, "lblArabic") : t(uiLang, "lblFranco"));
        } else {
          setDetectedLabel("");
        }
      } else {
        startTransition(() => {
          setOutputText("");
          setDetectedLabel("");
          setConfidence(0);
          setConfidenceLabel("none");
        });
      }
    }, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [inputText, direction]); // BUG-5: intentionally excludes t/uiLang

  // Update detected label when language changes (separate from translation)
  useEffect(() => {
    if (inputText.trim() && direction === DIRECTIONS.AUTO) {
      setDetectedLabel(isArabic(inputText) ? t(uiLang, "lblArabic") : t(uiLang, "lblFranco"));
    }
  }, [uiLang]);

  const handleSwap = useCallback(() => {
    let newDir;
    if (direction === DIRECTIONS.F2A) newDir = DIRECTIONS.A2F;
    else if (direction === DIRECTIONS.A2F) newDir = DIRECTIONS.F2A;
    else newDir = DIRECTIONS.AUTO;
    setDirection(newDir);
    setInputText(outputText);
  }, [direction, outputText]);

  const handleTranslate = useCallback(() => {
    if (!inputText.trim()) return;
    let dir = direction;
    if (dir === DIRECTIONS.AUTO) dir = isArabic(inputText) ? DIRECTIONS.A2F : DIRECTIONS.F2A;
    const result = doTranslate(inputText, dir);
    const score = getConfidence(inputText, dir);
    setOutputText(result);
    setConfidence(score);
    setConfidenceLabel(getConfidenceLabel(score));
    return { inputText, outputText: result };
  }, [inputText, direction]);

  const handleClear = useCallback(() => {
    setInputText("");
    setOutputText("");
  }, []);

  // Computed labels
  let inputLabel, outputLabel, inputPlaceholder, inputIsArabic, outputIsArabic;
  if (direction === DIRECTIONS.F2A) {
    inputLabel = t(uiLang, "lblFranco");
    outputLabel = t(uiLang, "lblArabic");
    inputPlaceholder = t(uiLang, "phFranco");
    inputIsArabic = false;
    outputIsArabic = true;
  } else if (direction === DIRECTIONS.A2F) {
    inputLabel = t(uiLang, "lblArabic");
    outputLabel = t(uiLang, "lblFranco");
    inputPlaceholder = t(uiLang, "phArabic");
    inputIsArabic = true;
    outputIsArabic = false;
  } else {
    const isAr = inputText.trim() && isArabic(inputText);
    inputLabel = detectedLabel
      ? t(uiLang, "lblDetected") + ": " + detectedLabel
      : t(uiLang, "lblFranco") + " / " + t(uiLang, "lblArabic");
    outputLabel = isAr ? t(uiLang, "lblFranco") : t(uiLang, "lblArabic");
    inputPlaceholder = t(uiLang, "phFranco") + " / " + t(uiLang, "phArabic");
    inputIsArabic = !!isAr;
    outputIsArabic = !isAr;
  }

  return {
    direction,
    setDirection,
    inputText,
    setInputText,
    outputText,
    confidence,
    confidenceLabel,
    inputLabel,
    outputLabel,
    inputPlaceholder,
    inputIsArabic,
    outputIsArabic,
    handleSwap,
    handleTranslate,
    handleClear,
  };
}
