'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      router.push(data.onboarding_done ? '/diary' : '/onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }} className="animate-float">🥗</div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--amber)' }}>
          Smart-Fit
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
          AI-трекер питания с персональным нутрициологом
        </p>
      </div>

      {/* Card */}
      <div className="card" style={{ width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-md)' }}>
        {/* Tab toggle */}
        <div style={{
          display: 'flex', background: 'var(--surface2)', borderRadius: 12,
          padding: 4, gap: 4, marginBottom: 24,
        }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
              flex: 1, padding: '9px 0', borderRadius: 9,
              background: mode === m ? 'var(--surface)' : 'transparent',
              border: mode === m ? '1px solid var(--amber-border)' : '1px solid transparent',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
              color: mode === m ? 'var(--amber)' : 'var(--muted)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: mode === m ? 'var(--shadow-sm)' : 'none',
            }}>
              {m === 'login' ? '🔑 Войти' : '✨ Создать аккаунт'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              👤 Имя пользователя
            </label>
            <input
              className="input"
              placeholder={mode === 'login' ? 'demo' : 'придумай логин'}
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>
              🔒 Пароль
            </label>
            <input
              className="input"
              type="password"
              placeholder={mode === 'login' ? '••••••••' : 'минимум 4 символа'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'var(--red-light)', border: '1px solid #FECACA',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: 'var(--red)', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>❌</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', marginTop: 4 }}
            disabled={loading || !username || !password}
          >
            {loading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#fff' }} /> Загрузка...</>
              : mode === 'login' ? '🚀 Войти' : '🎉 Зарегистрироваться'
            }
          </button>
        </form>

        {/* Demo hint */}
        {mode === 'login' && (
          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
            borderRadius: 10, fontSize: 12, color: '#92400E', textAlign: 'center',
          }}>
            💡 Демо-аккаунт: <strong>demo</strong> / <strong>demo123</strong>
          </div>
        )}
      </div>

      {/* Food decorations */}
      <div style={{ marginTop: 32, display: 'flex', gap: 12, fontSize: 24, opacity: 0.4 }}>
        {['🍗', '🥗', '🍳', '🥩', '🥦', '🍱'].map(e => (
          <span key={e}>{e}</span>
        ))}
      </div>
    </div>
  );
}
