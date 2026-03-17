'use client';
import { useState, useEffect, useCallback } from 'react';
import NavBar from '@/components/NavBar';

const DURATION_OPTIONS = [20, 30, 45, 60, 90];

const LOCATION_OPTIONS = [
  { value: 'home', label: '🏠 Дома', desc: 'Квартира или дом' },
  { value: 'gym', label: '🏋️ В зале', desc: 'Фитнес-центр' },
  { value: 'outdoor', label: '🌳 На улице', desc: 'Парк, площадка' },
  { value: 'beach', label: '🏖️ Пляж', desc: 'Песок, вода' },
];

const LOCATION_LABELS: Record<string, string> = {
  home: '🏠 Дома', gym: '🏋️ В зале', outdoor: '🌳 На улице', beach: '🏖️ Пляж',
};

const EQUIPMENT_BY_LOCATION: Record<string, { value: string; label: string }[]> = {
  home: [
    { value: 'none', label: '🙌 Без инвентаря' },
    { value: 'dumbbells', label: '🏋️ Гантели' },
    { value: 'resistance_bands', label: '🪢 Резинки' },
    { value: 'pull_up_bar', label: '🔩 Турник' },
    { value: 'jump_rope', label: '⚡ Скакалка' },
    { value: 'mat', label: '🧘 Коврик' },
  ],
  gym: [
    { value: 'barbell', label: '🏋️ Штанга' },
    { value: 'dumbbells', label: '💪 Гантели' },
    { value: 'machines', label: '🤖 Тренажёры' },
    { value: 'cables', label: '🔗 Кроссовер' },
    { value: 'cardio', label: '🏃 Кардио' },
    { value: 'kettlebell', label: '🫙 Гири' },
  ],
  outdoor: [
    { value: 'none', label: '🙌 Без инвентаря' },
    { value: 'pull_up_bar', label: '🔩 Турник' },
    { value: 'parallel_bars', label: '⬛ Брусья' },
    { value: 'jump_rope', label: '⚡ Скакалка' },
    { value: 'bench', label: '🪑 Лавочка' },
    { value: 'bicycle', label: '🚴 Велосипед' },
    { value: 'tennis', label: '🎾 Теннис' },
  ],
  beach: [
    { value: 'none', label: '🙌 Без инвентаря' },
    { value: 'volleyball', label: '🏐 Волейбол' },
    { value: 'jump_rope', label: '⚡ Скакалка' },
    { value: 'bicycle', label: '🚴 Велосипед' },
    { value: 'tennis', label: '🎾 Теннис' },
    { value: 'surfboard', label: '🏄 Сёрфинг' },
  ],
};

interface Exercise {
  name: string;
  emoji: string;
  muscle_groups: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  technique: string;
  tip: string;
  calories_approx: number;
}

interface WorkoutResult {
  calories_burned: number;
  intensity: string;
  warmup: { duration_min: number; description: string };
  exercises: Exercise[];
  cooldown: { duration_min: number; description: string };
}

interface WorkoutLog {
  id: number;
  duration_min: number;
  location: string;
  equipment: string;
  result: WorkoutResult;
  created_at: string;
  date: string;
}

const INTENSITY_COLOR: Record<string, { bg: string; border: string; color: string }> = {
  'низкая':        { bg: 'var(--green-light)', border: '#BBF7D0', color: 'var(--green)' },
  'средняя':       { bg: 'var(--amber-light)', border: 'var(--amber-border)', color: 'var(--amber)' },
  'высокая':       { bg: '#FEE2E2', border: '#FECACA', color: 'var(--red)' },
  'очень высокая': { bg: '#FEE2E2', border: '#FECACA', color: 'var(--red)' },
};

