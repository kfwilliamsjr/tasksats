import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { invoicePreview } from "../data";
import {
  fetchInvoiceCheckout,
  fetchInvoiceById,
  sendCheckoutEvent,
  syncInvoiceProvider,
  type InvoiceCheckout,
  type InvoiceRecord,
  updateInvoiceStatus,
} from "../invoices";

const defaultInvoice = {
  id: invoicePreview.id,
  client: "TaskSats Demo Client",
  service: "Website modernization sprint",
  amountUsd: "$240.00",
  amountBtc: "0.00281 BTC",
  status: "Open",
  createdAt: "",
};

export function InvoicePreviewPage() {
  const { invoiceId } = useParams();
  const [invoice, setInvoice] = useState<InvoiceRecord | null>(null);
  const [checkout, setCheckout] = useState<InvoiceCheckout | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState("");

  async function loadInvoiceState() {
    if (!invoiceId) {
      return;
    }

    const [nextInvoice, nextCheckout] = await Promise.all([
      fetchInvoiceById(invoiceId),
      fetchInvoiceCheckout(invoiceId),
    ]);

    setInvoice(nextInvoice);
    setCheckout(nextCheckout);
    setLastSyncedAt(new Date().toLocaleTimeString());
  }

  useEffect(() => {
    if (!invoiceId) {
      return;
    }

    void loadInvoiceState();
  }, [invoiceId]);

  useEffect(() => {
    if (!invoiceId || !checkout || checkout.status === "Paid") {
      return;
    }

    const timer = window.setInterval(() => {
      void loadInvoiceState();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [checkout, invoiceId]);

  const activeInvoice = invoice ?? defaultInvoice;
  const activeStatus = checkout?.status ?? activeInvoice.status;

  async function refreshInvoiceState() {
    if (!invoiceId) {
      setStatusMessage("Demo invoice preview does not support live refresh.");
      return;
    }

    setIsRefreshing(true);

    try {
      await loadInvoiceState();
      setStatusMessage("Checkout state refreshed.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function syncProviderState() {
    if (!invoiceId) {
      setStatusMessage("Demo invoice preview does not support provider sync.");
      return;
    }

    setIsRefreshing(true);

    try {
      const result = await syncInvoiceProvider(invoiceId);

      if (result.invoice) {
        setInvoice(result.invoice);
      }

      if (result.checkout) {
        setCheckout(result.checkout);
      }

      setLastSyncedAt(new Date().toLocaleTimeString());
      setStatusMessage(result.sync?.detail || "Provider sync completed.");
    } catch {
      setStatusMessage("Provider sync could not be completed.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function markPaid() {
    if (!invoiceId) {
      setStatusMessage("Demo invoice status is fixed in preview mode.");
      return;
    }

    const updated = await updateInvoiceStatus(invoiceId, "Paid");

    if (updated) {
      setInvoice(updated);
      await loadInvoiceState();
      setStatusMessage(`Invoice ${updated.id} marked as paid.`);
    }
  }

  async function runCheckoutEvent(
    event: "checkout_opened" | "payment_detected" | "payment_confirmed",
    successMessage: string,
  ) {
    if (!invoiceId) {
      setStatusMessage("Demo invoice status is fixed in preview mode.");
      return;
    }

    setIsSubmittingEvent(true);

    try {
      const next = await sendCheckoutEvent(invoiceId, event);

      if (next.invoice) {
        setInvoice(next.invoice);
      }

      if (next.checkout) {
        setCheckout(next.checkout);
      }

      setStatusMessage(successMessage);
    } finally {
      setIsSubmittingEvent(false);
    }
  }

  async function copyValue(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setStatusMessage(`${label} copied to clipboard.`);
    } catch {
      setStatusMessage(`Could not copy ${label.toLowerCase()} on this device.`);
    }
  }

  function getStatusTone(status: string) {
    if (status === "Paid") {
      return "status-chip status-chip--paid";
    }

    if (status === "Pending") {
      return "status-chip status-chip--queued";
    }

    return "status-chip";
  }

  function getBuyerSteps(status: string) {
    return [
      {
        label: "Invoice opened",
        state: status === "Open" ? "active" : "complete",
      },
      {
        label: "Payment detected",
        state: status === "Pending" ? "active" : status === "Paid" ? "complete" : "upcoming",
      },
      {
        label: "Payment confirmed",
        state: status === "Paid" ? "complete" : "upcoming",
      },
    ];
  }

  async function openWallet() {
    if (!checkout) {
      setStatusMessage("Checkout details are still loading.");
      return;
    }

    window.open(checkout.walletUrl, "_blank", "noopener,noreferrer");
    await runCheckoutEvent(
      "checkout_opened",
      `${checkout.provider?.displayName ?? "Wallet"} opened and checkout is now pending buyer payment.`,
    );
  }

  return (
    <main className="page-shell">
      <div className="site-shell invoice-page-shell">
        <div className="invoice-page-card card">
          <div className="invoice-page-header">
            <div>
              <p className="eyebrow">Hosted invoice preview</p>
              <h1>TaskSats Invoice #{activeInvoice.id}</h1>
            </div>
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
          </div>

          <div className="invoice-page-grid">
            <section className="invoice-page-main">
              <div className="invoice-hero-block">
                <p className="invoice-label">Amount due</p>
                <strong>
                  {activeInvoice.amountUsd} / {activeInvoice.amountBtc}
                </strong>
                <span>Bitcoin Lightning with USD reference pricing</span>
                {lastSyncedAt ? (
                  <p className="invoice-checkout-copy">Last synced at {lastSyncedAt}</p>
                ) : null}
              </div>

              <div className="invoice-checkout-box">
                <div className="qr-shell" aria-hidden="true">
                  <div className="qr-grid">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <span key={index} />
                    ))}
                  </div>
                </div>
                <p className="invoice-checkout-title">
                  {checkout?.checkoutTitle ?? "Lightning checkout"}
                </p>
                <p className="invoice-checkout-copy">
                  {checkout?.checkoutDescription ??
                    "This local prototype now generates a checkout payload for each invoice so the page can show a wallet-ready payment URI, invoice string, and payment status from the same flow."}
                </p>
                {checkout ? (
                  <div className="checkout-details">
                    {checkout.provider ? (
                      <div className="checkout-detail-row">
                        <span>Payment adapter</span>
                        <strong className="provider-badge">
                          {checkout.provider.displayName} · {checkout.provider.mode}
                        </strong>
                      </div>
                    ) : null}
                    <div className="checkout-detail-row">
                      <span>Payment state</span>
                      <strong className={getStatusTone(activeStatus)}>{activeStatus}</strong>
                    </div>
                    {checkout.providerInvoiceId ? (
                      <div className="checkout-detail-row">
                        <span>Provider invoice</span>
                        <strong>{checkout.providerInvoiceId}</strong>
                      </div>
                    ) : null}
                    {checkout.providerSessionStatus ? (
                      <div className="checkout-detail-row">
                        <span>Provider session</span>
                        <strong>{checkout.providerSessionStatus}</strong>
                      </div>
                    ) : null}
                    <div className="checkout-detail-row">
                      <span>Network</span>
                      <strong>{checkout.network}</strong>
                    </div>
                    <div className="checkout-detail-row">
                      <span>Amount</span>
                      <strong>{checkout.satsAmount.toLocaleString()} sats</strong>
                    </div>
                    <div className="checkout-detail-row">
                      <span>Expires</span>
                      <strong>{new Date(checkout.expiresAt).toLocaleString()}</strong>
                    </div>
                    <div className="checkout-code-block">
                      <span className="invoice-label">Payment URI</span>
                      <code>{checkout.paymentUri}</code>
                    </div>
                    {checkout.hostedCheckoutUrl ? (
                      <div className="checkout-code-block">
                        <span className="invoice-label">Hosted checkout URL</span>
                        <code>{checkout.hostedCheckoutUrl}</code>
                      </div>
                    ) : null}
                    <div className="checkout-code-block">
                      <span className="invoice-label">
                        {checkout.invoiceCodeLabel ?? "Lightning invoice"}
                      </span>
                      <code>{checkout.lightningInvoice}</code>
                    </div>
                  </div>
                ) : null}
                <div className="checkout-steps">
                  {getBuyerSteps(activeStatus).map((step) => (
                    <div className={`checkout-step checkout-step--${step.state}`} key={step.label}>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
                {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
                <div className="invoice-actions">
                  <button className="primary-button" type="button" onClick={markPaid}>
                    Mark paid
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => void refreshInvoiceState()}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? "Refreshing..." : "Refresh checkout"}
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => void syncProviderState()}
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? "Syncing..." : "Sync provider"}
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => void openWallet()}
                    disabled={isSubmittingEvent}
                  >
                    {checkout?.walletActionLabel ?? "Open wallet"}
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      void runCheckoutEvent(
                        "payment_detected",
                        `${checkout?.provider?.displayName ?? "Payment"} detected and invoice moved into pending confirmation.`,
                      )
                    }
                    disabled={isSubmittingEvent || activeInvoice.status === "Paid"}
                  >
                    {checkout?.detectionActionLabel ?? "Simulate payment detected"}
                  </button>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      void copyValue(checkout?.lightningInvoice ?? activeInvoice.id, "Invoice string")
                    }
                  >
                    Copy invoice string
                  </button>
                </div>
              </div>
            </section>

            <aside className="invoice-page-sidebar">
              <div className="sidebar-card">
                <p className="invoice-label">Service</p>
                <h2>{activeInvoice.service}</h2>
                <ul className="invoice-meta-list">
                  <li>Client: {activeInvoice.client}</li>
                  <li>Invoice ID: {activeInvoice.id}</li>
                  <li>Payment route: Bitcoin Lightning checkout</li>
                  {checkout ? <li>Lightning address: {checkout.lightningAddress}</li> : null}
                </ul>
              </div>

              <div className="sidebar-card">
                <p className="invoice-label">Status</p>
                <h2>{activeStatus}</h2>
                <p className="invoice-checkout-copy">
                  Merchant and buyer both get a clear payment state from the
                  same hosted page.
                </p>
                {activeStatus !== "Paid" ? (
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      void runCheckoutEvent(
                        "payment_confirmed",
                        "Payment confirmed and checkout is now marked as paid.",
                      )
                    }
                    disabled={isSubmittingEvent}
                  >
                    Confirm payment
                  </button>
                ) : null}
                {checkout ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() =>
                      void copyValue(
                        checkout.hostedCheckoutUrl || checkout.paymentUri,
                        checkout.hostedCheckoutUrl ? "Hosted checkout URL" : "Payment URI",
                      )
                    }
                  >
                    {checkout.hostedCheckoutUrl ? "Copy hosted checkout URL" : "Copy payment URI"}
                  </button>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
