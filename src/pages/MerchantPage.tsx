import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import {
  fetchInvoices,
  fetchPaymentProvider,
  saveInvoice,
  syncInvoiceProvider,
  type InvoiceRecord,
  type PaymentProviderResponse,
  type PaymentProviderSummary,
  updateInvoiceStatus,
} from "../invoices";
import {
  BITCOIN_REFERENCE_USD,
  calculateBtcFromUsd,
  formatBtcValue,
  formatUsdValue,
  parseCurrencyInput,
  validateInvoiceDraft,
} from "../pricing";

export function MerchantPage() {
  const { session, signOut } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [formError, setFormError] = useState("");
  const [btcEditedManually, setBtcEditedManually] = useState(false);
  const [provider, setProvider] = useState<PaymentProviderSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [invoiceActionMessage, setInvoiceActionMessage] = useState("");
  const [syncingInvoiceId, setSyncingInvoiceId] = useState("");
  const [formState, setFormState] = useState({
    client: "",
    service: "",
    amountUsd: "",
    amountBtc: "",
    status: "Open",
  });

  async function loadMerchantData() {
    const [nextInvoices, providerPayload] = await Promise.all([
      fetchInvoices().catch(() => []),
      fetchPaymentProvider().catch(() => ({ provider: null, providers: [] })),
    ]);

    setInvoices(nextInvoices);
    setProvider((providerPayload as PaymentProviderResponse).provider ?? null);
  }

  useEffect(() => {
    void loadMerchantData();
  }, []);

  const invoiceStats = useMemo(() => {
    const openCount = invoices.filter((invoice) => invoice.status === "Open").length;
    const pendingCount = invoices.filter((invoice) => invoice.status === "Pending").length;
    const paidCount = invoices.filter((invoice) => invoice.status === "Paid").length;

    return [
      { label: "Invoices saved", value: String(invoices.length) },
      { label: "Open invoices", value: String(openCount) },
      { label: "Pending invoices", value: String(pendingCount) },
      { label: "Paid invoices", value: String(paidCount) },
    ];
  }, [invoices]);

  const usdAmountNumber = useMemo(
    () => parseCurrencyInput(formState.amountUsd),
    [formState.amountUsd],
  );
  const derivedBtcAmount = useMemo(
    () => calculateBtcFromUsd(usdAmountNumber),
    [usdAmountNumber],
  );
  const draftValidationError = useMemo(
    () => validateInvoiceDraft(formState),
    [formState],
  );
  const invoiceMetrics = useMemo(() => {
    const totalUsd = invoices.reduce(
      (sum, invoice) => sum + parseCurrencyInput(invoice.amountUsd),
      0,
    );
    const paidUsd = invoices
      .filter((invoice) => invoice.status === "Paid")
      .reduce((sum, invoice) => sum + parseCurrencyInput(invoice.amountUsd), 0);
    const openUsd = invoices
      .filter((invoice) => invoice.status !== "Paid")
      .reduce((sum, invoice) => sum + parseCurrencyInput(invoice.amountUsd), 0);
    const totalBtc = invoices.reduce(
      (sum, invoice) => sum + parseCurrencyInput(invoice.amountBtc),
      0,
    );

    return {
      totalUsd,
      paidUsd,
      openUsd,
      totalBtc,
    };
  }, [invoices]);
  const providerMetrics = useMemo(() => {
    const sourceInvoices =
      providerFilter === "All"
        ? invoices
        : invoices.filter((invoice) => (invoice.providerKey ?? "unassigned") === providerFilter);

    const totalUsd = sourceInvoices.reduce(
      (sum, invoice) => sum + parseCurrencyInput(invoice.amountUsd),
      0,
    );
    const totalBtc = sourceInvoices.reduce(
      (sum, invoice) => sum + parseCurrencyInput(invoice.amountBtc),
      0,
    );
    const paidCount = sourceInvoices.filter((invoice) => invoice.status === "Paid").length;

    return {
      label: providerFilter === "All" ? "All providers" : providerFilter,
      totalUsd,
      totalBtc,
      paidCount,
    };
  }, [invoices, providerFilter]);
  const availableProviderKeys = useMemo(() => {
    return Array.from(
      new Set(invoices.map((invoice) => invoice.providerKey ?? "unassigned")),
    ).sort();
  }, [invoices]);
  const filteredInvoices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nextInvoices = invoices.filter((invoice) => {
      const matchesStatus = statusFilter === "All" || invoice.status === statusFilter;
      const matchesProvider =
        providerFilter === "All" || (invoice.providerKey ?? "unassigned") === providerFilter;
      const haystack = `${invoice.id} ${invoice.client} ${invoice.service}`.toLowerCase();
      const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesStatus && matchesProvider && matchesSearch;
    });

    return nextInvoices.sort((left, right) => {
      if (sortOrder === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
      }

      if (sortOrder === "highest-usd") {
        return parseCurrencyInput(right.amountUsd) - parseCurrencyInput(left.amountUsd);
      }

      if (sortOrder === "status") {
        return `${left.status}-${left.createdAt}`.localeCompare(`${right.status}-${right.createdAt}`);
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [invoices, providerFilter, searchQuery, sortOrder, statusFilter]);
  const merchantQueueSummary = useMemo(() => {
    const openInvoices = filteredInvoices.filter((invoice) => invoice.status === "Open");
    const pendingInvoices = filteredInvoices.filter((invoice) => invoice.status === "Pending");
    const topInvoice = [...filteredInvoices].sort(
      (left, right) => parseCurrencyInput(right.amountUsd) - parseCurrencyInput(left.amountUsd),
    )[0];

    return {
      openCount: openInvoices.length,
      pendingCount: pendingInvoices.length,
      filteredCount: filteredInvoices.length,
      topInvoice,
    };
  }, [filteredInvoices]);
  const providerGuidance = useMemo(() => {
    if (provider?.key === "btcpay") {
      if (provider.mode === "configured-stub") {
        return {
          checkoutLabel: "BTCPay hosted checkout setup",
          note:
            "This provider is configured enough to model a hosted-provider checkout URL and a more realistic external payment session.",
          expectation:
            "Merchants should expect a BTCPay-branded handoff, provider invoice reference, and webhook-oriented payment flow.",
        };
      }

      return {
        checkoutLabel: "BTCPay-oriented invoice setup",
        note:
          "This provider leans toward webhook-style confirmations and a more explicit hosted checkout handoff.",
        expectation:
          "Merchants should expect a stronger provider-branded checkout and more webhook-oriented event language.",
      };
    }

    return {
      checkoutLabel: "Demo Lightning invoice setup",
      note:
        "This provider keeps the workflow lightweight for testing wallet opens, invoice sharing, and simulated payment progression.",
      expectation:
        "Merchants should expect a simpler testing flow with demo wallet language and simulated payment detection.",
    };
  }, [provider]);
  const providerOwnershipCopy = useMemo(() => {
    if (provider?.key === "btcpay") {
      return "New invoices created right now will be owned by the BTCPay adapter and keep that provider identity even if the system default changes later.";
    }

    return "New invoices created right now will be owned by the Demo Lightning adapter and keep that provider identity even if the system default changes later.";
  }, [provider]);

  useEffect(() => {
    if (btcEditedManually) {
      return;
    }

    if (usdAmountNumber <= 0) {
      if (formState.amountBtc) {
        setFormState((current) => ({ ...current, amountBtc: "" }));
      }
      return;
    }

    const nextBtcValue = formatBtcValue(derivedBtcAmount);

    if (formState.amountBtc !== nextBtcValue) {
      setFormState((current) => ({ ...current, amountBtc: nextBtcValue }));
    }
  }, [btcEditedManually, derivedBtcAmount, formState.amountBtc, usdAmountNumber]);

  function updateField<K extends keyof typeof formState>(field: K, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setFormError("");
  }

  function handleUsdBlur() {
    if (usdAmountNumber > 0) {
      updateField("amountUsd", formatUsdValue(usdAmountNumber));
    }
  }

  function handleBtcBlur() {
    const btcAmount = parseCurrencyInput(formState.amountBtc);

    if (btcAmount > 0) {
      updateField("amountBtc", formatBtcValue(btcAmount));
    }
  }

  function applyReferencePricing() {
    if (usdAmountNumber <= 0) {
      setFormError("Enter a USD amount first so TaskSats can calculate the BTC reference.");
      return;
    }

    updateField("amountUsd", formatUsdValue(usdAmountNumber));
    updateField("amountBtc", formatBtcValue(derivedBtcAmount));
    setBtcEditedManually(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateInvoiceDraft(formState);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const invoice = await saveInvoice(formState);
      setCreatedInvoiceId(invoice.id);
      await loadMerchantData();
      setFormState({
        client: "",
        service: "",
        amountUsd: "",
        amountBtc: "",
        status: "Open",
      });
      setBtcEditedManually(false);
      setFormError("");
      setShowCreate(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Invoice save failed.");
    }
  }

  async function markInvoicePaid(
    event: React.MouseEvent<HTMLButtonElement>,
    invoiceId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    await updateInvoiceStatus(invoiceId, "Paid");
    await loadMerchantData();
    setInvoiceActionMessage(`Invoice ${invoiceId} marked as paid.`);
  }

  async function syncInvoice(
    event: React.MouseEvent<HTMLButtonElement>,
    invoiceId: string,
  ) {
    event.preventDefault();
    event.stopPropagation();
    setSyncingInvoiceId(invoiceId);
    setInvoiceActionMessage("");

    try {
      const result = await syncInvoiceProvider(invoiceId);
      await loadMerchantData();
      setInvoiceActionMessage(
        result.sync?.detail || `Invoice ${invoiceId} synced with provider state.`,
      );
    } catch {
      setInvoiceActionMessage(`Provider sync failed for ${invoiceId}.`);
    } finally {
      setSyncingInvoiceId("");
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);

    try {
      await loadMerchantData();
    } finally {
      setIsRefreshing(false);
    }
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
            <button
              className="ghost-button"
              type="button"
              onClick={() => void handleRefresh()}
              disabled={isRefreshing}
            >
              {isRefreshing ? "Refreshing..." : "Refresh invoices"}
            </button>
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
            <Link className="ghost-button" to="/activity">
              Activity
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

        <section className="merchant-stats-grid merchant-stats-grid--finance">
          <article className="card merchant-stat-card">
            <p>Total invoiced USD</p>
            <strong>{formatUsdValue(invoiceMetrics.totalUsd)}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Paid revenue USD</p>
            <strong>{formatUsdValue(invoiceMetrics.paidUsd)}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Outstanding USD</p>
            <strong>{formatUsdValue(invoiceMetrics.openUsd)}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Total invoiced BTC</p>
            <strong>{formatBtcValue(invoiceMetrics.totalBtc)}</strong>
          </article>
        </section>

        <section className="merchant-stats-grid merchant-stats-grid--finance">
          <article className="card merchant-stat-card">
            <p>Provider view</p>
            <strong>{providerMetrics.label}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Provider USD</p>
            <strong>{formatUsdValue(providerMetrics.totalUsd)}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Provider BTC</p>
            <strong>{formatBtcValue(providerMetrics.totalBtc)}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Provider paid invoices</p>
            <strong>{providerMetrics.paidCount}</strong>
          </article>
        </section>

        <section className="merchant-stats-grid merchant-stats-grid--finance">
          <article className="card merchant-stat-card">
            <p>Filtered results</p>
            <strong>{merchantQueueSummary.filteredCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Open in queue</p>
            <strong>{merchantQueueSummary.openCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Pending in queue</p>
            <strong>{merchantQueueSummary.pendingCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Largest invoice</p>
            <strong>
              {merchantQueueSummary.topInvoice
                ? formatUsdValue(parseCurrencyInput(merchantQueueSummary.topInvoice.amountUsd))
                : "$0.00"}
            </strong>
          </article>
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Recent invoices</p>
                <h2>Track payment status clearly</h2>
                {createdInvoiceId ? (
                  <div className="merchant-latest-actions">
                    <p className="merchant-subcopy">Latest saved invoice: {createdInvoiceId}</p>
                    <p className="merchant-subcopy">
                      Provider owner: {invoices.find((invoice) => invoice.id === createdInvoiceId)?.providerKey ?? "unknown"}
                    </p>
                    <div className="invoice-actions">
                      <Link className="ghost-button" to={`/invoice-preview/${createdInvoiceId}`}>
                        View hosted checkout
                      </Link>
                    </div>
                  </div>
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

            <div className="merchant-filter-bar">
              {invoiceActionMessage ? <p className="status-banner">{invoiceActionMessage}</p> : null}
              <label className="form-field merchant-filter-field">
                <span>Status filter</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option value="All">All invoices</option>
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>

              <label className="form-field merchant-filter-field">
                <span>Provider filter</span>
                <select
                  value={providerFilter}
                  onChange={(event) => setProviderFilter(event.target.value)}
                >
                  <option value="All">All providers</option>
                  {availableProviderKeys.map((providerKey) => (
                    <option key={providerKey} value={providerKey}>
                      {providerKey}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field merchant-filter-field merchant-filter-field--search">
                <span>Search invoices</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search client, service, or invoice ID"
                />
              </label>

              <label className="form-field merchant-filter-field">
                <span>Sort</span>
                <select
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest-usd">Highest USD first</option>
                  <option value="status">Status order</option>
                </select>
              </label>
            </div>

            {showCreate ? (
              <form className="request-form merchant-create-form" onSubmit={handleSubmit}>
                <div className="merchant-provider-callout">
                  <div>
                    <p className="invoice-label">Invoice owner</p>
                    <strong>{provider?.displayName ?? "Unknown provider"}</strong>
                    <p className="merchant-subcopy">{providerOwnershipCopy}</p>
                  </div>
                  <div className="invoice-actions">
                    <span className="provider-badge">
                      {provider?.key ?? "unassigned"} · {provider?.mode ?? "unknown"}
                    </span>
                  </div>
                </div>

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
                      onBlur={handleUsdBlur}
                      placeholder="$240.00"
                      inputMode="decimal"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Amount BTC</span>
                    <input
                      value={formState.amountBtc}
                      onChange={(event) => {
                        setBtcEditedManually(true);
                        updateField("amountBtc", event.target.value);
                      }}
                      onBlur={handleBtcBlur}
                      placeholder="0.00281 BTC"
                      inputMode="decimal"
                      required
                    />
                  </label>
                </div>

                <div className="merchant-pricing-helper">
                  <div>
                    <p className="invoice-label">{providerGuidance.checkoutLabel}</p>
                    <strong>{formatBtcValue(derivedBtcAmount || 0)}</strong>
                    <p className="merchant-subcopy">
                      Using a local reference price of {formatUsdValue(BITCOIN_REFERENCE_USD)} per
                      BTC for phase 1 previews. {providerGuidance.note}
                    </p>
                  </div>
                  <div className="invoice-actions">
                    <button
                      className="ghost-button"
                      type="button"
                      onClick={applyReferencePricing}
                    >
                      Use reference BTC
                    </button>
                    {btcEditedManually ? (
                      <span className="status-chip status-chip--queued">Manual BTC override</span>
                    ) : (
                      <span className="status-chip">Reference sync on</span>
                    )}
                  </div>
                </div>

                {formError ? <p className="form-error">{formError}</p> : null}
                {!formError && draftValidationError ? (
                  <p className="form-hint">{draftValidationError}</p>
                ) : (
                  <p className="form-hint">
                    Save a clean invoice record with both USD and Bitcoin pricing.{" "}
                    {providerGuidance.expectation}
                  </p>
                )}

                <div className="request-form-footer">
                  <div className="request-form-note">Save a disk-backed invoice record</div>
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={Boolean(draftValidationError)}
                  >
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
            ) : filteredInvoices.length === 0 ? (
              <div className="empty-state">
                <p className="merchant-subcopy">
                  No invoices match the current filters. Adjust the search, provider, or status
                  filters to widen the view.
                </p>
              </div>
            ) : (
              <div className="invoice-table">
                {filteredInvoices.map((invoice) => (
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
                      <p>
                        {invoice.status}
                        {invoice.providerKey ? ` · ${invoice.providerKey}` : ""}
                      </p>
                    </div>
                    <div className="invoice-row-actions">
                      <button
                        className="ghost-button"
                        type="button"
                        onClick={(event) => syncInvoice(event, invoice.id)}
                        disabled={syncingInvoiceId === invoice.id}
                      >
                        {syncingInvoiceId === invoice.id ? "Syncing..." : "Sync provider"}
                      </button>
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
            <h2>{provider?.displayName ?? "Merchant reporting"} live</h2>
            <p className="merchant-subcopy">
              Active adapter mode: {provider?.mode ?? "unknown"}. The merchant
              workflow now adapts its guidance to the selected payment backend.
            </p>
            <ul className="feature-list">
              <li>Invoice creation form</li>
              <li>Hosted checkout lifecycle</li>
              <li>Lead capture inbox</li>
              <li>Merchant payment activity view</li>
              <li>Invoice filters and revenue totals</li>
              <li>Invoice-level provider persistence</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
