import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@nobogey/ui";
import { caddies, courses } from "../../data/catalog";
import { EmptyState } from "../../ui/EmptyState";
import { CourseCard, CaddieCard } from "../booking/components/MarketplaceCards";
import { CaddieDetailSheet } from "../caddies/components/CaddieDetailSheet";
import { ResponsiveContent } from "../../ui/ResponsiveContent";

export function AllCoursesScreen() {
  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>All courses</Text><Text style={styles.subtitle}>Browse golf courses currently available through NoBogey.</Text></View><View style={styles.list}>{courses.length ? courses.map((course) => <CourseCard course={course} key={course.id} onPress={() => router.push({ pathname: "/golfer/courses/[courseId]", params: { courseId: course.id } })} />) : <EmptyState description="Courses will appear after the catalog service is connected." icon="golf" title="No courses available" />}</View></ResponsiveContent></ScrollView></SafeAreaView>;
}

export function AllCaddiesScreen() {
  const [selectedId, setSelectedId] = useState<string>();
  const selectedCaddie = caddies.find((caddie) => caddie.id === selectedId) ?? null;
  const course = courses.find((item) => item.id === selectedCaddie?.homeCourseId);
  return <SafeAreaView edges={["bottom"]} style={styles.safeArea}><ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent><View style={styles.heading}><Text accessibilityRole="header" style={styles.title}>All caddies</Text><Text style={styles.subtitle}>Browse verified caddies across NoBogey. Open a profile to see their home course and specialties.</Text></View><View style={styles.list}>{caddies.length ? caddies.map((caddie) => <CaddieCard caddie={caddie} key={caddie.id} onPress={() => setSelectedId(caddie.id)} />) : <EmptyState description="Caddies will appear after the directory service is connected." icon="account-group-outline" title="No caddies available" />}</View></ResponsiveContent></ScrollView><CaddieDetailSheet caddie={selectedCaddie} course={course} onBook={() => router.push({ pathname: "/golfer/courses", params: { caddieId: selectedCaddie?.id, courseId: selectedCaddie?.homeCourseId } })} onClose={() => setSelectedId(undefined)} visible={Boolean(selectedCaddie)} /></SafeAreaView>;
}

const styles = StyleSheet.create({ content: { gap: spacing.xl, padding: spacing.xl, paddingBottom: spacing.xxl }, heading: { gap: spacing.sm }, list: { gap: spacing.lg }, safeArea: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 23 }, title: { color: colors.text, fontSize: typography.heading, fontWeight: "800" } });
