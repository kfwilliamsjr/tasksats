# Claude Handoff: TaskSats Phase 1

## Current Status

TaskSats is a local-first React + Node prototype for helping service businesses accept Bitcoin payments with clear USD/BTC invoice pricing.

The current work is saved on branch:

```text
codex/phase1-foundation
```

This branch has been pushed to GitHub:

```text
https://github.com/kfwilliamsjr/tasksats/tree/codex/phase1-foundation
```

Do not assume this branch has been merged into `main`. Treat it as a safe development branch that should not affect the current live/default website unless intentionally merged or deployed.

## How To Run Locally

Install dependencies:

```bash
pnpm install
```

Run the API:

```bash
node server/server.mjs
```

The API runs at:

```text
http://localhost:4175/api
```

Build and preview the frontend:

```bash
pnpm build
pnpm preview --host 0.0.0.0 --port 4174
```

The app runs at:

```text
http://localhost:4174/
```

## What Was Built

### Public Website

- Marketing homepage for TaskSats
- Product positioning around Bitcoin payments for service businesses
- Offer/pricing cards with USD and BTC pricing
- Individual offer pages
- Request/intake flow for leads
- Strategy page and launch positioning

Key files:

```text
src/pages/HomePage.tsx
src/components.tsx
src/pages/OfferPage.tsx
src/pages/RequestPage.tsx
src/pages/StrategyPage.tsx
src/data.ts
src/styles.css
```

### Merchant Workspace

- Protected merchant dashboard
- Invoice creation form
- USD and BTC pricing
- Reference BTC calculation
- Invoice search/filter/sort
- Mark invoice paid
- Sync invoice provider state
- Lead-to-invoice conversion flow
- Source lead tracking on invoices

Key files:

```text
src/pages/MerchantPage.tsx
src/invoices.ts
src/pricing.ts
```

### Hosted Invoice Preview

- Buyer-facing invoice page
- Displays USD/BTC amount
- Shows payment status
- Shows provider invoice/session state
- Simulates checkout events
- Syncs provider state
- Displays business settings and default invoice note

Key file:

```text
src/pages/InvoicePreviewPage.tsx
```

### Leads Inbox

- Lead review workspace
- Filter/search leads
- Export leads as JSON or CSV
- Convert lead into prefilled invoice draft

Key files:

```text
src/pages/LeadsPage.tsx
src/leads.ts
```

### Notifications And Delivery Ops

- Operational notification inbox
- Delivery status tracking
- Delivery retry action
- Founder alert test flow
- Export operational records

Key files:

```text
src/pages/NotificationsPage.tsx
src/notifications.ts
src/deliveries.ts
```

### Activity / Operations Dashboard

- Provider diagnostics
- Provider switching
- Webhook guide display
- Webhook test actions
- Batch provider invoice sync
- Per-invoice sync from activity timeline
- System readiness checklist
- Environment checklist
- System export/import
- Reconciliation/sync history display
- Founder alert test

Key file:

```text
src/pages/ActivityPage.tsx
```

### Launch Settings Workspace

- Protected settings page
- Business name
- Primary/secondary domains
- Founder/support email
- Launch mode
- Default invoice note
- Settings now flow into visible UI through a shared context

Key files:

```text
src/pages/SettingsPage.tsx
src/business-settings.tsx
```

### Auth Seam

- Protected routes for merchant/admin workspaces
- Local-open sign-in when no auth secret is configured
- Server-checked sign-in when `TASKSATS_AUTH_SECRET` is configured

Key files:

```text
src/auth.tsx
src/ProtectedRoute.tsx
src/pages/SignInPage.tsx
server/server.mjs
```

## Backend Architecture

Main backend files:

```text
server/server.mjs
server/payments.mjs
server/storage.mjs
server/repositories.mjs
server/config.mjs
```

### API Responsibilities

The local Node API handles:

- Health/config checks
- Auth status/sign-in
- Business settings
- Lead capture
- Invoice CRUD/status updates
- Checkout payload generation
- Payment provider switching
- Webhook receipt and test webhooks
- Provider sync
- Batch provider sync
- Notifications
- Delivery retry
- Founder alert test
- Sync/reconciliation history
- System export/import
- Readiness diagnostics

### Storage

Persistence is currently local JSON under:

```text
data/
```

Tracked data files include:

```text
data/leads.json
data/invoices.json
data/notifications.json
data/deliveries.json
data/settings.json
```

Runtime sync history is supported through:

```text
data/sync-history.json
```

If moving to production, replace this with a database through the repository/storage abstraction rather than rewriting the whole app.

## Payment Layer

Payment logic is abstracted in:

```text
server/payments.mjs
```

Current adapters:

- `demo-lightning`
- `btcpay`

The BTCPay adapter is a configured stub / integration seam, not a final live payment processor.

It already includes:

