"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getSeller,
} from "@/services/auth";

// ======================================================
// SELLER TYPE
// ======================================================

export interface Seller {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  country: string;

  shopName: string | null;
  shopBio: string | null;
  shopAddress: string | null;
  website: string | null;
  category: string | null;
  openingHours: string | null;

  bankConnected: boolean;
  isOnboarded: boolean;
}

// ======================================================
// CONTEXT TYPE
// ======================================================

export interface SellerContextType {
  seller: Seller | null;
  loading: boolean;

  refreshSeller: () => Promise<void>;

  updateSeller: (
    seller: Seller
  ) => void;

  clearSeller: () => void;
}

const SellerContext =
  createContext<
    SellerContextType | null
  >(null);

// ======================================================
// SELLER PROVIDER
// ======================================================

export function SellerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [
    seller,
    setSeller,
  ] =
    useState<Seller | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] = useState(true);

  // ====================================================
  // FETCH SELLER
  // ====================================================

  const fetchSeller =
    async () => {
      try {
        setLoading(true);

        const response =
          await getSeller();

        setSeller(
          response.data.seller
        );
      } catch (error) {
        console.error(
          "Failed to fetch seller:",
          error
        );

        setSeller(null);
      } finally {
        setLoading(false);
      }
    };

  // ====================================================
  // UPDATE SELLER LOCALLY
  // ====================================================

  const updateSeller = (
    updatedSeller: Seller
  ) => {
    setSeller(
      updatedSeller
    );
  };

  // ====================================================
  // CLEAR SELLER
  // ====================================================

  const clearSeller = () => {
    setSeller(null);
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    void fetchSeller();
  }, []);

  // ====================================================
  // PROVIDER
  // ====================================================

  return (
    <SellerContext.Provider
      value={{
        seller,
        loading,
        refreshSeller:
          fetchSeller,
        updateSeller,
        clearSeller,
      }}
    >
      {children}
    </SellerContext.Provider>
  );
}

// ======================================================
// CONTEXT HOOK
// ======================================================

export function useSellerContext() {
  const context =
    useContext(
      SellerContext
    );

  if (!context) {
    throw new Error(
      "useSellerContext must be used inside SellerProvider"
    );
  }

  return context;
}