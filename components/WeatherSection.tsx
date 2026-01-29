import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { colors, spacing, borderRadius } from '../constants/theme';
import { loadWeatherLocationSettings } from '../services/weatherLocationSettings';
import {
  fetchWeatherForecast,
  weatherCodeLabel,
  type WeatherForecast,
} from '../services/weatherService';

export default function WeatherSection() {
  const isDark = useColorScheme() === 'dark';
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const locationSettings = await loadWeatherLocationSettings();
      let lat = locationSettings.latitude;
      let lon = locationSettings.longitude;
      if (locationSettings.usePreciseLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === Location.PermissionStatus.GRANTED) {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          lat = pos.coords.latitude;
          lon = pos.coords.longitude;
        }
      }
      const data = await fetchWeatherForecast(lat, lon);
      setForecast(data);
    } catch {
      setForecast(null);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
    }, [load])
  );

  const cardBg = isDark ? colors.surfaceDark : '#fff';
  const cardBorder = isDark ? colors.outlineDark : '#eee';
  const textPrimary = isDark ? colors.onSurfaceDark : '#111';
  const textSecondary = isDark ? colors.onSurfaceDark : '#555';
  const textMuted = isDark ? colors.outlineDark : '#888';

  if (loading && !forecast) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
          Weather
        </Text>
        <View style={[styles.placeholder, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.placeholderText, { color: textMuted }]}>Loading weather…</Text>
        </View>
      </View>
    );
  }

  if (!forecast) {
    return (
      <View style={styles.container}>
        <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
          Weather
        </Text>
        <View style={[styles.placeholder, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.placeholderText, { color: textMuted }]}>Unable to load weather</Text>
        </View>
      </View>
    );
  }

  const { current, daily } = forecast;
  const todayCode = daily.weather_code?.[0];
  const todayLabel = todayCode != null ? weatherCodeLabel(todayCode) : '—';

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: isDark ? colors.primaryLight : colors.primary }]}>
        Weather
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} color={colors.primary} />
        }
      >
        <View style={[styles.currentCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.currentTemp, { color: textPrimary }]}>
            {Math.round(current.temperature_2m)}°
          </Text>
          <Text style={[styles.currentLabel, { color: textSecondary }]}>{todayLabel}</Text>
          <Text style={[styles.currentMeta, { color: textMuted }]}>
            Humidity {current.relative_humidity_2m}% · Wind {current.wind_speed_10m} km/h
          </Text>
        </View>
        {daily.time?.slice(0, 5).map((date, i) => (
          <View key={date} style={[styles.dayCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <Text style={[styles.dayLabel, { color: textPrimary }]}>
              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <Text style={[styles.dayTemp, { color: textSecondary }]}>
              {daily.temperature_2m_max?.[i] != null ? Math.round(daily.temperature_2m_max[i]) : '—'}° /{' '}
              {daily.temperature_2m_min?.[i] != null ? Math.round(daily.temperature_2m_min[i]) : '—'}°
            </Text>
            <Text style={[styles.dayCode, { color: textMuted }]}>
              {daily.weather_code?.[i] != null ? weatherCodeLabel(daily.weather_code[i]) : '—'}
            </Text>
          </View>
        ))}
      </ScrollView>
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
  placeholder: {
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  placeholderText: {
    marginTop: spacing.sm,
  },
  currentCard: {
    width: 160,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  currentTemp: {
    fontSize: 36,
    fontWeight: '700',
  },
  currentLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  currentMeta: {
    fontSize: 11,
    marginTop: spacing.sm,
  },
  dayCard: {
    width: 100,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  dayTemp: {
    fontSize: 14,
    marginTop: 4,
  },
  dayCode: {
    fontSize: 11,
    marginTop: 2,
  },
});
