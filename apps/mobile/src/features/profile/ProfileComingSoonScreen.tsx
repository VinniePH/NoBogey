import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { ProfileHeader } from "./RoleProfileScreen";

type ProfileRole = "golfer" | "caddie";

export function ProfileComingSoonScreen({ role }: { role: ProfileRole }) {
  const roleLabel = role === "golfer" ? "golfer" : "caddie";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView contentContainerStyle={[styles.content, role === "golfer" && styles.contentWithNavigation]} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}>
        <ResponsiveContent style={styles.frame}>
          <ProfileHeader role={role} />
          <View style={styles.comingSoonCard}>
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons color={colors.fairwayDark} name="account-clock-outline" size={40} />
            </View>
            <Text accessibilityRole="header" style={styles.title}>Profile coming soon</Text>
            <Text style={styles.description}>We’re working on your {roleLabel} profile. Check back soon for account details, stats, and more.</Text>
          </View>
        </ResponsiveContent>
      </ScrollView>
      {role === "golfer" ? <MobileBottomNavigation active="profile" /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  comingSoonCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: spacing.md, marginTop: spacing.xl, paddingHorizontal: spacing.xl, paddingVertical: 44 },
  content: { flexGrow: 1, padding: spacing.lg, paddingBottom: spacing.xl },
  contentWithNavigation: { paddingBottom: 112 },
  description: { color: colors.textMuted, fontSize: 14, lineHeight: 21, maxWidth: 280, textAlign: "center" },
  frame: { flex: 1 },
  iconCircle: { alignItems: "center", backgroundColor: "#E7EEE9", borderRadius: 32, height: 64, justifyContent: "center", width: 64 },
  safeArea: { backgroundColor: colors.canvas, flex: 1 },
  title: { color: colors.fairwayDark, fontSize: 21, fontWeight: "900", letterSpacing: -0.3, textAlign: "center" }
});