function WorkoutCard({ w, expandedIdx, setExpandedIdx, onDelete }: {
  w: WorkoutLog;
  expandedIdx: number | null;
  setExpandedIdx: (idx: number | null) => void;
  onDelete?: (id: number) => void;
}) {
  const r = w.result;
  const intensityStyle = INTENSITY_COLOR[r.intensity?.toLowerCase()] ?? INTENSITY_COLOR['средняя'];
  const equipmentStr = w.equipment
    ? w.equipment.split(',').map(s => s.trim()).filter(Boolean).join(', ')
    : 'без снаряжения';

  return (
    <div className="card animate-fade-in" style={{ marginBottom: 12 }}>
      {/* Card header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, marginBottom: 3 }}>
            {LOCATION_LABELS[w.location] ?? w.location} · {w.duration_min} мин
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {new Date(w.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
            {equipmentStr !== 'none' && ` · ${equipmentStr}`}
          </div>
        </div>
        {onDelete && (
          <button onClick={() => onDelete(w.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 18, padding: '2px 6px', borderRadius: 6,
            transition: 'color 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--red)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--muted)'}
            title="Удалить из архива"
          >×</button>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: 'var(--amber)' }}>{r.calories_burned}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>ккал</div>
        </div>
        <div style={{ flex: 1, background: intensityStyle.bg, border: `1px solid ${intensityStyle.border}`, borderRadius: 10, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 14, color: intensityStyle.color }}>{r.intensity}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>интенсивность</div>
        </div>
        <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>{r.exercises.length}</div>
          <div style={{ fontSize: 10, color: 'var(--muted)' }}>упражнений</div>
        </div>
      </div>

      {/* Exercises list — collapsed by default, toggle */}
      <button onClick={() => setExpandedIdx(expandedIdx === w.id ? null : w.id)} style={{
        width: '100%', background: 'none', border: '1px solid var(--border)', borderRadius: 10,
        padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.2s',
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
          📋 Упражнения
        </span>
        <span style={{ fontSize: 16, color: 'var(--muted)', transform: expandedIdx === w.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>›</span>
      </button>

      {expandedIdx === w.id && (
        <div className="animate-fade-up" style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Warmup */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--green-light)', borderRadius: 10, border: '1px solid #BBF7D0' }}>
            <span style={{ fontSize: 18 }}>🌅</span>
            <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>Разминка {r.warmup.duration_min} мин</div>
          </div>

          {r.exercises.map((ex, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
              background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
              }}>{ex.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ex.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1 }}>
                  {ex.sets} × {ex.reps} · {ex.rest_seconds}с отдых
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'Syne', fontWeight: 700, flexShrink: 0 }}>
                ~{ex.calories_approx} ккал
              </div>
            </div>
          ))}

          {/* Cooldown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--blue-light)', borderRadius: 10, border: '1px solid #BFDBFE' }}>
            <span style={{ fontSize: 18 }}>🧘</span>
            <div style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600 }}>Заминка {r.cooldown.duration_min} мин</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerPage() {
  const [tab, setTab] = useState<'new' | 'archive'>('new');
  const [duration, setDuration] = useState(45);
  const [location, setLocation] = useState('home');
  const [equipment, setEquipment] = useState<string[]>(['none']);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [archive, setArchive] = useState<WorkoutLog[]>([]);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [archiveExpandedId, setArchiveExpandedId] = useState<number | null>(null);

  const loadArchive = useCallback(async () => {
    setArchiveLoading(true);
    try {
      const res = await fetch('/api/workout-logs');
      const data = await res.json();
      if (Array.isArray(data)) setArchive(data);
    } finally {
      setArchiveLoading(false);
    }
  }, []);

  useEffect(() => { loadArchive(); }, [loadArchive]);

  const toggleEquipment = (val: string) => {
    setEquipment(prev => {
      if (val === 'none') return ['none'];
      const without = prev.filter(v => v !== 'none');
      return without.includes(val) ? without.filter(v => v !== val) : [...without, val];
    });
  };

  const generate = async () => {
    setGenerating(true);
    setError('');
    setResult(null);
    setExpandedIdx(null);
    try {
      const res = await fetch('/api/trainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration_min: duration, location, equipment }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setResult(data);

      // Auto-save to archive
      await fetch('/api/workout-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          duration_min: duration,
          location,
          equipment: equipment.join(', '),
          result: data,
        }),
      });
      loadArchive();
    } catch (e) {
      setError(String(e));
    } finally {
      setGenerating(false);
    }
  };

  const deleteWorkout = async (id: number) => {
    await fetch(`/api/workout-logs?id=${id}`, { method: 'DELETE' });
    setArchive(prev => prev.filter(w => w.id !== id));
  };

  const equipmentOptions = EQUIPMENT_BY_LOCATION[location] ?? [];
  const intensityStyle = result ? (INTENSITY_COLOR[result.intensity.toLowerCase()] ?? INTENSITY_COLOR['средняя']) : null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 88 }}>
      {/* Header */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
          <span style={{ fontSize: 28 }}>💪</span>
          <h1 style={{ fontSize: 26, fontWeight: 800 }}>AI-тренер</h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Персональная тренировка за секунды</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        {[
          { key: 'new', label: '💪 Новая' },
          { key: 'archive', label: `🕐 История${archive.length ? ` (${archive.length})` : ''}` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key as 'new' | 'archive')} style={{
            flex: 1, padding: '12px 0', background: 'none', border: 'none',
            borderBottom: tab === key ? '2px solid var(--amber)' : '2px solid transparent',
            color: tab === key ? 'var(--amber)' : 'var(--muted)',
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14,
            cursor: 'pointer', transition: 'all 0.2s',
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── NEW WORKOUT TAB ── */}
        {tab === 'new' && (
          <>
            {/* Form */}
            {!result && !generating && (
              <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Duration */}
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                    ⏱ Сколько времени есть?
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {DURATION_OPTIONS.map(d => (
                      <button key={d} onClick={() => setDuration(d)} style={{
                        flex: 1, padding: '10px 4px', borderRadius: 12, textAlign: 'center',
                        background: duration === d ? 'var(--amber-light)' : 'var(--surface)',
                        border: `1.5px solid ${duration === d ? 'var(--amber-border)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 16, color: duration === d ? 'var(--amber)' : 'var(--text)' }}>{d}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>мин</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                    📍 Где будешь тренироваться?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {LOCATION_OPTIONS.map(({ value, label, desc }) => (
                      <button key={value} onClick={() => { setLocation(value); setEquipment(['none']); }} style={{
                        padding: '13px 16px', borderRadius: 14, textAlign: 'left',
                        background: location === value ? 'var(--amber-light)' : 'var(--surface)',
                        border: `1.5px solid ${location === value ? 'var(--amber-border)' : 'var(--border)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: location === value ? 'var(--amber)' : 'var(--text)' }}>{label}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 10 }}>
                    🎒 Снаряжение <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(можно несколько)</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {equipmentOptions.map(({ value, label }) => {
                      const active = equipment.includes(value);
                      return (
                        <button key={value} onClick={() => toggleEquipment(value)} style={{
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

                <button className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  onClick={generate}>
                  💪 Составить тренировку
                </button>
                {error && <div style={{ color: 'var(--red)', fontSize: 13, textAlign: 'center' }}>{error}</div>}
              </div>
            )}

            {/* Generating */}
            {generating && (
              <div className="card animate-fade-up" style={{ textAlign: 'center', padding: '48px 24px', borderColor: 'var(--amber-border)', background: 'var(--amber-light)' }}>
                <div style={{ fontSize: 52, marginBottom: 16 }} className="animate-float">💪</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
                  Тренер составляет план...
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                  Подбираем упражнения под твои параметры
                </div>
                <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--amber)' }} />
              </div>
            )}

            {/* Result */}
            {result && !generating && (
              <div className="animate-fade-up">
                {/* Summary card */}
                <div className="card food-pattern" style={{ marginBottom: 14, borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'Syne', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                        🔥 Тренировка готова
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 48, fontFamily: 'Syne', fontWeight: 800, color: 'var(--amber)', lineHeight: 1 }}>{result.calories_burned}</span>
                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>ккал сожжёт</span>
                      </div>
                    </div>
                    {intensityStyle && (
                      <div style={{ padding: '8px 14px', borderRadius: 12, background: intensityStyle.bg, border: `1px solid ${intensityStyle.border}`, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 14, color: intensityStyle.color }}>{result.intensity}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>интенсивность</div>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { label: '⏱ Длительность', value: `${duration} мин` },
                      { label: '🏋️ Упражнений', value: result.exercises.length },
                      { label: '📍 Место', value: LOCATION_OPTIONS.find(l => l.value === location)?.label?.split(' ').slice(1).join(' ') ?? location },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontFamily: 'Syne', fontWeight: 700 }}>{value}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Warmup */}
                <div className="card" style={{ marginBottom: 10, borderLeft: '3px solid var(--green)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>🌅</span>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--green)', marginBottom: 3 }}>
                        Разминка · {result.warmup.duration_min} мин
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{result.warmup.description}</div>
                    </div>
                  </div>
                </div>

                {/* Exercises */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                  {result.exercises.map((ex, idx) => {
                    const isOpen = expandedIdx === idx;
                    return (
                      <div key={idx} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <button onClick={() => setExpandedIdx(isOpen ? null : idx)} style={{
                          width: '100%', padding: '14px', background: 'none', border: 'none',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                        }}>
                          <div style={{
                            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                            background: 'var(--amber-light)', border: '1.5px solid var(--amber-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                          }}>{ex.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, marginBottom: 3 }}>{ex.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                              {ex.sets} подх. × {ex.reps} · отдых {ex.rest_seconds}с
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 5 }}>
                              {ex.muscle_groups.map(g => (
                                <span key={g} style={{
                                  fontSize: 10, padding: '2px 7px', borderRadius: 20,
                                  background: 'var(--blue-light)', color: 'var(--blue)',
                                  fontWeight: 600, border: '1px solid #BFDBFE',
                                }}>{g}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: 'var(--amber)', fontFamily: 'Syne', fontWeight: 700 }}>~{ex.calories_approx} ккал</span>
                            <span style={{ fontSize: 18, color: 'var(--muted)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>›</span>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="animate-fade-up" style={{ padding: '0 14px 16px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontSize: 11, fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                                📋 Техника выполнения
                              </div>
                              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7, background: 'var(--surface2)', borderRadius: 10, padding: '10px 12px' }}>
                                {ex.technique}
                              </div>
                            </div>
                            {ex.tip && (
                              <div style={{ marginTop: 10, display: 'flex', gap: 8, background: 'var(--amber-light)', borderRadius: 10, padding: '10px 12px', border: '1px solid var(--amber-border)' }}>
                                <span style={{ fontSize: 16 }}>💡</span>
                                <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>{ex.tip}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Cooldown */}
                <div className="card" style={{ marginBottom: 14, borderLeft: '3px solid var(--blue)', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 26 }}>🧘</span>
                    <div>
                      <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: 'var(--blue)', marginBottom: 3 }}>
                        Заминка · {result.cooldown.duration_min} мин
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{result.cooldown.description}</div>
                    </div>
                  </div>
                </div>

                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setResult(null)}>
                  🔄 Составить другую тренировку
                </button>
              </div>
            )}
          </>
        )}

        {/* ── ARCHIVE TAB ── */}
        {tab === 'archive' && (
          <div className="animate-fade-up">
            {archiveLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : archive.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏃</div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 17, marginBottom: 8 }}>История пуста</div>
                <div style={{ color: 'var(--muted)', fontSize: 14 }}>
                  Сгенерируй первую тренировку — она появится здесь автоматически
                </div>
                <button className="btn-primary" style={{ marginTop: 20 }} onClick={() => setTab('new')}>
                  💪 Создать тренировку
                </button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 12, textAlign: 'right' }}>
                  {archive.length} тренировок в истории
                </div>
                {archive.map(w => (
                  <WorkoutCard
                    key={w.id}
                    w={w}
                    expandedIdx={archiveExpandedId}
                    setExpandedIdx={setArchiveExpandedId}
                    onDelete={deleteWorkout}
                  />
                ))}
              </>
            )}
          </div>
        )}

      </div>
      <NavBar />
    </div>
  );
}
