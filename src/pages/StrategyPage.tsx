import { Link } from "react-router-dom";

const revenueScenarios = [
  {
    label: "Early real business",
    value: "25 merchants",
    detail:
      "$50 average monthly revenue per merchant can translate to about $1,250 MRR before setup revenue.",
  },
  {
    label: "Healthy niche operator",
    value: "100 merchants",
    detail:
      "$75 average monthly revenue per merchant can translate to about $7,500 MRR plus onboarding revenue.",
  },
  {
    label: "Strong niche company",
    value: "300 merchants",
    detail:
      "$100-$150 average monthly revenue per merchant can translate to roughly $30,000-$45,000 MRR.",
  },
];

export function StrategyPage() {
  return (
    <main className="page-shell">
      <div className="site-shell strategy-shell">
        <section className="strategy-hero card">
          <div>
            <p className="eyebrow">Business strategy</p>
            <h1>Why TaskSats can exist next to PayPal, Cash App, or Stripe.</h1>
            <p className="merchant-subcopy">
              TaskSats wins only if it serves a narrower customer more deeply.
              The company should be positioned as the Bitcoin and Lightning
              payment layer for service businesses, with a later path toward
              agent-powered commerce.
            </p>
          </div>
          <div className="topbar-actions">
            <Link className="primary-button" to="/request">
              Start a request
            </Link>
            <Link className="ghost-button" to="/">
              Back to homepage
            </Link>
          </div>
        </section>

        <section className="strategy-grid">
          <article className="card strategy-card">
            <p className="invoice-label">Target customer</p>
            <h2>Service businesses with a reason to care about Bitcoin.</h2>
            <ul className="feature-list">
              <li>Freelancers and consultants</li>
              <li>Agencies and boutique firms</li>
              <li>Bitcoin-native online businesses</li>
              <li>Digital service operators with global clients</li>
            </ul>
          </article>

          <article className="card strategy-card">
            <p className="invoice-label">Why not everyone</p>
            <h2>The wedge matters more than broad market share.</h2>
            <p className="merchant-subcopy">
              If TaskSats becomes “PayPal but with Bitcoin,” it is weak. If it
              becomes the best Bitcoin payment product for service businesses, it
              becomes much more defensible.
            </p>
          </article>
        </section>

        <section className="strategy-grid">
          <article className="card strategy-card">
            <p className="invoice-label">Pricing model</p>
            <h2>Start with setup plus SaaS.</h2>
            <ul className="feature-list">
              <li>Setup or onboarding fee for implementation</li>
              <li>Monthly software fee for payment tooling</li>
              <li>Optional usage or premium feature pricing later</li>
            </ul>
          </article>

          <article className="card strategy-card">
            <p className="invoice-label">Core message</p>
            <h2>What the product should say in one sentence.</h2>
            <p className="merchant-subcopy">
              TaskSats gives service businesses a Bitcoin-native way to invoice,
              collect, and automate payments that legacy platforms do not design
              for deeply.
            </p>
          </article>
        </section>

        <section className="strategy-scenarios">
          <div className="section-header">
            <p className="eyebrow">Revenue scenarios</p>
            <h2>What a focused niche version of this business could look like.</h2>
          </div>
          <div className="strategy-scenario-grid">
            {revenueScenarios.map((scenario) => (
              <article className="card strategy-card" key={scenario.label}>
                <p className="invoice-label">{scenario.label}</p>
                <h2>{scenario.value}</h2>
                <p className="merchant-subcopy">{scenario.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="strategy-cta card">
          <p className="invoice-label">Recommendation</p>
          <h2>Build the Bitcoin payment workflow first. Earn trust. Then expand.</h2>
          <p className="merchant-subcopy">
            The shortest path to revenue is not trying to replace PayPal. It is
            helping a narrower kind of merchant accept Bitcoin in a way that
            feels more professional and more operationally useful.
          </p>
        </section>
      </div>
    </main>
  );
}
