import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, borderRadius, cardShadow } from '../constants/theme';
import { formatDateKey } from '../services/eventsNotesStorage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Fixed cell size so the calendar has a consistent size; large enough to look right and centered. */
const CELL_SIZE = 48;
const GRID_PADDING = spacing.sm;
const GRID_WIDTH = 7 * CELL_SIZE + 2 * GRID_PADDING;
const GRID_HEIGHT = 6 * CELL_SIZE + 2 * GRID_PADDING;

type Props = {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** Date keys (YYYY-MM-DD) that have at least one event or note; show dot on calendar */
  datesWithItems?: string[];
};

export default function CalendarSection({ selectedDate, onSelectDate, datesWithItems = [] }: Props) {
  const { isDark } = useTheme();
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
    const totalCells = 6 * 7;
    const endPad = Math.max(0, totalCells - startPad - last.getDate());
    for (let i = 0; i < endPad; i++) result.push(null);
    return result;
  }, [viewMonth.year, viewMonth.month]);

  /** Split into 6 rows of 7 so the Saturday column (index 6) never gets wrapped or clipped */
  const rows = useMemo(() => {
    const r: (number | null)[][] = [];
    for (let row = 0; row < 6; row++) {
      r.push(days.slice(row * 7, (row + 1) * 7));
    }
    return r;
  }, [days]);

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
      <View style={styles.gridWrap}>
        <View style={styles.weekdayRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={[styles.weekday, { color: textMuted }]}>
              {d}
            </Text>
          ))}
        </View>
        <View style={[styles.grid, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {rows.map((rowCells, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.gridRow}>
            {rowCells.map((d, colIndex) => {
              const i = rowIndex * 7 + colIndex;
              if (d === null) {
                return <View key={`empty-${i}`} style={styles.cell} />;
              }
              const date = new Date(viewMonth.year, viewMonth.month, d);
              const key = formatDateKey(date);
              const isSelected = key === selectedKey;
              const isToday = key === todayKey;
              const hasItems = datesWithItems.includes(key);
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
                  {hasItems && (
                    <View style={[styles.cellDot, (isSelected || isToday) && styles.cellDotOnSelected]}>
                      <View style={[styles.cellDotInner, isSelected && styles.cellDotInnerSelected]} />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
    alignSelf: 'stretch',
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
  gridWrap: {
    alignItems: 'center',
    width: GRID_WIDTH,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 4,
    width: '100%',
  },
  weekday: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    width: GRID_WIDTH,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: GRID_PADDING,
    ...cardShadow,
  },
  gridRow: {
    flexDirection: 'row',
    width: 7 * CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    position: 'relative',
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
  cellDot: {
    position: 'absolute',
    bottom: 4,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cellDotOnSelected: {
    opacity: 0.9,
  },
  cellDotInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  cellDotInnerSelected: {
    backgroundColor: colors.onPrimary,
  },
});
