'use client';

interface MacroBarProps {
  label: string;
  current: number;
  norm: number;
  color: string;
  bgColor: string;
  unit?: string;
}

export default function MacroBar({ label, current, norm, color, bgColor, unit = 'г' }: MacroBarProps) {
  const pct = norm > 0 ? Math.min(100, Math.round((current / norm) * 100)) : 0;
  const over = current > norm;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{
          fontSize: 12, color: 'var(--text-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.07em',
          fontFamily: 'Syne, sans-serif', fontWeight: 600,
        }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: over ? 'var(--red)' : 'var(--text)' }}>
          {Math.round(current)}
          <span style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 400 }}>/{norm}{unit}</span>
        </span>
      </div>
      <div className="progress-bar" style={{ background: bgColor }}>
        <div
          className="progress-fill"
          style={{
            width: `${pct}%`,
            background: over ? 'var(--red)' : color,
          }}
        />
      </div>
    </div>
  );
}
