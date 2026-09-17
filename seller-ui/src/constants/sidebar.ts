import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  ShoppingCart,
  Star,
  TicketPercent,
} from "lucide-react";

export const sidebarItems = [
  {
    title:
      "Dashboard",

    href:
      "/dashboard",

    icon:
      LayoutDashboard,
  },

  {
    title:
      "Products",

    href:
      "/dashboard/products",

    icon:
      Package,
  },

  {
    title:
      "Orders",

    href:
      "/dashboard/orders",

    icon:
      ShoppingCart,
  },

  {
    title:
      "Messages",

    href:
      "/dashboard/messages",

    icon:
      MessageCircle,
  },

  {
    title:
      "Coupons",

    href:
      "/dashboard/coupons",

    icon:
      TicketPercent,
  },

  {
    title:
      "Payments",

    href:
      "/dashboard/payments",

    icon:
      CreditCard,
  },

  {
    title:
      "Reviews",

    href:
      "/dashboard/reviews",

    icon:
      Star,
  },

  {
    title:
      "Settings",

    href:
      "/dashboard/settings",

    icon:
      Settings,
  },
];

export const logoutItem = {
  title:
    "Logout",

  href:
    "/login",

  icon:
    LogOut,
};