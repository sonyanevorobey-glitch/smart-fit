import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const rows = await query<{ date: string; total_calories: number; total_protein: number; total_fat: number; total_carbs: number }>(
      `SELECT date,
        SUM(calories)::integer AS total_calories,
        ROUND(SUM(protein)::numeric,1) AS total_protein,
        ROUND(SUM(fat)::numeric,1) AS total_fat,
        ROUND(SUM(carbs)::numeric,1) AS total_carbs
       FROM food_logs WHERE user_id=$1
       GROUP BY date ORDER BY date DESC LIMIT 30`,
      [userId]
    );
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
