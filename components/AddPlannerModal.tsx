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
import { formatDateKey, type PlannerItemType } from '../services/plannerStorage';

export interface AddPlannerFormValues {
  type: PlannerItemType;
  date: Date;
  content: string;
}

const PLANNER_TYPES: { value: PlannerItemType; label: string }[] = [
  { value: 'meal', label: 'Meal' },
  { value: 'workout', label: 'Workout' },
  { value: 'mindbody', label: 'Mind & Body' },
];

const defaultValues: AddPlannerFormValues = {
  type: 'meal',
  date: new Date(),
  content: '',
};

type Props = {
  visible: boolean;
  initialDate: Date;
  initialType?: PlannerItemType;
  onClose: () => void;
  onSubmit: (values: AddPlannerFormValues) => void;
};

export default function AddPlannerModal({
  visible,
  initialDate,
  initialType = 'meal',
  onClose,
  onSubmit,
}: Props) {
  const { isDark } = useTheme();
  const [type, setType] = useState<PlannerItemType>(defaultValues.type);
  const [date, setDate] = useState(initialDate);
  const [content, setContent] = useState(defaultValues.content);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setDate(initialDate);
      setContent('');
      setType(initialType);
    }
  }, [visible, initialDate, initialType]);

  const handleDateChange = (_: unknown, value?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (value) setDate(value);
  };

  const handleSubmit = () => {
    const c = content.trim();
    if (!c) return;
    onSubmit({ type, date, content: c });
    onClose();
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
        <Pressable
          style={[styles.dialog, { backgroundColor: cardBg, borderColor: cardBorder }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={[styles.dialogTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
              Add to planner
            </Text>

            <Text style={[styles.label, { color: textPrimary }]}>Type</Text>
            <View style={styles.typeRow}>
              {PLANNER_TYPES.map(({ value, label }) => (
                <Pressable
                  key={value}
                  style={[
                    styles.typeBtn,
                    type === value && styles.typeBtnSelected,
                    type === value && { backgroundColor: isDark ? colors.chipSelectedDark : colors.chipSelected },
                  ]}
                  onPress={() => setType(value)}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      { color: textPrimary },
                      type === value && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: textPrimary }]}>Date</Text>
            <TouchableOpacity
              style={[styles.pickerButton, { backgroundColor: inputBg, borderColor: cardBorder }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.pickerButtonText, { color: textPrimary }]}>
                {date.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
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

            <Text style={[styles.label, { color: textPrimary }]}>Description</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: inputBg, borderColor: cardBorder, color: textPrimary },
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="e.g. Oatmeal with berries, 30 min run, 10 min meditation"
              placeholderTextColor={textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.actions}>
              <Pressable style={[styles.cancelBtn, { borderColor: cardBorder }]} onPress={onClose}>
                <Text style={[styles.cancelBtnText, { color: textPrimary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addBtn, !content.trim() && styles.addBtnDisabled]}
                onPress={handleSubmit}
                disabled={!content.trim()}
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
  label: {
    ...typography.labelLarge,
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  typeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeBtnSelected: {
    borderColor: colors.primary,
  },
  typeBtnText: {
    ...typography.bodyMedium,
  },
  pickerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pickerButtonText: {
    ...typography.bodyLarge,
  },
  input: {
    borderRadius: borderRadius.md,
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
  doneRow: {
    marginBottom: spacing.md,
  },
  doneText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...typography.labelLarge,
  },
  addBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
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
