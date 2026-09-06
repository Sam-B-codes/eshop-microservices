"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  type User,
} from "@/services/auth";

// ======================================================
// CONTEXT TYPE
// ======================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;

  login: (
    user: User
  ) => void;

  updateUser: (
    user: User
  ) => void;

  logout: () => void;

  refreshUser:
    () => Promise<void>;
}

// ======================================================
// CONTEXT
// ======================================================

const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);

// ======================================================
// PROVIDER
// ======================================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ====================================================
  // LOCAL USER STATE
  // ====================================================

  const persistUser =
    useCallback(
      (
        userData: User
      ) => {
        localStorage.setItem(
          "user",
          JSON.stringify(
            userData
          )
        );

        setUser(
          userData
        );
      },
      []
    );

  const clearUser =
    useCallback(() => {
      localStorage.removeItem(
        "user"
      );

      setUser(null);
    }, []);

  // ====================================================
  // REFRESH AUTHENTICATED USER
  // ====================================================

  const refreshUser =
    useCallback(async () => {
      try {
        const response =
          await getMe();

        persistUser(
          response.data.user
        );
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    }, [
      clearUser,
      persistUser,
    ]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  // ====================================================
  // PUBLIC AUTH ACTIONS
  // ====================================================

  const login =
    useCallback(
      (
        userData: User
      ) => {
        persistUser(
          userData
        );
      },
      [persistUser]
    );

  const updateUser =
    useCallback(
      (
        userData: User
      ) => {
        persistUser(
          userData
        );
      },
      [persistUser]
    );

  const logout =
    useCallback(() => {
      clearUser();
    }, [clearUser]);

  // ====================================================
  // MEMOIZED VALUE
  // ====================================================

  const value =
    useMemo(
      () => ({
        user,
        loading,
        login,
        updateUser,
        logout,
        refreshUser,
      }),
      [
        user,
        loading,
        login,
        updateUser,
        logout,
        refreshUser,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useAuthContext() {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider"
    );
  }

  return context;
}