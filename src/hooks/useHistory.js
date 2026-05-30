/**
 * useHistory hook — manages translation history with localStorage persistence.
 */

import { useState, useEffect, useCallback } from "react";
import { getStoredHistory } from "../lib/storage";
import { safeSetItem } from "../lib/storage";
import { MAX_HISTORY, TRUNCATE_LEN } from "../lib/constants";
import { truncateAtBoundary } from "../lib/translator";

export function useHistory() {
  const [history, setHistory] = useState(getStoredHistory);

  useEffect(() => {
    safeSetItem("franco-history", JSON.stringify(history));
  }, [history]);

  const addToHistory = useCallback((inputText, outputText) => {
    if (!inputText.trim() || !outputText.trim()) return;
    const item = {
      id: Date.now(),
      input: truncateAtBoundary(inputText, TRUNCATE_LEN),
      output: truncateAtBoundary(outputText, TRUNCATE_LEN),
      time: new Date().toLocaleTimeString(),
    };
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.input !== item.input);
      return [item, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}
