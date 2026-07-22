import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";

interface ProfileStatProps {
  label: string;
  value: string;
}

export function ProfileStat({ label, value }: ProfileStatProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    flex: 1,
    gap: spacing.xs,
    minWidth: 96,
    padding: spacing.md
  },
  label: { color: colors.muted, fontSize: typography.small, fontWeight: "700" },
  value: { color: colors.fairway, fontSize: typography.title, fontWeight: "900" }
});
