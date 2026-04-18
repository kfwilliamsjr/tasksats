import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getOfferBySlug, getOfferLabel, pricingCards } from "../data";
import { saveLeadRecord } from "../leads";

export function RequestPage() {
  const [searchParams] = useSearchParams();
  const offerSlug = searchParams.get("offer") ?? "";
  const matchedOffer = useMemo(() => getOfferBySlug(offerSlug), [offerSlug]);

  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    offer: matchedOffer?.slug ?? "",
    budget: "",
    details: "",
  });
  const [savedLeadId, setSavedLeadId] = useState("");

  useEffect(() => {
    if (!matchedOffer) {
      return;
    }

    setFormState((current) => ({
      ...current,
      offer: current.offer || matchedOffer.slug,
    }));
  }, [matchedOffer]);

  function updateField<K extends keyof typeof formState>(field: K, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const record = await saveLeadRecord(formState);
    setSavedLeadId(record.id);
    setSubmitted(true);
  }

  return (
    <main className="page-shell">
      <div className="site-shell request-shell">
        <div className="request-layout">
          <section className="card request-copy-card">
            <p className="eyebrow">Start a request</p>
            <h1>Tell TaskSats what you want to launch.</h1>
            <p className="merchant-subcopy">
              This is the Phase 1 intake flow for leads, merchants, and service
              businesses that want Bitcoin payment infrastructure or a cleaner
              Lightning checkout experience.
            </p>

            <div className="request-highlights">
              <div className="sidebar-card">
                <p className="invoice-label">Focused scope</p>
                <h2>Bitcoin payments for service businesses</h2>
              </div>
              <div className="sidebar-card">
                <p className="invoice-label">Recommended domain</p>
                <h2>tasksats.com</h2>
                <p className="invoice-checkout-copy">
                  Use the `.com` as the main business site and keep `.ai` for
                  campaigns and future AI-focused positioning.
                </p>
              </div>
            </div>
          </section>

          <section className="card request-form-card">
            {submitted ? (
              <div className="success-panel">
                <p className="eyebrow">Request captured</p>
                <h2>Phase 1 lead flow is working.</h2>
                <p className="merchant-subcopy">
                  This Phase 1 request is now being captured locally inside the
                  app and can be reviewed from the leads view. The next backend
                  pass can swap this storage layer for email, CRM, or a
                  database-backed intake flow.
                </p>
                <div className="success-meta">
                  <span>Lead ID: {savedLeadId}</span>
                  <span>Offer: {getOfferLabel(formState.offer)}</span>
                </div>
                <div className="topbar-actions">
                  <Link className="primary-button" to="/">
                    Return home
                  </Link>
                  <Link className="ghost-button" to="/leads">
                    Review leads
                  </Link>
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setFormState({
                        name: "",
                        email: "",
                        company: "",
                        offer: matchedOffer?.slug ?? "",
                        budget: "",
                        details: "",
                      });
                    }}
                  >
                    Submit another
                  </button>
                </div>
              </div>
            ) : (
              <form className="request-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <label className="form-field">
                    <span>Name</span>
                    <input
                      value={formState.name}
                      onChange={(event) => updateField("name", event.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Email</span>
                    <input
                      type="email"
                      value={formState.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      placeholder="you@company.com"
                      required
                    />
                  </label>

                  <label className="form-field">
                    <span>Company</span>
                    <input
                      value={formState.company}
                      onChange={(event) => updateField("company", event.target.value)}
                      placeholder="Company or brand"
                    />
                  </label>

                  <label className="form-field">
                    <span>Offer</span>
                    <select
                      value={formState.offer}
                      onChange={(event) => updateField("offer", event.target.value)}
                    >
                      <option value="">Custom request</option>
                      {pricingCards.map((card) => (
                        <option key={card.slug} value={card.slug}>
                          {card.title}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="form-field">
                    <span>Budget Range</span>
                    <select
                      value={formState.budget}
                      onChange={(event) => updateField("budget", event.target.value)}
                    >
                      <option value="">Select a range</option>
                      <option value="under-250">Under $250</option>
                      <option value="250-1000">$250 - $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-plus">$5,000+</option>
                    </select>
                  </label>
                </div>

                <label className="form-field">
                  <span>What are you trying to launch?</span>
                  <textarea
                    value={formState.details}
                    onChange={(event) => updateField("details", event.target.value)}
                    placeholder="Describe the service, payment flow, or merchant use case you want help with."
                    rows={7}
                    required
                  />
                </label>

                <div className="request-form-footer">
                  <div className="request-form-note">
                    {formState.offer
                      ? `Selected offer: ${getOfferLabel(formState.offer)}`
                      : "Custom request welcome"}
                  </div>
                  <button className="primary-button" type="submit">
                    Send request
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
