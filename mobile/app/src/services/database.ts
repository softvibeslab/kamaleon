// ════════════════════════════════════════════════════════════════
//                    Database Service (SQLite)
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import * as SQLite from 'expo-sqlite';

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: string;
}

export interface Manifest {
  id: string;
  name: string;
  version: string;
  data: string;
  updatedAt: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  async initialize(): Promise<void> {
    this.db = await SQLite.openDatabaseAsync('kamaleon.db');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS manifests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        version TEXT NOT NULL,
        data TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pending_changes (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        entity TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sync_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS local_data (
        id TEXT PRIMARY KEY,
        entity TEXT NOT NULL,
        data TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);
  }

  async saveManifest(manifest: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO manifests (id, name, version, data, updatedAt)
       VALUES (?, ?, ?, ?, ?)`,
      manifest.id,
      manifest.name,
      manifest.version,
      JSON.stringify(manifest),
      new Date().toISOString()
    );
  }

  async getManifest(id: string): Promise<Manifest | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<Manifest>(
      'SELECT * FROM manifests WHERE id = ?',
      id
    );
    return result || null;
  }

  async getAllManifests(): Promise<Manifest[]> {
    if (!this.db) throw new Error('Database not initialized');

    return this.db.getAllAsync<Manifest>('SELECT * FROM manifests');
  }

  async addPendingChange(change: Omit<PendingChange, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO pending_changes (id, type, entity, data, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      change.type,
      change.entity,
      JSON.stringify(change.data),
      timestamp
    );
  }

  async getPendingChanges(): Promise<PendingChange[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.getAllAsync<any>(
      'SELECT * FROM pending_changes ORDER BY timestamp ASC'
    );

    return rows.map(row => ({
      ...row,
      data: JSON.parse(row.data),
    }));
  }

  async clearPendingChanges(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM pending_changes');
  }

  async applyChange(change: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();

    switch (change.type) {
      case 'create':
      case 'update':
        await this.db.runAsync(
          `INSERT OR REPLACE INTO local_data (id, entity, data, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?)`,
          change.id,
          change.entity,
          JSON.stringify(change.data),
          change.timestamp || now,
          now
        );
        break;
      case 'delete':
        await this.db.runAsync('DELETE FROM local_data WHERE id = ?', change.id);
        break;
    }
  }

  async getLastSyncAt(): Promise<string | null> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM sync_meta WHERE key = ?',
      'lastSyncAt'
    );
    return result?.value || null;
  }

  async setLastSyncAt(timestamp: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO sync_meta (key, value) VALUES (?, ?)`,
      'lastSyncAt',
      timestamp
    );
  }
}

export const dbService = new DatabaseService();