- Provider summary
- Checkout payload shape
- Provider invoice/session state
- Webhook guide
- Webhook payload parsing
- HMAC signature verification using `BTCPAY_WEBHOOK_SECRET`
- Test webhook request signing
- Invoice provisioning seam
- Invoice sync seam

This is the main place to plug in real BTCPay API calls.

## Important Environment Variables

See:

```text
.env.example
```

Important variables:

```text
TASKSATS_PORT
TASKSATS_PAYMENT_ADAPTER
TASKSATS_NOTIFY_EMAIL
RESEND_API_KEY
TASKSATS_PUBLIC_BASE_URL
TASKSATS_DOMAIN_COM
TASKSATS_DOMAIN_AI
BTCPAY_SERVER_URL
BTCPAY_API_KEY
BTCPAY_STORE_ID
BTCPAY_WEBHOOK_SECRET
DATABASE_URL
TASKSATS_AUTH_SECRET
```

## Useful Routes

Frontend:

```text
/
/signin
/merchant
/invoice-preview
/invoice-preview/:invoiceId
/activity
/notifications
/leads
/settings
/request
/strategy
```

API:

```text
GET  /api/health
GET  /api/settings
PATCH /api/settings
GET  /api/invoices
POST /api/invoices
GET  /api/invoices/:id
GET  /api/invoices/:id/checkout
PATCH /api/invoices/:id
POST /api/invoices/:id/checkout-events
POST /api/invoices/:id/provider-sync
POST /api/invoices/provider-sync
GET  /api/leads
POST /api/leads
GET  /api/notifications
POST /api/notifications/test
GET  /api/deliveries
POST /api/deliveries/:id/retry
GET  /api/sync-history
GET  /api/payments/provider
PATCH /api/payments/provider
GET  /api/payments/webhooks
POST /api/payments/webhooks/:provider
POST /api/payments/webhooks-test/:provider
GET  /api/payments/diagnostics
GET  /api/system/storage
GET  /api/system/export
POST /api/system/import
GET  /api/system/readiness
```

## Verification Already Run

The build and server syntax checks have been run repeatedly.

Use:

```bash
node --check server/server.mjs
pnpm build
```

Both were passing at handoff.

## What Is Left To Do

### 1. Live Payment Processing

Plug in real BTCPay or other live Bitcoin/Lightning payment processor.

Start in:

```text
server/payments.mjs
```

Replace the BTCPay stub behavior with real API calls for:

- Create invoice
- Get checkout URL
- Refresh invoice status
- Parse real webhook payloads
- Confirm settled/paid state

Keep the adapter interface stable where possible:

```text
getCheckout
provisionInvoice
syncInvoice
parseWebhookEvent
verifyWebhook
buildTestWebhookRequest
getSummary
```

### 2. Production Database

Replace local JSON with durable database persistence.

Start with:

```text
server/storage.mjs
server/repositories.mjs
```

Preserve the current data models:

- leads
- invoices
- notifications
- deliveries
- settings
- sync history

### 3. Email Delivery

Wire real email delivery with `RESEND_API_KEY` and `TASKSATS_NOTIFY_EMAIL`.

Current delivery path:

```text
sendEmailDelivery
emitNotificationEvent
retryDelivery
sendNotificationTest
```

These are in:

```text
server/server.mjs
```

### 4. Production Auth

The current auth is a launch-prep seam, not final production auth.

Improve:

- Secure sessions
- Cookies or token strategy
- Role management
- Admin boundaries
- Passwordless login or provider login

Current files:

```text
src/auth.tsx
src/ProtectedRoute.tsx
src/pages/SignInPage.tsx
server/server.mjs
```

### 5. Deployment

Deploy frontend and API.

Decide:

- `tasksats.com` as primary
- `tasksats.ai` as redirect or AI-focused landing page

Set production variables:

```text
TASKSATS_PUBLIC_BASE_URL
TASKSATS_DOMAIN_COM
TASKSATS_DOMAIN_AI
DATABASE_URL
TASKSATS_AUTH_SECRET
BTCPAY_*
RESEND_API_KEY
TASKSATS_NOTIFY_EMAIL
```

### 6. Staging Review Before Merge

Do not merge `codex/phase1-foundation` into `main` until staging has been reviewed.

Suggested process:

1. Open PR from `codex/phase1-foundation`
2. Deploy branch to staging
3. Test all routes
4. Test invoice creation
5. Test payment provider switch
6. Test webhook signature flow
7. Test export/import
8. Test notification retry
9. Test lead conversion
10. Only then merge or deploy to production

## Suggested Next Task For Claude

If Claude is picking up from here, the best next task is:

```text
Create a staging/live integration plan for replacing the BTCPay stub adapter with real BTCPay API calls while preserving the current adapter interface and UI behavior.
```

Start by reading:

```text
server/payments.mjs
server/server.mjs
src/invoices.ts
src/pages/ActivityPage.tsx
src/pages/InvoicePreviewPage.tsx
DEPLOYMENT_CHECKLIST.md
```

Then implement or plan the BTCPay live adapter in small safe steps.

