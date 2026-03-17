import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Укажи имя пользователя и пароль' }, { status: 400 });
    }

    const user = await queryOne<{ id: number; username: string; onboarding_done: boolean }>(
      'SELECT id, username, onboarding_done FROM users WHERE username = $1 AND password_hash = $2',
      [username.trim().toLowerCase(), hashPassword(password)]
    );

    if (!user) {
      return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true, onboarding_done: user.onboarding_done });
    res.cookies.set('sf_uid', String(user.id), { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60*60*24*30 });
    return res;
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
