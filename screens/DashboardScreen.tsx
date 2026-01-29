import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useColorScheme,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import type { User } from '../models/User';
import type { MainStackParamList } from '../navigation/AppNavigator';
import GaiaChatBubble from '../components/GaiaChatBubble';
import GaiaChatModal from '../components/GaiaChatModal';
import WeatherSection from '../components/WeatherSection';
import CalendarSection from '../components/CalendarSection';
import EventsNotesSection from '../components/EventsNotesSection';
import UpcomingEventsBanner from '../components/UpcomingEventsBanner';
import DailyMotivationCard from '../components/DailyMotivationCard';
import { getDailyMotivationEnabled } from '../services/motivationService';

type Props = {
  user: User;
};

type Nav = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

export default function DashboardScreen({ user }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [gaiaVisible, setGaiaVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dailyMotivationEnabled, setDailyMotivationEnabled] = useState(false);
  const navigation = useNavigation<Nav>();

  useFocusEffect(
    useCallback(() => {
      getDailyMotivationEnabled().then(setDailyMotivationEnabled);
    }, [])
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.topRow, isDark && styles.topRowDark]}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.profileText, isDark && styles.profileTextDark]}>
            Profile
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={[styles.settingsText, isDark && styles.settingsTextDark]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.greeting, isDark && styles.greetingDark]}>
          Hi, {user.preferredUsername}
        </Text>

        {dailyMotivationEnabled && <DailyMotivationCard user={user} />}

        <UpcomingEventsBanner />

        <WeatherSection />

        <CalendarSection
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <EventsNotesSection selectedDate={selectedDate} />
      </ScrollView>

      <GaiaChatBubble onPress={() => setGaiaVisible(true)} />
      <GaiaChatModal
        visible={gaiaVisible}
        onClose={() => setGaiaVisible(false)}
      />
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
  topRow: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  topRowDark: {},
  profileBtn: { padding: spacing.sm },
  profileText: { ...typography.labelLarge, color: colors.primary },
  profileTextDark: { color: colors.primaryLight },
  settingsBtn: { padding: spacing.sm },
  settingsText: {
    ...typography.labelLarge,
    color: colors.primary,
  },
  settingsTextDark: {
    color: colors.primaryLight,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: 100,
  },
  greeting: {
    ...typography.headlineMedium,
    fontSize: 28,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  greetingDark: {
    color: colors.primaryLight,
  },
});
