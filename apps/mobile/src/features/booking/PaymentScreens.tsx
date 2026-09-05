import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '@nobogey/ui';

import { createBooking } from '../../../backend/bookings/bookings.service';
import { EmptyState } from '../../ui/EmptyState';
import { backToPreviousPage } from '../../ui/navigation';
import { PrimaryButton, StickyActionBar } from '../../ui/booking-design';
import { useMobileData } from '../data/useMobileData';

export function PaymentScreen() {
  const { caddies } = useMobileData();
  const { caddieId, courseId, teeTimeId, time } = useLocalSearchParams<{ caddieId?: string; courseId?: string; teeTimeId?: string; time?: string }>();
  const caddie = caddies.find((item) => item.id === caddieId);
  const [idempotencyKey] = useState(() => `mobile-${teeTimeId}-${caddieId}-${Date.now()}`);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  if (!caddie || !courseId || !teeTimeId) return <Unavailable />;

  const confirm = async () => {
    if (!time) return setError('The selected tee time is missing.');
    setSubmitting(true); setError(undefined);
    try {
      const startsAt = new Date(time);
      const booking = await createBooking({ caddieId: caddie.id, courseId, teeTimeId, startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + 4 * 60 * 60 * 1000).toISOString(), partySize: 4, idempotencyKey });
      router.replace({ pathname: '/golfer/bookings/confirmation', params: { bookingId: booking.id, caddieId, courseId, teeTimeId, time } });
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to create booking.'); }
    finally { setSubmitting(false); }
  };

  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><ScrollView contentContainerStyle={styles.page}><Text accessibilityRole="header" style={styles.title}>Confirm request</Text><Text style={styles.subtitle}>No payment is collected in Phase 1. This creates a live booking request and notifies both golfer and caddie.</Text><View style={styles.card}><Text style={styles.name}>{caddie.displayName}</Text><Text style={styles.meta}>Preferred-caddie request · PHP {(caddie.rate.amountInCentavos / 100).toLocaleString('en-PH')}</Text></View>{error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}</ScrollView><StickyActionBar><PrimaryButton disabled={submitting} label={submitting ? 'Creating booking…' : 'Confirm booking'} onPress={() => void confirm()} /></StickyActionBar></SafeAreaView>;
}

export function ReceiptScreen() { return <Unavailable />; }
function Unavailable() { return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}><View style={styles.unavailable}><EmptyState description="Booking details are unavailable." icon="calendar-remove-outline" minHeight={500} title="Booking unavailable" /><PrimaryButton label="Back to bookings" onPress={() => backToPreviousPage('/golfer/bookings')} /></View></SafeAreaView>; }
const styles = StyleSheet.create({ card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.xl }, error: { color: '#A52A2A', fontSize: typography.small }, meta: { color: colors.textMuted, fontSize: typography.body }, name: { color: colors.fairwayDark, fontSize: typography.title, fontWeight: '800' }, page: { gap: spacing.lg, padding: spacing.xl, paddingBottom: 120 }, safe: { backgroundColor: colors.canvas, flex: 1 }, subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 22 }, title: { color: colors.text, fontSize: typography.heading, fontWeight: '900' }, unavailable: { flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xl } });
