import type { PropsWithChildren } from "react";
import { StyleSheet, View } from "react-native";
import { AppText, Button } from "./primitives";
import { colors, spacing, typography } from "@nobogey/ui";

export function ImagePlaceholder({ label, style }: { label: string; style?: object }) {
  return (
    <View accessibilityLabel={`${label} image placeholder`} accessibilityRole="image" style={[styles.imagePlaceholder, style]}>
      <View style={styles.placeholderSun} />
      <View style={styles.placeholderHill} />
      <AppText selectable={false} style={styles.placeholderText}>{label}</AppText>
    </View>
  );
}

export function BookingStepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <View accessibilityLabel={`Booking step ${step} of 4`} style={styles.stepper}>
      <StepCircle number={1} active />
      <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
      <StepCircle number={2} active={step >= 2} />
      <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
      <StepCircle number={3} active={step >= 3} />
      <View style={[styles.stepLine, step >= 4 && styles.stepLineActive]} />
      <StepCircle number={4} active={step >= 4} />
    </View>
  );
}

function StepCircle({ active, number }: { active: boolean; number: 1 | 2 | 3 | 4 }) {
  return <View style={[styles.stepCircle, active ? styles.stepCircleActive : styles.stepCircleInactive]}><AppText selectable={false} style={styles.stepText}>{number}</AppText></View>;
}

export function ScreenSection({ children, title, action }: PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppText accessibilityRole="header" selectable={false} style={styles.sectionTitle}>{title}</AppText>
        {action}
      </View>
      {children}
    </View>
  );
}

export function PrimaryButton({ label, onPress, disabled = false }: { label: string; onPress?: () => void; disabled?: boolean }) {
  return <Button disabled={disabled} onPress={onPress}>{label}</Button>;
}

export function StickyActionBar({ children }: PropsWithChildren) {
  return <View style={styles.stickyAction}>{children}</View>;
}

const styles = StyleSheet.create({
  buttonDisabled: { backgroundColor: colors.line },
  imagePlaceholder: { alignItems: "center", backgroundColor: "#B4C4A5", justifyContent: "center", overflow: "hidden" },
  placeholderHill: { backgroundColor: "#65875C", borderRadius: 999, bottom: -36, height: 96, left: -16, position: "absolute", right: -16 },
  placeholderSun: { backgroundColor: "#F4EDC8", borderRadius: 999, height: 58, opacity: 0.9, position: "absolute", right: 20, top: 18, width: 58 },
  placeholderText: { color: colors.surface, fontSize: typography.small, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  section: { gap: spacing.md },
  sectionHeader: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { color: "#000000", fontSize: typography.heading, fontWeight: "800" },
  stepCircle: { alignItems: "center", borderRadius: 999, height: 52, justifyContent: "center", width: 52 },
  stepCircleActive: { backgroundColor: colors.fairwayDark },
  stepCircleInactive: { backgroundColor: "#68675F" },
  stepLine: { backgroundColor: "#68675F", flex: 1, height: 1 },
  stepLineActive: { backgroundColor: colors.fairwayDark },
  stepper: { alignItems: "center", flexDirection: "row", marginHorizontal: spacing.xxl, paddingVertical: spacing.xxl },
  stepText: { color: colors.surface, fontSize: typography.title },
  stickyAction: { backgroundColor: colors.canvas, borderTopColor: colors.line, borderTopWidth: StyleSheet.hairlineWidth, padding: spacing.lg }
});
