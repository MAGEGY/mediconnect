import { Platform } from "react-native";

const primaryLight = "#0077B6";
const primaryDark = "#00B4D8";

export const Colors = {
  light: {
    primary: "#0077B6",
    primaryVariant: "#005A8C",
    secondary: "#00B4D8",
    accent: "#48CAE4",
    error: "#D32F2F",
    warning: "#F57C00",
    success: "#388E3C",
    text: "#212121",
    textSecondary: "#757575",
    buttonText: "#FFFFFF",
    tabIconDefault: "#757575",
    tabIconSelected: primaryLight,
    link: "#0077B6",
    backgroundRoot: "#FFFFFF",
    backgroundDefault: "#F5F5F5",
    backgroundSecondary: "#EEEEEE",
    backgroundTertiary: "#E0E0E0",
    surface: "#FFFFFF",
    divider: "#E0E0E0",
  },
  dark: {
    primary: "#00B4D8",
    primaryVariant: "#0077B6",
    secondary: "#48CAE4",
    accent: "#90E0EF",
    error: "#EF5350",
    warning: "#FF9800",
    success: "#66BB6A",
    text: "#ECEDEE",
    textSecondary: "#9BA1A6",
    buttonText: "#FFFFFF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryDark,
    link: "#00B4D8",
    backgroundRoot: "#1F2123",
    backgroundDefault: "#2A2C2E",
    backgroundSecondary: "#353739",
    backgroundTertiary: "#404244",
    surface: "#2A2C2E",
    divider: "#404244",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: "500" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "500" as const,
  },
  h3: {
    fontSize: 18,
    fontWeight: "500" as const,
  },
  h4: {
    fontSize: 16,
    fontWeight: "500" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: 14,
    fontWeight: "500" as const,
    textTransform: "uppercase" as const,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  fab: {
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  card: {
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
