export type WorkoutExercise = {
  id: number;
  workoutId: number;
  sessionExerciseId?: number;
  exerciseId?: number;
  orderIndex: number;
  totalReps?: number;
  totalDurationSeconds?: number;
};

export type CreateWorkoutExerciseInput = Omit<WorkoutExercise, 'id'>;
export type UpdateWorkoutExerciseInput = Partial<CreateWorkoutExerciseInput> & { id: number };