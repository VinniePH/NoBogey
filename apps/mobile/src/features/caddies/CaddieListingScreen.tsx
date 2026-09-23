import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { BookingSummaryStrip, CaddieOptionCard, FindGameScreen, Notice, SectionHeading, SelectionMark, flowColors } from "../booking/components/FindGameUI";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "./components/CaddieDetailSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { useMobileData } from "../data/useMobileData";
import { getAvailableCaddies } from "../../../backend/caddies/caddies.service";

export function CaddieListingScreen() {
  const { caddies, courses, isLoading: dataLoading } = useMobileData();
  const { caddieId, courseId, date, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; date?: string; teeTimeId?: string; time?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(caddieId);
  const [noPreference, setNoPreference] = useState(false);
  const [bookableIds, setBookableIds] = useState<Set<string> | null>(null);
  const [loading, setLoading] = useState(false);
  const isGlobalDirectory = !courseId || !teeTimeId;
  const course = courses.find((item) => item.id === courseId);
  const availableCaddies = useMemo(() => caddies.filter((caddie) => isGlobalDirectory ? (!courseId || caddie.homeCourseId === courseId) : bookableIds?.has(caddie.id)), [bookableIds, caddies, courseId, isGlobalDirectory]);

  useEffect(() => {
    let active = true;
    if (isGlobalDirectory || !courseId || !time) { setBookableIds(null); return; }
    setLoading(true);
    void getAvailableCaddies(courseId, time).then((items) => { if (active) setBookableIds(new Set(items.map((item) => item.id))); }).catch(() => { if (active) setBookableIds(new Set()); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [courseId, isGlobalDirectory, time]);

  useEffect(() => { setSelectedId(availableCaddies.some((caddie) => caddie.id === caddieId) ? caddieId : undefined); }, [availableCaddies, caddieId]);

  if (!isGlobalDirectory) {
    return <FindGameScreen actionDisabled={!noPreference && (loading || dataLoading || !selectedId)} actionLabel="Continue" description="Play with a trusted caddie and make your round even better." onAction={() => router.push({ pathname: "/golfer/bookings/new", params: { caddieId: noPreference ? undefined : selectedId, noPreference: noPreference ? "1" : undefined, courseId, date, teeTimeId, time } })} step={3} title="Choose a preferred caddie">
      {course && time ? <BookingSummaryStrip course={course} time={time} /> : null}
      <Notice>Your preferred caddie is a request. The club makes the final assignment based on availability.</Notice>
      <SectionHeading title="Select a caddie" />
      <View accessibilityRole="radiogroup" style={styles.flowList}>
        <Pressable accessibilityLabel="Select no preference" accessibilityRole="radio" accessibilityState={{ selected: noPreference }} onPress={() => { setNoPreference(true); setSelectedId(undefined); }} style={({ pressed }) => [styles.noPreference, noPreference && styles.noPreferenceSelected, pressed && styles.pressed]}><View style={styles.noPreferenceCopy}><Text style={styles.noPreferenceTitle}>No preference</Text><Text style={styles.noPreferenceDetail}>Let the club assign a caddie for you.</Text></View><SelectionMark selected={noPreference} /></Pressable>
        {loading || dataLoading ? <Text style={styles.loading}>Loading caddies…</Text> : availableCaddies.length ? availableCaddies.map((caddie) => <CaddieOptionCard caddie={caddie} key={caddie.id} onPress={() => { setSelectedId(caddie.id); setNoPreference(false); }} selected={selectedId === caddie.id && !noPreference} />) : <EmptyState description="No verified caddie is available for the full selected round." icon="account-group-outline" minHeight={250} title="No caddies available" />}
      </View>
    </FindGameScreen>;
  }

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Find a caddie.</Text><Text style={styles.subtitle}>Browse every verified caddie on NoBogey. Their home course is shown in each profile.</Text></View>
      {availableCaddies.length ? <View style={styles.grid}>{availableCaddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} />)}</View> : <View style={styles.empty}><EmptyState description="No verified caddies are currently listed." icon="account-group-outline" minHeight={620} title="No caddies available" /></View>}
    </ResponsiveContent></ScrollView>
    <CaddieDetailSheet caddie={caddies.find((caddie) => caddie.id === selectedId) ?? null} course={courses.find((item) => item.id === (courseId ?? caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId))} onBook={() => router.push({ pathname: "/golfer/courses", params: { caddieId: selectedId, courseId: caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedId)} />
    <MobileBottomNavigation active="caddies" />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  flowList: { gap: 10 },
  noPreference: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: flowColors.border, borderRadius: 16, borderWidth: 1, flexDirection: "row", gap: 12, minHeight: 76, padding: 14 },
  noPreferenceSelected: { backgroundColor: "#F1F7F1", borderColor: flowColors.forest, borderWidth: 2 },
  noPreferenceCopy: { flex: 1, gap: 3, minWidth: 0 },
  noPreferenceTitle: { color: flowColors.ink, fontSize: 16, fontWeight: "800" },
  noPreferenceDetail: { color: flowColors.muted, fontSize: 13, lineHeight: 18 },
  loading: { color: flowColors.muted, fontSize: 14, padding: 12 },
  pressed: { opacity: 0.75 },
  content: { gap: spacing.xl, paddingBottom: 112 },
  frame: { gap: spacing.xl },
  empty: { paddingHorizontal: spacing.xl },
  grid: { alignItems: "center", gap: spacing.lg, paddingHorizontal: spacing.lg },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
