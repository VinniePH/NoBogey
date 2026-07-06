import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { courses } from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function CourseSelectionScreen() {
  return (
    <Screen
      title="Choose where you are playing."
      subtitle="Course selection drives available caddies, schedule rules, and future clubhouse operations."
    >
      {courses.map((course) => (
        <Pressable key={course.id} style={styles.courseCard} onPress={() => router.push("/caddies")}>
          <View style={styles.courseHeader}>
            <Text style={styles.courseName}>{course.name}</Text>
            <Text style={styles.distance}>{course.distanceKm.toFixed(1)} km</Text>
          </View>
          <Text style={styles.location}>
            {course.city}, {course.province}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaPill}>{course.holes} holes</Text>
            <Text style={styles.metaPill}>{course.caddieCount} caddies</Text>
          </View>
          <Text style={styles.amenities}>{course.amenities.join(" - ")}</Text>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  amenities: {
    color: colors.muted,
    fontSize: typography.small,
    lineHeight: 19
  },
  courseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.sm,
    padding: spacing.lg
  },
  courseHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  courseName: {
    color: colors.ink,
    flex: 1,
    fontSize: typography.title,
    fontWeight: "800",
    lineHeight: 25
  },
  distance: {
    color: colors.fairway,
    fontSize: typography.small,
    fontWeight: "800"
  },
  location: {
    color: colors.muted,
    fontSize: typography.body
  },
  metaPill: {
    backgroundColor: colors.sky,
    borderRadius: radius.sm,
    color: colors.fairwayDark,
    fontSize: typography.small,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
