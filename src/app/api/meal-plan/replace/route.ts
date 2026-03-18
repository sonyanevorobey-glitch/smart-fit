import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';
import type { User, MealPlan, MealPlanItem } from '@/lib/types';

const client = new OpenAI();

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { date, meal_index } = body;
    if (date === undefined || meal_index === undefined) {
      return NextResponse.json({ error: 'Missing date or meal_index' }, { status: 400 });
    }
    if (!Number.isInteger(meal_index) || meal_index < 0) {
      return NextResponse.json({ error: 'Invalid meal_index' }, { status: 400 });
    }

    const user = await queryOne<User>('SELECT * FROM users WHERE id=$1', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const plan = await queryOne<MealPlan>(
      'SELECT * FROM meal_plans WHERE user_id=$1 AND plan_date=$2 ORDER BY created_at DESC LIMIT 1',
      [userId, date]
    );
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const meals = plan.meals as MealPlanItem[];
    const targetMeal = meals[meal_index];
    if (!targetMeal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const goalLabel = user.goal_type === 'lose' ? 'похудение' : user.goal_type === 'gain' ? 'набор массы' : 'поддержание веса';
    const prefNote = user.food_preferences ? `Предпочтения и ограничения: ${user.food_preferences}.` : '';
    const otherMeals = meals.filter((_, i) => i !== meal_index);
    const otherCalories = otherMeals.reduce((s, m) => s + m.calories, 0);
    const targetCalories = user.calories_norm - otherCalories;

    const mealLabel: Record<string, string> = { breakfast: 'завтрак', lunch: 'обед', dinner: 'ужин', snack: 'перекус' };

    const prompt = `Ты профессиональный нутрициолог. Замени одно блюдо в плане питания.
Цель: ${goalLabel}
Дневная норма: ${user.calories_norm} ккал, Б: ${user.protein_norm}г, Ж: ${user.fat_norm}г, У: ${user.carbs_norm}г
${prefNote}

Приём пищи: ${mealLabel[targetMeal.meal_type] ?? targetMeal.meal_type}
Блюдо которое заменяем: ${targetMeal.name} (${targetMeal.calories} ккал)
Целевые калории для замены: ~${Math.max(100, targetCalories)} ккал

Другие блюда дня: ${otherMeals.map(m => `${m.name} (${m.calories} ккал)`).join(', ')}

Верни ТОЛЬКО JSON одного блюда (без массива):
{ "meal_type": "${targetMeal.meal_type}", "name": "Название блюда", "calories": 350, "protein": 15, "fat": 10, "carbs": 45, "weight_grams": 250 }

Требования: простое блюдо, ДРУГОЕ чем "${targetMeal.name}", название на русском, калории ±10% от целевых.`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o', max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    const newMeal: MealPlanItem = JSON.parse(jsonMatch[0]);
    const updatedMeals = [...meals];
    updatedMeals[meal_index] = newMeal;

    const totalCalories = updatedMeals.reduce((s, m) => s + m.calories, 0);
    const totalProtein = updatedMeals.reduce((s, m) => s + m.protein, 0);
    const totalFat = updatedMeals.reduce((s, m) => s + m.fat, 0);
    const totalCarbs = updatedMeals.reduce((s, m) => s + m.carbs, 0);

    const [updated] = await query<MealPlan>(
      `UPDATE meal_plans SET meals=$1, total_calories=$2, total_protein=$3, total_fat=$4, total_carbs=$5
       WHERE id=$6 RETURNING *`,
      [JSON.stringify(updatedMeals), totalCalories, totalProtein, totalFat, totalCarbs, plan.id]
    );
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
