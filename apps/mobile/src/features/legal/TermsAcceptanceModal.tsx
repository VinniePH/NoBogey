import { useEffect, useState } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@nobogey/ui";
import { Button } from "../../ui/primitives";

type TermsAcceptanceModalProps = {
  mode?: "acceptance" | "viewer";
  onAccept: () => void;
  onDecline: () => void;
  visible: boolean;
};

export const termsVersion = "2026-08-18";
const legalBaseUrl = (process.env.EXPO_PUBLIC_APP_URL?.trim() || "https://nobogeyofficial.com").replace(/\/$/, "");

export function TermsAcceptanceModal({ mode = "acceptance", onAccept, onDecline, visible }: TermsAcceptanceModalProps) {
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
          <Text selectable style={styles.subtitle}>Effective August 18, 2026</Text>
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
            <Text selectable style={styles.intro}>These Terms apply to every NoBogey user, including golfers and caddies. By creating an account or using the App, you agree to them.</Text>
            <TermSection title="1. Accounts and eligibility">You must be at least 18 to create an account, or use the App under a parent or guardian’s supervision. Keep your details accurate and credentials secure. Caddies must complete their affiliated course’s onboarding and verification before accepting assignments.</TermSection>
            <TermSection title="2. Bookings, matching, and payments">Tee times are subject to each course’s availability and policies. Caddie matching is a convenience feature and does not guarantee availability, compatibility, or performance. Cancellations within 12 hours may incur the fee shown in the booking confirmation. Payments may use GCash or another authorized provider and are subject to that provider’s terms; refunds follow the applicable cancellation policy.</TermSection>
            <TermSection title="3. Respectful use">Do not provide false information, break the law, harass or discriminate against others, bypass NoBogey systems, or interfere with the App’s security. NoBogey may suspend or end access for violations, harmful conduct, fraud, or course-reported misconduct.</TermSection>
            <TermSection title="4. Risk and responsibility">Golf involves risks, including injury, property damage, and outdoor conditions, which you accept when using the App. NoBogey is a technology platform: it does not operate golf courses or employ caddies, and is not responsible for course conditions or a golfer’s or caddie’s conduct. To the extent allowed by law, NoBogey’s liability is limited to the lower of the net platform fees for the affected booking or fees paid in the previous three months.</TermSection>
            <TermSection title="5. Privacy and intellectual property">We process personal data under the Philippine Data Privacy Act of 2012 and the NoBogey Privacy Policy. NoBogey’s content, trademarks, logos, and software belong to NoBogey or its licensors and may not be copied, modified, distributed, or reverse-engineered without written consent.</TermSection>
            <TermSection title="6. Changes, law, and contact">We may update these Terms and will communicate material changes through the App; continued use means you accept the update. Philippine law applies, and unresolved disputes may be submitted to the appropriate courts of Metro Manila. For questions or account-deletion requests, contact nobogeyofficial@gmail.com.</TermSection>
          </ScrollView>
          <View style={styles.disclosureLinks}>
            <Text selectable style={styles.disclosureLabel}>Read the full policies</Text>
            <View style={styles.linkRow}>
              <LegalLink label="Terms & Conditions" url={`${legalBaseUrl}/terms/`} />
              <LegalLink label="Privacy Policy" url={`${legalBaseUrl}/privacy/`} />
            </View>
          </View>
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

function LegalLink({ label, url }: { label: string; url: string }) {
  return <Pressable accessibilityHint="Opens in your browser" accessibilityLabel={`Open full ${label}`} accessibilityRole="link" onPress={() => void Linking.openURL(url)} style={({ pressed }) => [styles.legalLink, pressed && styles.legalLinkPressed]}><Text selectable style={styles.legalLinkText}>{label}</Text></Pressable>;
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
  disclosureLabel: { color: colors.textMuted, fontSize: 12, fontWeight: "700" },
  disclosureLinks: { gap: 6 },
  intro: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  legalLink: { minHeight: 30, paddingVertical: 4 },
  legalLinkPressed: { opacity: 0.65 },
  legalLinkText: { color: colors.primary, fontSize: 13, fontWeight: "800", textDecorationLine: "underline" },
  linkRow: { columnGap: spacing.lg, flexDirection: "row", flexWrap: "wrap", rowGap: spacing.xs },
  readHint: { color: colors.textMuted, fontSize: 12, fontWeight: "700", textAlign: "center" },
  sheet: { backgroundColor: colors.canvas, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, gap: spacing.md, maxHeight: "92%", padding: spacing.lg, paddingBottom: spacing.xl },
  subtitle: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  termBody: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  termSection: { gap: 4 },
  terms: { gap: spacing.lg, paddingBottom: spacing.md },
  termsScroll: { flexGrow: 0, maxHeight: 310 },
  termTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  title: { color: colors.text, fontSize: 25, fontWeight: "900", letterSpacing: -0.4 }
});
