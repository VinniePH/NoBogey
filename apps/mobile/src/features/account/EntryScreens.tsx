import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import NoBogeyLogo from "../../../../../assets/logo/NoBogey-Logo.png";
import { Button } from "../../ui/primitives";
import { backToPreviousPage } from "../../ui/navigation";
import { TermsAcceptanceModal } from "../legal/TermsAcceptanceModal";
import { useAppSession, type AppRole } from "../session/AppSession";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { getSplashLayoutMetrics } from "./splash-layout";

type Mode = "login" | "register";

export function SplashScreen() {
  const { height, width } = useWindowDimensions();
  const layout = getSplashLayoutMetrics({ height, width });
  const [logoFailed, setLogoFailed] = useState(false);
  const { initialRole, isHydrated } = useAppSession();
  const start = () => {
    if (!isHydrated) return;
    if (initialRole === "golfer") {
      router.replace("/golfer/home");
      return;
    }
    if (initialRole === "caddie") {
      router.replace("/caddie/onboarding");
      return;
    }
    router.replace("/onboarding");
  };

  return <SafeAreaView edges={["top", "bottom"]} style={styles.splash}><ScrollView contentContainerStyle={styles.splashScroll} contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false}><ResponsiveContent style={[styles.splashContent, { gap: layout.contentGap, minHeight: Math.max(height - 48, 520), padding: layout.contentPadding, paddingBottom: layout.paddingBottom }]}><View style={[styles.logoFrame, { height: layout.logoSize, marginTop: layout.logoTopSpacing, width: layout.logoSize }]}>{logoFailed ? <Text accessibilityRole="image" style={styles.logoFallback}>NoBogey</Text> : <Image accessibilityLabel="NoBogey logo" onError={() => setLogoFailed(true)} resizeMode="contain" source={NoBogeyLogo} style={styles.logo} />}</View><View style={[styles.splashCopy, { gap: layout.copyGap }]}><Text accessibilityRole="header" style={[styles.splashTitle, { fontSize: layout.titleFontSize, lineHeight: layout.titleLineHeight }]}>Your best round starts with the right caddie.</Text><Text style={styles.splashText}>Tee times and trusted local caddies, in one place.</Text></View><Button accessibilityLabel="Get started" disabled={!isHydrated} onPress={start}>Get Started</Button></ResponsiveContent></ScrollView></SafeAreaView>;
}

export function OnboardingScreen() {
  const { selectInitialRole } = useAppSession();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const choose = (role: AppRole) => {
    setSelectedRole(role);
  };
  const startRegistration = () => {
    if (selectedRole === "golfer") {
      router.replace({ pathname: "/sign-in", params: { mode: "register", role: "golfer" } });
      return;
    }
    selectInitialRole("caddie");
    router.replace("/caddie/onboarding");
  };
  const roleName = selectedRole === "caddie" ? "caddie" : "golfer";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.authSafe}><ScrollView contentContainerStyle={[styles.authContent, styles.onboardingContent]} contentInsetAdjustmentBehavior="automatic"><Image accessibilityLabel="NoBogey logo" resizeMode="contain" source={NoBogeyLogo} style={styles.authLogo} />{selectedRole ? <><View style={styles.authHeader}><Text accessibilityRole="header" style={styles.authTitle}>Continue as a {roleName}?</Text><Text style={styles.authSubtitle}>Are you new to NoBogey, or do you already have an account?</Text></View><Button accessibilityLabel={`I’m new to NoBogey as a ${roleName}`} onPress={startRegistration}>I’m new here</Button><Pressable accessibilityLabel={`I already have a ${roleName} account`} accessibilityRole="button" onPress={() => router.replace({ pathname: "/sign-in", params: { role: selectedRole } })} style={styles.existingAccountButton}><Text style={styles.existingAccountText}>I already have an account</Text></Pressable><Pressable accessibilityLabel="Choose a different role" accessibilityRole="button" onPress={() => setSelectedRole(null)}><Text style={styles.secondaryLink}>Choose a different role</Text></Pressable></> : <><View style={styles.authHeader}><Text accessibilityRole="header" style={styles.authTitle}>How do you play?</Text><Text style={styles.authSubtitle}>Choose the role you use most. It stays selected on this phone.</Text></View><RoleChoice description="Browse tee times and caddies before creating an account." icon="⛳" label="I’m a golfer" onPress={() => choose("golfer")} /><RoleChoice description="Create a professional profile for verification by your home club." icon="🏌️" label="I’m a caddie" onPress={() => choose("caddie")} /></>}<Text style={styles.placeholderNote}>Golfers can add a caddie identity later from Profile.</Text></ScrollView></SafeAreaView>;
}

