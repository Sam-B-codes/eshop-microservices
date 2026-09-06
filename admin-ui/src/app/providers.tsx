"use client";

import {
  ReactNode,
} from "react";

import {
  AdminProvider,
} from "@/context/AdminContext";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}