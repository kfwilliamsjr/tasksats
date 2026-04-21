import { validateInvoiceDraft } from "./pricing";

export type InvoiceRecord = {
  id: string;
  createdAt: string;
  client: string;
  service: string;
  amountUsd: string;
  amountBtc: string;
  status: string;
  sourceLeadId?: string;
  providerKey?: string;
  providerInvoiceId?: string;
  hostedCheckoutUrl?: string;
  providerSessionStatus?: string;
};

export type InvoiceCheckout = {
  provider?: PaymentProviderSummary;
  invoiceId: string;
  providerInvoiceId?: string;
  hostedCheckoutUrl?: string;
  providerSessionStatus?: string;
  status: string;
  amountUsd: string;
  amountBtc: string;
  usdValue: number;
  btcValue: number;
  satsAmount: number;
  expiresAt: string;
  network: string;
  paymentUri: string;
  walletUrl: string;
  lightningInvoice: string;
  lightningAddress: string;
  checkoutTitle?: string;
  checkoutDescription?: string;
  invoiceCodeLabel?: string;
  walletActionLabel?: string;
  detectionActionLabel?: string;
};

export type PaymentProviderSummary = {
  key: string;
  displayName: string;
  mode: string;
  capabilities: string[];
};

export type PaymentProviderResponse = {
  provider: PaymentProviderSummary | null;
  providers: PaymentProviderSummary[];
  webhookGuides?: WebhookGuide[];
};

export type StorageBackendSummary = {
  key: string;
  displayName: string;
  mode: string;
  capabilities: string[];
};

export type RuntimeConfigSummary = {
  port: number;
  paymentAdapterKey: string;
  notifyEmailConfigured: boolean;
  resendConfigured: boolean;
  publicBaseUrlConfigured?: boolean;
  domainComConfigured?: boolean;
  domainAiConfigured?: boolean;
  databaseConfigured?: boolean;
  authSecretConfigured?: boolean;
  btcpayServerConfigured?: boolean;
  btcpayApiKeyConfigured?: boolean;
  btcpayStoreConfigured?: boolean;
};

export type BusinessSettings = {
  paymentAdapterKey?: string;
  businessName?: string;
  primaryDomain?: string;
  secondaryDomain?: string;
  founderEmail?: string;
  supportEmail?: string;
  launchMode?: string;
  defaultInvoiceNote?: string;
};

export type SystemExportBundle = {
  exportedAt: string;
  storage: StorageBackendSummary;
  config: RuntimeConfigSummary;
  paymentProvider: PaymentProviderSummary;
  settings: {
    paymentAdapterKey?: string;
  };
  counts: {
    leads: number;
    invoices: number;
    notifications: number;
    deliveries: number;
    syncHistory?: number;
  };
  data: {
    leads: Array<Record<string, unknown>>;
    invoices: Array<Record<string, unknown>>;
    notifications: Array<Record<string, unknown>>;
    deliveries: Array<Record<string, unknown>>;
    syncHistory?: Array<Record<string, unknown>>;
  };
};

export type ReadinessStatus = "ready" | "partial" | "pending";

export type ReadinessCheck = {
  key: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
};

export type EnvironmentCheck = {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
};

export type SystemReadinessReport = {
  generatedAt: string;
  config: RuntimeConfigSummary;
  paymentProvider: PaymentProviderSummary;
  settings: {
    paymentAdapterKey?: string;
  };
  metrics: {
    invoices: number;
    deliveries: number;
    failedDeliveries: number;
  };
  summary: {
    percent: number;
    readyCount: number;
    partialCount: number;
    pendingCount: number;
  };
  checks: ReadinessCheck[];
  environment: EnvironmentCheck[];
};

export type SystemImportResult = {
  ok: boolean;
  importedAt: string;
  counts: {
    leads: number;
    invoices: number;
    notifications: number;
    deliveries: number;
    syncHistory?: number;
  };
  settings?: {
    paymentAdapterKey?: string;
  };
};

export type ProviderDiagnosticCheck = {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
};

export type PaymentProviderDiagnostic = {
  key: string;
  displayName: string;
  mode: string;
  readiness: ReadinessStatus;
  detail: string;
  checks: ProviderDiagnosticCheck[];
};

export type WebhookGuide = {
  providerKey: string;
  displayName: string;
  endpointPath: string;
  signatureHeader?: string;
  samplePayload: Record<string, unknown>;
};

export type WebhookTestResult = {
  ok: boolean;
  mode: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  verification?: string;
};

