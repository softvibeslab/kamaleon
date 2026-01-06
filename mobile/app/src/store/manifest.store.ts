// ════════════════════════════════════════════════════════════════
//                    Manifest Store
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import { create } from 'zustand';
import { dbService, Manifest } from '../services/database';

interface Screen {
  id: string;
  name: string;
  route: string;
  components: any[];
}

interface ManifestData {
  id: string;
  name: string;
  version: string;
  screens: Screen[];
}

interface ManifestState {
  manifests: ManifestData[];
  currentManifest: ManifestData | null;
  currentScreen: Screen | null;
  isLoading: boolean;
  loadManifests: () => Promise<void>;
  setCurrentManifest: (id: string) => Promise<void>;
  setCurrentScreen: (screenId: string) => void;
  getScreenByRoute: (route: string) => Screen | null;
}

export const useManifestStore = create<ManifestState>((set, get) => ({
  manifests: [],
  currentManifest: null,
  currentScreen: null,
  isLoading: false,

  loadManifests: async () => {
    set({ isLoading: true });

    try {
      const stored = await dbService.getAllManifests();
      const manifests = stored.map(m => JSON.parse(m.data) as ManifestData);

      set({
        manifests,
        isLoading: false,
        currentManifest: manifests[0] || null,
      });
    } catch (error) {
      console.error('Failed to load manifests:', error);
      set({ isLoading: false });
    }
  },

  setCurrentManifest: async (id: string) => {
    const manifest = get().manifests.find(m => m.id === id);
    if (manifest) {
      set({ currentManifest: manifest, currentScreen: null });
    }
  },

  setCurrentScreen: (screenId: string) => {
    const manifest = get().currentManifest;
    if (manifest) {
      const screen = manifest.screens.find(s => s.id === screenId);
      set({ currentScreen: screen || null });
    }
  },

  getScreenByRoute: (route: string) => {
    const manifest = get().currentManifest;
    if (!manifest) return null;
    return manifest.screens.find(s => s.route === route) || null;
  },
}));
