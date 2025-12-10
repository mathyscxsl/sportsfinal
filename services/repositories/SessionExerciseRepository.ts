import { getDatabase } from '@/database';
import type { CreateSessionExerciseInput, SessionExercise } from '@/types/sessionExercise.type';

export class SessionExerciseRepository {
    /**
     * Transforme les données de la base (snake_case) en objet TypeScript (camelCase)
     */
    private mapRow(row: any): SessionExercise {
        return {
            id: row.id,
            sessionId: row.session_id,
            exerciseId: row.exercise_id,
            customName: row.custom_name,
            orderIndex: row.order_index,
            sets: row.sets,
            targetReps: row.target_reps,
            targetDurationSeconds: row.target_duration_seconds,
            restSecondsBetweenSets: row.rest_seconds_between_sets,
            workSeconds: row.work_seconds,
            restSeconds: row.rest_seconds,
            emomIntervalSeconds: row.emom_interval_seconds,
            notes: row.notes,
            configJson: row.config_json,
        };
    }

    /**
     * Récupère tous les exercices d'une session, triés par orderIndex
     */
    async findBySessionId(sessionId: number): Promise<SessionExercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index ASC',
            [sessionId]
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère un exercice de session par son ID
     */
    async findById(id: number): Promise<SessionExercise | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>(
            'SELECT * FROM session_exercises WHERE id = ?',
            [id]
        );
        return row ? this.mapRow(row) : null;
    }

    /**
     * Crée un nouvel exercice dans une session
     */
    async create(data: CreateSessionExerciseInput): Promise<SessionExercise> {
        const db = getDatabase();

        const result = await db.runAsync(
            `INSERT INTO session_exercises (
                session_id,
                exercise_id,
                custom_name,
                order_index,
                sets,
                target_reps,
                target_duration_seconds,
                rest_seconds_between_sets,
                work_seconds,
                rest_seconds,
                emom_interval_seconds,
                notes,
                config_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.sessionId,
                data.exerciseId ?? null,
                data.customName ?? null,
                data.orderIndex,
                data.sets ?? null,
                data.targetReps ?? null,
                data.targetDurationSeconds ?? null,
                data.restSecondsBetweenSets ?? null,
                data.workSeconds ?? null,
                data.restSeconds ?? null,
                data.emomIntervalSeconds ?? null,
                data.notes ?? null,
                data.configJson ?? null,
            ]
        );

        const sessionExercise = await this.findById(result.lastInsertRowId);
        if (!sessionExercise) {
            throw new Error('Échec de création de l\'exercice de session');
        }

        return sessionExercise;
    }

    /**
     * Met à jour un exercice de session
     */
    async update(id: number, data: Partial<CreateSessionExerciseInput>): Promise<SessionExercise> {
        const db = getDatabase();

        const fields: string[] = [];
        const values: any[] = [];

        if (data.exerciseId !== undefined) {
            fields.push('exercise_id = ?');
            values.push(data.exerciseId ?? null);
        }
        if (data.customName !== undefined) {
            fields.push('custom_name = ?');
            values.push(data.customName ?? null);
        }
        if (data.orderIndex !== undefined) {
            fields.push('order_index = ?');
            values.push(data.orderIndex);
        }
        if (data.sets !== undefined) {
            fields.push('sets = ?');
            values.push(data.sets ?? null);
        }
        if (data.targetReps !== undefined) {
            fields.push('target_reps = ?');
            values.push(data.targetReps ?? null);
        }
        if (data.targetDurationSeconds !== undefined) {
            fields.push('target_duration_seconds = ?');
            values.push(data.targetDurationSeconds ?? null);
        }
        if (data.restSecondsBetweenSets !== undefined) {
            fields.push('rest_seconds_between_sets = ?');
            values.push(data.restSecondsBetweenSets ?? null);
        }
        if (data.workSeconds !== undefined) {
            fields.push('work_seconds = ?');
            values.push(data.workSeconds ?? null);
        }
        if (data.restSeconds !== undefined) {
            fields.push('rest_seconds = ?');
            values.push(data.restSeconds ?? null);
        }
        if (data.emomIntervalSeconds !== undefined) {
            fields.push('emom_interval_seconds = ?');
            values.push(data.emomIntervalSeconds ?? null);
        }
        if (data.notes !== undefined) {
            fields.push('notes = ?');
            values.push(data.notes ?? null);
        }
        if (data.configJson !== undefined) {
            fields.push('config_json = ?');
            values.push(data.configJson ?? null);
        }

        if (fields.length === 0) {
            throw new Error('Aucune donnée à mettre à jour');
        }

        values.push(id);

        await db.runAsync(
            `UPDATE session_exercises SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        const sessionExercise = await this.findById(id);
        if (!sessionExercise) {
            throw new Error('Exercice de session non trouvé après mise à jour');
        }

        return sessionExercise;
    }

    /**
     * Supprime un exercice de session
     */
    async delete(id: number): Promise<void> {
        const db = getDatabase();
        await db.runAsync('DELETE FROM session_exercises WHERE id = ?', [id]);
    }

    /**
     * Supprime tous les exercices d'une session
     */
    async deleteBySessionId(sessionId: number): Promise<void> {
        const db = getDatabase();
        await db.runAsync('DELETE FROM session_exercises WHERE session_id = ?', [sessionId]);
    }

    /**
     * Réordonne les exercices d'une session
     * @param sessionId ID de la session
     * @param exerciseIds Tableau d'IDs d'exercices dans le nouvel ordre
     */
    async reorder(sessionId: number, exerciseIds: number[]): Promise<void> {
        const db = getDatabase();

        // Utiliser une transaction pour garantir la cohérence
        await db.withTransactionAsync(async () => {
            for (let i = 0; i < exerciseIds.length; i++) {
                await db.runAsync(
                    'UPDATE session_exercises SET order_index = ? WHERE id = ? AND session_id = ?',
                    [i, exerciseIds[i], sessionId]
                );
            }
        });
    }

    /**
     * Compte le nombre d'exercices dans une session
     */
    async countBySessionId(sessionId: number): Promise<number> {
        const db = getDatabase();
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM session_exercises WHERE session_id = ?',
            [sessionId]
        );
        return result?.count ?? 0;
    }

    /**
     * Récupère les exercices d'une session avec les détails de l'exercice
     * (jointure avec la table exercises)
     */
    async findBySessionIdWithExerciseDetails(sessionId: number): Promise<any[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            `SELECT 
                se.*,
                e.name as exercise_name,
                e.category as exercise_category,
                e.description as exercise_description
            FROM session_exercises se
            LEFT JOIN exercises e ON se.exercise_id = e.id
            WHERE se.session_id = ?
            ORDER BY se.order_index ASC`,
            [sessionId]
        );

        return rows.map(row => ({
            ...this.mapRow(row),
            exercise: row.exercise_id ? {
                id: row.exercise_id,
                name: row.exercise_name,
                category: row.exercise_category,
                description: row.exercise_description,
            } : null,
        }));
    }
}

// Instance singleton
export const sessionExerciseRepository = new SessionExerciseRepository();
