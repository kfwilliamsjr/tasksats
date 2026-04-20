export type NotificationRecord = {
  id: string;
  createdAt: string;
  type: string;
  title: string;
  body: string;
  source?: string;
  invoiceId?: string;
  providerKey?: string;
};

export type NotificationTestResult = {
  ok: boolean;
  notification?: NotificationRecord;
  delivery?: {
    id: string;
    status: string;
    detail: string;
    target: string;
  } | null;
  config?: {
    notifyEmailConfigured: boolean;
    resendConfigured: boolean;
  };
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

export async function sendNotificationTest(): Promise<NotificationTestResult> {
  const response = await fetch(`${API_BASE_URL}/notifications/test`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Notification test failed");
  }

  return (await response.json()) as NotificationTestResult;
}
