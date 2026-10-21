import { Stack } from "expo-router";
import { CaddieContactProvider } from "../../src/features/contact/CaddieContactProvider";
import { NotificationAlertProvider } from "../../src/features/notifications/NotificationAlertProvider";
import { RoundConfirmationProvider } from "../../src/features/booking/RoundConfirmationProvider";

export default function AuthenticatedAppLayout() {
  return <NotificationAlertProvider><CaddieContactProvider><RoundConfirmationProvider><Stack screenOptions={{ headerShown: false }} /></RoundConfirmationProvider></CaddieContactProvider></NotificationAlertProvider>;
}
