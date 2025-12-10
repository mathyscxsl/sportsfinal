import {getDatabase} from '@/database';
import type {Exercise} from '@/types/exercise.type';

export class ExerciseRepository {
    /**
     * Transforme les données de la base (snake_case) en objet TypeScript (camelCase)
     */
    private mapRow(row: any): Exercise {
        return {
            id: row.id,
            name: row.name,
            category: row.category,
            description: row.description,
            isCustom: row.is_custom,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    /**
     * Récupère tous les exercices
     */
    async findAll(): Promise<Exercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM exercises ORDER BY name ASC'
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère un exercice par son ID
     */
    async findById(id: number): Promise<Exercise | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>(
            'SELECT * FROM exercises WHERE id = ?',
            [id]
        );
        return row ? this.mapRow(row) : null;
    }

    /**
     * Récupère les exercices par catégorie
     */
    async findByCategory(category: string): Promise<Exercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM exercises WHERE category = ? ORDER BY name ASC',
            [category]
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère uniquement les exercices personnalisés
     */
    async findCustom(): Promise<Exercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM exercises WHERE is_custom = 1 ORDER BY name ASC'
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Crée un nouvel exercice
     */
    async create(data: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Promise<Exercise> {
        const db = getDatabase();
        const now = Date.now();

        const result = await db.runAsync(
            `INSERT INTO exercises (name, category, description, is_custom, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.name,
                data.category || null,
                data.description || null,
                data.isCustom ?? 1,
                now,
                now
            ]
        );

        const exercise = await this.findById(result.lastInsertRowId);
        if (!exercise) {
            throw new Error('Échec de création de l\'exercice');
        }

        return exercise;
    }

    /**
     * Met à jour un exercice existant
     */
    async update(id: number, data: Partial<Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Exercise> {
        const db = getDatabase();
        const now = Date.now();

        const fields: string[] = [];
        const values: any[] = [];

        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.category !== undefined) {
            fields.push('category = ?');
            values.push(data.category);
        }
        if (data.description !== undefined) {
            fields.push('description = ?');
            values.push(data.description);
        }
        if (data.isCustom !== undefined) {
            fields.push('is_custom = ?');
            values.push(data.isCustom);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE exercises SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        const exercise = await this.findById(id);
        if (!exercise) {
            throw new Error('Exercice introuvable après mise à jour');
        }

        return exercise;
    }

    /**
     * Supprime un exercice par son ID
     */
    async delete(id: number): Promise<boolean> {
        const db = getDatabase();
        const result = await db.runAsync(
            'DELETE FROM exercises WHERE id = ?',
            [id]
        );
        return result.changes > 0;
    }

    /**
     * Recherche des exercices par nom (recherche partielle)
     */
    async search(query: string): Promise<Exercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM exercises WHERE name LIKE ? ORDER BY name ASC',
            [`%${query}%`]
        );
        return rows.map(row => this.mapRow(row));
    }
}

export const exerciseRepository = new ExerciseRepository();