export type ProviderSyncResult = {
  invoice: InvoiceRecord | null;
  checkout: InvoiceCheckout | null;
  provider?: PaymentProviderSummary | null;
  sync?: {
    status: string;
    detail: string;
  };
};

export type ProviderBatchSyncResult = {
  syncedCount: number;
  requestedCount: number;
  providerKey: string;
  synced: Array<{
    id: string;
    providerKey?: string;
    status: string;
    providerSessionStatus?: string;
    syncStatus: string;
  }>;
};

export type SyncHistoryRecord = {
  id: string;
  createdAt: string;
  invoiceId: string;
  providerKey: string;
  invoiceStatus: string;
  providerSessionStatus: string;
  syncStatus: string;
  detail: string;
  scope: string;
};

export type CheckoutEventName =
  | "checkout_opened"
  | "payment_detected"
  | "payment_confirmed";

const INVOICES_STORAGE_KEY = "tasksats_phase1_invoices";
const API_BASE_URL = "http://localhost:4175/api";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStoredInvoices(): InvoiceRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(INVOICES_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as InvoiceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchInvoices(): Promise<InvoiceRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`);

    if (!response.ok) {
      throw new Error("Invoice fetch failed");
    }

    const payload = (await response.json()) as { invoices?: InvoiceRecord[] };
    const invoices = Array.isArray(payload.invoices) ? payload.invoices : [];

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return invoices;
  } catch {
    return getStoredInvoices();
  }
}

export async function fetchInvoiceById(id: string): Promise<InvoiceRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`);

    if (!response.ok) {
      throw new Error("Invoice fetch failed");
    }

    const payload = (await response.json()) as { invoice?: InvoiceRecord };
    return payload.invoice ?? null;
  } catch {
    const invoices = getStoredInvoices();
    return invoices.find((invoice) => invoice.id === id) ?? null;
  }
}

export async function fetchInvoiceCheckout(id: string): Promise<InvoiceCheckout | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/checkout`);

    if (!response.ok) {
      throw new Error("Checkout fetch failed");
    }

    const payload = (await response.json()) as { checkout?: InvoiceCheckout };
    return payload.checkout ?? null;
  } catch {
    const invoice = await fetchInvoiceById(id);

    if (!invoice) {
      return null;
    }

    const btcValue = Number.parseFloat(invoice.amountBtc.replace(/[^0-9.]/g, "")) || 0;
    const usdValue = Number.parseFloat(invoice.amountUsd.replace(/[^0-9.]/g, "")) || 0;
    const satsAmount = Math.max(1, Math.round(btcValue * 100_000_000));
    const invoiceLabel = encodeURIComponent(`TaskSats Invoice ${invoice.id}`);
    const serviceLabel = encodeURIComponent(invoice.service || "TaskSats invoice");

    return {
      provider: {
        key: "demo-lightning",
        displayName: "Demo Lightning Adapter",
        mode: "simulation",
        capabilities: [
          "hosted-checkout",
          "lightning-invoice",
          "wallet-uri",
          "simulated-events",
        ],
      },
      invoiceId: invoice.id,
      providerInvoiceId: `demo-${invoice.id}`,
      hostedCheckoutUrl: `bitcoin:?amount=${btcValue.toFixed(8)}&label=${invoiceLabel}&message=${serviceLabel}`,
      providerSessionStatus: "simulated",
      status: invoice.status,
      amountUsd: invoice.amountUsd,
      amountBtc: invoice.amountBtc,
      usdValue,
      btcValue,
      satsAmount,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      network: "bitcoin-lightning",
      paymentUri: `bitcoin:?amount=${btcValue.toFixed(8)}&label=${invoiceLabel}&message=${serviceLabel}`,
      walletUrl: `bitcoin:?amount=${btcValue.toFixed(8)}&label=${invoiceLabel}&message=${serviceLabel}`,
      lightningInvoice: `ln-demo-${invoice.id.toLowerCase()}-${satsAmount}`,
      lightningAddress: `pay+${invoice.id.toLowerCase()}@tasksats.com`,
      checkoutTitle: "Lightning checkout",
      checkoutDescription:
        "TaskSats demo mode keeps the flow simple for testing wallet opens, invoice copying, and simulated payment events.",
      invoiceCodeLabel: "Lightning invoice",
      walletActionLabel: "Open demo wallet",
      detectionActionLabel: "Simulate payment detected",
    };
  }
}

function getFallbackProviders(): PaymentProviderSummary[] {
  return [
    {
      key: "demo-lightning",
      displayName: "Demo Lightning Adapter",
      mode: "simulation",
      capabilities: [
        "hosted-checkout",
        "lightning-invoice",
        "wallet-uri",
        "simulated-events",
      ],
    },
    {
      key: "btcpay",
      displayName: "BTCPay Stub Adapter",
      mode: "stubbed",
      capabilities: [
        "hosted-checkout",
        "lightning-invoice",
        "wallet-uri",
        "webhook-ready",
        "provider-swap",
      ],
    },
  ];
}

export async function fetchPaymentProvider(): Promise<PaymentProviderResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/provider`);

    if (!response.ok) {
      throw new Error("Provider fetch failed");
    }

    const payload = (await response.json()) as {
      provider?: PaymentProviderSummary;
      providers?: PaymentProviderSummary[];
    };
    return {
      provider: payload.provider ?? null,
      providers: Array.isArray(payload.providers) ? payload.providers : [],
      webhookGuides: Array.isArray(payload.webhookGuides) ? payload.webhookGuides : [],
    };
  } catch {
    const providers = getFallbackProviders();
    return {
      provider: providers[0] ?? null,
      providers,
      webhookGuides: [],
    };
  }
}

