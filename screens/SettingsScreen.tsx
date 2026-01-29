import * as Location from 'expo-location';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Pressable,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import type { AppearancePreference } from '../services/themeService';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  loadAIBuddySettings,
  saveAIBuddySettings,
  type AIBuddySettings,
} from '../services/aiBuddySettingsService';
import { clearGaiaChat } from '../services/gaiaChatService';
import {
  loadWeatherLocationSettings,
  saveWeatherLocationSettings,
} from '../services/weatherLocationSettings';
import {
  getDailyMotivationEnabled,
  setDailyMotivationEnabled,
  scheduleDailyMotivationNotificationIfEnabled,
} from '../services/motivationService';
import {
  searchLocations,
  reverseGeocode,
  type GeocodingResult,
} from '../services/weatherService';

type Props = {
  onBack: () => void;
  onDestroyProfile?: () => Promise<void>;
};

const APPEARANCE_OPTIONS: { value: AppearancePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsScreen({ onBack, onDestroyProfile }: Props) {
  const { isDark, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [usePreciseLocation, setUsePreciseLocation] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [locationSaving, setLocationSaving] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<GeocodingResult[]>([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [useMyLocationLoading, setUseMyLocationLoading] = useState(false);
  const [clearChatSaving, setClearChatSaving] = useState(false);
  const [destroying, setDestroying] = useState(false);
  const [dailyMotivationEnabled, setDailyMotivationEnabledState] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSuggestionsAfterSelectRef = useRef(false);
  const hasFocusedLocationInputRef = useRef(false);

  const applyLocation = useCallback(async (result: GeocodingResult) => {
    const label = result.displayLabel ?? `${result.name}${result.country ? `, ${result.country}` : ''}`;
    skipSuggestionsAfterSelectRef.current = true;
    await saveWeatherLocationSettings({
      locationName: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
    });
    setLocationName(label);
    setLocationSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, []);

  useEffect(() => {
    Promise.all([
      loadAIBuddySettings(),
      loadWeatherLocationSettings(),
      getDailyMotivationEnabled(),
    ]).then(([aiSettings, weatherSettings, motivationEnabled]) => {
      setEnabled(aiSettings.enabled);
      setApiKey(aiSettings.apiKey);
      setWeatherEnabled(weatherSettings.weatherEnabled);
      setUsePreciseLocation(weatherSettings.usePreciseLocation);
      setLocationName(weatherSettings.locationName);
      setDailyMotivationEnabledState(motivationEnabled);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = locationName.trim();
    if (q.length < 2) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      setLocationSearching(true);
      try {
        const list = await searchLocations(q, 10);
        setLocationSuggestions(list);
        if (skipSuggestionsAfterSelectRef.current) {
          skipSuggestionsAfterSelectRef.current = false;
        } else if (hasFocusedLocationInputRef.current) {
          setShowSuggestions(true);
        }
      } catch {
        setLocationSuggestions([]);
      } finally {
        setLocationSearching(false);
      }
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [locationName]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings: AIBuddySettings = {
        enabled,
        apiKey: apiKey.trim(),
        baseUrl: 'https://ollama.com',
        model: 'gpt-oss:120b',
      };
      await saveAIBuddySettings(settings);
      Alert.alert('Saved', 'AI Buddy settings saved securely.');
    } catch {
      Alert.alert('Error', 'Could not save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5',
      borderColor: isDark ? colors.outlineDark : '#E0E0E0',
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
    },
  ];

  const headerStyle = {
    paddingTop: insets.top + spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.header, isDark && styles.headerDark, headerStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={[styles.backText, isDark && styles.backTextDark]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, isDark && styles.titleDark]}>Settings</Text>
        <View style={styles.backBtn} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
          Appearance
        </Text>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Choose light, dark, or follow your device setting.
        </Text>
        <View style={styles.chipsRow}>
          {APPEARANCE_OPTIONS.map(({ value, label }) => {
            const selected = preference === value;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.appearanceChip,
                  {
                    backgroundColor: selected
                      ? isDark ? colors.chipSelectedDark : colors.chipSelected
                      : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0',
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setPreference(value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.appearanceChipText,
                    { color: isDark ? colors.onSurfaceDark : colors.onSurface },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, styles.sectionSpacer]}>
          AI Buddy
        </Text>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Use an Ollama Cloud API key to power Gaia. Get a key at ollama.com/settings/keys.
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Enable AI Buddy</Text>
          <Switch
            value={enabled}
            onValueChange={async (v) => {
              setEnabled(v);
              if (!v) {
                setDailyMotivationEnabledState(false);
                await setDailyMotivationEnabled(false);
              }
            }}
            trackColor={{ false: '#ccc', true: colors.primaryLight }}
            thumbColor={enabled ? colors.primary : '#f4f3f4'}
          />
        </View>
        <Text style={[styles.label, isDark && styles.labelDark]}>API Key</Text>
        <TextInput
          style={inputStyle}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder="Your Ollama API key"
          placeholderTextColor={isDark ? '#888' : '#999'}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.onPrimary} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.subsectionTitle, isDark && styles.sectionTitleDark, styles.subsectionSpacer]}>
          Daily motivation
        </Text>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Requires AI Buddy. When enabled, Gaia sends one motivational message per day (based on your profile and goals). It appears on the dashboard and as a push notification.
        </Text>
        <View style={[!enabled && styles.aiBuddySubsectionDisabled]}>
          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Daily motivation from Gaia</Text>
            <Switch
              value={enabled ? dailyMotivationEnabled : false}
              disabled={!enabled}
              onValueChange={async (v) => {
                setDailyMotivationEnabledState(v);
                await setDailyMotivationEnabled(v);
                if (v) {
                  scheduleDailyMotivationNotificationIfEnabled();
                }
              }}
              trackColor={{ false: '#ccc', true: colors.primaryLight }}
              thumbColor={dailyMotivationEnabled && enabled ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, styles.sectionSpacer]}>
          Weather
        </Text>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Show weather on the dashboard. When off, location and weather services are disabled.
        </Text>
        <View style={styles.row}>
          <Text style={[styles.label, isDark && styles.labelDark]}>Weather services</Text>
          <Switch
            value={weatherEnabled}
            onValueChange={async (v) => {
              setWeatherEnabled(v);
              if (!v) {
                setUsePreciseLocation(false);
                await saveWeatherLocationSettings({ weatherEnabled: false });
              } else {
                await saveWeatherLocationSettings({ weatherEnabled: true });
              }
            }}
            trackColor={{ false: '#ccc', true: colors.primaryLight }}
            thumbColor={weatherEnabled ? colors.primary : '#f4f3f4'}
          />
        </View>
        <View style={!weatherEnabled && styles.weatherSubsectionDisabled}>
          <View style={styles.row}>
            <Text style={[styles.label, isDark && styles.labelDark]}>Use precise location (auto)</Text>
            <Switch
              value={usePreciseLocation}
              disabled={!weatherEnabled}
              onValueChange={async (v) => {
                if (v) {
                  Alert.alert(
                    'Allow location access',
                    'MegaMood uses your location to show weather for your area when "Use precise location" is on. Your location is not shared with anyone. Allow access?',
                    [
                      { text: 'Not now', style: 'cancel' },
                      {
                        text: 'Allow',
                        onPress: async () => {
                          const { status } = await Location.requestForegroundPermissionsAsync();
                          const granted = status === Location.PermissionStatus.GRANTED;
                          setUsePreciseLocation(granted);
                          await saveWeatherLocationSettings({ usePreciseLocation: granted });
                          if (!granted) {
                            Alert.alert('Location needed', 'Enable location in your device settings to use precise weather.');
                          }
                        },
                      },
                    ]
                  );
                } else {
                  setUsePreciseLocation(false);
                  await saveWeatherLocationSettings({ usePreciseLocation: false });
                }
              }}
              trackColor={{ false: '#ccc', true: colors.primaryLight }}
              thumbColor={usePreciseLocation ? colors.primary : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.label, isDark && styles.labelDark]}>City or location</Text>
          <View style={styles.locationInputWrap}>
            <TextInput
              style={inputStyle}
              value={locationName}
              onChangeText={setLocationName}
              onFocus={() => {
                hasFocusedLocationInputRef.current = true;
                if (locationSuggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="e.g. Cape Town, Johannesburg"
              placeholderTextColor={isDark ? '#888' : '#999'}
              autoCapitalize="words"
              editable={weatherEnabled}
            />
            {weatherEnabled && showSuggestions && (locationSearching || locationSuggestions.length > 0) && (
              <View style={[styles.suggestionsBox, isDark && styles.suggestionsBoxDark]}>
                {locationSearching ? (
                  <View style={styles.suggestionsLoading}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.suggestionsLoadingText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>
                      Searching…
                    </Text>
                  </View>
                ) : (
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    style={styles.suggestionsList}
                    nestedScrollEnabled
                  >
                    {locationSuggestions.map((item) => (
                      <Pressable
                        key={`${item.latitude}-${item.longitude}-${item.name}`}
                        style={({ pressed }) => [
                          styles.suggestionItem,
                          isDark && styles.suggestionItemDark,
                          pressed && styles.suggestionItemPressed,
                        ]}
                        onPress={() => applyLocation(item)}
                      >
                        <Text
                          style={[styles.suggestionText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}
                          numberOfLines={1}
                        >
                          {item.displayLabel ?? `${item.name}${item.country ? `, ${item.country}` : ''}`}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.autoLocationBtn, (useMyLocationLoading || !weatherEnabled) && styles.saveBtnDisabled]}
            onPress={async () => {
              if (!weatherEnabled) return;
              Alert.alert(
                'Allow location access',
                'MegaMood uses your location to show weather for your area. Your location is not shared with anyone. Allow access?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Allow',
                    onPress: async () => {
                      setUseMyLocationLoading(true);
                      try {
                        const { status } = await Location.requestForegroundPermissionsAsync();
                        if (status !== Location.PermissionStatus.GRANTED) {
                          Alert.alert('Location needed', 'Enable location in your device settings to use your current position for weather.');
                          return;
                        }
                        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                        const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
                        if (result) {
                          await saveWeatherLocationSettings({
                            locationName: result.name,
                            latitude: result.latitude,
                            longitude: result.longitude,
                          });
                          setLocationName(result.displayLabel ?? `${result.name}${result.country ? `, ${result.country}` : ''}`);
                          setLocationSuggestions([]);
                          setShowSuggestions(false);
                          Alert.alert('Location set', 'Weather will refresh for your current location.');
                        } else {
                          await saveWeatherLocationSettings({
                            locationName: 'Current location',
                            latitude: pos.coords.latitude,
                            longitude: pos.coords.longitude,
                          });
                          setLocationName('Current location');
                          Alert.alert('Location set', 'Weather will refresh for your coordinates.');
                        }
                      } catch {
                        Alert.alert('Error', 'Could not get your location.');
                      } finally {
                        setUseMyLocationLoading(false);
                      }
                    },
                  },
                ],
              );
            }}
            disabled={useMyLocationLoading || !weatherEnabled}
          >
            {useMyLocationLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.autoLocationBtnText}>Use my location (auto & refresh)</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, styles.sectionSpacer]}>
          Chat
        </Text>
        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Remove all Gaia chat history from this device. This cannot be undone.
        </Text>
        <TouchableOpacity
          style={[styles.clearChatBtn, clearChatSaving && styles.saveBtnDisabled]}
          onPress={() => {
            Alert.alert(
              'Remove all AI chat data',
              'This will permanently delete all Gaia chat history on this device. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Remove all',
                  style: 'destructive',
                  onPress: async () => {
                    setClearChatSaving(true);
                    try {
                      await clearGaiaChat();
                      Alert.alert('Done', 'All AI chat data has been removed.');
                    } catch {
                      Alert.alert('Error', 'Could not remove chat data.');
                    } finally {
                      setClearChatSaving(false);
                    }
                  },
                },
              ]
            );
          }}
          disabled={clearChatSaving}
        >
          {clearChatSaving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={styles.clearChatBtnText}>Remove all AI chat data</Text>
          )}
        </TouchableOpacity>

        {onDestroyProfile && (
          <>
            <Text style={[styles.dangerZoneTitle, isDark && styles.labelDark]}>Danger zone</Text>
            <Text style={[styles.dangerZoneHint, isDark && styles.hintDark]}>
              Permanently delete your profile and all app data (events, notes, settings, chat). You will be returned to the start screen. This cannot be undone.
            </Text>
            <TouchableOpacity
              style={[styles.destroyBtn, destroying && styles.saveBtnDisabled]}
              onPress={() => {
                Alert.alert(
                  'Destroy profile',
                  'This will permanently delete your profile and all data. You will be sent back to the beginning. This cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete everything',
                      style: 'destructive',
                      onPress: async () => {
                        setDestroying(true);
                        try {
                          await onDestroyProfile();
                        } catch {
                          Alert.alert('Error', 'Could not delete profile.');
                        } finally {
                          setDestroying(false);
                        }
                      },
                    },
                  ]
                );
              }}
              disabled={destroying}
            >
              {destroying ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.destroyBtnText}>Destroy profile and all data</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  headerDark: {
    backgroundColor: colors.backgroundDark,
    borderBottomColor: colors.outlineDark,
  },
  backBtn: {
    minWidth: 60,
  },
  backText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  backTextDark: {
    color: colors.primaryLight,
  },
  title: {
    ...typography.titleLarge,
    color: colors.onSurface,
  },
  titleDark: {
    color: colors.onSurfaceDark,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  sectionTitleDark: {
    color: colors.primaryLight,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  appearanceChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  appearanceChipText: {
    ...typography.labelLarge,
  },
  sectionSpacer: {
    marginTop: spacing.xl,
  },
  subsectionTitle: {
    ...typography.titleMedium,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subsectionSpacer: {
    marginTop: spacing.lg,
  },
  aiBuddySubsectionDisabled: {
    opacity: 0.6,
  },
  hint: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.8,
    marginBottom: spacing.md,
  },
  hintDark: {
    color: colors.onSurfaceDark,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  label: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginBottom: spacing.xs,
  },
  labelDark: {
    color: colors.onSurfaceDark,
  },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodyLarge,
    marginBottom: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  weatherSubsectionDisabled: {
    opacity: 0.6,
  },
  locationInputWrap: {
    marginBottom: spacing.sm,
    position: 'relative',
    zIndex: 1,
  },
  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.sm,
    marginTop: 2,
    maxHeight: 220,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  suggestionsBoxDark: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.outlineDark,
  },
  suggestionsList: {
    maxHeight: 216,
  },
  suggestionsLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  suggestionsLoadingText: {
    ...typography.bodyMedium,
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  suggestionItemDark: {
    borderBottomColor: colors.outlineDark,
  },
  suggestionItemPressed: {
    backgroundColor: colors.chipSelected,
  },
  suggestionText: {
    ...typography.bodyMedium,
  },
  autoLocationBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  autoLocationBtnText: {
    ...typography.labelLarge,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  clearChatBtn: {
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  clearChatBtnText: {
    ...typography.labelLarge,
    color: colors.primary,
    fontWeight: '600',
  },
  dangerZoneTitle: {
    ...typography.titleMedium,
    color: colors.onSurface,
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
  },
  dangerZoneHint: {
    ...typography.bodyMedium,
    opacity: 0.8,
    marginBottom: spacing.md,
  },
  destroyBtn: {
    backgroundColor: '#c62828',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  destroyBtnText: {
    ...typography.labelLarge,
    color: '#fff',
    fontWeight: '600',
  },
});
