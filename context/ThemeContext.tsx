import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { getAppearance, setAppearance, type AppearancePreference } from '../services/themeService';

type ThemeContextValue = {
  /** Resolved dark mode: true when app should show dark UI */
  isDark: boolean;
  /** User preference: system, light, or dark */
  preference: AppearancePreference;
  /** Update preference and persist */
  setPreference: (p: AppearancePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorSchemeHook = useColorScheme();
  const [preference, setPreferenceState] = useState<AppearancePreference>('system');
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(
    () => Appearance.getColorScheme() || 'light'
  );

  // Listen for system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || 'light');
    });
    return () => subscription.remove();
  }, []);

  // Also sync with hook value when it changes
  useEffect(() => {
    if (colorSchemeHook) {
      setSystemScheme(colorSchemeHook);
    }
  }, [colorSchemeHook]);

  const isDark =
    preference === 'dark' ? true : preference === 'light' ? false : systemScheme === 'dark';

  useEffect(() => {
    getAppearance().then(setPreferenceState);
  }, []);

  const setPreference = useCallback(async (p: AppearancePreference) => {
    await setAppearance(p);
    setPreferenceState(p);
  }, []);

  const value: ThemeContextValue = { isDark, preference, setPreference };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
