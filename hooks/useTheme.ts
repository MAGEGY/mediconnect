import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import { Colors } from "@/constants/theme";

interface ThemeColors {
  background: string;
  backgroundRoot: string;
  surface: string;
  primary: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  tabIconSelected: string;
  tabIconDefault: string;
  // Legacy properties for compatibility
  link: string;
  buttonText: string;
  divider: string;
  backgroundDefault: string;
  backgroundSecondary: string;
  cardBackground: string;
}

const colorSchemes = {
  blue: "#0077B6",
  green: "#00A896",
  purple: "#7209B7",
  orange: "#F77F00",
  red: "#D62828",
  teal: "#00B4D8",
};

const createTheme = (baseColor: string, isDark: boolean): ThemeColors => {
  const opacity = isDark ? 0.8 : 1;
  return {
    background: isDark ? "#121212" : "#FFFFFF",
    backgroundRoot: isDark ? "#000000" : "#FFFFFF",
    surface: isDark ? "#1E1E1E" : "#F5F5F5",
    primary: baseColor,
    text: isDark ? "#FFFFFF" : "#000000",
    textSecondary: isDark ? "#AAAAAA" : "#666666",
    border: isDark ? "#333333" : "#E0E0E0",
    error: "#D62828",
    warning: "#F77F00",
    success: "#2A9D8F",
    tabIconSelected: baseColor,
    tabIconDefault: isDark ? "#666666" : "#999999",
    // Legacy properties for compatibility
    link: baseColor,
    buttonText: "#FFFFFF",
    divider: isDark ? "#333333" : "#E0E0E0",
    backgroundDefault: isDark ? "#1E1E1E" : "#F5F5F5",
    backgroundSecondary: isDark ? "#2A2A2A" : "#EEEEEE",
    cardBackground: isDark ? "#1E1E1E" : "#FFFFFF",
  };
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");
  const [themeColor, setThemeColor] = useState("blue");
  const [theme, setTheme] = useState<ThemeColors>(
    createTheme(colorSchemes.blue as string, isDark),
  );

  useEffect(() => {
    // Load saved preferences
    loadThemePreferences();
  }, []);

  useEffect(() => {
    // Update theme when color scheme or dark mode changes
    setTheme(
      createTheme(
        colorSchemes[themeColor as keyof typeof colorSchemes],
        isDark,
      ),
    );
  }, [themeColor, isDark]);

  const loadThemePreferences = async () => {
    try {
      const savedDarkMode = await AsyncStorage.getItem("darkMode");
      const savedColorScheme = await AsyncStorage.getItem("themeColor");

      if (savedDarkMode !== null) {
        setIsDark(savedDarkMode === "true");
      }

      if (savedColorScheme) {
        setThemeColor(savedColorScheme);
      }
    } catch (error) {
      console.error("Error loading theme preferences:", error);
    }
  };

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    try {
      await AsyncStorage.setItem("darkMode", newIsDark.toString());
    } catch (error) {
      console.error("Error saving dark mode preference:", error);
    }
  };

  const setThemeColorScheme = async (color: string) => {
    setThemeColor(color);
    try {
      await AsyncStorage.setItem("themeColor", color);
    } catch (error) {
      console.error("Error saving color scheme preference:", error);
    }
  };

  return {
    theme,
    isDark,
    toggleTheme,
    setThemeColor: setThemeColorScheme,
    availableColors: Object.entries(colorSchemes).map(([name, color]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: name,
      color,
    })),
  };
}
