'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/diary', label: 'День', emoji: '📅' },
  { href: '/progress', label: 'Прогресс', emoji: '📈' },
  { href: '/plan', label: 'План', emoji: '📋' },
  { href: '/chat', label: 'Нутрициолог', emoji: '🥗' },
  { href: '/trainer', label: 'Тренер', emoji: '💪' },
];

export default function NavBar() {
  const pathname = usePathname();
  if (pathname === '/onboarding') return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(255,253,247,0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      zIndex: 100,
      boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
    }}>
      {NAV.map(({ href, label, emoji }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', padding: '4px 12px',
            transition: 'transform 0.2s',
          }}>
            <div style={{
              width: 40, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: active ? 'var(--amber-light)' : 'transparent',
              border: active ? '1px solid var(--amber-border)' : '1px solid transparent',
              fontSize: 20,
              transition: 'all 0.2s',
            }}>
              {emoji}
            </div>
            <span style={{
              fontSize: 10,
              fontFamily: 'Syne, sans-serif',
              fontWeight: active ? 700 : 500,
              color: active ? 'var(--amber)' : 'var(--muted)',
              letterSpacing: '0.04em',
              transition: 'color 0.2s',
            }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
