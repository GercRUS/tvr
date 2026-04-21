import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlayerProvider } from "@/contexts/PlayerContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Маленькая задержка перед скрытием, чтобы UI успел "проснуться"
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
            /* игнорируем ошибки скрытия */
        });
      }, 100);
    }
  }, [fontsLoaded, fontError]);

  // Вместо return null, возвращаем пустую View или просто контейнер
  // Это не даст приложению "схлопнуться" до загрузки
  if (!fontsLoaded && !fontError) {
    return <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <PlayerProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
            </Stack>
          </PlayerProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
