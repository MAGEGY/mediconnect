import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/theme';
import { DoctorStackParamList } from '@/navigation/DoctorStackNavigator';
import { Medicine, User, PatientAllergy, PrescriptionMedicine } from '@/types';
import { medicineService, patientService, allergyService, prescriptionService } from '@/utils/data';

type Props = NativeStackScreenProps<DoctorStackParamList, 'CreatePrescription'>;

interface SelectedMedicine extends PrescriptionMedicine {
  warnings: string[];
}

export default function CreatePrescriptionScreen({ route, navigation }: Props) {
  const { patientId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const [patient, setPatient] = useState<User | null>(null);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Medicine[]>([]);
  const [selectedMedicines, setSelectedMedicines] = useState<SelectedMedicine[]>([]);
  const [notes, setNotes] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempDosage, setTempDosage] = useState('');
  const [tempFrequency, setTempFrequency] = useState('');
  const [tempDuration, setTempDuration] = useState('');
  const [tempQuantity, setTempQuantity] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    const patientData = await patientService.getById(patientId);
    setPatient(patientData);

    const patientAllergies = await allergyService.getByPatientId(patientId);
    setAllergies(patientAllergies);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = await medicineService.search(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const checkInteractions = async (medicine: Medicine): Promise<string[]> => {
    const warningSet = new Set<string>();

    allergies.forEach(allergy => {
      const allergenLower = allergy.allergen.toLowerCase().trim();
      const medNameLower = medicine.name.toLowerCase().trim();
      const medGenericLower = medicine.genericName.toLowerCase().trim();
      
      if (
        medNameLower.includes(allergenLower) ||
        medGenericLower.includes(allergenLower) ||
        allergenLower.includes(medNameLower) ||
        allergenLower.includes(medGenericLower)
      ) {
        warningSet.add(`ALLERGY WARNING: Patient is ${allergy.severity} allergic to ${allergy.allergen}`);
      }
    });

    for (const selected of selectedMedicines) {
      const selectedMedicine = await medicineService.getById(selected.medicineId);
      
      if (medicine.interactions) {
        medicine.interactions.forEach(interaction => {
          const interactionLower = interaction.toLowerCase().trim();
          const selectedNameLower = selected.medicineName.toLowerCase().trim();
          const selectedGenericLower = selectedMedicine?.genericName.toLowerCase().trim() || '';
          
          if (
            selectedNameLower.includes(interactionLower) ||
            interactionLower.includes(selectedNameLower) ||
            (selectedGenericLower && (selectedGenericLower.includes(interactionLower) || interactionLower.includes(selectedGenericLower)))
          ) {
            warningSet.add(`Drug interaction: ${medicine.name} may interact with ${selected.medicineName}`);
          }
        });
      }
      
      if (selectedMedicine && selectedMedicine.interactions) {
        selectedMedicine.interactions.forEach(interaction => {
          const interactionLower = interaction.toLowerCase().trim();
          const medNameLower = medicine.name.toLowerCase().trim();
          const medGenericLower = medicine.genericName.toLowerCase().trim();
          
          if (
            medNameLower.includes(interactionLower) ||
            medGenericLower.includes(interactionLower) ||
            interactionLower.includes(medNameLower) ||
            interactionLower.includes(medGenericLower)
          ) {
            warningSet.add(`Drug interaction: ${selected.medicineName} may interact with ${medicine.name}`);
          }
        });
      }
    }

    return Array.from(warningSet);
  };

  const handleAddMedicine = async (medicine: Medicine) => {
    const warnings = await checkInteractions(medicine);
    
    if (warnings.length > 0) {
      Alert.alert(
        'Warnings Detected',
        warnings.join('\n\n'),
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Add Anyway',
            style: 'destructive',
            onPress: () => addMedicineToList(medicine, warnings),
          },
        ]
      );
    } else {
      addMedicineToList(medicine, warnings);
    }
  };

  const addMedicineToList = (medicine: Medicine, warnings: string[]) => {
    setSelectedMedicines([
      ...selectedMedicines,
      {
        medicineId: medicine.id,
        medicineName: medicine.name,
        dosage: '',
        frequency: '',
        duration: '',
        quantity: 0,
        warnings,
      },
    ]);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
  };

  const handleRemoveMedicine = (index: number) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handleEditMedicine = (index: number) => {
    const medicine = selectedMedicines[index];
    setEditingIndex(index);
    setTempDosage(medicine.dosage);
    setTempFrequency(medicine.frequency);
    setTempDuration(medicine.duration);
    setTempQuantity(medicine.quantity.toString());
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null) {
      const updated = [...selectedMedicines];
      updated[editingIndex] = {
        ...updated[editingIndex],
        dosage: tempDosage,
        frequency: tempFrequency,
        duration: tempDuration,
        quantity: parseInt(tempQuantity) || 0,
      };
      setSelectedMedicines(updated);
      setEditingIndex(null);
      setTempDosage('');
      setTempFrequency('');
      setTempDuration('');
      setTempQuantity('');
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempDosage('');
    setTempFrequency('');
    setTempDuration('');
    setTempQuantity('');
  };

  const validateAndSubmit = async () => {
    if (!patient || !user) return;

    if (selectedMedicines.length === 0) {
      Alert.alert('Error', 'Please add at least one medicine');
      return;
    }

    for (const med of selectedMedicines) {
      if (!med.dosage || !med.frequency || !med.duration || med.quantity === 0) {
        Alert.alert('Error', `Please complete all fields for ${med.medicineName}`);
        return;
      }
    }

    try {
      await prescriptionService.create({
        patientId: patient.id,
        patientName: patient.displayName,
        doctorId: user.id,
        doctorName: user.displayName,
        medicines: selectedMedicines.map(({ warnings, ...med }) => med),
        notes: notes.trim(),
      });

      Alert.alert('Success', 'Prescription created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to create prescription');
    }
  };

  if (!patient) {
    return (
      <ScreenKeyboardAwareScrollView>
        <ThemedView>
          <ThemedText>Loading patient data...</ThemedText>
        </ThemedView>
      </ScreenKeyboardAwareScrollView>
    );
  }

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView>
        <Card>
            <ThemedText style={styles.sectionTitle}>Patient Information</ThemedText>
            <ThemedText style={styles.patientName}>{patient.displayName}</ThemedText>
            <ThemedText style={[styles.patientId, { color: theme.textSecondary }]}>
              ID: {patient.id}
            </ThemedText>

            {allergies.length > 0 ? (
              <View style={styles.allergySection}>
                <ThemedText style={[styles.allergyTitle, { color: theme.error }]}>
                  Known Allergies:
                </ThemedText>
                {allergies.map(allergy => (
                  <View
                    key={allergy.id}
                    style={[styles.allergyBadge, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
                  >
                    <MaterialCommunityIcons name="alert" size={14} color={theme.error} />
                    <ThemedText style={[styles.allergyText, { color: theme.error }]}>
                      {allergy.allergen} ({allergy.severity})
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>

          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Medicines</ThemedText>
              <Pressable
                onPress={() => setShowSearch(!showSearch)}
                style={[styles.addButton, { backgroundColor: theme.primary }]}
              >
                <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                <ThemedText style={styles.addButtonText}>Add Medicine</ThemedText>
              </Pressable>
            </View>

            {showSearch ? (
              <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <MaterialCommunityIcons name="magnify" size={20} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.searchInput, { color: theme.text }]}
                    placeholder="Search medicines..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearch}
                    autoFocus
                  />
                </View>

                {searchResults.length > 0 ? (
                  <ScrollView style={styles.searchResults} nestedScrollEnabled>
                    {searchResults.map(medicine => (
                      <Pressable
                        key={medicine.id}
                        style={[styles.searchResultItem, { borderBottomColor: theme.border }]}
                        onPress={() => handleAddMedicine(medicine)}
                      >
                        <View style={styles.medicineInfo}>
                          <ThemedText style={styles.medicineName}>{medicine.name}</ThemedText>
                          <ThemedText style={[styles.genericName, { color: theme.textSecondary }]}>
                            {medicine.genericName} - {medicine.strength}
                          </ThemedText>
                        </View>
                        <MaterialCommunityIcons name="plus-circle" size={24} color={theme.primary} />
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : null}
              </View>
            ) : null}

            {selectedMedicines.map((medicine, index) => (
              <View
                key={index}
                style={[styles.selectedMedicine, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              >
                <View style={styles.medicineHeader}>
                  <View style={styles.medicineHeaderLeft}>
                    <ThemedText style={styles.medicineName}>{medicine.medicineName}</ThemedText>
                    {medicine.warnings.length > 0 ? (
                      <MaterialCommunityIcons name="alert-circle" size={20} color={theme.error} />
                    ) : null}
                  </View>
                  <Pressable onPress={() => handleRemoveMedicine(index)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={theme.error} />
                  </Pressable>
                </View>

                {medicine.warnings.map((warning, wIndex) => (
                  <View
                    key={wIndex}
                    style={[styles.warningBanner, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
                  >
                    <MaterialCommunityIcons name="alert" size={16} color={theme.error} />
                    <ThemedText style={[styles.warningText, { color: theme.error }]}>{warning}</ThemedText>
                  </View>
                ))}

                {editingIndex === index ? (
                  <View style={styles.editForm}>
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="Dosage (e.g., 500mg)"
                      placeholderTextColor={theme.textSecondary}
                      value={tempDosage}
                      onChangeText={setTempDosage}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="Frequency (e.g., Twice daily)"
                      placeholderTextColor={theme.textSecondary}
                      value={tempFrequency}
                      onChangeText={setTempFrequency}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="Duration (e.g., 7 days)"
                      placeholderTextColor={theme.textSecondary}
                      value={tempDuration}
                      onChangeText={setTempDuration}
                    />
                    <TextInput
                      style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="Quantity"
                      placeholderTextColor={theme.textSecondary}
                      value={tempQuantity}
                      onChangeText={setTempQuantity}
                      keyboardType="numeric"
                    />
                    <View style={styles.editActions}>
                      <Pressable
                        onPress={handleCancelEdit}
                        style={[styles.editButton, { backgroundColor: theme.border }]}
                      >
                        <ThemedText style={styles.editButtonText}>Cancel</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={handleSaveEdit}
                        style={[styles.editButton, { backgroundColor: theme.primary }]}
                      >
                        <ThemedText style={styles.editButtonTextPrimary}>Save</ThemedText>
                      </Pressable>
                    </View>
                  </View>
                ) : medicine.dosage ? (
                  <View style={styles.medicineDetails}>
                    <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                      Dosage: {medicine.dosage}
                    </ThemedText>
                    <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                      Frequency: {medicine.frequency}
                    </ThemedText>
                    <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                      Duration: {medicine.duration}
                    </ThemedText>
                    <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
                      Quantity: {medicine.quantity}
                    </ThemedText>
                    <Pressable onPress={() => handleEditMedicine(index)}>
                      <ThemedText style={[styles.editLink, { color: theme.primary }]}>Edit details</ThemedText>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => handleEditMedicine(index)}
                    style={[styles.completeButton, { backgroundColor: theme.warning + '20', borderColor: theme.warning }]}
                  >
                    <ThemedText style={[styles.completeButtonText, { color: theme.warning }]}>
                      Complete prescription details
                    </ThemedText>
                  </Pressable>
                )}
              </View>
            ))}
          </Card>

          <Card style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notes</ThemedText>
            <TextInput
              style={[styles.notesInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="Additional instructions or notes..."
              placeholderTextColor={theme.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </Card>

          <Pressable
            onPress={validateAndSubmit}
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.submitButtonText}>Create Prescription</ThemedText>
          </Pressable>
        </ThemedView>
      </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  patientId: {
    fontSize: 14,
  },
  allergySection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  allergyTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    alignSelf: 'flex-start',
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  searchContainer: {
    marginBottom: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchResults: {
    maxHeight: 200,
    marginTop: Spacing.sm,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '500',
  },
  genericName: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  selectedMedicine: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  medicineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  medicineDetails: {
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: 14,
  },
  editLink: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: Spacing.sm,
  },
  completeButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editForm: {
    gap: Spacing.sm,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  editActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  editButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  editButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  notesInput: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 100,
  },
  submitButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
