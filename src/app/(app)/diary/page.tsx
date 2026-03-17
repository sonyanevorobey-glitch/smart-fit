'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import MacroBar from '@/components/MacroBar';
import RecipeModal from '@/components/RecipeModal';
import type { User, FoodLog, MealPlan } from '@/lib/types';
import { getFoodEmoji } from '@/lib/foodEmoji';

const HEALTH_FACTS = [
  { emoji: '💧', text: 'Стакан воды за 20 минут до еды помогает съедать на 13% меньше калорий — желудок уже не пустой.' },
  { emoji: '🥦', text: 'Белки насыщают дольше всего: они замедляют опустошение желудка и держат уровень сахара стабильным.' },
  { emoji: '🌙', text: 'Поздние приёмы пищи (после 21:00) не прибавляют жир сами по себе — важен общий суточный баланс калорий.' },
  { emoji: '🏃', text: '150 минут умеренной активности в неделю снижают риск сердечно-сосудистых заболеваний на 35%.' },
  { emoji: '🥗', text: 'Клетчатка кормит полезные бактерии кишечника — 25–30 г в день достаточно для здорового микробиома.' },
  { emoji: '💪', text: 'Силовые тренировки повышают скорость метаболизма на 7–8% даже в состоянии покоя — мышцы сжигают больше калорий.' },
  { emoji: '🍳', text: 'Завтрак с белком (яйца, творог) снижает тягу к сладкому во второй половине дня.' },
  { emoji: '🎯', text: 'Есть медленно и без отвлечений — один из самых простых способов снизить потребление калорий на 10–15%.' },
  { emoji: '🫀', text: '30 минут ходьбы в быстром темпе сжигают столько же калорий, что и 15 минут лёгкого бега.' },
  { emoji: '🍫', text: 'Тёмный шоколад (от 70% какао) в умеренных количествах улучшает чувствительность к инсулину.' },
  { emoji: '😴', text: 'Недосып даже на 1–2 часа повышает уровень грелина (гормона голода) на 15% на следующий день.' },
  { emoji: '🥑', text: 'Жиры из авокадо, орехов и масел улучшают усвоение жирорастворимых витаминов A, D, E, K.' },
  { emoji: '⚡', text: 'Интервальные тренировки HIIT дают эффект дожигания калорий ещё 24–48 часов после занятия.' },
  { emoji: '🧘', text: 'Хронический стресс повышает кортизол, который стимулирует накопление жира в области живота.' },
  { emoji: '🍵', text: 'Зелёный чай содержит EGCG — антиоксидант, который усиливает жиросжигание при физической нагрузке.' },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};
const MEAL_EMOJIS: Record<string, string> = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }

