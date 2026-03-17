'use client';
import { useEffect, useState } from 'react';

interface Ingredient {
  emoji: string;
  name: string;
  amount: string;
  unit: string;
}

interface Recipe {
  title: string;
  description: string;
  cook_time: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  ingredients: Ingredient[];
  steps: string[];
  tip: string;
}

interface RecipeModalProps {
  dishName: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
  weight_grams?: number | null;
  foodEmoji: string;
  onClose: () => void;
}

const DIFFICULTY_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  easy:   { label: '🟢 Просто', color: 'var(--green)', bg: 'var(--green-light)' },
  medium: { label: '🟡 Средне', color: '#B45309', bg: '#FEF3C7' },
  hard:   { label: '🔴 Сложно', color: 'var(--red)', bg: 'var(--red-light)' },
};

export default function RecipeModal({ dishName, calories, protein, fat, carbs, weight_grams, foodEmoji, onClose }: RecipeModalProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'recipe' | 'shopping'>('recipe');

  useEffect(() => {
    fetch('/api/recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: dishName, calories, protein, fat, carbs, weight_grams }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setRecipe(data);
      })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [dishName, calories, protein, fat, carbs, weight_grams]);

  const diff = recipe ? (DIFFICULTY_LABEL[recipe.difficulty] ?? DIFFICULTY_LABEL.easy) : null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300,
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg)', borderRadius: '24px 24px 0 0',
          width: '100%', maxHeight: '90vh',
          border: '1px solid var(--border)', borderBottom: 'none',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'var(--amber-light)', border: '1.5px solid var(--amber-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28,
              }}>
                {foodEmoji}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.2, marginBottom: 3 }}>
                  {recipe?.title ?? dishName}
                </h2>
                {recipe?.description && (
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {recipe.description}
                  </p>
                )}
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ fontSize: 22, padding: '4px 8px', flexShrink: 0 }}>×</button>
          </div>

          {/* Meta pills */}
          {recipe && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--amber-light)', border: '1px solid var(--amber-border)', borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ fontSize: 14 }}>⏱️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--amber)' }}>{recipe.cook_time} мин</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--blue-light)', border: '1px solid #BFDBFE', borderRadius: 20, padding: '4px 12px' }}>
                <span style={{ fontSize: 14 }}>🍽️</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blue)' }}>{recipe.servings} порц.</span>
              </div>
              {diff && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: diff.bg, border: `1px solid ${diff.color}30`, borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: diff.color }}>{diff.label}</span>
                </div>
              )}
              {calories && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px' }}>
                  <span style={{ fontSize: 14 }}>🔥</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{calories} ккал</span>
                </div>
              )}
            </div>
          )}

          {/* КБЖУ row */}
          {recipe && calories && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
              {[
                { label: '🥩 Б', value: protein, color: 'var(--green)', bg: 'var(--green-light)' },
                { label: '🧈 Ж', value: fat, color: 'var(--amber)', bg: 'var(--amber-light)' },
                { label: '🍞 У', value: carbs, color: 'var(--blue)', bg: 'var(--blue-light)' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: bg, borderRadius: 10, padding: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontFamily: 'Syne', fontWeight: 800, color }}>{value}г</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab switcher */}
        {recipe && (
          <div style={{ padding: '12px 20px 0', display: 'flex', gap: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
            {(['recipe', 'shopping'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: 'Syne', fontWeight: 700, fontSize: 13,
                color: activeTab === tab ? 'var(--amber)' : 'var(--muted)',
                borderBottom: `2px solid ${activeTab === tab ? 'var(--amber)' : 'transparent'}`,
                transition: 'all 0.2s',
                marginBottom: -1,
              }}>
                {tab === 'recipe' ? '👨‍🍳 Рецепт' : '🛒 Список продуктов'}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }} className="animate-float">👨‍🍳</div>
              <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Составляю рецепт...</div>
              <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 20 }}>AI изучает блюдо</div>
              <div className="spinner" style={{ margin: '0 auto', borderTopColor: 'var(--amber)' }} />
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Не удалось загрузить рецепт</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{error}</div>
            </div>
          )}

          {/* Recipe tab */}
          {recipe && !loading && activeTab === 'recipe' && (
            <div className="animate-fade-up">
              <div style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                📋 Шаги приготовления
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {recipe.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '12px 14px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne', fontWeight: 800, fontSize: 13, color: 'var(--amber)',
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)', margin: 0 }}>{step}</p>
                  </div>
                ))}
              </div>

              {/* Tip */}
              {recipe.tip && (
                <div style={{
                  marginTop: 16, background: 'var(--amber-light)', border: '1.5px solid var(--amber-border)',
                  borderRadius: 14, padding: '12px 16px',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>{recipe.tip}</p>
                </div>
              )}
            </div>
          )}

          {/* Shopping list tab */}
          {recipe && !loading && activeTab === 'shopping' && (
            <div className="animate-fade-up">
              <div style={{ fontSize: 13, fontFamily: 'Syne', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
                🛒 Продукты на {recipe.servings} порц.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recipe.ingredients.map((ing, i) => (
                  <ShoppingItem key={i} ingredient={ing} />
                ))}
              </div>

              {/* Total count */}
              <div style={{
                marginTop: 16, background: 'var(--green-light)', border: '1px solid #BBF7D0',
                borderRadius: 14, padding: '12px 16px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                  ✅ {recipe.ingredients.length} ингредиентов
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ShoppingItem({ ingredient }: { ingredient: Ingredient }) {
  const [checked, setChecked] = useState(false);
  return (
    <div
      onClick={() => setChecked(c => !c)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: checked ? 'var(--surface2)' : 'var(--surface)',
        border: `1.5px solid ${checked ? 'var(--border)' : 'var(--border)'}`,
        borderRadius: 14, padding: '12px 14px',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: 'var(--shadow-sm)',
        opacity: checked ? 0.55 : 1,
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
        background: checked ? 'var(--green)' : 'var(--surface)',
        border: `2px solid ${checked ? 'var(--green)' : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
      }}>
        {checked && <span style={{ color: '#fff', fontSize: 14, lineHeight: 1 }}>✓</span>}
      </div>

      {/* Emoji */}
      <span style={{ fontSize: 22, flexShrink: 0 }}>{ingredient.emoji}</span>

      {/* Name */}
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 500,
        textDecoration: checked ? 'line-through' : 'none',
        color: checked ? 'var(--muted)' : 'var(--text)',
        transition: 'all 0.2s',
      }}>
        {ingredient.name}
      </span>

      {/* Amount */}
      <span style={{
        fontSize: 13, fontFamily: 'Syne', fontWeight: 700,
        color: checked ? 'var(--muted)' : 'var(--amber)',
        whiteSpace: 'nowrap',
      }}>
        {ingredient.amount} {ingredient.unit}
      </span>
    </div>
  );
}
