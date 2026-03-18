import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Укажи имя пользователя и пароль' }, { status: 400 });
    }
    if (username.length < 3) {
      return NextResponse.json({ error: 'Имя пользователя — минимум 3 символа' }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: 'Пароль — минимум 4 символа' }, { status: 400 });
    }

    const existing = await queryOne(
      'SELECT id FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    );
    if (existing) {
      return NextResponse.json({ error: 'Это имя пользователя уже занято' }, { status: 409 });
    }

    const [user] = await query<{ id: number }>(
      `INSERT INTO users (username, password_hash, name, gender, age, height, weight, goal_weight, goal_weeks,
        activity_level, goal_type, calories_norm, protein_norm, fat_norm, carbs_norm, onboarding_done)
       VALUES ($1, $2, $3, 'male', 25, 175, 75, 70, 12, 'moderate', 'lose', 1800, 120, 60, 200, false)
       RETURNING id`,
      [username.trim().toLowerCase(), hashPassword(password), username.trim()]
    );

    const res = NextResponse.json({ ok: true, onboarding_done: false });
    res.cookies.set('sf_uid', String(user.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 });
    return res;
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
