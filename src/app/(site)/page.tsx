'use client';
import { useEffect } from 'react';

const LANDING_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap');

:root {
  --clr-bg: #0C0B0A;
  --clr-bg-warm: #141210;
  --clr-surface: #1C1A17;
  --clr-surface-hover: #242220;
  --clr-coral: #E8734A;
  --clr-coral-light: #F29B7A;
  --clr-peach: #FCEADE;
  --clr-cream: #FFF8F2;
  --clr-text: #E8E4DF;
  --clr-text-dim: #9B9590;
  --clr-green: #7BC67E;
  --clr-gold: #D4A853;
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body: 'Outfit', system-ui, sans-serif;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-body);
  background: var(--clr-bg);
  color: var(--clr-text);
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 256px 256px;
}
.container { max-width: 1120px; margin: 0 auto; padding: 0 24px; }
.container-wide { max-width: 1280px; margin: 0 auto; padding: 0 40px; }
.fade-in {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-in.visible { opacity: 1; transform: translateY(0); }

nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 20px 0;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(12, 11, 10, 0.7) !important;
  border-bottom: 1px solid rgba(232, 115, 74, 0.08) !important;
  border-top: none !important;
  box-shadow: none !important;
}
nav .container { display: flex; align-items: center; justify-content: space-between; }
.logo { font-family: var(--font-display); font-size: 1.5rem; color: var(--clr-cream); text-decoration: none; letter-spacing: -0.02em; }
.logo span { color: var(--clr-coral); }
.nav-cta {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px;
  background: var(--clr-coral); color: #fff;
  font-family: var(--font-body); font-weight: 600; font-size: 0.875rem;
  border: none; border-radius: 100px; cursor: pointer;
  text-decoration: none; transition: background 0.3s, transform 0.2s;
}
.nav-cta:hover { background: var(--clr-coral-light); transform: scale(1.03); }

.hero {
  min-height: 100vh; display: flex; align-items: center;
  position: relative; padding-top: 100px; overflow: hidden;
}
.hero::before {
  content: ''; position: absolute; top: -20%; right: -15%;
  width: 70vw; height: 70vw; max-width: 900px; max-height: 900px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 115, 74, 0.12) 0%, transparent 70%);
  pointer-events: none;
}
.hero::after {
  content: ''; position: absolute; bottom: -10%; left: -10%;
  width: 40vw; height: 40vw; max-width: 500px; max-height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 168, 83, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 2; max-width: 100%; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 16px; border-radius: 100px;
  background: rgba(232, 115, 74, 0.1); border: 1px solid rgba(232, 115, 74, 0.2);
  color: var(--clr-coral-light); font-size: 0.8rem; font-weight: 500;
  letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 32px;
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
}
.hero-badge::before {
  content: ''; width: 6px; height: 6px; border-radius: 50%;
  background: var(--clr-coral); animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
.hero h1 {
  font-family: var(--font-display);
  font-size: clamp(3rem, 7vw, 5.5rem); line-height: 1.05;
  color: var(--clr-cream); letter-spacing: -0.025em; margin-bottom: 28px;
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
}
.hero h1 em { font-style: italic; color: var(--clr-coral); }
.hero-sub {
  font-size: 1.2rem; color: var(--clr-text-dim); max-width: 720px;
  line-height: 1.7; margin-bottom: 40px; font-weight: 300;
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both;
}
.hero-actions {
  display: flex; flex-wrap: wrap; gap: 16px; align-items: center;
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
}
@keyframes slideIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
.btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 16px 36px; background: var(--clr-coral); color: #fff;
  font-family: var(--font-body); font-weight: 600; font-size: 1rem;
  border: none; border-radius: 100px; cursor: pointer; text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 24px rgba(232, 115, 74, 0.25);
  letter-spacing: normal; text-transform: none;
}
.btn-primary:hover {
  background: var(--clr-coral-light); transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(232, 115, 74, 0.35);
}
.btn-primary svg { transition: transform 0.3s; }
.btn-primary:hover svg { transform: translateX(3px); }
.hero-note { font-size: 0.825rem; color: var(--clr-text-dim); font-weight: 300; }
.hero-features {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px; margin-top: 64px;
  animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.8s both;
}
.hero-feature {
  display: flex; align-items: flex-start; gap: 14px; padding: 20px;
  border-radius: 16px; background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05); transition: all 0.3s;
}
.hero-feature:hover { background: rgba(232, 115, 74, 0.05); border-color: rgba(232, 115, 74, 0.12); }
.hero-feature-icon {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
  background: rgba(232, 115, 74, 0.08); border: 1px solid rgba(232, 115, 74, 0.15);
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
}
.hero-feature:nth-child(4) .hero-feature-icon { background: rgba(123, 198, 126, 0.08); border-color: rgba(123, 198, 126, 0.15); }
.hero-feature:nth-child(5) .hero-feature-icon { background: rgba(212, 168, 83, 0.08); border-color: rgba(212, 168, 83, 0.15); }
.hero-feature:nth-child(6) .hero-feature-icon { background: rgba(147, 130, 220, 0.08); border-color: rgba(147, 130, 220, 0.15); }
.hero-feature-text { font-size: 0.875rem; color: var(--clr-text-dim); line-height: 1.5; }
.hero-feature-text strong { display: block; color: var(--clr-cream); font-weight: 500; margin-bottom: 2px; }

