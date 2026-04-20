import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { fetchAuthStatus, signInWithServer, useAuth, type AuthRole, type AuthStatus } from "../auth";

export function SignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    role: "merchant" as AuthRole,
    passphrase: "",
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
    setFormError("");
  }

  useEffect(() => {
    void fetchAuthStatus().then(setAuthStatus);
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const result = await signInWithServer({
        name: formState.name.trim() || "TaskSats User",
        email: formState.email.trim(),
        role: formState.role,
        passphrase: formState.passphrase.trim(),
      });
      signIn(result.session);
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <div className="site-shell simple-page-shell">
        <div className="simple-page-card card signin-card">
          <p className="eyebrow">Sign in</p>
          <h1>Access protected TaskSats workspaces.</h1>
          <p className="merchant-subcopy">
            This Phase 1 auth layer now checks the local API before granting access, so
            merchant and admin workspaces can reflect whether the server is open-local or
            protected by a TaskSats auth secret.
          </p>
          {authStatus ? <p className="form-hint">{authStatus.message}</p> : null}

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

            {authStatus?.enabled ? (
              <label className="form-field">
                <span>Auth secret</span>
                <input
                  type="password"
                  value={formState.passphrase}
                  onChange={(event) => updateField("passphrase", event.target.value)}
                  placeholder="Enter TaskSats auth secret"
                  required
                />
              </label>
            ) : null}

            {formError ? <p className="form-error">{formError}</p> : null}

            <div className="request-form-footer">
              <Link className="ghost-button" to="/">
                Back home
              </Link>
              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
