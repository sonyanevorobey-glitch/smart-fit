import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSessionUserId } from '@/lib/auth';

const client = new OpenAI();

const cache = new Map<string, object>();

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, calories, protein, fat, carbs, weight_grams } = await req.json();
    if (!name) return NextResponse.json({ error: 'Missing name' }, { status: 400 });

    const cacheKey = name.toLowerCase().trim();
    if (cache.has(cacheKey)) return NextResponse.json(cache.get(cacheKey));

    const kbzhu = calories
      ? `КБЖУ: ${calories} ккал, Б: ${protein}г, Ж: ${fat}г, У: ${carbs}г${weight_grams ? `, ${weight_grams}г` : ''}`
      : '';

    const prompt = `Ты кулинарный эксперт. Дай рецепт блюда "${name}".
${kbzhu}

Верни ТОЛЬКО JSON без пояснений и markdown:
{
  "title": "Точное название блюда",
  "description": "Одна аппетитная фраза об этом блюде",
  "cook_time": 25,
  "servings": 1,
  "difficulty": "easy|medium|hard",
  "ingredients": [
    { "emoji": "🍗", "name": "Куриная грудка", "amount": "200", "unit": "г" }
  ],
  "steps": [
    "Шаг первый...",
    "Шаг второй..."
  ],
  "tip": "Совет повара (одно предложение)"
}

Требования:
- ingredients: 4–10 ингредиентов с подходящими эмодзи
- steps: 3–6 простых шагов
- Для готового блюда (не домашнего) укажи простой способ приготовить аналог дома
- cook_time в минутах
- Всё на русском языке`;

    const message = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.choices[0].message.content ?? '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    const recipe = JSON.parse(jsonMatch[0]);
    cache.set(cacheKey, recipe);

    return NextResponse.json(recipe);
  } catch (e) {
    console.error(e); return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