export async function updatePaymentProvider(
  key: string,
): Promise<PaymentProviderResponse> {
  const response = await fetch(`${API_BASE_URL}/payments/provider`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ key }),
  });

  if (!response.ok) {
    throw new Error("Provider update failed");
  }

  const payload = (await response.json()) as {
    provider?: PaymentProviderSummary;
    providers?: PaymentProviderSummary[];
  };

  return {
    provider: payload.provider ?? null,
    providers: Array.isArray(payload.providers) ? payload.providers : [],
    webhookGuides: Array.isArray(payload.webhookGuides) ? payload.webhookGuides : [],
  };
}

export async function fetchWebhookGuides(): Promise<WebhookGuide[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/webhooks`);

    if (!response.ok) {
      throw new Error("Webhook guide fetch failed");
    }

    const payload = (await response.json()) as { webhookGuides?: WebhookGuide[] };
    return Array.isArray(payload.webhookGuides) ? payload.webhookGuides : [];
  } catch {
    return [];
  }
}

export async function triggerWebhookTest(
  providerKey: string,
  invoiceId: string,
  event: string,
): Promise<WebhookTestResult> {
  const response = await fetch(`${API_BASE_URL}/payments/webhooks-test/${providerKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ invoiceId, event }),
  });

  if (!response.ok) {
    throw new Error("Webhook test failed");
  }

  return (await response.json()) as WebhookTestResult;
}

export async function fetchStorageBackend(): Promise<StorageBackendSummary | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/system/storage`);

    if (!response.ok) {
      throw new Error("Storage fetch failed");
    }

    const payload = (await response.json()) as { storage?: StorageBackendSummary };
    return payload.storage ?? null;
  } catch {
    return {
      key: "json-local",
      displayName: "Local JSON Storage",
      mode: "file-backed",
      capabilities: [
        "local-persistence",
        "single-workspace",
        "database-ready-abstraction",
      ],
    };
  }
}

export async function fetchRuntimeConfig(): Promise<RuntimeConfigSummary | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error("Runtime config fetch failed");
    }

    const payload = (await response.json()) as { config?: RuntimeConfigSummary };
    return payload.config ?? null;
  } catch {
    return {
      port: 4175,
      paymentAdapterKey: "demo-lightning",
      notifyEmailConfigured: false,
      resendConfigured: false,
      publicBaseUrlConfigured: false,
      domainComConfigured: false,
      domainAiConfigured: false,
      databaseConfigured: false,
      authSecretConfigured: false,
      btcpayServerConfigured: false,
      btcpayApiKeyConfigured: false,
      btcpayStoreConfigured: false,
    };
  }
}

export async function fetchSystemExportBundle(): Promise<SystemExportBundle | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/system/export`);

    if (!response.ok) {
      throw new Error("System export fetch failed");
    }

    const payload = (await response.json()) as { exportBundle?: SystemExportBundle };
    return payload.exportBundle ?? null;
  } catch {
    return null;
  }
}

export async function fetchBusinessSettings(): Promise<BusinessSettings | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/settings`);

    if (!response.ok) {
      throw new Error("Settings fetch failed");
    }

    const payload = (await response.json()) as { settings?: BusinessSettings };
    return payload.settings ?? null;
  } catch {
    return null;
  }
}

export async function updateBusinessSettings(
  input: BusinessSettings,
): Promise<BusinessSettings> {
  const response = await fetch(`${API_BASE_URL}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Settings update failed");
  }

  const payload = (await response.json()) as { settings?: BusinessSettings };
  return payload.settings ?? input;
}

