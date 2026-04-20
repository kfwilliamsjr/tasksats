import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServerConfig } from "./config.mjs";
import { getPaymentAdapter, listPaymentAdapters, listWebhookGuides } from "./payments.mjs";
import { createRepositories } from "./repositories.mjs";
import { createStorage } from "./storage.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const config = createServerConfig();
const allowedInvoiceStatuses = new Set(["Open", "Pending", "Paid"]);
const storage = createStorage({
  dataDir,
  defaultPaymentAdapterKey: config.paymentAdapterKey,
});
const repositories = createRepositories(storage);

async function getActivePaymentAdapter() {
  const settings = await repositories.settings.read();
  return getPaymentAdapter(settings.paymentAdapterKey, config);
}

async function readLeads() {
  return storage.leads.read();
}

async function writeLeads(leads) {
  await storage.leads.write(leads);
}

async function readInvoices() {
  return repositories.invoices.list();
}

async function writeInvoices(invoices) {
  await storage.invoices.write(invoices);
}

async function readNotifications() {
  return repositories.notifications.list();
}

async function readSyncHistory() {
  return repositories.syncHistory.list();
}

async function writeNotifications(notifications) {
  await storage.notifications.write(notifications);
}

async function readDeliveries() {
  return repositories.deliveries.list();
}

async function writeDeliveries(deliveries) {
  await storage.deliveries.write(deliveries);
}

async function writeSyncHistory(syncHistory) {
  await storage.syncHistory.write(syncHistory);
}

