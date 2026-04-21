import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOfferLabel } from "../data";
import { fetchLeadRecords, type LeadRecord } from "../leads";

function formatCreatedAt(value: string) {
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

function escapeCsvValue(value: string) {
  const normalized = String(value ?? "");
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [offerFilter, setOfferFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void fetchLeadRecords().then(setLeads);
  }, []);

  const leadCount = leads.length;
  const latestLead = useMemo(() => leads[0], [leads]);
  const availableOffers = useMemo(() => {
    return ["All", ...new Set(leads.map((lead) => lead.offer).filter(Boolean))];
  }, [leads]);
  const filteredLeads = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesOffer = offerFilter === "All" || lead.offer === offerFilter;
      const haystack = `${lead.name} ${lead.email} ${lead.company} ${lead.details}`.toLowerCase();
      const matchesSearch = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesOffer && matchesSearch;
    });
  }, [leads, offerFilter, searchQuery]);

  function exportLeadsJson() {
    downloadTextFile(
      `tasksats-leads-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(leads, null, 2),
      "application/json;charset=utf-8",
    );
  }

  function exportLeadsCsv() {
    const header = [
      "id",
      "createdAt",
      "name",
      "email",
      "company",
      "offer",
      "budget",
      "details",
    ];
    const rows = leads.map((lead) =>
      [
        lead.id,
        lead.createdAt,
        lead.name,
        lead.email,
        lead.company,
        lead.offer,
        lead.budget,
        lead.details,
      ]
        .map(escapeCsvValue)
        .join(","),
    );

    downloadTextFile(
      `tasksats-leads-${new Date().toISOString().slice(0, 10)}.csv`,
      [header.join(","), ...rows].join("\n"),
      "text/csv;charset=utf-8",
    );
  }

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Lead inbox</p>
            <h1>Captured TaskSats requests</h1>
            <p className="merchant-subcopy">
              This is the Phase 1 internal review surface for intake submissions
              captured from the request flow.
            </p>
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
            <button className="ghost-button" type="button" onClick={exportLeadsJson}>
              Export JSON
            </button>
            <button className="ghost-button" type="button" onClick={exportLeadsCsv}>
              Export CSV
            </button>
            <Link className="primary-button" to="/request">
              New request
            </Link>
          </div>
        </div>

        <section className="merchant-stats-grid">
          <article className="card merchant-stat-card">
            <p>Total leads</p>
            <strong>{leadCount}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Latest offer</p>
            <strong>{latestLead ? getOfferLabel(latestLead.offer) : "None yet"}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Storage mode</p>
            <strong>Local Phase 1</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Filtered leads</p>
            <strong>{filteredLeads.length}</strong>
          </article>
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Requests</p>
                <h2>Recent submissions</h2>
              </div>
            </div>

            <div className="merchant-filter-bar">
              <label className="form-field merchant-filter-field">
                <span>Offer filter</span>
                <select
                  value={offerFilter}
                  onChange={(event) => setOfferFilter(event.target.value)}
                >
                  {availableOffers.map((offer) => (
                    <option key={offer} value={offer}>
                      {offer === "All" ? "All offers" : getOfferLabel(offer)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field merchant-filter-field merchant-filter-field--search">
                <span>Search leads</span>
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search name, email, company, or details"
                />
              </label>
            </div>

            {filteredLeads.length === 0 ? (
              <div className="empty-state">
                <p className="merchant-subcopy">
                  No leads match the current filters yet. Adjust the filters or
                  submit a request from the intake flow to populate this inbox.
                </p>
              </div>
            ) : (
              <div className="lead-list">
                {filteredLeads.map((lead) => (
                  <article className="lead-card" key={lead.id}>
                    <div className="lead-card-top">
                      <div>
                        <strong>{lead.name}</strong>
                        <p>
                          {lead.company || "Independent"} · {lead.email}
                        </p>
                      </div>
                      <div className="lead-meta">
                        <span>{getOfferLabel(lead.offer)}</span>
                        <span>{formatCreatedAt(lead.createdAt)}</span>
                      </div>
                    </div>
                    <div className="lead-detail-grid">
                      <div>
                        <p className="invoice-label">Budget</p>
                        <strong>{lead.budget || "Not specified"}</strong>
                      </div>
                      <div>
                        <p className="invoice-label">Lead ID</p>
                        <strong>{lead.id}</strong>
                      </div>
                    </div>
                    <p className="lead-details-copy">{lead.details}</p>
                    <div className="activity-actions">
                      <Link
                        className="ghost-button"
                        to="/merchant"
                        state={{
                          leadToInvoice: {
                            id: lead.id,
                            name: lead.name,
                            email: lead.email,
                            company: lead.company,
                            offer: lead.offer,
                            budget: lead.budget,
                            details: lead.details,
                          },
                        }}
                      >
                        Convert to invoice
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </article>

          <aside className="card merchant-panel merchant-panel--aside">
            <p className="eyebrow">Next backend step</p>
            <h2>Replace local storage with real delivery</h2>
            <ul className="feature-list">
              <li>Email alert to founder inbox</li>
              <li>Database-backed request records</li>
              <li>CRM sync for follow-up</li>
              <li>Status and pipeline tracking</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
