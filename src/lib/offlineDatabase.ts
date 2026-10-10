/**
 * NeoNova True Offline Database Architecture
 * High-performance, persistent IndexedDB store with transparent fallback to localStorage.
 * Ensures zero-data-loss, offline lessons, notes, chat history, quiz progress, and request queueing.
 */

export interface OfflineLesson {
  id: string;
  subject: string;
  chapterTitle: string;
  grade: string;
  curriculumBoard: string;
  content: string;
  keyFormulas?: string[];
  summary: string;
  cachedAt: string;
}

export interface OfflineNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  updatedAt: string;
}

export interface OfflineQuestionRecord {
  id: string;
  question: string;
  subject: string;
  grade: string;
  curriculumBoard: string;
  finalAnswer: string;
  narrativeExplanation: string;
  steps: { stepNumber: number; title: string; content: string }[];
  visualExplanation?: any;
  cachedAt: string;
  isSynced: boolean;
}

export interface OfflinePendingRequest {
  id: string;
  type: 'ai_chat' | 'homework_solve' | 'student_attempt' | 'profile_update';
  payload: any;
  queuedAt: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  lastAttemptAt?: string;
  description: string;
}

export interface OfflineProgressState {
  userId: string;
  studentName: string;
  grade: string;
  academicXP: number;
  streakDays: number;
  completedQuizzesCount: number;
  masteredTopics: string[];
  lastActive: string;
}

export interface OfflineChatSession {
  id: string;
  subject: string;
  grade: string;
  title: string;
  messages: {
    id: string;
    sender: 'user' | 'neonova' | 'system';
    text: string;
    timestamp: string;
    status?: 'sent' | 'queued_offline' | 'synced';
    image?: string;
  }[];
  updatedAt: string;
}

const DB_NAME = 'NeoNova_Offline_DB_v2';
const DB_VERSION = 2;

class OfflineDatabaseManager {
  private db: IDBDatabase | null = null;
  private isSupported = typeof window !== 'undefined' && 'indexedDB' in window;
  private initPromise: Promise<boolean> | null = null;

  constructor() {
    if (this.isSupported) {
      this.init();
    }
  }

