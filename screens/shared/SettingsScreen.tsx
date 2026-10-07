import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAppTranslation } from "@/hooks/useTranslation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/Spacing";
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme, isDark, toggleTheme, setThemeColor } = useTheme();
  const { t, changeLanguage, currentLanguage, isRTL, availableLanguages } =
    useAppTranslation();
  const { user, logout, isBiometricEnabled, toggleBiometric, canUseBiometric } =
    useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoScanEnabled, setAutoScanEnabled] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  const colorSchemes = [
    { name: "Blue", value: "blue", color: "#0077B6" },
    { name: "Green", value: "green", color: "#00A896" },
    { name: "Purple", value: "purple", color: "#7209B7" },
    { name: "Orange", value: "orange", color: "#F77F00" },
    { name: "Red", value: "red", color: "#D62828" },
    { name: "Teal", value: "teal", color: "#00B4D8" },
  ];

  const handleLanguageChange = (languageCode: string) => {
    changeLanguage(languageCode);
    AsyncStorage.setItem("userLanguage", languageCode);
  };

  const handleColorSchemeChange = (scheme: string) => {
    setThemeColor(scheme);
    AsyncStorage.setItem("themeColor", scheme);
  };

  const handleLogout = () => {
    Alert.alert(t("common.logout"), t("settings.logoutConfirm"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.logout"), style: "destructive", onPress: logout },
    ]);
  };

  const handleBiometricToggle = async () => {
    if (!canUseBiometric) {
      Alert.alert(
        t("settings.biometricUnavailable"),
        t("settings.biometricUnavailableDesc"),
        [{ text: t("common.ok") }],
      );
      return;
    }

    setBiometricLoading(true);
    try {
      const success = await toggleBiometric();
      if (success) {
        Alert.alert(
          t("settings.biometricUpdated"),
          isBiometricEnabled
            ? t("settings.biometricDisabled")
            : t("settings.biometricEnabled"),
          [{ text: t("common.ok") }],
        );
      } else {
        Alert.alert(t("common.error"), t("settings.biometricFailed"), [
          { text: t("common.ok") },
        ]);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("settings.biometricError"), [
        { text: t("common.ok") },
      ]);
    } finally {
      setBiometricLoading(false);
    }
  };

  const renderLanguageOption = (lang: any) => (
    <TouchableOpacity
      key={lang.code}
      style={[
        styles.languageOption,
        {
          backgroundColor: theme.surface,
          borderColor:
            currentLanguage === lang.code ? theme.primary : theme.border,
          borderWidth: currentLanguage === lang.code ? 2 : 1,
        },
      ]}
      onPress={() => handleLanguageChange(lang.code)}
    >
      <View style={styles.languageInfo}>
        <ThemedText style={[styles.languageName, { color: theme.text }]}>
          {lang.nativeName}
        </ThemedText>
        <ThemedText
          style={[styles.languageCode, { color: theme.textSecondary }]}
        >
          {lang.name}
        </ThemedText>
      </View>
      {currentLanguage === lang.code && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={theme.primary}
        />
      )}
    </TouchableOpacity>
  );

  const renderColorScheme = (scheme: any) => (
    <TouchableOpacity
      key={scheme.value}
      style={[
        styles.colorSchemeOption,
        {
          backgroundColor: theme.surface,
          borderColor:
            theme.primary === scheme.color ? theme.text : theme.border,
          borderWidth: theme.primary === scheme.color ? 2 : 1,
        },
      ]}
      onPress={() => handleColorSchemeChange(scheme.value)}
    >
      <View style={styles.colorInfo}>
        <View
          style={[styles.colorPreview, { backgroundColor: scheme.color }]}
        />
        <ThemedText style={[styles.colorName, { color: theme.text }]}>
          {scheme.name}
        </ThemedText>
      </View>
      {theme.primary === scheme.color && (
        <MaterialCommunityIcons
          name="check-circle"
          size={24}
          color={theme.primary}
        />
      )}
    </TouchableOpacity>
  );

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
  ) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        { backgroundColor: theme.surface, borderBottomColor: theme.border },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingLeft}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color={theme.primary}
        />
        <View style={styles.settingText}>
          <ThemedText style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText
              style={[styles.settingSubtitle, { color: theme.textSecondary }]}
            >
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {rightComponent || (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.textSecondary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Section */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings.profile")}
          </ThemedText>
          <View
            style={[styles.profileCard, { backgroundColor: theme.surface }]}
          >
            <View style={styles.profileInfo}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: theme.primary + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    user?.role === "doctor"
                      ? "doctor"
                      : user?.role === "patient"
                        ? "account"
                        : "store"
                  }
                  size={32}
                  color={theme.primary}
                />
              </View>
              <View style={styles.profileDetails}>
                <ThemedText style={[styles.profileName, { color: theme.text }]}>
                  {user?.displayName || "User"}
                </ThemedText>
                <ThemedText
                  style={[styles.profileRole, { color: theme.textSecondary }]}
                >
                  {user?.role
                    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    : "Guest"}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings.language")}
          </ThemedText>
          <View style={styles.languageList}>
            {availableLanguages.map(renderLanguageOption)}
          </View>
        </View>

        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings.appearance")}
          </ThemedText>

          {/* Dark Mode Toggle */}
          {renderSettingItem(
            "moon-waning-crescent",
            t("settings.darkMode"),
            t("settings.darkModeDesc"),
            undefined,
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary + "40" }}
              thumbColor={isDark ? theme.primary : theme.textSecondary}
            />,
          )}

          {/* Color Schemes */}
          <ThemedText style={[styles.subsectionTitle, { color: theme.text }]}>
            {t("settings.colorScheme")}
          </ThemedText>
          <View style={styles.colorSchemeList}>
            {colorSchemes.map(renderColorScheme)}
          </View>
        </View>

        {/* OCR Settings Section */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings.ocrSettings")}
          </ThemedText>

          {renderSettingItem(
            "camera",
            t("settings.autoScan"),
            t("settings.autoScanDesc"),
            undefined,
            <Switch
              value={autoScanEnabled}
              onValueChange={setAutoScanEnabled}
              trackColor={{ false: theme.border, true: theme.primary + "40" }}
              thumbColor={autoScanEnabled ? theme.primary : theme.textSecondary}
            />,
          )}

          {renderSettingItem(
            "translate",
            t("settings.autoTranslate"),
            t("settings.autoTranslateDesc"),
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primary + "40" }}
              thumbColor={
                notificationsEnabled ? theme.primary : theme.textSecondary
              }
            />,
          )}
        </View>

        {/* Other Settings */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {t("settings.other")}
          </ThemedText>

          {renderSettingItem(
            "fingerprint",
            t("settings.biometric"),
            canUseBiometric
              ? t("settings.biometricDesc")
              : t("settings.biometricUnavailableDesc"),
            canUseBiometric ? handleBiometricToggle : undefined,
            canUseBiometric ? (
              <Switch
                value={isBiometricEnabled}
                onValueChange={handleBiometricToggle}
                disabled={biometricLoading}
                trackColor={{ false: theme.border, true: theme.primary + "40" }}
                thumbColor={
                  isBiometricEnabled ? theme.primary : theme.textSecondary
                }
              />
            ) : (
              <MaterialCommunityIcons
                name="fingerprint-off"
                size={20}
                color={theme.textSecondary}
              />
            ),
          )}

          {renderSettingItem(
            "bell",
            t("settings.notifications"),
            t("settings.notificationsDesc"),
            () => Alert.alert(t("settings.notifications"), "Coming soon"),
          )}

          {renderSettingItem(
            "help-circle",
            t("settings.help"),
            t("settings.helpDesc"),
            () => Alert.alert(t("settings.help"), "Help center coming soon"),
          )}

          {renderSettingItem(
            "information",
            t("settings.about"),
            t("settings.aboutDesc"),
            () => Alert.alert(t("settings.about"), "MediConnect v2.0.0"),
          )}
        </View>

        {/* Logout Button */}
        <View style={[styles.section, { backgroundColor: theme.background }]}>
          <TouchableOpacity
            style={[
              styles.logoutButton,
              { backgroundColor: theme.error + "20" },
            ]}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons
              name="logout"
              size={24}
              color={theme.error}
            />
            <ThemedText style={[styles.logoutText, { color: theme.error }]}>
              {t("common.logout")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Bottom padding */}
        <View style={{ height: tabBarHeight + Spacing.xl }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  profileCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "600",
  },
  profileRole: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  languageList: {
    gap: Spacing.sm,
  },
  languageOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 8,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: "500",
  },
  languageCode: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  colorSchemeList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  colorSchemeOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: 8,
    width: "48%",
  },
  colorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: Spacing.sm,
  },
  colorName: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.md,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
});
