import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  addEventOrNote,
  deleteEventOrNote,
  formatDateKey,
  getEventsAndNotesForDate,
  type EventOrNote,
} from '../services/eventsNotesStorage';

type Props = {
  selectedDate: Date;
};

export default function EventsNotesSection({ selectedDate }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [items, setItems] = useState<EventOrNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'event' | 'note'>('event');

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

  const handleAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await addEventOrNote({
      type: newType,
      date: dateStr,
      title,
    });
    setNewTitle('');
    setShowAdd(false);
    load();
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
        {!showAdd ? (
          <Pressable
            onPress={() => setShowAdd(true)}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        ) : null}
      </View>

      {showAdd && (
        <View style={[styles.addCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5',
                borderColor: cardBorder,
                color: textPrimary,
              },
            ]}
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Title"
            placeholderTextColor={textSecondary}
            autoFocus
          />
          <View style={styles.typeRow}>
            <Pressable
              style={[
                styles.typeBtn,
                newType === 'event' && styles.typeBtnSelected,
                newType === 'event' && { backgroundColor: colors.chipSelected },
              ]}
              onPress={() => setNewType('event')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: textPrimary },
                  newType === 'event' && { color: colors.primary, fontWeight: '600' },
                ]}
              >
                Event
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.typeBtn,
                newType === 'note' && styles.typeBtnSelected,
                newType === 'note' && { backgroundColor: colors.chipSelected },
              ]}
              onPress={() => setNewType('note')}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  { color: textPrimary },
                  newType === 'note' && { color: colors.primary, fontWeight: '600' },
                ]}
              >
                Note
              </Text>
            </Pressable>
          </View>
          <View style={styles.addActions}>
            <Pressable
              style={[styles.cancelBtn, { borderColor: cardBorder }]}
              onPress={() => {
                setShowAdd(false);
                setNewTitle('');
              }}
            >
              <Text style={[styles.cancelBtnText, { color: textPrimary }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.saveBtn, !newTitle.trim() && styles.saveBtnDisabled]}
              onPress={handleAdd}
              disabled={!newTitle.trim()}
            >
              <Text style={styles.saveBtnText}>Add</Text>
            </Pressable>
          </View>
        </View>
      )}

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
  addCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  input: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodyLarge,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  typeBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  typeBtnSelected: {},
  typeBtnText: {
    ...typography.bodyMedium,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  cancelBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  cancelBtnText: {
    ...typography.labelLarge,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
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
