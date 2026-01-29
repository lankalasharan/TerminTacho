"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface DarkModeContextType {
  isDark: boolean;
  toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(saved ? JSON.parse(saved) : prefersDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("darkMode", JSON.stringify(isDark));
    if (isDark) {
      document.documentElement.style.colorScheme = "dark";
      document.body.style.background = "#1a1a1a";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.style.colorScheme = "light";
      document.body.style.background = "#ffffff";
      document.body.style.color = "#1a1a1a";
    }
  }, [isDark, mounted]);

  const toggleDarkMode = () => setIsDark(!isDark);

  return (
    <DarkModeContext.Provider value={{ isDark, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within DarkModeProvider");
  }
  return context;
}
