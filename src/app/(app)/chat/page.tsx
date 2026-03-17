'use client';
import { useEffect, useRef, useState } from 'react';
import NavBar from '@/components/NavBar';
import type { ChatMessage } from '@/lib/types';

const QUICK_PROMPTS = [
  { text: 'Что мне поесть на ужин?', emoji: '🌙' },
  { text: 'Как у меня дела с прогрессом?', emoji: '📈' },
  { text: 'Проверь мой рацион за сегодня', emoji: '🔍' },
  { text: 'Что съесть после тренировки?', emoji: '💪' },
  { text: 'Чего мне не хватает в питании?', emoji: '🧪' },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/chat').then(r => r.json()).then((msgs: ChatMessage[]) => {
      setMessages(msgs); setInitialLoad(false);
    });
  }, []);

  useEffect(() => {
    if (!initialLoad) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, initialLoad]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: ChatMessage = { id: Date.now(), user_id: 1, role: 'user', content: msg, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      const aiMsg: ChatMessage = { id: Date.now() + 1, user_id: 1, role: 'assistant', content: data.message, created_at: new Date().toISOString() };
      setMessages(prev => [...prev, aiMsg]);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const clearChat = async () => {
    if (!confirm('Очистить историю чата?')) return;
    await fetch('/api/chat', { method: 'DELETE' });
    setMessages([]);
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', paddingBottom: 88 }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img src="/nutritionist.jpg" alt="AI-нутрициолог" style={{
              width: 46, height: 46, borderRadius: 14, objectFit: 'cover',
              border: '2px solid var(--amber-border)',
              boxShadow: '0 2px 10px rgba(232,137,12,0.2)',
            }} />
            <div style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 12, height: 12, borderRadius: '50%',
              background: 'var(--green)', border: '2px solid var(--surface)',
              boxShadow: '0 0 6px var(--green)',
            }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 17 }}>AI-нутрициолог</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>онлайн · знает твой рацион</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="btn-ghost" style={{ fontSize: 12, color: 'var(--muted)' }} onClick={clearChat}>🗑️ Очистить</button>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {isEmpty && (
          <div className="animate-fade-up" style={{ padding: '24px 8px' }}>
            {/* Welcome card */}
            <div className="card food-pattern" style={{ textAlign: 'center', padding: '32px 20px', marginBottom: 20, borderColor: 'var(--amber-border)', background: 'linear-gradient(135deg, #FFFDF7, #FFF8EC)' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }} className="animate-float">
                <img src="/nutritionist.jpg" alt="AI-нутрициолог" style={{
                  width: 88, height: 88, borderRadius: '50%', objectFit: 'cover',
                  border: '3px solid var(--amber-border)',
                  boxShadow: '0 4px 20px rgba(232,137,12,0.25)',
                }} />
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 18, height: 18, borderRadius: '50%',
                  background: 'var(--green)', border: '3px solid var(--surface)',
                  boxShadow: '0 0 8px var(--green)',
                }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Привет! Я твой AI-нутрициолог</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
                Я знаю твой профиль, что ты ел сегодня<br />и каковы твои цели. Спроси меня что угодно!
              </p>
            </div>

            {/* Quick prompts */}
            <div style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: 'Syne' }}>
              Попробуй спросить:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {QUICK_PROMPTS.map(({ text, emoji }) => (
                <button key={text} onClick={() => send(text)} style={{
                  background: 'var(--surface)', border: '1.5px solid var(--border)',
                  borderRadius: 14, padding: '13px 16px',
                  color: 'var(--text)', fontSize: 14, cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.2s',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <span style={{ fontSize: 20 }}>{emoji}</span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id ?? i} className="animate-fade-up" style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: 8,
            marginBottom: 12,
          }}>
            {msg.role === 'assistant' && (
              <img src="/nutritionist.jpg" alt="" style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                objectFit: 'cover', border: '1.5px solid var(--amber-border)',
                boxShadow: '0 1px 6px rgba(232,137,12,0.15)',
              }} />
            )}
            <div className={msg.role === 'user' ? 'chat-user' : 'chat-assistant'} style={{
              maxWidth: '78%', padding: '12px 16px', fontSize: 14, lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
            <img src="/nutritionist.jpg" alt="" style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              objectFit: 'cover', border: '1.5px solid var(--amber-border)',
              boxShadow: '0 1px 6px rgba(232,137,12,0.15)',
            }} />
            <div className="chat-assistant" style={{ padding: '14px 18px', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: 'var(--muted)',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
              <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}`}</style>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts (compact, when has messages) */}
      {messages.length > 0 && !loading && (
        <div style={{ padding: '6px 16px', display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0 }}>
          {QUICK_PROMPTS.slice(0, 3).map(({ text, emoji }) => (
            <button key={text} onClick={() => send(text)} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 12px', color: 'var(--text-secondary)',
              fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
              fontFamily: 'DM Sans, sans-serif', flexShrink: 0,
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 5,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {emoji} {text}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '10px 16px 12px',
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', gap: 10, alignItems: 'flex-end',
        flexShrink: 0,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.04)',
      }}>
        <textarea
          ref={inputRef}
          className="input"
          placeholder="Спроси о питании..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={1}
          style={{ flex: 1, resize: 'none', overflowY: 'auto', maxHeight: 100, lineHeight: 1.5 }}
        />
        <button onClick={() => send()} disabled={!input.trim() || loading} style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: input.trim() && !loading ? 'var(--amber)' : 'var(--surface2)',
          border: `1.5px solid ${input.trim() && !loading ? 'var(--amber)' : 'var(--border)'}`,
          cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', fontSize: 18, fontWeight: 700, color: input.trim() && !loading ? '#fff' : 'var(--muted)',
          boxShadow: input.trim() && !loading ? '0 2px 8px rgba(232,137,12,0.3)' : 'none',
        }}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '↑'}
        </button>
      </div>

      <NavBar />
    </div>
  );
}
