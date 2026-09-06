// ======================================================
// NAVIGATION TYPES
// ======================================================

export interface NavigationItem {
  title: string;
  href: string;
  external?: boolean;
}

// ======================================================
// SELLER UI URL
// ======================================================

export const SELLER_UI_URL =
  process.env
    .NEXT_PUBLIC_SELLER_UI_URL
    ?.trim()
    .replace(/\/+$/, "") ||
  "http://localhost:3001";

// ======================================================
// MAIN NAVIGATION
// ======================================================

export const navItems:
  NavigationItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/products",
  },
  {
    title: "Shops",
    href:
      "/products?view=shops",
  },
  {
    title: "Offers",
    href:
      "/products?offers=true",
  },
  {
    title:
      "Become A Seller",

    href:
      `${SELLER_UI_URL}/signup`,

    external: true,
  },
];