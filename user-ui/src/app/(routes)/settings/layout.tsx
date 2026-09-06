import {
  type ReactNode,
} from "react";

import ProfileLayout from "@/components/profile/ProfileLayout";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  return (
    <ProfileLayout>
      {children}
    </ProfileLayout>
  );
}