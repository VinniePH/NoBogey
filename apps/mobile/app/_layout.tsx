import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";

export default function RootLayout() {
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
        <Stack.Screen name="index" options={{ title: "NoBogey" }} />
        <Stack.Screen name="courses" options={{ title: "Choose a course" }} />
        <Stack.Screen name="caddies" options={{ title: "Available caddies" }} />
        <Stack.Screen
          name="caddies/[id]"
          options={{ title: "Caddie profile" }}
        />
        <Stack.Screen name="booking" options={{ title: "Booking" }} />
        <Stack.Screen name="profile" options={{ title: "Golfer profile" }} />
        <Stack.Screen
          name="caddie-dashboard"
          options={{ title: "Caddie dashboard" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
