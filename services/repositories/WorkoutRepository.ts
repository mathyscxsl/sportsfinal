import { getDatabase } from '@/database';
import type { CreateWorkoutInput, Workout } from '@/types/workout.type';

export class WorkoutRepository {
    private mapRow(row: any): Workout {
        return {
            id: row.id,
            programId: row.program_id,
            sessionId: row.session_id,
            startedAt: row.started_at,
            endedAt: row.ended_at,
            totalTimeSeconds: row.total_time_seconds,
            completed: row.completed,
            notes: row.notes,
        };
    }

    async findById(id: number): Promise<Workout | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>('SELECT * FROM workouts WHERE id = ?', [id]);
        return row ? this.mapRow(row) : null;
    }

    async findLastBySessionId(sessionId: number): Promise<Workout | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>(
            'SELECT * FROM workouts WHERE session_id = ? ORDER BY started_at DESC LIMIT 1',
            [sessionId]
        );
        return row ? this.mapRow(row) : null;
    }

    async create(data: CreateWorkoutInput): Promise<Workout> {
        const db = getDatabase();
        const result = await db.runAsync(
            `INSERT INTO workouts (program_id, session_id, started_at, ended_at, total_time_seconds, completed, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                data.programId ?? null,
                data.sessionId ?? null,
                data.startedAt ?? null,
                data.endedAt ?? null,
                data.totalTimeSeconds ?? null,
                data.completed ?? 0,
                data.notes ?? null,
            ]
        );

        const created = await this.findById(result.lastInsertRowId);
        if (!created) throw new Error("Échec de création du workout");
        return created;
    }

    async update(id: number, data: Partial<CreateWorkoutInput>): Promise<Workout> {
        const db = getDatabase();

        const fields: string[] = [];
        const values: any[] = [];

        if (data.programId !== undefined) { fields.push('program_id = ?'); values.push(data.programId ?? null); }
        if (data.sessionId !== undefined) { fields.push('session_id = ?'); values.push(data.sessionId ?? null); }
        if (data.startedAt !== undefined) { fields.push('started_at = ?'); values.push(data.startedAt ?? null); }
        if (data.endedAt !== undefined) { fields.push('ended_at = ?'); values.push(data.endedAt ?? null); }
        if (data.totalTimeSeconds !== undefined) { fields.push('total_time_seconds = ?'); values.push(data.totalTimeSeconds ?? null); }
        if (data.completed !== undefined) { fields.push('completed = ?'); values.push(data.completed); }
        if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes ?? null); }

        if (!fields.length) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Workout introuvable');
            return existing;
        }

        values.push(id);
        await db.runAsync(`UPDATE workouts SET ${fields.join(', ')} WHERE id = ?`, values);
        const updated = await this.findById(id);
        if (!updated) throw new Error('Workout introuvable après mise à jour');
        return updated;
    }
}

export const workoutRepository = new WorkoutRepository();
