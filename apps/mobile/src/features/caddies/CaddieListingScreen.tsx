import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatMoney } from "@nobogey/utils";
import { caddies, courses } from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function CaddieListingScreen() {
  return (
    <Screen
      title="Match with a trusted loop."
      subtitle="Profiles show verification, rates, strengths, and course familiarity before a booking is requested."
    >
      {caddies.map((caddie) => {
        const course = courses.find((item) => item.id === caddie.homeCourseId);
        return (
          <Pressable
            key={caddie.id}
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/caddies/[id]", params: { id: caddie.id } })
            }
          >
            <View style={styles.topRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{caddie.displayName.slice(0, 1)}</Text>
              </View>
              <View style={styles.nameGroup}>
                <Text style={styles.name}>{caddie.displayName}</Text>
                <Text style={styles.course}>{course?.name}</Text>
              </View>
              <Text style={styles.rate}>{formatMoney(caddie.rate.amountInCentavos)}</Text>
            </View>
            <Text style={styles.bio}>{caddie.bio}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>{caddie.ratingAverage.toFixed(1)} stars</Text>
              <Text style={styles.meta}>{caddie.completedRounds} rounds</Text>
              <Text style={styles.meta}>{caddie.yearsExperience} yrs</Text>
            </View>
          </Pressable>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: colors.fairway,
    borderRadius: 22,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  avatarText: {
    color: colors.surface,
    fontSize: typography.title,
    fontWeight: "800"
  },
  bio: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.lg
  },
  course: {
    color: colors.muted,
    fontSize: typography.small
  },
  meta: {
    backgroundColor: colors.canvas,
    borderRadius: radius.sm,
    color: colors.ink,
    fontSize: typography.small,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  name: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  },
  nameGroup: {
    flex: 1,
    gap: spacing.xs
  },
  rate: {
    color: colors.fairway,
    fontSize: typography.small,
    fontWeight: "800"
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md
  }
});
