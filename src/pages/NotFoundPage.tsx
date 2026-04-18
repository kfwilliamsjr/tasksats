import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="page-shell">
      <div className="site-shell simple-page-shell">
        <div className="simple-page-card card">
          <p className="eyebrow">Page not found</p>
          <h1>This route is not part of TaskSats yet.</h1>
          <p className="merchant-subcopy">
            Head back to the homepage or continue into the invoice and merchant
            preview flows.
          </p>
          <div className="topbar-actions">
            <Link className="primary-button" to="/">
              Homepage
            </Link>
            <Link className="ghost-button" to="/invoice-preview">
              Invoice preview
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
