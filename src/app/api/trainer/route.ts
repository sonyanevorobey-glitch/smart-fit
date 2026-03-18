import { NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';
import type { User } from '@/lib/types';

const client = new OpenAI();

function repairJson(str: string): string {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];

    if (escaped) { result += ch; escaped = false; continue; }
    if (ch === '\\' && inString) { escaped = true; result += ch; continue; }

    if (ch === '"') {
      if (!inString) {
        inString = true;
        result += ch;
      } else {
        const rest = str.slice(i + 1).trimStart();
        if (/^[,\}\]:]/.test(rest) || rest === '') {
          inString = false;
          result += ch;
        } else {
          result += '\\"';
        }
      }
      continue;
    }

    result += ch;
  }
  return result;
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await queryOne<User>('SELECT * FROM users WHERE id=$1', [userId]);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { duration_min, location, equipment } = await req.json();

    const goalLabel = user.goal_type === 'lose' ? 'похудение' : user.goal_type === 'gain' ? 'набор мышечной массы' : 'поддержание формы';
    const equipmentStr = equipment?.length ? equipment.join(', ') : 'без инвентаря';
    const locationLabels: Record<string, string> = { home: 'дома', gym: 'в зале', outdoor: 'на улице/парке', beach: 'на пляже' };
    const locationStr = locationLabels[location] ?? location;

    const prompt = `Ты профессиональный персональный тренер. Составь тренировочный план.

Параметры пользователя:
- Пол: ${user.gender === 'male' ? 'мужской' : 'женский'}
- Вес: ${user.weight} кг
- Цель: ${goalLabel}
- Длительность: ${duration_min} минут
- Место: ${locationStr}
- Инвентарь/снаряжение: ${equipmentStr}

Верни ТОЛЬКО JSON строго такого формата (без markdown, без комментариев):
{
  "calories_burned": 280,
  "intensity": "средняя",
  "warmup": {
    "duration_min": 5,
    "description": "Описание разминки без кавычек внутри текста"
  },
  "exercises": [
    {
      "name": "Название упражнения",
      "emoji": "💪",
      "muscle_groups": ["группа1", "группа2"],
      "sets": 3,
      "reps": "12-15",
      "rest_seconds": 60,
      "technique": "Описание техники без кавычек внутри текста",
      "tip": "Совет без кавычек внутри текста",
      "calories_approx": 40
    }
  ],
  "cooldown": {
    "duration_min": 5,
    "description": "Описание заминки без кавычек внутри текста"
  }
}

Требования:
- 4-7 упражнений под место и инвентарь
- Реалистичные calories_burned (с учётом веса ${user.weight} кг и ${duration_min} минут)
- emoji должен ТОЧНО отражать упражнение
- technique — чёткие инструкции пошагово, БЕЗ кавычек внутри строки
- tip — БЕЗ кавычек внутри строки
- Все тексты на русском`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: 'Отвечай ТОЛЬКО чистым JSON без markdown, без кавычек внутри строковых значений.' },
        { role: 'user', content: prompt },
      ],
    });

    const text = message.choices[0].message.content ?? '';

    const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    const raw = jsonMatch[0];

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      try {
        parsed = JSON.parse(repairJson(raw));
      } catch {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
    }
    return NextResponse.json(parsed);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
