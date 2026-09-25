import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { TeeTimeSlot } from "@nobogey/contracts";
import { formatMoney } from "@nobogey/utils";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { getAvailableCaddies } from "../../../backend/caddies/caddies.service";
import { mobileDataService } from "../../../backend/mock.service";
import { backToPreviousPage } from "../../ui/navigation";
import { useMobileData } from "../data/useMobileData";
import { useAppSession } from "../session/AppSession";
import { clubTeeSheet } from "./clubTeeSheet";
import { CaddiePortrait, FindGameScreen, flowColors } from "./components/FindGameUI";
import { GameDropdown, type GameIcon } from "./components/game-dropdown";
import { changeGameDraft, gameDate, gameTime, golferCounts, parseGolferCount, slotFits, type GameDraft } from "./game-details-state";

type GameParams = { courseId?: string; partySize?: string; date?: string; teeTimeId?: string; time?: string; caddieId?: string };
type LoadResult<T> = { key: string; items: T[]; error?: string };

export function FindGameDetailsScreen({ initialReview = false }: { initialReview?: boolean }) {
  const params = useLocalSearchParams<GameParams>();
  const { courses, caddies, isLoading, refresh } = useMobileData();
  const { golferSignedIn } = useAppSession();
  const [draft, setDraft] = useState<GameDraft>(() => ({
    courseId: params.courseId, date: params.date || (params.time ? new Date(params.time).toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }) : undefined),
    partySize: parseGolferCount(params.partySize) ?? (params.teeTimeId ? 4 : undefined),
    teeTimeId: params.teeTimeId, caddieId: params.caddieId
  }));
  const [review, setReview] = useState(initialReview);
  const [expanded, setExpanded] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [retry, setRetry] = useState(0);
  const [teeResult, setTeeResult] = useState<LoadResult<TeeTimeSlot>>();
  const [caddieResult, setCaddieResult] = useState<LoadResult<string>>();
  const [dates] = useState(() => mobileDataService.listWeekDates());
  const course = courses.find((item) => item.id === draft.courseId);
  const teeKey = course && draft.date ? `${course.id}/${draft.date}/${retry}` : "";
  const teeReady = Boolean(teeKey && teeResult?.key === teeKey);
  const slots = teeReady ? teeResult!.items : [];
  const slot = slots.find((item) => item.id === draft.teeTimeId && slotFits(item, draft.partySize));
  const caddieKey = course && slot ? `${course.id}/${slot.startsAt}/${retry}` : "";
  const caddiesReady = Boolean(caddieKey && caddieResult?.key === caddieKey);
  const availableCaddies = caddiesReady ? caddies.filter((item) => caddieResult!.items.includes(item.id)) : [];
  const caddie = availableCaddies.find((item) => item.id === draft.caddieId);
  const complete = Boolean(!isLoading && course && slot && caddie && draft.partySize);
  const busy = isLoading || Boolean(teeKey && !teeReady) || Boolean(caddieKey && !caddiesReady);
  const requestParams = { courseId: draft.courseId, date: draft.date, partySize: draft.partySize?.toString(), teeTimeId: slot?.id, time: slot?.startsAt, caddieId: caddie?.id };

  useEffect(() => {
    if (!teeKey || !course || !draft.date) return;
    let active = true;
    void clubTeeSheet.getTeeTimes(course.id, draft.date).then((items) => {
      if (active) setTeeResult({ key: teeKey, items });
    }).catch(() => {
      if (active) setTeeResult({ key: teeKey, items: [], error: "We couldn’t load tee times. Please try again." });
    });
    return () => { active = false; };
  }, [course, draft.date, teeKey]);

  useEffect(() => {
    if (!caddieKey || !course || !slot) return;
    let active = true;
    void getAvailableCaddies(course.id, slot.startsAt).then((items) => {
      if (active) setCaddieResult({ key: caddieKey, items: items.map((item) => item.id) });
    }).catch(() => {
      if (active) setCaddieResult({ key: caddieKey, items: [], error: "We couldn’t load caddies. Please try again." });
    });
    return () => { active = false; };
  }, [caddieKey, course, slot]);

  const back = useCallback(() => {
    if (expanded) { setExpanded(undefined); return true; }
    if (review) { setReview(false); return true; }
    return false;
  }, [expanded, review]);
  useFocusEffect(useCallback(() => {
    if (Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", back);
    return () => subscription.remove();
  }, [back]));

  const select = (patch: Partial<GameDraft>) => {
    const next = changeGameDraft(draft, patch, slots);
    setNotice(draft.teeTimeId && !next.teeTimeId ? "Your game details changed. Please choose an available tee time and caddie." : draft.caddieId && !next.caddieId ? "Your tee time changed. Please choose an available caddie." : undefined);
    setDraft(next);
    setExpanded(undefined);
  };
  const toggle = (field: string) => setExpanded((current) => current === field ? undefined : field);
  const continueFlow = () => {
    if (!complete) return;
    if (!review) { setExpanded(undefined); setReview(true); return; }
    if (!golferSignedIn) {
      router.push({ pathname: "/sign-in", params: { ...requestParams, role: "golfer", returnTo: "/golfer/bookings/new" } });
      return;
    }
    router.push({ pathname: "/golfer/bookings/new/payment", params: requestParams });
  };
  const title = review ? "Review your game" : complete ? "You’re nearly set" : course ? "Pick your day and tee time" : "Let’s find your round";

  return <FindGameScreen key={review ? "review" : "details"} step={review ? 2 : 1} title={title}
    description={review ? "Please check your details before continuing." : complete ? "Review your selections below before continuing." : course ? "Choose your preferred date and time for a great round." : "Book a great game, meet great people, and enjoy the course."}
    actionLabel={review ? "Continue to confirmation" : "Review booking"} actionDisabled={!complete}
    onAction={continueFlow} onBack={() => { if (!back()) backToPreviousPage("/golfer/home"); }}>
    {review ? <>
      <View style={styles.summary}>
        <SummaryRow icon="golf" label="Golf course" value={course?.name || "Course unavailable"} />
        <SummaryRow icon="calendar-blank-outline" label="Date" value={draft.date ? gameDate(draft.date) : "Choose a date"} />
        <SummaryRow icon="clock-outline" label="Tee time" value={slot ? gameTime(slot.startsAt) : busy ? "Checking availability…" : "Choose an available tee time"} />
        <SummaryRow icon="account-group" label="Number of golfers" value={draft.partySize ? `${draft.partySize} ${draft.partySize === 1 ? "golfer" : "golfers"}` : "Choose your group size"} />
        <View style={[styles.summaryRow, styles.lastRow]}>{caddie ? <CaddiePortrait caddie={caddie} /> : <MaterialCommunityIcons color={flowColors.forest} name="account-outline" size={24} />}<View style={styles.copy}><Text style={styles.caption}>Preferred caddie</Text><Text selectable style={styles.value}>{caddie?.displayName || (busy ? "Checking availability…" : "Choose an available caddie")}</Text></View></View>
      </View>
      {caddie ? <View style={styles.fee}><MaterialCommunityIcons color={flowColors.forest} name="tag-outline" size={23} /><View style={styles.copy}><Text selectable style={styles.value}>Caddie fee — {formatMoney(caddie.rate.amountInCentavos, caddie.rate.currency)}</Text><Text style={styles.caption}>Course fees are not included.</Text></View></View> : null}
      {!complete ? <Text accessibilityLiveRegion="polite" style={styles.help}>{busy ? "Checking your booking details…" : "Some selections are no longer available. Edit your details to continue."}</Text> : null}
      <Pressable accessibilityRole="button" onPress={() => setReview(false)} style={styles.edit}><Text style={styles.editText}>Edit details</Text></Pressable>
      <Text style={styles.help}>Your preferred caddie is a request; the club makes the final assignment. No payment is collected on the next screen.</Text>
    </> : <View style={styles.form}>
      <GameDropdown label="Golf course" placeholder={isLoading ? "Loading courses…" : "Choose a golf course"} value={course?.name} icon="golf" disabled={isLoading || !courses.length} expanded={expanded === "course"} onToggle={() => toggle("course")} selectedId={draft.courseId} onSelect={(courseId) => select({ courseId })} options={courses.map((item) => ({ id: item.id, label: item.name }))} />
      {!isLoading && !courses.length ? <Feedback message="No courses are available right now." action="Refresh courses" onPress={refresh} /> : null}
      {!course ? <Text style={styles.help}>Choose your course to start planning your round.</Text> : !draft.date || !draft.partySize ? <Text style={styles.help}>Next, choose your date and group size.</Text> : null}
      <GameDropdown label="Number of golfers" placeholder="Choose your group size" value={draft.partySize ? `${draft.partySize} ${draft.partySize === 1 ? "golfer" : "golfers"}` : undefined} icon="account-group" disabled={!course} expanded={expanded === "golfers"} onToggle={() => toggle("golfers")} selectedId={draft.partySize?.toString()} onSelect={(value) => select({ partySize: Number(value) })} options={golferCounts.map((count) => ({ id: String(count), label: `${count} ${count === 1 ? "golfer" : "golfers"}` }))} />
      <GameDropdown label="Date" placeholder="Choose a date" value={draft.date ? gameDate(draft.date) : undefined} icon="calendar-blank-outline" disabled={!course} expanded={expanded === "date"} onToggle={() => toggle("date")} selectedId={draft.date} onSelect={(date) => select({ date })} options={dates.map((date) => ({ id: date, label: gameDate(date) }))} />
      <GameDropdown label="Tee time" placeholder={teeKey && !teeReady ? "Loading tee times…" : "Choose a tee time"} value={slot ? gameTime(slot.startsAt) : undefined} icon="clock-outline" disabled={!draft.partySize || !teeReady || !slots.some((item) => slotFits(item, draft.partySize))} expanded={expanded === "time"} onToggle={() => toggle("time")} selectedId={slot?.id} onSelect={(teeTimeId) => select({ teeTimeId })} options={slots.filter((item) => slotFits(item, draft.partySize)).map((item) => ({ id: item.id, label: gameTime(item.startsAt), detail: `${item.remainingPlayerCapacity} ${item.remainingPlayerCapacity === 1 ? "spot" : "spots"} available` }))} />
      {teeReady && teeResult?.error ? <Feedback message={teeResult.error} action="Try again" onPress={() => setRetry((value) => value + 1)} /> : teeReady && draft.partySize && !slots.some((item) => slotFits(item, draft.partySize)) ? <Feedback message="No tee times fit your group on this date." action="Try another date" onPress={() => setExpanded("date")} /> : null}
      {teeReady && teeResult?.error && !golferSignedIn ? <Feedback message="You may need to sign in to view the club’s tee times." action="Sign in to continue" onPress={() => router.push({ pathname: "/sign-in", params: { courseId: draft.courseId, date: draft.date, partySize: draft.partySize?.toString(), caddieId: draft.caddieId, role: "golfer", returnTo: "/golfer/find-game" } })} /> : null}
      {teeReady && draft.teeTimeId && !slot && slots.length ? <Text accessibilityLiveRegion="polite" style={styles.help}>Your previous tee time is no longer available. Please select another.</Text> : null}
      <GameDropdown label="Preferred caddie" placeholder={caddieKey && !caddiesReady ? "Loading caddies…" : "Choose a preferred caddie"} value={caddie ? `${caddie.displayName} · ${formatMoney(caddie.rate.amountInCentavos, caddie.rate.currency)}` : undefined} leading={caddie ? <CaddiePortrait caddie={caddie} /> : undefined} icon="account-outline" disabled={!slot || !caddiesReady || !availableCaddies.length || isLoading} expanded={expanded === "caddie"} onToggle={() => toggle("caddie")} selectedId={caddie?.id} onSelect={(caddieId) => select({ caddieId })} options={availableCaddies.map((item) => ({ id: item.id, label: item.displayName, detail: formatMoney(item.rate.amountInCentavos, item.rate.currency), leading: <CaddiePortrait caddie={item} /> }))} />
      {caddiesReady && caddieResult?.error ? <Feedback message={caddieResult.error} action="Try again" onPress={() => setRetry((value) => value + 1)} /> : caddiesReady && !isLoading && !availableCaddies.length ? <Feedback message="No caddies are available for this round." action="Choose another tee time" onPress={() => setExpanded("time")} /> : null}
      {caddiesReady && !isLoading && draft.caddieId && !caddie && availableCaddies.length ? <Text accessibilityLiveRegion="polite" style={styles.help}>Your previous caddie is unavailable. Please choose another.</Text> : null}
      {notice ? <Text accessibilityLiveRegion="polite" style={styles.help}>{notice}</Text> : null}
      {slot ? <Text style={styles.help}>One preferred caddie for this booking. Final assignment is subject to availability.</Text> : null}
    </View>}
  </FindGameScreen>;
}

