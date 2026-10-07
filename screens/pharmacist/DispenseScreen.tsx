import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, TextInput } from "react-native";
import { CameraView, Camera } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { prescriptionService, dispensingService } from "@/utils/data";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function DispenseScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || !user) return;
    setScanned(true);

    const prescriptionId = data.replace("medrecord://prescription/", "");
    const prescription = await prescriptionService.getById(prescriptionId);

    if (prescription) {
      Alert.alert(
        "Prescription Found",
        `Patient: ${prescription.patientName}\nMedicines: ${prescription.medicines.length}\n\nDispense this prescription?`,
        [
          { text: "Cancel", onPress: () => setScanned(false) },
          {
            text: "Full Dispense",
            onPress: async () => {
              await prescriptionService.dispense(
                prescription.id,
                user.id,
                false,
              );
              await dispensingService.record({
                prescriptionId: prescription.id,
                patientId: prescription.patientId,
                patientName: prescription.patientName,
                pharmacistId: user.id,
                dispensedMedicines: prescription.medicines.map((m) => ({
                  medicineId: m.medicineId,
                  medicineName: m.medicineName,
                  quantityDispensed: m.quantity,
                  quantityPrescribed: m.quantity,
                })),
                partial: false,
              });
              Alert.alert("Success", "Prescription dispensed successfully");
              setScanned(false);
            },
          },
          {
            text: "Partial Dispense",
            onPress: async () => {
              await prescriptionService.dispense(
                prescription.id,
                user.id,
                true,
              );
              Alert.alert("Success", "Prescription partially dispensed");
              setScanned(false);
            },
          },
        ],
      );
    } else {
      Alert.alert("Error", "Prescription not found", [
        { text: "Try Again", onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleManualEntry = () => {
    Alert.prompt(
      "Enter Prescription ID or Patient ID",
      "Type the ID to look up the prescription",
      async (id) => {
        if (!id || !user) return;

        let prescription = await prescriptionService.getById(id.trim());

        if (!prescription) {
          const prescriptions = await prescriptionService.getByPatientId(
            id.trim(),
          );
          if (prescriptions.length > 0) {
            prescription =
              prescriptions.filter((p) => !p.dispensedAt)[0] ||
              prescriptions[0];
          }
        }

        if (prescription) {
          Alert.alert(
            "Prescription Found",
            `${prescription.id}\nPatient: ${prescription.patientName}`,
            [{ text: "OK" }],
          );
        } else {
          Alert.alert("Error", "No prescription found for this ID");
        }
      },
    );
  };

  if (hasPermission === null) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="camera-off"
            size={64}
            color={theme.textSecondary}
          />
          <ThemedText style={[styles.permissionText, { color: theme.text }]}>
            Camera permission denied
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermission}
          >
            <ThemedText
              style={[styles.buttonText, { color: theme.buttonText }]}
            >
              GRANT PERMISSION
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.cameraContainer, { marginBottom: tabBarHeight }]}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
        />

        <View style={styles.overlay}>
          <View style={[styles.scanArea, { borderColor: theme.primary }]} />

          <View
            style={[styles.instructionBox, { backgroundColor: theme.surface }]}
          >
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={24}
              color={theme.primary}
            />
            <ThemedText style={[styles.instructionText, { color: theme.text }]}>
              {scanned ? "Processing..." : "Scan prescription QR code"}
            </ThemedText>
          </View>
        </View>

        <View
          style={[styles.bottomActions, { bottom: tabBarHeight + Spacing.xl }]}
        >
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={() => setScanned(false)}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={24}
              color={theme.primary}
            />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Reset
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={handleManualEntry}
          >
            <MaterialCommunityIcons
              name="keyboard"
              size={24}
              color={theme.primary}
            />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Manual Entry
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  permissionText: {
    fontSize: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  button: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing["3xl"],
    gap: Spacing.md,
  },
  instructionText: {
    fontSize: 14,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