section { padding: 120px 0; position: relative; }
.section-label {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--clr-coral); margin-bottom: 20px;
}
.section-label::before { content: ''; width: 24px; height: 1px; background: var(--clr-coral); }
.section-title {
  font-family: var(--font-display); font-size: clamp(2rem, 4.5vw, 3.5rem);
  color: var(--clr-cream); letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 20px;
}
.section-title em { font-style: italic; color: var(--clr-coral); }
.section-sub { font-size: 1.05rem; color: var(--clr-text-dim); max-width: 560px; line-height: 1.7; font-weight: 300; }

.pain { background: var(--clr-bg-warm); }
.pain-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; margin-top: 56px; }
.pain-list { display: flex; flex-direction: column; gap: 20px; }
.pain-item {
  display: flex; gap: 16px; align-items: flex-start;
  padding: 20px 24px; border-radius: 16px;
  background: rgba(232, 115, 74, 0.04); border: 1px solid rgba(232, 115, 74, 0.08);
  transition: all 0.3s;
}
.pain-item:hover { background: rgba(232, 115, 74, 0.07); border-color: rgba(232, 115, 74, 0.15); transform: translateX(4px); }
.pain-icon { flex-shrink: 0; font-size: 1.3rem; width: 32px; text-align: center; padding-top: 2px; }
.pain-text { font-size: 0.95rem; color: var(--clr-text); line-height: 1.6; font-weight: 300; }
.pain-visual { display: flex; justify-content: center; align-items: center; }
.pain-card {
  position: relative; width: 100%; max-width: 400px; aspect-ratio: 3 / 4;
  border-radius: 24px;
  background: linear-gradient(160deg, var(--clr-surface) 0%, rgba(232, 115, 74, 0.06) 100%);
  border: 1px solid rgba(232, 115, 74, 0.1);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 32px; text-align: center; overflow: hidden;
}
.pain-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--clr-coral), transparent); opacity: 0.3;
}
.pain-card-emoji { font-size: 4rem; margin-bottom: 24px; animation: floatAnim 4s ease-in-out infinite; }
@keyframes floatAnim { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.pain-card-quote { font-family: var(--font-display); font-style: italic; font-size: 1.5rem; color: var(--clr-cream); line-height: 1.4; margin-bottom: 16px; }
.pain-card-note { font-size: 0.85rem; color: var(--clr-text-dim); font-weight: 300; }

.how-it-works { overflow: hidden; }
.steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
.step {
  position: relative; padding: 40px 32px; border-radius: 20px;
  background: var(--clr-surface); border: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;
}
.step::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--clr-coral), var(--clr-gold)); opacity: 0; transition: opacity 0.4s;
}
.step:hover::before { opacity: 1; }
.step:hover { transform: translateY(-4px); border-color: rgba(232, 115, 74, 0.15); box-shadow: 0 16px 48px rgba(0, 0, 0, 0.3); }
.step-number {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; border-radius: 14px;
  background: rgba(232, 115, 74, 0.1); border: 1px solid rgba(232, 115, 74, 0.15);
  font-family: var(--font-display); font-size: 1.25rem; color: var(--clr-coral); margin-bottom: 24px;
}
.step-icon { font-size: 2.5rem; margin-bottom: 20px; }
.step h3 { font-family: var(--font-display); font-size: 1.35rem; color: var(--clr-cream); margin-bottom: 12px; }
.step p { font-size: 0.9rem; color: var(--clr-text-dim); line-height: 1.7; font-weight: 300; }
.how-note { text-align: center; margin-top: 40px; font-size: 0.875rem; color: var(--clr-text-dim); font-weight: 300; }

