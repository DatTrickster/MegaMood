import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  colors,
  spacing,
  typography,
  borderRadius,
} from '../constants/theme';
import {
  LIFESTYLE_GOAL_OPTIONS,
  GENDER_OPTIONS,
  type User,
  type LifestyleGoalOption,
} from '../models/User';

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
  onComplete: (user: User) => void;
};

const MAX_DATE = new Date();
const MIN_DATE = new Date();
MIN_DATE.setFullYear(MAX_DATE.getFullYear() - 120);

export default function SetupScreen({ onComplete }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [preferredUsername, setPreferredUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: LifestyleGoalOption) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) setDateOfBirth(selectedDate);
  };

  const handleSubmit = () => {
    if (!name.trim() || !surname.trim() || !preferredUsername.trim()) return;
    if (!dateOfBirth) return;
    if (selectedGoals.length === 0) return;

    const weightNum = weight.trim() ? parseFloat(weight.trim()) : undefined;
    const heightNum = height.trim() ? parseFloat(height.trim()) : undefined;

    const user: User = {
      name: name.trim(),
      surname: surname.trim(),
      preferredUsername: preferredUsername.trim(),
      lifestyleGoals: selectedGoals,
      dateOfBirth: toISODateString(dateOfBirth),
      completedAt: new Date().toISOString(),
    };
    if (gender) user.gender = gender;
    if (weightNum != null && !isNaN(weightNum) && weightNum > 0 && weightNum < 500) user.weight = weightNum;
    if (heightNum != null && !isNaN(heightNum) && heightNum > 0 && heightNum < 300) user.height = heightNum;
    onComplete(user);
  };

  const isValid =
    name.trim().length > 0 &&
    surname.trim().length > 0 &&
    preferredUsername.trim().length > 0 &&
    dateOfBirth !== null &&
    selectedGoals.length > 0;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F5F5F5',
      borderColor: isDark ? colors.outlineDark : '#E0E0E0',
      color: isDark ? colors.onSurfaceDark : colors.onSurface,
    },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, isDark && styles.containerDark]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FormContent
          isDark={isDark}
          inputStyle={inputStyle}
          name={name}
          setName={setName}
          surname={surname}
          setSurname={setSurname}
          preferredUsername={preferredUsername}
          setPreferredUsername={setPreferredUsername}
          dateOfBirth={dateOfBirth}
          onPressDate={() => setShowDatePicker(true)}
          gender={gender}
          setGender={setGender}
          weight={weight}
          setWeight={setWeight}
          height={height}
          setHeight={setHeight}
          selectedGoals={selectedGoals}
          toggleGoal={toggleGoal}
          isValid={isValid}
          handleSubmit={handleSubmit}
        />
      </ScrollView>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth ?? new Date(2000, 0, 1)}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={MAX_DATE}
          minimumDate={MIN_DATE}
          onChange={onDateChange}
        />
      )}
      {Platform.OS === 'ios' && showDatePicker && (
        <Pressable
          style={styles.doneButton}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      )}
    </KeyboardAvoidingView>
  );
}

type FormContentProps = {
  isDark: boolean;
  inputStyle: object;
  name: string;
  setName: (s: string) => void;
  surname: string;
  setSurname: (s: string) => void;
  preferredUsername: string;
  setPreferredUsername: (s: string) => void;
  dateOfBirth: Date | null;
  onPressDate: () => void;
  gender: string | null;
  setGender: (g: string | null) => void;
  weight: string;
  setWeight: (s: string) => void;
  height: string;
  setHeight: (s: string) => void;
  selectedGoals: string[];
  toggleGoal: (g: LifestyleGoalOption) => void;
  isValid: boolean;
  handleSubmit: () => void;
};

