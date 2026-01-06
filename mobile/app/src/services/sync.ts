// ════════════════════════════════════════════════════════════════
//                    Sync Service
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import * as Network from 'expo-network';
import { apiService } from './api';
import { dbService } from './database';

export interface SyncResult {
  success: boolean;
  pulled: number;
  pushed: number;
  conflicts: number;
  error?: string;
}

class SyncService {
  private isSyncing = false;
  private lastSyncAt: string | null = null;

  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, pulled: 0, pushed: 0, conflicts: 0, error: 'Sync in progress' };
    }

    const networkState = await Network.getNetworkStateAsync();
    if (!networkState.isConnected) {
      return { success: false, pulled: 0, pushed: 0, conflicts: 0, error: 'No network connection' };
    }

    this.isSyncing = true;
    let pulled = 0;
    let pushed = 0;
    let conflicts = 0;

    try {
      // 1. Push local changes
      const pendingChanges = await dbService.getPendingChanges();
      if (pendingChanges.length > 0) {
        const pushResult = await apiService.post('/sync/push', { pendingChanges });
        if (pushResult.success && pushResult.data) {
          pushed = (pushResult.data as any).processed || 0;
          conflicts = (pushResult.data as any).conflicts?.length || 0;
          await dbService.clearPendingChanges();
        }
      }

      // 2. Pull server changes
      const pullResult = await apiService.post('/sync/pull', {
        lastSyncAt: this.lastSyncAt,
      });

      if (pullResult.success && pullResult.data) {
        const changes = (pullResult.data as any).changes || [];
        for (const change of changes) {
          await dbService.applyChange(change);
          pulled++;
        }
        this.lastSyncAt = new Date().toISOString();
        await dbService.setLastSyncAt(this.lastSyncAt);
      }

      // 3. Sync manifests
      await this.syncManifests();

      return { success: true, pulled, pushed, conflicts };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        pulled,
        pushed,
        conflicts,
        error: 'Sync failed',
      };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncManifests(): Promise<void> {
    const result = await apiService.get('/sync/manifests');
    if (result.success && result.data) {
      const manifests = (result.data as any[]) || [];
      for (const manifest of manifests) {
        await dbService.saveManifest(manifest);
      }
    }
  }

  async initialize(): Promise<void> {
    this.lastSyncAt = await dbService.getLastSyncAt();
  }
}

export const syncService = new SyncService();