async function buildSystemExportBundle() {
  const [settings, leads, invoices, notifications, deliveries, syncHistory, paymentAdapter] = await Promise.all([
    repositories.settings.read(),
    readLeads(),
    readInvoices(),
    readNotifications(),
    readDeliveries(),
    readSyncHistory(),
    getActivePaymentAdapter(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    storage: storage.getSummary(),
    config: config.getPublicSummary(),
    paymentProvider: paymentAdapter.getSummary(),
    settings,
    counts: {
      leads: leads.length,
      invoices: invoices.length,
      notifications: notifications.length,
      deliveries: deliveries.length,
      syncHistory: syncHistory.length,
    },
    data: {
      leads,
      invoices,
      notifications,
      deliveries,
      syncHistory,
    },
  };
}

function normalizeImportedCollection(value) {
  return Array.isArray(value) ? value : [];
}

async function buildSystemReadinessReport() {
  const [settings, invoices, deliveries, paymentAdapter] = await Promise.all([
    repositories.settings.read(),
    readInvoices(),
    readDeliveries(),
    getActivePaymentAdapter(),
  ]);
  const btcpayConfigured = Boolean(
    config.btcpayServerUrl &&
      config.btcpayApiKey &&
      config.btcpayStoreId &&
      config.btcpayWebhookSecret,
  );

  const checks = [
    {
      key: "merchant_workflow",
      label: "Merchant workflow",
      status: invoices.length > 0 ? "ready" : "partial",
      detail:
        invoices.length > 0
          ? "Invoices, checkout, filtering, and payment-state controls are working locally."
          : "Core merchant surfaces are built, but seed data is still thin.",
    },
    {
      key: "payment_provider",
      label: "Payment provider integration",
      status:
        paymentAdapter.getSummary().key === "btcpay" && btcpayConfigured
          ? "ready"
          : paymentAdapter.getSummary().mode === "simulation"
          ? "partial"
          : paymentAdapter.getSummary().key === "btcpay"
            ? "partial"
            : paymentAdapter.getSummary().capabilities.includes("webhook-ready")
            ? "partial"
            : "pending",
      detail:
        paymentAdapter.getSummary().key === "btcpay" && btcpayConfigured
          ? "BTCPay credentials are present, so the provider layer is ready for live implementation work."
          : paymentAdapter.getSummary().mode === "simulation"
          ? "Adapter seams are in place, but production Lightning settlement is not wired yet."
          : paymentAdapter.getSummary().key === "btcpay"
            ? "BTCPay is selected, but server URL, API key, store ID, or webhook secret are still missing."
            : "Provider switching and webhook stubs exist, but live payment credentials still need setup.",
    },
    {
      key: "notification_delivery",
      label: "Notification delivery",
      status:
        config.notifyEmail && config.resendApiKey
          ? "ready"
          : config.notifyEmail || config.resendApiKey
            ? "partial"
            : "pending",
      detail:
        config.notifyEmail && config.resendApiKey
          ? "Founder inbox and outbound email provider are configured."
          : "Email delivery is scaffolded, but environment variables still need to be completed.",
    },
    {
      key: "storage_export",
      label: "Storage and export",
      status: "ready",
      detail:
        "Local JSON persistence, repository abstractions, and full-system export are available for backup and migration.",
    },
    {
      key: "launch_environment",
      label: "Launch environment",
      status:
        config.publicBaseUrl &&
        (config.domainCom || config.domainAi) &&
        config.databaseUrl &&
        config.authSecret
          ? "ready"
          : config.publicBaseUrl ||
              config.domainCom ||
              config.domainAi ||
              config.databaseUrl ||
              config.authSecret
            ? "partial"
            : "pending",
      detail:
        "Domain, hosting base URL, auth secret, and database wiring are the remaining launch environment pieces.",
    },
  ];

  const environment = [
    {
      key: "public_base_url",
      label: "Public base URL",
      configured: Boolean(config.publicBaseUrl),
      detail: "Needed so hosted checkout and production links resolve correctly.",
    },
    {
      key: "domain_com",
      label: ".com domain",
      configured: Boolean(config.domainCom),
      detail: "Tracks readiness for tasksats.com launch routing.",
    },
    {
      key: "domain_ai",
      label: ".ai domain",
      configured: Boolean(config.domainAi),
      detail: "Tracks readiness for tasksats.ai launch routing.",
    },
    {
      key: "founder_inbox",
      label: "Founder inbox",
      configured: Boolean(config.notifyEmail),
      detail: "Used for operational delivery and alert routing.",
    },
    {
      key: "email_provider_key",
      label: "Email provider key",
      configured: Boolean(config.resendApiKey),
      detail: "Required for actual outbound notification delivery.",
    },
    {
      key: "btcpay_server_url",
      label: "BTCPay server URL",
      configured: Boolean(config.btcpayServerUrl),
      detail: "Required to point TaskSats at the live BTCPay instance.",
    },
    {
      key: "btcpay_api_key",
      label: "BTCPay API key",
      configured: Boolean(config.btcpayApiKey),
      detail: "Required for authenticated BTCPay invoice and settlement API calls.",
    },
    {
      key: "btcpay_store_id",
      label: "BTCPay store ID",
      configured: Boolean(config.btcpayStoreId),
      detail: "Required to create invoices against the correct BTCPay store.",
    },
    {
      key: "btcpay_webhook_secret",
      label: "BTCPay webhook secret",
      configured: Boolean(config.btcpayWebhookSecret),
      detail: "Required to validate inbound BTCPay webhook authenticity before updating invoices.",
    },
    {
      key: "database_url",
      label: "Database URL",
      configured: Boolean(config.databaseUrl),
      detail: "Required before moving from local JSON into durable production storage.",
    },
    {
      key: "auth_secret",
      label: "Auth secret",
      configured: Boolean(config.authSecret),
      detail: "Needed to harden sign-in and protected merchant surfaces for production.",
    },
  ];

  const score = checks.reduce((total, item) => {
    if (item.status === "ready") {
      return total + 1;
    }

    if (item.status === "partial") {
      return total + 0.5;
    }

    return total;
  }, 0);

  return {
    generatedAt: new Date().toISOString(),
    config: config.getPublicSummary(),
    paymentProvider: paymentAdapter.getSummary(),
    settings,
    metrics: {
      invoices: invoices.length,
      deliveries: deliveries.length,
      failedDeliveries: deliveries.filter(
        (delivery) => delivery.status === "failed" || delivery.status === "skipped",
      ).length,
    },
    summary: {
      percent: Math.round((score / checks.length) * 100),
      readyCount: checks.filter((item) => item.status === "ready").length,
      partialCount: checks.filter((item) => item.status === "partial").length,
      pendingCount: checks.filter((item) => item.status === "pending").length,
    },
    checks,
    environment,
  };
}

function buildPaymentProviderDiagnostics() {
  return [
    {
      key: "demo-lightning",
      displayName: "Demo Lightning Adapter",
      mode: "simulation",
      readiness: "ready",
      detail:
        "The demo adapter is usable immediately for local previews, invoice walkthroughs, and simulated payment-state testing.",
      checks: [
        {
          key: "demo_mode",
          label: "Simulation mode",
          configured: true,
          detail: "No credentials are required for the demo provider path.",
        },
      ],
    },
    {
      key: "btcpay",
      displayName: "BTCPay Stub Adapter",
      mode: "stubbed",
      readiness:
        config.btcpayServerUrl &&
        config.btcpayApiKey &&
        config.btcpayStoreId &&
        config.btcpayWebhookSecret
          ? "ready"
          : config.btcpayServerUrl ||
              config.btcpayApiKey ||
              config.btcpayStoreId ||
              config.btcpayWebhookSecret
            ? "partial"
            : "pending",
      detail:
        config.btcpayServerUrl &&
        config.btcpayApiKey &&
        config.btcpayStoreId &&
        config.btcpayWebhookSecret
          ? "BTCPay credentials are present, so the provider is ready for live API implementation work."
          : "BTCPay is scaffolded, but credentials and webhook hardening still need to be completed.",
      checks: [
        {
          key: "btcpay_server_url",
          label: "Server URL",
          configured: Boolean(config.btcpayServerUrl),
          detail: "Required to point TaskSats at the live BTCPay instance.",
        },
        {
          key: "btcpay_api_key",
          label: "API key",
          configured: Boolean(config.btcpayApiKey),
          detail: "Required for authenticated BTCPay invoice and settlement API calls.",
        },
        {
          key: "btcpay_store_id",
          label: "Store ID",
          configured: Boolean(config.btcpayStoreId),
          detail: "Required to create invoices against the correct BTCPay store.",
        },
        {
          key: "btcpay_webhook_secret",
          label: "Webhook secret",
          configured: Boolean(config.btcpayWebhookSecret),
          detail: "Required to validate inbound BTCPay webhook authenticity before updating invoices.",
        },
      ],
    },
  ];
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function parseJsonBodyWithRaw(request) {
  return new Promise((resolve, reject) => {
    let rawBody = "";

    request.on("data", (chunk) => {
      rawBody += chunk;
    });

    request.on("end", () => {
      if (!rawBody) {
        resolve({ rawBody: "", body: {} });
        return;
      }

      try {
        resolve({
          rawBody,
          body: JSON.parse(rawBody),
        });
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function normalizeLead(input) {
  return {
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: String(input.name ?? "").trim(),
    email: String(input.email ?? "").trim(),
    company: String(input.company ?? "").trim(),
    offer: String(input.offer ?? "").trim(),
    budget: String(input.budget ?? "").trim(),
    details: String(input.details ?? "").trim(),
  };
}

function normalizeInvoice(input) {
  const amountUsd = parseUsdNumber(input.amountUsd);
  const amountBtc = parseBtcNumber(input.amountBtc);
  const normalizedStatus = String(input.status ?? "Open").trim() || "Open";
  const providerKey = String(input.providerKey ?? "demo-lightning").trim() || "demo-lightning";

  return {
    id: `inv_${Date.now()}`,
    createdAt: new Date().toISOString(),
    client: String(input.client ?? "").trim(),
    service: String(input.service ?? "").trim(),
    amountUsd: amountUsd > 0 ? `$${amountUsd.toFixed(2)}` : String(input.amountUsd ?? "").trim(),
    amountBtc:
      amountBtc > 0 ? `${amountBtc.toFixed(8)} BTC` : String(input.amountBtc ?? "").trim(),
    status: allowedInvoiceStatuses.has(normalizedStatus) ? normalizedStatus : "Open",
    providerKey,
    providerInvoiceId: String(input.providerInvoiceId ?? "").trim(),
    hostedCheckoutUrl: String(input.hostedCheckoutUrl ?? "").trim(),
    providerSessionStatus: String(input.providerSessionStatus ?? "").trim(),
  };
}

function validateInvoice(input) {
  const client = String(input.client ?? "").trim();
  const service = String(input.service ?? "").trim();
  const status = String(input.status ?? "Open").trim() || "Open";
  const amountUsd = parseUsdNumber(input.amountUsd);
  const amountBtc = parseBtcNumber(input.amountBtc);

  if (!client) {
    return "client is required";
  }

  if (!service) {
    return "service is required";
  }

  if (amountUsd <= 0) {
    return "amountUsd must be greater than zero";
  }

  if (amountBtc <= 0) {
    return "amountBtc must be greater than zero";
  }

  if (!allowedInvoiceStatuses.has(status)) {
    return "status must be Open, Pending, or Paid";
  }

  return "";
}

function parseUsdNumber(amountUsd) {
  const sanitized = String(amountUsd ?? "").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(sanitized);
  return Number.isFinite(value) ? value : 0;
}

function parseBtcNumber(amountBtc) {
  const sanitized = String(amountBtc ?? "").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(sanitized);
  return Number.isFinite(value) ? value : 0;
}

function buildAuthStatus() {
  return {
    enabled: Boolean(config.authSecret),
    mode: config.authSecret ? "secret-required" : "local-open",
    message: config.authSecret
      ? "Server-backed sign-in requires the configured TaskSats auth secret."
      : "Auth secret is not configured, so local prototype sign-in remains open.",
  };
}

async function readInvoiceById(id) {
  return repositories.invoices.readById(id);
}

function getInvoicePaymentAdapter(invoice, fallbackAdapter) {
  const providerKey = String(invoice?.providerKey ?? "").trim();
  return getPaymentAdapter(providerKey || fallbackAdapter.getSummary().key, config);
}

async function applyInvoiceEvent(invoice, eventName, fallbackAdapter) {
  const paymentAdapter = getInvoicePaymentAdapter(invoice, fallbackAdapter);
  const nextStatus = paymentAdapter.mapCheckoutEventToStatus(eventName, invoice.status);
  const updatedInvoice = await updateInvoiceWithCheckoutState(invoice.id, nextStatus, paymentAdapter);

  if (!updatedInvoice) {
    return null;
  }

  await emitNotificationEvent({
    ...paymentAdapter.buildWebhookReceivedMessage(updatedInvoice, eventName),
    source: "webhook",
    invoiceId: updatedInvoice.id,
    providerKey: updatedInvoice.providerKey,
  });
  await emitNotificationEvent(
    {
      ...paymentAdapter.buildCheckoutEventMessage(updatedInvoice, eventName, nextStatus),
      source: "payment-event",
      invoiceId: updatedInvoice.id,
      providerKey: updatedInvoice.providerKey,
    },
  );

  return {
    invoice: updatedInvoice,
    checkout: paymentAdapter.getCheckout(updatedInvoice),
  };
}

async function updateInvoiceStatus(id, status) {
  return repositories.invoices.updateStatus(id, status);
}

async function updateInvoice(id, patch) {
  return repositories.invoices.update(id, patch);
}

async function updateInvoiceWithCheckoutState(id, status, paymentAdapter) {
  const statusUpdatedInvoice = await updateInvoiceStatus(id, status);

  if (!statusUpdatedInvoice) {
    return null;
  }

  const checkout = paymentAdapter.getCheckout(statusUpdatedInvoice);
  return updateInvoice(id, {
    providerInvoiceId: String(checkout.providerInvoiceId ?? "").trim(),
    hostedCheckoutUrl: String(checkout.hostedCheckoutUrl ?? checkout.walletUrl ?? "").trim(),
    providerSessionStatus: String(checkout.providerSessionStatus ?? "").trim(),
  });
}

async function syncInvoiceWithProvider(invoice, fallbackAdapter) {
  const paymentAdapter = getInvoicePaymentAdapter(invoice, fallbackAdapter);
  const syncResult = paymentAdapter.syncInvoice?.(invoice) ?? {};
  const updatedInvoice = await updateInvoice(invoice.id, {
    providerInvoiceId: String(syncResult.providerInvoiceId ?? invoice.providerInvoiceId ?? "").trim(),
    hostedCheckoutUrl: String(syncResult.hostedCheckoutUrl ?? invoice.hostedCheckoutUrl ?? "").trim(),
    providerSessionStatus: String(
      syncResult.providerSessionStatus ?? invoice.providerSessionStatus ?? "",
    ).trim(),
  });

  if (!updatedInvoice) {
    return null;
  }

  const detail = String(syncResult.syncDetail ?? "").trim();
  await createSyncHistoryRecord({
    invoiceId: updatedInvoice.id,
    providerKey: updatedInvoice.providerKey,
    invoiceStatus: updatedInvoice.status,
    providerSessionStatus: updatedInvoice.providerSessionStatus,
    syncStatus: String(syncResult.syncStatus ?? "synced").trim() || "synced",
    detail,
    scope: "invoice",
  });
  await emitNotificationEvent({
    type: "provider_sync",
    title: `Provider sync completed for ${updatedInvoice.client}`,
    body: detail || `${updatedInvoice.id} was re-synced through the ${paymentAdapter.displayName} provider seam.`,
    source: "provider-sync",
    invoiceId: updatedInvoice.id,
    providerKey: updatedInvoice.providerKey,
  });

  return {
    invoice: updatedInvoice,
    checkout: paymentAdapter.getCheckout(updatedInvoice),
    sync: {
      status: String(syncResult.syncStatus ?? "synced").trim() || "synced",
      detail,
    },
    provider: paymentAdapter.getSummary(),
  };
}

async function syncInvoicesForProvider(providerKey = "") {
  const activePaymentAdapter = await getActivePaymentAdapter();
  const invoices = await readInvoices();
  const normalizedProviderKey = String(providerKey ?? "").trim();
  const targetInvoices = normalizedProviderKey
    ? invoices.filter((invoice) => String(invoice.providerKey ?? "").trim() === normalizedProviderKey)
    : invoices;
  const synced = [];

  for (const invoice of targetInvoices) {
    const result = await syncInvoiceWithProvider(invoice, activePaymentAdapter);

    if (result?.invoice) {
      synced.push({
        id: result.invoice.id,
        providerKey: result.invoice.providerKey,
        status: result.invoice.status,
        providerSessionStatus: result.invoice.providerSessionStatus,
        syncStatus: result.sync?.status ?? "synced",
      });
    }
  }

  return {
    syncedCount: synced.length,
    requestedCount: targetInvoices.length,
    providerKey: normalizedProviderKey || "all",
    synced,
  };
}

function buildProvisionedInvoice(invoice, paymentAdapter) {
  const provisionedState = paymentAdapter.provisionInvoice?.(invoice) ?? {};
  return {
    ...invoice,
    providerInvoiceId: String(
      provisionedState.providerInvoiceId ?? invoice.providerInvoiceId ?? "",
    ).trim(),
    hostedCheckoutUrl: String(
      provisionedState.hostedCheckoutUrl ?? invoice.hostedCheckoutUrl ?? "",
    ).trim(),
    providerSessionStatus: String(
      provisionedState.providerSessionStatus ?? invoice.providerSessionStatus ?? "",
    ).trim(),
  };
}

async function createNotification(input) {
  return repositories.notifications.create(input);
}

async function createSyncHistoryRecord(input) {
  return repositories.syncHistory.create(input);
}

async function createDeliveryRecord(input) {
  return repositories.deliveries.create(input);
}

async function updateDeliveryRecord(id, patch) {
  return repositories.deliveries.update(id, patch);
}

async function sendEmailDelivery({ subject, body }) {
  if (!config.notifyEmail) {
    return { status: "skipped", detail: "TASKSATS_NOTIFY_EMAIL is not configured" };
  }

  if (!config.resendApiKey) {
    return { status: "queued", detail: "RESEND_API_KEY is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TaskSats <notifications@tasksats.com>",
      to: [config.notifyEmail],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { status: "failed", detail };
  }

  return { status: "sent", detail: `Delivered to ${config.notifyEmail}` };
}

async function emitNotificationEvent({
  type,
  title,
  body,
  source = "",
  invoiceId = "",
  providerKey = "",
}) {
  const notification = await createNotification({
    type,
    title,
    body,
    source,
    invoiceId,
    providerKey,
  });
  const delivery = await createDeliveryRecord({
    notificationId: notification.id,
    target: config.notifyEmail || "not-configured",
    subject: title,
    body,
    status: "queued",
    detail: "Waiting for provider configuration",
    source,
    invoiceId,
    providerKey,
  });

  const deliveryResult = await sendEmailDelivery({ subject: title, body });
  await updateDeliveryRecord(delivery.id, deliveryResult);
  return notification;
}

async function sendNotificationTest() {
  const notification = await emitNotificationEvent({
    type: "notification_test",
    title: "TaskSats notification test",
    body:
      "This is a test delivery from the TaskSats operations dashboard so founder alert routing can be verified before launch.",
    source: "notification-test",
  });

  const deliveries = await readDeliveries();
  const delivery =
    deliveries.find((item) => item.notificationId === notification.id) ?? null;

  return {
    notification,
    delivery,
    config: {
      notifyEmailConfigured: Boolean(config.notifyEmail),
      resendConfigured: Boolean(config.resendApiKey),
    },
  };
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (requestUrl.pathname === "/api/health" && request.method === "GET") {
    const paymentAdapter = await getActivePaymentAdapter();
    sendJson(response, 200, {
      ok: true,
      config: config.getPublicSummary(),
      auth: buildAuthStatus(),
      storage: storage.getSummary(),
      paymentProvider: paymentAdapter.getSummary(),
      availablePaymentProviders: listPaymentAdapters(config),
    });
    return;
  }

  if (requestUrl.pathname === "/api/auth/status" && request.method === "GET") {
    sendJson(response, 200, { auth: buildAuthStatus() });
    return;
  }

  if (requestUrl.pathname === "/api/auth/signin" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const name = String(body.name ?? "").trim() || "TaskSats User";
      const email = String(body.email ?? "").trim();
      const role = String(body.role ?? "merchant").trim() || "merchant";
      const passphrase = String(body.passphrase ?? "").trim();
      const auth = buildAuthStatus();

      if (!email) {
        sendJson(response, 400, { error: "email is required" });
        return;
      }

      if (!["merchant", "admin"].includes(role)) {
        sendJson(response, 400, { error: "role must be merchant or admin" });
        return;
      }

      if (config.authSecret && passphrase !== config.authSecret) {
        sendJson(response, 401, {
          error: "invalid auth secret",
          auth,
        });
        return;
      }

      sendJson(response, 200, {
        auth,
        session: {
          name,
          email,
          role,
          verifiedByServer: true,
          verifiedAt: new Date().toISOString(),
        },
      });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/system/storage" && request.method === "GET") {
    sendJson(response, 200, { storage: storage.getSummary() });
    return;
  }

  if (requestUrl.pathname === "/api/system/export" && request.method === "GET") {
    const bundle = await buildSystemExportBundle();
    sendJson(response, 200, { exportBundle: bundle });
    return;
  }

  if (requestUrl.pathname === "/api/system/import" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const importData =
        body && typeof body === "object" && body.data && typeof body.data === "object"
          ? body.data
          : body;

      await Promise.all([
        writeLeads(normalizeImportedCollection(importData.leads)),
        writeInvoices(normalizeImportedCollection(importData.invoices)),
        writeNotifications(normalizeImportedCollection(importData.notifications)),
        writeDeliveries(normalizeImportedCollection(importData.deliveries)),
        writeSyncHistory(normalizeImportedCollection(importData.syncHistory)),
      ]);

      if (body.settings && typeof body.settings === "object") {
        await repositories.settings.write(body.settings);
      }

      const exportBundle = await buildSystemExportBundle();
      sendJson(response, 200, {
        ok: true,
        importedAt: new Date().toISOString(),
        counts: exportBundle.counts,
        settings: exportBundle.settings,
      });
    } catch {
      sendJson(response, 400, { error: "system import failed" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/system/readiness" && request.method === "GET") {
    const readiness = await buildSystemReadinessReport();
    sendJson(response, 200, { readiness });
    return;
  }

  if (requestUrl.pathname === "/api/payments/provider" && request.method === "GET") {
    const paymentAdapter = await getActivePaymentAdapter();
    sendJson(response, 200, {
      provider: paymentAdapter.getSummary(),
      providers: listPaymentAdapters(config),
      webhookGuides: listWebhookGuides(config),
    });
    return;
  }

  if (requestUrl.pathname === "/api/payments/webhooks" && request.method === "GET") {
    sendJson(response, 200, { webhookGuides: listWebhookGuides(config) });
    return;
  }

  if (requestUrl.pathname === "/api/payments/diagnostics" && request.method === "GET") {
    sendJson(response, 200, { diagnostics: buildPaymentProviderDiagnostics() });
    return;
  }

  if (requestUrl.pathname === "/api/payments/provider" && request.method === "PATCH") {
    try {
      const body = await parseJsonBody(request);
      const nextKey = String(body.key ?? "").trim();
      const nextAdapter = getPaymentAdapter(nextKey, config);
      const settings = await storage.settings.read();
      const nextSettings = {
        ...settings,
        paymentAdapterKey: nextAdapter.getSummary().key,
      };

      await storage.settings.write(nextSettings);
      sendJson(response, 200, {
        provider: nextAdapter.getSummary(),
        providers: listPaymentAdapters(config),
      });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/payments/webhooks/") && request.method === "POST") {
    const providerKey = requestUrl.pathname.replace("/api/payments/webhooks/", "").trim();

    try {
      const { body, rawBody } = await parseJsonBodyWithRaw(request);
      const paymentAdapter = getPaymentAdapter(providerKey, config);
      const verification = paymentAdapter.verifyWebhook?.({
        headers: request.headers,
        rawBody,
        payload: body,
      }) ?? { verified: true, reason: "not-applicable" };

      if (!verification.verified) {
        sendJson(response, 401, {
          error: "webhook signature could not be verified",
          reason: verification.reason,
          provider: paymentAdapter.getSummary(),
        });
        return;
      }

      const parsed = paymentAdapter.parseWebhookEvent(body);

      if (!parsed.acknowledged || !parsed.invoiceId || !parsed.event) {
        sendJson(response, 400, { error: "webhook event could not be matched to an invoice" });
        return;
      }

      const invoice = await readInvoiceById(parsed.invoiceId);

      if (!invoice) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      const result = await applyInvoiceEvent(invoice, parsed.event, paymentAdapter);

      if (!result) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      sendJson(response, 200, {
        ok: true,
        source: parsed.source,
        verification: verification.reason,
        provider: paymentAdapter.getSummary(),
        invoice: result.invoice,
        checkout: result.checkout,
      });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/payments/webhooks-test/") && request.method === "POST") {
    const providerKey = requestUrl.pathname.replace("/api/payments/webhooks-test/", "").trim();

    try {
      const body = await parseJsonBody(request);
      const paymentAdapter = getPaymentAdapter(providerKey, config);
      const invoiceId = String(body.invoiceId ?? "").trim();
      const eventName = String(body.event ?? "payment_confirmed").trim();

      if (!invoiceId) {
        sendJson(response, 400, { error: "invoiceId is required" });
        return;
      }

      const testRequest = paymentAdapter.buildTestWebhookRequest?.(invoiceId, eventName) ?? {
        payload: paymentAdapter.buildTestWebhookPayload(invoiceId, eventName),
        headers: {},
      };
      const rawBody = JSON.stringify(testRequest.payload);
      const verification = paymentAdapter.verifyWebhook?.({
        headers: testRequest.headers,
        rawBody,
        payload: testRequest.payload,
      }) ?? { verified: true, reason: "not-applicable" };

      if (!verification.verified) {
        sendJson(response, 401, {
          error: "test webhook signature could not be verified",
          reason: verification.reason,
          provider: paymentAdapter.getSummary(),
        });
        return;
      }

      const payload = testRequest.payload;
      const parsed = paymentAdapter.parseWebhookEvent(payload);

      if (!parsed.acknowledged || !parsed.invoiceId || !parsed.event) {
        sendJson(response, 400, { error: "test webhook payload could not be matched to an invoice" });
        return;
      }

      const invoice = await readInvoiceById(parsed.invoiceId);

      if (!invoice) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      const result = await applyInvoiceEvent(invoice, parsed.event, paymentAdapter);

      if (!result) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      sendJson(response, 200, {
        ok: true,
        mode: "test",
        payload,
        headers: testRequest.headers,
        verification: verification.reason,
        provider: paymentAdapter.getSummary(),
        invoice: result.invoice,
        checkout: result.checkout,
      });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/leads" && request.method === "GET") {
    const leads = await readLeads();
    sendJson(response, 200, { leads });
    return;
  }

  if (requestUrl.pathname === "/api/leads" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const normalized = normalizeLead(body);

      if (!normalized.name || !normalized.email || !normalized.details) {
        sendJson(response, 400, {
          error: "name, email, and details are required",
        });
        return;
      }

      const current = await readLeads();
      const next = [normalized, ...current];
      await writeLeads(next);
      await emitNotificationEvent({
        type: "lead_created",
        title: `New lead from ${normalized.name}`,
        body: `${normalized.email} submitted a request for ${normalized.offer || "a custom request"}.`,
        source: "lead-form",
      });
      sendJson(response, 201, { lead: normalized });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/notifications" && request.method === "GET") {
    const notifications = await readNotifications();
    sendJson(response, 200, { notifications });
    return;
  }

  if (requestUrl.pathname === "/api/notifications/test" && request.method === "POST") {
    try {
      const result = await sendNotificationTest();
      sendJson(response, 200, {
        ok: true,
        ...result,
      });
    } catch {
      sendJson(response, 400, { error: "notification test failed" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/sync-history" && request.method === "GET") {
    const syncHistory = await readSyncHistory();
    sendJson(response, 200, { syncHistory });
    return;
  }

  if (requestUrl.pathname === "/api/deliveries" && request.method === "GET") {
    const deliveries = await readDeliveries();
    sendJson(response, 200, { deliveries });
    return;
  }

  if (requestUrl.pathname === "/api/invoices" && request.method === "GET") {
    const invoices = await readInvoices();
    sendJson(response, 200, { invoices });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/invoices/") && request.method === "GET") {
    const id = requestUrl.pathname.replace("/api/invoices/", "").trim();

    if (id.endsWith("/checkout")) {
      const activePaymentAdapter = await getActivePaymentAdapter();
      const invoiceId = id.replace("/checkout", "").trim();
      const invoice = await readInvoiceById(invoiceId);

      if (!invoice) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      const paymentAdapter = getInvoicePaymentAdapter(invoice, activePaymentAdapter);
      sendJson(response, 200, { checkout: paymentAdapter.getCheckout(invoice) });
      return;
    }

    const invoice = await readInvoiceById(id);

    if (!invoice) {
      sendJson(response, 404, { error: "invoice not found" });
      return;
    }

    sendJson(response, 200, { invoice });
    return;
  }

  if (requestUrl.pathname === "/api/invoices" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const paymentAdapter = await getActivePaymentAdapter();
      const validationError = validateInvoice(body);

      if (validationError) {
        sendJson(response, 400, { error: validationError });
        return;
      }

      const normalized = normalizeInvoice({
        ...body,
        providerKey: paymentAdapter.getSummary().key,
      });
      const invoiceWithCheckout = buildProvisionedInvoice(normalized, paymentAdapter);

      const current = await readInvoices();
      const next = [invoiceWithCheckout, ...current];
      await writeInvoices(next);
      await emitNotificationEvent({
        ...paymentAdapter.buildInvoiceCreatedMessage(invoiceWithCheckout),
        source: "invoice-create",
        invoiceId: invoiceWithCheckout.id,
        providerKey: invoiceWithCheckout.providerKey,
      });
      sendJson(response, 201, { invoice: invoiceWithCheckout });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/invoices/provider-sync" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const providerKey = String(body.providerKey ?? "").trim();
      const result = await syncInvoicesForProvider(providerKey);
      sendJson(response, 200, result);
    } catch {
      sendJson(response, 400, { error: "provider batch sync failed" });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/invoices/") && request.method === "PATCH") {
    const id = requestUrl.pathname.replace("/api/invoices/", "").trim();

    try {
      const body = await parseJsonBody(request);
      const activePaymentAdapter = await getActivePaymentAdapter();
      const invoice = await updateInvoiceStatus(id, body.status);

      if (!invoice) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      const paymentAdapter = getInvoicePaymentAdapter(invoice, activePaymentAdapter);
      await emitNotificationEvent({
        ...paymentAdapter.buildStatusUpdateMessage(invoice),
        source: "invoice-status-update",
        invoiceId: invoice.id,
        providerKey: invoice.providerKey,
      });
      sendJson(response, 200, { invoice });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/invoices/") && request.method === "POST") {
    const pathParts = requestUrl.pathname.split("/").filter(Boolean);
    const invoiceId = pathParts[2];
    const action = pathParts[3];

    if (action === "checkout-events") {
      try {
        const body = await parseJsonBody(request);
        const activePaymentAdapter = await getActivePaymentAdapter();
        const existingInvoice = await readInvoiceById(invoiceId);

        if (!existingInvoice) {
          sendJson(response, 404, { error: "invoice not found" });
          return;
        }

        const result = await applyInvoiceEvent(existingInvoice, body.event, activePaymentAdapter);

        if (!result) {
          sendJson(response, 404, { error: "invoice not found" });
          return;
        }

        sendJson(response, 200, {
          invoice: result.invoice,
          checkout: result.checkout,
        });
      } catch {
        sendJson(response, 400, { error: "invalid json payload" });
      }
      return;
    }

    if (action === "provider-sync") {
      try {
        const activePaymentAdapter = await getActivePaymentAdapter();
        const existingInvoice = await readInvoiceById(invoiceId);

        if (!existingInvoice) {
          sendJson(response, 404, { error: "invoice not found" });
          return;
        }

        const result = await syncInvoiceWithProvider(existingInvoice, activePaymentAdapter);

        if (!result) {
          sendJson(response, 404, { error: "invoice not found" });
          return;
        }

        sendJson(response, 200, result);
      } catch {
        sendJson(response, 400, { error: "provider sync failed" });
      }
      return;
    }
  }

  sendJson(response, 404, { error: "not found" });
});

server.listen(config.port, () => {
  console.log(`TaskSats API listening on http://localhost:${config.port}`);
});
