# TaskSats Deployment Checklist

This file turns the current prototype into a concrete launch checklist for `tasksats.com` and `tasksats.ai`.

## 1. Domain Strategy

- Choose the primary public domain:
  - `tasksats.com` for trust and broad-market positioning
  - `tasksats.ai` if you want the AI angle to lead
- Point both domains at the final hosting provider if you want one to redirect to the other.
- Set:
  - `TASKSATS_PUBLIC_BASE_URL`
  - `TASKSATS_DOMAIN_COM`
  - `TASKSATS_DOMAIN_AI`

## 2. Payments

- Replace the simulated adapter with a live Lightning integration.
- Set:
  - `BTCPAY_SERVER_URL`
  - `BTCPAY_API_KEY`
  - `BTCPAY_STORE_ID`
  - `BTCPAY_WEBHOOK_SECRET`
- Keep the existing payment adapter seam so provider changes stay isolated.
- Verify:
  - hosted checkout creation
  - webhook signature verification
  - webhook receipt
  - payment detected events
  - payment confirmed events
  - invoice status sync

## 3. Notifications

- Set `TASKSATS_NOTIFY_EMAIL`
- Set `RESEND_API_KEY`
- Confirm the founder inbox receives:
  - new lead alerts
  - invoice created alerts
  - payment state updates
  - webhook activity
- Run the dashboard-based founder alert test and confirm the delivery record reports `sent` or an expected staging status

## 4. Data Layer

- Replace local JSON with a production database
- Set `DATABASE_URL`
- Preserve current data models for:
  - leads
  - invoices
  - notifications
  - deliveries
- Preserve sync-history records used for reconciliation and provider refresh auditing
- Use the system export endpoint as a migration handoff source before cutover
- Test the system import flow with a fresh local workspace so backup restore is proven before launch

## 5. Security and Access

- Set `TASKSATS_AUTH_SECRET`
- Harden protected merchant routes
- Review:
  - session handling
  - admin access boundaries
  - environment-secret storage

## 6. Final Launch Review

- Run frontend build
- Run API locally with production-like environment variables
- Confirm the activity dashboard shows the environment checklist as configured
- Export a final system snapshot before launch
- Verify that a system snapshot can be imported into a clean environment
- Test both public domain routing and merchant operations flow end to end
