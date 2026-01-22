export type ThemeColorName =
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "orange"
  | "green"
  | "teal"
  | "indigo";

interface ThemeColorConfig {
  name: {
    tr: string;
    en: string;
  };
  emoji: string;
  main: string;
  mainDark: string;
  light: string;
  gradients: {
    gradient1: string;
    gradient2: string;
    gradient3: string;
    gradient4: string;
  };
  gradientsDark: {
    gradient1: string;
    gradient2: string;
    gradient3: string;
    gradient4: string;
  };
}

export const THEME_COLORS: Record<ThemeColorName, ThemeColorConfig> = {
  blue: {
    name: { tr: "Mavi", en: "Blue" },
    emoji: "💙",
    main: "#2563EB", // older: #3B82F6 - made more vibrant
    mainDark: "#3B82F6",
    light: "#EFF6FF",
    gradients: {
      gradient1: "#60A5FA",
      gradient2: "#2563EB",
      gradient3: "#93C5FD",
      gradient4: "#1D4ED8",
    },
    gradientsDark: {
      gradient1: "#3B82F6",
      gradient2: "#2563EB",
      gradient3: "#60A5FA",
      gradient4: "#1D4ED8",
    },
  },
  purple: {
    name: { tr: "Mor", en: "Purple" },
    emoji: "💜",
    main: "#A855F7",
    mainDark: "#C084FC",
    light: "#F3E8FF",
    gradients: {
      gradient1: "#C084FC",
      gradient2: "#E879F9",
      gradient3: "#818CF8",
      gradient4: "#D8B4FE",
    },
    gradientsDark: {
      gradient1: "#C084FC",
      gradient2: "#D946EF",
      gradient3: "#818CF8",
      gradient4: "#A855F7",
    },
  },
  pink: {
    name: { tr: "Pembe", en: "Pink" },
    emoji: "💗",
    main: "#EC4899",
    mainDark: "#F472B6",
    light: "#FCE7F3",
    gradients: {
      gradient1: "#F472B6",
      gradient2: "#FB7185",
      gradient3: "#E879F9",
      gradient4: "#F9A8D4",
    },
    gradientsDark: {
      gradient1: "#EC4899",
      gradient2: "#E11D48",
      gradient3: "#C026D3",
      gradient4: "#DB2777",
    },
  },
  red: {
    name: { tr: "Kırmızı", en: "Red" },
    emoji: "❤️",
    main: "#DC2626", // older: #EF4444 - made more vibrant/deeper
    mainDark: "#EF4444",
    light: "#FEF2F2",
    gradients: {
      gradient1: "#EF4444",
      gradient2: "#F97316",
      gradient3: "#FCA5A5",
      gradient4: "#B91C1C",
    },
    gradientsDark: {
      gradient1: "#DC2626",
      gradient2: "#C2410C",
      gradient3: "#B91C1C",
      gradient4: "#991B1B",
    },
  },
  orange: {
    name: { tr: "Turuncu", en: "Orange" },
    emoji: "🧡",
    main: "#EA580C",
    mainDark: "#F97316",
    light: "#FFF7ED",
    gradients: {
      gradient1: "#F97316",
      gradient2: "#F59E0B",
      gradient3: "#FDBA74",
      gradient4: "#C2410C",
    },
    gradientsDark: {
      gradient1: "#EA580C",
      gradient2: "#B45309",
      gradient3: "#9A3412",
      gradient4: "#7C2D12",
    },
  },
  green: {
    name: { tr: "Yeşil", en: "Green" },
    emoji: "💚",
    main: "#059669",
    mainDark: "#10B981",
    light: "#ECFDF5",
    gradients: {
      gradient1: "#10B981",
      gradient2: "#14B8A6",
      gradient3: "#6EE7B7",
      gradient4: "#047857",
    },
    gradientsDark: {
      gradient1: "#059669",
      gradient2: "#047857",
      gradient3: "#065F46",
      gradient4: "#064E3B",
    },
  },
  teal: {
    name: { tr: "Turkuaz", en: "Teal" },
    emoji: "🩵",
    main: "#0D9488",
    mainDark: "#14B8A6",
    light: "#F0FDFA",
    gradients: {
      gradient1: "#14B8A6",
      gradient2: "#06B6D4",
      gradient3: "#5EEAD4",
      gradient4: "#0F766E",
    },
    gradientsDark: {
      gradient1: "#0D9488",
      gradient2: "#0891B2",
      gradient3: "#115E59",
      gradient4: "#134E4A",
    },
  },
  indigo: {
    name: { tr: "Lacivert", en: "Navy" },
    emoji: "🌌",
    main: "#172554", // true navy (blue-950)
    mainDark: "#1E40AF", // lighter navy for dark mode (blue-800)
    light: "#EFF6FF",
    gradients: {
      gradient1: "#1E40AF", // blue-800
      gradient2: "#1E3A8A", // blue-900
      gradient3: "#60A5FA", // blue-400
      gradient4: "#172554", // blue-950
    },
    gradientsDark: {
      gradient1: "#2563EB",
      gradient2: "#1D4ED8",
      gradient3: "#1E40AF",
      gradient4: "#1E3A8A",
    },
  },
};

export function getThemeColors(
  colorName: ThemeColorName,
  isDark: boolean = false,
) {
  const config = THEME_COLORS[colorName];
  return {
    main: isDark ? config.mainDark : config.main,
    light: config.light,
    gradients: isDark ? config.gradientsDark : config.gradients,
  };
}

// Ordered roughly by spectrum/logic:
// Blue -> Indigo -> Purple -> Pink -> Red -> Orange -> Green -> Teal
export const ORDERED_THEME_COLORS: ThemeColorName[] = [
  "blue",
  "indigo",
  "purple",
  "pink",
  "red",
  "orange",
  "green",
  "teal",
];

export function getAllThemeColorNames(): ThemeColorName[] {
  return ORDERED_THEME_COLORS;
}