interface AddFoodModal {
  open: boolean;
  meal_type: string;
  // AI input step
  aiText: string;
  aiStep: 'input' | 'confirm';
  aiLoading: boolean;
  aiError: string;
  // Editable КБЖУ (shown in confirm step)
  name: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  weight_grams: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState<AddFoodModal>({
    open: false, meal_type: 'breakfast',
    aiText: '', aiStep: 'input', aiLoading: false, aiError: '',
    name: '', calories: '', protein: '', fat: '', carbs: '', weight_grams: '',
  });
  const [saving, setSaving] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [weightMode, setWeightMode] = useState(false);
  const [recipeLog, setRecipeLog] = useState<FoodLog | null>(null);
  const [waterTotal, setWaterTotal] = useState(0);
  const [waterLogs, setWaterLogs] = useState<{ id: number; amount_ml: number }[]>([]);
  const [futurePlan, setFuturePlan] = useState<MealPlan | null | 'none'>('none');
  const [fact] = useState(() => HEALTH_FACTS[Math.floor(Math.random() * HEALTH_FACTS.length)]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const dateStr = isoDate(date);
      const isFuture = dateStr > isoDate(new Date());
      const requests: Promise<Response>[] = [
        fetch('/api/user'),
        fetch(`/api/food-logs?date=${dateStr}`),
        fetch(`/api/water-logs?date=${dateStr}`),
      ];
      if (isFuture) requests.push(fetch(`/api/meal-plan?date=${dateStr}`));

      const results = await Promise.all(requests);
      const u: User = await results[0].json();
      setUser(u);
      setLogs(await results[1].json());
      const waterData = await results[2].json();
      setWaterTotal(waterData.total ?? 0);
      setWaterLogs(waterData.logs ?? []);
      if (isFuture) {
        const plan = await results[3].json();
        setFuturePlan(plan && !plan.error ? plan : null);
      } else {
        setFuturePlan('none');
      }
      if (!u.onboarding_done) router.push('/onboarding');
    } finally { setLoading(false); }
  }, [date, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const totalCal = logs.reduce((s, l) => s + l.calories, 0);
  const totalPro = logs.reduce((s, l) => s + Number(l.protein), 0);
  const totalFat = logs.reduce((s, l) => s + Number(l.fat), 0);
  const totalCarbs = logs.reduce((s, l) => s + Number(l.carbs), 0);
  const remaining = Math.max(0, (user?.calories_norm ?? 0) - totalCal);
  const isOver = totalCal > (user?.calories_norm ?? 0);
  const pct = Math.min(100, Math.round((totalCal / (user?.calories_norm ?? 1)) * 100));

  const mealGroups = MEAL_ORDER.reduce((acc, mt) => {
    acc[mt] = logs.filter(l => l.meal_type === mt);
    return acc;
  }, {} as Record<string, FoodLog[]>);

  const openAdd = (meal_type: string) => setAddForm({
    open: true, meal_type,
    aiText: '', aiStep: 'input', aiLoading: false, aiError: '',
    name: '', calories: '', protein: '', fat: '', carbs: '', weight_grams: '',
  });
  const closeAdd = () => setAddForm(f => ({ ...f, open: false }));

  const analyzeFood = async (description?: string, imageBase64?: string, mimeType?: string) => {
    const text = description ?? addForm.aiText;
    if (!text && !imageBase64) return;
    setAddForm(f => ({ ...f, aiLoading: true, aiError: '' }));
    try {
      const res = await fetch('/api/food-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text || undefined, imageBase64, mimeType }),
      });
      const data = await res.json();
      if (data.error) {
        setAddForm(f => ({ ...f, aiLoading: false, aiError: 'Не удалось распознать блюдо' }));
        return;
      }
      setAddForm(f => ({
        ...f,
        aiLoading: false,
        aiStep: 'confirm',
        name: data.name ?? '',
        calories: String(data.calories ?? ''),
        protein: String(data.protein ?? ''),
        fat: String(data.fat ?? ''),
        carbs: String(data.carbs ?? ''),
        weight_grams: String(data.weight_grams ?? ''),
      }));
    } catch {
      setAddForm(f => ({ ...f, aiLoading: false, aiError: 'Ошибка сети' }));
    }
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      analyzeFood(undefined, base64, file.type);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };


  const saveFood = async () => {
    setSaving(true);
    try {
      await fetch('/api/food-logs', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meal_type: addForm.meal_type, name: addForm.name,
          calories: Number(addForm.calories), protein: Number(addForm.protein),
          fat: Number(addForm.fat), carbs: Number(addForm.carbs),
          weight_grams: addForm.weight_grams ? Number(addForm.weight_grams) : null,
          date: isoDate(date),
        }),
      });
      closeAdd(); loadData();
    } finally { setSaving(false); }
  };


  const deleteFood = async (id: number) => {
    await fetch(`/api/food-logs?id=${id}`, { method: 'DELETE' });
    loadData();
  };

  const saveWeight = async () => {
    if (!weightInput) return;
    await fetch('/api/weight-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight: Number(weightInput), date: isoDate(date) }),
    });
    setWeightMode(false); setWeightInput(''); loadData();
  };

  const addWater = async (ml: number) => {
    await fetch('/api/water-logs', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount_ml: ml, date: isoDate(date) }),
    });
    loadData();
  };

  const removeLastWater = async () => {
    const last = waterLogs[waterLogs.length - 1];
    if (!last) return;
    await fetch(`/api/water-logs?id=${last.id}`, { method: 'DELETE' });
    loadData();
  };

  const isToday = isoDate(date) === isoDate(new Date());
  const isFutureDate = isoDate(date) > isoDate(new Date());

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }} className="animate-float">🥗</div>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🥗</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--amber)' }}>Smart-Fit</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setDate(d => new Date(d.getTime() - 86400000))} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 18 }}>‹</button>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 90, textAlign: 'center', fontWeight: 500 }}>
            {isToday ? 'Сегодня' : isoDate(date) === isoDate(new Date(Date.now() + 86400000)) ? 'Завтра' : date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
          </span>
          <button onClick={() => setDate(d => new Date(d.getTime() + 86400000))} className="btn-ghost" style={{ padding: '6px 10px', fontSize: 18 }} disabled={isoDate(date) >= isoDate(new Date(Date.now() + 14 * 86400000))}>›</button>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* КБЖУ hero card */}
        <div className="card food-pattern animate-fade-up" style={{
          marginBottom: 12,
          borderColor: isOver ? 'var(--amber-border)' : 'var(--border)',
          background: isOver ? '#FFFBF0' : 'var(--surface)',
        }}>
          {/* Top row: big calorie + ring visual */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4, fontWeight: 500 }}>
                {isToday ? 'Сегодня съедено' : `${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}`}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 48, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: isOver ? 'var(--red)' : 'var(--text)', lineHeight: 1 }}>
                  {totalCal}
                </span>
                <span style={{ fontSize: 15, color: 'var(--muted)' }}>ккал</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>из {user?.calories_norm ?? 0}</div>
            </div>

            {/* Circle progress */}
            <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
              <svg viewBox="0 0 72 72" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
                <circle cx="36" cy="36" r="28" fill="none" stroke="var(--surface2)" strokeWidth="6" />
                <circle cx="36" cy="36" r="28" fill="none"
                  stroke={isOver ? 'var(--red)' : 'var(--amber)'}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.7s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: isOver ? 'var(--red)' : 'var(--amber)' }}>{pct}%</span>
              </div>
            </div>
          </div>

          {/* Remaining or over */}
          {!isOver ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--green-light)', borderRadius: 10, padding: '8px 12px',
              marginBottom: 14, border: '1px solid #BBF7D0',
            }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                Осталось {remaining} ккал — ты в норме!
              </span>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'var(--red-light)', borderRadius: 10, padding: '8px 12px',
              marginBottom: 14, border: '1px solid #FECACA',
            }}>
              <span style={{ fontSize: 18 }}>⚠️</span>
              <span style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
                Норма превышена на {totalCal - (user?.calories_norm ?? 0)} ккал
              </span>
            </div>
          )}

          {/* Macros */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <MacroBar label="🥩 Белки" current={totalPro} norm={user?.protein_norm ?? 0}
              color="var(--green)" bgColor="var(--green-light)" />
            <MacroBar label="🧈 Жиры" current={totalFat} norm={user?.fat_norm ?? 0}
              color="var(--amber)" bgColor="var(--amber-light)" />
            <MacroBar label="🍞 Углеводы" current={totalCarbs} norm={user?.carbs_norm ?? 0}
              color="var(--blue)" bgColor="var(--blue-light)" />
          </div>
        </div>

        {/* Weight logger */}
        {isToday && (
          <div className="card card-hover" style={{ marginBottom: 12, cursor: weightMode ? 'default' : 'pointer' }}
            onClick={() => !weightMode && setWeightMode(true)}>
            {weightMode ? (
              <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                <span style={{ fontSize: 22, alignSelf: 'center' }}>⚖️</span>
                <input className="input" type="number" step="0.1"
                  placeholder={String(user?.weight ?? 80)}
                  value={weightInput} onChange={e => setWeightInput(e.target.value)}
                  style={{ flex: 1 }} autoFocus
                  onKeyDown={e => e.key === 'Enter' && saveWeight()}
                />
                <button className="btn-primary" style={{ padding: '11px 16px', whiteSpace: 'nowrap' }} onClick={saveWeight}>
                  Сохранить
                </button>
                <button className="btn-ghost" style={{ padding: '11px 12px' }} onClick={() => setWeightMode(false)}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 28, lineHeight: 1 }}>⚖️</span>
                  <div>
                    <div style={{ fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>Записать вес</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Сейчас: {user?.weight} кг</div>
                  </div>
                </div>
                <span style={{ fontSize: 20, color: 'var(--amber)' }}>+</span>
              </div>
            )}
          </div>
        )}

        {/* Water tracker */}
        {(() => {
          const goal = user?.water_goal_ml ?? 2000;
          const pctWater = Math.min(100, Math.round((waterTotal / goal) * 100));
          const glassesLeft = Math.max(0, Math.ceil((goal - waterTotal) / 250));
          return (
            <div className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 22 }}>💧</span>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14 }}>Вода</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {(waterTotal / 1000).toFixed(2).replace(/\.?0+$/, '')}л из {(goal / 1000).toFixed(1)}л
                      {glassesLeft > 0 ? ` · ещё ${glassesLeft} стак.` : ' · цель достигнута! 🎯'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--blue)' }}>{pctWater}%</span>
                  {waterLogs.length > 0 && (
                    <button onClick={removeLastWater} style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: 6,
                      padding: '3px 7px', fontSize: 12, color: 'var(--muted)', cursor: 'pointer',
                    }} title="Отменить последнее">↩</button>
                  )}
                </div>
              </div>
              {/* Progress bar */}
              <div style={{ height: 6, background: 'var(--blue-light)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${pctWater}%`, background: 'var(--blue)', borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
              {/* Quick add buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[100, 200, 250, 300, 500].map(ml => (
                  <button key={ml} onClick={() => addWater(ml)} style={{
                    flex: 1, padding: '7px 2px', borderRadius: 10,
                    background: 'var(--blue-light)', border: '1px solid #BFDBFE',
                    color: 'var(--blue)', fontFamily: 'Syne', fontWeight: 700,
                    fontSize: 12, cursor: 'pointer', transition: 'all 0.15s',
                  }}>+{ml}</button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Future date: plan CTA or plan summary */}
        {isFutureDate && (
          <div style={{ marginBottom: 14 }}>
            {futurePlan && futurePlan !== 'none' ? (
              <a href="/plan" style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', background: 'var(--surface)',
                border: '1.5px solid var(--amber-border)', borderRadius: 16,
                textDecoration: 'none', color: 'var(--text)', transition: 'all 0.2s',
              }}>
                <span style={{ fontSize: 24 }}>📋</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--amber)' }}>
                    План на {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} готов
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                    {(futurePlan as MealPlan).total_calories} ккал · {(futurePlan as MealPlan).meals.length} блюд → посмотреть
                  </div>
                </div>
                <span style={{ color: 'var(--amber)', fontSize: 18 }}>›</span>
              </a>
            ) : futurePlan === null ? (
              <a href="/plan" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                padding: '16px', background: 'var(--amber-light)',
                border: '1.5px solid var(--amber-border)', borderRadius: 16,
                textDecoration: 'none', color: 'var(--amber)',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
              }}>
                <span style={{ fontSize: 20 }}>📋</span> Создать план на {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </a>
            ) : null}
          </div>
        )}

        {/* Meals */}
        {MEAL_ORDER.map(mt => (
          <div key={mt} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{MEAL_EMOJIS[mt]}</span>
                <span className={`badge-${mt}`} style={{
                  fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                  padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em',
                }}>{MEAL_LABELS[mt]}</span>
                {mealGroups[mt].length > 0 && (
                  <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                    {mealGroups[mt].reduce((s, l) => s + l.calories, 0)} ккал
                  </span>
                )}
              </div>
              <button onClick={() => openAdd(mt)} style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
                color: 'var(--amber)', fontSize: 18, lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', fontWeight: 700,
              }}>+</button>
            </div>

            {mealGroups[mt].length === 0 ? (
              <div style={{
                padding: '12px', borderRadius: 12, border: '1.5px dashed var(--border)',
                color: 'var(--muted)', fontSize: 13, textAlign: 'center',
                background: 'var(--surface2)',
              }}>
                Ничего не залогировано 🍽️
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {mealGroups[mt].map(log => (
                  <div key={log.id} className="card animate-fade-in" style={{
                    padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    {/* Food emoji */}
                    <button onClick={() => setRecipeLog(log)} style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      background: 'var(--amber-light)', border: '1.5px solid var(--amber-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                      boxShadow: 'none',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(232,137,12,0.25)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                      title="Открыть рецепт"
                    >
                      {getFoodEmoji(log.name)}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                        🥩 {Math.round(Number(log.protein))}г · 🧈 {Math.round(Number(log.fat))}г · 🍞 {Math.round(Number(log.carbs))}г
                        {log.weight_grams ? ` · ${log.weight_grams}г` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16,
                        color: 'var(--amber)', whiteSpace: 'nowrap',
                      }}>{log.calories} ккал</span>
                      <button onClick={() => deleteFood(log.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', fontSize: 16, padding: 2,
                        borderRadius: 6, transition: 'color 0.2s', lineHeight: 1,
                      }}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Plan CTA */}
        <a href="/plan" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '16px', background: 'var(--amber-light)',
          border: '1.5px solid var(--amber-border)', borderRadius: 16,
          textDecoration: 'none', color: 'var(--amber)',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
          transition: 'all 0.2s', marginBottom: 8,
          boxShadow: '0 2px 8px rgba(232,137,12,0.1)',
        }}>
          <span style={{ fontSize: 20 }}>📋</span> Составить план питания
        </a>

        {/* AI chat CTA */}
        <a href="/chat" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px', background: 'var(--green-light)',
          border: '1.5px solid #BBF7D0', borderRadius: 16,
          textDecoration: 'none', color: 'var(--green)',
          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
          transition: 'all 0.2s', marginBottom: 8,
        }}>
          <span style={{ fontSize: 20 }}>🥗</span> Спросить AI-нутрициолога
        </a>

        {/* Health fact */}
        <div style={{
          marginTop: 8, marginBottom: 8,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '14px 16px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 28, flexShrink: 0, lineHeight: 1.2 }}>{fact.emoji}</span>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>
              Факт дня
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{fact.text}</div>
          </div>
        </div>
      </div>

      {/* Recipe modal */}
      {recipeLog && (
        <RecipeModal
          dishName={recipeLog.name}
          calories={recipeLog.calories}
          protein={Number(recipeLog.protein)}
          fat={Number(recipeLog.fat)}
          carbs={Number(recipeLog.carbs)}
          weight_grams={recipeLog.weight_grams}
          foodEmoji={getFoodEmoji(recipeLog.name)}
          onClose={() => setRecipeLog(null)}
        />
      )}

      {/* Add food modal */}
      {addForm.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'flex-end',
        }} onClick={closeAdd}>
          <div style={{
            background: 'var(--surface)', borderRadius: '24px 24px 0 0',
            width: '100%', padding: '20px 20px 36px',
            border: '1px solid var(--border)', borderBottom: 'none',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.1)',
            maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 24 }}>{MEAL_EMOJIS[addForm.meal_type]}</span>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  {addForm.aiStep === 'confirm' ? addForm.name || 'Блюдо' : `${MEAL_LABELS[addForm.meal_type]}`}
                </h3>
              </div>
              <button onClick={closeAdd} className="btn-ghost" style={{ fontSize: 20 }}>×</button>
            </div>

            {/* ── STEP 1: AI INPUT ── */}
            {addForm.aiStep === 'input' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Text input */}
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                    ✨ Напиши что съел — AI сам посчитает КБЖУ
                  </label>
                  <textarea
                    className="input"
                    placeholder={'Тарелка борща со сметаной\nОвсянка на молоке 200г\nКофе с молоком'}
                    value={addForm.aiText}
                    onChange={e => setAddForm(f => ({ ...f, aiText: e.target.value }))}
                    rows={3}
                    autoFocus
                    style={{ resize: 'none', lineHeight: 1.6 }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && e.metaKey) analyzeFood();
                    }}
                  />
                </div>

                {/* Photo button */}
                <div>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '11px', borderRadius: 12, cursor: 'pointer',
                    background: 'var(--surface2)', border: '1.5px solid var(--border)',
                    fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)',
                    transition: 'all 0.2s',
                  }}>
                    <span style={{ fontSize: 20 }}>📷</span> Фото блюда
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhoto} />
                  </label>
                </div>

                {addForm.aiError && (
                  <div style={{ background: 'var(--red-light)', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--red)' }}>
                    ❌ {addForm.aiError}
                  </div>
                )}

                {/* Analyze button */}
                <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
                  onClick={() => analyzeFood()} disabled={!addForm.aiText || addForm.aiLoading}>
                  {addForm.aiLoading
                    ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Считаю КБЖУ...</>
                    : '✨ Посчитать калории'}
                </button>

                {/* Manual fallback */}
                <button onClick={() => setAddForm(f => ({ ...f, aiStep: 'confirm', name: f.aiText }))} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 4,
                }}>
                  Ввести КБЖУ вручную →
                </button>
              </div>
            )}

            {/* ── STEP 2: CONFIRM / EDIT ── */}
            {addForm.aiStep === 'confirm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* AI badge */}
                {addForm.aiText && (
                  <div style={{ background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 10, padding: '8px 12px', fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>✨</span>
                    <span>AI оценил по запросу: <strong>{addForm.aiText}</strong></span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>🍽️ Название блюда</label>
                  <input className="input" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>🔥 Калории</label>
                    <input className="input" type="number" value={addForm.calories} onChange={e => setAddForm(f => ({ ...f, calories: e.target.value }))} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>⚖️ Вес (г)</label>
                    <input className="input" type="number" value={addForm.weight_grams} onChange={e => setAddForm(f => ({ ...f, weight_grams: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'protein', label: '🥩 Белки, г' },
                    { key: 'fat', label: '🧈 Жиры, г' },
                    { key: 'carbs', label: '🍞 Углеводы' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                      <input className="input" type="number"
                        value={addForm[key as keyof AddFoodModal] as string}
                        onChange={e => setAddForm(f => ({ ...f, [key]: e.target.value }))} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-ghost" style={{ flex: 0, padding: '12px 16px', whiteSpace: 'nowrap' }}
                    onClick={() => setAddForm(f => ({ ...f, aiStep: 'input' }))}>
                    ← Назад
                  </button>
                  <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onClick={saveFood} disabled={!addForm.name || !addForm.calories || saving}>
                    {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Сохранение...</> : '✅ Добавить блюдо'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <NavBar />
    </div>
  );
}
