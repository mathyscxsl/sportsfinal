import { getDatabase } from '@/database';

export type ProgramSession = {
  id: number;
  programId: number;
  sessionId: number;
  orderIndex: number;
  createdAt: number;
};

export class ProgramSessionRepository {
  /**
   * Transforme les données de la base (snake_case) en objet TypeScript (camelCase)
   */
  private mapRow(row: any): ProgramSession {
    return {
      id: row.id,
      programId: row.program_id,
      sessionId: row.session_id,
      orderIndex: row.order_index,
      createdAt: row.created_at,
    };
  }

  /**
   * Ajoute une séance à un programme
   */
  async addSessionToProgram(programId: number, sessionId: number): Promise<ProgramSession> {
    const db = getDatabase();
    const now = Date.now();

    // Trouver le prochain order_index
    const maxOrderResult = await db.getFirstAsync<{ max_order: number | null }>(
      'SELECT MAX(order_index) as max_order FROM program_sessions WHERE program_id = ?',
      [programId]
    );
    const nextOrder = (maxOrderResult?.max_order ?? -1) + 1;

    const result = await db.runAsync(
      `INSERT INTO program_sessions (program_id, session_id, order_index, created_at)
       VALUES (?, ?, ?, ?)`,
      [programId, sessionId, nextOrder, now]
    );

    const programSession = await this.findById(result.lastInsertRowId);
    if (!programSession) {
      throw new Error('Échec d\'ajout de la séance au programme');
    }

    return programSession;
  }

  /**
   * Retire une séance spécifique d'un programme
   * @param programSessionId L'ID de la liaison program_sessions à supprimer
   */
  async removeSessionFromProgram(programSessionId: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.runAsync(
      'DELETE FROM program_sessions WHERE id = ?',
      [programSessionId]
    );
    return result.changes > 0;
  }

  /**
   * Retire une occurrence spécifique d'une séance d'un programme
   * @param programId ID du programme
   * @param sessionId ID de la séance
   * @param orderIndex Index d'ordre de l'occurrence spécifique
   */
  async removeSpecificSessionOccurrence(programId: number, sessionId: number, orderIndex: number): Promise<boolean> {
    const db = getDatabase();
    const result = await db.runAsync(
      'DELETE FROM program_sessions WHERE program_id = ? AND session_id = ? AND order_index = ?',
      [programId, sessionId, orderIndex]
    );
    return result.changes > 0;
  }

  /**
   * Récupère toutes les séances d'un programme (avec leurs IDs)
   */
  async getSessionIdsByProgramId(programId: number): Promise<number[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ session_id: number }>(
      'SELECT session_id FROM program_sessions WHERE program_id = ? ORDER BY order_index ASC',
      [programId]
    );
    return rows.map(row => row.session_id);
  }

  /**
   * Récupère tous les programmes d'une séance (avec leurs IDs)
   */
  async getProgramIdsBySessionId(sessionId: number): Promise<number[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<{ program_id: number }>(
      'SELECT program_id FROM program_sessions WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );
    return rows.map(row => row.program_id);
  }

  /**
   * Compte le nombre de séances dans un programme
   */
  async countSessionsByProgramId(programId: number): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM program_sessions WHERE program_id = ?',
      [programId]
    );
    return result?.count || 0;
  }

  /**
   * Compte le nombre de programmes contenant une séance
   */
  async countProgramsBySessionId(sessionId: number): Promise<number> {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM program_sessions WHERE session_id = ?',
      [sessionId]
    );
    return result?.count || 0;
  }

  /**
   * Vérifie si une séance est dans un programme
   */
  async isSessionInProgram(programId: number, sessionId: number): Promise<boolean> {
    const result = await this.findByProgramAndSession(programId, sessionId);
    return result !== null;
  }

  /**
   * Récupère une liaison par program_id et session_id
   */
  async findByProgramAndSession(programId: number, sessionId: number): Promise<ProgramSession | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM program_sessions WHERE program_id = ? AND session_id = ?',
      [programId, sessionId]
    );
    return row ? this.mapRow(row) : null;
  }

  /**
   * Récupère une liaison par ID
   */
  async findById(id: number): Promise<ProgramSession | null> {
    const db = getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM program_sessions WHERE id = ?',
      [id]
    );
    return row ? this.mapRow(row) : null;
  }

  /**
   * Récupère toutes les liaisons d'un programme
   */
  async findByProgramId(programId: number): Promise<ProgramSession[]> {
    const db = getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM program_sessions WHERE program_id = ? ORDER BY order_index ASC',
      [programId]
    );
    return rows.map(row => this.mapRow(row));
  }

  /**
   * Réorganise les séances d'un programme
   */
  async reorderSessions(programId: number, sessionIds: number[]): Promise<void> {
    const db = getDatabase();

    for (let i = 0; i < sessionIds.length; i++) {
      await db.runAsync(
        'UPDATE program_sessions SET order_index = ? WHERE program_id = ? AND session_id = ?',
        [i, programId, sessionIds[i]]
      );
    }
  }
}

export const programSessionRepository = new ProgramSessionRepository();