function _LegacyAuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode; role?: AppRole; returnTo?: string; caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === "register" ? "register" : "login");
  const [role] = useState<AppRole>(params.role === "caddie" ? "caddie" : "golfer");
  const [termsVisible, setTermsVisible] = useState(false);
  const { selectInitialRole, signInAs } = useAppSession();
  const completeSignIn = () => {
    selectInitialRole(role);
    signInAs(role);
    if (role === "caddie") {
      // This device-local role choice is not authentication or authorization.
      router.replace("/caddie/dashboard");
      return;
    }
    if (params.returnTo === "/golfer/caddies") {
      router.replace({ pathname: "/golfer/caddies", params: { caddieId: params.caddieId, courseId: params.courseId, teeTimeId: params.teeTimeId, time: params.time } });
      return;
    }
    router.replace("/golfer/home");
  };
  const submit = () => {
    if (role === "golfer" && mode === "register") {
      setTermsVisible(true);
      return;
    }
    completeSignIn();
  };
  const submitLabel = mode === "login" ? "Log in" : `Create ${role} account`;
  const caddieRegistration = role === "caddie" && mode === "register";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.authSafe}><ScrollView contentContainerStyle={styles.authContent} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled"><View style={styles.authHeader}><Image accessibilityLabel="NoBogey logo" resizeMode="contain" source={NoBogeyLogo} style={styles.authLogo} /><Text accessibilityRole="header" style={styles.authTitle}>{mode === "login" ? "Welcome back." : "Join the fairway."}</Text><Text style={styles.authSubtitle}>{role === "caddie" ? "Create your professional profile, then submit it to your home club for verification." : "Create an account only when you’re ready to pay."}</Text></View><View style={styles.modeTabs}><Tab active={mode === "login"} label="Log in" onPress={() => setMode("login")} /><Tab active={mode === "register"} label="Create account" onPress={() => { if (role === "caddie") { selectInitialRole("caddie"); router.replace("/caddie/onboarding"); return; } setMode("register"); }} /></View>{caddieRegistration ? <View style={styles.roleGroup}><Text style={styles.fieldLabel}>Caddie registration is part of your professional profile</Text><Text style={styles.placeholderNote}>Continue to enter your account details, select your home club, and submit your profile for verification.</Text><Button accessibilityLabel="Start caddie onboarding" onPress={() => { selectInitialRole("caddie"); router.replace("/caddie/onboarding"); }}>Start caddie onboarding</Button></View> : <View style={styles.form}>{mode === "register" && <Field label="Full name" placeholder="Enter your full name" />}<Field autoCapitalize="none" keyboardType="email-address" label="Email address" placeholder="Enter your email address" /><Field label="Password" placeholder="Enter your password" secureTextEntry /><Button accessibilityLabel={submitLabel} onPress={submit}>{submitLabel}</Button></View>}<Pressable accessibilityLabel="Return to role selection" accessibilityRole="button" onPress={() => backToPreviousPage("/onboarding")}><Text style={styles.secondaryLink}>Back to role selection</Text></Pressable></ScrollView><TermsAcceptanceModal acceptanceStorageNote="This mock sign-in does not create a production account or legal acceptance record." onAccept={() => { setTermsVisible(false); completeSignIn(); }} onDecline={() => setTermsVisible(false)} visible={termsVisible} /></SafeAreaView>;
}

