import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, typography } from '../constants/theme';
import type { User } from '../models/User';
import type { MainStackParamList } from '../navigation/AppNavigator';
import GaiaChatBubble from '../components/GaiaChatBubble';
import GaiaChatModal from '../components/GaiaChatModal';
import ProfileIcon from '../components/ProfileIcon';
import SettingsIcon from '../components/SettingsIcon';
import WeatherSection from '../components/WeatherSection';
import CalendarSection from '../components/CalendarSection';
import EventsNotesSection from '../components/EventsNotesSection';
import UpcomingEventsBanner from '../components/UpcomingEventsBanner';
import DailyMotivationCard from '../components/DailyMotivationCard';
import { getDailyMotivationEnabled } from '../services/motivationService';
import { getDatesWithItems } from '../services/eventsNotesStorage';

type Props = {
  user: User;
};

type Nav = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

export default function DashboardScreen({ user }: Props) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [gaiaVisible, setGaiaVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [dailyMotivationEnabled, setDailyMotivationEnabled] = useState(false);
  const [datesWithItems, setDatesWithItems] = useState<string[]>([]);
  const navigation = useNavigation<Nav>();

  const headerStyle = {
    paddingTop: insets.top + spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  };

  useEffect(() => {
    const refresh = () => getDailyMotivationEnabled().then(setDailyMotivationEnabled);
    refresh();
    const unsub = navigation.addListener('focus', refresh);
    return unsub;
  }, [navigation]);

  const loadDatesWithItems = () => getDatesWithItems().then(setDatesWithItems);

  useEffect(() => {
    loadDatesWithItems();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardWrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={[styles.header, isDark && styles.headerDark, headerStyle]}>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ProfileIcon
              size={24}
              color={isDark ? colors.primaryLight : colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <SettingsIcon
              size={24}
              color={isDark ? colors.primaryLight : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
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
              datesWithItems={datesWithItems}
            />

            <EventsNotesSection
              selectedDate={selectedDate}
              onItemsChange={loadDatesWithItems}
            />
          </ScrollView>
        </TouchableWithoutFeedback>

        <GaiaChatBubble onPress={() => setGaiaVisible(true)} />
        <GaiaChatModal
          visible={gaiaVisible}
          onClose={() => setGaiaVisible(false)}
          user={user}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerDark: {
    backgroundColor: colors.backgroundDark,
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
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  profileBtn: { padding: spacing.xs },
  settingsBtn: { padding: spacing.xs },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 56,
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
