import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';

interface WorkoutLog {
  id: number;
  user_id: number;
  duration_min: number;
  location: string;
  equipment: string;
  result: object;
  created_at: string;
  date: string;
}

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await query<WorkoutLog>(
      'SELECT * FROM workout_logs WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
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

    const { duration_min, location, equipment, result } = await req.json();

    const log = await queryOne<WorkoutLog>(
      `INSERT INTO workout_logs (user_id, duration_min, location, equipment, result, date)
       VALUES ($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *`,
      [userId, duration_min, location, equipment, JSON.stringify(result)]
    );
    return NextResponse.json(log);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'No id' }, { status: 400 });

    await query('DELETE FROM workout_logs WHERE id=$1 AND user_id=$2', [id, userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
