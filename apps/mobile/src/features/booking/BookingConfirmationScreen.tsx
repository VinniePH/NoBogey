import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { PrimaryButton } from "../../ui/booking-design";

export function BookingConfirmationScreen() {
  // TODO: render confirmation data returned by the real booking service.
  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }}>
        <EmptyState
          description="A confirmation will appear only after the booking service accepts a request."
          icon="calendar-remove-outline"
          title="Booking confirmation unavailable"
        />
        <PrimaryButton label="Back to bookings" onPress={() => router.replace("/golfer/bookings")} />
      </View>
    </SafeAreaView>
  );
}
