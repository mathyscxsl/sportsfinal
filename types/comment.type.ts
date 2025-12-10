export type Comment = {
  id: number;
  workoutId: number;
  workoutExerciseId?: number;
  content?: string;
  audioUri?: string;
  createdAt: number;
};

export type CreateCommentInput = Omit<Comment, 'id' | 'createdAt'>;
export type UpdateCommentInput = Partial<CreateCommentInput> & { id: number };