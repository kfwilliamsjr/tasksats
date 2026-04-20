import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchDeliveries, type DeliveryRecord } from "../deliveries";
import {
  fetchPaymentProviderDiagnostics,
  importSystemBundle,
  fetchSystemReadinessReport,
  fetchSystemExportBundle,
  fetchRuntimeConfig,
  fetchStorageBackend,
  fetchSyncHistory,
  fetchWebhookGuides,
  fetchInvoices,
  fetchPaymentProvider,
  syncInvoiceProvider,
  syncInvoicesByProvider,
  triggerWebhookTest,
  updatePaymentProvider,
  type InvoiceRecord,
  type EnvironmentCheck,
  type PaymentProviderDiagnostic,
  type PaymentProviderResponse,
  type PaymentProviderSummary,
  type ReadinessCheck,
  type RuntimeConfigSummary,
  type StorageBackendSummary,
  type SyncHistoryRecord,
  type SystemReadinessReport,
  type WebhookTestResult,
  type WebhookGuide,
} from "../invoices";
import {
  fetchNotifications,
  sendNotificationTest,
  type NotificationRecord,
  type NotificationTestResult,
} from "../notifications";

type ActivityItem = {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  source: string;
  invoiceId: string | null;
  invoiceStatus: string;
  invoiceProviderKey: string;
  deliveryStatus: string;
  deliveryDetail: string;
};
type EventSummaryCard = {
  label: string;
  value: string;
};

