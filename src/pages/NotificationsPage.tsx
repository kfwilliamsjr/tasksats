import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDeliveries, retryDelivery, type DeliveryRecord } from "../deliveries";
import {
  fetchSyncHistory,
  fetchInvoices,
  fetchPaymentProvider,
  type InvoiceRecord,
  type PaymentProviderResponse,
  type PaymentProviderSummary,
  type SyncHistoryRecord,
} from "../invoices";
import { fetchNotifications, type NotificationRecord } from "../notifications";

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function downloadTextFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>([]);
  const [provider, setProvider] = useState<PaymentProviderSummary | null>(null);
  const [sourceFilter, setSourceFilter] = useState("All");
  const [deliveryFilter, setDeliveryFilter] = useState("All");
  const [statusMessage, setStatusMessage] = useState("");
  const [retryingDeliveryId, setRetryingDeliveryId] = useState("");

  async function loadNotificationsWorkspace() {
    const [nextNotifications, nextDeliveries, nextInvoices, nextSyncHistory, nextProvider] =
      await Promise.all([
        fetchNotifications().catch(() => []),
        fetchDeliveries().catch(() => []),
        fetchInvoices().catch(() => []),
        fetchSyncHistory().catch(() => []),
        fetchPaymentProvider()
          .then((payload: PaymentProviderResponse) => payload.provider)
          .catch(() => null),
      ]);

    setNotifications(nextNotifications);
    setDeliveries(nextDeliveries);
    setInvoices(nextInvoices);
    setSyncHistory(nextSyncHistory);
    setProvider(nextProvider);
  }

  useEffect(() => {
    void loadNotificationsWorkspace();
  }, []);

  async function handleRetryDelivery(deliveryId: string) {
    setRetryingDeliveryId(deliveryId);
    setStatusMessage("");

    try {
      const result = await retryDelivery(deliveryId);
      await loadNotificationsWorkspace();
      setStatusMessage(
        `Delivery retry completed with status: ${result.delivery?.status ?? "unknown"}.`,
      );
    } catch {
      setStatusMessage("Delivery retry could not be completed.");
    } finally {
      setRetryingDeliveryId("");
    }
  }

  function exportOperationsJson() {
    downloadTextFile(
      `tasksats-operations-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(
        {
          notifications,
          deliveries,
          syncHistory,
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
  }

  const sourceOptions = useMemo(() => {
    return [
      "All",
      ...new Set(
        notifications
          .map((notification) => notification.source || notification.type)
          .filter(Boolean),
      ),
    ];
  }, [notifications]);

  const deliveryOptions = useMemo(() => {
    return [
      "All",
      ...new Set(deliveries.map((delivery) => delivery.status).filter(Boolean)),
    ];
  }, [deliveries]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      const source = notification.source || notification.type;
      const delivery =
        deliveries.find((item) => item.notificationId === notification.id) ?? null;
      const matchesSource = sourceFilter === "All" || source === sourceFilter;
      const matchesDelivery =
        deliveryFilter === "All" || delivery?.status === deliveryFilter;
      return matchesSource && matchesDelivery;
    });
  }, [deliveries, deliveryFilter, notifications, sourceFilter]);

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Notifications</p>
            <h1>Operational event inbox</h1>
            <p className="merchant-subcopy">
              This local inbox captures lead and invoice events now, and can
              later be used to drive real email or webhook delivery. Active
              payment adapter: {provider?.displayName ?? "unknown"}.
            </p>
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
            <button className="ghost-button" type="button" onClick={exportOperationsJson}>
              Export ops JSON
            </button>
            <Link className="ghost-button" to="/activity">
              Activity
            </Link>
            <Link className="primary-button" to="/merchant">
              Merchant view
            </Link>
          </div>
        </div>

        <section className="merchant-stats-grid">
          <article className="card merchant-stat-card">
            <p>Notifications</p>
            <strong>{notifications.length}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Deliveries</p>
            <strong>{deliveries.length}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Filtered items</p>
            <strong>{filteredNotifications.length}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Sync history</p>
            <strong>{syncHistory.length}</strong>
          </article>
        </section>

        <div className="merchant-filter-bar">
          {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
          <label className="form-field merchant-filter-field">
            <span>Source filter</span>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
            >
              {sourceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field merchant-filter-field">
            <span>Delivery status</span>
            <select
              value={deliveryFilter}
              onChange={(event) => setDeliveryFilter(event.target.value)}
            >
              {deliveryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="empty-state">
            <p className="merchant-subcopy">
              No notifications match the current filters yet. Create a lead or
              invoice to populate the operational inbox.
            </p>
          </div>
        ) : (
          <div className="notification-list">
            {filteredNotifications.map((notification) => {
              const delivery = deliveries.find(
                (item) => item.notificationId === notification.id,
              );
              const invoiceId =
                String(notification.invoiceId ?? "").trim() ||
                String(notification.body).match(/inv_\d+/)?.[0] ||
                null;
              const invoice = invoiceId
                ? invoices.find((item) => item.id === invoiceId) ?? null
                : null;
              const providerKey =
                String(notification.providerKey ?? "").trim() ||
                String(invoice?.providerKey ?? "").trim() ||
                "unassigned";

              return (
              <article className="card notification-card" key={notification.id}>
                <div className="lead-card-top">
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                    {invoice ? (
                      <p className="delivery-detail">
                        Invoice provider: {providerKey}
                      </p>
                    ) : null}
                    {delivery ? (
                      <p className="delivery-detail">
                        Delivery: {delivery.status} · {delivery.detail}
                      </p>
                    ) : null}
                  </div>
                  <div className="lead-meta">
                    <span>{notification.source || notification.type}</span>
                    <span>{formatDate(notification.createdAt)}</span>
                    {delivery ? (
                      <span className={`status-chip status-chip--${delivery.status}`}>
                        {delivery.status}
                      </span>
                    ) : null}
                  </div>
                </div>
                {delivery ? (
                  <div className="activity-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void handleRetryDelivery(delivery.id)}
                      disabled={retryingDeliveryId === delivery.id}
                    >
                      {retryingDeliveryId === delivery.id ? "Retrying..." : "Retry delivery"}
                    </button>
                  </div>
                ) : null}
              </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
