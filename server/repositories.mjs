export function createRepositories(storage) {
  return {
    settings: {
      async read() {
        return storage.settings.read();
      },
      async write(settings) {
        await storage.settings.write(settings);
      },
    },
    invoices: {
      async list() {
        return storage.invoices.read();
      },
      async readById(id) {
        const invoices = await storage.invoices.read();
        return invoices.find((invoice) => invoice.id === id) ?? null;
      },
      async create(invoice) {
        const invoices = await storage.invoices.read();
        const next = [invoice, ...invoices];
        await storage.invoices.write(next);
        return invoice;
      },
      async updateStatus(id, status) {
        const invoices = await storage.invoices.read();
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
        await storage.invoices.write(nextInvoices);
        return nextInvoice;
      },
      async update(id, patch) {
        const invoices = await storage.invoices.read();
        const index = invoices.findIndex((invoice) => invoice.id === id);

        if (index === -1) {
          return null;
        }

        const nextInvoice = {
          ...invoices[index],
          ...patch,
        };

        const nextInvoices = [...invoices];
        nextInvoices[index] = nextInvoice;
        await storage.invoices.write(nextInvoices);
        return nextInvoice;
      },
    },
    syncHistory: {
      async list() {
        return storage.syncHistory.read();
      },
      async create(input) {
        const nextRecord = {
          id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString(),
          invoiceId: String(input.invoiceId ?? "").trim(),
          providerKey: String(input.providerKey ?? "").trim(),
          invoiceStatus: String(input.invoiceStatus ?? "").trim(),
          providerSessionStatus: String(input.providerSessionStatus ?? "").trim(),
          syncStatus: String(input.syncStatus ?? "synced").trim() || "synced",
          detail: String(input.detail ?? "").trim(),
          scope: String(input.scope ?? "invoice").trim() || "invoice",
        };

        const records = await storage.syncHistory.read();
        const next = [nextRecord, ...records].slice(0, 200);
        await storage.syncHistory.write(next);
        return nextRecord;
      },
    },
    notifications: {
      async list() {
        return storage.notifications.read();
      },
      async create(input) {
        const nextNotification = {
          id: `notif_${Date.now()}`,
          createdAt: new Date().toISOString(),
          type: String(input.type ?? "").trim(),
          title: String(input.title ?? "").trim(),
          body: String(input.body ?? "").trim(),
          source: String(input.source ?? "").trim(),
          invoiceId: String(input.invoiceId ?? "").trim(),
          providerKey: String(input.providerKey ?? "").trim(),
        };

        const notifications = await storage.notifications.read();
        const next = [nextNotification, ...notifications];
        await storage.notifications.write(next);
        return nextNotification;
      },
    },
    deliveries: {
      async list() {
        return storage.deliveries.read();
      },
      async create(input) {
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
          source: String(input.source ?? "").trim(),
          invoiceId: String(input.invoiceId ?? "").trim(),
          providerKey: String(input.providerKey ?? "").trim(),
        };

        const deliveries = await storage.deliveries.read();
        const next = [nextDelivery, ...deliveries];
        await storage.deliveries.write(next);
        return nextDelivery;
      },
      async update(id, patch) {
        const deliveries = await storage.deliveries.read();
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
        await storage.deliveries.write(nextDeliveries);
        return nextDelivery;
      },
    },
  };
}
