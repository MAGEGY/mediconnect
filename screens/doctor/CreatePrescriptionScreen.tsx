import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { DoctorStackParamList } from '@/navigation/DoctorStackNavigator';
import { prescriptionService } from '@/utils/data';
import { useAuth } from '@/contexts/AuthContext';

type Props = NativeStackScreenProps<DoctorStackParamList, 'CreatePrescription'>;

export default function CreatePrescriptionScreen({ route, navigation }: Props) {
  const { patientId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!medicineName.trim() || !dosage.trim() || !frequency.trim() || !duration.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a prescription');
      return;
    }

    try {
      await prescriptionService.create({
        patientId,
        doctorId: user.id,
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        duration: duration.trim(),
        notes: notes.trim(),
      });

      Alert.alert('Success', 'Prescription created successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create prescription');
    }
  };

  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} style={styles.headerButton}>
          <ThemedText style={[styles.headerButtonText, { color: theme.text }]}>
            Cancel
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={handleSubmit} style={styles.headerButton}>
          <ThemedText style={[styles.headerButtonText, { color: theme.primary }]}>
            Save
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, theme, medicineName, dosage, frequency, duration, notes]);

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <Card>
          <ThemedText style={styles.sectionTitle}>Medicine Information</ThemedText>
          
          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Medicine Name *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={medicineName}
              onChangeText={setMedicineName}
              placeholder="Enter medicine name"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Dosage *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={dosage}
              onChangeText={setDosage}
              placeholder="e.g., 500mg"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Frequency *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={frequency}
              onChangeText={setFrequency}
              placeholder="e.g., Twice daily"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Duration *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 7 days"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Notes (Optional)
            </ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional instructions or notes"
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </Card>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  headerButton: {
    paddingHorizontal: Spacing.md,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
  },
});
