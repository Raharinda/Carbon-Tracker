import "../../global.css";

import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { useDeviceStream } from "@/features/device";
import { useEnergyHistory, useUsageRecording } from "@/features/energy";
import { useDeviceId, useSettingsBootstrap } from "@/features/settings";
import { AuthProvider, useAuth } from "@/shared/lib/auth";
import { colors } from "@/shared/theme";

function AppBootstrap() {
  const { status } = useAuth();
  const deviceId = useDeviceId();
  const isAuthenticated = status === "authenticated";

  useSettingsBootstrap(isAuthenticated);
  useDeviceStream(deviceId, isAuthenticated);
  useEnergyHistory(deviceId, isAuthenticated);
  useUsageRecording(deviceId, isAuthenticated);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppBootstrap />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </AuthProvider>
  );
}
