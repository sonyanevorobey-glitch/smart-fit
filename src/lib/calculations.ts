export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type GoalType = 'lose' | 'maintain' | 'gain';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface UserParams {
  gender: 'male' | 'female';
  age: number;
  height: number; // cm
  weight: number; // kg
  goal_weight: number;
  goal_weeks: number;
  activity_level: ActivityLevel;
  goal_type: GoalType;
}

export interface KbzhuNorm {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export function calculateKbzhu(params: UserParams): KbzhuNorm {
  // Mifflin-St Jeor formula
  let bmr: number;
  if (params.gender === 'male') {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age + 5;
  } else {
    bmr = 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;
  }

  const tdee = bmr * ACTIVITY_MULTIPLIERS[params.activity_level];

  // Weekly deficit/surplus based on goal
  const weightDiff = params.goal_weight - params.weight;
  const weeklyChange = weightDiff / params.goal_weeks;
  // 1 kg of body weight ≈ 7700 kcal
  const dailyAdjustment = (weeklyChange * 7700) / 7;

  let calories = Math.round(tdee + dailyAdjustment);
  // Safety limits
  if (params.goal_type === 'lose') calories = Math.max(calories, 1200);
  if (params.goal_type === 'gain') calories = Math.min(calories, tdee + 500);

  // Macros: protein 30%, fat 25%, carbs 45% (standard split for weight goals)
  const protein = Math.round((calories * 0.30) / 4);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories * 0.45) / 4);

  return { calories, protein, fat, carbs };
}

export interface FeasibilityResult {
  isUnrealistic: boolean;
  rawCalories: number;
  minSafe: number;
  suggestedWeeks: number;
  suggestedGoalWeight: number;
}

export function checkGoalFeasibility(params: UserParams): FeasibilityResult {
  const bmr = params.gender === 'male'
    ? 10 * params.weight + 6.25 * params.height - 5 * params.age + 5
    : 10 * params.weight + 6.25 * params.height - 5 * params.age - 161;
  const tdee = bmr * ACTIVITY_MULTIPLIERS[params.activity_level];

  const weightDiff = params.goal_weight - params.weight;
  const weeklyChange = weightDiff / params.goal_weeks;
  const dailyAdjustment = (weeklyChange * 7700) / 7;
  const rawCalories = Math.round(tdee + dailyAdjustment);

  const minSafe = params.gender === 'male' ? 1500 : 1200;

  if (params.goal_type !== 'lose' || rawCalories >= minSafe) {
    return { isUnrealistic: false, rawCalories, minSafe, suggestedWeeks: params.goal_weeks, suggestedGoalWeight: params.goal_weight };
  }

  // How many weeks needed to lose same weight safely
  const safeWeeklyDeficit = (minSafe - tdee) * 7 / 7700; // negative = loss
  const suggestedWeeks = Math.ceil(Math.abs(weightDiff) / Math.abs(safeWeeklyDeficit));

  // How much weight can be lost in same timeline safely
  const safeWeightChange = safeWeeklyDeficit * params.goal_weeks;
  const suggestedGoalWeight = Math.round((params.weight + safeWeightChange) * 10) / 10;

  return { isUnrealistic: true, rawCalories, minSafe, suggestedWeeks, suggestedGoalWeight };
}

export function calcGoalProgress(currentWeight: number, goalWeight: number, startWeight: number): number {
  const total = Math.abs(startWeight - goalWeight);
  if (total === 0) return 100;
  const done = Math.abs(startWeight - currentWeight);
  return Math.min(100, Math.round((done / total) * 100));
}

export function weeksToGoal(currentWeight: number, goalWeight: number, avgWeeklyChange: number): number | null {
  if (avgWeeklyChange === 0) return null;
  const remaining = Math.abs(currentWeight - goalWeight);
  return Math.round(remaining / Math.abs(avgWeeklyChange));
}
