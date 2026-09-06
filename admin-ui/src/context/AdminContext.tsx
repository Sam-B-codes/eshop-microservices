"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  getAdminMe,
} from "@/services/auth.service";

import {
  Admin,
} from "@/types/admin";

interface AdminContextValue {
  admin: Admin | null;
  loading: boolean;

  setAuthenticatedAdmin: (
    admin: Admin
  ) => void;

  clearAdmin: () => void;
  refreshAdmin: () => Promise<void>;
}

const AdminContext =
  createContext<
    AdminContextValue | undefined
  >(undefined);

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({
  children,
}: AdminProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [admin, setAdmin] =
    useState<Admin | null>(null);

  const [loading, setLoading] =
    useState(true);

  const clearAdmin =
    useCallback(() => {
      setAdmin(null);
    }, []);

  const refreshAdmin =
    useCallback(async () => {
      try {
        const response =
          await getAdminMe();

        setAdmin(response.admin);
      } catch {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    void refreshAdmin();
  }, [refreshAdmin]);

  useEffect(() => {
    const handleSessionExpired =
      () => {
        setAdmin(null);
        setLoading(false);

        if (
          pathname !== "/login"
        ) {
          router.replace(
            "/login?session=expired"
          );
        }
      };

    window.addEventListener(
      "admin-session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "admin-session-expired",
        handleSessionExpired
      );
    };
  }, [pathname, router]);

  const setAuthenticatedAdmin =
    useCallback(
      (adminData: Admin) => {
        setAdmin(adminData);
        setLoading(false);
      },
      []
    );

  const value = useMemo(
    () => ({
      admin,
      loading,
      setAuthenticatedAdmin,
      clearAdmin,
      refreshAdmin,
    }),
    [
      admin,
      loading,
      setAuthenticatedAdmin,
      clearAdmin,
      refreshAdmin,
    ]
  );

  return (
    <AdminContext.Provider
      value={value}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context =
    useContext(AdminContext);

  if (!context) {
    throw new Error(
      "useAdminContext must be used inside AdminProvider"
    );
  }

  return context;
}