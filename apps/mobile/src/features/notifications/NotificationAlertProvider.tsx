import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { acceptAssignmentLocally, createInitialNotificationAlertState, dismissAlertBanner, markBookingAlertsRead } from "./notification-alert-state";
import type { NotificationKind, NotificationRole } from "./notification-alert.types";

type NotificationAlertContextValue = {
  acceptAssignment: (bookingId: string) => void;
  dismissBanner: (alertId: string) => void;
  getUnreadCount: (role: NotificationRole) => number;
  getVisibleAlert: (role: NotificationRole) => ReturnType<typeof createInitialNotificationAlertState>["alerts"][number] | undefined;
  hasUnreadAlert: (role: NotificationRole, bookingId: string, kind: NotificationKind) => boolean;
  isAssignmentAccepted: (bookingId: string) => boolean;
  markBookingOpened: (bookingId: string, role: NotificationRole) => void;
};

const NotificationAlertContext = createContext<NotificationAlertContextValue | null>(null);

export function NotificationAlertProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(createInitialNotificationAlertState);

  const value = useMemo<NotificationAlertContextValue>(() => ({
    acceptAssignment: (bookingId) => setState((current) => acceptAssignmentLocally(current, bookingId)),
    dismissBanner: (alertId) => setState((current) => dismissAlertBanner(current, alertId)),
    getUnreadCount: (role) => state.alerts.filter((alert) => alert.recipientRole === role && !alert.readAt).length,
    getVisibleAlert: (role) => state.alerts.find((alert) => alert.recipientRole === role && !alert.readAt && !state.dismissedAlertIds.includes(alert.id)),
    hasUnreadAlert: (role, bookingId, kind) => state.alerts.some((alert) => alert.recipientRole === role && alert.bookingId === bookingId && alert.kind === kind && !alert.readAt),
    isAssignmentAccepted: (bookingId) => state.acceptedBookingIds.includes(bookingId),
    markBookingOpened: (bookingId, role) => setState((current) => markBookingAlertsRead(current, bookingId, role))
  }), [state]);

  return <NotificationAlertContext.Provider value={value}>{children}</NotificationAlertContext.Provider>;
}

export function useNotificationAlerts() {
  const value = useContext(NotificationAlertContext);
  if (!value) throw new Error("useNotificationAlerts must be used within NotificationAlertProvider");
  return value;
}
