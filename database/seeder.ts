import type * as SQLite from 'expo-sqlite';

type ExerciseSeed = {
  name: string;
  category?: string;
  description?: string;
  is_custom?: number;
};

const defaultExercises: ExerciseSeed[] = [
  { name: 'Pompes', category: 'strength', description: 'Pompes classiques au sol', is_custom: 0 },
  { name: 'Squats', category: 'strength', description: 'Squats au poids du corps', is_custom: 0 },
  { name: 'Fentes', category: 'strength', description: 'Fentes alternées', is_custom: 0 },
  { name: 'Gainage (planche)', category: 'core', description: 'Planche en appui sur les coudes', is_custom: 0 },
  { name: 'Burpees', category: 'cardio', description: 'Burpees complets', is_custom: 0 },
  { name: 'Mountain climbers', category: 'cardio', description: 'Montées de genoux en planche', is_custom: 0 },
  { name: 'Jumping jacks', category: 'cardio', description: 'Sauts écartés', is_custom: 0 },
  { name: 'Crunchs', category: 'core', description: 'Abdominaux crunchs', is_custom: 0 },
  { name: 'Planche latérale', category: 'core', description: 'Gainage latéral', is_custom: 0 },
  { name: 'Rowing haltères', category: 'strength', description: 'Rowing à un bras', is_custom: 0 },
];

export const runSeeder = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  const rows = await db.getAllAsync<{ name: string }>('SELECT name FROM exercises');
  const existing = new Set(rows.map(r => r.name.toLowerCase()));

  const toInsert = defaultExercises.filter(e => !existing.has(e.name.toLowerCase()));
  if (toInsert.length === 0) {
    return;
  }

  const nowExpr = "strftime('%s','now') * 1000";

  for (const e of toInsert) {
    await db.runAsync(
      `INSERT INTO exercises (name, category, description, is_custom, created_at, updated_at)
       VALUES (?, ?, ?, ?, ${nowExpr}, ${nowExpr})`,
      [e.name, e.category ?? null, e.description ?? null, e.is_custom ?? 0]
    );
  }
};
