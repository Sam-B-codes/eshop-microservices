import Header from "@/shared/widgets/header";

import {
  AuthProvider,
} from "@/context/AuthContext";

import {
  ShopProvider,
} from "@/context/ShopContext";

import "./global.css";

export const metadata = {
  title: "Eshop",
  description:
    "Discover products you'll love.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ShopProvider>
            <Header />
            {children}
          </ShopProvider>
        </AuthProvider>
      </body>
    </html>
  );
}