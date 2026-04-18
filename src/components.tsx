import { Link } from "react-router-dom";
import { useAuth } from "./auth";
import {
  flowCards,
  growthPhases,
  invoicePreview,
  offerCards,
  pricingCards,
  roadmapPhases,
} from "./data";

export function SiteHeader() {
  const { session, isAuthenticated, signOut } = useAuth();

  return (
    <header className="topbar">
      <a href="#hero" className="brand">
        <span className="brand-mark">T</span>
        <span className="brand-copy">
          <strong>TaskSats</strong>
          <span>Bitcoin payments for service businesses</span>
        </span>
      </a>

      <nav className="topnav">
        <a href="#product">Product</a>
        <a href="#pricing">Pricing</a>
        <Link to="/strategy">Strategy</Link>
        <a href="#how-it-works">How It Works</a>
        <a href="#domains">Domains</a>
      </nav>

      <div className="topbar-actions">
        {isAuthenticated ? (
          <>
            <Link className="ghost-button" to="/merchant">
              Workspace
            </Link>
            <Link className="ghost-button" to="/notifications">
              Notifications
            </Link>
          </>
        ) : null}
        <Link className="ghost-button" to="/invoice-preview">
          Pay Invoice
        </Link>
        {isAuthenticated ? (
          <button className="primary-button" type="button" onClick={signOut}>
            Sign out {session?.name ? `(${session.name})` : ""}
          </button>
        ) : (
          <Link className="primary-button" to="/signin">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

export function HeroSection() {
  return (
    <section className="hero" id="hero">
      <div className="hero-copy card">
        <p className="eyebrow">Phase 1</p>
        <h1>
          Help more people
          <span>pay with Bitcoin.</span>
        </h1>
        <p className="hero-text">
          TaskSats helps service businesses create invoices, accept Bitcoin and
          Lightning payments, and deliver a checkout flow that feels clear
          enough for mainstream buyers to trust.
        </p>
        <div className="hero-actions">
          <a className="primary-button" href="#product">
            See The Product
          </a>
          <Link className="secondary-button" to="/request">
            Request Setup
          </Link>
        </div>
        <ul className="signal-row">
          <li>Bitcoin invoices</li>
          <li>Lightning checkout</li>
          <li>Dual USD / BTC pricing</li>
          <li>Built for reliability</li>
        </ul>
      </div>

      <div className="hero-panel card">
        <div className="metric-card inner-card">
          <span className="metric-label">Positioning</span>
          <strong>One product first. Reliable Bitcoin payments for services.</strong>
          <p>
            The Phase 1 product stays narrow on purpose so it can become a
            dependable business before it becomes a broader platform.
          </p>
        </div>

        <div className="payment-mock inner-card">
          <div className="payment-topline">
            <span>Invoice #{invoicePreview.id}</span>
            <span>Awaiting payment</span>
          </div>
          <div className="payment-amount">
            <strong>{invoicePreview.amountUsd}</strong>
            <span>{invoicePreview.amountBtc}</span>
          </div>
          <div className="qr-shell" aria-hidden="true">
            <div className="qr-grid">
              {Array.from({ length: 16 }).map((_, index) => (
                <span key={index} />
              ))}
            </div>
          </div>
          <div className="payment-status">
            <div>
              <span className="status-dot" />
              Lightning invoice live
            </div>
            <button className="inline-button" type="button">
              Confirmation via webhook
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustStrip() {
  return (
    <section className="trust-strip" aria-label="Trust indicators">
      <p>Built for service businesses that want to accept Bitcoin.</p>
      <p>Fast onboarding</p>
      <p>Instant settlement</p>
      <p>Simple invoice flow</p>
      <p>Modern Bitcoin-native brand</p>
    </section>
  );
}

export function WhyTaskSatsSection() {
  return (
    <section className="why-section">
      <div className="section-header">
        <p className="eyebrow">Why TaskSats</p>
        <h2>Not PayPal with Bitcoin. A focused payment layer for service businesses.</h2>
      </div>

      <div className="why-grid">
        <article className="card why-card why-card--large">
          <p className="invoice-label">The wedge</p>
          <h3>
            TaskSats gives service businesses a Bitcoin-native way to invoice,
            collect, and automate payments that legacy platforms do not design
            for deeply.
          </h3>
          <p>
            The goal is not to out-PayPal PayPal. The goal is to serve a
            narrower merchant with a stronger reason to care: service businesses
            that want a professional Bitcoin and Lightning payment experience.
          </p>
        </article>

        <article className="card why-card">
          <p className="invoice-label">Why choose it</p>
          <ul className="feature-list">
            <li>Dual USD and BTC pricing in one clean flow</li>
            <li>Bitcoin-native invoice and checkout experience</li>
            <li>Better fit for online service businesses</li>
            <li>Clear path toward agent-powered payment workflows</li>
          </ul>
        </article>

        <article className="card why-card">
          <p className="invoice-label">What it is not</p>
          <ul className="feature-list">
            <li>Not a generic consumer wallet</li>
            <li>Not a broad retail checkout platform</li>
            <li>Not a direct PayPal clone</li>
            <li>Not an AI trading product in Phase 1</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

export function ProductSection() {
  return (
    <section className="story-grid" id="product">
      <article className="story-card story-large card">
        <p className="eyebrow">What TaskSats sells</p>
        <h2>A simple way for service businesses to accept Bitcoin payments.</h2>
        <p>
          If you sell a service, TaskSats helps you invoice, collect, and
          confirm Bitcoin payments without confusing your customer.
        </p>
      </article>

      {offerCards.map((card) => (
        <article className="story-card card" key={card.title}>
          <h3>{card.title}</h3>
          <p>{card.description}</p>
          <span>{card.example}</span>
        </article>
      ))}
    </section>
  );
}

export function PricingSection() {
  return (
    <section className="pricing-section" id="pricing">
      <div className="section-header">
        <p className="eyebrow">Phase 1 offers</p>
        <h2>Start with a few clear payment products people can understand fast.</h2>
      </div>

      <div className="pricing-grid">
        {pricingCards.map((card) => (
          <article
            className={`pricing-card card ${card.featured ? "featured-pricing" : ""}`}
            key={card.title}
          >
            <p className="pricing-kicker">{card.kicker}</p>
            <h3>{card.title}</h3>
            <p className="pricing-copy">{card.description}</p>
            <div className="pricing-amount">
              <strong>{card.priceUsd}</strong>
              <span>{card.priceBtc}</span>
            </div>
            <ul className="feature-list">
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="pricing-actions">
              <Link className="primary-button" to={`/offers/${card.slug}`}>
                View Offer
              </Link>
              <Link className="ghost-button" to={`/request?offer=${card.slug}`}>
                Request This
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="split-section" id="how-it-works">
      <div className="split-copy">
        <p className="eyebrow">How it works</p>
        <h2>Simple enough for the masses. Strong enough for a business.</h2>
        <p>
          The public experience should stay straightforward: the merchant
          creates an invoice, the buyer pays in Bitcoin, and both sides get a
          clean confirmation flow.
        </p>
      </div>

      <div className="steps-panel card">
        <article>
          <span>01</span>
          <h3>Create an invoice</h3>
          <p>
            Set the amount in USD, show the Bitcoin equivalent, and generate a
            hosted payment page.
          </p>
        </article>
        <article>
          <span>02</span>
          <h3>Customer pays with Bitcoin</h3>
          <p>Use Lightning for the fastest and easiest checkout experience.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Payment is confirmed</h3>
          <p>Merchant and client both see the status immediately and clearly.</p>
        </article>
      </div>
    </section>
  );
}

export function PaymentFlowSection() {
  return (
    <section className="lightning-section">
      <div className="section-header">
        <p className="eyebrow">Lightning payment preview</p>
        <h2>A payment flow that feels understandable even to first-time users.</h2>
      </div>

      <div className="flow-grid">
        {flowCards.map((card) => (
          <article
            className={`flow-card card ${card.featured ? "active-flow" : ""}`}
            key={card.title}
          >
            <h3>{card.label}</h3>
            <p className="flow-title">{card.title}</p>
            <p>{card.description}</p>
          </article>
        ))}
      </div>

      <div className="invoice-demo card" id="invoice">
        <div className="invoice-sidebar">
          <p className="invoice-label">Client invoice</p>
          <h3>Bitcoin payment request</h3>
          <ul>
            <li>Service label and merchant name</li>
            <li>Quoted amount in USD with BTC conversion</li>
            <li>Bitcoin Lightning checkout</li>
          </ul>
        </div>
        <div className="invoice-main">
          <div className="invoice-row">
            <span>Quoted total</span>
            <strong>{invoicePreview.openAmount}</strong>
          </div>
          <div className="invoice-row">
            <span>Payment method</span>
            <strong>Bitcoin Lightning with USD reference pricing</strong>
          </div>
          <div className="invoice-row">
            <span>Status</span>
            <strong>Invoice open</strong>
          </div>
          <div className="invoice-actions">
            <Link className="primary-button" to="/invoice-preview">
              Open checkout preview
            </Link>
            <Link className="ghost-button" to="/merchant">
              Merchant view
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function DomainSection() {
  return (
    <section className="domains-section" id="domains">
      <div className="section-header">
        <p className="eyebrow">Domain strategy</p>
        <h2>Use both domains, but give each one a clear job.</h2>
      </div>

      <div className="domains-grid domains-grid--two">
        <article className="domain-card card">
          <h3>tasksats.com</h3>
          <p>
            Use this as the primary public business domain. It feels more
            established, more trusted, and more universal for merchants and
            mainstream buyers.
          </p>
          <span>Recommended primary brand domain</span>
        </article>

        <article className="domain-card card">
          <h3>tasksats.ai</h3>
          <p>
            Use this for campaigns, experiments, AI-focused positioning, or
            future product surfaces tied to automations and agent workflows.
          </p>
          <span>Recommended secondary or campaign domain</span>
        </article>
      </div>
    </section>
  );
}

export function GrowthSection() {
  return (
    <section className="vendors-section">
      <div className="section-header">
        <p className="eyebrow">Growth path</p>
        <h2>Start with payments. Expand only after trust is earned.</h2>
      </div>

      <div className="vendors-grid">
        {growthPhases.map((phase) => (
          <article className="vendor-column card" key={phase.title}>
            <h3>{phase.title}</h3>
            <p>{phase.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section className="roadmap-section">
      <div className="section-header">
        <p className="eyebrow">Suggested roadmap</p>
        <h2>Build the payment product first, then add account infrastructure.</h2>
      </div>
      <div className="roadmap-list">
        {roadmapPhases.map((phase, index) => (
          <article className="card" key={phase}>
            <span>Phase {index + 1}</span>
            <p>{phase}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="cta-section card" id="cta">
      <div>
        <p className="eyebrow">Decision point</p>
        <h2>Phase 1 is ready to become a real production build.</h2>
      </div>
      <div className="cta-actions">
        <Link className="primary-button" to="/request">
          Start A Request
        </Link>
        <a className="secondary-button" href="#pricing">
          View Launch Offer
        </a>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <strong>TaskSats</strong>
        <p>Bitcoin payments for service businesses.</p>
      </div>
      <div>
        <span>Primary domain</span>
        <strong>tasksats.com</strong>
      </div>
      <div>
        <span>Expansion domain</span>
        <strong>tasksats.ai</strong>
      </div>
      <div>
        <span>Business model</span>
        <Link to="/strategy">View strategy</Link>
      </div>
      <div>
        <span>Operations</span>
        <Link to="/notifications">Notification inbox</Link>
      </div>
    </footer>
  );
}
