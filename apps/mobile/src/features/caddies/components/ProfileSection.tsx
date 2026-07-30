import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@nobogey/ui";

interface ProfileSectionProps extends PropsWithChildren {
  title: string;
}

export function ProfileSection({ children, title }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  title: { color: colors.ink, fontSize: typography.title, fontWeight: "800" }
});
