'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkGoalFeasibility } from '@/lib/calculations';
import type { ActivityLevel, GoalType } from '@/lib/calculations';

const TOTAL_STEPS = 8;

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '🪑 Сидячий', desc: 'Нет тренировок, работа за столом' },
  { value: 'light', label: '🚶 Лёгкая', desc: '1–2 тренировки в неделю' },
  { value: 'moderate', label: '🏃 Умеренная', desc: '3–5 тренировок в неделю' },
  { value: 'active', label: '💪 Высокая', desc: '6–7 тренировок в неделю' },
  { value: 'very_active', label: '🔥 Очень высокая', desc: 'Ежедневные интенсивные тренировки' },
];

const MOTIVATION_OPTIONS = [
  { value: 'event', label: '🎉 Готовлюсь к событию', desc: 'Свадьба, отпуск, встреча' },
  { value: 'health', label: '🩺 Здоровье', desc: 'Советы врача или профилактика' },
  { value: 'energy', label: '⚡ Энергия и самочувствие', desc: 'Хочу чувствовать себя лучше' },
  { value: 'sport', label: '🏅 Спортивные результаты', desc: 'Улучшить форму и силу' },
  { value: 'look', label: '✨ Внешний вид', desc: 'Хочу нравиться себе в зеркале' },
  { value: 'habit', label: '🌱 Здоровые привычки', desc: 'Системный подход к питанию' },
];

const OBSTACLE_OPTIONS = [
  { value: 'cravings', label: '🍕 Срываюсь на еде', desc: 'Тяжело устоять перед вкусным' },
  { value: 'notime', label: '⏰ Нет времени готовить', desc: 'Напряжённый график' },
  { value: 'noknowledge', label: '🤷 Не знаю что есть', desc: 'Не разбираюсь в питании' },
  { value: 'motivation', label: '😴 Теряю мотивацию', desc: 'Сбиваюсь через 1–2 недели' },
  { value: 'first', label: '🆕 Впервые пробую', desc: 'Не было препятствий — пока не пробовал' },
];

const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🥗 Вегетарианец' },
  { value: 'vegan', label: '🌿 Веган' },
  { value: 'no_gluten', label: '🌾 Без глютена' },
  { value: 'no_dairy', label: '🥛 Без молочного' },
  { value: 'halal', label: '☪️ Халяль' },
  { value: 'no_pork', label: '🐷 Без свинины' },
];

const MEAL_COUNT_OPTIONS = [
  { value: 3, label: '3 приёма', desc: 'Завтрак · Обед · Ужин' },
  { value: 4, label: '4 приёма', desc: 'Завтрак · Обед · Ужин · Перекус' },
  { value: 5, label: '5 приёмов', desc: 'Дробное питание' },
];

const WATER_PRESETS = [1500, 2000, 2500, 3000];

interface FormState {
  name: string;
  gender: 'male' | 'female';
  motivation: string;
  main_obstacle: string;
  diet_tags: string[];
  disliked_foods: string;
  meal_count: number;
  age: string;
  height: string;
  weight: string;
  goal_type: GoalType;
  goal_weight: string;
  goal_weeks: string;
  activity_level: ActivityLevel;
  water_goal_ml: number;
}