type ProviderPerformanceCard = {
  providerKey: string;
  invoiceCount: number;
  paidCount: number;
  paidUsd: number;
  openCount: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function downloadJsonFile(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function getStatusChipClass(status: string) {
  if (status === "Paid" || status === "sent") {
    return "status-chip status-chip--paid";
  }

  if (status === "Pending" || status === "queued") {
    return "status-chip status-chip--queued";
  }

  if (status === "Open") {
    return "status-chip";
  }

  return "status-chip status-chip--failed";
}

function getReadinessChipClass(status: ReadinessCheck["status"]) {
  if (status === "ready") {
    return "status-chip status-chip--paid";
  }

  if (status === "partial") {
    return "status-chip status-chip--queued";
  }

  return "status-chip status-chip--failed";
}

export function ActivityPage() {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [provider, setProvider] = useState<PaymentProviderSummary | null>(null);
  const [providers, setProviders] = useState<PaymentProviderSummary[]>([]);
  const [storageBackend, setStorageBackend] = useState<StorageBackendSummary | null>(null);
  const [runtimeConfig, setRuntimeConfig] = useState<RuntimeConfigSummary | null>(null);
  const [webhookGuides, setWebhookGuides] = useState<WebhookGuide[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryRecord[]>([]);
  const [readinessReport, setReadinessReport] = useState<SystemReadinessReport | null>(null);
  const [providerDiagnostics, setProviderDiagnostics] = useState<PaymentProviderDiagnostic[]>([]);
  const [providerMessage, setProviderMessage] = useState("");
  const [webhookMessage, setWebhookMessage] = useState("");
  const [activityMessage, setActivityMessage] = useState("");
  const [notificationTestMessage, setNotificationTestMessage] = useState("");
  const [lastWebhookTest, setLastWebhookTest] = useState<WebhookTestResult | null>(null);
  const [lastNotificationTest, setLastNotificationTest] = useState<NotificationTestResult | null>(null);
  const [isUpdatingProvider, setIsUpdatingProvider] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [isSyncingProviderInvoices, setIsSyncingProviderInvoices] = useState(false);
  const [syncingInvoiceId, setSyncingInvoiceId] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedProviderKey, setSelectedProviderKey] = useState("all");
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState("all");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  async function loadDashboardData() {
    const [
      nextInvoices,
      nextNotifications,
      nextDeliveries,
      paymentProviderPayload,
      nextStorageBackend,
      nextRuntimeConfig,
      nextWebhookGuides,
      nextSyncHistory,
      nextReadinessReport,
      nextProviderDiagnostics,
    ] = await Promise.all([
      fetchInvoices().catch(() => []),
      fetchNotifications().catch(() => []),
      fetchDeliveries().catch(() => []),
      fetchPaymentProvider().catch(() => ({ provider: null, providers: [] })),
      fetchStorageBackend().catch(() => null),
      fetchRuntimeConfig().catch(() => null),
      fetchWebhookGuides().catch(() => []),
      fetchSyncHistory().catch(() => []),
      fetchSystemReadinessReport().catch(() => null),
      fetchPaymentProviderDiagnostics().catch(() => []),
    ]);

    setInvoices(nextInvoices);
    setNotifications(nextNotifications);
    setDeliveries(nextDeliveries);
    setProvider((paymentProviderPayload as PaymentProviderResponse).provider ?? null);
    setProviders((paymentProviderPayload as PaymentProviderResponse).providers ?? []);
    setStorageBackend(nextStorageBackend);
    setRuntimeConfig(nextRuntimeConfig);
    setWebhookGuides(nextWebhookGuides);
    setSyncHistory(nextSyncHistory);
    setReadinessReport(nextReadinessReport);
    setProviderDiagnostics(nextProviderDiagnostics);
  }

  useEffect(() => {
    void loadDashboardData();
  }, []);

  async function handleProviderChange(key: string) {
    setIsUpdatingProvider(true);
    setProviderMessage("");

    try {
      const payload = await updatePaymentProvider(key);
      setProvider(payload.provider);
      setProviders(payload.providers);
      setProviderMessage(`Active payment adapter switched to ${payload.provider?.displayName ?? key}.`);
    } catch {
      setProviderMessage("Could not switch payment adapter right now.");
    } finally {
      setIsUpdatingProvider(false);
    }
  }

  async function handleWebhookTest(providerKey: string, eventName: string) {
    const invoice = invoices.find((item) => (item.providerKey ?? "unassigned") === providerKey);

    if (!invoice) {
      setWebhookMessage(`No invoice found for provider ${providerKey}. Create one first.`);
      return;
    }

    setIsTestingWebhook(true);
    setWebhookMessage("");

    try {
      const result = await triggerWebhookTest(providerKey, invoice.id, eventName);
      await loadDashboardData();
      setLastWebhookTest(result);
      setWebhookMessage(`Webhook test sent for ${invoice.id} via ${providerKey} using ${eventName}.`);
    } catch {
      setWebhookMessage(`Could not send webhook test for provider ${providerKey}.`);
    } finally {
      setIsTestingWebhook(false);
    }
  }

  async function handleNotificationTest() {
    setIsTestingNotification(true);
    setNotificationTestMessage("");

    try {
      const result = await sendNotificationTest();
      await loadDashboardData();
      setLastNotificationTest(result);
      const deliveryStatus = result.delivery?.status ?? "unknown";
      setNotificationTestMessage(`Notification test completed with delivery status: ${deliveryStatus}.`);
    } catch {
      setNotificationTestMessage("Could not run the notification delivery test right now.");
    } finally {
      setIsTestingNotification(false);
    }
  }

  async function handleProviderInvoiceSync(providerKey = "") {
    setIsSyncingProviderInvoices(true);
    setProviderMessage("");

    try {
      const result = await syncInvoicesByProvider(providerKey);
      await loadDashboardData();
      setProviderMessage(
        `Synced ${result.syncedCount} of ${result.requestedCount} invoices for ${result.providerKey}.`,
      );
    } catch {
      setProviderMessage("Could not sync provider invoices right now.");
    } finally {
      setIsSyncingProviderInvoices(false);
    }
  }

  async function handleInvoiceSync(invoiceId: string) {
    setSyncingInvoiceId(invoiceId);
    setActivityMessage("");

    try {
      const result = await syncInvoiceProvider(invoiceId);
      await loadDashboardData();
      setActivityMessage(result.sync?.detail || `Invoice ${invoiceId} synced successfully.`);
    } catch {
      setActivityMessage(`Could not sync ${invoiceId} right now.`);
    } finally {
      setSyncingInvoiceId("");
    }
  }

  const activityItems = useMemo<ActivityItem[]>(() => {
    return notifications.map((notification) => {
      const invoiceId =
        String(notification.invoiceId ?? "").trim() ||
        String(notification.body).match(/inv_\d+/)?.[0] ||
        null;
      const invoice = invoiceId
        ? invoices.find((item) => item.id === invoiceId) ?? null
        : null;
      const delivery =
        deliveries.find((item) => item.notificationId === notification.id) ?? null;

      return {
        id: notification.id,
        createdAt: notification.createdAt,
        title: notification.title,
        body: notification.body,
        source: String(notification.source ?? "").trim() || notification.type,
        invoiceId,
        invoiceStatus: invoice?.status ?? "No invoice linked",
        invoiceProviderKey:
          String(notification.providerKey ?? "").trim() ||
          invoice?.providerKey ||
          "unassigned",
        deliveryStatus: delivery?.status ?? "not-started",
        deliveryDetail: delivery?.detail ?? "No delivery record yet",
      };
    });
  }, [deliveries, invoices, notifications]);

  const activityStats = useMemo(() => {
    const paidCount = invoices.filter((invoice) => invoice.status === "Paid").length;
    const pendingCount = invoices.filter((invoice) => invoice.status === "Pending").length;
    const deliveryIssues = deliveries.filter(
      (delivery) => delivery.status === "failed" || delivery.status === "skipped",
    ).length;

    return [
      { label: "Invoices", value: String(invoices.length) },
      { label: "Pending payments", value: String(pendingCount) },
      { label: "Paid invoices", value: String(paidCount) },
      { label: "Delivery issues", value: String(deliveryIssues) },
    ];
  }, [deliveries, invoices]);

  const eventSummaryCards = useMemo<EventSummaryCard[]>(() => {
    const sourceCounts = activityItems.reduce<Record<string, number>>((accumulator, item) => {
      const key = item.source || "unknown";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return [
      { label: "Lead events", value: String(sourceCounts["lead-form"] ?? 0) },
      { label: "Invoices created", value: String(sourceCounts["invoice-create"] ?? 0) },
      { label: "Webhook events", value: String(sourceCounts["webhook"] ?? 0) },
      { label: "Payment events", value: String(sourceCounts["payment-event"] ?? 0) },
    ];
  }, [activityItems]);

  const sourceOptions = useMemo(
    () => ["all", ...new Set(activityItems.map((item) => item.source).filter(Boolean))],
    [activityItems],
  );

  const providerOptions = useMemo(
    () => [
      "all",
      ...new Set(activityItems.map((item) => item.invoiceProviderKey).filter(Boolean)),
    ],
    [activityItems],
  );

  const invoiceStatusOptions = useMemo(
    () => [
      "all",
      ...new Set(activityItems.map((item) => item.invoiceStatus).filter(Boolean)),
    ],
    [activityItems],
  );

  const filteredActivityItems = useMemo(() => {
    return activityItems.filter((item) => {
      if (selectedSource !== "all" && item.source !== selectedSource) {
        return false;
      }

      if (selectedProviderKey !== "all" && item.invoiceProviderKey !== selectedProviderKey) {
        return false;
      }

      if (selectedInvoiceStatus !== "all" && item.invoiceStatus !== selectedInvoiceStatus) {
        return false;
      }

      return true;
    });
  }, [activityItems, selectedInvoiceStatus, selectedProviderKey, selectedSource]);

  const providerPerformanceCards = useMemo<ProviderPerformanceCard[]>(() => {
    const grouped = invoices.reduce<Record<string, ProviderPerformanceCard>>((accumulator, invoice) => {
      const key = String(invoice.providerKey ?? "unassigned").trim() || "unassigned";
      const usdValue = Number.parseFloat(String(invoice.amountUsd).replace(/[^0-9.]/g, "")) || 0;

      if (!accumulator[key]) {
        accumulator[key] = {
          providerKey: key,
          invoiceCount: 0,
          paidCount: 0,
          paidUsd: 0,
          openCount: 0,
        };
      }

      accumulator[key].invoiceCount += 1;

      if (invoice.status === "Paid") {
        accumulator[key].paidCount += 1;
        accumulator[key].paidUsd += usdValue;
      } else {
        accumulator[key].openCount += 1;
      }

      return accumulator;
    }, {});

    return Object.values(grouped).sort((left, right) =>
      left.providerKey.localeCompare(right.providerKey),
    );
  }, [invoices]);

  const readinessItems = useMemo<ReadinessCheck[]>(
    () => readinessReport?.checks ?? [],
    [readinessReport],
  );

  const environmentItems = useMemo<EnvironmentCheck[]>(
    () => readinessReport?.environment ?? [],
    [readinessReport],
  );

  const readinessSummary = useMemo(
    () =>
      readinessReport?.summary ?? {
        percent: 0,
        readyCount: 0,
        partialCount: 0,
        pendingCount: 0,
      },
    [readinessReport],
  );

  const syncHistorySummary = useMemo(() => {
    const recent = syncHistory.slice(0, 5);
    const providerCounts = syncHistory.reduce<Record<string, number>>((accumulator, item) => {
      const key = String(item.providerKey ?? "unassigned").trim() || "unassigned";
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {});

    return {
      total: syncHistory.length,
      recent,
      providerCounts,
    };
  }, [syncHistory]);

  async function handleRefresh() {
    setIsRefreshing(true);
    setProviderMessage("");

    try {
      await loadDashboardData();
      setProviderMessage("Dashboard data refreshed from the local API.");
    } catch {
      setProviderMessage("Dashboard refresh failed.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSystemExport() {
    setIsExporting(true);
    setProviderMessage("");

    try {
      const bundle = await fetchSystemExportBundle();

      if (!bundle) {
        setProviderMessage("System export could not be generated right now.");
        return;
      }

      downloadJsonFile(
        `tasksats-system-export-${bundle.exportedAt.slice(0, 10)}.json`,
        bundle,
      );
      setProviderMessage("System export bundle downloaded from the local API.");
    } catch {
      setProviderMessage("System export failed.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsImporting(true);
    setProviderMessage("");

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const result = await importSystemBundle(parsed);
      await loadDashboardData();
      setProviderMessage(
        `Imported backup from ${result.importedAt}. ${result.counts.invoices} invoices and ${result.counts.notifications} notifications are now loaded.`,
      );
    } catch {
      setProviderMessage("System import failed. Use a TaskSats export JSON bundle.");
    } finally {
      event.target.value = "";
      setIsImporting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Payment activity</p>
            <h1>TaskSats operating dashboard</h1>
            <p className="merchant-subcopy">
              This view brings invoice status, operational events, and delivery
              outcomes into one place so the payment product can be run like a
              business, not just previewed like a demo.
            </p>
          </div>
          <div className="topbar-actions">
            <button
              className="ghost-button"
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh data"}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => void handleSystemExport()}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export system"}
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => importInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? "Importing..." : "Import system"}
            </button>
            <Link className="ghost-button" to="/merchant">
              Merchant view
            </Link>
            <Link className="ghost-button" to="/notifications">
              Notifications
            </Link>
            <Link className="primary-button" to="/">
              Homepage
            </Link>
          </div>
        </div>
        <input
          ref={importInputRef}
          type="file"
          accept="application/json"
          onChange={(event) => void handleImportFile(event)}
          style={{ display: "none" }}
        />

        <section className="merchant-stats-grid">
          {activityStats.map((stat) => (
            <article className="card merchant-stat-card" key={stat.label}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="merchant-stats-grid">
          {eventSummaryCards.map((stat) => (
            <article className="card merchant-stat-card" key={stat.label}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="merchant-stats-grid">
          <article className="card merchant-stat-card">
            <p>Launch readiness</p>
            <strong>{readinessSummary.percent}%</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Ready items</p>
            <strong>{readinessSummary.readyCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Partial items</p>
            <strong>{readinessSummary.partialCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Pending items</p>
            <strong>{readinessSummary.pendingCount}</strong>
          </article>
        </section>

        <section className="provider-list">
          <article className="provider-card">
            <strong>Reconciliation history</strong>
            <p>
              {syncHistorySummary.total} provider sync events recorded. This gives TaskSats a
              dedicated audit trail for invoice refreshes before live settlement APIs are wired in.
            </p>
            <div className="lead-meta">
              {Object.entries(syncHistorySummary.providerCounts).map(([key, count]) => (
                <span key={key}>
                  {key}: {count}
                </span>
              ))}
            </div>
          </article>
          {syncHistorySummary.recent.map((item) => (
            <article className="provider-card" key={item.id}>
              <strong>{item.invoiceId}</strong>
              <p>{item.detail || "Provider sync recorded."}</p>
              <div className="lead-meta">
                <span>{formatDate(item.createdAt)}</span>
                <span>{item.providerKey}</span>
                <span>{item.invoiceStatus}</span>
                <span>{item.providerSessionStatus || "no-session-state"}</span>
                <span>{item.syncStatus}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="provider-list">
          {providerPerformanceCards.map((item) => (
            <article className="provider-card" key={item.providerKey}>
              <strong>{item.providerKey}</strong>
              <p>
                {item.invoiceCount} invoices tracked, {item.paidCount} paid, {item.openCount} still
                active.
              </p>
              <div className="lead-meta">
                <span>Paid USD: ${item.paidUsd.toFixed(2)}</span>
                <span>Paid invoices: {item.paidCount}</span>
                <span>Open or pending: {item.openCount}</span>
              </div>
            </article>
          ))}
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Timeline</p>
                <h2>Recent payment operations</h2>
              </div>
            </div>

            <div className="activity-filter-bar">
              <label className="activity-filter-field">
                <span>Source</span>
                <select
                  value={selectedSource}
                  onChange={(event) => setSelectedSource(event.target.value)}
                >
                  {sourceOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="activity-filter-field">
                <span>Provider</span>
                <select
                  value={selectedProviderKey}
                  onChange={(event) => setSelectedProviderKey(event.target.value)}
                >
                  {providerOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="activity-filter-field">
                <span>Invoice status</span>
                <select
                  value={selectedInvoiceStatus}
                  onChange={(event) => setSelectedInvoiceStatus(event.target.value)}
                >
                  {invoiceStatusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <p className="activity-filter-summary">
              Showing {filteredActivityItems.length} of {activityItems.length} events.
            </p>
            {activityMessage ? <p className="status-banner">{activityMessage}</p> : null}

            {filteredActivityItems.length === 0 ? (
              <div className="empty-state">
                <p className="merchant-subcopy">
                  No events match the current filters yet. Adjust the filters or
                  create more invoice activity to populate this dashboard.
                </p>
              </div>
            ) : (
              <div className="activity-list">
                {filteredActivityItems.map((item) => (
                  <article className="activity-card" key={item.id}>
                    <div className="lead-card-top">
                      <div>
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                        <p className="activity-meta-copy">Source: {item.source}</p>
                      </div>
                      <div className="lead-meta">
                        <span>{formatDate(item.createdAt)}</span>
                        <span className={getStatusChipClass(item.invoiceStatus)}>
                          {item.invoiceStatus}
                        </span>
                        <span className={getStatusChipClass(item.deliveryStatus)}>
                          {item.deliveryStatus}
                        </span>
                      </div>
                    </div>

                    <div className="activity-detail-grid">
                      <div>
                        <p className="invoice-label">Invoice</p>
                        <strong>{item.invoiceId ?? "Operational event only"}</strong>
                        <p className="activity-meta-copy">
                          Provider: {item.invoiceProviderKey}
                        </p>
                      </div>
                      <div>
                        <p className="invoice-label">Delivery detail</p>
                        <strong>{item.deliveryDetail}</strong>
                      </div>
                    </div>

                    {item.invoiceId ? (
                      <div className="activity-actions">
                        <Link className="ghost-button" to={`/invoice-preview/${item.invoiceId}`}>
                          Open checkout
                        </Link>
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={() => void handleInvoiceSync(item.invoiceId as string)}
                          disabled={syncingInvoiceId === item.invoiceId}
                        >
                          {syncingInvoiceId === item.invoiceId ? "Syncing..." : "Sync invoice"}
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </article>

          <aside className="card merchant-panel merchant-panel--aside">
            <p className="eyebrow">Provider layer</p>
            <h2>{provider?.displayName ?? "Payment adapter"}</h2>
            <p className="merchant-subcopy">
              Current mode: {provider?.mode ?? "unknown"}. This adapter seam
              lets TaskSats keep the merchant workflow stable while swapping the
              actual Bitcoin backend later.
            </p>
            <ul className="feature-list">
              {(provider?.capabilities ?? []).map((capability) => (
                <li key={capability}>{capability}</li>
              ))}
            </ul>
            {providerMessage ? <p className="form-hint">{providerMessage}</p> : null}
            {webhookMessage ? <p className="form-hint">{webhookMessage}</p> : null}
            {notificationTestMessage ? <p className="form-hint">{notificationTestMessage}</p> : null}
            {lastWebhookTest ? (
              <div className="provider-list">
                <article className="provider-card">
                  <strong>Last webhook test</strong>
                  <p>
                    Verification result: {lastWebhookTest.verification ?? "not reported"}
                  </p>
                  <div className="provider-card-actions">
                    <span
                      className={getReadinessChipClass(
                        lastWebhookTest.verification === "verified" ||
                          lastWebhookTest.verification === "demo-provider"
                          ? "ready"
                          : "partial",
                      )}
                    >
                      {lastWebhookTest.verification ?? "unknown"}
                    </span>
                    <span className="provider-badge">{lastWebhookTest.mode}</span>
                  </div>
                  {lastWebhookTest.headers && Object.keys(lastWebhookTest.headers).length > 0 ? (
                    <pre className="webhook-code-block">
                      {JSON.stringify(lastWebhookTest.headers, null, 2)}
                    </pre>
                  ) : (
                    <p className="merchant-subcopy">
                      No synthetic signature headers were required for the last test request.
                    </p>
                  )}
                </article>
              </div>
            ) : null}
            {lastNotificationTest ? (
              <div className="provider-list">
                <article className="provider-card">
                  <strong>Last notification test</strong>
                  <p>
                    Delivery status: {lastNotificationTest.delivery?.status ?? "not reported"}
                  </p>
                  <p>
                    {lastNotificationTest.delivery?.detail ??
                      "No delivery detail was returned from the test."}
                  </p>
                  <div className="provider-card-actions">
                    <span
                      className={getReadinessChipClass(
                        lastNotificationTest.delivery?.status === "sent"
                          ? "ready"
                          : lastNotificationTest.delivery?.status === "queued"
                            ? "partial"
                            : "pending",
                      )}
                    >
                      {lastNotificationTest.delivery?.status ?? "unknown"}
                    </span>
                    <span className="provider-badge">
                      {lastNotificationTest.delivery?.target ?? "no-target"}
                    </span>
                  </div>
                </article>
              </div>
            ) : null}
            {providers.length > 0 ? (
              <div className="provider-list">
                {providers.map((item) => (
                  <article className="provider-card" key={item.key}>
                    <strong>{item.displayName}</strong>
                    <p>
                      {item.key} · {item.mode}
                    </p>
                    <div className="provider-card-actions">
                      <button
                        className={item.key === provider?.key ? "primary-button" : "ghost-button"}
                        type="button"
                        onClick={() => void handleProviderChange(item.key)}
                        disabled={isUpdatingProvider || item.key === provider?.key}
                      >
                        {item.key === provider?.key ? "Active provider" : "Use this adapter"}
                      </button>
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => void handleProviderInvoiceSync(item.key)}
                        disabled={isSyncingProviderInvoices}
                      >
                        {isSyncingProviderInvoices ? "Syncing..." : "Sync invoices"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
            {storageBackend ? (
              <div className="provider-list">
                <article className="provider-card">
                  <strong>{storageBackend.displayName}</strong>
                  <p>
                    {storageBackend.key} · {storageBackend.mode}
                  </p>
                  <div className="provider-card-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={() => void handleNotificationTest()}
                      disabled={isTestingNotification}
                    >
                      {isTestingNotification ? "Testing..." : "Test founder alert"}
                    </button>
                  </div>
                </article>
              </div>
            ) : null}
            <div className="provider-list">
              <article className="provider-card">
                <strong>Launch checklist</strong>
                <p>
                  This keeps the remaining production work visible while the local
                  prototype keeps getting stronger.
                </p>
                <div className="provider-card-actions">
                  <span className={getReadinessChipClass("ready")}>Ready</span>
                  <span className={getReadinessChipClass("partial")}>Partial</span>
                  <span className={getReadinessChipClass("pending")}>Pending</span>
                </div>
              </article>
              {readinessItems.map((item) => (
                <article className="provider-card" key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                  <div className="provider-card-actions">
                    <span className={getReadinessChipClass(item.status)}>{item.status}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="provider-list">
              <article className="provider-card">
                <strong>Provider diagnostics</strong>
                <p>
                  These checks break payment-provider readiness into concrete credentials and
                  setup requirements instead of one broad status.
                </p>
              </article>
              {providerDiagnostics.map((item) => (
                <article className="provider-card" key={item.key}>
                  <strong>{item.displayName}</strong>
                  <p>{item.detail}</p>
                  <div className="provider-card-actions">
                    <span className={getReadinessChipClass(item.readiness)}>
                      {item.readiness}
                    </span>
                    <span className="provider-badge">
                      {item.key} · {item.mode}
                    </span>
                  </div>
                  <div className="provider-list">
                    {item.checks.map((check) => (
                      <article className="provider-card" key={check.key}>
                        <strong>{check.label}</strong>
                        <p>{check.detail}</p>
                        <div className="provider-card-actions">
                          <span
                            className={getReadinessChipClass(
                              check.configured ? "ready" : "pending",
                            )}
                          >
                            {check.configured ? "configured" : "missing"}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <div className="provider-list">
              <article className="provider-card">
                <strong>Environment checklist</strong>
                <p>
                  These are the concrete production inputs still needed to move from local
                  prototype to live deployment.
                </p>
              </article>
              {environmentItems.map((item) => (
                <article className="provider-card" key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.detail}</p>
                  <div className="provider-card-actions">
                    <span className={getReadinessChipClass(item.configured ? "ready" : "pending")}>
                      {item.configured ? "configured" : "missing"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
            {runtimeConfig ? (
              <div className="provider-list">
                <article className="provider-card">
                  <strong>Runtime config</strong>
                  <p>port {runtimeConfig.port} · adapter {runtimeConfig.paymentAdapterKey}</p>
                  <p>
                    notify {runtimeConfig.notifyEmailConfigured ? "configured" : "not configured"} ·
                    resend {runtimeConfig.resendConfigured ? " configured" : " not configured"}
                  </p>
                </article>
              </div>
            ) : null}
            {webhookGuides.length > 0 ? (
              <div className="provider-list">
                {webhookGuides.map((guide) => (
                  <article className="provider-card" key={guide.providerKey}>
                    <strong>{guide.displayName} webhook</strong>
                    <p>{guide.endpointPath}</p>
                    {guide.signatureHeader ? (
                      <p className="merchant-subcopy">
                        Signature header: {guide.signatureHeader}
                      </p>
                    ) : null}
                    <pre className="webhook-code-block">
                      {JSON.stringify(guide.samplePayload, null, 2)}
                    </pre>
                    <div className="provider-card-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={() => void handleWebhookTest(guide.providerKey, "payment_detected")}
                        disabled={isTestingWebhook}
                      >
                        Test detected
                      </button>
                      <button
                        className="primary-button"
                        type="button"
                        onClick={() => void handleWebhookTest(guide.providerKey, "payment_confirmed")}
                        disabled={isTestingWebhook}
                      >
                        Test confirmed
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}
