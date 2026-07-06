import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";
import { formatMoney, formatTeeTime } from "@nobogey/utils";
import { availabilitySlots, bookings, caddies } from "../../data/mock";
import { Screen } from "../../ui/Screen";

export function CaddieDashboardScreen() {
  const caddie = caddies[0];
  if (!caddie) {
    return (
      <Screen
        title="Caddie dashboard"
        subtitle="Caddie metrics will appear here after profiles are loaded."
      >
        <View style={styles.row}>
          <Text style={styles.rowTitle}>No caddie profile</Text>
          <Text style={styles.rowMeta}>Mock data is empty</Text>
        </View>
      </Screen>
    );
  }

  const slots = availabilitySlots.filter((slot) => slot.caddieId === caddie.id);
  const roster = bookings.filter((booking) => booking.caddieId === caddie.id);
  const projectedEarnings = roster.reduce(
    (total, booking) => total + booking.quotedRate.amountInCentavos,
    0
  );

  return (
    <Screen
      title="Caddie dashboard"
      subtitle="Availability, roster, earnings, feedback, and portfolio are represented as placeholders for the future caddie role."
    >
      <View style={styles.summary}>
        <Metric label="Open slots" value={String(slots.length)} />
        <Metric label="Roster" value={String(roster.length)} />
        <Metric label="Earnings" value={formatMoney(projectedEarnings)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Availability</Text>
        {slots.map((slot) => (
          <View key={slot.id} style={styles.row}>
            <Text style={styles.rowTitle}>{formatTeeTime(slot.startsAt)}</Text>
            <Text style={styles.rowMeta}>{slot.status}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio prompts</Text>
        {caddie.portfolioHighlights.map((highlight) => (
          <View key={highlight} style={styles.row}>
            <Text style={styles.rowTitle}>{highlight}</Text>
            <Text style={styles.rowMeta}>Visible after verification workflow</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.xs,
    minWidth: 96,
    padding: spacing.md
  },
  metricLabel: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  metricValue: {
    color: colors.fairway,
    fontSize: typography.title,
    fontWeight: "900"
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md
  },
  rowMeta: {
    color: colors.muted,
    fontSize: typography.small,
    textTransform: "capitalize"
  },
  rowTitle: {
    color: colors.ink,
    fontSize: typography.body,
    fontWeight: "800"
  },
  section: {
    gap: spacing.sm
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: typography.title,
    fontWeight: "800"
  },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md
  }
});
