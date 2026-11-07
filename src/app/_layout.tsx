import "../../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import {
  Archivo_500Medium,
  Archivo_700Bold,
  Archivo_800ExtraBold,
} from "@expo-google-fonts/archivo";
import { ArchivoNarrow_700Bold } from "@expo-google-fonts/archivo-narrow";
import {
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from "@expo-google-fonts/jetbrains-mono";
import {
  StartRouteContext,
  useResolveStartRoute,
} from "../hooks/useStartRoute";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Archivo_500Medium,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    ArchivoNarrow_700Bold,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });
  const startRoute = useResolveStartRoute();

  // Keep the splash screen up until fonts AND the login check are done.
  const ready = (loaded || !!error) && startRoute !== null;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <StartRouteContext.Provider value={startRoute}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </StartRouteContext.Provider>
  );
}
