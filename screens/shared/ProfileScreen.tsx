import React from "react";
import { View, StyleSheet, Pressable, Image, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, IconSize } from "@/constants/theme";

const AVATARS = [
  require("@/assets/avatars/stethoscope.png"),
  require("@/assets/avatars/medical-cross.png"),
  require("@/assets/avatars/heartbeat.png"),
];

const ROLE_LABELS: Record<string, string> = {
  patient: "Patient",
  doctor: "Doctor",
  pharmacist: "Pharmacist",
  lab: "Lab Technician",
  physiotherapy: "Physiotherapist",
  radiologist: "Radiologist",
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const MenuItem = ({ icon, title, onPress, danger }: any) => (
    <Pressable
      style={[styles.menuItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
      android_ripple={{ color: theme.primary + "20" }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={IconSize.md}
        color={danger ? theme.error : theme.textSecondary}
      />
      <ThemedText style={[styles.menuText, danger && { color: theme.error }]}>
        {title}
      </ThemedText>
      <MaterialCommunityIcons
        name="chevron-right"
        size={IconSize.md}
        color={theme.textSecondary}
      />
    </Pressable>
  );

  return (
    <ScreenScrollView>
      <ThemedView style={styles.container}>
        <View style={[styles.header, { backgroundColor: theme.primary }]}>
          <Image
            source={AVATARS[user.avatarIndex] || AVATARS[0]}
            style={styles.avatar}
          />
          <ThemedText style={[styles.name, { color: theme.buttonText }]}>
            {user.displayName}
          </ThemedText>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: theme.buttonText + "20" },
            ]}
          >
            <ThemedText style={[styles.roleText, { color: theme.buttonText }]}>
              {ROLE_LABELS[user.role]}
            </ThemedText>
          </View>
        </View>

        <View style={styles.infoSection}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Account Information
          </ThemedText>

          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <View style={styles.infoRow}>
              <ThemedText
                style={[styles.infoLabel, { color: theme.textSecondary }]}
              >
                Username
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                {user.username}
              </ThemedText>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.divider }]}
            />

            <View style={styles.infoRow}>
              <ThemedText
                style={[styles.infoLabel, { color: theme.textSecondary }]}
              >
                Phone Number
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                {user.phoneNumber}
              </ThemedText>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.divider }]}
            />

            <View style={styles.infoRow}>
              <ThemedText
                style={[styles.infoLabel, { color: theme.textSecondary }]}
              >
                National ID
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                {user.nationalId.replace(/./g, (c, i) =>
                  i < user.nationalId.length - 4 ? "•" : c,
                )}
              </ThemedText>
            </View>

            <View
              style={[styles.divider, { backgroundColor: theme.divider }]}
            />

            <View style={styles.infoRow}>
              <ThemedText
                style={[styles.infoLabel, { color: theme.textSecondary }]}
              >
                Patient ID
              </ThemedText>
              <ThemedText style={[styles.infoValue, { color: theme.text }]}>
                {user.id}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Settings
          </ThemedText>

          <MenuItem
            icon="bell-outline"
            title="Notifications"
            onPress={() =>
              Alert.alert("Notifications", "Notification settings coming soon")
            }
          />
          <MenuItem
            icon="lock-outline"
            title="Privacy & Security"
            onPress={() =>
              Alert.alert("Privacy", "Privacy settings coming soon")
            }
          />
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            onPress={() =>
              Alert.alert("Support", "Contact support at support@medrecord.com")
            }
          />
          <MenuItem
            icon="information-outline"
            title="About"
            onPress={() =>
              Alert.alert(
                "About",
                "MedRecord v1.0.0\nMedical Records & Prescription Management",
              )
            }
          />
          <MenuItem
            icon="logout"
            title="Logout"
            danger
            onPress={handleLogout}
          />
        </View>
      </ThemedView>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
    paddingHorizontal: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: Spacing.lg,
  },
  name: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  infoCard: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    ...Shadows.card,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
  },
  menuSection: {
    padding: Spacing.xl,
    paddingTop: 0,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    ...Shadows.card,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.lg,
  },
});
