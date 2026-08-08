import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";
import { courses } from "../../data/mock";

const matches = [
  { id: "match-1024", golfer: "Mia Santos", date: "May 15, 2026", score: "82" },
  { id: "match-1017", golfer: "Robert Tan", date: "May 8, 2026", score: "76" },
  { id: "match-1011", golfer: "Maria Reyes", date: "May 1, 2026", score: "84" },
  { id: "match-1006", golfer: "Daniel Lim", date: "April 26, 2026", score: "79" }
];

export function CaddieMatchDetailScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId?: string }>();
  const match = matches.find((item) => item.id === bookingId) ?? matches[0]!;
  const course = courses[0]!;
  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content}><Text style={styles.eyebrow}>MATCH COMPLETED</Text><Text accessibilityRole="header" style={styles.title}>{course.name}</Text><Text style={styles.subtitle}>{match.date} · Golfer: {match.golfer}</Text><View style={styles.card}><Detail label="Golfer" value={match.golfer} /><Detail label="Course" value={course.name} /><Detail label="Score" value={match.score} /><Detail label="Round status" value="Completed" /></View><Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.button}><Text style={styles.buttonText}>Back to match history</Text></Pressable></ScrollView></SafeAreaView>;
}

function Detail({ label, value }: { label: string; value: string }) { return <View style={styles.detail}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  button: { alignItems: "center", backgroundColor: colors.primary, borderRadius: 10, justifyContent: "center", minHeight: 44 },
  buttonText: { color: colors.onPrimary, fontSize: 14, fontWeight: "800" },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 16, borderWidth: 1, gap: 18, padding: 18 },
  content: { gap: 14, padding: 20, paddingTop: 28 },
  detail: { gap: 4 },
  detailLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase" },
  detailValue: { color: colors.fairwayDark, fontSize: 16, fontWeight: "700" },
  eyebrow: { color: colors.fairwayDark, fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: 15, lineHeight: 21 },
  title: { color: colors.fairwayDark, fontSize: 28, fontWeight: "900" }
});
