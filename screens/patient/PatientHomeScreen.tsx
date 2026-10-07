import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import {
  prescriptionService,
  lifestyleService,
  MEDICAL_ADVICE,
} from "@/utils/data";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function PatientHomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [latestVitals, setLatestVitals] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;

    const prescriptions = await prescriptionService.getByPatientId(user.id);
    setPrescriptionCount(prescriptions.filter((p) => !p.dispensedAt).length);

    const lifestyle = await lifestyleService.getByPatientId(user.id);
    if (lifestyle.length > 0) {
      setLatestVitals(lifestyle[lifestyle.length - 1]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const HealthMetricCard = ({ icon, title, value, unit, color }: any) => (
    <View style={[styles.metricCard, { backgroundColor: theme.surface }]}>
      <View style={[styles.metricIcon, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <ThemedText style={[styles.metricValue, { color: theme.text }]}>
        {value}
        <ThemedText style={[styles.metricUnit, { color: theme.textSecondary }]}>
          {" "}
          {unit}
        </ThemedText>
      </ThemedText>
      <ThemedText style={[styles.metricTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );

  const AdviceCard = ({ item }: { item: any }) => (
    <View style={[styles.adviceCard, { backgroundColor: theme.surface }]}>
      <View
        style={[styles.adviceIcon, { backgroundColor: theme.primary + "20" }]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={24}
          color={theme.primary}
        />
      </View>
      <View style={styles.adviceContent}>
        <ThemedText style={[styles.adviceTitle, { color: theme.text }]}>
          {item.title}
        </ThemedText>
        <ThemedText
          style={[styles.adviceDescription, { color: theme.textSecondary }]}
        >
          {item.description}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
    >
      <ThemedView style={styles.header}>
        <ThemedText style={[styles.greeting, { color: theme.textSecondary }]}>
          {getGreeting()}
        </ThemedText>
        <ThemedText style={[styles.userName, { color: theme.text }]}>
          {user?.displayName}
        </ThemedText>
      </ThemedView>

      {prescriptionCount > 0 && (
        <Pressable
          style={[
            styles.alertBanner,
            {
              backgroundColor: theme.warning + "20",
              borderColor: theme.warning,
            },
          ]}
          android_ripple={{ color: theme.warning + "30" }}
        >
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color={theme.warning}
          />
          <View style={styles.alertContent}>
            <ThemedText style={[styles.alertTitle, { color: theme.warning }]}>
              Pending Prescriptions
            </ThemedText>
            <ThemedText style={[styles.alertText, { color: theme.warning }]}>
              You have {prescriptionCount} prescription
              {prescriptionCount > 1 ? "s" : ""} to collect
            </ThemedText>
          </View>
        </Pressable>
      )}

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          Health Metrics
        </ThemedText>
        <View style={styles.metricsGrid}>
          <HealthMetricCard
            icon="heart-pulse"
            title="Heart Rate"
            value="72"
            unit="bpm"
            color={theme.error}
          />
          <HealthMetricCard
            icon="blood-bag"
            title="Blood Pressure"
            value={latestVitals?.bloodPressureSystolic || "120"}
            unit="/80"
            color={theme.primary}
          />
          <HealthMetricCard
            icon="shoe-sneaker"
            title="Steps Today"
            value={latestVitals?.steps || "0"}
            unit=""
            color={theme.success}
          />
          <HealthMetricCard
            icon="fire"
            title="Calories"
            value={latestVitals?.calories || "0"}
            unit="kcal"
            color={theme.warning}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          Health Advice
        </ThemedText>
        {MEDICAL_ADVICE.slice(0, 3).map((advice, index) => (
          <AdviceCard key={index} item={advice} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.xl,
  },
  greeting: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  alertText: {
    fontSize: 12,
  },
  section: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  metricCard: {
    width: "48%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    ...Shadows.card,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: "400",
  },
  metricTitle: {
    fontSize: 12,
  },
  adviceCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  adviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  adviceDescription: {
    fontSize: 12,
    lineHeight: 18,
  },
});
