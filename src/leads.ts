export type LeadRecord = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  company: string;
  offer: string;
  budget: string;
  details: string;
};

const LEADS_STORAGE_KEY = "tasksats_phase1_leads";
const API_BASE_URL = "http://localhost:4175/api";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getLeadRecords(): LeadRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(LEADS_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LeadRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function fetchLeadRecords(): Promise<LeadRecord[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`);

    if (!response.ok) {
      throw new Error("Lead fetch failed");
    }

    const payload = (await response.json()) as { leads?: LeadRecord[] };
    const leads = Array.isArray(payload.leads) ? payload.leads : [];

    if (canUseStorage()) {
      window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    }

    return leads;
  } catch {
    return getLeadRecords();
  }
}

export async function saveLeadRecord(
  input: Omit<LeadRecord, "id" | "createdAt">,
): Promise<LeadRecord> {
  try {
    const response = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error("Lead save failed");
    }

    const payload = (await response.json()) as { lead: LeadRecord };
    const leads = await fetchLeadRecords();

    if (canUseStorage()) {
      window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    }

    return payload.lead;
  } catch {
    const nextLead: LeadRecord = {
      ...input,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (!canUseStorage()) {
      return nextLead;
    }

    const current = getLeadRecords();
    const next = [nextLead, ...current];
    window.localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(next));
    return nextLead;
  }
}
