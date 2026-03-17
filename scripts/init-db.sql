-- Smart-Fit Database Schema

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL DEFAULT 'Пользователь',
  gender VARCHAR(10) NOT NULL DEFAULT 'male',
  age INTEGER NOT NULL DEFAULT 28,
  height INTEGER NOT NULL DEFAULT 175,
  weight DECIMAL(5,1) NOT NULL DEFAULT 80,
  goal_weight DECIMAL(5,1) NOT NULL DEFAULT 70,
  goal_weeks INTEGER NOT NULL DEFAULT 12,
  activity_level VARCHAR(20) NOT NULL DEFAULT 'moderate',
  goal_type VARCHAR(20) NOT NULL DEFAULT 'lose',
  calories_norm INTEGER NOT NULL DEFAULT 1800,
  protein_norm INTEGER NOT NULL DEFAULT 120,
  fat_norm INTEGER NOT NULL DEFAULT 60,
  carbs_norm INTEGER NOT NULL DEFAULT 200,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS food_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  meal_type VARCHAR(20) NOT NULL, -- breakfast, lunch, dinner, snack
  name VARCHAR(200) NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein DECIMAL(6,1) NOT NULL DEFAULT 0,
  fat DECIMAL(6,1) NOT NULL DEFAULT 0,
  carbs DECIMAL(6,1) NOT NULL DEFAULT 0,
  weight_grams INTEGER,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  weight DECIMAL(5,1) NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, date)
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_date DATE NOT NULL,
  meals JSONB NOT NULL,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_protein INTEGER NOT NULL DEFAULT 0,
  total_fat INTEGER NOT NULL DEFAULT 0,
  total_carbs INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  role VARCHAR(20) NOT NULL, -- user, assistant
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed: one demo user
INSERT INTO users (
  name, gender, age, height, weight, goal_weight, goal_weeks,
  activity_level, goal_type, calories_norm, protein_norm, fat_norm, carbs_norm, onboarding_done
) VALUES (
  'Алексей', 'male', 29, 178, 86.0, 76.0, 16,
  'moderate', 'lose', 1950, 130, 65, 220, false
) ON CONFLICT DO NOTHING;

-- Seed: food logs for last 7 days
DO $$
DECLARE
  uid INTEGER;
  d DATE;
BEGIN
  SELECT id INTO uid FROM users LIMIT 1;

  -- Today
  d := CURRENT_DATE;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Овсянка с бананом и мёдом', 380, 12, 8, 68, 300, d),
    (uid, 'breakfast', 'Кофе с молоком', 45, 2, 2, 5, 200, d),
    (uid, 'lunch', 'Куриная грудка с рисом и овощами', 520, 48, 10, 58, 400, d),
    (uid, 'snack', 'Творог 5% с ягодами', 180, 20, 5, 14, 200, d);

  -- Yesterday
  d := CURRENT_DATE - 1;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Яичница из 3 яиц', 270, 18, 20, 2, 180, d),
    (uid, 'breakfast', 'Хлеб цельнозерновой', 140, 5, 2, 28, 80, d),
    (uid, 'lunch', 'Борщ со сметаной', 320, 12, 14, 38, 450, d),
    (uid, 'lunch', 'Хлеб', 70, 2, 1, 14, 40, d),
    (uid, 'dinner', 'Лосось на пару с брокколи', 410, 42, 22, 8, 350, d),
    (uid, 'snack', 'Яблоко', 80, 0, 0, 20, 180, d);

  -- 2 days ago
  d := CURRENT_DATE - 2;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Гречневая каша с маслом', 320, 10, 8, 55, 250, d),
    (uid, 'lunch', 'Суп с фрикадельками', 380, 22, 16, 34, 500, d),
    (uid, 'dinner', 'Куриная грудка с гречкой', 490, 46, 10, 52, 380, d),
    (uid, 'snack', 'Банан', 90, 1, 0, 23, 100, d),
    (uid, 'snack', 'Орехи грецкие', 150, 4, 14, 4, 30, d);

  -- 3 days ago
  d := CURRENT_DATE - 3;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Блинчики с творогом', 480, 22, 14, 64, 300, d),
    (uid, 'lunch', 'Салат Цезарь с курицей', 520, 36, 28, 30, 350, d),
    (uid, 'dinner', 'Рис с тушёными овощами', 360, 8, 8, 64, 400, d),
    (uid, 'snack', 'Кефир', 120, 8, 4, 12, 250, d);

  -- 4 days ago
  d := CURRENT_DATE - 4;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Омлет с сыром', 350, 24, 24, 4, 250, d),
    (uid, 'lunch', 'Куриный бульон с лапшой', 280, 18, 8, 32, 500, d),
    (uid, 'dinner', 'Котлеты паровые с картофелем', 540, 32, 22, 52, 400, d),
    (uid, 'snack', 'Виноград', 110, 1, 0, 28, 150, d);

  -- 5 days ago
  d := CURRENT_DATE - 5;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Творожники со сметаной', 420, 28, 16, 42, 280, d),
    (uid, 'lunch', 'Греческий салат с хлебом', 380, 10, 24, 32, 350, d),
    (uid, 'dinner', 'Запечённая горбуша с картофелем', 480, 38, 18, 40, 380, d),
    (uid, 'snack', 'Протеиновый батончик', 200, 20, 6, 18, 60, d);

  -- 6 days ago
  d := CURRENT_DATE - 6;
  INSERT INTO food_logs (user_id, meal_type, name, calories, protein, fat, carbs, weight_grams, date) VALUES
    (uid, 'breakfast', 'Мюсли с молоком', 410, 14, 10, 68, 300, d),
    (uid, 'lunch', 'Паста с курицей и томатным соусом', 560, 38, 14, 70, 400, d),
    (uid, 'dinner', 'Тушёная говядина с овощами', 500, 44, 24, 24, 380, d);

END $$;

-- Seed: weight logs for last 30 days
DO $$
DECLARE
  uid INTEGER;
  i INTEGER;
  base_weight DECIMAL := 86.0;
  w DECIMAL;
BEGIN
  SELECT id INTO uid FROM users LIMIT 1;
  FOR i IN 0..29 LOOP
    w := base_weight - (i * 0.08) + (random() * 0.4 - 0.2);
    INSERT INTO weight_logs (user_id, weight, date)
    VALUES (uid, ROUND(w::numeric, 1), CURRENT_DATE - i)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;
