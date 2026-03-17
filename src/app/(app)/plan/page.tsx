'use client';
import { useEffect, useState, useCallback } from 'react';
import NavBar from '@/components/NavBar';
import RecipeModal from '@/components/RecipeModal';
import type { User, MealPlan, MealPlanItem } from '@/lib/types';
import { getFoodEmoji } from '@/lib/foodEmoji';

const MEAL_LABELS: Record<string, string> = { breakfast: 'Завтрак', lunch: 'Обед', dinner: 'Ужин', snack: 'Перекус' };
const MEAL_EMOJIS: Record<string, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' };
const MEAL_BG: Record<string, { bg: string; border: string; color: string }> = {
  breakfast: { bg: '#FFF3DC', border: '#FDE68A', color: '#92400E' },
  lunch:     { bg: '#DCFCE7', border: '#BBF7D0', color: '#166534' },
  dinner:    { bg: '#DBEAFE', border: '#BFDBFE', color: '#1E40AF' },
  snack:     { bg: '#F3E8FF', border: '#E9D5FF', color: '#6B21A8' },
};
const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

function isoDate(d: Date) { return d.toISOString().split('T')[0]; }

export default function PlanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [recipeItem, setRecipeItem] = useState<MealPlanItem | null>(null);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow'>('today');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([fetch('/api/user'), fetch(`/api/meal-plan?date=${isoDate(date)}`)]);
      setUser(await uRes.json());
      const pData = await pRes.json();
      setPlan(pData);
    } finally { setLoading(false); }
  }, [date]);

  useEffect(() => { loadData(); }, [loadData]);

  const switchDate = (which: 'today' | 'tomorrow') => {
    setSelectedDate(which);
    const d = new Date();
    if (which === 'tomorrow') d.setDate(d.getDate() + 1);
    setDate(d);
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/meal-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: isoDate(date) }),
      });
      const data = await res.json();
      if (data.error) alert('Ошибка: ' + data.error);
      else setPlan(data);
    } finally { setGenerating(false); }
  };

  const replaceMeal = async (mealIndex: number) => {
    setReplacingIndex(mealIndex);
    try {
      const res = await fetch('/api/meal-plan/replace', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: isoDate(date), meal_index: mealIndex }),
      });
      const data = await res.json();
      if (data.error) alert('Ошибка: ' + data.error);
      else setPlan(data);
    } finally { setReplacingIndex(null); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }} className="animate-float">📋</div>
      <div className="spinner" />
    </div>
  );

  const groupedMeals = plan
    ? MEAL_ORDER.reduce((acc, mt) => {
        acc[mt] = (plan.meals as MealPlanItem[]).filter(m => m.meal_type === mt);
        return acc;
      }, {} as Record<string, MealPlanItem[]>)
    : {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 28 }}>📋</span>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>План питания</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 16 }}>AI подберёт меню под твою норму {user?.calories_norm} ккал</p>

        {/* Date toggle */}
        <div style={{
          display: 'flex', background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 4, gap: 4,
        }}>
          {(['today', 'tomorrow'] as const).map(d => (
            <button key={d} onClick={() => switchDate(d)} style={{
              flex: 1, padding: '9px 0', borderRadius: 10,
              background: selectedDate === d ? 'var(--surface)' : 'transparent',
              border: selectedDate === d ? '1px solid var(--amber-border)' : '1px solid transparent',
              cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
              color: selectedDate === d ? 'var(--amber)' : 'var(--muted)',
              transition: 'all 0.2s',
              boxShadow: selectedDate === d ? 'var(--shadow-sm)' : 'none',
            }}>
              {d === 'today' ? '☀️ Сегодня' : '🌙 Завтра'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* Empty state */}
        {!plan && !generating && (
          <div className="card food-pattern animate-fade-up" style={{ textAlign: 'center', padding: '40px 24px', borderStyle: 'dashed', borderColor: 'var(--amber-border)' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }} className="animate-float">🍽️</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
              Нет плана на {selectedDate === 'today' ? 'сегодня' : 'завтра'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
              AI-нутрициолог составит план из 4 приёмов пищи<br />
              суммарно <strong>{user?.calories_norm} ккал</strong> — Б: {user?.protein_norm}г · Ж: {user?.fat_norm}г · У: {user?.carbs_norm}г
            </p>
            <button className="btn-primary" style={{ width: '100%', fontSize: 15, padding: '14px' }} onClick={generate}>
              ✨ Сгенерировать план
            </button>
          </div>
        )}

        {/* Generating */}
        {generating && (
          <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '48px 24px', borderColor: 'var(--amber-border)', background: 'var(--amber-light)' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }} className="animate-float">🤖</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
              AI составляет твой план...
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Подбираем блюда под твою норму КБЖУ
            </div>
            <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--amber)' }} />
          </div>
        )}

        {/* Plan */}
        {plan && !generating && (
          <div className="animate-fade-up">
            {/* Summary */}
            <div className="card" style={{ marginBottom: 14, borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, color: 'var(--amber)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.07em' }}>🧮 Итого по плану</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>Норма: {user?.calories_norm} ккал</div>
                </div>
                <div style={{ textAlign: 'right', background: 'var(--amber-light)', borderRadius: 12, padding: '8px 14px', border: '1px solid var(--amber-border)' }}>
                  <div style={{ fontSize: 30, fontFamily: 'Syne', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{plan.total_calories}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ккал</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: '🥩 Белки', value: plan.total_protein, norm: user?.protein_norm, bg: 'var(--green-light)', border: '#BBF7D0', color: 'var(--green)' },
                  { label: '🧈 Жиры', value: plan.total_fat, norm: user?.fat_norm, bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
                  { label: '🍞 Углеводы', value: plan.total_carbs, norm: user?.carbs_norm, bg: 'var(--blue-light)', border: '#BFDBFE', color: 'var(--blue)' },
                ].map(({ label, value, norm, bg, border, color }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontFamily: 'Syne', fontWeight: 800, color }}>{value}г</div>
                    <div style={{ fontSize: 9, color: 'var(--text-secondary)', marginTop: 1 }}>из {norm}г</div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Meals */}
            {(() => {
              const allMeals = plan ? (plan.meals as MealPlanItem[]) : [];
              return MEAL_ORDER.map(mt => {
                const items = groupedMeals[mt] ?? [];
                if (items.length === 0) return null;
                const style = MEAL_BG[mt];
                return (
                  <div key={mt} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 18 }}>{MEAL_EMOJIS[mt]}</span>
                      <span className={`badge-${mt}`} style={{
                        fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        padding: '3px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.07em',
                      }}>{MEAL_LABELS[mt]}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>
                        {items.reduce((s, m) => s + m.calories, 0)} ккал
                      </span>
                    </div>
                    {items.map((item) => {
                      const globalIndex = allMeals.indexOf(item);
                      const isReplacing = replacingIndex === globalIndex;
                      return (
                        <div key={globalIndex} className="card" style={{ padding: '12px 14px', marginBottom: 6, borderLeft: `3px solid ${style.color}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => setRecipeItem(item)} style={{
                              width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                              background: style.bg, border: `1.5px solid ${style.border}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 22, cursor: 'pointer', transition: 'transform 0.15s',
                            }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.12)'; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                              title="Открыть рецепт"
                            >
                              {getFoodEmoji(item.name)}
                            </button>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                                🥩 {item.protein}г · 🧈 {item.fat}г · 🍞 {item.carbs}г
                                {item.weight_grams ? ` · ${item.weight_grams}г` : ''}
                              </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                              <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: style.color, whiteSpace: 'nowrap' }}>
                                {item.calories} ккал
                              </span>
                              <button
                                onClick={() => replaceMeal(globalIndex)}
                                disabled={isReplacing || replacingIndex !== null}
                                style={{
                                  padding: '3px 8px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                                  background: isReplacing ? 'var(--surface2)' : 'var(--surface)',
                                  border: '1px solid var(--border)',
                                  color: 'var(--muted)', cursor: isReplacing ? 'default' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                                }}
                                title="Заменить блюдо"
                              >
                                {isReplacing
                                  ? <><span className="spinner" style={{ width: 10, height: 10 }} /> замена...</>
                                  : '🔄 заменить'}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              });
            })()}

            <button className="btn-secondary" style={{ width: '100%', marginTop: 8 }} onClick={generate} disabled={generating}>
              🔄 Перегенерировать план
            </button>
          </div>
        )}
      </div>

      {recipeItem && (
        <RecipeModal
          dishName={recipeItem.name}
          calories={recipeItem.calories}
          protein={recipeItem.protein}
          fat={recipeItem.fat}
          carbs={recipeItem.carbs}
          weight_grams={recipeItem.weight_grams}
          foodEmoji={getFoodEmoji(recipeItem.name)}
          onClose={() => setRecipeItem(null)}
        />
      )}

      <NavBar />
    </div>
  );
}
