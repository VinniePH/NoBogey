import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@nobogey/ui";
import { Button } from "../../ui/primitives";

type TermsAcceptanceModalProps = {
  acceptanceStorageNote: string;
  mode?: "acceptance" | "viewer";
  onAccept: () => void;
  onDecline: () => void;
  visible: boolean;
};

export const termsVersion = "2026-08-14";

export function TermsAcceptanceModal({ acceptanceStorageNote, mode = "acceptance", onAccept, onDecline, visible }: TermsAcceptanceModalProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReachedEnd, setHasReachedEnd] = useState(false);

  useEffect(() => {
    if (visible) {
      setHasReadTerms(false);
      setHasReachedEnd(false);
    }
  }, [visible]);

  return (
    <Modal animationType="slide" onRequestClose={onDecline} presentationStyle="pageSheet" transparent visible={visible}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <Text accessibilityRole="header" selectable style={styles.title}>Terms & Conditions</Text>
          <Text selectable style={styles.subtitle}>Please review the terms before creating your NoBogey account.</Text>
          <ScrollView
            contentContainerStyle={styles.terms}
            onScroll={({ nativeEvent }) => {
              const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
              if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 16) setHasReachedEnd(true);
            }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator
            style={styles.termsScroll}
          >
            <TermSection title="Using NoBogey">NoBogey helps golfers discover tee times and caddies. Caddie profiles remain unverified until their selected home club completes its review.</TermSection>
            <TermSection title="Your account">Keep your account details accurate and protect your sign-in information. You are responsible for activity carried out through your account.</TermSection>
            <TermSection title="Bookings and payments">Booking availability, prices, cancellation rules, and payment requirements are shown before a booking is confirmed. A caddie listing does not guarantee availability.</TermSection>
            <TermSection title="Respectful use">Use the service lawfully and respectfully. Access may be restricted where use harms golfers, caddies, clubs, or the service.</TermSection>
            <TermSection title="Privacy">NoBogey uses account, booking, and profile information to provide the service. The final Privacy Policy will describe production data practices and contact details.</TermSection>
            <Text selectable style={styles.version}>Terms version {termsVersion}. {acceptanceStorageNote}</Text>
          </ScrollView>
          {mode === "acceptance" ? <>
            {!hasReachedEnd ? <Text accessibilityLiveRegion="polite" selectable style={styles.readHint}>Scroll to the end to enable acknowledgement.</Text> : null}
            <Pressable accessibilityLabel="I have read and agree to the Terms and Conditions" accessibilityRole="checkbox" accessibilityState={{ checked: hasReadTerms, disabled: !hasReachedEnd }} disabled={!hasReachedEnd} onPress={() => setHasReadTerms((current) => !current)} style={[styles.checkboxRow, !hasReachedEnd && styles.checkboxDisabled]}>
              <View style={[styles.checkbox, hasReadTerms && styles.checkboxChecked]}>{hasReadTerms ? <Text selectable={false} style={styles.checkmark}>✓</Text> : null}</View>
              <Text selectable style={styles.checkboxText}>I have read and agree to the Terms & Conditions and Privacy Policy.</Text>
            </Pressable>
            <View style={styles.actions}>
              <View style={styles.action}><Button accessibilityLabel="Decline terms and conditions" onPress={onDecline} variant="secondary">Decline</Button></View>
              <View style={styles.action}><Button accessibilityLabel="Accept terms and conditions" disabled={!hasReadTerms} onPress={onAccept}>Accept & Continue</Button></View>
            </View>
          </> : <Button accessibilityLabel="Close terms and conditions" onPress={onDecline}>Close</Button>}
        </View>
      </View>
    </Modal>
  );
}

function TermSection({ children, title }: { children: string; title: string }) {
  return <View style={styles.termSection}><Text selectable style={styles.termTitle}>{title}</Text><Text selectable style={styles.termBody}>{children}</Text></View>;
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: "row", gap: spacing.sm },
  backdrop: { backgroundColor: "rgba(8, 20, 12, 0.42)", flex: 1, justifyContent: "flex-end" },
  checkbox: { alignItems: "center", borderColor: colors.border, borderCurve: "continuous", borderRadius: 6, borderWidth: 2, height: 24, justifyContent: "center", width: 24 },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxDisabled: { opacity: 0.5 },
  checkboxRow: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm, paddingVertical: spacing.sm },
  checkboxText: { color: colors.text, flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 19 },
  checkmark: { color: colors.onPrimary, fontSize: 16, fontWeight: "900" },
  readHint: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textAlign: "center" },
  sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, gap: spacing.md, maxHeight: "92%", padding: spacing.lg, paddingBottom: spacing.xl },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  termBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  termSection: { gap: 4 },
  terms: { gap: spacing.lg, paddingBottom: spacing.md },
  termsScroll: { flexGrow: 0, maxHeight: 310 },
  termTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  title: { color: colors.text, fontSize: 25, fontWeight: "900", letterSpacing: -0.4 },
  version: { color: colors.textMuted, fontSize: 12, fontStyle: "italic", lineHeight: 18 }
});
