import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { Card } from '@/components/Card';
import { TextInputModal } from '@/components/TextInputModal';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius } from '@/constants/theme';
import { DoctorStackParamList } from '@/navigation/DoctorStackNavigator';
import { Medicine, User, PatientAllergy, PrescriptionMedicine } from '@/types';
import { medicineService, patientService, allergyService, prescriptionService } from '@/utils/data';
import { checkDrugInteractions, DrugInteraction } from '@/services/fdaService';
import { getGenericName, normalizeForComparison, getAllVariants } from '@/utils/medicineNormalization';

type Props = NativeStackScreenProps<DoctorStackParamList, 'CreatePrescription'>;

interface SelectedMedicine extends PrescriptionMedicine {
  warnings: string[];
  overrideJustification?: string;
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
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [pendingMedicine, setPendingMedicine] = useState<{ medicine: Medicine; warnings: string[] } | null>(null);

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
    const medicineGeneric = getGenericName(medicine.name);
    const medicineVariants = getAllVariants(medicine.name);

    allergies.forEach(allergy => {
      const allergenGeneric = getGenericName(allergy.allergen);
      const allergenVariants = getAllVariants(allergy.allergen);
      
      const isMatch = 
        normalizeForComparison(medicine.name, allergy.allergen) ||
        normalizeForComparison(medicine.genericName, allergy.allergen) ||
        normalizeForComparison(medicine.name, allergenGeneric) ||
        medicineVariants.some(variant => 
          allergenVariants.some(allergenVariant => 
            normalizeForComparison(variant, allergenVariant)
          )
        );
      
      if (isMatch) {
        warningSet.add(`ALLERGY ALERT: Patient has ${allergy.severity} allergy to ${allergy.allergen} (matches ${medicine.name})`);
      }
    });

    for (const selected of selectedMedicines) {
      const fdaInteractions = await checkDrugInteractions(medicine.name, selected.medicineName);
      
      fdaInteractions.forEach((interaction: DrugInteraction) => {
        const severityLabel = interaction.severity === 'high' ? '[HIGH SEVERITY]' : 
                              interaction.severity === 'moderate' ? '[MODERATE]' : '[LOW]';
        warningSet.add(`${severityLabel} ${interaction.description.substring(0, 200)}`);
      });

      const isRelated = normalizeForComparison(medicine.name, selected.medicineName);
      if (isRelated) {
        warningSet.add(`DUPLICATE: ${medicine.name} and ${selected.medicineName} are the same medicine (different brands)`);
      }

      const selectedMedicine = await medicineService.getById(selected.medicineId);
      if (medicine.interactions) {
        medicine.interactions.forEach(interaction => {
          const selectedGeneric = getGenericName(selected.medicineName);
          const selectedVariants = getAllVariants(selected.medicineName);
          
          const interactionLower = interaction.toLowerCase().trim();
          const matchesInteraction = 
            selectedVariants.some(variant => 
              variant.toLowerCase().includes(interactionLower) || 
              interactionLower.includes(variant.toLowerCase())
            );
          
          if (matchesInteraction) {
            warningSet.add(`LOCAL DATA: ${medicine.name} may interact with ${selected.medicineName}`);
          }
        });
      }
      
      if (selectedMedicine && selectedMedicine.interactions) {
        const medicineVariantsLower = medicineVariants.map(v => v.toLowerCase());
        selectedMedicine.interactions.forEach(interaction => {
          const interactionLower = interaction.toLowerCase().trim();
          const matchesInteraction = medicineVariantsLower.some(variant =>
            variant.includes(interactionLower) || interactionLower.includes(variant)
          );
          
          if (matchesInteraction) {
            warningSet.add(`LOCAL DATA: ${selected.medicineName} may interact with ${medicine.name}`);
          }
        });
      }
    }

