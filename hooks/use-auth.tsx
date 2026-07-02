"use client";

import type { User } from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/auth.service";
import { AUTH_CHANGED_EVENT } from "@/services/api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signedIn: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!authService.hasToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setUser(await authService.me());
    } catch {
      authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => {
      void refresh();
    };
    void refresh();
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () =>
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
  }, [refresh]);

  const value = useMemo(
    () => ({
      user,
      loading,
      signedIn: Boolean(user),
      refresh,
      logout: authService.logout,
    }),
    [loading, refresh, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
