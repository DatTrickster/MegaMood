import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  addPlannerItem,
  deletePlannerItem,
  formatDateKey,
  getPlannerItemsForDate,
  type PlannerItem,
  type PlannerItemType,
} from '../services/plannerStorage';
import AddPlannerModal, { type AddPlannerFormValues } from './AddPlannerModal';

const TYPE_LABELS: Record<PlannerItemType, string> = {
  meal: 'Meal',
  workout: 'Workout',
  mindbody: 'Mind & Body',
};

const TYPE_ACCENT: Record<PlannerItemType, { light: string; dark: string }> = {
  meal: { light: '#e07c2e', dark: '#f0a050' },
  workout: { light: '#2e7d32', dark: '#66bb6a' },
  mindbody: { light: '#1565c0', dark: '#64b5f6' },
};

type Props = {
  selectedDate: Date;
  onDateChange: (d: Date) => void;
  onItemsChange?: () => void;
};

export default function PlannerSection({
  selectedDate,
  onDateChange,
  onItemsChange,
}: Props) {
  const { isDark } = useTheme();
  const [items, setItems] = useState<PlannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<PlannerItemType>('meal');

  const dateStr = formatDateKey(selectedDate);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getPlannerItemsForDate(dateStr);
    setItems(list);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddSubmit = async (values: AddPlannerFormValues) => {
    await addPlannerItem({
      type: values.type,
      date: formatDateKey(values.date),
      content: values.content,
    });
    load();
    onItemsChange?.();
  };

  const handleDelete = (item: PlannerItem) => {
    Alert.alert('Remove', `Remove "${item.content.slice(0, 40)}${item.content.length > 40 ? '…' : ''}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await deletePlannerItem(item.id);
          load();
          onItemsChange?.();
        },
      },
    ]);
  };

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d);
  };

  const goToday = () => {
    onDateChange(new Date());
  };

  const todayKey = formatDateKey(new Date());
  const isToday = dateStr === todayKey;

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const textPrimary = isDark ? colors.onSurfaceDark : colors.onSurface;
  const textSecondary = isDark ? colors.outlineDark : '#666';

  const byType = {
    meal: items.filter((i) => i.type === 'meal'),
    workout: items.filter((i) => i.type === 'workout'),
    mindbody: items.filter((i) => i.type === 'mindbody'),
  };

  const openAdd = (type: PlannerItemType) => {
    setAddType(type);
    setShowAddModal(true);
  };

  const renderItem = ({ item }: { item: PlannerItem }) => {
    const accent = TYPE_ACCENT[item.type];
    const accentColor = isDark ? accent.dark : accent.light;
    return (
      <View style={[styles.itemRow, { backgroundColor: cardBg, borderLeftColor: accentColor }]}>
        <View style={styles.itemContent}>
          <Text style={[styles.itemPill, { color: accentColor }]}>{TYPE_LABELS[item.type]}</Text>
          <Text style={[styles.itemContentText, { color: textPrimary }]} numberOfLines={3}>
            {item.content}
          </Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item)}
          style={({ pressed }) => [styles.removeBtn, pressed && styles.removeBtnPressed]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.removeBtnText, { color: textSecondary }]}>Remove</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
        Planner
      </Text>

      <View style={styles.dateRow}>
        <Pressable onPress={prevDay} style={styles.arrowBtn}>
          <Text style={[styles.arrow, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Pressable onPress={goToday} style={[styles.dateBtn, isToday && styles.dateBtnToday]}>
          <Text style={[styles.dateBtnText, { color: textPrimary }]}>
            {selectedDate.toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
          {isToday && <Text style={styles.todayLabel}>Today</Text>}
        </Pressable>
        <Pressable onPress={nextDay} style={styles.arrowBtn}>
          <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
        </Pressable>
      </View>

      <AddPlannerModal
        visible={showAddModal}
        initialDate={selectedDate}
        initialType={addType}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />

      {loading ? (
        <Text style={[styles.emptyText, { color: textSecondary }]}>Loading…</Text>
      ) : (
        <>
          {(['meal', 'workout', 'mindbody'] as const).map((type) => {
            const list = byType[type];
            return (
              <View key={type} style={styles.subSection}>
                <View style={styles.subHeader}>
                  <Text style={[styles.subTitle, { color: textPrimary }]}>
                    {TYPE_LABELS[type]}
                  </Text>
                  <Pressable
                    onPress={() => openAdd(type)}
                    style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
                  >
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </Pressable>
                </View>
                {list.length === 0 ? (
                  <Text style={[styles.emptySub, { color: textSecondary }]}>
                    None yet. Tap + Add or ask Gaia to add one.
                  </Text>
                ) : (
                  <FlatList
                    data={list}
                    keyExtractor={(i) => i.id}
                    renderItem={renderItem}
                    scrollEnabled={false}
                    style={styles.list}
                  />
                )}
              </View>
            );
          })}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  arrowBtn: {
    padding: spacing.sm,
  },
  arrow: {
    fontSize: 28,
    fontWeight: '600',
  },
  dateBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  dateBtnToday: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(232, 93, 0, 0.08)',
  },
  dateBtnText: {
    ...typography.bodyLarge,
  },
  todayLabel: {
    ...typography.labelLarge,
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    textAlign: 'center',
  },
  subSection: {
    marginBottom: spacing.lg,
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  subTitle: {
    ...typography.labelLarge,
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addBtnPressed: {
    opacity: 0.7,
  },
  addBtnText: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  list: {
    flexGrow: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 4,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  itemContent: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemPill: {
    ...typography.labelLarge,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  itemContentText: {
    ...typography.bodyLarge,
    fontSize: 15,
    lineHeight: 22,
  },
  removeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  removeBtnPressed: {
    opacity: 0.7,
  },
  removeBtnText: {
    ...typography.labelLarge,
    fontSize: 13,
  },
  emptyText: {
    ...typography.bodyMedium,
    paddingVertical: spacing.md,
  },
  emptySub: {
    ...typography.bodyMedium,
    fontSize: 13,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
});
