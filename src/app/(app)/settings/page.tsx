'use client';
import { useEffect, useState } from 'react';
import NavBar from '@/components/NavBar';
import type { User } from '@/lib/types';
import { useRouter } from 'next/navigation';

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: '🪑 Сидячий', desc: 'Нет тренировок' },
  { value: 'light', label: '🚶 Лёгкая', desc: '1–2 раза/нед' },
  { value: 'moderate', label: '🏃 Умеренная', desc: '3–5 раз/нед' },
  { value: 'active', label: '💪 Высокая', desc: '6–7 раз/нед' },
  { value: 'very_active', label: '🔥 Очень высокая', desc: 'Каждый день интенсивно' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState({ weight: '', goal_weight: '', goal_weeks: '12', goal_type: 'lose', activity_level: 'moderate' });
  const [manualNorm, setManualNorm] = useState({ calories: '', protein: '', fat: '', carbs: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(r => r.json()).then((u: User) => {
      setUser(u);
      setForm({ weight: String(u.weight), goal_weight: String(u.goal_weight), goal_weeks: String(u.goal_weeks), goal_type: u.goal_type, activity_level: u.activity_level });
      setManualNorm({ calories: String(u.calories_norm), protein: String(u.protein_norm), fat: String(u.fat_norm), carbs: String(u.carbs_norm) });
    });
  }, []);

  const recalc = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: user?.name, gender: user?.gender, age: user?.age, height: user?.height, ...form }),
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

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 40 }} className="animate-float">⚙️</div>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 28 }}>⚙️</span>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>Настройки</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Цель и норма КБЖУ</p>
      </div>

      <div style={{ padding: '16px 16px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Current norm */}
        <div className="card food-pattern" style={{ borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))' }}>
          <div style={{ fontSize: 12, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'Syne', fontWeight: 700, marginBottom: 12 }}>
            🎯 Текущая норма
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 48, fontFamily: 'Syne', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{user.calories_norm}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>ккал/день</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[
              { label: '🥩 Белки', value: user.protein_norm, bg: 'var(--green-light)', border: 'rgba(74,222,128,0.2)', color: 'var(--green)' },
              { label: '🧈 Жиры', value: user.fat_norm, bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
              { label: '🍞 Углеводы', value: user.carbs_norm, bg: 'var(--blue-light)', border: 'rgba(129,140,248,0.2)', color: 'var(--blue)' },
            ].map(({ label, value, bg, border, color }) => (
              <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 800, color }}>{value}г</div>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Success message */}
        {saved && (
          <div className="animate-fade-in card" style={{ background: 'var(--green-light)', border: '1px solid rgba(74,222,128,0.2)', padding: '12px 16px', textAlign: 'center' }}>
            <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>✅ Норма КБЖУ обновлена!</span>
          </div>
        )}

        {/* Goal settings */}
        <div className="card">
          <div style={{ fontSize: 15, fontFamily: 'Syne', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🏆</span> Изменить цель
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Тип цели</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[
                  { value: 'lose', label: '📉 Похудение' },
                  { value: 'maintain', label: '⚖️ Поддержание' },
                  { value: 'gain', label: '📈 Набор' },
                ].map(({ value, label }) => (
                  <button key={value} onClick={() => setForm(f => ({ ...f, goal_type: value }))} style={{
                    padding: '10px 6px', borderRadius: 12, fontSize: 11,
                    background: form.goal_type === value ? 'var(--amber-light)' : 'var(--surface2)',
                    border: `1.5px solid ${form.goal_type === value ? 'var(--amber-border)' : 'var(--border)'}`,
                    color: form.goal_type === value ? 'var(--amber)' : 'var(--text-secondary)',
                    fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                  }}>{label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { key: 'weight', label: '⚖️ Текущий вес', unit: 'кг' },
                { key: 'goal_weight', label: '🎯 Целевой вес', unit: 'кг' },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input" type="number" step="0.1"
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ paddingRight: 36 }} />
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: 12 }}>{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>📅 Срок</label>
              <select className="input" value={form.goal_weeks} onChange={e => setForm(f => ({ ...f, goal_weeks: e.target.value }))}>
                {[4, 8, 12, 16, 20, 24, 36, 48].map(w => (
                  <option key={w} value={w}>{w} недель</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>🏃 Уровень активности</label>
              <select className="input" value={form.activity_level} onChange={e => setForm(f => ({ ...f, activity_level: e.target.value }))}>
                {ACTIVITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                ))}
              </select>
            </div>

            <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
              onClick={recalc} disabled={saving}>
              {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Пересчёт...</> : '🔄 Пересчитать мой план'}
            </button>
          </div>
        </div>

        {/* Manual norm */}
        <div className="card">
          <button style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            onClick={() => setShowManual(m => !m)}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>✏️</span> Задать норму вручную
            </span>
            <span style={{ color: 'var(--muted)', fontSize: 20, transition: 'transform 0.2s', transform: showManual ? 'rotate(90deg)' : 'none', display: 'inline-block' }}>›</span>
          </button>
          {showManual && (
            <div className="animate-fade-up" style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { key: 'calories', label: '🔥 Калории', unit: 'ккал' },
                  { key: 'protein', label: '🥩 Белки', unit: 'г' },
                  { key: 'fat', label: '🧈 Жиры', unit: 'г' },
                  { key: 'carbs', label: '🍞 Углеводы', unit: 'г' },
                ].map(({ key, label, unit }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input className="input" type="number"
                        value={manualNorm[key as keyof typeof manualNorm]}
                        onChange={e => setManualNorm(n => ({ ...n, [key]: e.target.value }))}
                        style={{ paddingRight: 36 }} />
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

        <button className="btn-secondary" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => router.push('/onboarding')}>
          🔄 Пройти онбординг заново
        </button>
      </div>
      <NavBar />
    </div>
  );
}
