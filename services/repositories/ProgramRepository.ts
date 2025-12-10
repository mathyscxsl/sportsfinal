import { getDatabase } from '@/database';
import type { Program, CreateProgramInput, UpdateProgramInput } from '@/types/program.type';
import { programSessionRepository } from './ProgramSessionRepository';

export class ProgramRepository {
  /**
   * Transforme les données de la base (snake_case) en objet TypeScript (camelCase)
   */
  private mapRow(row: any): Program {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Récupère tous les programmes
   */
  async findAll(): Promise<Program[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM programs ORDER BY created_at DESC'
    );
    return rows.map(row => this.mapRow(row));
  }

  /**
   * Récupère un programme par son ID
   */
  async findById(id: number): Promise<Program | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM programs WHERE id = ?',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  /**
   * Compte le nombre de sessions dans un programme
   */
  async countSessions(programId: number): Promise<number> {
    return programSessionRepository.countSessionsByProgramId(programId);
  }

  /**
   * Récupère les programmes avec le nombre de sessions
   */
  async findAllWithSessionCount(): Promise<(Program & { sessionCount: number })[]> {
    const programs = await this.findAll();

    return Promise.all(
      programs.map(async (program) => {
        const sessionCount = await programSessionRepository.countSessionsByProgramId(program.id);
        return {
          ...program,
          sessionCount,
        };
      })
    );
  }

  /**
   * Récupère les séances d'un programme avec leurs IDs de liaison
   */
  async findSessionsWithProgramSessionIds(programId: number): Promise<(Session & { programSessionId: number, orderIndex: number })[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT s.*, ps.id as program_session_id, ps.order_index 
       FROM sessions s
       JOIN program_sessions ps ON s.id = ps.session_id
       WHERE ps.program_id = ?
       ORDER BY ps.order_index ASC`,
      [programId]
    );

    return rows.map(row => ({
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
      programSessionId: row.program_session_id,
      orderIndex: row.order_index
    }));
  }

  /**
   * Crée un nouveau programme
   */
  async create(data: CreateProgramInput): Promise<Program> {
    const db = getDatabase();
    const now = Date.now();

    const result = await db.runAsync(
      `INSERT INTO programs (name, description, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [
        data.name,
        data.description || null,
        now,
        now
      ]
    );

    const program = await this.findById(result.lastInsertRowId);
    if (!program) {
      throw new Error('Échec de création du programme');
    }

    return program;
  }

  /**
   * Met à jour un programme existant
   */
  async update(data: UpdateProgramInput): Promise<Program> {
    const db = getDatabase();
    const now = Date.now();

    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push('description = ?');
      values.push(data.description);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(data.id);

    await db.runAsync(
      `UPDATE programs SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    const program = await this.findById(data.id);
    if (!program) {
      throw new Error('Programme introuvable après mise à jour');
    }

    return program;
  }

  /**
   * Supprime un programme par son ID
   * Note: Les sessions liées seront également supprimées grâce au ON DELETE CASCADE
   */
  async delete(id: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.runAsync(
      'DELETE FROM programs WHERE id = ?',
      [id]
    );
    return result.changes > 0;
  }

  /**
   * Recherche des programmes par nom (recherche partielle)
   */
  async search(query: string): Promise<Program[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM programs WHERE name LIKE ? ORDER BY name ASC',
      [`%${query}%`]
    );
    return rows.map(row => this.mapRow(row));
  }
}

export const programRepository = new ProgramRepository();
