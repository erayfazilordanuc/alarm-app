import { ThemeColorName } from "@/lib/color-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Language = "tr" | "en";
type Theme = "light" | "dark" | "auto";

interface SettingsState {
  language: Language;
  theme: Theme;
  themeColor: ThemeColorName;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setThemeColor: (color: ThemeColorName) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "tr",
      theme: "auto",
      themeColor: "blue",
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setThemeColor: (themeColor) => set({ themeColor }),
    }),
    {
      name: "app-settings",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
