import { router } from "expo-router";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { Button } from "../../ui/primitives";

export function CaddieMatchDetailScreen() {
  // TODO: load completed match details from the real booking service.
  return (
    <SafeAreaView edges={["bottom"]} style={{ flex: 1 }}>
      <View style={{ flex: 1, gap: spacing.lg, justifyContent: "center", padding: spacing.xl }}>
        <EmptyState
          description="Match details will appear after booking history is connected."
          icon="calendar-remove-outline"
          title="Match unavailable"
        />
        <Button onPress={() => router.back()}>Back to match history</Button>
      </View>
    </SafeAreaView>
  );
}
