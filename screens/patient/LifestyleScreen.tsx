import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { lifestyleService } from "@/utils/data";
import { LifestyleData } from "@/types";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function LifestyleScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [todayData, setTodayData] = useState<LifestyleData | null>(null);
  const [lifestyleHistory, setLifestyleHistory] = useState<LifestyleData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    const data = await lifestyleService.getByPatientId(user.id);
    setLifestyleHistory(data);

    const today = new Date().toISOString().split("T")[0];
    const todayRecord = data.find((d) => d.date === today);
    setTodayData(todayRecord || null);
  };

  const addVitalSign = (type: string) => {
    Alert.prompt(`Add ${type}`, `Enter your ${type} value`, async (value) => {
      if (!value || !user) return;

      const today = new Date().toISOString().split("T")[0];
      const numValue = parseFloat(value);

      if (isNaN(numValue)) {
        Alert.alert("Error", "Please enter a valid number");
        return;
      }

      const newData: Partial<LifestyleData> = {
        patientId: user.id,
        date: today,
      };

      switch (type) {
        case "Steps":
          newData.steps = numValue;
          break;
        case "Calories":
          newData.calories = numValue;
          break;
        case "Blood Pressure":
          Alert.prompt("Systolic", "Enter systolic value", async (sys) => {
            if (!sys) return;
            Alert.prompt("Diastolic", "Enter diastolic value", async (dia) => {
              if (!dia) return;
              const data: Omit<LifestyleData, "id"> = {
                patientId: user.id,
                date: today,
                bloodPressureSystolic: parseInt(sys),
                bloodPressureDiastolic: parseInt(dia),
              };
              await lifestyleService.add(data);
              loadData();
            });
          });
          return;
      }

      await lifestyleService.add(newData as Omit<LifestyleData, "id">);
      loadData();
    });
  };

  const QuickAddButton = ({ icon, title, color, onPress }: any) => (
    <Pressable
      style={[styles.quickAddButton, { backgroundColor: theme.surface }]}
      onPress={onPress}
      android_ripple={{ color: color + "20" }}
    >
      <View style={[styles.quickAddIcon, { backgroundColor: color + "20" }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <ThemedText style={[styles.quickAddText, { color: theme.text }]}>
        {title}
      </ThemedText>
    </Pressable>
  );

  const DataCard = ({ icon, title, value, unit, color }: any) => (
    <View style={[styles.dataCard, { backgroundColor: theme.surface }]}>
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <ThemedText style={[styles.dataValue, { color: theme.text }]}>
        {value}
        {unit}
      </ThemedText>
      <ThemedText style={[styles.dataTitle, { color: theme.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
    >
      <ThemedView style={styles.content}>
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Today's Stats
          </ThemedText>
          <View style={styles.statsGrid}>
            <DataCard
              icon="shoe-sneaker"
              title="Steps"
              value={todayData?.steps || 0}
              unit=""
              color={theme.success}
            />
            <DataCard
              icon="fire"
              title="Calories"
              value={todayData?.calories || 0}
              unit=" kcal"
              color={theme.warning}
            />
            <DataCard
              icon="blood-bag"
              title="Blood Pressure"
              value={todayData?.bloodPressureSystolic || "-"}
              unit={
                todayData?.bloodPressureDiastolic
                  ? `/${todayData.bloodPressureDiastolic}`
                  : ""
              }
              color={theme.primary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Add
          </ThemedText>
          <View style={styles.quickAddGrid}>
            <QuickAddButton
              icon="shoe-sneaker"
              title="Steps"
              color={theme.success}
              onPress={() => addVitalSign("Steps")}
            />
            <QuickAddButton
              icon="fire"
              title="Calories"
              color={theme.warning}
              onPress={() => addVitalSign("Calories")}
            />
            <QuickAddButton
              icon="blood-bag"
              title="BP"
              color={theme.primary}
              onPress={() => addVitalSign("Blood Pressure")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Recent History
          </ThemedText>
          {lifestyleHistory.slice(0, 7).map((item, index) => (
            <View
              key={index}
              style={[styles.historyCard, { backgroundColor: theme.surface }]}
            >
              <View style={styles.historyInfo}>
                <ThemedText style={[styles.historyDate, { color: theme.text }]}>
                  {new Date(item.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </ThemedText>
                <View style={styles.historyValues}>
                  {item.steps !== undefined && (
                    <ThemedText
                      style={[
                        styles.historyValue,
                        { color: theme.textSecondary },
                      ]}
                    >
                      <MaterialCommunityIcons name="shoe-sneaker" size={14} />{" "}
                      {item.steps} steps
                    </ThemedText>
                  )}
                  {item.calories !== undefined && (
                    <ThemedText
                      style={[
                        styles.historyValue,
                        { color: theme.textSecondary },
                      ]}
                    >
                      <MaterialCommunityIcons name="fire" size={14} />{" "}
                      {item.calories} kcal
                    </ThemedText>
                  )}
                  {item.bloodPressureSystolic !== undefined && (
                    <ThemedText
                      style={[
                        styles.historyValue,
                        { color: theme.textSecondary },
                      ]}
                    >
                      <MaterialCommunityIcons name="blood-bag" size={14} />{" "}
                      {item.bloodPressureSystolic}/{item.bloodPressureDiastolic}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          ))}
          {lifestyleHistory.length === 0 && (
            <View style={styles.emptyHistory}>
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                No data recorded yet
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  dataCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    ...Shadows.card,
  },
  dataValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  dataTitle: {
    fontSize: 12,
  },
  quickAddGrid: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  quickAddButton: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    ...Shadows.card,
  },
  quickAddIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  quickAddText: {
    fontSize: 14,
    fontWeight: "500",
  },
  historyCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  historyInfo: {
    gap: Spacing.sm,
  },
  historyDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  historyValues: {
    gap: Spacing.xs,
  },
  historyValue: {
    fontSize: 14,
  },
  emptyHistory: {
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
  },
});
