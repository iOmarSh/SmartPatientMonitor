"use client";

import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import { createMedicalTheme, createRTLTheme } from "@/lib/theme";
import { translations, Language, TranslationKey } from "@/lib/translations";

interface AppContextType {
  mode: "light" | "dark";
  toggleMode: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  direction: "ltr" | "rtl";
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Create RTL cache
const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create LTR cache
const ltrCache = createCache({
  key: "muiltr",
  stylisPlugins: [prefixer],
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark">("dark");
  const [language, setLanguage] = useState<Language>("en");

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const direction = language === "ar" ? "rtl" : "ltr";

  const t = (key: TranslationKey): string => {
    return translations[language][key];
  };

  const theme = useMemo(() => {
    if (direction === "rtl") {
      return createRTLTheme(mode);
    }
    return createMedicalTheme(mode);
  }, [mode, direction]);

  const cache = direction === "rtl" ? rtlCache : ltrCache;

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode,
      language,
      setLanguage,
      t,
      direction,
    }),
    [mode, language, direction]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
      </CacheProvider>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
