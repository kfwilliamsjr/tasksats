import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import {
  fetchInvoices,
  saveInvoice,
  type InvoiceRecord,
  updateInvoiceStatus,
} from "../invoices";

export function MerchantPage() {
  const { session, signOut } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState("");
  const [formState, setFormState] = useState({
    client: "",
    service: "",
    amountUsd: "",
    amountBtc: "",
    status: "Open",
  });

  useEffect(() => {
    void fetchInvoices().then(setInvoices);
  }, []);

  const invoiceStats = useMemo(() => {
    const openCount = invoices.filter((invoice) => invoice.status === "Open").length;
    const paidCount = invoices.filter((invoice) => invoice.status === "Paid").length;

    return [
      { label: "Invoices saved", value: String(invoices.length) },
      { label: "Open invoices", value: String(openCount) },
      { label: "Paid invoices", value: String(paidCount) },
    ];
  }, [invoices]);

  function updateField<K extends keyof typeof formState>(field: K, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invoice = await saveInvoice(formState);
    setCreatedInvoiceId(invoice.id);
    const next = await fetchInvoices();
    setInvoices(next);
    setFormState({
      client: "",
      service: "",
      amountUsd: "",
      amountBtc: "",
      status: "Open",
    });
    setShowCreate(false);
  }

  async function markInvoicePaid(
    event: React.MouseEvent<HTMLButtonElement>,
    invoiceId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    await updateInvoiceStatus(invoiceId, "Paid");
    const next = await fetchInvoices();
    setInvoices(next);
  }

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Merchant preview</p>
            <h1>TaskSats merchant dashboard</h1>
            <p className="merchant-subcopy">
              This is the next logical Phase 1 surface after the marketing site:
              a simple merchant view for creating, tracking, and confirming
              Bitcoin payment requests.
            </p>
            {session ? (
              <p className="merchant-subcopy">
                Signed in as {session.name} · {session.email} · {session.role}
              </p>
            ) : null}
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
            <Link className="ghost-button" to="/notifications">
              Notifications
            </Link>
            <Link className="ghost-button" to="/leads">
              View leads
            </Link>
            <Link className="primary-button" to="/invoice-preview">
              View invoice preview
            </Link>
            <button className="ghost-button" type="button" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>

        <section className="merchant-stats-grid">
          {invoiceStats.map((stat) => (
            <article className="card merchant-stat-card" key={stat.label}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
            </article>
          ))}
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Recent invoices</p>
                <h2>Track payment status clearly</h2>
                {createdInvoiceId ? (
                  <p className="merchant-subcopy">Latest saved invoice: {createdInvoiceId}</p>
                ) : null}
              </div>
              <button
                className="primary-button"
                type="button"
                onClick={() => setShowCreate((current) => !current)}
              >
                {showCreate ? "Close form" : "Create invoice"}
              </button>
            </div>

            {showCreate ? (
              <form className="request-form merchant-create-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Client</span>
                    <input
                      value={formState.client}
                      onChange={(event) => updateField("client", event.target.value)}
                      placeholder="Client name"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Service</span>
                    <input
                      value={formState.service}
                      onChange={(event) => updateField("service", event.target.value)}
                      placeholder="Service label"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Amount USD</span>
                    <input
                      value={formState.amountUsd}
                      onChange={(event) => updateField("amountUsd", event.target.value)}
                      placeholder="$240.00"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Amount BTC</span>
                    <input
                      value={formState.amountBtc}
                      onChange={(event) => updateField("amountBtc", event.target.value)}
                      placeholder="0.00281 BTC"
                      required
                    />
                  </label>
                </div>

                <div className="request-form-footer">
                  <div className="request-form-note">Save a disk-backed invoice record</div>
                  <button className="primary-button" type="submit">
                    Save invoice
                  </button>
                </div>
              </form>
            ) : null}

            {invoices.length === 0 ? (
              <div className="empty-state">
                <p className="merchant-subcopy">
                  No invoices have been saved yet. Use the invoice form to create the first
                  merchant-side record.
                </p>
              </div>
            ) : (
              <div className="invoice-table">
                {invoices.map((invoice) => (
                  <Link
                    className="invoice-table-row invoice-table-link"
                    key={invoice.id}
                    to={`/invoice-preview/${invoice.id}`}
                  >
                    <div>
                      <strong>{invoice.id}</strong>
                      <p>
                        {invoice.client} · {invoice.service}
                      </p>
                    </div>
                    <div>
                      <strong>
                        {invoice.amountUsd} / {invoice.amountBtc}
                      </strong>
                      <p>{invoice.status}</p>
                    </div>
                    <div className="invoice-row-actions">
                      {invoice.status !== "Paid" ? (
                        <button
                          className="ghost-button"
                          type="button"
                          onClick={(event) => markInvoicePaid(event, invoice.id)}
                        >
                          Mark paid
                        </button>
                      ) : (
                        <span className="status-chip status-chip--paid">Paid</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </article>

          <aside className="card merchant-panel merchant-panel--aside">
            <p className="eyebrow">Phase 1 admin view</p>
            <h2>What gets built next</h2>
            <ul className="feature-list">
              <li>Invoice creation form</li>
              <li>Payment status webhooks</li>
              <li>Lead capture inbox</li>
              <li>Merchant payment history</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
