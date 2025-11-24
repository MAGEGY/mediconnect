import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable, Alert, TextInput } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { medicineService } from '@/utils/data';
import { Medicine } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MedicationsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [myMedications, setMyMedications] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      const allMedicines = await medicineService.getAll();
      setMedicines(allMedicines);
      setMyMedications(allMedicines.slice(0, 3));
    } catch (error) {
      console.error('Error loading medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    Alert.alert(
      'Add Medication',
      'Choose how to add your medication',
      [
        {
          text: 'Search Database',
          onPress: () => {
            Alert.alert('Search Database', 'Search medicine database feature coming soon');
          },
        },
        {
          text: 'Scan Prescription',
          onPress: () => {
            Alert.alert('OCR', 'OCR scanning feature coming soon');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderMedicationCard = ({ item }: { item: Medicine }) => (
    <Pressable
      style={[styles.medicationCard, { backgroundColor: theme.surface }]}
      android_ripple={{ color: theme.primary + '20' }}
    >
      <View style={[styles.medicationIcon, { backgroundColor: theme.primary + '20' }]}>
        <MaterialCommunityIcons name="pill" size={24} color={theme.primary} />
      </View>
      
      <View style={styles.medicationInfo}>
        <ThemedText style={[styles.medicationName, { color: theme.text }]}>
          {item.name}
        </ThemedText>
        <ThemedText style={[styles.medicationGeneric, { color: theme.textSecondary }]}>
          {item.genericName}
        </ThemedText>
        <View style={styles.medicationMeta}>
          <ThemedText style={[styles.medicationDosage, { color: theme.textSecondary }]}>
            {item.strength} • {item.dosageForm}
          </ThemedText>
        </View>
      </View>

      <Pressable
        style={styles.moreButton}
        onPress={() => Alert.alert(item.name, `${item.genericName}\n${item.strength}\n${item.manufacturer}`)}
      >
        <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.textSecondary} />
      </Pressable>
    </Pressable>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.surface }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search medications..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={myMedications}
        renderItem={renderMedicationCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing['5xl'] },
        ]}
        refreshing={loading}
        onRefresh={loadMedications}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="pill-off" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No medications yet
            </ThemedText>
            <Pressable
              style={[styles.addButton, { backgroundColor: theme.primary }]}
              onPress={addMedication}
            >
              <ThemedText style={[styles.addButtonText, { color: theme.buttonText }]}>
                ADD MEDICATION
              </ThemedText>
            </Pressable>
          </View>
        }
      />

      <Pressable
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: tabBarHeight + Spacing.xl,
          },
          Shadows.fab,
        ]}
        onPress={addMedication}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.buttonText} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    padding: Spacing.lg,
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  medicationGeneric: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  medicationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicationDosage: {
    fontSize: 12,
  },
  moreButton: {
    padding: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.xl,
    marginBottom: Spacing['2xl'],
  },
  addButton: {
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
