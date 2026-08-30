import type { NotificationAlert, NotificationRole } from "./notification-alert.types";

export type NotificationAlertState = {
  acceptedBookingIds: string[];
  alerts: NotificationAlert[];
  dismissedAlertIds: string[];
};

export function createInitialNotificationAlertState(): NotificationAlertState {
  return {
    acceptedBookingIds: [],
    dismissedAlertIds: [],
    alerts: []
  };
}

export function acceptAssignmentLocally(state: NotificationAlertState, bookingId: string): NotificationAlertState {
  if (state.acceptedBookingIds.includes(bookingId)) return state;

  return {
    ...state,
    acceptedBookingIds: [...state.acceptedBookingIds, bookingId],
    alerts: [...state.alerts, {
      id: `alert-golfer-accepted-${bookingId}`,
      kind: "booking_assignment_accepted",
      recipientRole: "golfer",
      bookingId,
      title: "Caddie accepted",
      body: "Your requested caddie accepted the assignment.",
      createdAt: new Date().toISOString()
    }]
  };
}

export function markBookingAlertsRead(state: NotificationAlertState, bookingId: string, role: NotificationRole): NotificationAlertState {
  const hasUnreadMatch = state.alerts.some((alert) => alert.bookingId === bookingId && alert.recipientRole === role && !alert.readAt);
  if (!hasUnreadMatch) return state;
  const readAt = new Date().toISOString();
  return {
    ...state,
    alerts: state.alerts.map((alert) => alert.bookingId === bookingId && alert.recipientRole === role && !alert.readAt ? { ...alert, readAt } : alert)
  };
}

export function dismissAlertBanner(state: NotificationAlertState, alertId: string): NotificationAlertState {
  if (state.dismissedAlertIds.includes(alertId)) return state;
  return { ...state, dismissedAlertIds: [...state.dismissedAlertIds, alertId] };
}
