export type InvoiceRecord = {
  id: string;
  createdAt: string;
  client: string;
  service: string;
  amountUsd: string;
  amountBtc: string;
  status: string;
};

const INVOICES_STORAGE_KEY = "tasksats_phase1_invoices";
const API_BASE_URL = "http://localhost:4175/api";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getStoredInvoices(): InvoiceRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(INVOICES_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as InvoiceRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchInvoices(): Promise<InvoiceRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`);

    if (!response.ok) {
      throw new Error("Invoice fetch failed");
    }

    const payload = (await response.json()) as { invoices?: InvoiceRecord[] };
    const invoices = Array.isArray(payload.invoices) ? payload.invoices : [];

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return invoices;
  } catch {
    return getStoredInvoices();
  }
}

export async function fetchInvoiceById(id: string): Promise<InvoiceRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`);

    if (!response.ok) {
      throw new Error("Invoice fetch failed");
    }

    const payload = (await response.json()) as { invoice?: InvoiceRecord };
    return payload.invoice ?? null;
  } catch {
    const invoices = getStoredInvoices();
    return invoices.find((invoice) => invoice.id === id) ?? null;
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
): Promise<InvoiceRecord | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error("Invoice update failed");
    }

    const payload = (await response.json()) as { invoice?: InvoiceRecord };
    const invoices = await fetchInvoices();

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return payload.invoice ?? null;
  } catch {
    if (!canUseStorage()) {
      return null;
    }

    const invoices = getStoredInvoices();
    const index = invoices.findIndex((invoice) => invoice.id === id);

    if (index === -1) {
      return null;
    }

    const nextInvoice = { ...invoices[index], status };
    const nextInvoices = [...invoices];
    nextInvoices[index] = nextInvoice;
    window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(nextInvoices));
    return nextInvoice;
  }
}

export async function saveInvoice(
  input: Omit<InvoiceRecord, "id" | "createdAt">,
): Promise<InvoiceRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Invoice save failed");
    }

    const payload = (await response.json()) as { invoice: InvoiceRecord };
    const invoices = await fetchInvoices();

    if (canUseStorage()) {
      window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
    }

    return payload.invoice;
  } catch {
    const nextInvoice: InvoiceRecord = {
      ...input,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (!canUseStorage()) {
      return nextInvoice;
    }

    const current = getStoredInvoices();
    const next = [nextInvoice, ...current];
    window.localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(next));
    return nextInvoice;
  }
}