    return Array.from(warningSet);
  };

  const handleAddMedicine = async (medicine: Medicine) => {
    setCheckingInteractions(true);
    const warnings = await checkInteractions(medicine);
    setCheckingInteractions(false);
    
    if (warnings.length > 0) {
      Alert.alert(
        'Safety Warnings Detected',
        warnings.join('\n\n') + '\n\nDo you want to override these warnings?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Override & Continue',
            style: 'destructive',
            onPress: () => promptForJustification(medicine, warnings),
          },
        ]
      );
    } else {
      addMedicineToList(medicine, warnings);
    }
  };

  const promptForJustification = (medicine: Medicine, warnings: string[]) => {
    setPendingMedicine({ medicine, warnings });
    setShowJustificationModal(true);
  };

  const handleJustificationSubmit = (justification: string) => {
    if (pendingMedicine) {
      addMedicineToList(pendingMedicine.medicine, pendingMedicine.warnings, justification);
    }
    setShowJustificationModal(false);
    setPendingMedicine(null);
  };

  const handleJustificationCancel = () => {
    setShowJustificationModal(false);
    setPendingMedicine(null);
  };

  const addMedicineToList = (medicine: Medicine, warnings: string[], justification?: string) => {
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
        overrideJustification: justification,
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

  const handleSaveEdit = async () => {
    if (editingIndex !== null) {
      const editedMedicine = selectedMedicines[editingIndex];
      const medicine = await medicineService.getById(editedMedicine.medicineId);
      
      if (medicine) {
        setCheckingInteractions(true);
        const updatedWarnings = await checkInteractions(medicine);
        setCheckingInteractions(false);
        
        const newWarnings = updatedWarnings.filter(w => !editedMedicine.warnings.includes(w));
        
        if (newWarnings.length > 0 && !editedMedicine.overrideJustification) {
          Alert.alert(
            'New Warnings Detected',
            newWarnings.join('\n\n') + '\n\nDo you want to continue?',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Continue',
                onPress: () => {
                  const updated = [...selectedMedicines];
                  updated[editingIndex] = {
                    ...updated[editingIndex],
                    dosage: tempDosage,
                    frequency: tempFrequency,
                    duration: tempDuration,
                    quantity: parseInt(tempQuantity) || 0,
                    warnings: updatedWarnings,
                  };
                  setSelectedMedicines(updated);
                  setEditingIndex(null);
                  clearTempFields();
                },
              },
            ]
          );
          return;
        }
      }
      
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
      clearTempFields();
    }
  };

  const clearTempFields = () => {
    setTempDosage('');
    setTempFrequency('');
    setTempDuration('');
    setTempQuantity('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    clearTempFields();
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

    setCheckingInteractions(true);
    const allWarnings: string[] = [];
    for (const selectedMed of selectedMedicines) {
      const medicine = await medicineService.getById(selectedMed.medicineId);
      if (medicine) {
        const warnings = await checkInteractions(medicine);
        if (warnings.length > 0) {
          allWarnings.push(`${selectedMed.medicineName}:\n${warnings.join('\n')}`);
        }
      }
    }
    setCheckingInteractions(false);

    if (allWarnings.length > 0) {
      const hasUnoverriddenWarnings = selectedMedicines.some(med => 
        med.warnings.length > 0 && !med.overrideJustification
      );
      
      if (hasUnoverriddenWarnings) {
        Alert.alert(
          'Final Safety Check',
          'This prescription has the following warnings:\n\n' + allWarnings.join('\n\n') + '\n\nAll warnings must be reviewed and justified.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Final Safety Confirmation',
        'This prescription has warnings that have been reviewed and justified. Proceed with creation?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create Prescription',
            onPress: submitPrescription,
          },
        ]
      );
    } else {
      submitPrescription();
    }
  };

  const submitPrescription = async () => {
    if (!patient || !user) return;

    try {
      await prescriptionService.create({
        patientId: patient.id,
        patientName: patient.displayName,
        doctorId: user.id,
        doctorName: user.displayName,
        medicines: selectedMedicines.map(({ warnings, overrideJustification, ...med }) => ({
          ...med,
          notes: overrideJustification ? `Override: ${overrideJustification}` : undefined,
        })),
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
        {checkingInteractions ? (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.primary + '20' }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.primary }]}>
              Checking drug interactions with FDA database...
            </ThemedText>
          </View>
        ) : null}

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

                {medicine.overrideJustification ? (
                  <View
                    style={[styles.justificationBanner, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                  >
                    <MaterialCommunityIcons name="shield-check" size={16} color={theme.primary} />
                    <ThemedText style={[styles.justificationText, { color: theme.primary }]}>
                      Override Justification: {medicine.overrideJustification}
                    </ThemedText>
                  </View>
                ) : null}

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

        <TextInputModal
          visible={showJustificationModal}
          title="Override Justification Required"
          message="Please provide a clinical justification for overriding these safety warnings:"
          placeholder="Enter clinical justification (minimum 10 characters)..."
          minLength={10}
          onSubmit={handleJustificationSubmit}
          onCancel={handleJustificationCancel}
        />
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
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  justificationBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  justificationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
});
