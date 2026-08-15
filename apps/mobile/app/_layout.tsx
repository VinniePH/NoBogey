import { useEffect } from "react";
import { useFonts } from "expo-font";
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";
import InterFont from "../assets/fonts/Inter-Variable.ttf";
import JetBrainsMonoFont from "../assets/fonts/JetBrainsMono-Regular.ttf";
import { AppSessionProvider, useAppSession } from "../src/features/session/AppSession";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: InterFont,
    JetBrainsMono: JetBrainsMonoFont
  });

  return (
    <SafeAreaProvider>
      <AppSessionProvider>
        <RootNavigator fontsLoaded={fontsLoaded} />
      </AppSessionProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isAuthenticated, isHydrated } = useAppSession();

  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isHydrated]);

  if (!fontsLoaded || !isHydrated) {
    return null;
  }

  return (
    <>
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
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
