export type Migration = {
	id: number;
	name: string;
	statements: string[];
};

export const DB_FILE_NAME = 'sportsfinal.db';

const initialSchema: Migration = {
	id: 1,
	name: 'initial_schema',
	statements: [
		"PRAGMA foreign_keys = ON;",

		`CREATE TABLE IF NOT EXISTS schema_migrations (
			id INTEGER PRIMARY KEY,
			name TEXT NOT NULL,
			applied_at INTEGER NOT NULL
		);`,

		`CREATE TABLE IF NOT EXISTS programs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
		);`,

		`CREATE TABLE IF NOT EXISTS sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			program_id INTEGER,
			name TEXT NOT NULL,
			type TEXT NOT NULL DEFAULT 'CUSTOM' CHECK (type IN ('AMRAP','HIIT','EMOM','CUSTOM')),
			planned_at INTEGER, -- epoch millis for the next planned occurrence
			repeat_rule TEXT,   -- optional RRULE string or custom JSON for repeating (weekly, etc.)
			notification_enabled INTEGER NOT NULL DEFAULT 0, -- 0/1
			notification_offset_minutes INTEGER DEFAULT 10,
			timezone TEXT,
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_program_id ON sessions(program_id);`,
		`CREATE INDEX IF NOT EXISTS idx_sessions_planned_at ON sessions(planned_at);`,

		`CREATE TABLE IF NOT EXISTS exercises (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			category TEXT,         -- e.g., cardio, strength, mobility
			description TEXT,
			is_custom INTEGER NOT NULL DEFAULT 1, -- 1 for user-defined, 0 for built-in
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000)
		);`,

		`CREATE TABLE IF NOT EXISTS session_exercises (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session_id INTEGER NOT NULL,
			exercise_id INTEGER,
			custom_name TEXT,          -- if exercise_id is null, use a custom name
			order_index INTEGER NOT NULL DEFAULT 0,
			sets INTEGER DEFAULT 1,
			target_reps INTEGER,             -- per set or overall target reps
			target_duration_seconds INTEGER, -- for AMRAP/time caps etc.
			rest_seconds_between_sets INTEGER,
			work_seconds INTEGER,            -- for HIIT work interval
			rest_seconds INTEGER,            -- for HIIT rest interval
			emom_interval_seconds INTEGER,   -- for EMOM minute/interval length
			notes TEXT,
			config_json TEXT,                -- flexible JSON for any extra config
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_session_exercises_session_id ON session_exercises(session_id);`,
		`CREATE INDEX IF NOT EXISTS idx_session_exercises_order ON session_exercises(session_id, order_index);`,

		`CREATE TABLE IF NOT EXISTS workouts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			program_id INTEGER,
			session_id INTEGER,
			started_at INTEGER,  -- epoch millis
			ended_at INTEGER,    -- epoch millis
			total_time_seconds INTEGER,
			completed INTEGER NOT NULL DEFAULT 0, -- 0/1
			notes TEXT,
			FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE SET NULL ON UPDATE CASCADE,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_workouts_session_id ON workouts(session_id);`,
		`CREATE INDEX IF NOT EXISTS idx_workouts_started_at ON workouts(started_at);`,

		`CREATE TABLE IF NOT EXISTS workout_exercises (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			workout_id INTEGER NOT NULL,
			session_exercise_id INTEGER,
			exercise_id INTEGER,
			order_index INTEGER NOT NULL DEFAULT 0,
			total_reps INTEGER,
			total_duration_seconds INTEGER,
			FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE SET NULL ON UPDATE CASCADE,
			FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);`,
		`CREATE INDEX IF NOT EXISTS idx_workout_exercises_order ON workout_exercises(workout_id, order_index);`,

		`CREATE TABLE IF NOT EXISTS workout_sets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			workout_exercise_id INTEGER NOT NULL,
			set_number INTEGER NOT NULL,
			reps INTEGER,
			weight_kg REAL,
			duration_seconds INTEGER,
			rest_seconds INTEGER,
			started_at INTEGER,
			ended_at INTEGER,
			FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE CASCADE ON UPDATE CASCADE
		);`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_sets_unique ON workout_sets(workout_exercise_id, set_number);`,

		`CREATE TABLE IF NOT EXISTS comments (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			workout_id INTEGER NOT NULL,
			workout_exercise_id INTEGER,
			content TEXT,
			audio_uri TEXT, -- local uri for recorded audio note
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (workout_exercise_id) REFERENCES workout_exercises(id) ON DELETE SET NULL ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_comments_workout_id ON comments(workout_id);`,
		`CREATE INDEX IF NOT EXISTS idx_comments_workout_exercise_id ON comments(workout_exercise_id);`,

		`CREATE TABLE IF NOT EXISTS scheduled_notifications (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			session_id INTEGER NOT NULL,
			scheduled_for INTEGER NOT NULL, -- epoch millis
			notification_id TEXT,           -- platform notification identifier
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_session_id ON scheduled_notifications(session_id);`
	]
};

const addProgramSessionsJunctionTable: Migration = {
	id: 2,
	name: 'add_program_sessions_junction_table',
	statements: [
		`CREATE TABLE IF NOT EXISTS program_sessions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			program_id INTEGER NOT NULL,
			session_id INTEGER NOT NULL,
			order_index INTEGER NOT NULL DEFAULT 0,
			created_at INTEGER NOT NULL DEFAULT (strftime('%s','now') * 1000),
			FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE ON UPDATE CASCADE,
			FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE ON UPDATE CASCADE
		);`,
		`CREATE INDEX IF NOT EXISTS idx_program_sessions_program_id ON program_sessions(program_id);`,
		`CREATE INDEX IF NOT EXISTS idx_program_sessions_session_id ON program_sessions(session_id);`,
		`CREATE INDEX IF NOT EXISTS idx_program_sessions_order ON program_sessions(program_id, order_index);`,

		// Migrer les données existantes: si une session a un program_id, créer l'entrée dans la table de jonction
		`INSERT INTO program_sessions (program_id, session_id, order_index, created_at)
		SELECT program_id, id, 0, created_at
		FROM sessions
		WHERE program_id IS NOT NULL;`,

		// Optionnel: On pourrait supprimer la colonne program_id de sessions, mais pour éviter de casser le code existant,
		// on la garde pour l'instant et on la met à NULL
		`UPDATE sessions SET program_id = NULL WHERE program_id IS NOT NULL;`
	]
};

export const migrations: Migration[] = [initialSchema, addProgramSessionsJunctionTable];

