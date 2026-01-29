import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { User } from '../models/User';
import { colors, spacing, typography, borderRadius, cardShadow } from '../constants/theme';
import {
  getMotivationForToday,
  fetchAndSaveMotivationForToday,
} from '../services/motivationService';

type Props = {
  user: User;
};

export default function DailyMotivationCard({ user }: Props) {
  const { isDark } = useTheme();
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await getMotivationForToday();
      if (cancelled) return;
      if (cached) {
        setText(cached);
        setLoading(false);
        return;
      }
      const fresh = await fetchAndSaveMotivationForToday(user);
      if (cancelled) return;
      setText(fresh ?? null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user.preferredUsername, user.lifestyleGoals?.join(',')]);

  if (loading) {
    return (
      <View style={[styles.card, isDark && styles.cardDark]}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Gaia is thinking of you…
        </Text>
      </View>
    );
  }

  if (!text) return null;

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <Text style={[styles.label, isDark && styles.labelDark]}>Good morning from Gaia</Text>
      <Text style={[styles.quote, isDark && styles.quoteDark]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
    borderColor: colors.outlineDark,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    marginTop: spacing.sm,
  },
  loadingTextDark: {
    color: colors.onSurfaceDark,
  },
  label: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  labelDark: {
    color: colors.primaryLight,
  },
  quote: {
    ...typography.bodyLarge,
    color: colors.onSurface,
    fontStyle: 'italic',
    lineHeight: 24,
  },
  quoteDark: {
    color: colors.onSurfaceDark,
  },
});
