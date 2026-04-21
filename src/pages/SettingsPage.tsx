import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchBusinessSettings,
  updateBusinessSettings,
  type BusinessSettings,
} from "../invoices";

const defaultSettings: BusinessSettings = {
  businessName: "TaskSats",
  primaryDomain: "tasksats.com",
  secondaryDomain: "tasksats.ai",
  founderEmail: "",
  supportEmail: "",
  launchMode: "local-prototype",
  defaultInvoiceNote: "Bitcoin payments for service businesses.",
};

export function SettingsPage() {
  const [formState, setFormState] = useState<BusinessSettings>(defaultSettings);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void fetchBusinessSettings().then((settings) => {
      if (settings) {
        setFormState({
          ...defaultSettings,
          ...settings,
        });
      }
    });
  }, []);

  function updateField<K extends keyof BusinessSettings>(field: K, value: string) {
    setFormState((current) => ({ ...current, [field]: value }));
    setStatusMessage("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setStatusMessage("");

    try {
      const settings = await updateBusinessSettings(formState);
      setFormState({
        ...defaultSettings,
        ...settings,
      });
      setStatusMessage("Launch settings saved locally.");
    } catch {
      setStatusMessage("Launch settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="site-shell merchant-shell">
        <div className="merchant-header">
          <div>
            <p className="eyebrow">Launch settings</p>
            <h1>Business identity and rollout defaults</h1>
            <p className="merchant-subcopy">
              This workspace keeps your non-secret launch configuration in one place so domains,
              operator info, and business defaults are ready before you plug in live payments.
            </p>
          </div>
          <div className="topbar-actions">
            <Link className="ghost-button" to="/merchant">
              Merchant
            </Link>
            <Link className="ghost-button" to="/activity">
              Activity
            </Link>
            <Link className="primary-button" to="/">
              Homepage
            </Link>
          </div>
        </div>

        <section className="merchant-stats-grid">
          <article className="card merchant-stat-card">
            <p>Business</p>
            <strong>{formState.businessName || "TaskSats"}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Primary domain</p>
            <strong>{formState.primaryDomain || "Not set"}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Launch mode</p>
            <strong>{formState.launchMode || "local-prototype"}</strong>
          </article>
          <article className="card merchant-stat-card">
            <p>Founder inbox</p>
            <strong>{formState.founderEmail || "Not set"}</strong>
          </article>
        </section>

        <section className="merchant-content-grid">
          <article className="card merchant-panel">
            <div className="merchant-panel-header">
              <div>
                <p className="eyebrow">Settings</p>
                <h2>Prepare the business layer</h2>
              </div>
            </div>

            <form className="request-form merchant-create-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label className="form-field">
                  <span>Business name</span>
                  <input
                    value={formState.businessName ?? ""}
                    onChange={(event) => updateField("businessName", event.target.value)}
                    placeholder="TaskSats"
                  />
                </label>

                <label className="form-field">
                  <span>Launch mode</span>
                  <select
                    value={formState.launchMode ?? "local-prototype"}
                    onChange={(event) => updateField("launchMode", event.target.value)}
                  >
                    <option value="local-prototype">Local prototype</option>
                    <option value="staging">Staging</option>
                    <option value="launch-ready">Launch ready</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Primary domain</span>
                  <input
                    value={formState.primaryDomain ?? ""}
                    onChange={(event) => updateField("primaryDomain", event.target.value)}
                    placeholder="tasksats.com"
                  />
                </label>

                <label className="form-field">
                  <span>Secondary domain</span>
                  <input
                    value={formState.secondaryDomain ?? ""}
                    onChange={(event) => updateField("secondaryDomain", event.target.value)}
                    placeholder="tasksats.ai"
                  />
                </label>

                <label className="form-field">
                  <span>Founder email</span>
                  <input
                    type="email"
                    value={formState.founderEmail ?? ""}
                    onChange={(event) => updateField("founderEmail", event.target.value)}
                    placeholder="founder@tasksats.com"
                  />
                </label>

                <label className="form-field">
                  <span>Support email</span>
                  <input
                    type="email"
                    value={formState.supportEmail ?? ""}
                    onChange={(event) => updateField("supportEmail", event.target.value)}
                    placeholder="support@tasksats.com"
                  />
                </label>
              </div>

              <label className="form-field">
                <span>Default invoice note</span>
                <textarea
                  value={formState.defaultInvoiceNote ?? ""}
                  onChange={(event) => updateField("defaultInvoiceNote", event.target.value)}
                  placeholder="Bitcoin payments for service businesses."
                  rows={4}
                />
              </label>

              {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}

              <div className="request-form-footer">
                <div className="request-form-note">Save local launch defaults for the business</div>
                <button className="primary-button" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save settings"}
                </button>
              </div>
            </form>
          </article>

          <aside className="card merchant-panel merchant-panel--aside">
            <p className="eyebrow">Why this matters</p>
            <h2>Keep business setup separate from secret keys</h2>
            <ul className="feature-list">
              <li>Lets you shape the launch brand before deployment</li>
              <li>Keeps domains and operator details visible to the team</li>
              <li>Prepares clean handoff points for live integrations later</li>
              <li>Avoids hiding core business identity only in environment variables</li>
            </ul>
          </aside>
        </section>
      </div>
    </main>
  );
}
