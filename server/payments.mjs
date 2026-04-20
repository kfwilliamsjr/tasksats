import crypto from "node:crypto";

function parseBtcNumber(amountBtc) {
  const sanitized = String(amountBtc ?? "").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(sanitized);
  return Number.isFinite(value) ? value : 0;
}

function parseUsdNumber(amountUsd) {
  const sanitized = String(amountUsd ?? "").replace(/[^0-9.]/g, "");
  const value = Number.parseFloat(sanitized);
  return Number.isFinite(value) ? value : 0;
}

function buildProviderInvoiceState({
  providerInvoiceId = "",
  hostedCheckoutUrl = "",
  providerSessionStatus = "",
}) {
  return {
    providerInvoiceId: String(providerInvoiceId ?? "").trim(),
    hostedCheckoutUrl: String(hostedCheckoutUrl ?? "").trim(),
    providerSessionStatus: String(providerSessionStatus ?? "").trim(),
  };
}

function createSha256HexSignature(secret, rawBody) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

function matchesSignature(candidate, expectedHex) {
  const normalized = String(candidate ?? "").trim();

  if (!normalized) {
    return false;
  }

  const variants = [normalized];

  if (normalized.startsWith("sha256=")) {
    variants.push(normalized.replace(/^sha256=/, ""));
  } else {
    variants.push(`sha256=${normalized}`);
  }

  return variants.some((value) => {
    const left = Buffer.from(value);
    const right = Buffer.from(value.startsWith("sha256=") ? `sha256=${expectedHex}` : expectedHex);

    if (left.length !== right.length) {
      return false;
    }

    return crypto.timingSafeEqual(left, right);
  });
}

