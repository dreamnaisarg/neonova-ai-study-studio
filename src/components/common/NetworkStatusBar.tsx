import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, X, Check, CloudOff, ArrowUpCircle } from 'lucide-react';
import { useNetworkHealth } from '../../lib/networkHealth';
import { syncEngine, SyncStatusEvent } from '../../lib/syncEngine';

export default function NetworkStatusBar() {
  const { state, forceCheck } = useNetworkHealth();
  const [isDismissed, setIsDismissed] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatusEvent>(() => syncEngine.getStatus());

  useEffect(() => {
    return syncEngine.subscribe(setSyncStatus);
  }, []);

  // Keep UI completely clean when online, connecting, or dismissed
  if (state === 'Online' || state === 'Connecting' || isDismissed) {
    if (!syncStatus.isSyncing && syncStatus.pendingCount === 0) {
      return null;
    }
  }

  const isOffline = state === 'Offline' || state === 'Server Unavailable';

  return (
    <div 
      className={`fixed top-14 sm:top-16 right-3 sm:right-6 z-40 transition-all duration-300 animate-in fade-in slide-in-from-top-2 select-none ${
        isOffline 
          ? 'bg-slate-900/95 backdrop-blur-md border border-slate-700/80 text-slate-100 shadow-xl' 
          : syncStatus.isSyncing
          ? 'bg-indigo-900/95 backdrop-blur-md border border-indigo-700/80 text-indigo-100 shadow-xl'
          : 'bg-slate-900/90 border border-slate-700 text-slate-200 shadow-md'
      } px-3.5 py-2 rounded-2xl text-xs font-medium flex items-center gap-3 max-w-md`}
      role="status"
      aria-live="polite"
    >
      <div className="shrink-0 flex items-center">
        {syncStatus.isSyncing ? (
          <RefreshCw size={14} className="text-indigo-400 animate-spin" />
        ) : isOffline ? (
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        ) : (
          <RefreshCw size={14} className="text-slate-400 animate-spin" />
        )}
      </div>

      <div className="flex-1 truncate">
        {isOffline ? (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 text-[11px] tracking-tight">
                Offline Mode — Core features available
              </span>
              {syncStatus.pendingCount > 0 && (
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-1.5 py-0.2 rounded-full font-mono font-bold border border-indigo-500/40">
                  {syncStatus.pendingCount} queued
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 truncate">
              Lessons, Notes, 3D Labs & Scanner are 100% operational locally
            </span>
          </div>
        ) : syncStatus.isSyncing ? (
          <div className="flex flex-col">
            <span className="font-bold text-indigo-200 text-[11px]">
              Connection Restored &middot; Synchronizing...
            </span>
            <span className="text-[10px] text-indigo-300">
              Uploading {syncStatus.pendingCount} queued study item{syncStatus.pendingCount === 1 ? '' : 's'}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-300">
            Verifying network connection...
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {isOffline && (
          <button
            type="button"
            onClick={() => forceCheck()}
            className="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold border border-white/10 transition-colors cursor-pointer"
            title="Check connection"
          >
            Check
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Dismiss status indicator"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}
