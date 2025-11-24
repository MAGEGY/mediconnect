import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { dispensingService } from '@/utils/data';
import { DispensingRecord } from '@/types';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const [records, setRecords] = useState<DispensingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await dispensingService.getAll();
      setRecords(data.sort((a, b) => 
        new Date(b.dispensedAt).getTime() - new Date(a.dispensedAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryCard = ({ item }: { item: DispensingRecord }) => (
    <View style={[styles.historyCard, { backgroundColor: theme.surface }]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <ThemedText style={[styles.prescriptionId, { color: theme.primary }]}>
            {item.prescriptionId}
          </ThemedText>
          <ThemedText style={[styles.patientName, { color: theme.text }]}>
            {item.patientName}
          </ThemedText>
          <ThemedText style={[styles.dispensedDate, { color: theme.textSecondary }]}>
            {formatDate(item.dispensedAt)}
          </ThemedText>
        </View>
        
        {item.partial && (
          <View style={[styles.partialBadge, { backgroundColor: theme.warning + '20' }]}>
            <MaterialCommunityIcons name="clock-outline" size={16} color={theme.warning} />
            <ThemedText style={[styles.partialText, { color: theme.warning }]}>
              Partial
            </ThemedText>
          </View>
        )}
      </View>

      <View style={styles.medicinesList}>
        <ThemedText style={[styles.medicinesTitle, { color: theme.textSecondary }]}>
          Dispensed Medicines:
        </ThemedText>
        {item.dispensedMedicines.map((med, index) => (
          <View key={index} style={styles.medicineItem}>
            <MaterialCommunityIcons name="pill" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.medicineName, { color: theme.text }]}>
              {med.medicineName}
            </ThemedText>
            <ThemedText style={[styles.medicineQuantity, { color: theme.textSecondary }]}>
              {med.quantityDispensed}/{med.quantityPrescribed}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={records}
        renderItem={renderHistoryCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshing={loading}
        onRefresh={loadHistory}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="history" size={64} color={theme.textSecondary} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              No dispensing history yet
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  historyCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  prescriptionId: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  dispensedDate: {
    fontSize: 12,
  },
  partialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  partialText: {
    fontSize: 12,
    fontWeight: '500',
  },
  medicinesList: {
    gap: Spacing.sm,
  },
  medicinesTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  medicineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  medicineName: {
    flex: 1,
    fontSize: 14,
  },
  medicineQuantity: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['5xl'],
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.xl,
  },
});
