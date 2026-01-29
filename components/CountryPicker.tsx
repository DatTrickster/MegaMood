import React, { useState } from 'react';
import {
  Modal,
  FlatList,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { COUNTRY_OPTIONS } from '../constants/countries';

type Props = {
  value: string;
  onSelect: (country: string) => void;
  placeholder?: string;
  /** Optional style for the trigger (touchable) container */
  style?: object;
};

export default function CountryPicker({ value, onSelect, placeholder = 'Select country', style }: Props) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  const triggerStyle = [
    styles.trigger,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5',
      borderColor: isDark ? colors.outlineDark : '#E0E0E0',
    },
    style,
  ];
  const triggerTextColor = value
    ? isDark ? colors.onSurfaceDark : colors.onSurface
    : isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E';

  return (
    <>
      <TouchableOpacity
        style={triggerStyle}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, { color: triggerTextColor }]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Text style={[styles.chevron, { color: isDark ? colors.outlineDark : '#666' }]}>▼</Text>
      </TouchableOpacity>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <View style={[styles.modalContent, isDark && styles.modalContentDark]}>
            <View style={[styles.modalHeader, isDark && styles.modalHeaderDark]}>
              <Text style={[styles.modalTitle, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>
                Select country
              </Text>
              <TouchableOpacity onPress={() => setVisible(false)} hitSlop={16}>
                <Text style={[styles.modalClose, { color: colors.primary }]}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRY_OPTIONS}
              keyExtractor={(item) => item}
              style={styles.list}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = value === item;
                return (
                  <TouchableOpacity
                    style={[
                      styles.item,
                      isDark && styles.itemDark,
                      selected && (isDark ? styles.itemSelectedDark : styles.itemSelected),
                    ]}
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.itemText,
                        { color: isDark ? colors.onSurfaceDark : colors.onSurface },
                        selected && styles.itemTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  triggerText: {
    ...typography.bodyLarge,
    flex: 1,
  },
  chevron: {
    fontSize: 10,
    marginLeft: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalContentDark: {
    backgroundColor: colors.backgroundDark,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  modalHeaderDark: {
    borderBottomColor: colors.outlineDark,
  },
  modalTitle: {
    ...typography.titleMedium,
  },
  modalClose: {
    ...typography.labelLarge,
    fontWeight: '600',
  },
  list: {
    maxHeight: 400,
  },
  item: {
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  itemDark: {
    borderBottomColor: colors.outlineDark,
  },
  itemSelected: {
    backgroundColor: colors.chipSelected,
  },
  itemSelectedDark: {
    backgroundColor: colors.chipSelectedDark,
  },
  itemText: {
    ...typography.bodyLarge,
  },
  itemTextSelected: {
    fontWeight: '600',
    color: colors.primary,
  },
});
