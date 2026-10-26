import { useRef, useState } from "react";

type AdminNotification = {
  id: string;
  title: string;
  description: string;
  category: string;
  time: string;
  path: string;
  read: boolean;
};

export function AdminNotifications({ navigate }: { navigate: (path: string) => void }) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const unread = notifications.filter(notification => !notification.read).length;
  const visible = notifications.filter(notification => filter === "all" || !notification.read);

  const markRead = (id: string) => setNotifications(current => current.map(notification => notification.id === id ? { ...notification, read: true } : notification));
  const close = () => dialogRef.current?.close();

  return <div className="admin-notifications">
    <button ref={triggerRef} className="notification-trigger" type="button" aria-label={`Notifications, ${unread} unread`} aria-haspopup="dialog" aria-expanded={open} aria-controls="admin-notifications-panel" onClick={() => { setOpen(true); dialogRef.current?.showModal(); }}>
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
      {unread > 0 ? <span className="notification-badge" aria-hidden="true">{unread > 99 ? "99+" : unread}</span> : null}
    </button>
    <dialog ref={dialogRef} id="admin-notifications-panel" className="notification-panel" aria-labelledby="admin-notifications-title" onClose={() => { setOpen(false); triggerRef.current?.focus(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>
      <div className="notification-panel-heading"><div><p className="notification-eyebrow">Admin CRM</p><h2 id="admin-notifications-title">Notifications</h2><p className="notification-summary" role="status">{unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You’re all caught up"}</p></div><button className="notification-close" type="button" aria-label="Close notifications" onClick={close} autoFocus>×</button></div>
      <div className="notification-controls"><div className="notification-filters" role="group" aria-label="Filter notifications"><button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All ({notifications.length})</button><button type="button" aria-pressed={filter === "unread"} onClick={() => setFilter("unread")}>Unread ({unread})</button></div><button type="button" className="notification-mark-all" disabled={!unread} onClick={() => setNotifications(current => current.map(notification => ({ ...notification, read: true })))}>Mark all as read</button></div>
      <div className="notification-list">
        {visible.length ? <ul>{visible.map(notification => <li key={notification.id} className={`notification-item${notification.read ? "" : " is-unread"}`}>
          <div className="notification-item-meta"><span>{notification.category}</span><span>{notification.time}</span></div>
          <h3>{!notification.read ? <span className="notification-unread-dot" aria-label="Unread" /> : null}{notification.title}</h3>
          <p>{notification.description}</p>
          <div className="notification-item-actions"><button type="button" onClick={() => { markRead(notification.id); close(); navigate(notification.path); }}>Open {notification.category.toLowerCase()} <span aria-hidden="true">→</span></button>{!notification.read ? <button type="button" onClick={() => markRead(notification.id)} aria-label={`Mark as read: ${notification.title}`}>Mark as read</button> : <span>Read</span>}</div>
        </li>)}</ul> : <div className="notification-empty"><span aria-hidden="true">✓</span><h3>{filter === "all" ? "No notifications yet" : "You’re all caught up"}</h3><p>{filter === "all" ? "Notifications will appear here when available." : "You have no unread notifications."}</p>{filter === "unread" ? <button type="button" onClick={() => setFilter("all")}>View all notifications</button> : null}</div>}
      </div>
    </dialog>
  </div>;
}
