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
import { colors, spacing, typography, borderRadius, cardShadow } from '../constants/theme';
import {
  addEventOrNote,
  deleteEventOrNote,
  formatDateKey,
  getEventsAndNotesForDate,
  type EventOrNote,
} from '../services/eventsNotesStorage';
import AddEventNoteModal, { type AddEventNoteFormValues } from './AddEventNoteModal';

type Props = {
  selectedDate: Date;
  onItemsChange?: () => void;
};

export default function EventsNotesSection({ selectedDate, onItemsChange }: Props) {
  const { isDark } = useTheme();
  const [items, setItems] = useState<EventOrNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const dateStr = formatDateKey(selectedDate);

  const load = useCallback(async () => {
    setLoading(true);
    const list = await getEventsAndNotesForDate(dateStr);
    setItems(list);
    setLoading(false);
  }, [dateStr]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddSubmit = async (values: AddEventNoteFormValues) => {
    await addEventOrNote({
      type: values.type,
      date: formatDateKey(values.date),
      title: values.title,
      time: values.time || undefined,
      content: values.content || undefined,
    });
    load();
    onItemsChange?.();
  };

  const handleDelete = (item: EventOrNote) => {
    Alert.alert('Delete', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEventOrNote(item.id);
          load();
          onItemsChange?.();
        },
      },
    ]);
  };

  const cardBg = isDark ? colors.surfaceDark : '#fff';
  const cardBorder = isDark ? colors.outlineDark : '#eee';
  const textPrimary = isDark ? colors.onSurfaceDark : colors.onSurface;
  const textSecondary = isDark ? colors.outlineDark : '#666';

  const renderItem = ({ item }: { item: EventOrNote }) => (
    <View style={[styles.itemRow, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.itemContent}>
        <Text style={[styles.itemType, { color: colors.primary }]}>
          {item.type === 'event' ? 'Event' : 'Note'}
        </Text>
        <Text style={[styles.itemTitle, { color: textPrimary }]}>{item.title}</Text>
        {item.time && (
          <Text style={[styles.itemTime, { color: textSecondary }]}>{item.time}</Text>
        )}
        {item.content ? (
          <Text style={[styles.itemDescription, { color: textSecondary }]} numberOfLines={2}>{item.content}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => handleDelete(item)}
        style={({ pressed }) => [styles.deleteBtn, pressed && styles.deleteBtnPressed]}
      >
        <Text style={styles.deleteBtnText}>Remove</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
          Events & Notes
        </Text>
        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </Pressable>
      </View>

      <AddEventNoteModal
        visible={showAddModal}
        initialDate={selectedDate}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
      />

      {loading ? (
        <Text style={[styles.emptyText, { color: textSecondary }]}>Loading…</Text>
      ) : items.length === 0 ? (
        <Text style={[styles.emptyText, { color: textSecondary }]}>
          No events or notes for this day. Tap "+ Add" to create one.
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          scrollEnabled={false}
          style={styles.list}
        />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  addBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  addBtnPressed: {
    opacity: 0.8,
  },
  addBtnText: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
  },
  list: {
    flexGrow: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm,
    ...cardShadow,
  },
  itemContent: {
    flex: 1,
  },
  itemType: {
    ...typography.labelLarge,
    fontSize: 12,
    marginBottom: 2,
  },
  itemTitle: {
    ...typography.bodyLarge,
  },
  itemTime: {
    ...typography.bodyMedium,
    fontSize: 12,
    marginTop: 2,
  },
  itemDescription: {
    ...typography.bodyMedium,
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  deleteBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  deleteBtnPressed: {
    opacity: 0.8,
  },
  deleteBtnText: {
    ...typography.labelLarge,
    color: '#c62828',
    fontSize: 13,
  },
  emptyText: {
    ...typography.bodyMedium,
    paddingVertical: spacing.md,
  },
});