.features { background: var(--clr-bg-warm); }
.features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 64px; }
.feature-card {
  padding: 40px 36px; border-radius: 20px; background: var(--clr-surface);
  border: 1px solid rgba(255, 255, 255, 0.04); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative; overflow: hidden;
}
.feature-card:hover { border-color: rgba(232, 115, 74, 0.12); transform: translateY(-2px); }
.feature-card-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 24px; }
.feature-card:nth-child(1) .feature-card-icon { background: rgba(232, 115, 74, 0.1); border: 1px solid rgba(232, 115, 74, 0.15); }
.feature-card:nth-child(2) .feature-card-icon { background: rgba(123, 198, 126, 0.1); border: 1px solid rgba(123, 198, 126, 0.15); }
.feature-card:nth-child(3) .feature-card-icon { background: rgba(212, 168, 83, 0.1); border: 1px solid rgba(212, 168, 83, 0.15); }
.feature-card:nth-child(4) .feature-card-icon { background: rgba(147, 130, 220, 0.1); border: 1px solid rgba(147, 130, 220, 0.15); }
.feature-card h3 { font-family: var(--font-display); font-size: 1.25rem; color: var(--clr-cream); margin-bottom: 10px; }
.feature-card p { font-size: 0.9rem; color: var(--clr-text-dim); line-height: 1.7; font-weight: 300; }

.onboarding { text-align: center; }
.onboarding-inner { max-width: 680px; margin: 0 auto; }
.onboarding-steps { display: flex; justify-content: center; gap: 16px; margin: 48px 0 40px; flex-wrap: wrap; }
.ob-step { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100px; }
.ob-step-dot {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(232, 115, 74, 0.08); border: 1.5px solid rgba(232, 115, 74, 0.2);
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem; transition: all 0.3s;
}
.ob-step:hover .ob-step-dot { background: rgba(232, 115, 74, 0.15); border-color: var(--clr-coral); transform: scale(1.1); }
.ob-step-label { font-size: 0.75rem; color: var(--clr-text-dim); font-weight: 400; }
.onboarding .section-sub { margin: 0 auto 40px; max-width: 520px; text-align: center; }

.timeline { background: var(--clr-bg-warm); }
.timeline-track { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-top: 64px; }
.timeline-card {
  padding: 36px 32px; border-radius: 20px; background: var(--clr-surface);
  border: 1px solid rgba(255, 255, 255, 0.04); position: relative; transition: all 0.4s;
}
.timeline-card:hover { border-color: rgba(232, 115, 74, 0.12); transform: translateY(-3px); }
.timeline-card-when { font-family: var(--font-display); font-size: 1.15rem; color: var(--clr-coral); margin-bottom: 20px; }
.timeline-card ul { list-style: none; display: flex; flex-direction: column; gap: 14px; }
.timeline-card li { display: flex; align-items: flex-start; gap: 10px; font-size: 0.9rem; color: var(--clr-text); line-height: 1.5; font-weight: 300; }
.timeline-card li::before { content: ''; flex-shrink: 0; width: 6px; height: 6px; margin-top: 8px; border-radius: 50%; background: var(--clr-coral); }

