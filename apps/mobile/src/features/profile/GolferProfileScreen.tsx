import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { caddies, courses, golfer } from "../../data/mock";

const roundHistory = [
  { caddie: "Elena S.", date: "May 15, 2026", score: 82 },
  { caddie: "Joey S.", date: "May 8, 2026", score: 72 },
  { caddie: "Daniel S.", date: "May 1, 2026", score: 89 },
  { caddie: "Frank S.", date: "April 26, 2026", score: 84 }
];

export function GolferProfileScreen() {
  const homeCourse = courses.find((course) => course.id === golfer.homeCourseId);
  const favoriteCaddie = caddies.find((caddie) => golfer.preferredCaddieIds.includes(caddie.id));
  const initials = golfer.displayName.split(" ").map((name) => name[0]).join("").slice(0, 2).toUpperCase();

  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        <View accessibilityLabel={`${golfer.displayName} initials avatar`} accessibilityRole="image" style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={styles.profileCopy}>
          <Text style={styles.eyebrow}>GOLFER</Text>
          <Text accessibilityRole="header" style={styles.name}>{golfer.displayName}</Text>
          <Text style={styles.profileMeta}>Handicap Mid ({golfer.handicap ?? "—"}) · Home: {homeCourse?.name ?? "Not set"}</Text>
          <Text style={styles.profileBio}>Weekend golfer chasing a single-digit handicap. Loves early tee times and a good green read.</Text>
        </View>
      </View>

      <View style={styles.statRow}>
        <ProfileStat label="ROUNDS" value="8" />
        <ProfileStat label="AVERAGE SCORE" value="85" />
      </View>

      <View style={styles.favoriteCard}>
        <Text style={styles.eyebrow}>FAVORITE CADDIE</Text>
        <Text style={styles.favoriteName}>{favoriteCaddie?.displayName ?? "No favorite yet"}</Text>
      </View>

      <View style={styles.historySection}>
        <Text accessibilityRole="header" style={styles.historyTitle}>Round History</Text>
        <View style={styles.historyCard}>
          {roundHistory.map((round, index) => <RoundRow key={`${round.date}-${round.score}`} isLast={index === roundHistory.length - 1} courseName={homeCourse?.name ?? "Home course"} {...round} />)}
        </View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return <View style={styles.statCard}><Text style={styles.eyebrow}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

function RoundRow({ caddie, courseName, date, isLast, score }: { caddie: string; courseName: string; date: string; isLast: boolean; score: number }) {
  return <View style={[styles.roundRow, !isLast && styles.roundDivider]}><View style={styles.roundCopy}><Text style={styles.roundCourse}>{courseName}</Text><Text style={styles.roundMeta}>{date} · Caddie: {caddie}</Text></View><View style={styles.score}><Text style={styles.eyebrow}>SCORE</Text><Text style={styles.scoreValue}>{score}</Text></View></View>;
}

const styles = StyleSheet.create({
  avatar: { alignItems: "center", backgroundColor: "#113827", borderCurve: "continuous", borderRadius: 17, height: 74, justifyContent: "center", width: 74 },
  avatarText: { color: colors.surface, fontSize: 28, fontWeight: "800" },
  content: { gap: 26, padding: 18, paddingBottom: 32 },
  eyebrow: { color: "#60736A", fontSize: 10, fontWeight: "800", letterSpacing: 0.15 },
  favoriteCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, gap: 3, paddingHorizontal: 16, paddingVertical: 17 },
  favoriteName: { color: "#123427", fontSize: 17, fontWeight: "800" },
  historyCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, overflow: "hidden" },
  historySection: { gap: 12 },
  historyTitle: { color: "#123427", fontSize: 20, fontWeight: "800" },
  name: { color: "#123427", fontSize: 20, fontWeight: "800", letterSpacing: -0.35, lineHeight: 23 },
  profileBio: { color: "#60736A", fontSize: 9, lineHeight: 13 },
  profileCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 13, minHeight: 120, padding: 16 },
  profileCopy: { flex: 1, gap: 2 },
  profileMeta: { color: "#60736A", fontSize: 9, lineHeight: 13 },
  roundCopy: { flex: 1, gap: 7 },
  roundCourse: { color: "#123427", fontSize: 13, fontWeight: "800" },
  roundDivider: { borderBottomColor: "#A9AAA2", borderBottomWidth: StyleSheet.hairlineWidth },
  roundMeta: { color: "#52665C", fontSize: 11 },
  roundRow: { alignItems: "center", flexDirection: "row", gap: spacing.md, minHeight: 79, paddingHorizontal: 14, paddingVertical: 15 },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  score: { alignItems: "flex-end", gap: 2 },
  scoreValue: { color: "#123427", fontFamily: "JetBrainsMono", fontSize: 20, fontWeight: "800" },
  statCard: { backgroundColor: colors.surface, borderColor: "#A9AAA2", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flex: 1, gap: 3, minHeight: 70, paddingHorizontal: 16, paddingVertical: 14 },
  statRow: { flexDirection: "row", gap: 11 },
  statValue: { color: "#123427", fontFamily: "JetBrainsMono", fontSize: 17, fontWeight: "800" }
});
