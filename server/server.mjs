import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const leadsFile = path.join(dataDir, "leads.json");
const invoicesFile = path.join(dataDir, "invoices.json");
const notificationsFile = path.join(dataDir, "notifications.json");
const deliveriesFile = path.join(dataDir, "deliveries.json");
const port = 4175;
const notifyEmail = process.env.TASKSATS_NOTIFY_EMAIL ?? "";
const resendApiKey = process.env.RESEND_API_KEY ?? "";

async function ensureDataFile(filePath) {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, "[]\n", "utf8");
  }
}

async function readCollection(filePath) {
  await ensureDataFile(filePath);
  const raw = await readFile(filePath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeCollection(filePath, records) {
  await ensureDataFile(filePath);
  await writeFile(filePath, JSON.stringify(records, null, 2), "utf8");
}

async function readLeads() {
  return readCollection(leadsFile);
}

async function writeLeads(leads) {
  await writeCollection(leadsFile, leads);
}

async function readInvoices() {
  return readCollection(invoicesFile);
}

async function writeInvoices(invoices) {
  await writeCollection(invoicesFile, invoices);
}

async function readNotifications() {
  return readCollection(notificationsFile);
}

async function writeNotifications(notifications) {
  await writeCollection(notificationsFile, notifications);
}

async function readDeliveries() {
  return readCollection(deliveriesFile);
}

async function writeDeliveries(deliveries) {
  await writeCollection(deliveriesFile, deliveries);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  response.end(JSON.stringify(payload));
}

function parseJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });

    request.on("error", reject);
  });
}

function normalizeLead(input) {
  return {
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    name: String(input.name ?? "").trim(),
    email: String(input.email ?? "").trim(),
    company: String(input.company ?? "").trim(),
    offer: String(input.offer ?? "").trim(),
    budget: String(input.budget ?? "").trim(),
    details: String(input.details ?? "").trim(),
  };
}

function normalizeInvoice(input) {
  return {
    id: `inv_${Date.now()}`,
    createdAt: new Date().toISOString(),
    client: String(input.client ?? "").trim(),
    service: String(input.service ?? "").trim(),
    amountUsd: String(input.amountUsd ?? "").trim(),
    amountBtc: String(input.amountBtc ?? "").trim(),
    status: String(input.status ?? "Open").trim() || "Open",
  };
}

async function readInvoiceById(id) {
  const invoices = await readInvoices();
  return invoices.find((invoice) => invoice.id === id) ?? null;
}

async function updateInvoiceStatus(id, status) {
  const invoices = await readInvoices();
  const index = invoices.findIndex((invoice) => invoice.id === id);

  if (index === -1) {
    return null;
  }

  const nextInvoice = {
    ...invoices[index],
    status: String(status ?? invoices[index].status).trim() || invoices[index].status,
  };

  const nextInvoices = [...invoices];
  nextInvoices[index] = nextInvoice;
  await writeInvoices(nextInvoices);
  return nextInvoice;
}

async function createNotification(input) {
  const nextNotification = {
    id: `notif_${Date.now()}`,
    createdAt: new Date().toISOString(),
    type: String(input.type ?? "").trim(),
    title: String(input.title ?? "").trim(),
    body: String(input.body ?? "").trim(),
  };

  const current = await readNotifications();
  const next = [nextNotification, ...current];
  await writeNotifications(next);
  return nextNotification;
}

async function createDeliveryRecord(input) {
  const nextDelivery = {
    id: `delivery_${Date.now()}`,
    createdAt: new Date().toISOString(),
    notificationId: String(input.notificationId ?? "").trim(),
    channel: "email",
    target: String(input.target ?? "").trim(),
    subject: String(input.subject ?? "").trim(),
    body: String(input.body ?? "").trim(),
    status: String(input.status ?? "queued").trim() || "queued",
    detail: String(input.detail ?? "").trim(),
  };

  const current = await readDeliveries();
  const next = [nextDelivery, ...current];
  await writeDeliveries(next);
  return nextDelivery;
}

async function updateDeliveryRecord(id, patch) {
  const deliveries = await readDeliveries();
  const index = deliveries.findIndex((delivery) => delivery.id === id);

  if (index === -1) {
    return null;
  }

  const nextDelivery = {
    ...deliveries[index],
    ...patch,
  };

  const nextDeliveries = [...deliveries];
  nextDeliveries[index] = nextDelivery;
  await writeDeliveries(nextDeliveries);
  return nextDelivery;
}

