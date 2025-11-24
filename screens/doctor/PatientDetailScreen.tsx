import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ScreenScrollView } from '@/components/ScreenScrollView';
import { Card } from '@/components/Card';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { DoctorStackParamList } from '@/navigation/DoctorStackNavigator';
import { User, Prescription, VitalSign, PatientAllergy } from '@/types';
import { patientService, prescriptionService, vitalSignsService, allergyService } from '@/utils/data';

type Props = NativeStackScreenProps<DoctorStackParamList, 'PatientDetail'>;

export default function PatientDetailScreen({ route, navigation }: Props) {
  const { patientId } = route.params;
  const { theme } = useTheme();
  const [patient, setPatient] = useState<User | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'prescriptions' | 'allergies'>('overview');

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('CreatePrescription', { patientId })}
          style={styles.headerButton}
        >
          <ThemedText style={[styles.headerButtonText, { color: theme.primary }]}>
            New Prescription
          </ThemedText>
        </Pressable>
      ),
    });
  }, [navigation, patientId, theme]);

  const loadPatientData = async () => {
    const patientData = await patientService.getById(patientId);
    setPatient(patientData);

    const patientPrescriptions = await prescriptionService.getByPatientId(patientId);
    setPrescriptions(patientPrescriptions);

    const patientVitals = await vitalSignsService.getByPatientId(patientId);
    setVitals(patientVitals);

    const patientAllergies = await allergyService.getByPatientId(patientId);
    setAllergies(patientAllergies);
  };

  if (!patient) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Loading patient data...</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Card>
              <ThemedText style={styles.sectionTitle}>Patient Information</ThemedText>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>Name:</ThemedText>
                <ThemedText style={styles.infoValue}>{patient.displayName}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>National ID:</ThemedText>
                <ThemedText style={styles.infoValue}>{patient.nationalId}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={[styles.infoLabel, { color: theme.textSecondary }]}>Phone:</ThemedText>
                <ThemedText style={styles.infoValue}>{patient.phoneNumber}</ThemedText>
              </View>
            </Card>

            {allergies.length > 0 ? (
              <Card style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Allergies</ThemedText>
                <View style={styles.allergyContainer}>
                  {allergies.map((allergy) => (
                    <View
                      key={allergy.id}
                      style={[styles.allergyBadge, { backgroundColor: theme.error + '20', borderColor: theme.error }]}
                    >
                      <MaterialCommunityIcons name="alert" size={16} color={theme.error} />
                      <ThemedText style={[styles.allergyText, { color: theme.error }]}>
                        {allergy.allergen}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </Card>
            ) : null}

            <Card style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                {prescriptions.length} prescriptions
              </ThemedText>
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                {vitals.length} vital sign readings
              </ThemedText>
            </Card>
          </View>
        );

      case 'vitals':
        return (
          <View style={styles.tabContent}>
            {vitals.length > 0 ? (
              vitals.map((vital) => (
                <Card key={vital.id} style={styles.section}>
                  <View style={styles.vitalHeader}>
                    <ThemedText style={styles.vitalDate}>
                      {new Date(vital.recordedAt).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={styles.vitalGrid}>
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="heart-pulse" size={24} color={theme.primary} />
                      <ThemedText style={[styles.vitalLabel, { color: theme.textSecondary }]}>BP</ThemedText>
                      <ThemedText style={styles.vitalValue}>
                        {vital.bloodPressure || 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="speedometer" size={24} color={theme.primary} />
                      <ThemedText style={[styles.vitalLabel, { color: theme.textSecondary }]}>HR</ThemedText>
                      <ThemedText style={styles.vitalValue}>
                        {vital.heartRate ? `${vital.heartRate} bpm` : 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="thermometer" size={24} color={theme.primary} />
                      <ThemedText style={[styles.vitalLabel, { color: theme.textSecondary }]}>Temp</ThemedText>
                      <ThemedText style={styles.vitalValue}>
                        {vital.temperature ? `${vital.temperature}°C` : 'N/A'}
                      </ThemedText>
                    </View>
                    <View style={styles.vitalItem}>
                      <MaterialCommunityIcons name="weight" size={24} color={theme.primary} />
                      <ThemedText style={[styles.vitalLabel, { color: theme.textSecondary }]}>Weight</ThemedText>
                      <ThemedText style={styles.vitalValue}>
                        {vital.weight ? `${vital.weight} kg` : 'N/A'}
                      </ThemedText>
                    </View>
                  </View>
                </Card>
              ))
            ) : (
              <Card>
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No vital signs recorded
                </ThemedText>
              </Card>
            )}
          </View>
        );

      case 'prescriptions':
        return (
          <View style={styles.tabContent}>
            {prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <Card key={prescription.id} style={styles.section}>
                  <View style={styles.prescriptionHeader}>
                    <ThemedText style={styles.medicineName}>{prescription.medicineName}</ThemedText>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: prescription.status === 'dispensed' ? theme.success + '20' : theme.warning + '20' }
                    ]}>
                      <ThemedText style={[
                        styles.statusText,
                        { color: prescription.status === 'dispensed' ? theme.success : theme.warning }
                      ]}>
                        {prescription.status}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={[styles.dosage, { color: theme.textSecondary }]}>
                    {prescription.dosage} - {prescription.frequency}
                  </ThemedText>
                  <ThemedText style={[styles.prescriptionDate, { color: theme.textSecondary }]}>
                    {new Date(prescription.prescribedAt).toLocaleDateString()}
                  </ThemedText>
                  {prescription.notes ? (
                    <ThemedText style={[styles.notes, { color: theme.textSecondary }]}>
                      Note: {prescription.notes}
                    </ThemedText>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card>
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No prescriptions found
                </ThemedText>
              </Card>
            )}
          </View>
        );

      case 'allergies':
        return (
          <View style={styles.tabContent}>
            {allergies.length > 0 ? (
              allergies.map((allergy) => (
                <Card key={allergy.id} style={styles.section}>
                  <View style={styles.allergyHeader}>
                    <MaterialCommunityIcons name="alert-circle" size={24} color={theme.error} />
                    <ThemedText style={styles.allergenName}>{allergy.allergen}</ThemedText>
                  </View>
                  <ThemedText style={[styles.severity, { color: theme.textSecondary }]}>
                    Severity: {allergy.severity}
                  </ThemedText>
                  {allergy.reaction ? (
                    <ThemedText style={[styles.reaction, { color: theme.textSecondary }]}>
                      Reaction: {allergy.reaction}
                    </ThemedText>
                  ) : null}
                </Card>
              ))
            ) : (
              <Card>
                <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No known allergies
                </ThemedText>
              </Card>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.tabBar}>
        {(['overview', 'vitals', 'prescriptions', 'allergies'] as const).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === tab ? theme.primary : theme.textSecondary },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScreenScrollView>
        <View style={styles.tabContentWrapper}>
          {renderTabContent()}
        </View>
      </ScreenScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    paddingHorizontal: Spacing.md,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabContentWrapper: {
    padding: Spacing.lg,
  },
  tabContent: {
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  allergyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  allergyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  allergyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  vitalHeader: {
    marginBottom: Spacing.md,
  },
  vitalDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  vitalItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  vitalLabel: {
    fontSize: 12,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  dosage: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  prescriptionDate: {
    fontSize: 12,
  },
  notes: {
    fontSize: 12,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
  allergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  allergenName: {
    fontSize: 16,
    fontWeight: '600',
  },
  severity: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  reaction: {
    fontSize: 14,
  },
});
