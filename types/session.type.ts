export type Session = {
  id: number;
  programId?: number;
  name: string;
  type: 'AMRAP' | 'HIIT' | 'EMOM' | 'CUSTOM';
  plannedAt?: number;
  repeatRule?: string;
  notificationEnabled: 0 | 1;
  notificationOffsetMinutes?: number;
  timezone?: string;
  createdAt: number;
  updatedAt: number;
};

export type CreateSessionInput = Omit<Session, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateSessionInput = Partial<CreateSessionInput> & { id: number };