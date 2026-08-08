import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { Button } from "../../ui/primitives";

function PaymentUnavailable() {
  // TODO: wire up the real payment and receipt service.
  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }}>
        <EmptyState
          description="Payment and receipt details will appear after the payment service is connected."
          icon="credit-card-off-outline"
          title="Payment unavailable"
        />
        <Button onPress={() => router.replace("/golfer/bookings")}>Back to bookings</Button>
      </View>
    </SafeAreaView>
  );
}
export function PaymentScreen() {
  return <PaymentUnavailable />;
}

export function ReceiptScreen() {
  return <PaymentUnavailable />;
}
