import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { formatDateKey } from '../services/eventsNotesStorage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export default function CalendarSection({ selectedDate, onSelectDate }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [viewMonth, setViewMonth] = useState(() => ({
    year: selectedDate.getFullYear(),
    month: selectedDate.getMonth(),
  }));

  const days = useMemo(() => {
    const year = viewMonth.year;
    const month = viewMonth.month;
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const result: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) result.push(null);
    for (let d = 1; d <= last.getDate(); d++) result.push(d);
    const endPad = 6 - last.getDay();
    for (let i = 0; i < endPad; i++) result.push(null);
    return result;
  }, [viewMonth.year, viewMonth.month]);

  const prevMonth = () => {
    if (viewMonth.month === 0) {
      setViewMonth({ year: viewMonth.year - 1, month: 11 });
    } else {
      setViewMonth({ year: viewMonth.year, month: viewMonth.month - 1 });
    }
  };

  const nextMonth = () => {
    if (viewMonth.month === 11) {
      setViewMonth({ year: viewMonth.year + 1, month: 0 });
    } else {
      setViewMonth({ year: viewMonth.year, month: viewMonth.month + 1 });
    }
  };

  const monthLabel = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());
  const cardBg = isDark ? colors.surfaceDark : '#fff';
  const cardBorder = isDark ? colors.outlineDark : '#eee';
  const textPrimary = isDark ? colors.onSurfaceDark : '#333';
  const textMuted = isDark ? colors.outlineDark : '#666';

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
        Calendar
      </Text>
      <View style={styles.header}>
        <Pressable onPress={prevMonth} style={styles.arrowBtn}>
          <Text style={[styles.arrow, { color: colors.primary }]}>‹</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: textPrimary }]}>{monthLabel}</Text>
        <Pressable onPress={nextMonth} style={styles.arrowBtn}>
          <Text style={[styles.arrow, { color: colors.primary }]}>›</Text>
        </Pressable>
      </View>
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={[styles.weekday, { color: textMuted }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={[styles.grid, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {days.map((d, i) => {
          if (d === null) {
            return <View key={`empty-${i}`} style={styles.cell} />;
          }
          const date = new Date(viewMonth.year, viewMonth.month, d);
          const key = formatDateKey(date);
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          return (
            <Pressable
              key={key}
              style={[
                styles.cell,
                isSelected && styles.cellSelected,
                isToday && !isSelected && (isDark ? styles.cellTodayDark : styles.cellToday),
              ]}
              onPress={() => onSelectDate(date)}
            >
              <Text
                style={[
                  styles.cellText,
                  { color: textPrimary },
                  isSelected && styles.cellTextSelected,
                ]}
              >
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  arrowBtn: {
    padding: spacing.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  cellSelected: {
    backgroundColor: colors.primary,
  },
  cellToday: {
    backgroundColor: 'rgba(232, 93, 0, 0.12)',
  },
  cellTodayDark: {
    backgroundColor: colors.chipSelectedDark,
  },
  cellText: {
    fontSize: 14,
  },
  cellTextSelected: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
