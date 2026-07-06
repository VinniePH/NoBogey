import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { bookings, caddies, courses, golfer } from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function GolferProfileScreen() {
  const homeCourse = courses.find((course) => course.id === golfer.homeCourseId);
  const preferred = caddies.filter((caddie) =>
    golfer.preferredCaddieIds.includes(caddie.id)
  );

  return (
    <Screen
      title={golfer.displayName}
      subtitle="Profile and history stay local for now, but the structure mirrors future account data."
    >
      <View style={styles.profileCard}>
        <Text style={styles.initials}>MS</Text>
        <View style={styles.profileText}>
          <Text style={styles.name}>{golfer.displayName}</Text>
          <Text style={styles.meta}>
            Handicap {golfer.handicap} - Home course {homeCourse?.name}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferred caddies</Text>
        {preferred.map((caddie) => (
          <View key={caddie.id} style={styles.row}>
            <Text style={styles.rowTitle}>{caddie.displayName}</Text>
            <Text style={styles.rowMeta}>{caddie.specialties[0]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking history placeholder</Text>
        {bookings.map((booking) => (
          <View key={booking.id} style={styles.row}>
            <Text style={styles.rowTitle}>{booking.status}</Text>
            <Text style={styles.rowMeta}>
              Party of {booking.partySize} - {booking.notes}
            </Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  initials: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: "900"
  },
  meta: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23
  },
  name: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg
  },
  profileText: {
    flex: 1,
    gap: spacing.xs
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md
  },
  rowMeta: {
    color: colors.muted,
    fontSize: typography.small
  },
  rowTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800",
    textTransform: "capitalize"
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  }
});
