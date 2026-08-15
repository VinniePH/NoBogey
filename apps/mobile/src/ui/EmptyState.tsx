import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, typography } from "@nobogey/ui";

type EmptyStateProps = {
  description: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  minHeight?: number;
  title: string;
};

export function EmptyState({ description, icon = "database-off-outline", minHeight, title }: EmptyStateProps) {
  return (
    <View style={[styles.container, minHeight ? { minHeight } : undefined]}>
      <MaterialCommunityIcons color={colors.fairwayDark} name={icon} size={30} />
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    textAlign: "center"
  },
  title: {
    color: colors.fairwayDark,
    fontSize: typography.body,
    fontWeight: "800",
    textAlign: "center"
  }
});