.faq-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 64px; }
.faq-item { padding: 32px; border-radius: 20px; background: var(--clr-surface); border: 1px solid rgba(255, 255, 255, 0.04); transition: all 0.3s; }
.faq-item:hover { border-color: rgba(232, 115, 74, 0.1); }
.faq-q { font-family: var(--font-display); font-size: 1.05rem; color: var(--clr-cream); margin-bottom: 12px; line-height: 1.4; }
.faq-a { font-size: 0.875rem; color: var(--clr-text-dim); line-height: 1.7; font-weight: 300; }

.compare { background: var(--clr-bg-warm); }
.compare-table-wrap { margin-top: 56px; overflow-x: auto; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.04); }
.compare-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.compare-table thead th { padding: 20px 24px; text-align: left; font-weight: 500; color: var(--clr-text-dim); background: var(--clr-surface); border-bottom: 1px solid rgba(255, 255, 255, 0.06); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.06em; }
.compare-table thead th:last-child { color: var(--clr-coral); }
.compare-table tbody td { padding: 18px 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); color: var(--clr-text-dim); font-weight: 300; background: var(--clr-bg-warm); }
.compare-table tbody td:first-child { color: var(--clr-text); font-weight: 400; }
.compare-table tbody td:last-child { color: var(--clr-cream); background: rgba(232, 115, 74, 0.04); }
.compare-table tbody tr:last-child td { border-bottom: none; }
.check { color: var(--clr-green); font-weight: 600; }
.cross { color: var(--clr-text-dim); opacity: 0.4; }

.pricing-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 800px; margin: 56px auto 0; }
.pricing-card { padding: 40px 36px; border-radius: 24px; background: var(--clr-surface); border: 1px solid rgba(255, 255, 255, 0.05); position: relative; transition: all 0.3s; }
.pricing-card:hover { transform: translateY(-2px); }
.pricing-card.featured { border-color: rgba(232, 115, 74, 0.3); background: linear-gradient(170deg, var(--clr-surface) 0%, rgba(232, 115, 74, 0.06) 100%); }
.pricing-card.featured::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--clr-coral), var(--clr-gold)); border-radius: 24px 24px 0 0; }
.pricing-card-badge { display: inline-block; padding: 4px 12px; border-radius: 100px; background: rgba(232, 115, 74, 0.1); color: var(--clr-coral); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
.pricing-card-name { font-family: var(--font-display); font-size: 1.5rem; color: var(--clr-cream); margin-bottom: 8px; }
.pricing-card-price { font-size: 2.5rem; font-weight: 700; color: var(--clr-cream); margin-bottom: 4px; }
.pricing-card-price span { font-size: 1rem; font-weight: 400; color: var(--clr-text-dim); }
.pricing-card-period { font-size: 0.825rem; color: var(--clr-text-dim); margin-bottom: 28px; font-weight: 300; }
.pricing-features { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
.pricing-features li { display: flex; align-items: center; gap: 10px; font-size: 0.875rem; color: var(--clr-text); font-weight: 300; }
.pricing-features li .icon { flex-shrink: 0; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; }
.pricing-features li .icon.yes { background: rgba(123, 198, 126, 0.15); color: var(--clr-green); }
.pricing-features li .icon.no { background: rgba(155, 149, 144, 0.1); color: var(--clr-text-dim); }
.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; padding: 14px 28px; border-radius: 100px;
  font-family: var(--font-body); font-weight: 600; font-size: 0.9rem;
  text-decoration: none; transition: all 0.3s; cursor: pointer;
  border: 1.5px solid rgba(255, 255, 255, 0.1); background: transparent; color: var(--clr-text);
}
.btn-secondary:hover { border-color: rgba(255, 255, 255, 0.25); background: rgba(255, 255, 255, 0.03); }
.pricing-card.featured .btn-primary { width: 100%; justify-content: center; }

.cta-final { padding: 120px 0; text-align: center; position: relative; overflow: hidden; }
.cta-final::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80vw; height: 80vw; max-width: 800px; max-height: 800px; border-radius: 50%; background: radial-gradient(circle, rgba(232, 115, 74, 0.08) 0%, transparent 60%); pointer-events: none; }
.cta-final-inner { position: relative; z-index: 2; max-width: 600px; margin: 0 auto; }
.cta-final .section-title { margin-bottom: 16px; }
.cta-final .section-sub { margin: 0 auto 40px; text-align: center; }
.cta-final-note { margin-top: 16px; font-size: 0.825rem; color: var(--clr-text-dim); font-weight: 300; }

