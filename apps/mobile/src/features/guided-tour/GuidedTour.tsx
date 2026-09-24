import type { PropsWithChildren, RefObject } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@nobogey/ui";
import { loadPreferences, savePreferences } from "../../../backend/users/users.service";

export type GuidedTourRole = "golfer" | "caddie";
type Rect = { height: number; width: number; x: number; y: number };
type TourStep = { body: string; target: string; title: string };
type Completion = Partial<Record<GuidedTourRole, boolean>>;

const tours: Record<GuidedTourRole, TourStep[]> = {
  golfer: [
    { target: "golfer-home", title: "Welcome to NoBogey", body: "Your home for finding a great round and a professional caddie." },
    { target: "golfer-nav-home", title: "Home", body: "Return here whenever you want to plan a round." },
    { target: "golfer-nav-bookings", title: "Bookings", body: "Requested and confirmed rounds appear here." },
    { target: "golfer-nav-find-game", title: "Find a Game", body: "Choose a course, tee time, and caddie; then confirm and pay when payment becomes available." },
    { target: "golfer-nav-caddies", title: "Caddies", body: "Browse verified caddies, their home courses, and specialties." },
    { target: "golfer-nav-profile", title: "Profile", body: "Manage your account details and preferences here." }
  ],
  caddie: [
    { target: "caddie-dashboard", title: "Your dashboard", body: "Manage availability and your upcoming work from here." },
    { target: "caddie-tab-dashboard", title: "Dashboard", body: "See your next assignment and the actions you use most." },
    { target: "caddie-tab-schedule", title: "Schedule", body: "Set the times you are available to caddie." },
    { target: "caddie-tab-portfolio", title: "Portfolio", body: "Keep your professional profile, credentials, and specialties current." },
    { target: "caddie-upcoming-assignments", title: "Assignments", body: "Review upcoming assignments and respond to new requests from your schedule." }
  ]
};
// Keep the walkthrough visible whenever its role's home screen opens during the demo.
const alwaysReplayForDemo = true;

type Value = { activeTarget: string | undefined; completed: (role: GuidedTourRole) => boolean; isReady: boolean; refreshTarget: () => void; registerTarget: (id: string, ref: RefObject<View | null>) => void; startTour: (role: GuidedTourRole) => void };
const Context = createContext<Value | null>(null);

export function GuidedTourProvider({ children }: PropsWithChildren) {
  const [completion, setCompletion] = useState<Completion>({});
  const [isReady, setIsReady] = useState(false);
  const [role, setRole] = useState<GuidedTourRole | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const targets = useRef(new Map<string, RefObject<View | null>>());

  useEffect(() => { void loadPreferences<{ guidedTours?: Completion }>().then((value) => setCompletion(value?.guidedTours ?? {})).catch(() => undefined).finally(() => setIsReady(true)); }, []);
  const activeStep = role ? tours[role][stepIndex] : undefined;
  const measure = useCallback(() => {
    const target = activeStep ? targets.current.get(activeStep.target)?.current : null;
    target?.measureInWindow((x, y, width, height) => setRect({ x, y, width, height }));
  }, [activeStep]);
  useEffect(() => { if (!role) return; const frame = requestAnimationFrame(measure); return () => cancelAnimationFrame(frame); }, [measure, role, stepIndex]);
  const registerTarget = useCallback((id: string, ref: RefObject<View | null>) => { targets.current.set(id, ref); }, []);
  const startTour = useCallback((nextRole: GuidedTourRole) => { if (!isReady) return; setRect(null); setStepIndex(0); setRole(nextRole); }, [isReady]);
  const finish = useCallback((finishedRole: GuidedTourRole) => { setRole(null); setCompletion((current) => { const next = { ...current, [finishedRole]: true }; void savePreferences({ guidedTours: next }).catch(() => undefined); return next; }); }, []);
  const advance = () => { if (!role) return; if (stepIndex + 1 === tours[role].length) finish(role); else { setRect(null); setStepIndex((value) => value + 1); } };
  const value = useMemo<Value>(() => ({ activeTarget: activeStep?.target, completed: (tourRole) => Boolean(completion[tourRole]), isReady, refreshTarget: measure, registerTarget, startTour }), [activeStep?.target, completion, isReady, measure, registerTarget, startTour]);
  return <Context.Provider value={value}>{children}<GuidedTourOverlay onAdvance={advance} onDismiss={() => role && finish(role)} rect={rect} role={role} stepIndex={stepIndex} /></Context.Provider>;
}

