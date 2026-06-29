import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultSettings, storage, type Settings } from "@/game/storage";

interface SettingsCtx {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings());

  useEffect(() => {
    setSettings(storage.getSettings());
  }, []);

  useEffect(() => {
    storage.setSettings(settings);
    const root = document.documentElement;
    const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = settings.theme === "dark" || (settings.theme === "system" && sysDark);
    root.classList.toggle("dark", dark);
    root.classList.toggle("high-contrast", settings.highContrast);
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== "system") return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => setSettings((s) => ({ ...s }));
    m.addEventListener("change", fn);
    return () => m.removeEventListener("change", fn);
  }, [settings.theme]);

  return (
    <Ctx.Provider
      value={{
        settings,
        update: (patch) => setSettings((s) => ({ ...s, ...patch })),
        reset: () => setSettings(defaultSettings()),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("SettingsProvider missing");
  return ctx;
}