footer { padding: 40px 0; border-top: 1px solid rgba(255, 255, 255, 0.04); }
footer .container { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
footer p { font-size: 0.8rem; color: var(--clr-text-dim); font-weight: 300; }

@media (max-width: 900px) {
  .pain-grid { grid-template-columns: 1fr; }
  .pain-visual { order: -1; }
  .pain-card { max-width: 100%; aspect-ratio: auto; padding: 40px 24px; }
  .steps { grid-template-columns: 1fr; max-width: 480px; margin-left: auto; margin-right: auto; }
  .features-grid { grid-template-columns: 1fr; }
  .timeline-track { grid-template-columns: 1fr; }
  .faq-grid { grid-template-columns: 1fr; }
  .pricing-cards { grid-template-columns: 1fr; max-width: 100%; }
  .hero-features { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  section { padding: 80px 0; }
}
@media (max-width: 600px) {
  .hero h1 { font-size: 2.5rem; }
  .hero-features { grid-template-columns: 1fr; }
  .compare-table { font-size: 0.8rem; }
  .compare-table thead th, .compare-table tbody td { padding: 14px 16px; }
}
`;

const LANDING_HTML = `
  <nav>
    <div class="container">
      <a href="/" class="logo">Smart<span>-</span>Fit</a>
      <a href="/login" class="nav-cta">Попробовать бесплатно</a>
    </div>
  </nav>

  <section class="hero">
    <div class="container-wide">
      <div class="hero-content">
        <div class="hero-badge">AI-трекер питания</div>
        <h1>В форму мечты —<br><em>без мучений с калориями.</em></h1>
        <p class="hero-sub">
          Сфотографируйте ланч. Наговорите голосом, что было на ужин. Smart-Fit разберётся сам — посчитает калории, белки, жиры и углеводы, соберёт меню на завтра и покажет прогресс к вашей цели.
        </p>
        <div class="hero-actions">
          <a href="/login" class="btn-primary">
            Попробовать 7 дней бесплатно
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <span class="hero-note">Без привязки карты. 30 секунд на регистрацию.</span>
        </div>
        <div class="hero-features">
          <div class="hero-feature">
            <div class="hero-feature-icon">&#128248;</div>
            <div class="hero-feature-text"><strong>Фото</strong>Навели камеру — калории уже в дневнике</div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">&#127897;</div>
            <div class="hero-feature-text"><strong>Голос</strong>«Паста и капучино» — AI всё запишет</div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">&#127860;</div>
            <div class="hero-feature-text"><strong>Меню на день</strong>Готовый план питания под ваши цели</div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">&#128200;</div>
            <div class="hero-feature-text"><strong>Прогресс</strong>Графики веса и прогноз достижения цели</div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">&#9889;</div>
            <div class="hero-feature-text"><strong>30 секунд</strong>Запись любого приёма пищи — быстрее не бывает</div>
          </div>
          <div class="hero-feature">
            <div class="hero-feature-icon">&#129504;</div>
            <div class="hero-feature-text"><strong>Умные советы</strong>AI перестроит вечер, если вы переели за обедом</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="pain">
    <div class="container">
      <div class="section-label">Знакомо?</div>
      <h2 class="section-title">Вы сто раз обещали себе<br><em>начать питаться правильно</em></h2>
      <div class="pain-grid">
        <div class="pain-list fade-in">
          <div class="pain-item"><div class="pain-icon">&#127958;</div><div class="pain-text">До отпуска три месяца — а купальник по-прежнему лежит на дне шкафа</div></div>
          <div class="pain-item"><div class="pain-icon">&#128247;</div><div class="pain-text">Пролистываете чужие фото в ленте и думаете: «Почему не я?»</div></div>
          <div class="pain-item"><div class="pain-icon">&#128534;</div><div class="pain-text">Скачивали трекеры калорий — но забрасывали через два дня, потому что вбивать каждый продукт вручную — это пытка</div></div>
          <div class="pain-item"><div class="pain-icon">&#129300;</div><div class="pain-text">Мечтаете об одном простом ответе: «Что мне съесть сегодня, чтобы не навредить себе?»</div></div>
        </div>
        <div class="pain-visual fade-in" style="transition-delay: 0.15s">
          <div class="pain-card">
            <div class="pain-card-emoji">&#129371;</div>
            <div class="pain-card-quote">«Хватит считать. Пусть AI считает за вас.»</div>
            <div class="pain-card-note">Smart-Fit берёт рутину на себя</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="how-it-works">
    <div class="container">
      <div class="section-label">Как это работает</div>
      <h2 class="section-title">Три способа записать еду.<br><em>Тридцать секунд</em> каждый.</h2>
      <div class="steps">
        <div class="step fade-in">
          <div class="step-number">1</div>
          <div class="step-icon">&#128248;</div>
          <h3>Наведите камеру</h3>
          <p>AI мгновенно разложит блюдо на калории, белки, жиры и углеводы. Никаких баз, никаких весов, никаких таблиц.</p>
        </div>
        <div class="step fade-in" style="transition-delay: 0.12s">
          <div class="step-number">2</div>
          <div class="step-icon">&#127897;</div>
          <h3>Расскажите голосом</h3>
          <p>«Паста карбонара и капучино с овсяным» — и запись уже в дневнике. Стильно, быстро, без лишних движений.</p>
        </div>
        <div class="step fade-in" style="transition-delay: 0.24s">
          <div class="step-number">3</div>
          <div class="step-icon">&#9997;&#65039;</div>
          <h3>Или напишите текстом</h3>
          <p>Для тех, кто любит контроль — укажите блюдо и граммовку. Smart-Fit сделает остальное.</p>
        </div>
      </div>
      <p class="how-note">Работает на iOS, Android и в браузере</p>
    </div>
  </section>

  <section class="features">
    <div class="container">
      <div class="section-label">Возможности</div>
      <h2 class="section-title">Что Smart-Fit делает<br><em>за вас</em> каждый день</h2>
      <div class="features-grid">
        <div class="feature-card fade-in">
          <div class="feature-card-icon">&#9889;</div>
          <h3>Считает всё автоматически</h3>
          <p>Фото, голос или текст — и калории с нутриентами уже в дневнике. Забудьте про кухонные весы и бесконечный скроллинг по базам продуктов.</p>
        </div>
        <div class="feature-card fade-in" style="transition-delay: 0.1s">
          <div class="feature-card-icon">&#127869;</div>
          <h3>Собирает персональное меню</h3>
          <p>Каждый день — завтрак, обед, ужин и перекусы. Всё сбалансировано под ваши цели, ваш ритм, ваши предпочтения.</p>
        </div>
        <div class="feature-card fade-in" style="transition-delay: 0.2s">
          <div class="feature-card-icon">&#128200;</div>
          <h3>Честная картина дня</h3>
          <p>Что съедено, сколько осталось, где вы вышли за рамки. Переели жиров за обедом? Smart-Fit мягко перестроит ваш вечер.</p>
        </div>
        <div class="feature-card fade-in" style="transition-delay: 0.3s">
          <div class="feature-card-icon">&#127919;</div>
          <h3>Ведёт ваш прогресс</h3>
          <p>Графики веса, динамика калорийности по неделям, прогноз — когда вы придёте к цели. Конкретные цифры вместо размытых обещаний.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="onboarding">
    <div class="container">
      <div class="onboarding-inner fade-in">
        <div class="section-label" style="justify-content: center;">Быстрый старт</div>
        <h2 class="section-title">Начать легче,<br><em>чем кажется</em></h2>
        <div class="onboarding-steps">
          <div class="ob-step"><div class="ob-step-dot">&#9792;&#65039;</div><div class="ob-step-label">Пол</div></div>
          <div class="ob-step"><div class="ob-step-dot">&#127874;</div><div class="ob-step-label">Возраст</div></div>
          <div class="ob-step"><div class="ob-step-dot">&#128207;</div><div class="ob-step-label">Параметры</div></div>
          <div class="ob-step"><div class="ob-step-dot">&#127919;</div><div class="ob-step-label">Цель</div></div>
          <div class="ob-step"><div class="ob-step-dot">&#127939;</div><div class="ob-step-label">Активность</div></div>
        </div>
        <p class="section-sub">
          Пять простых вопросов при первом запуске — и через три минуты у вас персональная норма калорий, белков, жиров и углеводов. Дальше просто живите свою жизнь, фотографируйте еду и следуйте плану.
        </p>
        <a href="/login" class="btn-primary">
          Узнать свою норму
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </section>

  <section class="timeline">
    <div class="container">
      <div class="section-label">Путь к результату</div>
      <h2 class="section-title">Что вас <em>ждёт</em></h2>
      <div class="timeline-track">
        <div class="timeline-card fade-in">
          <div class="timeline-card-when">Через неделю</div>
          <ul>
            <li>Тревога уходит — вы наконец точно знаете, что ваш рацион в порядке</li>
            <li>Никакого мучительного выбора перед холодильником — вы знаете, что есть</li>
          </ul>
        </div>
        <div class="timeline-card fade-in" style="transition-delay: 0.12s">
          <div class="timeline-card-when">Через месяц</div>
          <ul>
            <li>Цифры на весах тают — стабильно, неделя за неделей</li>
            <li>Это уже не диета. Это ваша новая привычка — лёгкая и приятная</li>
          </ul>
        </div>
        <div class="timeline-card fade-in" style="transition-delay: 0.24s">
          <div class="timeline-card-when">К вашему дедлайну</div>
          <ul>
            <li>Тот самый купальник. То самое платье. Тот самый образ.</li>
            <li>Вы смотрите в зеркало — и вам наконец нравится то, что вы видите</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="faq">
    <div class="container">
      <div class="section-label">Частые вопросы</div>
      <h2 class="section-title">А если у меня <em>сомнения?</em></h2>
      <div class="faq-grid">
        <div class="faq-item fade-in">
          <div class="faq-q">«Я уже пробовала трекеры — хватало на три дня»</div>
          <div class="faq-a">Потому что вручную вбивать каждый продукт — это невыносимо скучно. Smart-Fit устроен иначе: фото или голосовое, тридцать секунд — готово. Когда это настолько легко, бросать просто нечего.</div>
        </div>
        <div class="faq-item fade-in" style="transition-delay: 0.1s">
          <div class="faq-q">«Я ничего не понимаю в калориях и БЖУ»</div>
          <div class="faq-a">И не нужно. Серьёзно. Вы указываете цель — приложение само рассчитает норму, соберёт меню и поведёт вас за руку. Никаких формул, никаких таблиц — только результат.</div>
        </div>
        <div class="faq-item fade-in" style="transition-delay: 0.2s">
          <div class="faq-q">«А вдруг AI ошибётся с распознаванием?»</div>
          <div class="faq-a">На повседневных блюдах точность высокая. Если приложение сомневается, оно честно попросит уточнить. А для прогресса важна не аптечная точность, а стабильный тренд — и здесь Smart-Fit не подведёт.</div>
        </div>
        <div class="faq-item fade-in" style="transition-delay: 0.3s">
          <div class="faq-q">«Мои данные в безопасности?»</div>
          <div class="faq-a">Абсолютно. Данные зашифрованы и никуда не передаются. А при наличии заболеваний — проконсультируйтесь с врачом, мы за осознанный подход.</div>
        </div>
      </div>
    </div>
  </section>

  <section class="compare">
    <div class="container">
      <div class="section-label">Сравнение</div>
      <h2 class="section-title">Почему не <em>другие</em> приложения</h2>
      <div class="compare-table-wrap fade-in">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Функция</th><th>MyFitnessPal</th><th>FatSecret</th><th>Yazio</th><th>Smart-Fit</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Распознавание еды по фото</td><td class="cross">—</td><td class="cross">—</td><td class="cross">—</td><td class="check">&#10003;</td></tr>
            <tr><td>Голосовой ввод</td><td class="cross">—</td><td class="cross">—</td><td class="cross">—</td><td class="check">&#10003;</td></tr>
            <tr><td>Персональное меню на день</td><td class="cross">—</td><td class="cross">—</td><td class="check">&#10003;</td><td class="check">&#10003;</td></tr>
            <tr><td>Умная аналитика</td><td class="cross">—</td><td class="cross">—</td><td>Базовая</td><td class="check">&#10003;</td></tr>
            <tr><td>Быстрый ввод (&lt;30 сек)</td><td class="cross">—</td><td class="cross">—</td><td class="cross">—</td><td class="check">&#10003;</td></tr>
            <tr><td>Цена</td><td>~7 500 ₽/год</td><td>Бесплатно</td><td>~4 500 ₽/год</td><td>от 299 ₽/мес</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="pricing" id="pricing">
    <div class="container">
      <div style="text-align: center;">
        <div class="section-label" style="justify-content: center;">Тарифы</div>
        <h2 class="section-title" style="text-align: center;">Выберите <em>свой план</em></h2>
      </div>
      <div class="pricing-cards">
        <div class="pricing-card fade-in">
          <div class="pricing-card-name">Free</div>
          <div class="pricing-card-price">0 &#8381;</div>
          <div class="pricing-card-period">Навсегда бесплатно</div>
          <ul class="pricing-features">
            <li><span class="icon yes">&#10003;</span> Логирование еды текстом</li>
            <li><span class="icon yes">&#10003;</span> Дневник и прогресс</li>
            <li><span class="icon no">—</span> Распознавание по фото</li>
            <li><span class="icon no">—</span> Голосовой ввод</li>
            <li><span class="icon no">—</span> Генерация плана питания</li>
            <li><span class="icon no">—</span> Расширенная аналитика</li>
          </ul>
          <a href="/login" class="btn-secondary">Начать бесплатно</a>
        </div>
        <div class="pricing-card featured fade-in" style="transition-delay: 0.12s">
          <div class="pricing-card-badge">7 дней бесплатно</div>
          <div class="pricing-card-name">Pro</div>
          <div class="pricing-card-price">299 &#8381; <span>/ мес</span></div>
          <div class="pricing-card-period">Без привязки карты. Отмена в любой момент.</div>
          <ul class="pricing-features">
            <li><span class="icon yes">&#10003;</span> Всё из Free</li>
            <li><span class="icon yes">&#10003;</span> Распознавание еды по фото</li>
            <li><span class="icon yes">&#10003;</span> Голосовой ввод</li>
            <li><span class="icon yes">&#10003;</span> Генерация плана питания</li>
            <li><span class="icon yes">&#10003;</span> Расширенная аналитика</li>
          </ul>
          <a href="/login" class="btn-primary">Попробовать Pro бесплатно</a>
        </div>
      </div>
    </div>
  </section>

  <section class="cta-final">
    <div class="container">
      <div class="cta-final-inner fade-in">
        <h2 class="section-title">Хватит считать.<br>Пора <em>нравиться себе.</em></h2>
        <p class="section-sub">
          Пусть AI возьмёт рутину на себя — а вы займитесь тем, что действительно важно. Ваше тело скажет спасибо.
        </p>
        <a href="/login" class="btn-primary">
          Попробовать Smart-Fit бесплатно
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
        <p class="cta-final-note">Без привязки карты. Регистрация — 30 секунд.</p>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <a href="/" class="logo">Smart<span>-</span>Fit</a>
      <p>&copy; 2026 Smart-Fit. Все права защищены.</p>
    </div>
  </footer>
`;

export default function LandingPage() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px 60px 0px' }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div dangerouslySetInnerHTML={{ __html: LANDING_HTML }} />
    </>
  );
}
