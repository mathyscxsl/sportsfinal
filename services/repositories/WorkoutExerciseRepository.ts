import { getDatabase } from '@/database';
import type { CreateWorkoutExerciseInput, WorkoutExercise } from '@/types/workoutExercise.type';

export class WorkoutExerciseRepository {
    private mapRow(row: any): WorkoutExercise {
        return {
            id: row.id,
            workoutId: row.workout_id,
            sessionExerciseId: row.session_exercise_id,
            exerciseId: row.exercise_id,
            orderIndex: row.order_index,
            totalReps: row.total_reps,
            totalDurationSeconds: row.total_duration_seconds,
        };
    }

    async findById(id: number): Promise<WorkoutExercise | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>('SELECT * FROM workout_exercises WHERE id = ?', [id]);
        return row ? this.mapRow(row) : null;
    }

    async findByWorkoutId(workoutId: number): Promise<WorkoutExercise[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM workout_exercises WHERE workout_id = ? ORDER BY order_index ASC',
            [workoutId]
        );
        return rows.map(this.mapRow.bind(this));
    }

    async create(data: CreateWorkoutExerciseInput): Promise<WorkoutExercise> {
        const db = getDatabase();
        const result = await db.runAsync(
            `INSERT INTO workout_exercises (workout_id, session_exercise_id, exercise_id, order_index, total_reps, total_duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                data.workoutId,
                data.sessionExerciseId ?? null,
                data.exerciseId ?? null,
                data.orderIndex ?? 0,
                data.totalReps ?? null,
                data.totalDurationSeconds ?? null,
            ]
        );
        const created = await this.findById(result.lastInsertRowId);
        if (!created) throw new Error('Échec de création du workout_exercise');
        return created;
    }

    async update(id: number, data: Partial<CreateWorkoutExerciseInput>): Promise<WorkoutExercise> {
        const db = getDatabase();
        const fields: string[] = [];
        const values: any[] = [];

        if (data.workoutId !== undefined) { fields.push('workout_id = ?'); values.push(data.workoutId); }
        if (data.sessionExerciseId !== undefined) { fields.push('session_exercise_id = ?'); values.push(data.sessionExerciseId ?? null); }
        if (data.exerciseId !== undefined) { fields.push('exercise_id = ?'); values.push(data.exerciseId ?? null); }
        if (data.orderIndex !== undefined) { fields.push('order_index = ?'); values.push(data.orderIndex); }
        if (data.totalReps !== undefined) { fields.push('total_reps = ?'); values.push(data.totalReps ?? null); }
        if (data.totalDurationSeconds !== undefined) { fields.push('total_duration_seconds = ?'); values.push(data.totalDurationSeconds ?? null); }

        if (!fields.length) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('workout_exercise introuvable');
            return existing;
        }

        values.push(id);
        await db.runAsync(`UPDATE workout_exercises SET ${fields.join(', ')} WHERE id = ?`, values);
        const updated = await this.findById(id);
        if (!updated) throw new Error('workout_exercise introuvable après mise à jour');
        return updated;
    }
}

export const workoutExerciseRepository = new WorkoutExerciseRepository();
