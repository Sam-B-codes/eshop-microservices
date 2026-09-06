import { Toaster } from "sonner";
import "./global.css";

export const metadata = {
  title: "Eshop Seller",
  description: "Professional Seller Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}

        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          expand
        />
      </body>
    </html>
  );
}