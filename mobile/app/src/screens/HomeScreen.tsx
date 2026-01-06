// ════════════════════════════════════════════════════════════════
//                    Home Screen
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/auth.store';
import { useManifestStore } from '../store/manifest.store';
import { useSyncStore } from '../store/sync.store';
import { SDUIRenderer } from '../components/SDUIRenderer';

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { manifests, currentManifest, currentScreen, loadManifests, setCurrentScreen, isLoading } = useManifestStore();
  const { sync, isSyncing, lastSyncAt, pendingChanges } = useSyncStore();

  useEffect(() => {
    loadManifests();
  }, []);

  const handleRefresh = async () => {
    await sync();
    await loadManifests();
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const handleAction = (action: any) => {
    switch (action.type) {
      case 'navigate':
        if (action.payload.screen) {
          setCurrentScreen(action.payload.screen);
        } else if (action.payload.route) {
          router.push(action.payload.route);
        }
        break;
      case 'submit':
        console.log('Form submitted:', action.payload);
        break;
      case 'api':
        console.log('API call:', action.payload);
        break;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isSyncing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {user?.name}</Text>
          <Text style={styles.role}>{user?.role}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Sync Status */}
      <View style={styles.syncStatus}>
        <Text style={styles.syncText}>
          {lastSyncAt
            ? `Última sincronización: ${new Date(lastSyncAt).toLocaleString()}`
            : 'No sincronizado'}
        </Text>
        {pendingChanges > 0 && (
          <Text style={styles.pendingText}>
            {pendingChanges} cambios pendientes
          </Text>
        )}
      </View>

      {/* Manifest Content */}
      {currentScreen ? (
        <View style={styles.screenContainer}>
          <View style={styles.screenHeader}>
            <Text style={styles.screenTitle}>{currentScreen.name}</Text>
            <TouchableOpacity onPress={() => setCurrentScreen('')}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
          </View>
          <SDUIRenderer
            components={currentScreen.components}
            onAction={handleAction}
          />
        </View>
      ) : currentManifest ? (
        <View style={styles.manifestContainer}>
          <Text style={styles.manifestTitle}>{currentManifest.name}</Text>
          <Text style={styles.manifestVersion}>v{currentManifest.version}</Text>

          {/* Screen List */}
          <View style={styles.screenList}>
            {currentManifest.screens.map((screen) => (
              <TouchableOpacity
                key={screen.id}
                style={styles.screenCard}
                onPress={() => setCurrentScreen(screen.id)}
              >
                <Text style={styles.screenCardTitle}>{screen.name}</Text>
                <Text style={styles.screenCardRoute}>{screen.route}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay manifiestos disponibles</Text>
          <Text style={styles.emptySubtext}>
            Sincroniza para obtener las últimas pantallas
          </Text>
          <TouchableOpacity style={styles.syncButton} onPress={handleRefresh}>
            <Text style={styles.syncButtonText}>Sincronizar</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1976d2',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  role: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  syncStatus: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  syncText: {
    fontSize: 12,
    color: '#666',
  },
  pendingText: {
    fontSize: 12,
    color: '#f57c00',
    marginTop: 4,
  },
  manifestContainer: {
    padding: 20,
  },
  manifestTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  manifestVersion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  screenList: {
    gap: 12,
  },
  screenCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  screenCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  screenCardRoute: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  screenContainer: {
    flex: 1,
    padding: 16,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backText: {
    color: '#1976d2',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  syncButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;
