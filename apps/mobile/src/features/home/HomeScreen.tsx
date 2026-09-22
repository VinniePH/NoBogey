import { router } from "expo-router";
import { useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import mobileHero from "../../../assets/images/mobile-hero.png";
import { useMobileData } from "../data/useMobileData";
import { CaddieCard, CourseCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "../caddies/components/CaddieDetailSheet";
import { EmptyState } from "../../ui/EmptyState";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MOBILE_BOTTOM_NAVIGATION_HEIGHT, MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { InAppAlertBanner } from "../notifications/InAppAlertBanner";
import { NotificationBell } from "../notifications/NotificationBell";
import { useNotificationAlerts } from "../notifications/NotificationAlertProvider";
import { TourTarget, useAutomaticGuidedTour } from "../guided-tour/GuidedTour";

export function HomeScreen() {
  useAutomaticGuidedTour("golfer");
  const insets = useSafeAreaInsets();
  const { caddies, courses } = useMobileData();
  const { dismissBanner, getUnreadCount, getVisibleAlert, markBookingOpened } = useNotificationAlerts();
  const [selectedCaddieId, setSelectedCaddieId] = useState<string>();
  const selectedCaddie = caddies.find((caddie) => caddie.id === selectedCaddieId) ?? null;
  const alert = getVisibleAlert("golfer");

  return <SafeAreaView edges={["top"]} style={styles.safeArea}><ScrollView contentContainerStyle={[styles.content, { paddingBottom: MOBILE_BOTTOM_NAVIGATION_HEIGHT + insets.bottom + spacing.xl }]} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.page}>
    {alert ? <InAppAlertBanner actionLabel="View booking" body={alert.body} onAction={() => { markBookingOpened(alert.bookingId, "golfer"); router.push({ pathname: "/golfer/bookings/[bookingId]", params: { bookingId: alert.bookingId } }); }} onDismiss={() => dismissBanner(alert.id)} title={alert.title} /> : null}
    <TourTarget id="golfer-home"><ImageBackground resizeMode="cover" source={mobileHero} style={styles.hero}><View style={styles.heroCopy}>
      <View style={styles.brandRow}><Text accessibilityRole="header" style={styles.wordmark}>NoBogey</Text><NotificationBell count={getUnreadCount("golfer")} onPress={() => router.push("/golfer/bookings")} /></View>
      <Text accessibilityRole="header" style={styles.headline}>The perfect walk,{"\n"}arranged <Text style={styles.headlineAccent}>on-demand.</Text></Text><Text style={styles.heroDescription}>Professional caddies for every skill level. Book your preferred bagman at any course in the metro, instantly.</Text>
    </View></ImageBackground></TourTarget>
    <View style={styles.searchCard}><SearchDetail label="Location" value="No course selected" /><View style={styles.divider} /><SearchDetail label="Date" value="No date selected" /><Pressable accessibilityLabel="Choose a course" accessibilityRole="button" onPress={() => router.push("/golfer/courses")} style={styles.searchButton}><Text style={styles.searchButtonText}>Choose a course</Text></Pressable></View>
    <View style={styles.sectionDivider} />
    <HomeSection actionLabel="See All" onAction={() => router.push("/golfer/courses/all")} title="Courses">{courses.length ? <ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>{courses.map((course) => <CourseCard compact course={course} key={course.id} onPress={() => router.push({ pathname: "/golfer/courses/[courseId]", params: { courseId: course.id } })} />)}</ScrollView> : <View style={styles.emptySection}><EmptyState description="Courses will appear after the catalog service is connected." icon="golf" minHeight={390} title="No courses available" /></View>}</HomeSection>
    <HomeSection actionLabel="See All" onAction={() => router.push("/golfer/caddies/all")} title="Caddies">{caddies.length ? <ScrollView horizontal contentContainerStyle={styles.horizontalList} showsHorizontalScrollIndicator={false}>{caddies.map((caddie) => <CaddieCard caddie={caddie} compact key={caddie.id} onPress={() => setSelectedCaddieId(caddie.id)} />)}</ScrollView> : <View style={styles.emptySection}><EmptyState description="Caddies will appear after the directory service is connected." icon="account-group-outline" minHeight={470} title="No caddies available" /></View>}</HomeSection>
  </ResponsiveContent></ScrollView><MobileBottomNavigation active="home" /><CaddieDetailSheet caddie={selectedCaddie} course={courses.find((course) => course.id === selectedCaddie?.homeCourseId)} onBook={() => router.push({ pathname: "/golfer/courses", params: { caddieId: selectedCaddie?.id, courseId: selectedCaddie?.homeCourseId } })} onClose={() => setSelectedCaddieId(undefined)} visible={Boolean(selectedCaddie)} /></SafeAreaView>;
}

function SearchDetail({ label, value }: { label: string; value: string }) { return <View style={styles.searchDetail}><Text style={styles.fieldLabel}>{label}</Text><Text selectable style={styles.fieldValue}>{value}</Text></View>; }
function HomeSection({ actionLabel, children, onAction, title }: { actionLabel: string; children: React.ReactNode; onAction: () => void; title: string }) { return <View style={styles.section}><View style={styles.sectionHeader}><Text accessibilityRole="header" style={styles.sectionTitle}>{title}</Text><Pressable accessibilityLabel={`${actionLabel} ${title.toLowerCase()}`} accessibilityRole="button" hitSlop={8} onPress={onAction} style={styles.seeAllButton}><Text style={styles.seeAll}>{actionLabel}</Text></Pressable></View>{children}</View>; }

const styles = StyleSheet.create({
  brandRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" }, content: { paddingTop: spacing.sm }, divider: { backgroundColor: "#D5D4CD", height: 1 }, emptySection: { paddingHorizontal: spacing.xl }, fieldLabel: { color: "#687B70", fontSize: 11, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" }, fieldValue: { color: "#686760", fontSize: 18, lineHeight: 24 }, headline: { color: "#050705", fontSize: 29, fontWeight: "900", letterSpacing: -0.6, lineHeight: 35 }, headlineAccent: { color: "#397250" }, hero: { aspectRatio: 1, backgroundColor: "#EFF4ED", overflow: "hidden", width: "100%" }, heroCopy: { backgroundColor: "rgba(239, 244, 237, 0.82)", flex: 1, gap: spacing.md, paddingBottom: 62, paddingHorizontal: spacing.xl, paddingTop: spacing.lg }, heroDescription: { color: "#5C5E57", fontSize: 14, lineHeight: 20, maxWidth: 520 }, horizontalList: { gap: spacing.md, paddingHorizontal: spacing.xl }, page: { gap: spacing.xl }, safeArea: { backgroundColor: "#FAF9F6", flex: 1 }, searchButton: { alignItems: "center", backgroundColor: "#22633E", borderRadius: 12, justifyContent: "center", minHeight: 48 }, searchButtonText: { color: colors.surface, fontSize: 16, fontWeight: "800" }, searchCard: { backgroundColor: colors.surface, borderColor: "#E1E0DA", borderCurve: "continuous", borderRadius: 18, borderWidth: 1, boxShadow: "0 4px 10px rgba(23, 32, 27, 0.12)", gap: spacing.md, marginHorizontal: spacing.lg, marginTop: -235, padding: spacing.lg }, searchDetail: { gap: 5 }, section: { gap: spacing.md }, sectionDivider: { backgroundColor: "#D8D7D0", height: 1, marginHorizontal: spacing.xl, marginTop: -spacing.sm }, sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.xl }, sectionTitle: { color: "#050705", fontSize: 28, fontWeight: "900", letterSpacing: -0.6 }, seeAll: { color: "#17432E", fontSize: 15, fontWeight: "800" }, seeAllButton: { justifyContent: "center", minHeight: 40 }, wordmark: { color: "#22633E", fontSize: 31, fontStyle: "italic", fontWeight: "900", letterSpacing: -1.2 }
});
