import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, typography } from "@nobogey/ui";

interface ScreenProps extends PropsWithChildren {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function Screen({ action, children, subtitle, title }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.eyebrow}>NoBogey</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  eyebrow: {
    color: colors.fairway,
    fontSize: typography.small,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between"
  },
  safeArea: {
    backgroundColor: colors.canvas,
    flex: 1
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 23
  },
  title: {
    color: colors.ink,
    fontSize: typography.heading,
    fontWeight: "800",
    lineHeight: 34
  },
  titleGroup: {
    flex: 1,
    gap: spacing.xs
  }
});
