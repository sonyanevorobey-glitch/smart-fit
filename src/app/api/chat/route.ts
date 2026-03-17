import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';
import Anthropic from '@anthropic-ai/sdk';
import { getSessionUserId } from '@/lib/auth';
import type { User, FoodLog, ChatMessage } from '@/lib/types';

const client = new Anthropic();

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const messages = await query<ChatMessage>(
      'SELECT * FROM chat_messages WHERE user_id=$1 ORDER BY created_at ASC LIMIT 50',
      [userId]
    );
    return NextResponse.json(messages);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { message: userMessage } = await req.json();

    await query('INSERT INTO chat_messages (user_id, role, content) VALUES ($1,$2,$3)', [userId, 'user', userMessage]);

    const user = await queryOne<User>('SELECT * FROM users WHERE id=$1', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await query<FoodLog>('SELECT * FROM food_logs WHERE user_id=$1 AND date=$2', [userId, today]);
    const todayCal = todayLogs.reduce((s, f) => s + f.calories, 0);
    const todayPro = todayLogs.reduce((s, f) => s + Number(f.protein), 0);
    const todayFat = todayLogs.reduce((s, f) => s + Number(f.fat), 0);
    const todayCarbs = todayLogs.reduce((s, f) => s + Number(f.carbs), 0);
    const goalLabel = user.goal_type === 'lose' ? 'похудение' : user.goal_type === 'gain' ? 'набор массы' : 'поддержание веса';

    const systemPrompt = `Ты персональный AI-нутрициолог в приложении Smart-Fit.

Профиль пользователя:
- Имя: ${user.name}
- Цель: ${goalLabel} (с ${user.weight} кг до ${user.goal_weight} кг за ${user.goal_weeks} недель)
- Норма КБЖУ: ${user.calories_norm} ккал | Б: ${user.protein_norm}г | Ж: ${user.fat_norm}г | У: ${user.carbs_norm}г

Сегодняшнее питание (${today}):
- Съедено: ${todayCal} ккал | Б: ${todayPro.toFixed(1)}г | Ж: ${todayFat.toFixed(1)}г | У: ${todayCarbs.toFixed(1)}г
- Осталось: ${Math.max(0, user.calories_norm - todayCal)} ккал
${todayLogs.length > 0 ? `- Блюда: ${todayLogs.map(f => `${f.name} (${f.calories} ккал)`).join(', ')}` : '- Ничего не залогировано'}

Отвечай кратко, конкретно, по-русски. Давай практичные советы с цифрами. Будь дружелюбным тренером.`;

    const history = await query<ChatMessage>(
      'SELECT role, content FROM chat_messages WHERE user_id=$1 ORDER BY created_at DESC LIMIT 10',
      [userId]
    );
    const messages: Anthropic.Messages.MessageParam[] = [
      ...history.reverse().slice(0, -1).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6', max_tokens: 512,
      system: systemPrompt, messages,
    });
    const assistantText = response.content[0].type === 'text' ? response.content[0].text : '';
    await query('INSERT INTO chat_messages (user_id, role, content) VALUES ($1,$2,$3)', [userId, 'assistant', assistantText]);

    return NextResponse.json({ message: assistantText });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await query('DELETE FROM chat_messages WHERE user_id=$1', [userId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
