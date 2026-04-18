import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOfferLabel } from "../data";
import { fetchLeadRecords, type LeadRecord } from "../leads";

function formatCreatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);

  useEffect(() => {
    void fetchLeadRecords().then(setLeads);
  }, []);

  const leadCount = leads.length;
  const latestLead = useMemo(() => leads[0], [leads]);

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
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Requests</p>
                <h2>Recent submissions</h2>
              </div>
            </div>

            {leads.length === 0 ? (
              <div className="empty-state">
                <p className="merchant-subcopy">
                  No requests have been captured yet. Submit a request from the
                  intake flow to populate this inbox.
                </p>
              </div>
            ) : (
              <div className="lead-list">
                {leads.map((lead) => (
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
