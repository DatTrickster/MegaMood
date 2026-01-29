/**
 * User profile model – stored offline in JSON (no cloud, no passwords).
 */
export interface User {
  name: string;
  surname: string;
  preferredUsername: string;
  lifestyleGoals: string[];
  dateOfBirth: string; // ISO date YYYY-MM-DD
  gender?: string;
  weight?: number; // kg, approx ok
  height?: number; // cm, approx ok
  completedAt: string; // ISO date when setup was completed
}

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say',
] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];

export const LIFESTYLE_GOAL_OPTIONS = [
  'Fitness',
  'Mindfulness',
  'Nutrition',
  'Sleep',
  'Social',
  'Productivity',
  'Creativity',
  'Learning',
  'Stress relief',
  'Habits',
] as const;

export type LifestyleGoalOption = (typeof LIFESTYLE_GOAL_OPTIONS)[number];
