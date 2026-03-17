import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSessionUserId } from '@/lib/auth';

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, imageBase64, mimeType } = await req.json();
    if (!description && !imageBase64) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const textPrompt = `Ты нутрициолог. Оцени КБЖУ для следующего блюда или еды.
${description ? `Описание: "${description}"` : 'Смотри на фото блюда.'}

Верни ТОЛЬКО JSON без дополнительного текста:
{
  "name": "Название блюда (короткое, 2-4 слова на русском)",
  "calories": 350,
  "protein": 25.0,
  "fat": 12.0,
  "carbs": 30.0,
  "weight_grams": 300
}

Правила:
- Оценивай среднюю/стандартную порцию если размер не указан явно
- calories — целое число
- protein, fat, carbs — округли до 1 знака после запятой
- weight_grams — типичный вес порции в граммах
- Все значения реалистичные для одной порции
- name — короткое русское название`;

    type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

    const content: Anthropic.MessageParam['content'] = imageBase64
      ? [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: (mimeType ?? 'image/jpeg') as ImageMediaType,
              data: imageBase64,
            },
          },
          { type: 'text', text: textPrompt },
        ]
      : textPrompt;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleaned = text.replace(/^```[a-z]*\n?/m, '').replace(/\n?```$/m, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      const fixed = jsonMatch[0].replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, ' ');
      parsed = JSON.parse(fixed);
    }
    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
