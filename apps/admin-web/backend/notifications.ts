import { supabase } from "../src/lib/supabase";

export type AdminNotification = {
  id: string;
  courseId: string;
  bookingId?: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  destinationPath: string;
  readAt?: string;
};

export type AdminNotificationCounts = { total: number; unread: number };

type NotificationRow = {
  id: string;
  course_id: string;
  booking_id: string | null;
  category: string;
  title: string;
  description: string;
  destination_path: string;
  created_at: string;
  read_at: string | null;
};

export function mapAdminNotification(row: NotificationRow): AdminNotification {
  return {
    id: row.id,
    courseId: row.course_id,
    ...(row.booking_id ? { bookingId: row.booking_id } : {}),
    title: row.title,
    description: row.description,
    category: row.category,
    createdAt: row.created_at,
    destinationPath: safeAdminDestination(row.destination_path),
    ...(row.read_at ? { readAt: row.read_at } : {}),
  };
}

export function safeAdminDestination(path: string): string {
  return /^\/admin(?:\/[-a-z0-9]+)*$/.test(path) ? path : "/admin";
}

export function formatAdminNotificationTime(value: string, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  const difference = date.getTime() - now.getTime();
  const absolute = Math.abs(difference);
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
  if (absolute < 60_000) return formatter.format(Math.round(difference / 1000), "second");
  if (absolute < 3_600_000) return formatter.format(Math.round(difference / 60_000), "minute");
  if (absolute < 86_400_000) return formatter.format(Math.round(difference / 3_600_000), "hour");
  if (absolute < 604_800_000) return formatter.format(Math.round(difference / 86_400_000), "day");
  return date.toLocaleString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export async function listAdminNotifications(unreadOnly = false): Promise<AdminNotification[]> {
  const { data, error } = await supabase.rpc("list_admin_notifications", { p_unread_only: unreadOnly, p_limit: 200 });
  if (error) throw error;
  return ((data ?? []) as NotificationRow[]).map(mapAdminNotification);
}

export async function getAdminNotificationCounts(): Promise<AdminNotificationCounts> {
  const { data, error } = await supabase.rpc("get_admin_notification_counts");
  if (error) throw error;
  const row = (data as Array<{ total_count: number | string; unread_count: number | string }> | null)?.[0];
  return { total: Number(row?.total_count ?? 0), unread: Number(row?.unread_count ?? 0) };
}

export async function markAdminNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase.rpc("mark_admin_notification_read", { p_notification_id: notificationId });
  if (error) throw error;
}

export async function markAllAdminNotificationsRead(): Promise<void> {
  const { error } = await supabase.rpc("mark_all_admin_notifications_read", { p_course_id: null });
  if (error) throw error;
}

export function subscribeToAdminNotifications(onChange: () => void) {
  const channel = supabase.channel(`admin-crm-notifications-${Math.random().toString(36).slice(2)}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, onChange)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notification_reads" }, onChange)
    .subscribe();
  return () => { void supabase.removeChannel(channel); };
}
