import {
  ReactNode,
} from "react";

import ProfileLayout from "@/components/profile/ProfileLayout";

interface ProfileRouteLayoutProps {
  children: ReactNode;
}

export default function ProfileRouteLayout({
  children,
}: ProfileRouteLayoutProps) {
  return (
    <ProfileLayout>
      {children}
    </ProfileLayout>
  );
}