import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";
import InterFont from "../assets/fonts/Inter-Variable.ttf";
import JetBrainsMonoFont from "../assets/fonts/JetBrainsMono-Regular.ttf";
import { AppSessionProvider } from "../src/features/session/AppSession";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: InterFont,
    JetBrainsMono: JetBrainsMonoFont
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AppSessionProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: colors.canvas },
            headerShown: false
          }}
        >
        <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(public)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
        </Stack>
      </AppSessionProvider>
    </SafeAreaProvider>
  );
}
