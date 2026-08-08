import { Stack } from "expo-router";

export default function AuthenticatedAppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
