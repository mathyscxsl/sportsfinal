export type SessionExercise = {
  id: number;
  sessionId: number;
  exerciseId?: number;
  customName?: string;
  orderIndex: number;
  sets?: number;
  targetReps?: number;
  targetDurationSeconds?: number;
  restSecondsBetweenSets?: number;
  workSeconds?: number;
  restSeconds?: number;
  emomIntervalSeconds?: number;
  notes?: string;
  configJson?: string;
};

export type CreateSessionExerciseInput = Omit<SessionExercise, 'id'>;
export type UpdateSessionExerciseInput = Partial<CreateSessionExerciseInput> & { id: number };