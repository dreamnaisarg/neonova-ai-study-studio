/**
 * NeoNova Network Health & Connectivity Manager
 * Real connectivity state verification with exponential backoff and automatic recovery.
 */

export type NetworkState = 'Online' | 'Connecting' | 'Offline' | 'Server Unavailable';

export interface ConnectivityStatus {
  state: NetworkState;
  isOnline: boolean;
  isBackendReachable: boolean;
  latencyMs: number | null;
  lastCheckedAt: string | null;
  retryAttempt: number;
  nextRetryMs: number | null;
}

type Listener = (status: ConnectivityStatus) => void;

class NetworkHealthManager {
  private state: NetworkState = typeof navigator !== 'undefined' && !navigator.onLine ? 'Offline' : 'Online';
  private latencyMs: number | null = null;
  private lastCheckedAt: string | null = null;
  private retryAttempt = 0;
  private listeners: Set<Listener> = new Set();
  private timer: any = null;
  private isChecking = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Browser network event listeners
      window.addEventListener('online', () => this.handleBrowserOnline());
      window.addEventListener('offline', () => this.handleBrowserOffline());
      
      // Probe connectivity shortly after start
      setTimeout(() => {
        this.checkConnection(true);
      }, 500);

      // Background heartbeat every 30 seconds
      setInterval(() => {
        if (this.state === 'Online') {
          this.checkConnection(true);
        }
      }, 30000);
    }
  }

  public getStatus(): ConnectivityStatus {
    return {
      state: this.state,
      isOnline: this.state === 'Online',
      isBackendReachable: this.state === 'Online',
      latencyMs: this.latencyMs,
      lastCheckedAt: this.lastCheckedAt,
      retryAttempt: this.retryAttempt,
      nextRetryMs: this.retryAttempt > 0 ? this.calculateBackoff() : null
    };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  public async checkConnection(isBackground = false): Promise<ConnectivityStatus> {
    if (this.isChecking) return this.getStatus();
    this.isChecking = true;

    if (!isBackground && this.state !== 'Online') {
      this.state = 'Connecting';
      this.notify();
    }

    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout to avoid false offline on slow networks

      const response = await fetch(`/api/health?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const elapsed = Math.round(performance.now() - start);

      if (response.ok) {
        this.state = 'Online';
        this.latencyMs = elapsed;
        this.lastCheckedAt = new Date().toISOString();
        this.retryAttempt = 0;
        if (this.timer) {
          clearTimeout(this.timer);
          this.timer = null;
        }
      } else {
        // Backend responded with non-200
        this.handleFailure('Server Unavailable');
      }
    } catch (err: any) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.handleFailure('Offline');
      } else if (this.retryAttempt >= 2) {
        // Only mark server unavailable after 3 consecutive failures to prevent false alarms
        this.handleFailure('Server Unavailable');
      } else {
        this.retryAttempt += 1;
        this.scheduleRetry();
      }
    } finally {
      this.isChecking = false;
      this.notify();
    }

    return this.getStatus();
  }

  private handleFailure(targetState: 'Offline' | 'Server Unavailable') {
    this.retryAttempt += 1;
    this.state = targetState;
    this.scheduleRetry();
  }

  private calculateBackoff(): number {
    // Exponential backoff: 2s, 4s, 8s, up to 16s max
    const baseMs = 2000;
    const factor = Math.min(Math.pow(2, this.retryAttempt - 1), 8);
    const jitter = Math.floor(Math.random() * 500);
    return baseMs * factor + jitter;
  }

  private scheduleRetry() {
    if (this.timer) clearTimeout(this.timer);
    const delay = this.calculateBackoff();
    this.timer = setTimeout(() => {
      this.checkConnection();
    }, delay);
  }

  private handleBrowserOnline() {
    // Immediate recovery probe when browser reconnects
    this.retryAttempt = 0;
    this.checkConnection();
  }

  private handleBrowserOffline() {
    // Browser says disconnected; probe to verify before panic
    setTimeout(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.state = 'Offline';
        this.notify();
        this.scheduleRetry();
      }
    }, 500);
  }

  private notify() {
    const status = this.getStatus();
    this.listeners.forEach(fn => fn(status));
  }
}

export const networkHealth = new NetworkHealthManager();

import { useState, useEffect } from 'react';

/**
 * React hook to listen to real-time network and server connectivity status
 */
export function useNetworkHealth(): ConnectivityStatus & { forceCheck: () => Promise<ConnectivityStatus> } {
  const [status, setStatus] = useState<ConnectivityStatus>(() => networkHealth.getStatus());

  useEffect(() => {
    return networkHealth.subscribe(setStatus);
  }, []);

  return {
    ...status,
    forceCheck: () => networkHealth.checkConnection()
  };
}
