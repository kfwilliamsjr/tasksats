export const BITCOIN_REFERENCE_USD = 85000;

export function parseCurrencyInput(value: string) {
  const sanitized = String(value ?? "").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatUsdValue(amount: number) {
  return `$${amount.toFixed(2)}`;
}

export function formatBtcValue(amount: number) {
  return `${amount.toFixed(8)} BTC`;
}

export function calculateBtcFromUsd(usdAmount: number, btcReferenceUsd = BITCOIN_REFERENCE_USD) {
  if (usdAmount <= 0 || btcReferenceUsd <= 0) {
    return 0;
  }

  return usdAmount / btcReferenceUsd;
}

export function validateInvoiceDraft(input: {
  client: string;
  service: string;
  amountUsd: string;
  amountBtc: string;
  status: string;
}) {
  const client = String(input.client ?? "").trim();
  const service = String(input.service ?? "").trim();
  const amountUsd = parseCurrencyInput(input.amountUsd);
  const amountBtc = parseCurrencyInput(input.amountBtc);
  const status = String(input.status ?? "").trim();
  const allowedStatuses = new Set(["Open", "Pending", "Paid"]);

  if (!client) {
    return "Client name is required.";
  }

  if (!service) {
    return "Service name is required.";
  }

  if (amountUsd <= 0) {
    return "Amount USD must be greater than zero.";
  }

  if (amountBtc <= 0) {
    return "Amount BTC must be greater than zero.";
  }

  if (!allowedStatuses.has(status)) {
    return "Invoice status must be Open, Pending, or Paid.";
  }

  return "";
}
