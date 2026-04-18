export const offerCards = [
  {
    title: "Bitcoin Invoices",
    description:
      "Create a payment request in minutes, price in USD, and show the Bitcoin equivalent in a checkout flow customers can understand.",
    example: "$125.00 USD / 0.00146 BTC",
  },
  {
    title: "Payment Links",
    description:
      "Share hosted payment pages for retainers, deposits, invoices, and one-off service work.",
    example: "$500.00 USD / 0.00585 BTC",
  },
  {
    title: "Confirmation and Tracking",
    description:
      "Keep payment status clear for both the merchant and buyer so the handoff from payment to fulfillment stays dependable.",
    example: "$2,400.00 USD / 0.02807 BTC",
  },
] as const;

export const pricingCards = [
  {
    slug: "hosted-bitcoin-invoice",
    kicker: "Best launch offer",
    title: "Hosted Bitcoin Invoice",
    description:
      "A branded invoice page for service businesses that want to quote in USD, accept Bitcoin over Lightning, and confirm payment cleanly.",
    priceUsd: "$49.00 USD",
    priceBtc: "0.00057 BTC",
    featured: true,
    items: [
      "Custom service label",
      "Dual USD / BTC display",
      "Hosted checkout page",
      "Payment status confirmation",
    ],
    idealFor:
      "Consultants, agencies, freelancers, and service operators who want a clean way to send a Bitcoin payment request without building custom checkout logic.",
    timeline: "1-3 business days",
    outcome:
      "A branded invoice experience your client can understand, with USD reference pricing and a Bitcoin-native checkout surface.",
  },
  {
    slug: "payment-link-toolkit",
    kicker: "For repeat sellers",
    title: "Payment Link Toolkit",
    description:
      "Reusable payment links for deposits, fixed-fee services, and quick invoices.",
    priceUsd: "$149.00 USD",
    priceBtc: "0.00174 BTC",
    featured: false,
    items: [
      "Saved payment templates",
      "Faster merchant workflow",
      "Simple customer checkout",
      "Email-ready invoice links",
    ],
    idealFor:
      "Businesses that charge similar amounts often and want repeatable payment flows for deposits, onboarding fees, retainers, or one-off work.",
    timeline: "3-5 business days",
    outcome:
      "A small library of reusable payment experiences that make it easier to collect Bitcoin payments consistently.",
  },
  {
    slug: "payments-launch-setup",
    kicker: "Business setup",
    title: "Payments Launch Setup",
    description:
      "A higher-touch onboarding package for businesses that want help moving part of their service operation to Bitcoin.",
    priceUsd: "$750.00 USD",
    priceBtc: "0.00878 BTC",
    featured: false,
    items: [
      "Checkout setup guidance",
      "Offer and invoice structure",
      "Payment operations checklist",
      "Launch support",
    ],
    idealFor:
      "Service businesses that want help shaping the offer, checkout, and operational workflow around Bitcoin payments rather than just buying a page template.",
    timeline: "1-2 weeks",
    outcome:
      "A clearer Bitcoin payment offer, launch guidance, and a better operational path for taking customer payments reliably.",
  },
] as const;

export const flowCards = [
  {
    label: "Product",
    title: "Bitcoin invoice creation",
    description:
      "Merchants create a clean invoice page for services, retainers, deposits, or one-time jobs.",
    featured: false,
  },
  {
    label: "Experience",
    title: "Mass-market friendly checkout",
    description:
      "The buyer gets a simple page, a clear amount, and an obvious way to complete payment over Lightning.",
    featured: false,
  },
  {
    label: "Recommended for launch",
    title: "Build around one dependable payment product",
    description:
      "Faster to ship, easier to explain, and more credible than trying to launch a full marketplace too early.",
    featured: true,
  },
] as const;

export const growthPhases = [
  {
    title: "Launch phase",
    description:
      "Be the best at one thing: helping service businesses accept Bitcoin through a clean, dependable flow.",
  },
  {
    title: "Growth phase",
    description:
      "Add merchant accounts, saved payment links, notifications, and reporting once usage is consistent.",
  },
  {
    title: "Expansion phase",
    description:
      "Consider broader commerce or marketplace tools only after the core payment product is proven and repeatable.",
  },
] as const;

export const roadmapPhases = [
  "Marketing site, dual USD/BTC invoice creation, hosted checkout, payment confirmation.",
  "Merchant dashboard, payment history, notifications, and basic admin.",
  "Saved links, recurring use cases, and selective product expansion.",
] as const;

export const invoicePreview = {
  id: "TS-2048",
  amountUsd: "$84.00 USD",
  amountBtc: "0.00098 BTC",
  openAmount: "$240.00 USD / 0.00281 BTC",
};

export function getOfferBySlug(slug: string) {
  return pricingCards.find((card) => card.slug === slug);
}

export function getOfferLabel(slug: string) {
  return getOfferBySlug(slug)?.title ?? "Custom request";
}
