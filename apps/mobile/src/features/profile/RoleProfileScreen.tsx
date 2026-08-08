import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useAppSession } from "../session/AppSession";

type ProfileRole = "golfer" | "caddie";

export function RoleProfileScreen({ role }: { role: ProfileRole }) {
  // TODO: load the authenticated golfer or caddie profile from the real profile service.
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.frame}>
          <ProfileHeader role={role} />
          <EmptyState
            description={role === "golfer"
              ? "Golfer details and round history will appear after the profile service is connected."
              : "Caddie details, portfolio, and match history will appear after the profile service is connected."}
            icon={role === "golfer" ? "account-outline" : "account-hard-hat-outline"}
            title="Profile unavailable"
          />
          <AccountRoleCard role={role} />
        </ResponsiveContent>
      </ScrollView>
    </SafeAreaView>
  );
}
export function ProfileHeader({ role }: { role: ProfileRole }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => router.back()} style={styles.headerButton}>
        <MaterialCommunityIcons color={colors.fairwayDark} name="arrow-left" size={25} />
      </Pressable>
      <Text accessibilityRole="header" style={styles.headerTitle}>My Profile</Text>
      <Pressable accessibilityLabel="Open settings" accessibilityRole="button" hitSlop={10} onPress={() => router.push(role === "golfer" ? "/golfer/settings" : "/caddie/settings")} style={styles.headerButton}>
        <MaterialCommunityIcons color={colors.fairwayDark} name="cog-outline" size={24} />
      </Pressable>
    </View>
  );
}

export function AccountRoleCard({ role }: { role: ProfileRole }) {
  const { initialRole, switchRole } = useAppSession();
  const otherRole = role === "golfer" ? "caddie" : "golfer";
  const otherRoleHasBeenAdded = initialRole === otherRole;
  const switchToOtherRole = () => {
    switchRole(otherRole);
    router.replace(otherRole === "golfer" ? "/golfer/profile" : "/caddie/profile");
  };

  return (
    <View style={styles.switchCard}>
      <Text style={styles.switchTitle}>Account role</Text>
      <Text style={styles.switchDescription}>
        {otherRoleHasBeenAdded
          ? `Your ${otherRole} identity is ready to use on this device.`
          : `Add a ${otherRole} identity only if you also ${otherRole === "caddie" ? "caddie" : "play"}.`}
      </Text>
      <Pressable
        accessibilityLabel={otherRoleHasBeenAdded ? `Switch to ${otherRole}` : `Become a ${otherRole}`}
        accessibilityRole="button"
        onPress={otherRoleHasBeenAdded ? switchToOtherRole : () => router.push({ pathname: "/sign-in", params: { mode: "register", role: otherRole } })}
        style={styles.switchButton}
      >
        <Text style={styles.switchText}>{otherRoleHasBeenAdded ? `Switch to ${otherRole}` : `Become a ${otherRole}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: 28 },
  frame: { gap: spacing.lg },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  headerButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  switchButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, paddingHorizontal: 14 },
  switchCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.sm, padding: spacing.lg },
  switchDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  switchText: { color: colors.onPrimary, fontSize: 14, fontWeight: "800" },
  switchTitle: { color: colors.fairwayDark, fontSize: 16, fontWeight: "800" }
});
