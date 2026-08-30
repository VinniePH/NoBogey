import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { PrimaryButton, ScreenSection } from "../../ui/booking-design";
import { EmptyState } from "../../ui/EmptyState";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useMobileData } from "../data/useMobileData";

export function CourseProfileScreen() {
  const { caddies, courses } = useMobileData();
  const { courseId } = useLocalSearchParams<{ courseId?: string }>();
  const course = courses.find((item) => item.id === courseId);
  if (!course) return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><View style={styles.emptyPage}><EmptyState description="Course details will appear after the catalog service is connected." icon="golf" minHeight={700} title="Course unavailable" /></View></SafeAreaView>;
  const available = caddies.filter((item) => item.homeCourseId === course.id);
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
    <View><View accessibilityLabel={`${course.name} course`} accessibilityRole="image" style={styles.heroImage}><MaterialCommunityIcons color={colors.fairwayDark} name="golf" size={48} /></View><View style={styles.introCard}><Text style={styles.kicker}>{course.city}, {course.province}</Text><Text accessibilityRole="header" style={styles.title}>{course.name}</Text><View style={styles.rule}/><View style={styles.stats}><Stat label="PAR" value={String(course.par)}/><Stat label="YARDS" value={course.yardage.toLocaleString()}/><Stat label="HOLES" value={String(course.holes)}/><Stat label="AVAILABLE" value={`${course.caddieCount} caddies`}/></View></View></View>
    <ScreenSection title="Available caddies" action={<Pressable accessibilityLabel="See all available caddies" accessibilityRole="button" hitSlop={8} onPress={() => router.push({ pathname: "/golfer/caddies", params: { courseId: course.id } })} style={styles.seeAllButton}><Text style={styles.seeAll}>See All</Text></Pressable>}>{available.length ? <ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>{available.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => router.push({ pathname: "/golfer/caddies/[caddieId]", params: { caddieId: caddie.id, courseId: course.id } })} />)}</ScrollView> : <View style={styles.emptyCaddies}><EmptyState description="Caddies will appear after the directory service is connected." icon="account-group-outline" minHeight={590} title="No caddies available" /></View>}</ScreenSection>
    <View style={styles.locationCard}><View style={styles.locationCopy}><Text style={styles.kicker}>LOCATION</Text><Text style={styles.locationName}>{course.name}</Text><Text style={styles.address}>⌾ {course.city}, {course.province}</Text><PrimaryButton label="Get Directions" /></View></View>
  </ResponsiveContent></ScrollView></SafeAreaView>;
}

function Stat({ label, value }: { label: string; value: string }) { return <View style={styles.stat}><Text style={styles.kicker}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>; }

const styles = StyleSheet.create({
  address: { color: "#718075", fontSize: typography.body },
  content: { gap: 44, paddingBottom: 48 },
  emptyCaddies: { paddingHorizontal: spacing.xl },
  emptyPage: { flex: 1, justifyContent: "center", padding: spacing.xl },
  frame: { gap: 44 },
  description: { color: "#6B6A65", fontSize: 24, lineHeight: 30 },
  heroImage: { alignItems: "center", backgroundColor: "#E7EEE9", height: 365, justifyContent: "center", width: "100%" },
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