  public async init(): Promise<boolean> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      if (!this.isSupported) {
        resolve(false);
        return;
      }

      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (e: IDBVersionChangeEvent) => {
          const db = (e.target as IDBOpenDBRequest).result;
          const stores = [
            'lessons',
            'notes',
            'saved_questions',
            'pending_queue',
            'study_progress',
            'chat_sessions',
            'cached_3d_models',
            'cached_books'
          ];

          stores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        req.onsuccess = () => {
          this.db = req.result;
          resolve(true);
        };

        req.onerror = () => {
          console.warn('IndexedDB initialization failed; using localStorage fallback');
          resolve(false);
        };
      } catch (err) {
        console.warn('IndexedDB unavailable:', err);
        resolve(false);
      }
    });

    return this.initPromise;
  }

  // --- Generic Store Operations ---

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore | null> {
    await this.init();
    if (!this.db) return null;
    try {
      const tx = this.db.transaction(storeName, mode);
      return tx.objectStore(storeName);
    } catch {
      return null;
    }
  }

  public async setItem<T extends { id: string }>(storeName: string, item: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    if (store) {
      return new Promise((resolve, reject) => {
        const req = store.put(item);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    // LocalStorage Fallback
    try {
      const raw = localStorage.getItem(`neonova_ls_${storeName}`) || '{}';
      const map = JSON.parse(raw);
      map[item.id] = item;
      localStorage.setItem(`neonova_ls_${storeName}`, JSON.stringify(map));
    } catch (err) {
      console.warn(`LocalStorage quota exceeded for ${storeName}:`, err);
    }
  }

  public async getItem<T>(storeName: string, id: string): Promise<T | null> {
    const store = await this.getStore(storeName, 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    }

    try {
      const raw = localStorage.getItem(`neonova_ls_${storeName}`);
      if (!raw) return null;
      const map = JSON.parse(raw);
      return map[id] || null;
    } catch {
      return null;
    }
  }

  public async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName, 'readonly');
    if (store) {
      return new Promise((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    }

    try {
      const raw = localStorage.getItem(`neonova_ls_${storeName}`);
      if (!raw) return [];
      const map = JSON.parse(raw);
      return Object.values(map) as T[];
    } catch {
      return [];
    }
  }

  public async removeItem(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    if (store) {
      return new Promise((resolve, reject) => {
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    try {
      const raw = localStorage.getItem(`neonova_ls_${storeName}`);
      if (!raw) return;
      const map = JSON.parse(raw);
      delete map[id];
      localStorage.setItem(`neonova_ls_${storeName}`, JSON.stringify(map));
    } catch {
      // Ignored
    }
  }

  public async clearStore(storeName: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    if (store) {
      return new Promise((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }

    try {
      localStorage.removeItem(`neonova_ls_${storeName}`);
    } catch {
      // Ignored
    }
  }

  // --- High-Level Specialized Store APIs ---

  // 1. Pending Request Queue
  public async queuePendingRequest(
    type: OfflinePendingRequest['type'], 
    payload: any, 
    description: string
  ): Promise<OfflinePendingRequest> {
    const req: OfflinePendingRequest = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      queuedAt: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      description
    };
    await this.setItem('pending_queue', req);
    return req;
  }

  public async getPendingRequests(): Promise<OfflinePendingRequest[]> {
    const all = await this.getAll<OfflinePendingRequest>('pending_queue');
    return all.filter(r => r.status === 'pending' || r.status === 'syncing');
  }

  public async updateRequestStatus(id: string, status: OfflinePendingRequest['status'], errorMsg?: string): Promise<void> {
    const item = await this.getItem<OfflinePendingRequest>('pending_queue', id);
    if (item) {
      item.status = status;
      item.retryCount = (item.retryCount || 0) + (status === 'failed' ? 1 : 0);
      item.lastAttemptAt = new Date().toISOString();
      await this.setItem('pending_queue', item);
    }
  }

  public async removePendingRequest(id: string): Promise<void> {
    await this.removeItem('pending_queue', id);
  }

  // 2. Chat Sessions Persistence
  public async saveChatSession(session: OfflineChatSession): Promise<void> {
    await this.setItem('chat_sessions', session);
  }

  public async getChatSessions(): Promise<OfflineChatSession[]> {
    const sessions = await this.getAll<OfflineChatSession>('chat_sessions');
    return sessions.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  // 3. Lessons Persistence
  public async cacheLesson(lesson: OfflineLesson): Promise<void> {
    await this.setItem('lessons', lesson);
  }

  public async getCachedLessons(subject?: string): Promise<OfflineLesson[]> {
    const lessons = await this.getAll<OfflineLesson>('lessons');
    if (subject) {
      return lessons.filter(l => l.subject.toLowerCase() === subject.toLowerCase());
    }
    return lessons;
  }

  // 4. Study Progress State
  public async saveProgress(progress: OfflineProgressState): Promise<void> {
    await this.setItem('study_progress', { ...progress, id: progress.userId || 'active_student' });
  }

  public async getProgress(userId = 'active_student'): Promise<OfflineProgressState | null> {
    return this.getItem<OfflineProgressState>('study_progress', userId);
  }

  // 5. 3D Models Cache
  public async cache3DModel(modelId: string, modelData: any): Promise<void> {
    await this.setItem('cached_3d_models', {
      id: modelId,
      ...modelData,
      cachedAt: new Date().toISOString()
    });
  }

  public async getCached3DModel(modelId: string): Promise<any | null> {
    return this.getItem('cached_3d_models', modelId);
  }

  public async getAllCached3DModels(): Promise<any[]> {
    return this.getAll('cached_3d_models');
  }

  public async deleteCached3DModel(modelId: string): Promise<void> {
    return this.removeItem('cached_3d_models', modelId);
  }
}

export const offlineDb = new OfflineDatabaseManager();
