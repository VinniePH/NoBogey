import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { useAppSession } from "../session/AppSession";

type SettingsItem = {
  detail: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress?: () => void;
};

type SettingsRole = "golfer" | "caddie";

export function SettingsScreen({ role = "golfer" }: { role?: SettingsRole }) {
  const sections = getSections(role);
  const { signOut } = useAppSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logOut = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      router.replace({ pathname: "/sign-in", params: { role } });
    } finally {
      setIsLoggingOut(false);
    }
  };
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
    <ScrollView contentContainerStyle={styles.content} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={styles.frame}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Go back" accessibilityRole="button" hitSlop={10} onPress={() => router.back()} style={styles.backButton}><MaterialCommunityIcons color="#123F2B" name="arrow-left" size={25} /></Pressable>
        <View style={styles.headerCopy}><Text accessibilityRole="header" style={styles.title}>Settings</Text><Text style={styles.subtitle}>Manage your NoBogey account and preferences.</Text></View>
        <View style={styles.headerSpacer} />
      </View>

      {sections.map((section) => <SettingsSection items={section.items} key={section.title} title={section.title} />)}

      <Pressable accessibilityLabel="Log out" accessibilityRole="button" accessibilityState={{ busy: isLoggingOut, disabled: isLoggingOut }} disabled={isLoggingOut} onPress={() => void logOut()} style={({ pressed }) => [styles.logoutCard, pressed && styles.logoutPressed, isLoggingOut && styles.logoutDisabled]}><MaterialCommunityIcons color="#FF2028" name="logout-variant" size={25} /><Text style={styles.logoutText}>{isLoggingOut ? "Logging out…" : "Log out"}</Text><MaterialCommunityIcons color="#FF2028" name="chevron-right" size={24} /></Pressable>
    </ResponsiveContent></ScrollView>
  </SafeAreaView>;
}

function getSections(role: SettingsRole): { items: SettingsItem[]; title: string }[] {
  const profilePath = role === "golfer" ? "/golfer/profile" : "/caddie/profile";
  return [
    { title: "ACCOUNT", items: [{ icon: "account-circle-outline", label: "Account Information", detail: "Raf Vincent · rafvincent@gmail.com", onPress: () => router.push(profilePath) }, { icon: "calendar-check-outline", label: role === "golfer" ? "Booking Preferences" : "Caddie Preferences", detail: role === "golfer" ? "Preferred courses, language, group size" : "Home course, languages, availability" }] },
    { title: "PAYMENT", items: [role === "golfer" ? { icon: "credit-card-outline", label: "Payment Methods", detail: "GCash · Manage payment details" } : { icon: "bank-outline", label: "Payout Method", detail: "GCash · Manage how you receive earnings" }] },
    { title: "PREFERENCES", items: [{ icon: "bell-outline", label: "Notifications", detail: role === "golfer" ? "Tee-time alerts, messages, promotions" : "Match alerts, messages, promotions" }, { icon: "lock-outline", label: "Privacy & Security", detail: "Change password · Delete account" }] },
    { title: "SUPPORT", items: [{ icon: "help-circle-outline", label: "Help & Support", detail: "FAQs, contact support, report an issue" }, { icon: "file-document-outline", label: "Terms & Conditions", detail: "Terms of Service · Privacy Policy" }] }
  ];
}

function SettingsSection({ items, title }: { items: SettingsItem[]; title: string }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionCard}>{items.map((item, index) => <SettingsRow isLast={index === items.length - 1} item={item} key={item.label} />)}</View></View>;
}

function SettingsRow({ isLast, item }: { isLast: boolean; item: SettingsItem }) {
  return <Pressable accessibilityLabel={item.label} accessibilityRole="button" onPress={item.onPress} style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}>
    <MaterialCommunityIcons color="#123F2B" name={item.icon} size={31} />
    <View style={styles.rowCopy}><Text style={styles.rowLabel}>{item.label}</Text><Text style={styles.rowDetail}>{item.detail}</Text></View>
    <MaterialCommunityIcons color="#123F2B" name="chevron-right" size={26} />
  </Pressable>;
}

const styles = StyleSheet.create({
  backButton: { alignItems: "center", justifyContent: "center", minHeight: 44, minWidth: 44 },
  content: { gap: 19, padding: 19, paddingBottom: 29 },
  frame: { gap: 19 },
  header: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  headerCopy: { alignItems: "center", flex: 1, gap: 1 },
  headerSpacer: { minWidth: 44 },
  logoutCard: { alignItems: "center", backgroundColor: colors.surface, borderColor: "#D9D9D4", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 13, marginTop: 10, minHeight: 67, paddingHorizontal: 14 },
  logoutDisabled: { opacity: 0.65 },
  logoutPressed: { backgroundColor: "#FFF2F2" },
  logoutText: { color: "#FF2028", flex: 1, fontSize: 15, fontWeight: "700" },
  row: { alignItems: "center", flexDirection: "row", gap: 13, minHeight: 70, paddingHorizontal: 13, paddingVertical: 12 },
  rowCopy: { flex: 1, gap: 5 },
  rowDetail: { color: "#67726B", fontSize: 12, lineHeight: 15 },
  rowDivider: { borderBottomColor: "#C5C5BF", borderBottomWidth: StyleSheet.hairlineWidth },
  rowLabel: { color: "#101411", fontSize: 14, fontWeight: "700" },
  rowPressed: { backgroundColor: "#F2F5F0" },
  safeArea: { backgroundColor: "#FAF9F6", flex: 1 },
  section: { gap: 5 },
  sectionCard: { backgroundColor: colors.surface, borderColor: "#E3E2DD", borderCurve: "continuous", borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, boxShadow: "0 2px 2px rgba(23, 32, 27, 0.16)", overflow: "hidden" },
  sectionTitle: { color: "#123F2B", fontSize: 12, fontWeight: "800", letterSpacing: 0.3 },
  subtitle: { color: "#65706A", fontSize: 9 },
  title: { color: "#080A08", fontSize: 20, fontWeight: "800", letterSpacing: -0.3 }
});
