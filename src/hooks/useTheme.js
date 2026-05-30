/**
 * useTheme hook — manages dark/light theme with localStorage persistence.
 */

import { useState, useEffect, useCallback } from "react";
import { getValidatedTheme } from "../lib/storage";
import { safeSetItem } from "../lib/storage";

export function useTheme() {
  const [theme, setThemeState] = useState(getValidatedTheme);

  useEffect(() => {
    safeSetItem("franco-theme", theme);
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, setTheme, toggleTheme };
}
