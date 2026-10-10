/**
 * NeoNova Automatic Online Recovery & Sync Engine
 * Manages background queue processing, progress reconciliation, and connection transitions.
 */

import { offlineDb, OfflinePendingRequest } from './offlineDatabase';
import { networkHealth, ConnectivityStatus } from './networkHealth';

export interface SyncStatusEvent {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  recentlySyncedItem?: {
    id: string;
    description: string;
    success: boolean;
  };
}

type SyncListener = (event: SyncStatusEvent) => void;

class SyncEngineManager {
  private isSyncing = false;
  private pendingCount = 0;
  private lastSyncedAt: string | null = null;
  private lastError: string | null = null;
  private listeners: Set<SyncListener> = new Set();
  private autoSyncTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Refresh count on startup
      this.updatePendingCount();

      // Listen to network health changes
      networkHealth.subscribe((status: ConnectivityStatus) => {
        if (status.isOnline) {
          // Automatic recovery: trigger sync as soon as network returns
          this.triggerSync();
        }
      });

      // Periodic check every 15s when online
      this.autoSyncTimer = setInterval(() => {
        if (networkHealth.getStatus().isOnline && this.pendingCount > 0 && !this.isSyncing) {
          this.triggerSync();
        }
      }, 15000);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  public getStatus(): SyncStatusEvent {
    return {
      isSyncing: this.isSyncing,
      pendingCount: this.pendingCount,
      lastSyncedAt: this.lastSyncedAt,
      lastError: this.lastError
    };
  }

  private notify(recentlySynced?: { id: string; description: string; success: boolean }) {
    const status = {
      ...this.getStatus(),
      recentlySyncedItem: recentlySynced
    };
    this.listeners.forEach(fn => fn(status));
  }

  public async updatePendingCount(): Promise<number> {
    try {
      const items = await offlineDb.getPendingRequests();
      this.pendingCount = items.length;
      this.notify();
      return this.pendingCount;
    } catch {
      return 0;
    }
  }

  public async queueRequest(
    type: OfflinePendingRequest['type'],
    payload: any,
    description: string
  ): Promise<OfflinePendingRequest> {
    const item = await offlineDb.queuePendingRequest(type, payload, description);
    await this.updatePendingCount();

    // If already online, attempt immediate sync
    if (networkHealth.getStatus().isOnline) {
      setTimeout(() => this.triggerSync(), 200);
    }

    return item;
  }

  public async triggerSync(): Promise<void> {
    if (this.isSyncing) return;
    const isOnline = networkHealth.getStatus().isOnline;
    if (!isOnline) return;

    const items = await offlineDb.getPendingRequests();
    if (items.length === 0) {
      this.pendingCount = 0;
      this.notify();
      return;
    }

    this.isSyncing = true;
    this.notify();

    for (const item of items) {
      try {
        await offlineDb.updateRequestStatus(item.id, 'syncing');
        let success = false;

        if (item.type === 'ai_chat') {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          if (res.ok) {
            const data = await res.json();
            // Update cached session with real response if sessionId provided
            if (item.payload.sessionId) {
              const session = await offlineDb.getItem<any>('chat_sessions', item.payload.sessionId);
              if (session) {
                session.messages.push({
                  id: `ai_resp_${Date.now()}`,
                  sender: 'neonova',
                  text: data.response || data.text,
                  timestamp: new Date().toISOString(),
                  status: 'synced'
                });
                session.updatedAt = new Date().toISOString();
                await offlineDb.saveChatSession(session);
              }
            }
            success = true;
          }
        } else if (item.type === 'student_attempt') {
          const res = await fetch('/api/student/attempt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          if (res.ok) success = true;
        } else if (item.type === 'homework_solve') {
          const res = await fetch('/api/solver/solve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.payload)
          });
          if (res.ok) success = true;
        } else {
          // Default success for generic sync payloads
          success = true;
        }

        if (success) {
          await offlineDb.removePendingRequest(item.id);
          this.notify({ id: item.id, description: item.description, success: true });
        } else {
          await offlineDb.updateRequestStatus(item.id, 'failed');
        }
      } catch (err: any) {
        console.warn(`Sync failed for item ${item.id}:`, err);
        await offlineDb.updateRequestStatus(item.id, 'failed', err.message);
      }
    }

    this.isSyncing = false;
    this.lastSyncedAt = new Date().toISOString();
    await this.updatePendingCount();
  }
}

export const syncEngine = new SyncEngineManager();
