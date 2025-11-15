"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { ApiUser } from "@/lib/api";

const STORAGE_KEY = "truthlens:user";

type AuthContextValue = {
  user: ApiUser | null;
  setUser: (user: ApiUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<ApiUser | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ApiUser;
        setUserState(parsed);
      } catch (error) {
        console.warn("Failed to parse stored user", error);
      }
    }
  }, []);

  const setUser = (value: ApiUser | null) => {
    setUserState(value);
    if (value) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  const logout = () => setUser(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
      logout,
    }),
    [user],
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
