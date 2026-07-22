import { useEffect } from "react";
import { useFonts } from "expo-font";
import { router, Stack, SplashScreen } from "expo-router";
import { Pressable, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";
import InterFont from "../assets/fonts/Inter-Variable.ttf";
import JetBrainsMonoFont from "../assets/fonts/JetBrainsMono-Regular.ttf";

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
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.canvas },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="courses" options={{ title: "Choose a course" }} />
        <Stack.Screen name="courses/[id]" options={{ title: "Course profile" }} />
        <Stack.Screen name="caddies" options={{ title: "Available caddies" }} />
        <Stack.Screen
          name="caddies/[id]"
          options={{ title: "Caddie profile" }}
        />
        <Stack.Screen name="booking" options={{ title: "Booking" }} />
        <Stack.Screen name="confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "My Profile", headerRight: () => <Pressable accessibilityLabel="Open settings" accessibilityRole="button" hitSlop={8} onPress={() => router.push("/settings")} style={{ alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }}><Text style={{ color: colors.fairwayDark, fontSize: 22 }}>⚙</Text></Pressable> }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="caddie-dashboard"
          options={{ title: "Caddie dashboard" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
