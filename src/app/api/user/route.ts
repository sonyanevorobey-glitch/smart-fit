import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { calculateKbzhu } from '@/lib/calculations';
import { getSessionUserId } from '@/lib/auth';
import type { User } from '@/lib/types';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = await queryOne<User>('SELECT * FROM users WHERE id = $1', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const fields = ['name', 'gender', 'age', 'height', 'weight', 'goal_weight', 'goal_weeks',
      'activity_level', 'goal_type', 'onboarding_done', 'calories_norm', 'protein_norm', 'fat_norm', 'carbs_norm',
      'water_goal_ml', 'motivation', 'main_obstacle', 'food_preferences', 'meal_count'];
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    for (const field of fields) {
      if (body[field] !== undefined) { updates.push(`${field} = $${idx}`); values.push(body[field]); idx++; }
    }
    if (updates.length === 0) return NextResponse.json({ error: 'No fields' }, { status: 400 });
    values.push(userId);
    const [user] = await query<User>(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values);
    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();

    const norm = calculateKbzhu({
      gender: body.gender, age: Number(body.age), height: Number(body.height),
      weight: Number(body.weight), goal_weight: Number(body.goal_weight),
      goal_weeks: Number(body.goal_weeks), activity_level: body.activity_level, goal_type: body.goal_type,
    });
    const [user] = await query<User>(
      `UPDATE users SET name=$1,gender=$2,age=$3,height=$4,weight=$5,goal_weight=$6,goal_weeks=$7,
        activity_level=$8,goal_type=$9,calories_norm=$10,protein_norm=$11,fat_norm=$12,carbs_norm=$13,
        onboarding_done=true,water_goal_ml=$14,motivation=$15,main_obstacle=$16,food_preferences=$17,meal_count=$18
        WHERE id=$19 RETURNING *`,
      [body.name, body.gender, body.age, body.height, body.weight, body.goal_weight, body.goal_weeks,
       body.activity_level, body.goal_type, norm.calories, norm.protein, norm.fat, norm.carbs,
       body.water_goal_ml ?? 2000, body.motivation ?? null, body.main_obstacle ?? null,
       body.food_preferences ?? '', body.meal_count ?? 4, userId]
    );

    // Onboarding = fresh start: always wipe all historical data so no demo/stale data shows
    await Promise.all([
      query('DELETE FROM food_logs WHERE user_id=$1', [userId]),
      query('DELETE FROM weight_logs WHERE user_id=$1', [userId]),
      query('DELETE FROM meal_plans WHERE user_id=$1', [userId]),
      query('DELETE FROM chat_messages WHERE user_id=$1', [userId]),
      query('DELETE FROM water_logs WHERE user_id=$1', [userId]),
    ]);

    return NextResponse.json(user);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
