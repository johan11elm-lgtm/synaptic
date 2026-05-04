"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_THEME, type Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "portfolio-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // SSR and the first client render must agree, so we always start from
  // DEFAULT_THEME. The real value is picked up from <html data-theme>
  // (which the anti-FOUC <head> script set) in the mount effect below.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromAttr = document.documentElement.dataset.theme;
    if ((fromAttr === "light" || fromAttr === "dark") && fromAttr !== DEFAULT_THEME) {
      // setState in an effect is the only way to adopt the value the
      // anti-FOUC <head> script wrote to <html data-theme>: SSR can't read
      // localStorage, so the client must reconcile after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThemeState(fromAttr);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Skip until we've adopted the value placed by the anti-FOUC script;
    // otherwise the first run would overwrite "light" with DEFAULT_THEME.
    if (!hydrated) return;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore — private mode or storage disabled
    }
  }, [theme, hydrated]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
