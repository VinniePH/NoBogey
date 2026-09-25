import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@nobogey/ui';

import { signIn, signUp } from '../../../backend/auth/auth.service';
import { completeMobileCaptcha } from '../../../backend/auth/captcha';
import { Button } from '../../ui/primitives';
import { TermsAcceptanceModal } from '../legal/TermsAcceptanceModal';
import { useAppSession, type AppRole } from '../session/AppSession';

type Mode = 'login' | 'register';

export function AuthScreen() {
  const params = useLocalSearchParams<{ mode?: Mode; role?: AppRole; returnTo?: string; caddieId?: string; courseId?: string; teeTimeId?: string; time?: string; date?: string; partySize?: string }>();
  const [mode, setMode] = useState<Mode>(params.mode === 'register' ? 'register' : 'login');
  const role: AppRole = params.role === 'caddie' ? 'caddie' : 'golfer';
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [message, setMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const [termsVisible, setTermsVisible] = useState(false);
  const { selectInitialRole, signInAs } = useAppSession();

  const finish = () => {
    selectInitialRole(role);
    signInAs(role);
    if (role === 'caddie') return router.replace('/caddie/dashboard');
    if (params.returnTo === '/golfer/bookings/new') return router.replace({ pathname: '/golfer/bookings/new', params });
    if (params.returnTo === '/golfer/find-game') return router.replace({ pathname: '/golfer/find-game', params });
    if (params.returnTo === '/golfer/caddies') return router.replace({ pathname: '/golfer/caddies', params });
    router.replace('/golfer/home');
  };

  const authenticate = async () => {
    setSubmitting(true);
    setMessage(undefined);
    try {
      setMessage('Complete the security check in your browser, then return to NoBogey.');
      await completeMobileCaptcha();
      setMessage(undefined);
      if (mode === 'register') {
        const username = displayName.replace(/[^A-Za-z0-9_]/g, '').slice(0, 32);
        const result = await signUp({ email, password, displayName, role, ...(username.length >= 3 ? { username } : {}) });
        if (result.needsEmailConfirmation) {
          setMessage('Check your email to confirm your account, then return here and log in.');
          setMode('login');
          return;
        }
      } else {
        const session = await signIn({ email, password });
        if (!session.roles.includes(role) && !session.roles.includes('super_admin')) throw new Error(`This account is not registered as a ${role}.`);
      }
      finish();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to authenticate.');
    } finally {
      setSubmitting(false);
    }
  };

  const submit = () => mode === 'register' ? setTermsVisible(true) : void authenticate();

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><View style={styles.header}><Text accessibilityRole="header" style={styles.title}>{mode === 'login' ? 'Welcome back.' : 'Join NoBogey.'}</Text><Text style={styles.subtitle}>{mode === 'login' ? `Log in to your ${role} account.` : `Create your ${role} account. Email confirmation is required.`}</Text></View><View style={styles.form}>{mode === 'register' ? <Field label="Full name" onChangeText={setDisplayName} value={displayName} /> : null}<Field autoCapitalize="none" keyboardType="email-address" label="Email address" onChangeText={setEmail} value={email} /><PasswordField onChangeText={setPassword} onToggleVisibility={() => setPasswordVisible((visible) => !visible)} value={password} visible={passwordVisible} />{mode === 'login' ? <Pressable accessibilityLabel="Forgot password" accessibilityRole="link" onPress={() => router.push({ pathname: '/reset-password', params: { email, role } })} style={styles.forgotPassword}><Text style={styles.forgotPasswordText}>Forgot password?</Text></Pressable> : null}{message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}<Button disabled={submitting || !email || !password || (mode === 'register' && !displayName)} onPress={submit}>{submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</Button></View></ScrollView><TermsAcceptanceModal onAccept={() => { setTermsVisible(false); void authenticate(); }} onDecline={() => setTermsVisible(false)} visible={termsVisible} /></SafeAreaView>;
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} placeholder={`Enter ${label.toLowerCase()}`} placeholderTextColor={colors.textMuted} style={styles.input} {...props} /></View>;
}

function PasswordField({ onToggleVisibility, visible, ...props }: { onToggleVisibility: () => void; visible: boolean } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>Password</Text><View style={styles.passwordInput}><TextInput accessibilityLabel="Password" autoCapitalize="none" placeholder="Enter password" placeholderTextColor={colors.textMuted} secureTextEntry={!visible} style={styles.passwordTextInput} {...props} /><Pressable accessibilityLabel={visible ? 'Hide password' : 'Show password'} accessibilityRole="button" hitSlop={8} onPress={onToggleVisibility} style={styles.visibilityButton}><MaterialCommunityIcons color={colors.primary} name={visible ? 'eye-off-outline' : 'eye-outline'} size={22} /></Pressable></View></View>;
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs }, forgotPassword: { alignSelf: 'flex-end', marginTop: -spacing.sm }, forgotPasswordText: { color: colors.primary, fontSize: 14, fontWeight: '800' }, form: { gap: spacing.lg }, header: { gap: spacing.sm }, input: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, color: colors.text, fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, label: { color: colors.fairwayDark, fontSize: 13, fontWeight: '800' }, message: { color: colors.fairwayDark, fontSize: 14, lineHeight: 20 }, page: { flexGrow: 1, gap: spacing.xl, justifyContent: 'center', padding: spacing.xl }, passwordInput: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flexDirection: 'row', minHeight: 52 }, passwordTextInput: { color: colors.text, flex: 1, fontSize: 16, minHeight: 52, paddingHorizontal: 14 }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 }, title: { color: colors.fairwayDark, fontSize: 34, fontWeight: '900' }, visibilityButton: { alignItems: 'center', alignSelf: 'stretch', justifyContent: 'center', minWidth: 52 },
});
