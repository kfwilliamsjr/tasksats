import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

function createJsonCollectionStore(filePath) {
  async function ensureFile(defaultValue = []) {
    await mkdir(path.dirname(filePath), { recursive: true });

    try {
      await readFile(filePath, "utf8");
    } catch {
      await writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    }
  }

  return {
    async read() {
      await ensureFile([]);
      const raw = await readFile(filePath, "utf8");

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    },
    async write(records) {
      await ensureFile([]);
      await writeFile(filePath, JSON.stringify(records, null, 2), "utf8");
    },
  };
}

function createJsonObjectStore(filePath, defaultValue) {
  async function ensureFile() {
    await mkdir(path.dirname(filePath), { recursive: true });

    try {
      await readFile(filePath, "utf8");
    } catch {
      await writeFile(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    }
  }

  return {
    async read() {
      await ensureFile();

      try {
        const raw = await readFile(filePath, "utf8");
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    },
    async write(value) {
      await ensureFile();
      await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
    },
  };
}

export function createStorage({ dataDir, defaultPaymentAdapterKey }) {
  return {
    getSummary() {
      return {
        key: "json-local",
        displayName: "Local JSON Storage",
        mode: "file-backed",
        capabilities: [
          "local-persistence",
          "single-workspace",
          "database-ready-abstraction",
        ],
      };
    },
    leads: createJsonCollectionStore(path.join(dataDir, "leads.json")),
    invoices: createJsonCollectionStore(path.join(dataDir, "invoices.json")),
    syncHistory: createJsonCollectionStore(path.join(dataDir, "sync-history.json")),
    notifications: createJsonCollectionStore(path.join(dataDir, "notifications.json")),
    deliveries: createJsonCollectionStore(path.join(dataDir, "deliveries.json")),
    settings: createJsonObjectStore(path.join(dataDir, "settings.json"), {
      paymentAdapterKey: defaultPaymentAdapterKey,
    }),
  };
}
