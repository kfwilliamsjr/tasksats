import { Link, useParams } from "react-router-dom";
import { useBusinessSettings } from "../business-settings";
import { getOfferBySlug } from "../data";

export function OfferPage() {
  const { slug = "" } = useParams();
  const { settings } = useBusinessSettings();
  const offer = getOfferBySlug(slug);

  if (!offer) {
    return (
      <main className="page-shell">
        <div className="site-shell simple-page-shell">
          <div className="simple-page-card card">
            <p className="eyebrow">Offer not found</p>
            <h1>This offer does not exist.</h1>
            <p className="merchant-subcopy">
              Head back to the homepage and choose one of the current Phase 1
              offers.
            </p>
            <Link className="primary-button" to="/">
              Return home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="site-shell offer-shell">
        <div className="offer-hero card">
          <div className="offer-hero-copy">
            <p className="eyebrow">{offer.kicker}</p>
            <h1>{offer.title}</h1>
            <p className="merchant-subcopy">{offer.description}</p>
            <div className="offer-price-block">
              <strong>{offer.priceUsd}</strong>
              <span>{offer.priceBtc}</span>
            </div>
            <div className="topbar-actions">
              <Link className="primary-button" to={`/request?offer=${offer.slug}`}>
                Request This Offer
              </Link>
              <Link className="ghost-button" to="/">
                Back to homepage
              </Link>
            </div>
          </div>
          <div className="offer-hero-side">
            <div className="sidebar-card">
              <p className="invoice-label">Best for</p>
              <h2>{offer.idealFor}</h2>
            </div>
            <div className="sidebar-card">
              <p className="invoice-label">Typical timeline</p>
              <h2>{offer.timeline}</h2>
              <p className="invoice-checkout-copy">{offer.outcome}</p>
            </div>
          </div>
        </div>

        <section className="offer-detail-grid">
          <article className="card offer-detail-card">
            <p className="eyebrow">Included</p>
            <h2>What you get</h2>
            <ul className="feature-list">
              {offer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="card offer-detail-card">
            <p className="eyebrow">Outcome</p>
            <h2>Why this matters</h2>
            <p className="merchant-subcopy">
              {settings.businessName || "TaskSats"} is being built around practical Bitcoin payment flows for
              service businesses. This offer keeps the scope focused so your
              business can start collecting Bitcoin faster without a large
              integration burden.
            </p>
            <div className="offer-note">
              <strong>Deliverable target</strong>
              <p>{offer.outcome}</p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
