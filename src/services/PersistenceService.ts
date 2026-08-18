import { VisualizationState } from '../types/plugin';
import { Operation } from '../types/plugin';

export interface SessionData {
  id: string;
  createdAt: number;
  pluginId: string;
  stateHistory: VisualizationState[];
  operations: Operation[];
  metadata: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

export class PersistenceService {
  private storageKey = 'dsa_viz_sessions';

  saveSession(session: SessionData): void {
    const sessions = this.getSessions();
    sessions.push(session);
    localStorage.setItem(this.storageKey, JSON.stringify(sessions));
  }

  getSessions(): SessionData[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getSession(id: string): SessionData | null {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id) || null;
  }

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(sessions));
  }

  exportSession(session: SessionData): string {
    return JSON.stringify(session, null, 2);
  }

  importSession(json: string): SessionData {
    try {
      const session: SessionData = JSON.parse(json);
      if (!session.id || !session.pluginId || !session.stateHistory) {
        throw new Error('Invalid session format');
      }
      this.saveSession(session);
      return session;
    } catch (e) {
      throw new Error(`Failed to import session: ${e}`);
    }
  }

  clearAll(): void {
    localStorage.removeItem(this.storageKey);
  }
}