export function useGuidedTour() { const value = useContext(Context); if (!value) throw new Error("useGuidedTour must be used within GuidedTourProvider"); return value; }
export function useAutomaticGuidedTour(role: GuidedTourRole) { const { completed, isReady, startTour } = useGuidedTour(); const started = useRef(false); useEffect(() => { if (!isReady || (!alwaysReplayForDemo && completed(role)) || started.current) return; started.current = true; startTour(role); }, [completed, isReady, role, startTour]); }
export function TourTarget({ children, id, style }: PropsWithChildren<{ id: string; style?: React.ComponentProps<typeof View>["style"] }>) { const ref = useRef<View>(null); const { registerTarget } = useGuidedTour(); useEffect(() => { registerTarget(id, ref); }, [id, registerTarget]); return <View collapsable={false} ref={ref} style={style}>{children}</View>; }

function GuidedTourOverlay({ onAdvance, onDismiss, rect, role, stepIndex }: { onAdvance: () => void; onDismiss: () => void; rect: Rect | null; role: GuidedTourRole | null; stepIndex: number }) {
  if (!role || !rect) return null;
  const step = tours[role][stepIndex]; if (!step) return null; const final = stepIndex + 1 === tours[role].length;
  return <Modal animationType="fade" onRequestClose={onDismiss} statusBarTranslucent transparent visible><View accessibilityViewIsModal style={styles.root}><Spotlight rect={rect} /><Pressable accessibilityLabel="Skip app tour" accessibilityRole="button" onPress={onDismiss} style={styles.floatingSkip}><Text style={styles.skipText}>Skip</Text></Pressable><View style={[styles.card, rect.y > 390 ? styles.cardTop : styles.cardBottom]}><Text style={styles.progress}>{stepIndex + 1} OF {tours[role].length}</Text><Text accessibilityRole="header" style={styles.title}>{step.title}</Text><Text style={styles.body}>{step.body}</Text><View style={styles.actions}><Pressable accessibilityLabel={final ? "Finish app tour" : "Next app tour step"} accessibilityRole="button" onPress={onAdvance} style={styles.next}><Text style={styles.nextText}>{final ? "Finish" : "Next"}</Text></Pressable></View></View></View></Modal>;
}
function Spotlight({ rect }: { rect: Rect }) { const gap = 8; const height = rect.height + gap * 2; const left = Math.max(0, rect.x - gap); const top = Math.max(0, rect.y - gap); const right = left + rect.width + gap * 2; const bottom = top + height; return <><View pointerEvents="none" style={[styles.shade, { height: top, left: 0, right: 0, top: 0 }]} /><View pointerEvents="none" style={[styles.shade, { bottom: 0, left: 0, right: 0, top: bottom }]} /><View pointerEvents="none" style={[styles.shade, { height, left: 0, top, width: left }]} /><View pointerEvents="none" style={[styles.shade, { height, left: right, right: 0, top }]} /><View pointerEvents="none" style={[styles.focus, { borderRadius: 10, height, left, top, width: rect.width + gap * 2 }]} /></>; }
const styles = StyleSheet.create({ actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: spacing.md }, body: { color: "#DDEADF", fontSize: 15, lineHeight: 21 }, bottomLeftCorner: { borderTopRightRadius: 28 }, bottomRightCorner: { borderTopLeftRadius: 28 }, card: { backgroundColor: "#174B32", borderColor: "#D8BE72", borderCurve: "continuous", borderRadius: 20, borderWidth: 1, gap: 7, left: spacing.lg, padding: spacing.lg, position: "absolute", right: spacing.lg }, cardBottom: { bottom: 92 }, cardTop: { top: 54 }, corner: { backgroundColor: "rgba(4, 14, 8, 0.77)", position: "absolute" }, floatingSkip: { alignItems: "center", borderColor: "#F6E9C9", borderCurve: "continuous", borderRadius: 10, borderWidth: 1, bottom: 18, justifyContent: "center", left: spacing.lg, minHeight: 38, paddingHorizontal: spacing.md, position: "absolute" }, focus: { borderColor: "#F5D875", borderCurve: "continuous", borderRadius: 28, borderWidth: 2, position: "absolute" }, next: { alignItems: "center", backgroundColor: "#F6E9C9", borderCurve: "continuous", borderRadius: 10, justifyContent: "center", minHeight: 42, minWidth: 88, paddingHorizontal: spacing.md }, nextText: { color: "#174B32", fontSize: 14, fontWeight: "900" }, progress: { color: "#F6E9C9", fontSize: 11, fontWeight: "900", letterSpacing: 1.2 }, root: { flex: 1 }, shade: { backgroundColor: "rgba(4, 14, 8, 0.77)", position: "absolute" }, skipText: { color: "#F6E9C9", fontSize: 14, fontWeight: "800" }, title: { color: colors.surface, fontSize: 22, fontWeight: "900", letterSpacing: -0.3 }, topLeftCorner: { borderBottomRightRadius: 28 }, topRightCorner: { borderBottomLeftRadius: 28 } });
