import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Tema escuro (igual ao Spotify) */}
      <StatusBar style="light" />
      <HomeScreen />
    </SafeAreaProvider>
  );
}