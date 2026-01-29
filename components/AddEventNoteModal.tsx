import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { formatDateKey } from '../services/eventsNotesStorage';

export interface AddEventNoteFormValues {
  type: 'event' | 'note';
  title: string;
  date: Date;
  time: string;
  content: string;
}

const defaultValues: AddEventNoteFormValues = {
  type: 'event',
  title: '',
  date: new Date(),
  time: '',
  content: '',
};

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes();
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseTime(s: string): { hours: number; minutes: number } {
  const match = s.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    return { hours: parseInt(match[1], 10) % 24, minutes: parseInt(match[2], 10) % 60 };
  }
  const d = new Date();
  return { hours: d.getHours(), minutes: d.getMinutes() };
}

type Props = {
  visible: boolean;
  initialDate: Date;
  onClose: () => void;
  onSubmit: (values: AddEventNoteFormValues) => void;
};

export default function AddEventNoteModal({
  visible,
  initialDate,
  onClose,
  onSubmit,
}: Props) {
  const { isDark } = useTheme();
  const [type, setType] = useState<'event' | 'note'>(defaultValues.type);
  const [title, setTitle] = useState(defaultValues.title);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(defaultValues.time);
  const [content, setContent] = useState(defaultValues.content);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(initialDate);
      setTitle('');
      setTime('');
      setContent('');
      setType('event');
    }
  }, [visible, initialDate]);

  const handleDateChange = (_: unknown, value?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (value) setDate(value);
  };

  const handleTimeChange = (_: unknown, value?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (value) setTime(formatTime(value));
  };

  const handleSubmit = () => {
    const t = title.trim();
    if (!t) return;
    onSubmit({
      type,
      title: t,
      date,
      time: time.trim(),
      content: content.trim(),
    });
    onClose();
  };

  const dateForTimePicker = (): Date => {
    const { hours, minutes } = time ? parseTime(time) : { hours: 9, minutes: 0 };
    const d = new Date(date);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const cardBg = isDark ? colors.surfaceDark : colors.surface;
  const cardBorder = isDark ? colors.outlineDark : colors.outline;
  const textPrimary = isDark ? colors.onSurfaceDark : colors.onSurface;
  const textSecondary = isDark ? colors.outlineDark : '#666';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : '#f5f5f5';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.dialog, { backgroundColor: cardBg, borderColor: cardBorder }]} onPress={(e) => e.stopPropagation()}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.dialogTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
              Add {type === 'event' ? 'Event' : 'Note'}
            </Text>

            <View style={styles.typeRow}>
              <Pressable
                style={[styles.typeBtn, type === 'event' && styles.typeBtnSelected, type === 'event' && { backgroundColor: colors.chipSelected }]}
                onPress={() => setType('event')}
              >
                <Text style={[styles.typeBtnText, { color: textPrimary }, type === 'event' && { color: colors.primary, fontWeight: '600' }]}>
                  Event
                </Text>
              </Pressable>
              <Pressable
                style={[styles.typeBtn, type === 'note' && styles.typeBtnSelected, type === 'note' && { backgroundColor: colors.chipSelected }]}
                onPress={() => setType('note')}
              >
                <Text style={[styles.typeBtnText, { color: textPrimary }, type === 'note' && { color: colors.primary, fontWeight: '600' }]}>
                  Note
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.label, { color: textPrimary }]}>Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: cardBorder, color: textPrimary }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={textSecondary}
              autoCapitalize="sentences"
            />

            <Text style={[styles.label, { color: textPrimary }]}>Date</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: inputBg, borderColor: cardBorder }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.pickerButtonText, { color: textPrimary }]}>
                {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <Pressable style={styles.doneRow} onPress={() => setShowDatePicker(false)}>
                <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
              </Pressable>
            )}

            <Text style={[styles.label, { color: textPrimary }]}>Time (optional)</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: inputBg, borderColor: cardBorder }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={[styles.pickerButtonText, { color: textPrimary }]}>
                {time || 'Set time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={dateForTimePicker()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
            {Platform.OS === 'ios' && showTimePicker && (
              <Pressable style={styles.doneRow} onPress={() => setShowTimePicker(false)}>
                <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
              </Pressable>
            )}
            {time ? (
              <TouchableOpacity onPress={() => setTime('')} style={styles.clearTime}>
                <Text style={[styles.clearTimeText, { color: textSecondary }]}>Clear time</Text>
              </TouchableOpacity>
            ) : null}

            <Text style={[styles.label, { color: textPrimary }]}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBg, borderColor: cardBorder, color: textPrimary }]}
              value={content}
              onChangeText={setContent}
              placeholder="Description or notes"
              placeholderTextColor={textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.actions}>
              <Pressable style={[styles.cancelBtn, { borderColor: cardBorder }]} onPress={onClose}>
                <Text style={[styles.cancelBtnText, { color: textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addBtn, !title.trim() && styles.addBtnDisabled]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.addBtnText}>Add</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  dialogTitle: {
    ...typography.titleLarge,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  typeBtnSelected: {},
  typeBtnText: {
    ...typography.bodyMedium,
  },
  label: {
    ...typography.labelLarge,
    marginBottom: spacing.xs,
  },
  input: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodyLarge,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerButton: {
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.sm,
  },
  pickerButtonText: {
    ...typography.bodyLarge,
  },
  doneRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  doneText: {
    ...typography.labelLarge,
  },
  clearTime: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  clearTimeText: {
    ...typography.bodyMedium,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
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
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