function SummaryRow({ icon, label, value }: { icon: GameIcon; label: string; value: string }) {
  return <View style={styles.summaryRow}><MaterialCommunityIcons color={flowColors.forest} name={icon} size={24} /><View style={styles.copy}><Text style={styles.caption}>{label}</Text><Text selectable style={styles.value}>{value}</Text></View></View>;
}

function Feedback({ message, action, onPress }: { message: string; action: string; onPress: () => void }) {
  return <View style={styles.feedback}><Text accessibilityLiveRegion="polite" style={styles.help}>{message}</Text><Pressable accessibilityRole="button" onPress={onPress} style={styles.retry}><Text style={styles.editText}>{action}</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  form: { gap: 13 },
  help: { color: flowColors.muted, fontSize: 12, lineHeight: 18 },
  feedback: { backgroundColor: flowColors.sage, borderRadius: 10, paddingHorizontal: 12, paddingTop: 10 },
  retry: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  summary: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: flowColors.border, borderRadius: 12, paddingHorizontal: 15 },
  summaryRow: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F0F0EC" },
  lastRow: { borderBottomWidth: 0 },
  copy: { flex: 1, gap: 3 },
  caption: { color: flowColors.muted, fontSize: 12, lineHeight: 17 },
  value: { color: flowColors.ink, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  fee: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: flowColors.border, borderRadius: 10, flexDirection: "row", alignItems: "center", gap: 14, padding: 14 },
  edit: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  editText: { color: flowColors.forest, fontSize: 14, fontWeight: "700" }
});