function FormContent({
  isDark,
  inputStyle,
  name,
  setName,
  surname,
  setSurname,
  preferredUsername,
  setPreferredUsername,
  dateOfBirth,
  onPressDate,
  gender,
  setGender,
  weight,
  setWeight,
  height,
  setHeight,
  selectedGoals,
  toggleGoal,
  isValid,
  handleSubmit,
}: FormContentProps) {
  return (
    <>
      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
        Persona setup
      </Text>

      <Text style={[styles.label, styles.labelFirst, isDark && styles.textDark]}>Name</Text>
      <TextInput
        style={[inputStyle, styles.inputSpaced]}
        value={name}
        onChangeText={setName}
        placeholder="First name"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E'}
        autoCapitalize="words"
      />

      <Text style={[styles.label, isDark && styles.textDark]}>Surname</Text>
      <TextInput
        style={[inputStyle, styles.inputSpaced]}
        value={surname}
        onChangeText={setSurname}
        placeholder="Last name"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E'}
        autoCapitalize="words"
      />

      <Text style={[styles.label, isDark && styles.textDark]}>
        Preferred username / nickname
      </Text>
      <TextInput
        style={[inputStyle, styles.inputSpaced]}
        value={preferredUsername}
        onChangeText={setPreferredUsername}
        placeholder="How we'll call you"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E'}
        autoCapitalize="none"
      />

      <Text style={[styles.label, isDark && styles.textDark]}>
        Date of birth
      </Text>
      <TouchableOpacity
        style={[inputStyle, styles.inputSpaced]}
        onPress={onPressDate}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dateText,
            {
              color: dateOfBirth
                ? isDark
                  ? colors.onSurfaceDark
                  : colors.onSurface
                : isDark
                  ? 'rgba(255,255,255,0.4)'
                  : '#9E9E9E',
            }]}
        >
          {dateOfBirth ? formatDateOfBirth(dateOfBirth) : 'Tap to pick date'}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, isDark && styles.textDark]}>Gender</Text>
      <View style={[styles.chips, styles.chipsSpaced]}>
        {GENDER_OPTIONS.map((opt) => {
          const selected = gender === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? isDark
                      ? colors.chipSelectedDark
                      : colors.chipSelected
                    : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#F0F0F0',
                  borderColor: selected ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setGender(selected ? null : opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isDark ? colors.onSurfaceDark : colors.onSurface },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={[styles.label, isDark && styles.textDark]}>Weight (approx.)</Text>
      <TextInput
        style={[inputStyle, styles.inputSpaced]}
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g. 70 kg"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E'}
        keyboardType="decimal-pad"
      />

      <Text style={[styles.label, isDark && styles.textDark]}>Height (approx.)</Text>
      <TextInput
        style={[inputStyle, styles.inputSpaced]}
        value={height}
        onChangeText={setHeight}
        placeholder="e.g. 175 cm"
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.4)' : '#9E9E9E'}
        keyboardType="decimal-pad"
      />

      <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark, { marginTop: spacing.lg }]}>
        Lifestyle goals
      </Text>
      <Text style={[styles.hint, isDark && styles.textDark]}>
        Choose one or more (required)
      </Text>
      <View style={styles.chips}>
        {LIFESTYLE_GOAL_OPTIONS.map((goal) => {
          const selected = selectedGoals.includes(goal);
          return (
            <TouchableOpacity
              key={goal}
              style={[
                styles.chip,
                {
                  backgroundColor: selected
                    ? isDark
                      ? colors.chipSelectedDark
                      : colors.chipSelected
                    : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : '#F0F0F0',
                  borderColor: selected ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => toggleGoal(goal)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isDark ? colors.onSurfaceDark : colors.onSurface },
                ]}
              >
                {goal}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Pressable
        style={[styles.button, !isValid && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={!isValid}
        android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
      >
        <Text style={styles.buttonText}>Continue to dashboard</Text>
      </Pressable>
    </>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  sectionTitle: {
    ...typography.titleLarge,
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  sectionTitleDark: {
    color: colors.primaryLight,
  },
  label: {
    ...typography.labelLarge,
    color: colors.onSurface,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  labelFirst: {
    marginTop: 0,
  },
  inputSpaced: {
    marginBottom: spacing.md,
  },
  chipsSpaced: {
    marginBottom: spacing.md,
  },
  hint: {
    ...typography.bodyMedium,
    color: colors.onSurface,
    opacity: 0.7,
    marginBottom: spacing.sm,
  },
  textDark: {
    color: colors.onSurfaceDark,
  },
  input: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    ...typography.bodyLarge,
  },
  dateText: {
    ...typography.bodyLarge,
  },
  doneButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  doneButtonText: {
    ...typography.labelLarge,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  chipText: {
    ...typography.labelLarge,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl + 8,
    minWidth: 220,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl + spacing.sm,
    elevation: 4,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...typography.labelLarge,
    fontSize: 17,
    fontWeight: '700',
    color: colors.onPrimary,
    letterSpacing: 0.3,
  },
});