async function sendEmailDelivery({ subject, body }) {
  if (!notifyEmail) {
    return { status: "skipped", detail: "TASKSATS_NOTIFY_EMAIL is not configured" };
  }

  if (!resendApiKey) {
    return { status: "queued", detail: "RESEND_API_KEY is not configured" };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "TaskSats <notifications@tasksats.com>",
      to: [notifyEmail],
      subject,
      text: body,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return { status: "failed", detail };
  }

  return { status: "sent", detail: `Delivered to ${notifyEmail}` };
}

async function emitNotificationEvent({ type, title, body }) {
  const notification = await createNotification({ type, title, body });
  const delivery = await createDeliveryRecord({
    notificationId: notification.id,
    target: notifyEmail || "not-configured",
    subject: title,
    body,
    status: "queued",
    detail: "Waiting for provider configuration",
  });

  const deliveryResult = await sendEmailDelivery({ subject: title, body });
  await updateDeliveryRecord(delivery.id, deliveryResult);
  return notification;
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (requestUrl.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/leads" && request.method === "GET") {
    const leads = await readLeads();
    sendJson(response, 200, { leads });
    return;
  }

  if (requestUrl.pathname === "/api/leads" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const normalized = normalizeLead(body);

      if (!normalized.name || !normalized.email || !normalized.details) {
        sendJson(response, 400, {
          error: "name, email, and details are required",
        });
        return;
      }

      const current = await readLeads();
      const next = [normalized, ...current];
      await writeLeads(next);
      await emitNotificationEvent({
        type: "lead_created",
        title: `New lead from ${normalized.name}`,
        body: `${normalized.email} submitted a request for ${normalized.offer || "a custom request"}.`,
      });
      sendJson(response, 201, { lead: normalized });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname === "/api/notifications" && request.method === "GET") {
    const notifications = await readNotifications();
    sendJson(response, 200, { notifications });
    return;
  }

  if (requestUrl.pathname === "/api/deliveries" && request.method === "GET") {
    const deliveries = await readDeliveries();
    sendJson(response, 200, { deliveries });
    return;
  }

  if (requestUrl.pathname === "/api/invoices" && request.method === "GET") {
    const invoices = await readInvoices();
    sendJson(response, 200, { invoices });
    return;
  }

  if (requestUrl.pathname.startsWith("/api/invoices/") && request.method === "GET") {
    const id = requestUrl.pathname.replace("/api/invoices/", "").trim();
    const invoice = await readInvoiceById(id);

    if (!invoice) {
      sendJson(response, 404, { error: "invoice not found" });
      return;
    }

    sendJson(response, 200, { invoice });
    return;
  }

  if (requestUrl.pathname === "/api/invoices" && request.method === "POST") {
    try {
      const body = await parseJsonBody(request);
      const normalized = normalizeInvoice(body);

      if (!normalized.client || !normalized.service || !normalized.amountUsd || !normalized.amountBtc) {
        sendJson(response, 400, {
          error: "client, service, amountUsd, and amountBtc are required",
        });
        return;
      }

      const current = await readInvoices();
      const next = [normalized, ...current];
      await writeInvoices(next);
      await emitNotificationEvent({
        type: "invoice_created",
        title: `Invoice created for ${normalized.client}`,
        body: `${normalized.id} was created for ${normalized.service} at ${normalized.amountUsd} / ${normalized.amountBtc}.`,
      });
      sendJson(response, 201, { invoice: normalized });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  if (requestUrl.pathname.startsWith("/api/invoices/") && request.method === "PATCH") {
    const id = requestUrl.pathname.replace("/api/invoices/", "").trim();

    try {
      const body = await parseJsonBody(request);
      const invoice = await updateInvoiceStatus(id, body.status);

      if (!invoice) {
        sendJson(response, 404, { error: "invoice not found" });
        return;
      }

      await emitNotificationEvent({
        type: "invoice_updated",
        title: `Invoice ${invoice.id} updated`,
        body: `${invoice.client} invoice is now marked as ${invoice.status}.`,
      });
      sendJson(response, 200, { invoice });
    } catch {
      sendJson(response, 400, { error: "invalid json payload" });
    }
    return;
  }

  sendJson(response, 404, { error: "not found" });
});

server.listen(port, () => {
  console.log(`TaskSats API listening on http://localhost:${port}`);
});
