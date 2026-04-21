# TaskSats Phase 1

TaskSats is a local-first prototype for selling services with Bitcoin pricing,
Lightning-style checkout flows, and a simple merchant operating surface.

This repo currently includes:

- A marketing site for the TaskSats offer
- A merchant dashboard for creating and tracking invoices
- A hosted invoice preview with simulated payment progression
- An operations dashboard for provider switching, webhook tests, exports, and launch readiness
- Import and export tools for system snapshots and local restore workflows
- A launch settings workspace for business identity, domains, and operator defaults
- A local API with JSON-backed storage for leads, invoices, notifications, and deliveries
- A server-aware sign-in flow that can require `TASKSATS_AUTH_SECRET` for protected surfaces

## Local Development

Install dependencies and run the frontend:

```bash
pnpm install
pnpm dev
```

Run the local API in a separate terminal:

```bash
pnpm api
```

Frontend defaults:

- App: `http://localhost:5173`
- API: `http://localhost:4175`

## Environment Variables

Use [.env.example](/Users/keithwilliams/Documents/New%20project/.env.example) as the starting point for production setup.

Core variables:

- `TASKSATS_PORT`: API port, defaults to `4175`
- `TASKSATS_PAYMENT_ADAPTER`: active payment adapter, defaults to `demo-lightning`
- `TASKSATS_NOTIFY_EMAIL`: founder or ops inbox for delivery events
- `RESEND_API_KEY`: outbound email provider key
- `TASKSATS_PUBLIC_BASE_URL`: public hostname used for launch routing
- `TASKSATS_DOMAIN_COM`: `.com` domain readiness value
- `TASKSATS_DOMAIN_AI`: `.ai` domain readiness value
- `BTCPAY_SERVER_URL`: live BTCPay instance URL
- `BTCPAY_API_KEY`: BTCPay API credential
- `BTCPAY_STORE_ID`: BTCPay store identifier
- `BTCPAY_WEBHOOK_SECRET`: BTCPay webhook verification secret
- `DATABASE_URL`: future production database connection string
- `TASKSATS_AUTH_SECRET`: auth/session secret for protected merchant surfaces

## Current Architecture

Frontend:

- React + Vite
- Merchant, activity, invoice, lead, and notifications surfaces
- Local export tools for leads, ops records, and full system snapshots

Backend:

- Node HTTP server in [server/server.mjs](/Users/keithwilliams/Documents/New%20project/server/server.mjs)
- Repository abstraction over JSON storage
- Payment adapter seam in [server/payments.mjs](/Users/keithwilliams/Documents/New%20project/server/payments.mjs)
- Runtime config and launch-readiness signals in [server/config.mjs](/Users/keithwilliams/Documents/New%20project/server/config.mjs)
- System export and import endpoints for operational backup and restore

Data:

- Local JSON records under [data](/Users/keithwilliams/Documents/New%20project/data)

## What Is Production-Ready vs. Pending

Strong today:

- Product narrative and service positioning
- Invoice creation and tracking
- USD and BTC dual-price presentation
- Simulated checkout and webhook workflows
- Internal ops visibility and export paths

Still pending for live launch:

- Real Lightning provider integration
- Durable production database
- Full auth hardening and durable session protection
- Deployed hosting and public routing
- Real environment variable population

## Suggested Launch Sequence

1. Decide whether `tasksats.com` or `tasksats.ai` is the primary public entry point.
2. Set `TASKSATS_PUBLIC_BASE_URL` plus the chosen domain variables.
3. Configure `BTCPAY_SERVER_URL`, `BTCPAY_API_KEY`, `BTCPAY_STORE_ID`, and `BTCPAY_WEBHOOK_SECRET`.
4. Replace `demo-lightning` with a live provider implementation.
5. Configure `TASKSATS_NOTIFY_EMAIL` and `RESEND_API_KEY`.
6. Move persistence from local JSON to a real database using `DATABASE_URL`.
7. Set `TASKSATS_AUTH_SECRET` before exposing merchant/admin routes.
8. Deploy frontend and API, then verify the readiness checklist inside the activity dashboard.

## Sign-In Behavior

Protected routes now use a server-aware sign-in flow:

- If `TASKSATS_AUTH_SECRET` is empty, the prototype stays in an open local sign-in mode.
- If `TASKSATS_AUTH_SECRET` is set, the sign-in page requires that secret before it will create a session.
- The current implementation still stores the resulting session locally in the browser, so this is a launch-prep seam rather than a final production auth system.

## Webhook Verification

The BTCPay path now expects a signed webhook request before invoice state can be updated through
`/api/payments/webhooks/btcpay`.

Current scaffold behavior:

- Webhook verification uses `BTCPAY_WEBHOOK_SECRET`
- The server checks the `btcpay-sig` header first, then `x-btcpay-sig`, then `x-tasksats-signature`
- The expected signature is an HMAC-SHA256 of the raw request body
- The server accepts either a plain hex digest or a `sha256=<digest>` value

This is still a staged integration, but it gives the BTCPay route a real authenticity gate instead
of trusting any JSON payload that looks valid.
