import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import type { WaterLog } from '@/lib/types';

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
    const logs = await query<WaterLog>(
      'SELECT * FROM water_logs WHERE user_id=$1 AND date=$2 ORDER BY logged_at ASC',
      [userId, date]
    );
    const total = logs.reduce((s, l) => s + l.amount_ml, 0);
    return NextResponse.json({ logs, total });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const date = body.date ?? new Date().toISOString().split('T')[0];
    const [log] = await query<WaterLog>(
      'INSERT INTO water_logs (user_id, amount_ml, date) VALUES ($1,$2,$3) RETURNING *',
      [userId, body.amount_ml, date]
    );
    return NextResponse.json(log);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await query('DELETE FROM water_logs WHERE id=$1 AND user_id=$2', [id, userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
