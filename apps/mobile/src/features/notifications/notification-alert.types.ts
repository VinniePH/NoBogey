export type NotificationKind = "booking_assignment_requested" | "booking_assignment_accepted";

export type NotificationRole = "golfer" | "caddie";

export type NotificationAlert = {
  id: string;
  kind: NotificationKind;
  recipientRole: NotificationRole;
  bookingId: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
};
