import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { PrimaryButton } from "../../ui/booking-design";

export function TeeTimeConfirmationScreen() {
  // TODO: load the selected slot from the real club tee-sheet service.
  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }}>
        <EmptyState
          description="Tee-time details will appear after the club tee-sheet service is connected."
          icon="calendar-remove-outline"
          title="Tee time unavailable"
        />
        <PrimaryButton label="Back to courses" onPress={() => router.replace("/golfer/courses")} />
      </View>
    </SafeAreaView>
  );
}
