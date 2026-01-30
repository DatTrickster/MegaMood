import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, cardShadow } from '../constants/theme';
import { getEventsAndNotesForDate, formatDateKey, type EventOrNote } from '../services/eventsNotesStorage';

function getUpcomingEvents(): Promise<EventOrNote[]> {
  const today = formatDateKey(new Date());
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateKey(tomorrow);
  return Promise.all([
    getEventsAndNotesForDate(today),
    getEventsAndNotesForDate(tomorrowStr),
  ]).then(([todayList, tomorrowList]) => {
    const events = [...todayList, ...tomorrowList].filter((i) => i.type === 'event');
    return events;
  });
}

export default function UpcomingEventsBanner() {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<EventOrNote[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setDismissed(false);
      getUpcomingEvents().then(setEvents);
    }, [])
  );

  if (dismissed || events.length === 0) return null;

  const today = formatDateKey(new Date());
  const todayEvents = events.filter((e) => e.date === today);
  const tomorrowEvents = events.filter((e) => e.date !== today);

  const label =
    todayEvents.length > 0 && tomorrowEvents.length > 0
      ? `You have ${todayEvents.length} event(s) today and ${tomorrowEvents.length} tomorrow`
      : todayEvents.length > 0
        ? `You have ${todayEvents.length} event(s) today`
        : `You have ${tomorrowEvents.length} event(s) tomorrow`;

  return (
    <View style={[styles.banner, isDark && styles.bannerDark]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.titleDark]}>Event reminder</Text>
        <Text style={[styles.label, isDark && styles.labelDark]} numberOfLines={2}>
          {label}
        </Text>
        {events.slice(0, 3).map((e) => (
          <Text
            key={e.id}
            style={[styles.eventLine, isDark && styles.eventLineDark]}
            numberOfLines={1}
          >
            • {e.title}{e.time ? ` at ${e.time}` : ''} {e.date === today ? '(today)' : '(tomorrow)'}
          </Text>
        ))}
      </View>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={() => setDismissed(true)}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.dismissText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  bannerDark: {
    backgroundColor: colors.chipSelectedDark,
    borderColor: colors.primary,
  },
  content: { flex: 1 },
  title: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  titleDark: {
    color: colors.primaryLight,
  },
  label: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  labelDark: {
    color: colors.onSurfaceDark,
  },
  eventLine: {
    ...typography.bodyMedium,
    fontSize: 13,
    color: colors.onSurface,
    marginLeft: spacing.xs,
  },
  eventLineDark: {
    color: colors.onSurfaceDark,
  },
  dismissBtn: {
    padding: spacing.xs,
  },
  dismissText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
