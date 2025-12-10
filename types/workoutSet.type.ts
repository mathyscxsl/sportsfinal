export type WorkoutSet = {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  reps?: number;
  weightKg?: number;
  durationSeconds?: number;
  restSeconds?: number;
  startedAt?: number;
  endedAt?: number;
};

export type CreateWorkoutSetInput = Omit<WorkoutSet, 'id'>;
export type UpdateWorkoutSetInput = Partial<CreateWorkoutSetInput> & { id: number };