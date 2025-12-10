import { getDatabase } from '@/database';
import type { CreateSessionInput, Session } from '@/types/session.type';

export class SessionRepository {
    /**
     * Transforme les données de la base (snake_case) en objet TypeScript (camelCase)
     */
    private mapRow(row: any): Session {
        return {
            id: row.id,
            programId: row.program_id,
            name: row.name,
            type: row.type,
            plannedAt: row.planned_at,
            repeatRule: row.repeat_rule,
            notificationEnabled: row.notification_enabled,
            notificationOffsetMinutes: row.notification_offset_minutes,
            timezone: row.timezone,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    /**
     * Récupère toutes les sessions
     */
    async findAll(): Promise<Session[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM sessions ORDER BY created_at DESC'
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère les sessions planifiées (avec plannedAt défini)
     */
    async findPlanned(): Promise<Session[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM sessions WHERE planned_at IS NOT NULL ORDER BY planned_at ASC'
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère les sessions par programme
     */
    async findByProgramId(programId: number): Promise<Session[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM sessions WHERE program_id = ? ORDER BY created_at DESC',
            [programId]
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Récupère une session par son ID
     */
    async findById(id: number): Promise<Session | null> {
        const db = getDatabase();
        const row = await db.getFirstAsync<any>(
            'SELECT * FROM sessions WHERE id = ?',
            [id]
        );
        return row ? this.mapRow(row) : null;
    }

    /**
     * Récupère les sessions par type
     */
    async findByType(type: 'AMRAP' | 'HIIT' | 'EMOM' | 'CUSTOM'): Promise<Session[]> {
        const db = getDatabase();
        const rows = await db.getAllAsync<any>(
            'SELECT * FROM sessions WHERE type = ? ORDER BY created_at DESC',
            [type]
        );
        return rows.map(row => this.mapRow(row));
    }

    /**
     * Crée une nouvelle session
     */
    async create(data: CreateSessionInput): Promise<Session> {
        const db = getDatabase();
        const now = Date.now();

        const result = await db.runAsync(
            `INSERT INTO sessions (
                program_id, 
                name, 
                type, 
                planned_at, 
                repeat_rule, 
                notification_enabled, 
                notification_offset_minutes, 
                timezone, 
                created_at, 
                updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                data.programId ?? null,
                data.name,
                data.type,
                data.plannedAt ?? null,
                data.repeatRule ?? null,
                data.notificationEnabled,
                data.notificationOffsetMinutes ?? null,
                data.timezone ?? null,
                now,
                now,
            ]
        );

        const session = await this.findById(result.lastInsertRowId);
        if (!session) {
            throw new Error('Échec de création de la session');
        }

        return session;
    }

    /**
     * Met à jour une session existante
     */
    async update(id: number, data: Partial<CreateSessionInput>): Promise<Session> {
        const db = getDatabase();
        const now = Date.now();

        const fields: string[] = [];
        const values: any[] = [];

        if (data.programId !== undefined) {
            fields.push('program_id = ?');
            values.push(data.programId ?? null);
        }
        if (data.name !== undefined) {
            fields.push('name = ?');
            values.push(data.name);
        }
        if (data.type !== undefined) {
            fields.push('type = ?');
            values.push(data.type);
        }
        if (data.plannedAt !== undefined) {
            fields.push('planned_at = ?');
            values.push(data.plannedAt ?? null);
        }
        if (data.repeatRule !== undefined) {
            fields.push('repeat_rule = ?');
            values.push(data.repeatRule ?? null);
        }
        if (data.notificationEnabled !== undefined) {
            fields.push('notification_enabled = ?');
            values.push(data.notificationEnabled);
        }
        if (data.notificationOffsetMinutes !== undefined) {
            fields.push('notification_offset_minutes = ?');
            values.push(data.notificationOffsetMinutes ?? null);
        }
        if (data.timezone !== undefined) {
            fields.push('timezone = ?');
            values.push(data.timezone ?? null);
        }

        fields.push('updated_at = ?');
        values.push(now);
        values.push(id);

        await db.runAsync(
            `UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        const session = await this.findById(id);
        if (!session) {
            throw new Error('Session non trouvée après mise à jour');
        }

        return session;
    }

    /**
     * Supprime une session
     */
    async delete(id: number): Promise<void> {
        const db = getDatabase();
        await db.runAsync('DELETE FROM sessions WHERE id = ?', [id]);
    }

    /**
     * Compte le nombre total de sessions
     */
    async count(): Promise<number> {
        const db = getDatabase();
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM sessions'
        );
        return result?.count ?? 0;
    }

    /**
     * Compte le nombre de sessions par type
     */
    async countByType(type: 'AMRAP' | 'HIIT' | 'EMOM' | 'CUSTOM'): Promise<number> {
        const db = getDatabase();
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM sessions WHERE type = ?',
            [type]
        );
        return result?.count ?? 0;
    }
}

// Instance singleton
export const sessionRepository = new SessionRepository();
