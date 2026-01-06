// ════════════════════════════════════════════════════════════════
//                    Sync Store
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { syncService, SyncResult } from '../services/sync';

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: string | null;
  lastSyncResult: SyncResult | null;
  pendingChanges: number;
  sync: () => Promise<SyncResult>;
  initialize: () => Promise<void>;
  incrementPendingChanges: () => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isSyncing: false,
  lastSyncAt: null,
  lastSyncResult: null,
  pendingChanges: 0,

  sync: async () => {
    if (get().isSyncing) {
      return { success: false, pulled: 0, pushed: 0, conflicts: 0, error: 'Sync in progress' };
    }

    set({ isSyncing: true });

    try {
      const result = await syncService.sync();

      set({
        isSyncing: false,
        lastSyncResult: result,
        lastSyncAt: result.success ? new Date().toISOString() : get().lastSyncAt,
        pendingChanges: result.success ? 0 : get().pendingChanges,
      });

      return result;
    } catch (error) {
      const result = { success: false, pulled: 0, pushed: 0, conflicts: 0, error: 'Sync failed' };
      set({ isSyncing: false, lastSyncResult: result });
      return result;
    }
  },

  initialize: async () => {
    await syncService.initialize();
  },

  incrementPendingChanges: () => {
    set({ pendingChanges: get().pendingChanges + 1 });
  },
}));
