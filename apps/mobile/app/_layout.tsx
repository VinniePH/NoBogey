import { useEffect } from "react";
import { useFonts } from "expo-font";
import { router, Stack, SplashScreen } from "expo-router";
import { Pressable, Text } from "react-native";
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
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.canvas },
          headerTintColor: colors.ink
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="home" options={{ headerShown: false }} />
        <Stack.Screen name="all-courses" options={{ title: "All courses" }} />
        <Stack.Screen name="all-caddies" options={{ title: "All caddies" }} />
        <Stack.Screen name="courses" options={{ title: "Choose a course" }} />
        <Stack.Screen name="courses/[id]" options={{ title: "Course profile" }} />
        <Stack.Screen name="tee-times" options={{ title: "Choose a tee time" }} />
        <Stack.Screen name="tee-time-confirmation" options={{ title: "Confirm tee time" }} />
        <Stack.Screen name="caddies" options={{ title: "Available caddies" }} />
        <Stack.Screen name="find-game" options={{ title: "Find a game" }} />
        <Stack.Screen
          name="caddies/[id]"
          options={{ title: "Caddie profile" }}
        />
        <Stack.Screen name="booking" options={{ title: "Booking" }} />
        <Stack.Screen name="payment" options={{ title: "Payment" }} />
        <Stack.Screen name="receipt" options={{ headerShown: false }} />
        <Stack.Screen name="confirmation" options={{ headerShown: false }} />
        <Stack.Screen name="bookings" options={{ title: "My bookings" }} />
        <Stack.Screen name="booking-details" options={{ title: "Booking details" }} />
        <Stack.Screen name="rate-caddie" options={{ title: "Rate your caddie" }} />
        <Stack.Screen name="profile" options={{ title: "My Profile", headerRight: () => <Pressable accessibilityLabel="Open settings" accessibilityRole="button" hitSlop={8} onPress={() => router.push("/settings")} style={{ alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 }}><Text style={{ color: colors.fairwayDark, fontSize: 22 }}>⚙</Text></Pressable> }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen
          name="caddie-dashboard"
          options={{ title: "Caddie dashboard" }}
        />
      </Stack>
      </AppSessionProvider>
    </SafeAreaProvider>
  );
}
