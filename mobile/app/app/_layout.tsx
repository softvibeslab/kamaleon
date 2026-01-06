// ════════════════════════════════════════════════════════════════
//                    Root Layout
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/auth.store';
import { dbService } from '../src/services/database';
import { useSyncStore } from '../src/store/sync.store';

export default function RootLayout() {
  const [isInitialized, setIsInitialized] = useState(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const initializeSync = useSyncStore((state) => state.initialize);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database
        await dbService.initialize();

        // Initialize sync service
        await initializeSync();

        // Check authentication status
        await checkAuth();
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="home" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
