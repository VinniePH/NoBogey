import { Stack } from "expo-router";
import { CaddieContactProvider } from "../../src/features/contact/CaddieContactProvider";
import { NotificationAlertProvider } from "../../src/features/notifications/NotificationAlertProvider";

export default function AuthenticatedAppLayout() {
  return <NotificationAlertProvider><CaddieContactProvider><Stack screenOptions={{ headerShown: false }} /></CaddieContactProvider></NotificationAlertProvider>;
}
