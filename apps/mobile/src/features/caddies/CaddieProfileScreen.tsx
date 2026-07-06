import { router, useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import {
  availabilitySlots,
  caddies,
  courses,
  reviews
} from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function CaddieProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const fallbackCaddie = caddies[0];
  if (!fallbackCaddie) {
    return (
      <Screen
        title="Caddie not found"
        subtitle="No caddie profiles are available in local mock data yet."
      >
        <View style={styles.summaryCard}>
          <Text style={styles.bio}>
            The future backend will return a not-found error for unavailable profiles.
          </Text>
        </View>
      </Screen>
    );
  }

  const caddie = caddies.find((item) => item.id === id) ?? fallbackCaddie;
  const course = courses.find((item) => item.id === caddie.homeCourseId);
  const slots = availabilitySlots.filter((slot) => slot.caddieId === caddie.id);
  const review = reviews.find((item) => item.caddieId === caddie.id);

  return (
    <Screen
      title={caddie.displayName}
      subtitle={`${caddie.yearsExperience} years experience at ${course?.name ?? "local clubs"}.`}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.rate}>{formatMoney(caddie.rate.amountInCentavos)}</Text>
        <Text style={styles.bio}>{caddie.bio}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{caddie.ratingAverage.toFixed(1)} rating</Text>
          <Text style={styles.meta}>{caddie.reviewCount} reviews</Text>
          <Text style={styles.meta}>{caddie.verified ? "Verified" : "Pending"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        <View style={styles.tagWrap}>
          {caddie.specialties.map((specialty) => (
            <Text key={specialty} style={styles.tag}>
              {specialty}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available slots</Text>
        {slots.map((slot) => (
          <View key={slot.id} style={styles.slotRow}>
            <View>
              <Text style={styles.slotTime}>{formatTeeTime(slot.startsAt)}</Text>
              <Text style={styles.slotStatus}>{slot.status}</Text>
            </View>
            <Pressable style={styles.holdButton} onPress={() => router.push("/booking")}>
              <Text style={styles.holdButtonText}>Hold</Text>
            </Pressable>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        {caddie.portfolioHighlights.map((highlight) => (
          <Text key={highlight} style={styles.highlight}>
            {highlight}
          </Text>
        ))}
      </View>

      {review ? (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewText}>"{review.comment}"</Text>
          <Text style={styles.reviewMeta}>{review.rating} star review</Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  bio: {
    color: colors.surface,
    fontSize: typography.body,
    lineHeight: 23
  },
  highlight: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    color: colors.ink,
    fontSize: typography.body,
    padding: spacing.md
  },
  holdButton: {
    backgroundColor: colors.ink,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  holdButtonText: {
    color: colors.surface,
    fontSize: typography.small,
    fontWeight: "800"
  },
  meta: {
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
  },
  rate: {
    color: colors.sand,
    fontSize: typography.title,
    fontWeight: "800"
  },
  reviewCard: {
    backgroundColor: colors.sky,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.lg
  },
  reviewMeta: {
    color: colors.fairwayDark,
    fontSize: typography.small,
    fontWeight: "800"
  },
  reviewText: {
    color: colors.ink,
    fontSize: typography.body,
    lineHeight: 23
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  },
  slotRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md
  },
  slotStatus: {
    color: colors.muted,
    fontSize: typography.small,
    textTransform: "capitalize"
  },
  slotTime: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800"
  },
  summaryCard: {
    backgroundColor: colors.fairwayDark,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg
  },
  tag: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  }
});
