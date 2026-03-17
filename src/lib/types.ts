export interface User {
  id: number;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  goal_weight: number;
  goal_weeks: number;
  activity_level: string;
  goal_type: 'lose' | 'maintain' | 'gain';
  calories_norm: number;
  protein_norm: number;
  fat_norm: number;
  carbs_norm: number;
  onboarding_done: boolean;
  water_goal_ml: number;
  motivation: string | null;
  main_obstacle: string | null;
  food_preferences: string;
  meal_count: number;
}

export interface WaterLog {
  id: number;
  user_id: number;
  amount_ml: number;
  logged_at: string;
  date: string;
}

export interface FoodLog {
  id: number;
  user_id: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight_grams: number | null;
  logged_at: string;
  date: string;
}

export interface WeightLog {
  id: number;
  user_id: number;
  weight: number;
  logged_at: string;
  date: string;
}

export interface MealPlan {
  id: number;
  user_id: number;
  plan_date: string;
  meals: MealPlanItem[];
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  created_at: string;
}

export interface MealPlanItem {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  weight_grams?: number;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface DaySummary {
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  meals: {
    breakfast: FoodLog[];
    lunch: FoodLog[];
    dinner: FoodLog[];
    snack: FoodLog[];
  };
}
