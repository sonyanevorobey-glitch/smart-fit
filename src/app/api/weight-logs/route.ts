import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import type { WeightLog } from '@/lib/types';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const logs = await query<WeightLog>(
      'SELECT * FROM weight_logs WHERE user_id=$1 ORDER BY date ASC',
      [userId]
    );
    return NextResponse.json(logs);
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
    const [log] = await query<WeightLog>(
      `INSERT INTO weight_logs (user_id, weight, date)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, date) DO UPDATE SET weight = EXCLUDED.weight
       RETURNING *`,
      [userId, body.weight, date]
    );
    await query('UPDATE users SET weight=$1 WHERE id=$2', [body.weight, userId]);
    return NextResponse.json(log);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
