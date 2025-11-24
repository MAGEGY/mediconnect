import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Alert, Linking, Modal, TextInput } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { patientService } from '@/utils/data';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DoctorStackParamList } from '@/navigation/DoctorStackNavigator';

type NavigationProp = NativeStackNavigationProp<DoctorStackParamList>;

export default function ScanScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    
    const scannedId = data.startsWith('medrecord://patient/') 
      ? data.replace('medrecord://patient/', '') 
      : data;
    const patient = await patientService.getById(scannedId);
    
    if (patient) {
      Alert.alert(
        'Patient Found',
        `${patient.displayName}\nID: ${patient.id}`,
        [
          { 
            text: 'View Records', 
            onPress: () => {
              navigation.navigate('PatientDetail', { patientId: patient.id });
              setScanned(false);
            } 
          },
          { text: 'Scan Again', onPress: () => setScanned(false) },
        ]
      );
    } else {
      Alert.alert('Error', 'Patient not found', [
        { text: 'Try Again', onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleManualEntry = async (inputId: string) => {
    if (!inputId || !inputId.trim()) {
      Alert.alert('Error', 'Please enter a patient ID');
      setShowManualEntry(false);
      setInputValue('');
      setScanned(false);
      return;
    }

    const patient = await patientService.getById(inputId.trim());
    
    setShowManualEntry(false);
    setInputValue('');
    setScanned(false);
    
    if (patient) {
      navigation.navigate('PatientDetail', { patientId: patient.id });
    } else {
      Alert.alert('Error', 'Patient not found');
    }
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
          <MaterialCommunityIcons name="camera-off" size={64} color={theme.textSecondary} />
          <ThemedText style={[styles.permissionText, { color: theme.text }]}>
            Camera permission denied
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={requestPermission}
          >
            <ThemedText style={[styles.buttonText, { color: theme.buttonText }]}>
              Grant Permission
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
            barcodeTypes: ['qr'],
          }}
        />
        
        <View style={styles.overlay}>
          <View style={[styles.scanArea, { borderColor: theme.primary }]} />
          
          <View style={[styles.instructionBox, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="qrcode-scan" size={24} color={theme.primary} />
            <ThemedText style={[styles.instructionText, { color: theme.text }]}>
              {scanned ? 'Processing...' : 'Align QR code within frame'}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.bottomActions, { bottom: tabBarHeight + Spacing.xl }]}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={() => setScanned(false)}
          >
            <MaterialCommunityIcons name="refresh" size={24} color={theme.primary} />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Reset
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.surface }]}
            onPress={() => setShowManualEntry(true)}
          >
            <MaterialCommunityIcons name="keyboard" size={24} color={theme.primary} />
            <ThemedText style={[styles.actionText, { color: theme.primary }]}>
              Manual
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={showManualEntry}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowManualEntry(false);
          setInputValue('');
          setScanned(false);
        }}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => {
            setShowManualEntry(false);
            setInputValue('');
            setScanned(false);
          }}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <Card style={[styles.modalCard, { backgroundColor: theme.surface }]}>
              <ThemedText style={styles.modalTitle}>Enter Patient ID</ThemedText>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Patient ID or National ID"
                placeholderTextColor={theme.textSecondary}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
                  onPress={() => {
                    setShowManualEntry(false);
                    setInputValue('');
                    setScanned(false);
                  }}
                >
                  <ThemedText style={[styles.modalButtonText, { color: theme.text }]}>
                    Cancel
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: theme.primary }]}
                  onPress={() => handleManualEntry(inputValue)}
                >
                  <ThemedText style={[styles.modalButtonText, { color: theme.buttonText }]}>
                    Search
                  </ThemedText>
                </Pressable>
              </View>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionText: {
    fontSize: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  button: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing['3xl'],
    gap: Spacing.md,
  },
  instructionText: {
    fontSize: 14,
  },
  bottomActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  modalInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
