'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import type { User, WeightLog } from '@/lib/types';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '🪑 Сидячий', desc: 'Нет тренировок' },
  { value: 'light', label: '🚶 Лёгкая', desc: '1–2 раза/нед' },
  { value: 'moderate', label: '🏃 Умеренная', desc: '3–5 раз/нед' },
  { value: 'active', label: '💪 Высокая', desc: '6–7 раз/нед' },
  { value: 'very_active', label: '🔥 Очень высокая', desc: 'Каждый день интенсивно' },
];

interface DayHistory {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function LineChart({ data, color, bgColor }: { data: { date: string; value: number }[]; color: string; bgColor: string }) {
  if (data.length < 2) return (
    <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
      📊 Недостаточно данных
    </div>
  );
  const w = 300; const h = 80;
  const values = data.map(d => d.value);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / range) * h;
  const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
  const areaPoints = [`0,${h}`, ...data.map((d, i) => `${toX(i)},${toY(d.value)}`), `${w},${h}`].join(' ');
  const gradId = `g${color.replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 80, overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={toX(data.length - 1)} cy={toY(data[data.length - 1].value)} r="5" fill={color} stroke="white" strokeWidth="2" />
    </svg>
  );
}

function BarChart({ data, norm, color }: { data: { date: string; value: number }[]; norm: number; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), norm);
  const last7 = data.slice(-7);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
      {last7.map((d, i) => {
        const h = max > 0 ? (d.value / max) * 60 : 0;
        const isOver = d.value > norm;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: '100%', height: `${Math.max(h, d.value > 0 ? 4 : 0)}px`,
              background: isOver ? 'var(--red)' : color,
              borderRadius: '4px 4px 0 0', opacity: 0.85,
              transition: 'height 0.5s ease',
            }} />
            <span style={{ fontSize: 9, color: 'var(--muted)' }}>
              {new Date(d.date + 'T12:00:00').toLocaleDateString('ru-RU', { day: 'numeric' })}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [calHistory, setCalHistory] = useState<DayHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalForm, setGoalForm] = useState({ weight: '', goal_weight: '', goal_weeks: '12', goal_type: 'lose', activity_level: 'moderate' });
  const [manualNorm, setManualNorm] = useState({ calories: '', protein: '', fat: '', carbs: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/user').then(r => r.json()),
      fetch('/api/weight-logs').then(r => r.json()),
      fetch('/api/food-logs/history').then(r => r.json()),
    ]).then(([u, w, c]) => {
      setUser(u); setWeightLogs(w); setCalHistory(c); setLoading(false);
      setGoalForm({ weight: String(u.weight), goal_weight: String(u.goal_weight), goal_weeks: String(u.goal_weeks), goal_type: u.goal_type, activity_level: u.activity_level });
      setManualNorm({ calories: String(u.calories_norm), protein: String(u.protein_norm), fat: String(u.fat_norm), carbs: String(u.carbs_norm) });
    });
  }, []);

  const recalc = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user?.name, gender: user?.gender, age: user?.age, height: user?.height, ...goalForm }),
      });
      const u: User = await res.json();
      setUser(u);
      setManualNorm({ calories: String(u.calories_norm), protein: String(u.protein_norm), fat: String(u.fat_norm), carbs: String(u.carbs_norm) });
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const saveManual = async () => {
    setSaving(true);
    try {
      await fetch('/api/user', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calories_norm: Number(manualNorm.calories), protein_norm: Number(manualNorm.protein), fat_norm: Number(manualNorm.fat), carbs_norm: Number(manualNorm.carbs) }),
      });
      setShowManual(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }} className="animate-float">📈</div>
      <div className="spinner" />
    </div>
  );

  const latestWeight = Number(weightLogs[weightLogs.length - 1]?.weight ?? user?.weight ?? 0);
  const startWeight = Number(weightLogs[0]?.weight ?? user?.weight ?? 0);
  const goalWeight = Number(user?.goal_weight ?? 0);
  const totalToLose = Math.abs(startWeight - goalWeight);
  const lostSoFar = Math.abs(startWeight - latestWeight);
  const progressPct = totalToLose > 0 ? Math.min(100, Math.round((lostSoFar / totalToLose) * 100)) : 0;
  const remaining = Math.abs(latestWeight - goalWeight);

  let avgWeekly = 0;
  if (weightLogs.length >= 7) {
    const last7 = weightLogs.slice(-7);
    avgWeekly = (Number(last7[last7.length - 1].weight) - Number(last7[0].weight));
  }
  const weeksToGoal = avgWeekly !== 0 ? Math.round(remaining / Math.abs(avgWeekly)) : null;

  const last7Cal = calHistory.slice(0, 7);
  const avgCal = last7Cal.length > 0 ? Math.round(last7Cal.reduce((s, d) => s + d.total_calories, 0) / last7Cal.length) : 0;
  const weightData = weightLogs.map(w => ({ date: String(w.date).split('T')[0], value: Number(w.weight) }));
  const calData = [...calHistory].reverse().map(d => ({ date: String(d.date).split('T')[0], value: d.total_calories }));

  const isLosing = user?.goal_type === 'lose';
  const onTrack = isLosing ? latestWeight <= startWeight : latestWeight >= startWeight;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 0', borderBottom: '1px solid var(--border)', paddingBottom: 16, background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 28 }}>📈</span>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Мой прогресс</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>
          {weightLogs.length} дней наблюдений · {onTrack ? '✅ идёшь в нужном направлении' : '💪 продолжай, ты справишься'}
        </p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Goal hero */}
        <div className="card food-pattern animate-fade-up" style={{ borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne', fontWeight: 700, marginBottom: 6 }}>
                🎯 Цель
              </div>
              <div style={{ fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 800 }}>
                {latestWeight} <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 14 }}>кг</span>
                <span style={{ color: 'var(--muted)', fontSize: 20, margin: '0 10px' }}>→</span>
                <span style={{ color: 'var(--amber)' }}>{goalWeight}</span> <span style={{ color: 'var(--muted)', fontWeight: 400, fontSize: 14 }}>кг</span>
              </div>
            </div>
            <div style={{ textAlign: 'center', background: 'var(--amber-light)', borderRadius: 14, padding: '10px 16px', border: '1px solid var(--amber-border)' }}>
              <div style={{ fontSize: 32, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--amber)' }}>{progressPct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>выполнено</div>
            </div>
          </div>

          <div className="progress-bar" style={{ height: 10, marginBottom: 14, background: 'var(--amber-light)' }}>
            <div className="progress-fill" style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, var(--amber), #F59E0B)',
              boxShadow: '0 0 8px rgba(232,137,12,0.4)',
            }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: '📉 Потеряно', value: `${lostSoFar.toFixed(1)} кг`, bg: 'var(--green-light)', color: 'var(--green)', border: '#BBF7D0' },
              { label: '🎯 Осталось', value: `${remaining.toFixed(1)} кг`, bg: 'var(--amber-light)', color: 'var(--amber)', border: 'var(--amber-border)' },
              { label: '📅 До цели', value: weeksToGoal ? `~${weeksToGoal} нед.` : '—', bg: 'var(--blue-light)', color: 'var(--blue)', border: '#BFDBFE' },
            ].map(({ label, value, bg, color, border }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2, fontWeight: 500 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight chart */}
        <div className="card animate-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚖️</span> Динамика веса
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>последние {Math.min(weightLogs.length, 30)} дней</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--green)' }}>{latestWeight} кг</div>
              {lostSoFar > 0 && <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>−{lostSoFar.toFixed(1)} кг</div>}
            </div>
          </div>
          <LineChart data={weightData.slice(-30)} color="var(--green)" bgColor="var(--green-light)" />
          {weightData.length >= 2 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDateShort(weightData[Math.max(0, weightData.length - 30)].date)}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{formatDateShort(weightData[weightData.length - 1].date)}</span>
            </div>
          )}
        </div>

        {/* Calorie chart */}
        <div className="card animate-fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🔥</span> Калории по дням
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>последние 7 дней</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 800, color: 'var(--amber)' }}>{avgCal}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>среднее</div>
            </div>
          </div>
          <BarChart data={calData} norm={user?.calories_norm ?? 2000} color="var(--amber)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
            <div style={{ width: 16, height: 3, background: 'var(--amber)', borderRadius: 2, opacity: 0.4 }} />
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Норма: {user?.calories_norm} ккал · 🔴 = превышение</span>
          </div>
        </div>

        {/* Weekly macro averages */}
        {last7Cal.length > 0 && (
          <div className="card animate-fade-up">
            <div style={{ fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>📊</span> Среднее за 7 дней
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: '🥩 Белки', color: 'var(--green)', bg: 'var(--green-light)', border: '#BBF7D0',
                  avg: Math.round(last7Cal.reduce((s, d) => s + Number(d.total_protein), 0) / last7Cal.length),
                  norm: user?.protein_norm ?? 0 },
                { label: '🧈 Жиры', color: 'var(--amber)', bg: 'var(--amber-light)', border: 'var(--amber-border)',
                  avg: Math.round(last7Cal.reduce((s, d) => s + Number(d.total_fat), 0) / last7Cal.length),
                  norm: user?.fat_norm ?? 0 },
                { label: '🍞 Углеводы', color: 'var(--blue)', bg: 'var(--blue-light)', border: '#BFDBFE',
                  avg: Math.round(last7Cal.reduce((s, d) => s + Number(d.total_carbs), 0) / last7Cal.length),
                  norm: user?.carbs_norm ?? 0 },
              ].map(({ label, color, bg, border, avg, norm }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontFamily: 'Syne, sans-serif', fontWeight: 800, color }}>{avg}г</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 1, fontWeight: 500 }}>из {norm}г</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Settings section */}
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700, fontFamily: 'Syne', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, paddingLeft: 2 }}>
            ⚙️ Настройки цели
          </div>

          {/* Current norm */}
          <div className="card food-pattern animate-fade-up" style={{ borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)', marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne', fontWeight: 700, marginBottom: 10 }}>
              🎯 Текущая норма КБЖУ
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 44, fontFamily: 'Syne', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{user?.calories_norm}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>ккал/день</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { label: '🥩 Белки', value: user?.protein_norm, bg: 'var(--green-light)', border: '#BBF7D0', color: 'var(--green)' },
                { label: '🧈 Жиры', value: user?.fat_norm, bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
                { label: '🍞 Углеводы', value: user?.carbs_norm, bg: 'var(--blue-light)', border: '#BFDBFE', color: 'var(--blue)' },
              ].map(({ label, value, bg, border, color }) => (
                <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontFamily: 'Syne', fontWeight: 800, color }}>{value}г</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {saved && (
            <div className="animate-fade-in card" style={{ background: 'var(--green-light)', border: '1px solid rgba(74,222,128,0.2)', padding: '10px 14px', textAlign: 'center', marginBottom: 10 }}>
              <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>✅ Норма КБЖУ обновлена!</span>
            </div>
          )}

          {/* Goal form */}
          <div className="card animate-fade-up" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 14, fontFamily: 'Syne', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>🏆</span> Изменить цель
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { value: 'lose', label: '📉 Похудение' },
                  { value: 'maintain', label: '⚖️ Поддержание' },
                  { value: 'gain', label: '📈 Набор' },
                ].map(({ value, label }) => (
                  <button key={value} onClick={() => setGoalForm(f => ({ ...f, goal_type: value }))} style={{
                    padding: '9px 4px', borderRadius: 10, fontSize: 11,
                    background: goalForm.goal_type === value ? 'var(--amber-light)' : 'var(--surface2)',
                    border: `1.5px solid ${goalForm.goal_type === value ? 'var(--amber-border)' : 'var(--border)'}`,
                    color: goalForm.goal_type === value ? 'var(--amber)' : 'var(--text-secondary)',
                    fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'weight', label: '⚖️ Текущий вес', unit: 'кг' },
                  { key: 'goal_weight', label: '🎯 Целевой вес', unit: 'кг' },
                ].map(({ key, label, unit }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" type="number" step="0.1"
                        value={goalForm[key as keyof typeof goalForm]}
                        onChange={e => setGoalForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ paddingRight: 34, fontSize: 14 }} />
                      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 12 }}>{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>📅 Срок</label>
                <select className="input" style={{ fontSize: 14 }} value={goalForm.goal_weeks} onChange={e => setGoalForm(f => ({ ...f, goal_weeks: e.target.value }))}>
                  {[4, 8, 12, 16, 20, 24, 36, 48].map(w => <option key={w} value={w}>{w} недель</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>🏃 Уровень активности</label>
                <select className="input" style={{ fontSize: 14 }} value={goalForm.activity_level} onChange={e => setGoalForm(f => ({ ...f, activity_level: e.target.value }))}>
                  {ACTIVITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>)}
                </select>
              </div>
              <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px' }}
                onClick={recalc} disabled={saving}>
                {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Пересчёт...</> : '🔄 Пересчитать план'}
              </button>
            </div>
          </div>

          {/* Manual norm */}
          <div className="card animate-fade-up" style={{ marginBottom: 10 }}>
            <button style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
              onClick={() => setShowManual(m => !m)}>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✏️</span> Задать норму вручную
              </span>
              <span style={{ color: 'var(--muted)', fontSize: 20, transition: 'transform 0.2s', transform: showManual ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
            </button>
            {showManual && (
              <div className="animate-fade-up" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { key: 'calories', label: '🔥 Калории', unit: 'ккал' },
                    { key: 'protein', label: '🥩 Белки', unit: 'г' },
                    { key: 'fat', label: '🧈 Жиры', unit: 'г' },
                    { key: 'carbs', label: '🍞 Углеводы', unit: 'г' },
                  ].map(({ key, label, unit }) => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 11, color: 'var(--text-secondary)', marginBottom: 5, fontWeight: 600 }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <input className="input" type="number"
                          value={manualNorm[key as keyof typeof manualNorm]}
                          onChange={e => setManualNorm(n => ({ ...n, [key]: e.target.value }))}
                          style={{ paddingRight: 34, fontSize: 14 }} />
                        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 11 }}>{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={saveManual} disabled={saving}>
                  💾 Сохранить норму
                </button>
              </div>
            )}
          </div>

          <button className="btn-secondary animate-fade-up" style={{ width: '100%', borderStyle: 'dashed', marginBottom: 4 }} onClick={() => router.push('/onboarding')}>
            🔄 Пройти онбординг заново
          </button>
        </div>

      </div>
      <NavBar />
    </div>
  );
}
