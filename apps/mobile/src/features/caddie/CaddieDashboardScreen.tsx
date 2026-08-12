import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { CaddieAvailabilityEditor, CaddieSchedulePanel, initialAvailabilitySlots } from "./CaddieScheduleScreen";
import { VerificationStatusScreen } from "../caddie-onboarding/VerificationStatusScreen";
import { useAppSession } from "../session/AppSession";

type DashboardTab = "schedule" | "roster" | "portfolio";

export function CaddieDashboardScreen() {
  const { caddieVerification } = useAppSession();
  const [tab, setTab] = useState<DashboardTab>("roster");
  const [availabilityEditorVisible, setAvailabilityEditorVisible] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState(initialAvailabilitySlots);

  if (caddieVerification !== "verified") return <VerificationStatusScreen />;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.content}>
          <View style={styles.header}>
            <Pressable accessibilityLabel="Open caddie profile" accessibilityRole="button" onPress={() => router.push("/caddie/profile")}>
              <MaterialCommunityIcons color={colors.fairwayDark} name="account-outline" size={26} />
            </Pressable>
            <Text accessibilityRole="header" style={styles.title}>Caddie dashboard</Text>
            <Pressable accessibilityLabel="Open settings" accessibilityRole="button" onPress={() => router.push("/caddie/settings")}>
              <MaterialCommunityIcons color={colors.fairwayDark} name="cog-outline" size={25} />
            </Pressable>
          </View>

          <EmptyState
            description="Upcoming assignments and weekly metrics will appear after the booking service is connected."
            icon="calendar-blank-outline"
            title="No dashboard activity"
          />

          <View accessibilityRole="tablist" style={styles.tabs}>
            <Tab active={tab === "schedule"} label="Schedule" onPress={() => setTab("schedule")} />
            <Tab active={tab === "roster"} label="Roster" onPress={() => setTab("roster")} />
            <Tab active={tab === "portfolio"} label="Portfolio" onPress={() => setTab("portfolio")} />
          </View>

          {tab === "schedule"
            ? <CaddieSchedulePanel onEditAvailability={() => setAvailabilityEditorVisible(true)} slots={availabilitySlots} />
            : tab === "roster"
              ? <EmptyState description="Assignments will appear after the booking service is connected." icon="clipboard-text-outline" title="No roster entries" />
              : <EmptyState description="Portfolio details will appear after the profile service is connected." icon="account-outline" title="Portfolio unavailable" />}
        </ResponsiveContent>
      </ScrollView>
      {availabilityEditorVisible
        ? <CaddieAvailabilityEditor onClose={() => setAvailabilityEditorVisible(false)} onSave={setAvailabilitySlots} slots={availabilitySlots} />
        : null}
    </SafeAreaView>
  );
}
function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  tab: { alignItems: "center", borderRadius: radius.sm, flex: 1, justifyContent: "center", minHeight: 36 },
  tabActive: { backgroundColor: colors.fairwayDark },
  tabText: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800" },
  tabTextActive: { color: colors.surface },
  tabs: { backgroundColor: "#DFE0E0", borderRadius: radius.md, flexDirection: "row", padding: 4 },
  title: { color: colors.text, fontSize: 24, fontWeight: "900" }
});
