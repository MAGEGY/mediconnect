import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { CameraView, Camera } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAppTranslation } from "@/hooks/useTranslation";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ImagePickerAsset, launchImageLibraryAsync } from "expo-image-picker";
import { ocrService } from "@/services/ocrService";
import { Spacing } from "@/constants/Spacing";

type MedicineScanScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  onMedicineIdentified?: (medicine: any) => void;
};

export default function MedicineScanScreen({
  navigation,
  onMedicineIdentified,
}: MedicineScanScreenProps) {
  const { theme } = useTheme();
  const { t, isRTL } = useAppTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const status = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status.status === "granted");
  };

  const handleImageCapture = async (asset: ImagePickerAsset) => {
    setIsScanning(true);
    setShowResults(false);

    try {
      const results = await ocrService.extractMedicineInfo(asset.uri);
      setScanResults(results);
      setShowResults(true);

      if (results.matches.length > 0 && onMedicineIdentified) {
        // Auto-select the best match
        onMedicineIdentified(results.matches[0].medicine);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("ocr.noMedicinesHint"));
      console.error("Scan error:", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCameraCapture = async () => {
    // Take a photo using the camera
    if (cameraRef.current) {
      const result = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (result && result.uri) {
        const asset = {
          uri: result.uri,
          width: result.width,
          height: result.height,
        };
        await handleImageCapture(asset);
      }
    }
  };

  const handleGalleryPick = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 0.8,
      base64: false,
    });

    if (!result.canceled && result.assets[0]) {
      await handleImageCapture(result.assets[0]);
    }
  };

  const handleMedicineSelect = (medicine: any) => {
    if (onMedicineIdentified) {
      onMedicineIdentified(medicine);
      navigation.goBack();
    } else {
      // If no callback, navigate to medicine details
      Alert.alert(
        t("ocr.scanMedicine"),
        `${medicine.name}\n${medicine.strength} ${medicine.dosageForm}`,
      );
    }
  };

  const renderMatchItem = (match: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.matchItem,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => handleMedicineSelect(match.medicine)}
    >
      <View style={styles.matchHeader}>
        <ThemedText style={[styles.medicineName, { color: theme.text }]}>
          {match.medicine.name}
        </ThemedText>
        <ThemedText style={[styles.confidence, { color: theme.primary }]}>
          {t("ocr.confidence", {
            percentage: Math.round(match.confidence * 100),
          })}
        </ThemedText>
      </View>

      <ThemedText
        style={[styles.medicineDetails, { color: theme.textSecondary }]}
      >
        {match.medicine.strength} • {match.medicine.dosageForm}
      </ThemedText>

      {match.medicine.genericName && (
        <ThemedText
          style={[styles.genericName, { color: theme.textSecondary }]}
        >
          {t("ocr.generic", { name: match.medicine.genericName })}
        </ThemedText>
      )}

      <View style={styles.matchedFields}>
        {match.matchedFields.map((field: string, i: number) => (
          <View
            key={i}
            style={[styles.fieldTag, { backgroundColor: theme.primary + "20" }]}
          >
            <ThemedText style={[styles.fieldText, { color: theme.primary }]}>
              {field}
            </ThemedText>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (hasPermission === null) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.message, { color: theme.text }]}>
            {t("common.loading")}
          </ThemedText>
          <ThemedText style={[styles.message, { color: theme.text }]}>
            {t("ocr.cameraPermission")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (hasPermission === false) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="camera-off"
            size={64}
            color={theme.error}
          />
          <ThemedText style={[styles.message, { color: theme.text }]}>
            {t("ocr.cameraPermissionDenied")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (isScanning) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <ThemedText style={[styles.message, { color: theme.text }]}>
            {t("ocr.scanning")}
          </ThemedText>
          <ThemedText
            style={[styles.subMessage, { color: theme.textSecondary }]}
          >
            {t("ocr.analyzing")}
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (showResults && scanResults) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            {t("ocr.scanResults")}
          </ThemedText>
          <TouchableOpacity
            style={[styles.newScanButton, { backgroundColor: theme.primary }]}
            onPress={() => setShowResults(false)}
          >
            <MaterialCommunityIcons name="camera" size={20} color="white" />
            <ThemedText style={styles.newScanText}>
              {t("ocr.newScan")}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.resultsContainer}>
          {scanResults.matches.length > 0 ? (
            <>
              <ThemedText style={[styles.resultsTitle, { color: theme.text }]}>
                {t("ocr.foundMatches", { count: scanResults.matches.length })}
              </ThemedText>
              {scanResults.matches.map(renderMatchItem)}
            </>
          ) : (
            <View style={styles.noResults}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={64}
                color={theme.error}
              />
              <ThemedText style={[styles.noResultsText, { color: theme.text }]}>
                {t("ocr.noMedicinesFound")}
              </ThemedText>
              <ThemedText
                style={[
                  styles.noResultsSubText,
                  { color: theme.textSecondary },
                ]}
              >
                {t("ocr.noMedicinesHint")}
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <View style={[styles.scanArea, { borderColor: theme.primary }]} />

          <View
            style={[styles.instructionBox, { backgroundColor: theme.surface }]}
          >
            <MaterialCommunityIcons
              name="pill"
              size={24}
              color={theme.primary}
            />
            <ThemedText style={[styles.instructionText, { color: theme.text }]}>
              {t("ocr.positionLabel")}
            </ThemedText>
          </View>
        </View>
      </CameraView>

      <View
        style={[styles.bottomActions, { bottom: tabBarHeight + Spacing.xl }]}
      >
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={handleGalleryPick}
        >
          <MaterialCommunityIcons
            name="image"
            size={24}
            color={theme.primary}
          />
          <ThemedText style={[styles.actionText, { color: theme.primary }]}>
            {t("ocr.gallery")}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.captureButton, { backgroundColor: theme.primary }]}
          onPress={handleCameraCapture}
        >
          <MaterialCommunityIcons name="camera" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.surface }]}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="close"
            size={24}
            color={theme.primary}
          />
          <ThemedText style={[styles.actionText, { color: theme.primary }]}>
            {t("common.cancel")}
          </ThemedText>
        </TouchableOpacity>
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
    paddingHorizontal: Spacing.xl,
  },
  message: {
    fontSize: 18,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  subMessage: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 280,
    height: 180,
    borderWidth: 3,
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  instructionBox: {
    position: "absolute",
    bottom: 100,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    marginLeft: Spacing.md,
    fontSize: 16,
    fontWeight: "500",
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: "500",
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  newScanButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  newScanText: {
    color: "white",
    marginLeft: Spacing.sm,
    fontSize: 14,
    fontWeight: "500",
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginVertical: Spacing.lg,
  },
  matchItem: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  confidence: {
    fontSize: 14,
    fontWeight: "500",
  },
  medicineDetails: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  genericName: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: Spacing.md,
  },
  matchedFields: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  fieldTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 4,
  },
  fieldText: {
    fontSize: 12,
    fontWeight: "500",
  },
  noResults: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: Spacing.lg,
  },
  noResultsSubText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});
