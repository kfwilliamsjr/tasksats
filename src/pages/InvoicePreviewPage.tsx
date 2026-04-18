import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { invoicePreview } from "../data";
import {
  fetchInvoiceById,
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
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (!invoiceId) {
      return;
    }

    void fetchInvoiceById(invoiceId).then(setInvoice);
  }, [invoiceId]);

  const activeInvoice = invoice ?? defaultInvoice;

  async function markPaid() {
    if (!invoiceId) {
      setStatusMessage("Demo invoice status is fixed in preview mode.");
      return;
    }

    const updated = await updateInvoiceStatus(invoiceId, "Paid");

    if (updated) {
      setInvoice(updated);
      setStatusMessage(`Invoice ${updated.id} marked as paid.`);
    }
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
              </div>

              <div className="invoice-checkout-box">
                <div className="qr-shell" aria-hidden="true">
                  <div className="qr-grid">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <span key={index} />
                    ))}
                  </div>
                </div>
                <p className="invoice-checkout-title">Lightning checkout</p>
                <p className="invoice-checkout-copy">
                  In production, this screen would display a live Lightning
                  invoice and confirm payment automatically via webhook.
                </p>
                {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}
                <div className="invoice-actions">
                  <button className="primary-button" type="button" onClick={markPaid}>
                    Mark paid
                  </button>
                  <button className="ghost-button" type="button">
                    Open wallet
                  </button>
                  <button className="ghost-button" type="button">
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
                </ul>
              </div>

              <div className="sidebar-card">
                <p className="invoice-label">Status</p>
                <h2>{activeInvoice.status}</h2>
                <p className="invoice-checkout-copy">
                  Merchant and buyer both get a clear payment state from the
                  same hosted page.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
