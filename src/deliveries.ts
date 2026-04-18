export type DeliveryRecord = {
  id: string;
  createdAt: string;
  notificationId: string;
  channel: string;
  target: string;
  subject: string;
  body: string;
  status: string;
  detail: string;
};

const API_BASE_URL = "http://localhost:4175/api";

export async function fetchDeliveries(): Promise<DeliveryRecord[]> {
  const response = await fetch(`${API_BASE_URL}/deliveries`);

  if (!response.ok) {
    throw new Error("Delivery fetch failed");
  }

  const payload = (await response.json()) as { deliveries?: DeliveryRecord[] };
  return Array.isArray(payload.deliveries) ? payload.deliveries : [];
}
