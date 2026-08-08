import { Stack } from "expo-router";
import { colors } from "@nobogey/ui";

export default function CaddieLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.canvas }, headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="matches/[bookingId]" options={{ headerShown: true, title: "Match details" }} />
    </Stack>
  );
}
