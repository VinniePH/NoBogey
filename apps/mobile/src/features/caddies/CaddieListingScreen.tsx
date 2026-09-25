import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, typography } from "@nobogey/ui";
import { EmptyState } from "../../ui/EmptyState";
import { CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "./components/CaddieDetailSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { MobileBottomNavigation } from "../../ui/MobileBottomNavigation";
import { useMobileData } from "../data/useMobileData";
import { FindGameDetailsScreen } from "../booking/find-game-details-screen";

export function CaddieListingScreen() {
  const { courseId, teeTimeId } = useLocalSearchParams<{ courseId?: string; teeTimeId?: string }>();
  return courseId && teeTimeId ? <FindGameDetailsScreen /> : <CaddieDirectoryScreen />;
}

function CaddieDirectoryScreen() {
  const { caddies, courses } = useMobileData();
  const { caddieId, courseId } = useLocalSearchParams<{ caddieId?: string; courseId?: string }>();
  const [selectedId, setSelectedId] = useState<string | undefined>(caddieId);
  const availableCaddies = useMemo(() => caddies.filter((caddie) => !courseId || caddie.homeCourseId === courseId), [caddies, courseId]);

  useEffect(() => { setSelectedId(availableCaddies.some((caddie) => caddie.id === caddieId) ? caddieId : undefined); }, [availableCaddies, caddieId]);

  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      <View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>Available caddies</Text><Text style={styles.subtitle}>Browse verified caddies and view their experience, specialties, and home course.</Text></View>
      {availableCaddies.length ? <View style={styles.grid}>{availableCaddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} verified />)}</View> : <View style={styles.empty}><EmptyState description="No verified caddies are currently listed." icon="account-group-outline" minHeight={620} title="No caddies available" /></View>}
    </ResponsiveContent></ScrollView>
    <CaddieDetailSheet caddie={caddies.find((caddie) => caddie.id === selectedId) ?? null} course={courses.find((item) => item.id === (courseId ?? caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId))} onBook={() => router.push({ pathname: "/golfer/courses", params: { caddieId: selectedId, courseId: caddies.find((caddie) => caddie.id === selectedId)?.homeCourseId } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedId)} />
    <MobileBottomNavigation active="caddies" />
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingBottom: 112 },
  frame: { gap: spacing.xl },
  empty: { paddingHorizontal: spacing.xl },
  grid: { alignItems: "center", gap: spacing.lg, paddingHorizontal: spacing.lg },
  heading: { gap: spacing.sm, paddingHorizontal: spacing.xl },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  subtitle: { color: "#6E6D67", fontSize: typography.body, lineHeight: 23 },
  title: { color: "#000000", fontSize: 36, fontWeight: "800", letterSpacing: -1, lineHeight: 42 }
});
