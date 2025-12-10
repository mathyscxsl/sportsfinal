export type Program = {
  id: number;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateProgramInput = Omit<Program, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateProgramInput = Partial<CreateProgramInput> & { id: number };