export type ExerciseCategory = 'cardio' | 'force' | 'mobilité' | 'autre';

export interface Exercise {
    id: number;
    name: string;
    category: ExerciseCategory | null;
    description: string | null;
    isCustom: boolean;
    createdAt: number;
    updatedAt: number;
}

export type CreateExerciseInput = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateExerciseInput = Partial<CreateExerciseInput> & { id: number };