function createDemoPaymentAdapter() {
  return {
    key: "demo-lightning",
    displayName: "Demo Lightning Adapter",
    mode: "simulation",
    capabilities: [
      "hosted-checkout",
      "lightning-invoice",
      "wallet-uri",
      "simulated-events",
    ],
    getCheckout(invoice) {
      const btcAmount = parseBtcNumber(invoice.amountBtc);
      const usdAmount = parseUsdNumber(invoice.amountUsd);
      const satsAmount = Math.max(1, Math.round(btcAmount * 100_000_000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const serviceLabel = encodeURIComponent(invoice.service || "TaskSats invoice");
      const invoiceLabel = encodeURIComponent(`TaskSats Invoice ${invoice.id}`);
      const paymentUri = `bitcoin:?amount=${btcAmount.toFixed(8)}&label=${invoiceLabel}&message=${serviceLabel}`;
      const lightningInvoice = `ln-demo-${invoice.id.toLowerCase()}-${satsAmount}`;
      const providerState = buildProviderInvoiceState({
        providerInvoiceId: invoice.providerInvoiceId || `demo-${invoice.id}`,
        hostedCheckoutUrl: invoice.hostedCheckoutUrl || paymentUri,
        providerSessionStatus: invoice.providerSessionStatus || "simulated",
      });

      return {
        provider: this.getSummary(),
        invoiceId: invoice.id,
        ...providerState,
        status: invoice.status,
        amountUsd: invoice.amountUsd,
        amountBtc: invoice.amountBtc,
        usdValue: usdAmount,
        btcValue: btcAmount,
        satsAmount,
        expiresAt,
        network: "bitcoin-lightning",
        paymentUri,
        walletUrl: paymentUri,
        lightningInvoice,
        lightningAddress: `pay+${invoice.id.toLowerCase()}@tasksats.com`,
        checkoutTitle: "Lightning checkout",
        checkoutDescription:
          "TaskSats demo mode keeps the flow simple for testing wallet opens, invoice copying, and simulated payment events.",
        invoiceCodeLabel: "Lightning invoice",
        walletActionLabel: "Open demo wallet",
        detectionActionLabel: "Simulate payment detected",
      };
    },
    mapCheckoutEventToStatus(eventName, currentStatus) {
      const event = String(eventName ?? "").trim();

      if (event === "checkout_opened" && currentStatus === "Open") {
        return "Pending";
      }

      if (event === "payment_detected" && currentStatus !== "Paid") {
        return "Pending";
      }

      if (event === "payment_confirmed") {
        return "Paid";
      }

      return currentStatus;
    },
    buildCheckoutEventMessage(invoice, eventName, nextStatus) {
      const event = String(eventName ?? "").trim();

      if (event === "checkout_opened") {
        return {
          type: "checkout_opened",
          title: `Checkout opened for ${invoice.client}`,
          body: `${invoice.id} was opened by the buyer and is now ${nextStatus}.`,
        };
      }

      if (event === "payment_detected") {
        return {
          type: "payment_detected",
          title: `Payment detected for ${invoice.client}`,
          body: `${invoice.id} has a detected payment and is now ${nextStatus}.`,
        };
      }

      return {
        type: "payment_confirmed",
        title: `Payment confirmed for ${invoice.client}`,
        body: `${invoice.id} is now marked as ${nextStatus}.`,
      };
    },
    buildInvoiceCreatedMessage(invoice) {
      return {
        type: "invoice_created",
        title: `Invoice created for ${invoice.client}`,
        body: `${invoice.id} was created for ${invoice.service} at ${invoice.amountUsd} / ${invoice.amountBtc}.`,
      };
    },
    buildStatusUpdateMessage(invoice) {
      return {
        type: "invoice_updated",
        title: `Invoice ${invoice.id} updated`,
        body: `${invoice.client} invoice is now marked as ${invoice.status}.`,
      };
    },
    parseWebhookEvent(payload) {
      const invoiceId = String(payload.invoiceId ?? payload.invoice_id ?? "").trim();
      const rawType = String(payload.event ?? payload.type ?? "").trim();
      const typeMap = {
        checkout_opened: "checkout_opened",
        payment_detected: "payment_detected",
        payment_confirmed: "payment_confirmed",
        pending: "payment_detected",
        confirmed: "payment_confirmed",
      };

      return {
        invoiceId,
        event: typeMap[rawType] ?? "",
        acknowledged: Boolean(invoiceId && typeMap[rawType]),
        source: "demo-lightning-webhook",
      };
    },
    buildWebhookReceivedMessage(invoice, eventName) {
      return {
        type: "webhook_received",
        title: `Demo webhook received for ${invoice.client}`,
        body: `${invoice.id} received a ${eventName} webhook through the demo-lightning adapter.`,
      };
    },
    getWebhookGuide() {
      return {
        providerKey: this.key,
        displayName: this.displayName,
        endpointPath: `/api/payments/webhooks/${this.key}`,
        samplePayload: {
          invoiceId: "inv_1234567890",
          event: "payment_confirmed",
        },
      };
    },
    buildTestWebhookPayload(invoiceId, eventName) {
      return {
        invoiceId,
        event: eventName,
      };
    },
    buildTestWebhookRequest(invoiceId, eventName) {
      return {
        payload: this.buildTestWebhookPayload(invoiceId, eventName),
        headers: {},
      };
    },
    provisionInvoice(invoice) {
      return buildProviderInvoiceState({
        providerInvoiceId: `demo-${invoice.id}`,
        hostedCheckoutUrl: this.getCheckout(invoice).walletUrl,
        providerSessionStatus: "simulated",
      });
    },
    syncInvoice(invoice) {
      return {
        ...buildProviderInvoiceState({
          providerInvoiceId: invoice.providerInvoiceId || `demo-${invoice.id}`,
          hostedCheckoutUrl: invoice.hostedCheckoutUrl || this.getCheckout(invoice).walletUrl,
          providerSessionStatus:
            invoice.status === "Paid"
              ? "settled"
              : invoice.status === "Pending"
                ? "awaiting-confirmation"
                : "simulated",
        }),
        syncStatus: "synced",
        syncDetail: "Demo adapter refreshed local provider state successfully.",
      };
    },
    verifyWebhook() {
      return {
        verified: true,
        reason: "demo-provider",
      };
    },
    getSummary() {
      return {
        key: this.key,
        displayName: this.displayName,
        mode: this.mode,
        capabilities: this.capabilities,
      };
    },
  };
}

function createBtcpayStubAdapter(config = {}) {
  const btcpayServerUrl = String(config.btcpayServerUrl ?? "").trim().replace(/\/+$/, "");
  const btcpayWebhookSecret = String(config.btcpayWebhookSecret ?? "").trim();
  const btcpayStoreId = String(config.btcpayStoreId ?? "").trim();
  const isHostedCheckoutConfigured = Boolean(btcpayServerUrl && btcpayStoreId);

  return {
    key: "btcpay",
    displayName: "BTCPay Stub Adapter",
    mode: isHostedCheckoutConfigured ? "configured-stub" : "stubbed",
    capabilities: [
      "hosted-checkout",
      "lightning-invoice",
      "wallet-uri",
      "webhook-ready",
      "provider-swap",
      "credential-aware",
      ...(isHostedCheckoutConfigured ? ["hosted-provider-url"] : []),
    ],
    getCheckout(invoice) {
      const btcAmount = parseBtcNumber(invoice.amountBtc);
      const usdAmount = parseUsdNumber(invoice.amountUsd);
      const satsAmount = Math.max(1, Math.round(btcAmount * 100_000_000));
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const serviceLabel = encodeURIComponent(invoice.service || "TaskSats BTCPay invoice");
      const invoiceLabel = encodeURIComponent(`TaskSats BTCPay ${invoice.id}`);
      const paymentUri = `bitcoin:?amount=${btcAmount.toFixed(8)}&label=${invoiceLabel}&message=${serviceLabel}`;
      const walletUrl =
        btcpayServerUrl && btcpayStoreId
          ? `${btcpayServerUrl}/stores/${encodeURIComponent(
              btcpayStoreId,
            )}/invoices/${encodeURIComponent(invoice.id)}`
          : paymentUri;
      const providerState = buildProviderInvoiceState({
        providerInvoiceId:
          invoice.providerInvoiceId ||
          (btcpayStoreId ? `${btcpayStoreId}-${invoice.id}` : `btcpay-${invoice.id}`),
        hostedCheckoutUrl: invoice.hostedCheckoutUrl || walletUrl,
        providerSessionStatus:
          invoice.providerSessionStatus ||
          (isHostedCheckoutConfigured ? "hosted-checkout-ready" : "stubbed-session"),
      });

      return {
        provider: this.getSummary(),
        invoiceId: invoice.id,
        ...providerState,
        status: invoice.status,
        amountUsd: invoice.amountUsd,
        amountBtc: invoice.amountBtc,
        usdValue: usdAmount,
        btcValue: btcAmount,
        satsAmount,
        expiresAt,
        network: "bitcoin-lightning",
        paymentUri,
        walletUrl,
        lightningInvoice: `ln-btcpay-${invoice.id.toLowerCase()}-${satsAmount}`,
        lightningAddress: `btcpay+${invoice.id.toLowerCase()}@tasksats.com`,
        checkoutTitle: "BTCPay checkout",
        checkoutDescription:
          btcpayServerUrl && btcpayStoreId
            ? "BTCPay mode is configured with a hosted-provider style checkout URL and webhook-oriented payment language."
            : "BTCPay mode models a more provider-specific hosted checkout with webhook-oriented language and a distinct invoice string.",
        invoiceCodeLabel: "BTCPay invoice",
        walletActionLabel:
          btcpayServerUrl && btcpayStoreId ? "Open BTCPay checkout" : "Open BTCPay request",
        detectionActionLabel: "Simulate webhook detected",
      };
    },
    mapCheckoutEventToStatus(eventName, currentStatus) {
      const event = String(eventName ?? "").trim();

      if ((event === "checkout_opened" || event === "payment_detected") && currentStatus === "Open") {
        return "Pending";
      }

      if (event === "payment_confirmed") {
        return "Paid";
      }

      return currentStatus;
    },
    buildCheckoutEventMessage(invoice, eventName, nextStatus) {
      const event = String(eventName ?? "").trim();

      if (event === "checkout_opened") {
        return {
          type: "checkout_opened",
          title: `BTCPay checkout opened for ${invoice.client}`,
          body: `${invoice.id} opened through the BTCPay adapter and is now ${nextStatus}.`,
        };
      }

      if (event === "payment_detected") {
        return {
          type: "payment_detected",
          title: `BTCPay payment detected for ${invoice.client}`,
          body: `${invoice.id} has a detected BTCPay payment and is now ${nextStatus}.`,
        };
      }

      return {
        type: "payment_confirmed",
        title: `BTCPay payment confirmed for ${invoice.client}`,
        body: `${invoice.id} is now marked as ${nextStatus} through the BTCPay adapter.`,
      };
    },
    buildInvoiceCreatedMessage(invoice) {
      return {
        type: "invoice_created",
        title: `BTCPay invoice created for ${invoice.client}`,
        body: `${invoice.id} was created for ${invoice.service} at ${invoice.amountUsd} / ${invoice.amountBtc} through the BTCPay adapter.`,
      };
    },
    buildStatusUpdateMessage(invoice) {
      return {
        type: "invoice_updated",
        title: `BTCPay invoice ${invoice.id} updated`,
        body: `${invoice.client} invoice is now marked as ${invoice.status} through the BTCPay adapter.`,
      };
    },
    parseWebhookEvent(payload) {
      const invoiceId = String(
        payload.invoiceId ?? payload.invoice_id ?? payload.metadata?.invoiceId ?? "",
      ).trim();
      const rawType = String(payload.type ?? payload.event ?? "").trim();
      const typeMap = {
        InvoiceReceivedPayment: "payment_detected",
        InvoiceProcessing: "payment_detected",
        InvoiceSettled: "payment_confirmed",
        InvoiceExpired: "checkout_opened",
      };

      return {
        invoiceId,
        event: typeMap[rawType] ?? "",
        acknowledged: Boolean(invoiceId && typeMap[rawType]),
        source: "btcpay-webhook",
      };
    },
    buildWebhookReceivedMessage(invoice, eventName) {
      return {
        type: "webhook_received",
        title: `BTCPay webhook received for ${invoice.client}`,
        body: `${invoice.id} received a ${eventName} webhook through the BTCPay adapter.`,
      };
    },
    getWebhookGuide() {
      return {
        providerKey: this.key,
        displayName: this.displayName,
        endpointPath: `/api/payments/webhooks/${this.key}`,
        signatureHeader: "btcpay-sig",
        samplePayload: {
          type: "InvoiceSettled",
          invoiceId: "inv_1234567890",
          metadata: {
            invoiceId: "inv_1234567890",
          },
        },
      };
    },
    buildTestWebhookPayload(invoiceId, eventName) {
      const eventMap = {
        checkout_opened: "InvoiceExpired",
        payment_detected: "InvoiceReceivedPayment",
        payment_confirmed: "InvoiceSettled",
      };

      return {
        type: eventMap[eventName] ?? "InvoiceSettled",
        invoiceId,
        metadata: {
          invoiceId,
        },
      };
    },
    buildTestWebhookRequest(invoiceId, eventName) {
      const payload = this.buildTestWebhookPayload(invoiceId, eventName);
      const rawBody = JSON.stringify(payload);

      if (!btcpayWebhookSecret) {
        return {
          payload,
          headers: {},
        };
      }

      const signature = createSha256HexSignature(btcpayWebhookSecret, rawBody);
      return {
        payload,
        headers: {
          "btcpay-sig": `sha256=${signature}`,
        },
      };
    },
    provisionInvoice(invoice) {
      return buildProviderInvoiceState({
        providerInvoiceId: btcpayStoreId ? `${btcpayStoreId}-${invoice.id}` : `btcpay-${invoice.id}`,
        hostedCheckoutUrl: btcpayServerUrl && btcpayStoreId
          ? `${btcpayServerUrl}/stores/${encodeURIComponent(
              btcpayStoreId,
            )}/invoices/${encodeURIComponent(invoice.id)}`
          : "",
        providerSessionStatus: isHostedCheckoutConfigured
          ? "provider-session-created"
          : "stubbed-session",
      });
    },
    syncInvoice(invoice) {
      const providerState = buildProviderInvoiceState({
        providerInvoiceId:
          invoice.providerInvoiceId ||
          (btcpayStoreId ? `${btcpayStoreId}-${invoice.id}` : `btcpay-${invoice.id}`),
        hostedCheckoutUrl:
          invoice.hostedCheckoutUrl ||
          (btcpayServerUrl && btcpayStoreId
            ? `${btcpayServerUrl}/stores/${encodeURIComponent(
                btcpayStoreId,
              )}/invoices/${encodeURIComponent(invoice.id)}`
            : ""),
        providerSessionStatus:
          invoice.status === "Paid"
            ? "settled"
            : invoice.status === "Pending"
              ? "payment-detected"
              : isHostedCheckoutConfigured
                ? "provider-session-created"
                : "stubbed-session",
      });

      return {
        ...providerState,
        syncStatus: isHostedCheckoutConfigured ? "ready-for-live-sync" : "stub-sync",
        syncDetail: isHostedCheckoutConfigured
          ? "BTCPay credentials are present, so invoice records can already be re-synced through the provider seam while live API calls are added next."
          : "BTCPay sync is still stubbed until server URL and store credentials are configured.",
      };
    },
    verifyWebhook({ headers, rawBody }) {
      if (!btcpayWebhookSecret) {
        return {
          verified: false,
          reason: "missing-webhook-secret",
        };
      }

      const expectedHex = createSha256HexSignature(btcpayWebhookSecret, rawBody);
      const signature =
        headers["btcpay-sig"] ??
        headers["x-btcpay-sig"] ??
        headers["x-tasksats-signature"] ??
        "";

      return {
        verified: matchesSignature(signature, expectedHex),
        reason: matchesSignature(signature, expectedHex) ? "verified" : "signature-mismatch",
      };
    },
    getSummary() {
      return {
        key: this.key,
        displayName: this.displayName,
        mode: this.mode,
        capabilities: this.capabilities,
      };
    },
  };
}

function getProviderRegistry(config = {}) {
  return {
    "demo-lightning": createDemoPaymentAdapter(),
    btcpay: createBtcpayStubAdapter(config),
  };
}

export function getPaymentAdapter(adapterKey = "demo-lightning", config = {}) {
  const providers = getProviderRegistry(config);
  const selectedKey = String(adapterKey ?? "demo-lightning").trim() || "demo-lightning";
  return providers[selectedKey] ?? providers["demo-lightning"];
}

export function listPaymentAdapters(config = {}) {
  return Object.values(getProviderRegistry(config)).map((provider) => provider.getSummary());
}

export function listWebhookGuides(config = {}) {
  return Object.values(getProviderRegistry(config)).map((provider) => provider.getWebhookGuide());
}
