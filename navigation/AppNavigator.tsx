import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { loadUser, saveUser, destroyAllUserData } from '../services/storageService';
import type { User } from '../models/User';
import { colors, typography, spacing } from '../constants/theme';
import StartScreen from '../screens/StartScreen';
import SetupScreen from '../screens/SetupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type OnboardingStackParamList = {
  Start: undefined;
  Setup: undefined;
};

export type MainStackParamList = {
  Dashboard: { user: User };
  Settings: undefined;
  Profile: undefined;
};

const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    loadUser().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  const handleSetupComplete = (newUser: User) => {
    saveUser(newUser).then(() => setUser(newUser));
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, isDark && styles.loadingDark]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
          Loading…
        </Text>
      </View>
    );
  }

  if (user) {
    return (
      <MainStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
          animation: 'slide_from_right',
        }}
      >
        <MainStack.Screen name="Dashboard">
          {() => <DashboardScreen user={user} />}
        </MainStack.Screen>
        <MainStack.Screen name="Settings">
          {({ navigation }) => (
            <SettingsScreen
              onBack={() => navigation.goBack()}
              onDestroyProfile={async () => {
                await destroyAllUserData();
                setUser(null);
              }}
            />
          )}
        </MainStack.Screen>
        <MainStack.Screen name="Profile">
          {({ navigation }) => (
            <ProfileScreen
              user={user}
              onBack={() => navigation.goBack()}
              onSave={async (updatedUser) => {
                await saveUser(updatedUser);
                setUser(updatedUser);
                navigation.goBack();
              }}
            />
          )}
        </MainStack.Screen>
      </MainStack.Navigator>
    );
  }

  return (
    <OnboardingStack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDark ? colors.backgroundDark : colors.background },
        animation: 'slide_from_right',
      }}
    >
      <OnboardingStack.Screen name="Start">
        {({ navigation }) => (
          <StartScreen
            onGetStarted={() => navigation.navigate('Setup')}
          />
        )}
      </OnboardingStack.Screen>
      <OnboardingStack.Screen name="Setup">
        {() => <SetupScreen onComplete={handleSetupComplete} />}
      </OnboardingStack.Screen>
    </OnboardingStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingDark: {
    backgroundColor: colors.backgroundDark,
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.onSurface,
  },
  loadingTextDark: {
    color: colors.onSurfaceDark,
  },
});
