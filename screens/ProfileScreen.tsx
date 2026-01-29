import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import {
  LIFESTYLE_GOAL_OPTIONS,
  GENDER_OPTIONS,
  RACE_OPTIONS,
  DIET_OPTIONS,
  type User,
  type LifestyleGoalOption,
} from '../models/User';
import CountryPicker from '../components/CountryPicker';

function formatDateOfBirth(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

type Props = {
  user: User;
  onBack: () => void;
  onSave: (user: User) => Promise<void>;
};

const MAX_DATE = new Date();
const MIN_DATE = new Date();
MIN_DATE.setFullYear(MAX_DATE.getFullYear() - 120);

export default function ProfileScreen({ user, onBack, onSave }: Props) {
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [preferredUsername, setPreferredUsername] = useState(user.preferredUsername);
  const [dateOfBirth, setDateOfBirth] = useState<Date>(() => {
    if (user.dateOfBirth) {
      const d = new Date(user.dateOfBirth);
      return isNaN(d.getTime()) ? new Date(2000, 0, 1) : d;
    }
    return new Date(2000, 0, 1);
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<string | null>(user.gender ?? null);
  const [race, setRace] = useState<string | null>(user.race ?? null);
  const [country, setCountry] = useState(user.country ?? '');
  const [diet, setDiet] = useState<string | null>(user.diet ?? null);
  const [weight, setWeight] = useState(user.weight != null ? String(user.weight) : '');
  const [height, setHeight] = useState(user.height != null ? String(user.height) : '');
  const [selectedGoals, setSelectedGoals] = useState<string[]>(user.lifestyleGoals ?? []);
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goal: LifestyleGoalOption) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  const handleSave = async () => {
    if (!name.trim() || !surname.trim() || !preferredUsername.trim()) {
      Alert.alert('Missing fields', 'Name, surname and username are required.');
      return;
    }
    if (selectedGoals.length === 0) {
      Alert.alert('Goals required', 'Select at least one lifestyle goal.');
      return;
    }
    const weightNum = weight.trim() ? parseFloat(weight.trim()) : undefined;
    const heightNum = height.trim() ? parseFloat(height.trim()) : undefined;
    const updated: User = {
      ...user,
      name: name.trim(),
      surname: surname.trim(),
      preferredUsername: preferredUsername.trim(),
      dateOfBirth: toISODateString(dateOfBirth),
      lifestyleGoals: selectedGoals,
      gender: gender ?? undefined,
      race: race ?? undefined,
      country: country || undefined,
      diet: diet ?? undefined,
      weight: weightNum != null && !isNaN(weightNum) && weightNum > 0 && weightNum < 500 ? weightNum : undefined,
      height: heightNum != null && !isNaN(heightNum) && heightNum > 0 && heightNum < 300 ? heightNum : undefined,
    };
    setSaving(true);
    try {
      await onSave(updated);
      Alert.alert('Saved', 'Profile updated.');
    } catch {
      Alert.alert('Error', 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const isValid =
    name.trim().length > 0 &&
    surname.trim().length > 0 &&
    preferredUsername.trim().length > 0 &&
    selectedGoals.length > 0;

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
        <Text style={[styles.title, isDark && styles.titleDark]}>Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveHeaderBtn}
          disabled={!isValid || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text style={[styles.saveHeaderText, (!isValid || saving) && styles.saveHeaderTextDisabled]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={[styles.label, isDark && styles.textDark]}>Name</Text>
        <TextInput
          style={inputStyle}
          value={name}
          onChangeText={setName}
          placeholder="First name"
          placeholderTextColor={isDark ? '#888' : '#999'}
          autoCapitalize="words"
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Surname</Text>
        <TextInput
          style={inputStyle}
          value={surname}
          onChangeText={setSurname}
          placeholder="Last name"
          placeholderTextColor={isDark ? '#888' : '#999'}
          autoCapitalize="words"
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Preferred username</Text>
        <TextInput
          style={inputStyle}
          value={preferredUsername}
          onChangeText={setPreferredUsername}
          placeholder="How we call you"
          placeholderTextColor={isDark ? '#888' : '#999'}
          autoCapitalize="none"
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Date of birth</Text>
        <TouchableOpacity style={inputStyle} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
          <Text style={[styles.dateText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>
            {formatDateOfBirth(dateOfBirth)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={MAX_DATE}
            minimumDate={MIN_DATE}
            onChange={onDateChange}
          />
        )}
        {Platform.OS === 'ios' && showDatePicker && (
          <Pressable style={styles.doneBtn} onPress={() => setShowDatePicker(false)}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        )}
        <Text style={[styles.label, isDark && styles.textDark]}>Gender</Text>
        <View style={styles.chips}>
          {GENDER_OPTIONS.map((opt) => {
            const selected = gender === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? (isDark ? colors.chipSelectedDark : colors.chipSelected) : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0',
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setGender(selected ? null : opt)}
              >
                <Text style={[styles.chipText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.label, isDark && styles.textDark]}>Race / ethnicity</Text>
        <View style={styles.chips}>
          {RACE_OPTIONS.map((opt) => {
            const selected = race === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? (isDark ? colors.chipSelectedDark : colors.chipSelected) : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0',
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setRace(selected ? null : opt)}
              >
                <Text style={[styles.chipText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.label, isDark && styles.textDark]}>Country</Text>
        <CountryPicker
          value={country}
          onSelect={setCountry}
          placeholder="Select country"
          style={{ marginBottom: spacing.md }}
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Diet</Text>
        <View style={styles.chips}>
          {DIET_OPTIONS.map((opt) => {
            const selected = diet === opt;
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? (isDark ? colors.chipSelectedDark : colors.chipSelected) : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0',
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => setDiet(selected ? null : opt)}
              >
                <Text style={[styles.chipText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.label, isDark && styles.textDark]}>Weight (kg)</Text>
        <TextInput
          style={inputStyle}
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 70"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="decimal-pad"
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Height (cm)</Text>
        <TextInput
          style={inputStyle}
          value={height}
          onChangeText={setHeight}
          placeholder="e.g. 170"
          placeholderTextColor={isDark ? '#888' : '#999'}
          keyboardType="decimal-pad"
        />
        <Text style={[styles.label, isDark && styles.textDark]}>Lifestyle goals</Text>
        <View style={styles.chips}>
          {LIFESTYLE_GOAL_OPTIONS.map((opt) => {
            const selected = selectedGoals.includes(opt);
            return (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? (isDark ? colors.chipSelectedDark : colors.chipSelected) : isDark ? 'rgba(255,255,255,0.08)' : '#F0F0F0',
                    borderColor: selected ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => toggleGoal(opt)}
              >
                <Text style={[styles.chipText, { color: isDark ? colors.onSurfaceDark : colors.onSurface }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  containerDark: { backgroundColor: colors.backgroundDark },
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
  backBtn: { minWidth: 60 },
  backText: { ...typography.labelLarge, color: colors.primary },
  backTextDark: { color: colors.primaryLight },
  title: { ...typography.titleLarge, color: colors.onSurface },
  titleDark: { color: colors.onSurfaceDark },
  saveHeaderBtn: { minWidth: 60, alignItems: 'flex-end' },
  saveHeaderText: { ...typography.labelLarge, color: colors.primary, fontWeight: '600' },
  saveHeaderTextDisabled: { opacity: 0.5 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  label: { ...typography.labelLarge, color: colors.onSurface, marginBottom: spacing.xs },
  textDark: { color: colors.onSurfaceDark },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodyLarge,
    marginBottom: spacing.md,
  },
  dateText: { ...typography.bodyLarge },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: { ...typography.bodyMedium },
  doneBtn: { padding: spacing.md, alignItems: 'center' },
  doneBtnText: { ...typography.labelLarge, color: colors.primary },
});
