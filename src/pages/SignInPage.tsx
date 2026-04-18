import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, type AuthRole } from "../auth";

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "merchant" as AuthRole,
  });

  const destination =
    typeof location.state === "object" &&
    location.state &&
    "from" in location.state &&
    typeof location.state.from === "string"
      ? location.state.from
      : "/merchant";

  function updateField<K extends keyof typeof formState>(field: K, value: (typeof formState)[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    signIn({
      name: formState.name.trim() || "TaskSats User",
      email: formState.email.trim(),
      role: formState.role,
    });
    navigate(destination, { replace: true });
  }

  return (
    <main className="page-shell">
      <div className="site-shell simple-page-shell">
        <div className="simple-page-card card signin-card">
          <p className="eyebrow">Sign in</p>
          <h1>Access protected TaskSats workspaces.</h1>
          <p className="merchant-subcopy">
            This is a local Phase 1 auth layer. It protects merchant and admin-style
            surfaces now and can later be replaced by Supabase or another real auth
            provider.
          </p>

          <form className="request-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Name</span>
              <input
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className="form-field">
              <span>Email</span>
              <input
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@tasksats.com"
                required
              />
            </label>

            <label className="form-field">
              <span>Role</span>
              <select
                value={formState.role}
                onChange={(event) => updateField("role", event.target.value as AuthRole)}
              >
                <option value="merchant">Merchant</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="request-form-footer">
              <Link className="ghost-button" to="/">
                Back home
              </Link>
              <button className="primary-button" type="submit">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
