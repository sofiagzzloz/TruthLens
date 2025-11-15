"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import type { ApiUser } from "@/lib/api";

const STORAGE_KEY = "truthlens:user";

type AuthContextValue = {
  user: ApiUser | null;
  ready: boolean;
  setUser: (user: ApiUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<ApiUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ApiUser;
        setUserState(parsed);
      } catch (error) {
        console.warn("Failed to parse stored user", error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setReady(true);
  }, []);

  const setUser = useCallback((value: ApiUser | null) => {
    setUserState(value);
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, [setUser]);

  const value = useMemo(
    () => ({
      user,
      ready,
      setUser,
      logout,
    }),
    [logout, ready, setUser, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