interface KbzhuResult { calories: number; protein: number; fat: number; carbs: number; }

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [norm, setNorm] = useState<KbzhuResult | null>(null);
  const [feasibilityError, setFeasibilityError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: '', gender: 'male',
    motivation: '', main_obstacle: '',
    diet_tags: [], disliked_foods: '',
    meal_count: 4,
    age: '', height: '', weight: '',
    goal_type: 'lose', goal_weight: '', goal_weeks: '12',
    activity_level: 'moderate',
    water_goal_ml: 2000,
  });

  // Pre-fill from existing user data
  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then(u => {
      if (!u || u.error) return;
      setForm(f => ({
        ...f,
        name: u.name && u.name !== 'Пользователь' ? u.name : f.name,
        gender: u.gender ?? f.gender,
        motivation: u.motivation ?? f.motivation,
        main_obstacle: u.main_obstacle ?? f.main_obstacle,
        diet_tags: u.food_preferences ? u.food_preferences.split(',').filter(Boolean) : f.diet_tags,
        meal_count: u.meal_count ?? f.meal_count,
        age: u.age && u.age !== 25 ? String(u.age) : f.age,
        height: u.height && u.height !== 175 ? String(u.height) : f.height,
        weight: u.weight && u.weight !== 75 ? String(u.weight) : f.weight,
        goal_type: u.goal_type ?? f.goal_type,
        goal_weight: u.goal_weight && u.goal_weight !== 70 ? String(u.goal_weight) : f.goal_weight,
        goal_weeks: u.goal_weeks ? String(u.goal_weeks) : f.goal_weeks,
        activity_level: u.activity_level ?? f.activity_level,
        water_goal_ml: u.water_goal_ml ?? f.water_goal_ml,
      }));
    }).finally(() => setPrefilling(false));
  }, []);

  const set = (key: keyof FormState, value: unknown) => setForm(f => ({ ...f, [key]: value }));
  const toggleDiet = (tag: string) => setForm(f => ({
    ...f,
    diet_tags: f.diet_tags.includes(tag) ? f.diet_tags.filter(t => t !== tag) : [...f.diet_tags, tag],
  }));

  // Validate goal feasibility when relevant fields change
  const getFeasibility = () => {
    if (!form.age || !form.height || !form.weight || !form.goal_weight || form.goal_type !== 'lose') return null;
    return checkGoalFeasibility({
      gender: form.gender,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      goal_weight: Number(form.goal_weight),
      goal_weeks: Number(form.goal_weeks),
      activity_level: form.activity_level,
      goal_type: form.goal_type,
    });
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 0: return form.name.trim().length > 0;
      case 1: return !!form.motivation;
      case 2: return !!form.main_obstacle;
      // step 3: food prefs — optional, always can proceed
      case 4: return !!(form.age && form.height && form.weight);
      case 5: {
        if (!form.goal_weight) return false;
        if (form.goal_type === 'lose') {
          const f = getFeasibility();
          if (f?.isUnrealistic) return false;
        }
        return true;
      }
      default: return true;
    }
  };

  const next = async () => {
    if (step === 6) {
      // Calculate and show result
      setLoading(true);
      try {
        const foodPrefs = [
          ...form.diet_tags,
          ...(form.disliked_foods.trim() ? [`не люблю: ${form.disliked_foods.trim()}`] : []),
        ].join(', ');
        const res = await fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            food_preferences: foodPrefs,
            reset: true,
          }),
        });
        const data = await res.json();
        setNorm({ calories: data.calories_norm, protein: data.protein_norm, fat: data.fat_norm, carbs: data.carbs_norm });
        setStep(7);
      } finally { setLoading(false); }
      return;
    }
    setFeasibilityError(null);
    setStep(s => s + 1);
  };

  const pct = ((step + 1) / TOTAL_STEPS) * 100;

  const STEP_META = [
    { emoji: '👋', title: 'Давай познакомимся', subtitle: 'Расскажи о себе — это займёт пару минут' },
    { emoji: '💭', title: 'Что тебя движет?', subtitle: 'Помогает сделать план максимально личным' },
    { emoji: '🧱', title: 'Что мешало раньше?', subtitle: 'Честно — чтобы мы это учли в плане' },
    { emoji: '🍽️', title: 'Предпочтения в еде', subtitle: 'Чтобы AI не предлагал то, что ты не ешь' },
    { emoji: '📏', title: 'Твои параметры', subtitle: 'Для точного расчёта нормы КБЖУ' },
    { emoji: '🎯', title: 'Твоя цель', subtitle: 'Куда хочешь прийти и за какой срок' },
    { emoji: '🏃', title: 'Активность и режим', subtitle: 'Влияет на дневной расход калорий' },
    { emoji: '🎉', title: 'Твоя норма готова!', subtitle: 'Рассчитана по формуле Миффлина–Сан Жеора' },
  ];

  const feasibility = step === 5 ? getFeasibility() : null;

  if (prefilling) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 0', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 22 }}>🥗</span>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--amber)' }}>Smart-Fit</span>
          <span style={{ color: 'var(--border)', fontSize: 16, margin: '0 4px' }}>·</span>
          <span style={{ color: 'var(--muted)', fontSize: 13 }}>шаг {step + 1} из {TOTAL_STEPS}</span>
        </div>
        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden', marginBottom: 18 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, var(--amber), #F59E0B)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, paddingBottom: 18 }}>
          <span style={{ fontSize: 34, lineHeight: 1 }}>{STEP_META[step].emoji}</span>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 3, lineHeight: 1.2 }}>{STEP_META[step].title}</h1>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{STEP_META[step].subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>

        {/* Step 0: Name + Gender */}
        {step === 0 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Имя</label>
              <input className="input" placeholder="Алексей" value={form.name}
                onChange={e => set('name', e.target.value)} autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Пол</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {([['male', '👨 Мужской'], ['female', '👩 Женский']] as const).map(([g, label]) => (
                  <button key={g} onClick={() => set('gender', g)} style={{
                    padding: '14px', borderRadius: 14,
                    background: form.gender === g ? 'var(--amber-light)' : 'var(--surface)',
                    border: `1.5px solid ${form.gender === g ? 'var(--amber-border)' : 'var(--border)'}`,
                    color: form.gender === g ? 'var(--amber)' : 'var(--text)',
                    fontFamily: 'Syne', fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Motivation */}
        {step === 1 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MOTIVATION_OPTIONS.map(({ value, label, desc }) => (
              <button key={value} onClick={() => set('motivation', value)} style={{
                padding: '14px 16px', borderRadius: 14, textAlign: 'left',
                background: form.motivation === value ? 'var(--amber-light)' : 'var(--surface)',
                border: `1.5px solid ${form.motivation === value ? 'var(--amber-border)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: form.motivation === value ? 'var(--amber)' : 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 140, textAlign: 'right', lineHeight: 1.3 }}>{desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Obstacle */}
        {step === 2 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {OBSTACLE_OPTIONS.map(({ value, label, desc }) => (
              <button key={value} onClick={() => set('main_obstacle', value)} style={{
                padding: '14px 16px', borderRadius: 14, textAlign: 'left',
                background: form.main_obstacle === value ? 'var(--amber-light)' : 'var(--surface)',
                border: `1.5px solid ${form.main_obstacle === value ? 'var(--amber-border)' : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: form.main_obstacle === value ? 'var(--amber)' : 'var(--text)' }}>{label}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 140, textAlign: 'right', lineHeight: 1.3 }}>{desc}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Food preferences */}
        {step === 3 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, fontWeight: 600 }}>
                Диетические ограничения <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(можно несколько)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {DIET_OPTIONS.map(({ value, label }) => {
                  const active = form.diet_tags.includes(value);
                  return (
                    <button key={value} onClick={() => toggleDiet(value)} style={{
                      padding: '9px 14px', borderRadius: 20, fontSize: 13,
                      background: active ? 'var(--amber-light)' : 'var(--surface)',
                      border: `1.5px solid ${active ? 'var(--amber-border)' : 'var(--border)'}`,
                      color: active ? 'var(--amber)' : 'var(--text)',
                      fontWeight: active ? 700 : 400, cursor: 'pointer', transition: 'all 0.2s',
                    }}>{label}</button>
                  );
                })}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>
                Что не ешь или не любишь? <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(необязательно)</span>
              </label>
              <input className="input" placeholder="Например: печень, морепродукты, острое"
                value={form.disliked_foods} onChange={e => set('disliked_foods', e.target.value)} />
            </div>
            {form.diet_tags.length === 0 && !form.disliked_foods && (
              <div style={{
                padding: '12px 16px', borderRadius: 12,
                background: 'var(--surface2)', border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--muted)', textAlign: 'center',
              }}>
                Если нет ограничений — просто нажми «Далее» ✓
              </div>
            )}
          </div>
        )}

        {/* Step 4: Body params */}
        {step === 4 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'age', label: '🎂 Возраст', placeholder: '28', unit: 'лет' },
              { key: 'height', label: '📏 Рост', placeholder: '178', unit: 'см' },
              { key: 'weight', label: '⚖️ Текущий вес', placeholder: '82', unit: 'кг' },
            ].map(({ key, label, placeholder, unit }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type="number" placeholder={placeholder}
                    value={form[key as keyof FormState] as string}
                    onChange={e => set(key as keyof FormState, e.target.value)}
                    style={{ paddingRight: 52 }} />
                  <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13, fontWeight: 500 }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 5: Goal */}
        {step === 5 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Тип цели</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'lose', label: '📉 Похудение', desc: 'Дефицит калорий' },
                  { value: 'maintain', label: '⚖️ Поддержание', desc: 'Без изменений веса' },
                  { value: 'gain', label: '📈 Набор массы', desc: 'Профицит калорий' },
                ].map(({ value, label, desc }) => (
                  <button key={value} onClick={() => { set('goal_type', value); setFeasibilityError(null); }} style={{
                    padding: '14px 16px', borderRadius: 14, textAlign: 'left',
                    background: form.goal_type === value ? 'var(--amber-light)' : 'var(--surface)',
                    border: `1.5px solid ${form.goal_type === value ? 'var(--amber-border)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: form.goal_type === value ? 'var(--amber)' : 'var(--text)' }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>🎯 Целевой вес</label>
              <div style={{ position: 'relative' }}>
                <input className="input" type="number" placeholder={form.goal_type === 'lose' ? '75' : '85'}
                  value={form.goal_weight}
                  onChange={e => { set('goal_weight', e.target.value); setFeasibilityError(null); }}
                  style={{ paddingRight: 44 }} />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 13 }}>кг</span>
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>📅 Срок достижения</label>
              <select className="input" value={form.goal_weeks}
                onChange={e => { set('goal_weeks', e.target.value); setFeasibilityError(null); }}>
                {[4, 8, 12, 16, 20, 24, 36, 48].map(w => (
                  <option key={w} value={w}>{w} недель (~{Math.round(w / 4.3)} мес.)</option>
                ))}
              </select>
            </div>

            {/* Feasibility warning — blocking */}
            {feasibility?.isUnrealistic && (
              <div style={{
                padding: '16px', borderRadius: 14,
                background: '#FEF2F2', border: '1.5px solid #FECACA',
              }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>⚠️</span>
                  <div>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--red)', marginBottom: 4 }}>
                      Цель опасна для здоровья
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--red)', lineHeight: 1.5 }}>
                      Такой темп потребует {feasibility.rawCalories} ккал/день — ниже безопасного минимума {feasibility.minSafe} ккал.
                      Это грозит дефицитом питательных веществ и потерей мышц.
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#7F1D1D', fontWeight: 600, marginBottom: 8 }}>Безопасные варианты:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button onClick={() => { set('goal_weeks', String(feasibility.suggestedWeeks)); setFeasibilityError(null); }} style={{
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    background: 'var(--surface)', border: '1.5px solid #FECACA',
                    cursor: 'pointer', fontSize: 13, color: 'var(--red)',
                  }}>
                    ⏱ Увеличить срок до <strong>{feasibility.suggestedWeeks} недель</strong> (тот же целевой вес)
                  </button>
                  <button onClick={() => { set('goal_weight', String(feasibility.suggestedGoalWeight)); setFeasibilityError(null); }} style={{
                    padding: '10px 14px', borderRadius: 10, textAlign: 'left',
                    background: 'var(--surface)', border: '1.5px solid #FECACA',
                    cursor: 'pointer', fontSize: 13, color: 'var(--red)',
                  }}>
                    ⚖️ Скорректировать цель до <strong>{feasibility.suggestedGoalWeight} кг</strong> (тот же срок)
                  </button>
                </div>
              </div>
            )}
            {feasibilityError && (
              <div style={{ fontSize: 13, color: 'var(--red)', textAlign: 'center' }}>{feasibilityError}</div>
            )}
          </div>
        )}

        {/* Step 6: Activity + Meal count */}
        {step === 6 && (
          <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Уровень активности</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ACTIVITY_OPTIONS.map(({ value, label, desc }) => (
                  <button key={value} onClick={() => set('activity_level', value)} style={{
                    padding: '12px 16px', borderRadius: 14, textAlign: 'left',
                    background: form.activity_level === value ? 'var(--amber-light)' : 'var(--surface)',
                    border: `1.5px solid ${form.activity_level === value ? 'var(--amber-border)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, marginBottom: 2, color: form.activity_level === value ? 'var(--amber)' : 'var(--text)' }}>{label}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>🍽️ Сколько раз в день ешь?</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {MEAL_COUNT_OPTIONS.map(({ value, label, desc }) => (
                  <button key={value} onClick={() => set('meal_count', value)} style={{
                    padding: '12px 8px', borderRadius: 14, textAlign: 'center',
                    background: form.meal_count === value ? 'var(--amber-light)' : 'var(--surface)',
                    border: `1.5px solid ${form.meal_count === value ? 'var(--amber-border)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: form.meal_count === value ? 'var(--amber)' : 'var(--text)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', lineHeight: 1.3 }}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>💧 Дневная норма воды</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
                {WATER_PRESETS.map(ml => (
                  <button key={ml} onClick={() => set('water_goal_ml', ml)} style={{
                    padding: '10px 4px', borderRadius: 12, textAlign: 'center',
                    background: form.water_goal_ml === ml ? 'var(--blue-light)' : 'var(--surface)',
                    border: `1.5px solid ${form.water_goal_ml === ml ? '#93C5FD' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 15, color: form.water_goal_ml === ml ? 'var(--blue)' : 'var(--text)' }}>{ml / 1000}л</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{ml} мл</div>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
                💡 Норма: ~30–35 мл на кг веса ({form.weight ? Math.round(Number(form.weight) * 32 / 100) * 100 : 2000} мл для тебя)
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Result */}
        {step === 7 && norm && (
          <div className="animate-fade-up">
            <div className="card food-pattern" style={{
              marginBottom: 16, borderColor: 'var(--amber-border)',
              background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)', textAlign: 'center',
            }}>
              <div style={{ fontSize: 52, marginBottom: 8 }} className="animate-float">🎉</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Привет, {form.name}! Твоя норма:</div>
              <div style={{ fontSize: 64, fontFamily: 'Syne', fontWeight: 800, color: 'var(--amber)', lineHeight: 1, marginBottom: 4 }}>{norm.calories}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 20 }}>калорий в день</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { label: '🥩 Белки', value: norm.protein, bg: 'var(--green-light)', border: '#BBF7D0', color: 'var(--green)' },
                  { label: '🧈 Жиры', value: norm.fat, bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
                  { label: '🍞 Углеводы', value: norm.carbs, bg: 'var(--blue-light)', border: '#BFDBFE', color: 'var(--blue)' },
                ].map(({ label, value, bg, border, color }) => (
                  <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 6px' }}>
                    <div style={{ fontSize: 26, fontFamily: 'Syne', fontWeight: 800, color }}>{value}г</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--blue-light)', border: '1px solid #93C5FD', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>💧</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--blue)' }}>{(form.water_goal_ml / 1000).toFixed(1)}л</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>воды в день</div>
              </div>
              <div style={{ flex: 1, padding: '12px', borderRadius: 12, background: 'var(--green-light)', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>🍽️</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: 'var(--green)' }}>{form.meal_count}×</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>приёмов пищи</div>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center', lineHeight: 1.7 }}>
              Норма учитывает твою цель и уровень активности.<br />Ты всегда можешь изменить её в Настройках.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px max(20px, env(safe-area-inset-bottom))', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        {step < 7 ? (
          <button
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
            onClick={next}
            disabled={!canProceed() || loading}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Расчёт...</>
              : step === 6 ? '🧮 Рассчитать норму' : step === 3 ? (form.diet_tags.length === 0 && !form.disliked_foods ? 'Пропустить →' : 'Далее →') : 'Далее →'}
          </button>
        ) : (
          <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 15 }} onClick={() => router.push('/diary')}>
            🚀 Начать отслеживание!
          </button>
        )}
        {step > 0 && step < 7 && (
          <button className="btn-ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setStep(s => s - 1)}>
            ← Назад
          </button>
        )}
      </div>
    </div>
  );
}
