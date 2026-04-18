import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDeliveries, type DeliveryRecord } from "../deliveries";
import { fetchNotifications, type NotificationRecord } from "../notifications";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);

  useEffect(() => {
    void fetchNotifications().then(setNotifications).catch(() => setNotifications([]));
    void fetchDeliveries().then(setDeliveries).catch(() => setDeliveries([]));
  }, []);

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Notifications</p>
            <h1>Operational event inbox</h1>
            <p className="merchant-subcopy">
              This local inbox captures lead and invoice events now, and can
              later be used to drive real email or webhook delivery.
            </p>
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
            <Link className="primary-button" to="/merchant">
              Merchant view
            </Link>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <p className="merchant-subcopy">
              No notifications yet. Create a lead or invoice to populate the
              operational inbox.
            </p>
          </div>
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const delivery = deliveries.find(
                (item) => item.notificationId === notification.id,
              );

              return (
              <article className="card notification-card" key={notification.id}>
                <div className="lead-card-top">
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                    {delivery ? (
                      <p className="delivery-detail">
                        Delivery: {delivery.status} · {delivery.detail}
                      </p>
                    ) : null}
                  </div>
                  <div className="lead-meta">
                    <span>{notification.type}</span>
                    <span>{formatDate(notification.createdAt)}</span>
                    {delivery ? (
                      <span className={`status-chip status-chip--${delivery.status}`}>
                        {delivery.status}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
