import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { EmptyState } from "../../ui/EmptyState";
import { backToPreviousPage } from "../../ui/navigation";
import { useAppSession } from "../session/AppSession";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";

type ProfileRole = "golfer" | "caddie";

export function RoleProfileScreen({ role }: { role: ProfileRole }) {
  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.frame}>
          <ProfileHeader role={role} />
          {role === "golfer" ? <GolferProfilePlaceholder /> : <CaddieProfilePlaceholder />}
        </ResponsiveContent>
      </ScrollView>
      {role === "golfer" ? <MobileBottomNavigation active="profile" /> : null}
    </SafeAreaView>
  );
}
function GolferProfilePlaceholder() {
  return <><View style={styles.golferCard}><View style={styles.initialAvatar}><MaterialCommunityIcons color={colors.surface} name="account-outline" size={28} /></View><View style={styles.golferCopy}><Text style={styles.eyebrow}>GOLFER</Text><Text accessibilityRole="header" style={styles.golferName}>Profile unavailable</Text><Text style={styles.golferCourse}>Profile service not connected</Text><Text style={styles.golferBio}>Your golfer details will appear here when they are available.</Text></View></View><View style={styles.statsGrid}><StatCard label="Rounds" /><StatCard label="Average score" /><StatCard label="Favorite caddie" wide /></View><HistoryPlaceholder title="Round History" /><AccountRoleCard role="golfer" /></>;
}
function CaddieProfilePlaceholder() {
  return <><View style={styles.caddieCard}><View style={styles.caddieAvatar}><MaterialCommunityIcons color={colors.surface} name="account-outline" size={30} /></View><View style={styles.caddieCopy}><Text style={styles.eyebrow}>CADDIE</Text><Text accessibilityRole="header" style={styles.caddieName}>Profile unavailable</Text><Text style={styles.caddieMeta}>Profile service not connected</Text><Text style={styles.caddieBio}>Your caddie details will appear here when they are available.</Text></View></View><AccountRoleCard role="caddie" /><View style={styles.caddieStats}><CaddieStat label="Rounds caddied" /><CaddieStat label="Average rating" /></View><View style={styles.recentGolfer}><View style={styles.recentAvatar}><MaterialCommunityIcons color={colors.fairwayDark} name="account-outline" size={18} /></View><View><Text style={styles.recentLabel}>Recent golfer</Text><Text style={styles.recentName}>No assignment data</Text><Text style={styles.recentMeta}>Details will appear when bookings are connected.</Text></View></View><HistoryPlaceholder title="Match History" /></>;
}
function HistoryPlaceholder({ title }: { title: string }) { return <View style={styles.history}><Text accessibilityRole="header" style={styles.historyTitle}>{title}</Text><View style={styles.historyCard}><EmptyState description="History will appear after the booking service is connected." icon="history" minHeight={220} title="No history data" /></View></View>; }
function StatCard({ label, wide = false }: { label: string; wide?: boolean }) { return <View style={[styles.statCard, wide && styles.statWide]}><Text style={styles.statLabel}>{label}</Text><Text accessibilityLabel={`${label} unavailable`} style={styles.statValue}>—</Text></View>; }
function CaddieStat({ label }: { label: string }) { return <View style={styles.caddieStat}><Text style={styles.recentLabel}>{label}</Text><Text accessibilityLabel={`${label} unavailable`} style={styles.caddieStatValue}>—</Text></View>; }
export function ProfileHeader({ role }: { role: ProfileRole }) {
  return (
    <View style={styles.header}>
      <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => backToPreviousPage(role === "golfer" ? "/golfer/home" : "/caddie/dashboard")} style={styles.headerButton}>
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
  caddieAvatar: { alignItems: "center", backgroundColor: colors.fairwayDark, borderRadius: 16, height: 76, justifyContent: "center", width: 76 },
  caddieBio: { color: colors.textMuted, fontSize: 11, lineHeight: 15 },
  caddieCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: spacing.md, padding: spacing.lg },
  caddieCopy: { flex: 1, gap: 3 },
  caddieInitials: { color: colors.surface, fontSize: 26, fontWeight: "900" },
  caddieMeta: { color: colors.textMuted, fontSize: 10, lineHeight: 14 },
  caddieName: { color: colors.fairwayDark, fontSize: 21, fontWeight: "900", lineHeight: 25 },
  caddieStat: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flex: 1, gap: 4, minHeight: 68, padding: spacing.md },
  caddieStatValue: { color: colors.fairwayDark, fontSize: 18, fontWeight: "900" },
  caddieStats: { flexDirection: "row", gap: spacing.sm },
  content: { padding: spacing.lg, paddingBottom: 28 },
  avatar: { alignItems: "center", backgroundColor: colors.fairwayDark, borderRadius: 34, height: 68, justifyContent: "center", width: 68 },
  course: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
  detail: { alignItems: "center", borderTopColor: colors.border, borderTopWidth: 1, flexDirection: "row", justifyContent: "space-between", minHeight: 48, paddingVertical: spacing.sm },
  detailLabel: { color: colors.textMuted, fontSize: 13 },
  detailValue: { color: colors.fairwayDark, fontSize: 14, fontWeight: "800", maxWidth: "58%", textAlign: "right" },
  details: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.sm, padding: spacing.lg },
  editButton: { alignItems: "center", justifyContent: "center", minHeight: 32, minWidth: 32, position: "absolute", right: spacing.sm, top: spacing.sm },
  frame: { gap: spacing.lg },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 44 },
  headerButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 },
  headerTitle: { color: colors.text, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  hero: { alignItems: "center", backgroundColor: "#E7EEE9", borderRadius: 16, flexDirection: "row", gap: spacing.md, padding: spacing.lg },
  heroCopy: { flex: 1, gap: 3 },
  localNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: spacing.xs },
  golferBio: { color: colors.textMuted, fontSize: 9, lineHeight: 13, marginTop: 6 },
  golferCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: "row", gap: spacing.sm, padding: spacing.md, position: "relative" },
  golferCopy: { flex: 1, gap: 1, paddingRight: spacing.md },
  golferCourse: { color: colors.textMuted, fontSize: 8, lineHeight: 12 },
  golferName: { color: colors.ink, fontSize: 16, fontWeight: "900", lineHeight: 19 },
  eyebrow: { color: "#517064", fontSize: 7, fontWeight: "800", letterSpacing: 1.4 },
  history: { gap: spacing.md, marginTop: spacing.md },
  historyCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  historyTitle: { color: colors.ink, fontSize: 17, fontWeight: "900" },
  initial: { color: colors.surface, fontSize: 23, fontWeight: "900" },
  initialAvatar: { alignItems: "center", backgroundColor: colors.fairwayDark, borderRadius: 12, height: 58, justifyContent: "center", width: 58 },
  matchStatus: { color: colors.fairwayDark, fontSize: 13, fontWeight: "900" },
  name: { color: colors.fairwayDark, fontSize: 22, fontWeight: "900" },
  role: { color: colors.text, fontSize: 14, fontWeight: "700" },
  round: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", minHeight: 60, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  roundCopy: { flex: 1, paddingRight: spacing.sm },
  roundBorder: { borderTopColor: colors.border, borderTopWidth: 1 },
  roundCourse: { color: colors.ink, fontSize: 10, fontWeight: "900" },
  roundMeta: { color: colors.textMuted, fontSize: 8, marginTop: 4 },
  portfolioLink: { color: colors.fairwayDark, fontSize: 11, fontWeight: "800", marginTop: 3 },
  recentAvatar: { alignItems: "center", backgroundColor: "#E4F0E8", borderRadius: 20, height: 40, justifyContent: "center", width: 40 },
  recentGolfer: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: spacing.md, padding: spacing.md },
  recentInitials: { color: colors.fairwayDark, fontSize: 14, fontWeight: "900" },
  recentLabel: { color: colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  recentMeta: { color: colors.textMuted, fontSize: 10, marginTop: 2 },
  recentName: { color: colors.ink, fontSize: 16, fontWeight: "900" },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  sectionTitle: { color: colors.fairwayDark, fontSize: 16, fontWeight: "800" },
  score: { alignItems: "flex-end" }, scoreLabel: { color: colors.textMuted, fontSize: 7, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" }, scoreValue: { color: colors.fairwayDark, fontSize: 15, fontWeight: "900" },
  statCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, gap: 3, minHeight: 56, padding: spacing.md },
  statLabel: { color: "#517064", fontSize: 8, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  statValue: { color: colors.ink, fontSize: 15, fontWeight: "900" },
  statWide: { flexBasis: "100%" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  switchButton: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44, paddingHorizontal: 14 },
  switchCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.sm, padding: spacing.lg },
  switchDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  switchText: { color: colors.onPrimary, fontSize: 14, fontWeight: "800" },
  switchTitle: { color: colors.fairwayDark, fontSize: 16, fontWeight: "800" }
});
