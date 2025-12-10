export type Program = {
  id: number;
  name: string;
  description?: string;
  created_at: number;
  updated_at: number;
};

export type Session = {
  id: number;
  program_id?: number;
  name: string;
  type: 'AMRAP' | 'HIIT' | 'EMOM' | 'CUSTOM';
  planned_at?: number;
  repeat_rule?: string;
  notification_enabled: 0 | 1;
  notification_offset_minutes?: number;
  timezone?: string;
  created_at: number;
  updated_at: number;
};

export type Exercise = {
  id: number;
  name: string;
  category?: string;
  description?: string;
  is_custom: 0 | 1;
  created_at: number;
  updated_at: number;
};

export type SessionExercise = {
  id: number;
  session_id: number;
  exercise_id?: number;
  custom_name?: string;
  order_index: number;
  sets?: number;
  target_reps?: number;
  target_duration_seconds?: number;
  rest_seconds_between_sets?: number;
  work_seconds?: number;
  rest_seconds?: number;
  emom_interval_seconds?: number;
  notes?: string;
  config_json?: string;
};

export type Workout = {
  id: number;
  program_id?: number;
  session_id?: number;
  started_at?: number;
  ended_at?: number;
  total_time_seconds?: number;
  completed: 0 | 1;
  notes?: string;
};

export type WorkoutExercise = {
  id: number;
  workout_id: number;
  session_exercise_id?: number;
  exercise_id?: number;
  order_index: number;
  total_reps?: number;
  total_duration_seconds?: number;
};

export type WorkoutSet = {
  id: number;
  workout_exercise_id: number;
  set_number: number;
  reps?: number;
  weight_kg?: number;
  duration_seconds?: number;
  rest_seconds?: number;
  started_at?: number;
  ended_at?: number;
};

export type Comment = {
  id: number;
  workout_id: number;
  workout_exercise_id?: number;
  content?: string;
  audio_uri?: string;
  created_at: number;
};

export type ScheduledNotification = {
  id: number;
  session_id: number;
  scheduled_for: number;
  notification_id?: string;
  created_at: number;
};