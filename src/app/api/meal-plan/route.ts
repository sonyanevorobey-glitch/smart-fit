import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';
import type { User, FoodLog, MealPlan } from '@/lib/types';

const client = new OpenAI();

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const plan = await queryOne<MealPlan>(
      'SELECT * FROM meal_plans WHERE user_id=$1 AND plan_date=$2 ORDER BY created_at DESC LIMIT 1',
      [userId, date]
    );
    return NextResponse.json(plan);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const date = body.date ?? new Date().toISOString().split('T')[0];

    const user = await queryOne<User>('SELECT * FROM users WHERE id=$1', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const logged = await query<FoodLog>('SELECT * FROM food_logs WHERE user_id=$1 AND date=$2', [userId, date]);
    const loggedCalories = logged.reduce((s, f) => s + f.calories, 0);
    const remaining = Math.max(0, user.calories_norm - loggedCalories);
    const goalLabel = user.goal_type === 'lose' ? 'похудение' : user.goal_type === 'gain' ? 'набор массы' : 'поддержание веса';
    const loggedSummary = logged.length > 0
      ? `Уже залогировано: ${logged.map(f => `${f.name} (${f.calories} ккал)`).join(', ')}. Осталось: ${remaining} ккал.`
      : `Ещё ничего не залогировано. Нужно создать план на ${user.calories_norm} ккал.`;
    const mealCount = user.meal_count ?? 4;
    const mealTypes = mealCount === 3 ? 'завтрак, обед, ужин' : mealCount === 5 ? 'завтрак, перекус, обед, ужин, перекус' : 'завтрак, обед, ужин, перекус';
    const prefNote = user.food_preferences ? `Предпочтения и ограничения пользователя: ${user.food_preferences}. Строго соблюдай их.` : '';

    const prompt = `Ты профессиональный нутрициолог. Составь план питания на один день.
Цель: ${goalLabel}
Дневная норма: ${user.calories_norm} ккал, белки ${user.protein_norm}г, жиры ${user.fat_norm}г, углеводы ${user.carbs_norm}г
${prefNote}
${loggedSummary}

${logged.length > 0 ? 'Добавь только недостающие приёмы пищи.' : `Составь ${mealCount} приёма пищи: ${mealTypes}.`}

Верни ТОЛЬКО JSON:
{
  "meals": [
    { "meal_type": "breakfast|lunch|dinner|snack", "name": "Название блюда", "calories": 350, "protein": 15, "fat": 10, "carbs": 45, "weight_grams": 250 }
  ]
}

Требования: простые блюда, сумма КБЖУ ±5% от нормы, названия на русском.`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o', max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    const { meals } = JSON.parse(jsonMatch[0]);
    const totalCalories = meals.reduce((s: number, m: { calories: number }) => s + m.calories, 0);
    const totalProtein = meals.reduce((s: number, m: { protein: number }) => s + m.protein, 0);
    const totalFat = meals.reduce((s: number, m: { fat: number }) => s + m.fat, 0);
    const totalCarbs = meals.reduce((s: number, m: { carbs: number }) => s + m.carbs, 0);

    await query('DELETE FROM meal_plans WHERE user_id=$1 AND plan_date=$2', [userId, date]);
    const [plan] = await query<MealPlan>(
      `INSERT INTO meal_plans (user_id, plan_date, meals, total_calories, total_protein, total_fat, total_carbs)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, date, JSON.stringify(meals), totalCalories, totalProtein, totalFat, totalCarbs]
    );
    return NextResponse.json(plan);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
