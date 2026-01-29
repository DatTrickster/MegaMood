import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing } from '../constants/theme';
import { loadAIBuddySettings } from '../services/aiBuddySettingsService';
import GaiaChatBubbleIcon from './GaiaChatBubbleIcon';

type Props = {
  onPress: () => void;
};

export default function GaiaChatBubble({ onPress }: Props) {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);

  const refresh = useCallback(async () => {
    const settings = await loadAIBuddySettings();
    setVisible(settings.enabled);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[
        styles.bubble,
        isDark && styles.bubbleDark,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconWrap}>
        <GaiaChatBubbleIcon size={28} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    bottom: spacing.xl + spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    zIndex: 1000,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bubbleDark: {
    backgroundColor: colors.primaryLight,
    shadowColor: '#000',
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});
