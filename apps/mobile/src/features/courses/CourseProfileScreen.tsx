import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/mock";
import { ImagePlaceholder, PrimaryButton, ScreenSection } from "../../ui/booking-design";
import { CaddieCard } from "../booking/components/MarketplaceCards";

export function CourseProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const course = courses.find((item) => item.id === id) ?? courses[0]!;
  const available = caddies.filter((item) => item.homeCourseId === course.id);
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
    <View><ImagePlaceholder label="Course hero placeholder" style={styles.heroImage} /><View style={styles.introCard}><Text style={styles.kicker}>{course.city}, {course.province}</Text><Text accessibilityRole="header" style={styles.title}>{course.name}</Text><Text style={styles.description}>The most prestigious golf club in the Philippines.</Text><View style={styles.rule}/><View style={styles.stats}><Stat label="PAR" value="71"/><Stat label="YARDS" value="6,850"/><Stat label="DESIGNER" value="Robert Trent Jones Jr."/><Stat label="AVAILABLE" value={`${course.caddieCount} caddies`}/></View></View></View>
    <ScreenSection title="Available caddies" action={<Pressable accessibilityLabel="See all available caddies" accessibilityRole="button" hitSlop={8} onPress={() => router.push({ pathname: "/caddies", params: { courseId: course.id } })} style={styles.seeAllButton}><Text style={styles.seeAll}>See All</Text></Pressable>}><ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>{available.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => router.push({ pathname: "/caddies/[id]", params: { id: caddie.id, courseId: course.id } })} />)}</ScrollView></ScreenSection>
    <View style={styles.locationCard}><View style={styles.mapPlaceholder}/><View style={styles.locationCopy}><Text style={styles.kicker}>LOCATION</Text><Text style={styles.locationName}>{course.name}</Text><Text style={styles.address}>⌾ {course.city}, {course.province}</Text><PrimaryButton label="Get Directions" /></View></View>
  </ScrollView></SafeAreaView>;
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.kicker}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  address: { color: "#718075", fontSize: typography.body },
  content: { gap: 44, paddingBottom: 48 },
  description: { color: "#6B6A65", fontSize: 24, lineHeight: 30 },
  heroImage: { height: 365, width: "100%" },
  horizontalList: { gap: spacing.lg, paddingHorizontal: spacing.xl },
  introCard: { backgroundColor: colors.surface, borderColor: "#999890", borderRadius: 12, borderWidth: 1, elevation: 4, gap: spacing.md, marginHorizontal: spacing.xl, marginTop: -78, padding: spacing.xl, shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 5 },
  kicker: { color: "#6F8176", fontSize: typography.small, fontWeight: "700", letterSpacing: 2, textTransform: "uppercase" },
  locationCard: { backgroundColor: colors.surface, borderColor: "#999890", borderRadius: radius.md, borderWidth: 1, marginHorizontal: spacing.xl, overflow: "hidden" },
  locationCopy: { gap: spacing.md, padding: spacing.xl },
  locationName: { color: "#24543D", fontSize: 25, fontWeight: "800", lineHeight: 30 },
  mapPlaceholder: { backgroundColor: colors.fairwayDark, height: 180 },
  rule: { backgroundColor: "#30302C", height: 1, marginVertical: spacing.md },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  seeAll: { color: "#417A59", fontSize: typography.body, fontWeight: "800" },
  seeAllButton: { justifyContent: "center", minHeight: 44 },
  stat: { flexBasis: "45%", gap: 3 },
  statValue: { color: "#17201B", fontSize: typography.body, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xl, justifyContent: "space-between" },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
