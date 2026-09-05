import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@nobogey/ui";
import { ResponsiveContent } from "../../ui/ResponsiveContent";
import { loadCaddieVerificationStatus } from "../../../backend/users/users.service";

export function VerificationStatusScreen() {
  const [result,setResult]=useState<{status:string;note?:string;reviewedAt?:string}|null>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{void loadCaddieVerificationStatus().then(setResult).finally(()=>setLoading(false));},[]);
  const label=loading?"Loading verification…":result?.status.replaceAll("_"," ")??"Not submitted";
  return <SafeAreaView edges={["top", "bottom"]} style={styles.safe}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.scroll}><ResponsiveContent style={styles.content}><Text accessibilityRole="header" style={styles.title}>Caddie verification</Text><Text style={styles.subtitle}>Your live club-review status is shown below.</Text><Text style={styles.status}>{label.toUpperCase()}</Text>{result?.note?<Text style={styles.subtitle}>Reviewer note: {result.note}</Text>:null}{result?.reviewedAt?<Text style={styles.subtitle}>Updated {new Date(result.reviewedAt).toLocaleString()}</Text>:null}</ResponsiveContent></ScrollView></SafeAreaView>;
}

const styles = StyleSheet.create({ content: { gap: spacing.xl, padding: spacing.lg, paddingBottom: 36 }, safe: { backgroundColor: colors.canvas, flex: 1 }, scroll: { flexGrow: 1 }, status:{backgroundColor:colors.surface,borderColor:colors.border,borderRadius:12,borderWidth:1,color:colors.fairwayDark,fontSize:18,fontWeight:"900",padding:spacing.lg}, subtitle: { color: colors.textMuted, fontSize: 16, lineHeight: 23 }, title: { color: colors.text, fontSize: 32, fontWeight: "900", letterSpacing: -1 } });
