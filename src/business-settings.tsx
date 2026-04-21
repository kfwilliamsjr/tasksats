import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchBusinessSettings, type BusinessSettings } from "./invoices";

const defaultBusinessSettings: BusinessSettings = {
  businessName: "TaskSats",
  primaryDomain: "tasksats.com",
  secondaryDomain: "tasksats.ai",
  founderEmail: "",
  supportEmail: "",
  launchMode: "local-prototype",
  defaultInvoiceNote: "Bitcoin payments for service businesses.",
};

type BusinessSettingsContextValue = {
  settings: BusinessSettings;
  refreshSettings: () => Promise<void>;
};

const BusinessSettingsContext = createContext<BusinessSettingsContextValue | null>(null);

export function BusinessSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings);

  async function refreshSettings() {
    const next = await fetchBusinessSettings();
    setSettings({
      ...defaultBusinessSettings,
      ...(next ?? {}),
    });
  }

  useEffect(() => {
    void refreshSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      refreshSettings,
    }),
    [settings],
  );

  return (
    <BusinessSettingsContext.Provider value={value}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function useBusinessSettings() {
  const context = useContext(BusinessSettingsContext);

  if (!context) {
    throw new Error("useBusinessSettings must be used within BusinessSettingsProvider");
  }

  return context;
}