export async function importSystemBundle(
  bundle: Record<string, unknown>,
): Promise<SystemImportResult> {
  const response = await fetch(`${API_BASE_URL}/system/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bundle),
  });

  if (!response.ok) {
    throw new Error("System import failed");
  }

  return (await response.json()) as SystemImportResult;
}

export async function fetchSystemReadinessReport(): Promise<SystemReadinessReport | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/system/readiness`);

    if (!response.ok) {
      throw new Error("System readiness fetch failed");
    }

    const payload = (await response.json()) as { readiness?: SystemReadinessReport };
    return payload.readiness ?? null;
  } catch {
    return null;
  }
}

export async function fetchPaymentProviderDiagnostics(): Promise<PaymentProviderDiagnostic[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/diagnostics`);

    if (!response.ok) {
      throw new Error("Provider diagnostics fetch failed");
    }

    const payload = (await response.json()) as {
      diagnostics?: PaymentProviderDiagnostic[];
    };
    return Array.isArray(payload.diagnostics) ? payload.diagnostics : [];
  } catch {
    return [];
  }
}

export async function sendCheckoutEvent(
  id: string,
  event: CheckoutEventName,
): Promise<{ invoice: InvoiceRecord | null; checkout: InvoiceCheckout | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}/checkout-events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ event }),
    });

    if (!response.ok) {
      throw new Error("Checkout event failed");
    }

    const payload = (await response.json()) as {
      invoice?: InvoiceRecord;
      checkout?: InvoiceCheckout;
    };
    const invoices = await fetchInvoices();

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return {
      invoice: payload.invoice ?? null,
      checkout: payload.checkout ?? null,
    };
  } catch {
    const updatedStatus =
      event === "payment_confirmed" ? "Paid" : "Pending";
    const invoice = await updateInvoiceStatus(id, updatedStatus);
    const checkout = await fetchInvoiceCheckout(id);
    return { invoice, checkout };
  }
}

export async function syncInvoiceProvider(id: string): Promise<ProviderSyncResult> {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}/provider-sync`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Provider sync failed");
  }

  return (await response.json()) as ProviderSyncResult;
}

export async function syncInvoicesByProvider(
  providerKey = "",
): Promise<ProviderBatchSyncResult> {
  const response = await fetch(`${API_BASE_URL}/invoices/provider-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ providerKey }),
  });

  if (!response.ok) {
    throw new Error("Provider batch sync failed");
  }

  const result = (await response.json()) as ProviderBatchSyncResult;
  const invoices = await fetchInvoices();

  if (canUseStorage()) {
    window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
  }

  return result;
}

export async function fetchSyncHistory(): Promise<SyncHistoryRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/sync-history`);

    if (!response.ok) {
      throw new Error("Sync history fetch failed");
    }

    const payload = (await response.json()) as { syncHistory?: SyncHistoryRecord[] };
    return Array.isArray(payload.syncHistory) ? payload.syncHistory : [];
  } catch {
    return [];
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
): Promise<InvoiceRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Invoice update failed");
    }

    const payload = (await response.json()) as { invoice?: InvoiceRecord };
    const invoices = await fetchInvoices();

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return payload.invoice ?? null;
  } catch {
    if (!canUseStorage()) {
      return null;
    }

    const invoices = getStoredInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);

    if (index === -1) {
      return null;
    }

    const nextInvoice = { ...invoices[index], status };
    const nextInvoices = [...invoices];
    nextInvoices[index] = nextInvoice;
    window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(nextInvoices));
    return nextInvoice;
  }
}

export async function saveInvoice(
  input: Omit<InvoiceRecord, "id" | "createdAt">,
): Promise<InvoiceRecord> {
  const validationError = validateInvoiceDraft(input);

  if (validationError) {
    throw new Error(validationError);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Invoice save failed");
    }

    const payload = (await response.json()) as { invoice: InvoiceRecord };
    const invoices = await fetchInvoices();

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return payload.invoice;
  } catch (error) {
    if (error instanceof Error && error.message !== "Failed to fetch") {
      throw error;
    }

    const nextInvoice: InvoiceRecord = {
      ...input,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      providerInvoiceId: "",
      hostedCheckoutUrl: "",
      providerSessionStatus: "",
    };

    if (!canUseStorage()) {
      return nextInvoice;
    }

    const current = getStoredInvoices();
    const next = [nextInvoice, ...current];
    window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(next));
    return nextInvoice;
  }
}