function Field({ label, ...inputProps }: { label: string } & React.ComponentProps<typeof TextInput>) { return <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor="#788179" style={styles.input} {...inputProps} /></View>; }
function Tab({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) { return <Pressable accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={onPress} style={[styles.modeTab, active && styles.modeTabActive]}><Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>{label}</Text></Pressable>; }
function RoleChoice({ description, icon, label, onPress }: { description: string; icon: string; label: string; onPress: () => void }) { return <Pressable accessibilityLabel={label} accessibilityRole="button" onPress={onPress} style={styles.roleTab}><Text style={styles.roleIcon}>{icon}</Text><View style={styles.roleCopy}><Text style={styles.roleTitle}>{label}</Text><Text style={styles.roleDescription}>{description}</Text></View><Text style={styles.arrow}>›</Text></Pressable>; }

const styles = StyleSheet.create({
  existingAccountButton: { alignItems: "center", borderColor: colors.primary, borderCurve: "continuous", borderRadius: 12, borderWidth: 1, justifyContent: "center", minHeight: 52, paddingHorizontal: 18 },
  existingAccountText: { color: colors.primary, fontSize: 16, fontWeight: "800" },
  onboardingContent: { flexGrow: 1, justifyContent: "center" },
  arrow: { color: colors.primary, fontSize: 30 }, authContent: { gap: spacing.xl, padding: spacing.xl, paddingTop: 48 }, authHeader: { gap: spacing.sm }, authLogo: { height: 48, width: 48 }, authSafe: { backgroundColor: "#FAF9F6", flex: 1 }, authSubtitle: { color: "#617067", fontSize: 16, lineHeight: 23 }, authTitle: { color: "#143B2A", fontSize: 34, fontWeight: "900", letterSpacing: -1 }, field: { gap: 7 }, fieldLabel: { color: "#416052", fontSize: 13, fontWeight: "800" }, form: { gap: spacing.lg }, input: { backgroundColor: "#FFFFFF", borderColor: "#CBD4CC", borderCurve: "continuous", borderRadius: 12, borderWidth: 1, color: "#16231C", fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, logo: { height: "100%", width: "100%" }, logoFallback: { color: colors.surface, fontSize: 24, fontStyle: "italic", fontWeight: "900" }, logoFrame: { alignItems: "center", alignSelf: "center", justifyContent: "center", marginBottom: "auto" }, modeTab: { alignItems: "center", borderRadius: 10, flex: 1, justifyContent: "center", minHeight: 44 }, modeTabActive: { backgroundColor: "#FFFFFF" }, modeTabText: { color: "#68756C", fontSize: 15, fontWeight: "700" }, modeTabTextActive: { color: "#174B32" }, modeTabs: { backgroundColor: "#E4EAE4", borderRadius: 12, flexDirection: "row", padding: 4 }, placeholderNote: { color: "#6A706B", fontSize: 12, lineHeight: 18, textAlign: "center" }, roleCopy: { flex: 1, gap: 3 }, roleDescription: { color: "#647067", fontSize: 13, lineHeight: 18 }, roleGroup: { gap: spacing.sm }, roleIcon: { fontSize: 25 }, roleTab: { alignItems: "center", backgroundColor: "#FFFFFF", borderColor: "#CBD4CC", borderCurve: "continuous", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 12, padding: 16 }, roleTitle: { color: "#173D2C", fontSize: 17, fontWeight: "800" }, secondaryLink: { color: "#1C5E3E", fontSize: 15, fontWeight: "800", textAlign: "center" }, splash: { backgroundColor: "#174B32", flex: 1 }, splashContent: { flex: 1, gap: 30, justifyContent: "flex-end" }, splashCopy: { gap: 12 }, splashScroll: { flexGrow: 1 }, splashText: { color: "#DCE9DD", fontSize: 16, lineHeight: 23 }, splashTitle: { color: "#FFFFFF", fontSize: 39, fontWeight: "900", letterSpacing: -1.4, lineHeight: 44 }
});

export { AuthScreen } from './AuthScreen';
