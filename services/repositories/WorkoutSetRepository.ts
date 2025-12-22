import { getDatabase } from '@/database';
import type { CreateWorkoutSetInput, WorkoutSet } from '@/types/workoutSet.type';

export class WorkoutSetRepository {
    private mapRow(row: any): WorkoutSet {
        return {
            id: row.id,
            workoutExerciseId: row.workout_exercise_id,
            setNumber: row.set_number,
            reps: row.reps,
            weightKg: row.weight_kg,
            durationSeconds: row.duration_seconds,
            restSeconds: row.rest_seconds,
            startedAt: row.started_at,
            endedAt: row.ended_at,
        };
    }

    async findByWorkoutExerciseId(workoutExerciseId: number): Promise<WorkoutSet[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM workout_sets WHERE workout_exercise_id = ? ORDER BY set_number ASC',
            [workoutExerciseId]
        );
        return rows.map(this.mapRow.bind(this));
    }

    async create(data: CreateWorkoutSetInput): Promise<WorkoutSet> {
        const db = getDatabase();
        const result = await db.runAsync(
            `INSERT INTO workout_sets (workout_exercise_id, set_number, reps, weight_kg, duration_seconds, rest_seconds, started_at, ended_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.workoutExerciseId,
                data.setNumber,
                data.reps ?? null,
                data.weightKg ?? null,
                data.durationSeconds ?? null,
                data.restSeconds ?? null,
                data.startedAt ?? null,
                data.endedAt ?? null,
            ]
        );
        const dbRow = await db.getFirstAsync<any>('SELECT * FROM workout_sets WHERE id = ?', [result.lastInsertRowId]);
        return this.mapRow(dbRow);
    }
}

export const workoutSetRepository = new WorkoutSetRepository();
