import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AuthRole = "merchant" | "admin";

export type AuthSession = {
  name: string;
  email: string;
  role: AuthRole;
};

const STORAGE_KEY = "tasksats_phase1_auth";

type AuthContextValue = {
  session: AuthSession | null;
  signIn: (session: AuthSession) => void;
  signOut: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession;

    if (!parsed?.email || !parsed?.role) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setSession(readStoredSession());
  }, []);

  function signIn(nextSession: AuthSession) {
    setSession(nextSession);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    }
  }

  function signOut() {
    setSession(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  const value = useMemo(
    () => ({
      session,
      signIn,
      signOut,
      isAuthenticated: Boolean(session),
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
