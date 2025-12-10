import * as SQLite from 'expo-sqlite';
import { DB_FILE_NAME, migrations } from './migrations';
import { runSeeder } from './seeder';

let db: SQLite.SQLiteDatabase | null = null;

const applyMigrations = async (database: SQLite.SQLiteDatabase): Promise<void> => {
    // Récupérer les migrations déjà appliquées
    const result = await database.getAllAsync<{ id: number }>(
        'SELECT id FROM schema_migrations ORDER BY id'
    );
    const appliedIds = new Set(result.map(row => row.id));

    // Appliquer les migrations manquantes
    for (const migration of migrations) {
        if (!appliedIds.has(migration.id)) {
            console.log(`Applying migration ${migration.id}: ${migration.name}`);

            for (const statement of migration.statements) {
                await database.execAsync(statement);
            }

            // Enregistrer la migration
            await database.runAsync(
                'INSERT INTO schema_migrations (id, name, applied_at) VALUES (?, ?, ?)',
                [migration.id, migration.name, Date.now()]
            );
        }
    }
};

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
    if (db) {
        return db;
    }

    db = await SQLite.openDatabaseAsync(DB_FILE_NAME);

    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Créer la table des migrations si elle n'existe pas
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

    await applyMigrations(db);

    // Seed default data (exercises etc.)
    await runSeeder(db);

    return db;
};

export const getDatabase = (): SQLite.SQLiteDatabase => {
    if (!db) {
        throw new Error('Database not initialized. Call initDatabase first.');
    }
    return db;
};

export const closeDatabase = async (): Promise<void> => {
    if (db) {
        await db.closeAsync();
        db = null;
    }
};