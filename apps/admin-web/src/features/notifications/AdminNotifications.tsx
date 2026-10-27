import { useCallback, useEffect, useRef, useState } from "react";
import {
  formatAdminNotificationTime,
  getAdminNotificationCounts,
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  subscribeToAdminNotifications,
  type AdminNotification,
  type AdminNotificationCounts,
} from "../../../backend/notifications";

export function AdminNotifications({ navigate }: { navigate: (path: string) => void }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [counts, setCounts] = useState<AdminNotificationCounts>({ total: 0, unread: 0 });
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const refresh = useCallback(async () => {
    try {
      const [items, nextCounts] = await Promise.all([
        listAdminNotifications(filter === "unread"),
        getAdminNotificationCounts(),
      ]);
      setNotifications(items);
      setCounts(nextCounts);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeToAdminNotifications(() => void refresh());
    const onVisibility = () => { if (document.visibilityState === "visible") void refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const close = () => dialogRef.current?.close();
  const markRead = async (id: string) => {
    try {
      await markAdminNotificationRead(id);
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update the notification.");
    }
  };
  const markAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      await refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update notifications.");
    }
  };

  return <div className="admin-notifications">
    <button ref={triggerRef} className="notification-trigger" type="button" aria-label={`Notifications, ${counts.unread} unread`} aria-haspopup="dialog" aria-expanded={open} aria-controls="admin-notifications-panel" onClick={() => { setOpen(true); void refresh(); dialogRef.current?.showModal(); }}>
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
      {counts.unread > 0 ? <span className="notification-badge" aria-hidden="true">{counts.unread > 99 ? "99+" : counts.unread}</span> : null}
    </button>
    <dialog ref={dialogRef} id="admin-notifications-panel" className="notification-panel" aria-labelledby="admin-notifications-title" onClose={() => { setOpen(false); triggerRef.current?.focus(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
      <div className="notification-panel-heading"><div><p className="notification-eyebrow">Admin CRM</p><h2 id="admin-notifications-title">Notifications</h2><p className="notification-summary" role="status">{counts.unread ? `${counts.unread} unread notification${counts.unread === 1 ? "" : "s"}` : "You're all caught up"}</p></div><button className="notification-close" type="button" aria-label="Close notifications" onClick={close} autoFocus>{"\u00D7"}</button></div>
      <div className="notification-controls"><div className="notification-filters" role="group" aria-label="Filter notifications"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All ({counts.total})</button><button type="button" aria-pressed={filter === "unread"} onClick={() => setFilter("unread")}>Unread ({counts.unread})</button></div><button type="button" className="notification-mark-all" disabled={!counts.unread} onClick={() => void markAllRead()}>Mark all as read</button></div>
      <div className="notification-list">
        {error ? <p className="notification-summary" role="alert">{error}</p> : null}
        {loading ? <div className="notification-empty"><h3>Loading notifications...</h3></div> : notifications.length ? <ul>{notifications.map(notification => <li key={notification.id} className={`notification-item${notification.readAt ? "" : " is-unread"}`}>
          <div className="notification-item-meta"><span>{notification.category}</span><time dateTime={notification.createdAt} title={new Date(notification.createdAt).toLocaleString()}>{formatAdminNotificationTime(notification.createdAt)}</time></div>
          <h3>{!notification.readAt ? <span className="notification-unread-dot" aria-label="Unread" /> : null}{notification.title}</h3>
          <p>{notification.description}</p>
          <div className="notification-item-actions"><button type="button" onClick={() => { void markRead(notification.id); close(); navigate(notification.destinationPath); }}>Open {notification.category.toLowerCase()} <span aria-hidden="true">{"\u2192"}</span></button>{!notification.readAt ? <button type="button" onClick={() => void markRead(notification.id)} aria-label={`Mark as read: ${notification.title}`}>Mark as read</button> : <span>Read</span>}</div>
        </li>)}</ul> : <div className="notification-empty"><span aria-hidden="true">{"\u2713"}</span><h3>{filter === "all" ? "No notifications yet" : "You're all caught up"}</h3><p>{filter === "all" ? "Course and booking events will appear here." : "You have no unread notifications."}</p>{filter === "unread" ? <button type="button" onClick={() => setFilter("all")}>View all notifications</button> : null}</div>}
      </div>
    </dialog>
  </div>;
}
