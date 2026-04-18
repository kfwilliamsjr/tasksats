export type NotificationRecord = {
  id: string;
  createdAt: string;
  type: string;
  title: string;
  body: string;
};

const API_BASE_URL = "http://localhost:4175/api";

export async function fetchNotifications(): Promise<NotificationRecord[]> {
  const response = await fetch(`${API_BASE_URL}/notifications`);

  if (!response.ok) {
    throw new Error("Notification fetch failed");
  }

  const payload = (await response.json()) as {
    notifications?: NotificationRecord[];
  };

  return Array.isArray(payload.notifications) ? payload.notifications : [];
}
