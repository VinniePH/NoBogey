import { Stack } from "expo-router";
import { colors } from "@nobogey/ui";
import { NoBogeyWordmark } from "../../../src/ui/NoBogeyWordmark";

export default function CaddieLayout() {
  return (
    <Stack screenOptions={{ contentStyle: { backgroundColor: colors.canvas }, headerShown: false, headerTitle: () => <NoBogeyWordmark centered={false} />, headerTitleAlign: "center", headerShadowVisible: false, headerStyle: { backgroundColor: colors.canvas } }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="matches/[bookingId]" options={{ headerShown: true, title: "Match details" }} />
    </Stack>
  );
}
