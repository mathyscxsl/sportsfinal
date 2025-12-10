export type Workout = {
  id: number;
  programId?: number;
  sessionId?: number;
  startedAt?: number;
  endedAt?: number;
  totalTimeSeconds?: number;
  completed: 0 | 1;
  notes?: string;
};

export type CreateWorkoutInput = Omit<Workout, 'id'>;
export type UpdateWorkoutInput = Partial<CreateWorkoutInput> & { id: number };