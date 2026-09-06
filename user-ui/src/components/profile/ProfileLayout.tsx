"use client";

import {
  useEffect,
  type ReactNode,
} from "react";

import Link from "next/link";

import {
  Heart,
  LayoutDashboard,
  Loader2,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useAuthContext,
} from "@/context/AuthContext";

interface ProfileLayoutProps {
  children: ReactNode;
}

const accountLinks = [
  {
    label: "Overview",
    href: "/profile",
    icon: LayoutDashboard,
  },
  {
    label: "My orders",
    href: "/profile/orders",
    icon: Package,
  },
  {
    label: "Wishlist",
    href: "/wishlist",
    icon: Heart,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function ProfileLayout({
  children,
}: ProfileLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuthContext();

  // ====================================================
  // PROTECT PROFILE ROUTES
  // ====================================================

  useEffect(() => {
    if (loading || user) {
      return;
    }

    const redirectPath =
      pathname || "/profile";

    router.replace(
      `/login?redirect=${encodeURIComponent(
        redirectPath
      )}`
    );
  }, [
    loading,
    pathname,
    router,
    user,
  ]);

  // ====================================================
  // ACTIVE NAVIGATION
  // ====================================================

  const isActive = (
    href: string
  ): boolean => {
    if (href === "/profile") {
      return pathname === "/profile";
    }

    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  };

  // ====================================================
  // AUTHENTICATION CHECK
  // ====================================================

  if (loading || !user) {
    return <ProfileAuthLoader />;
  }

  return (
    <main className="min-h-screen bg-[#f7f5f1]">
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* ACCOUNT INTRODUCTION */}

        <section className="relative overflow-hidden rounded-[32px] border border-black/[0.06] bg-[#eee7dd]">
          {/* DECORATIVE BACKGROUND */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#d8e2da]/70 blur-3xl" />

            <div className="absolute -bottom-36 left-[36%] h-72 w-72 rounded-full bg-[#ead1d7]/60 blur-3xl" />

            <div className="absolute right-[24%] top-12 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
          </div>

          <div className="relative px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/65 px-3.5 py-2 backdrop-blur-sm">
                  <UserRound
                    className="h-3.5 w-3.5 text-neutral-700"
                    strokeWidth={1.8}
                  />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600">
                    Your account
                  </span>
                </div>

                <h1 className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-neutral-950 sm:text-5xl lg:text-[56px] lg:leading-[1.02]">
                  Everything you love,

                  <span className="block font-normal italic text-neutral-500">
                    all in one place.
                  </span>
                </h1>

                <p className="mt-5 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                  Review your purchases, manage your account,
                  and return to the products you saved for later.
                </p>
              </div>

              <div className="hidden shrink-0 lg:block">
                <div className="rounded-[26px] border border-black/[0.06] bg-white/65 p-3 backdrop-blur-sm">
                  <div className="flex h-32 w-52 flex-col justify-between rounded-[20px] bg-[#d9e1e6] p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                      Eshop account
                    </p>

                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-neutral-950">
                        Made for you.
                      </p>

                      <p className="mt-1 text-xs text-neutral-600">
                        Orders, favourites and more.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DESKTOP NAVIGATION */}

          <nav className="relative hidden border-t border-black/[0.07] bg-white/40 px-6 backdrop-blur-sm sm:block sm:px-8 lg:px-10">
            <div className="flex items-center gap-1">
              {accountLinks.map(
                (item) => {
                  const Icon =
                    item.icon;

                  const active =
                    isActive(
                      item.href
                    );

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      className={`relative flex min-h-16 items-center gap-2.5 px-4 text-sm transition-colors ${
                        active
                          ? "font-semibold text-neutral-950"
                          : "font-medium text-neutral-500 hover:text-neutral-950"
                      }`}
                    >
                      <Icon
                        className="h-4 w-4"
                        strokeWidth={
                          1.8
                        }
                      />

                      <span>
                        {
                          item.label
                        }
                      </span>

                      {active && (
                        <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-neutral-950" />
                      )}
                    </Link>
                  );
                }
              )}
            </div>
          </nav>
        </section>

        {/* MOBILE NAVIGATION */}

        <nav className="mt-4 flex gap-2 overflow-x-auto rounded-[20px] border border-black/[0.06] bg-white p-2 shadow-[0_8px_30px_rgba(0,0,0,0.025)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:hidden">
          {accountLinks.map(
            (item) => {
              const Icon =
                item.icon;

              const active =
                isActive(
                  item.href
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                  className={`flex min-h-11 shrink-0 items-center gap-2 rounded-[14px] px-4 text-xs font-semibold transition-colors ${
                    active
                      ? "bg-neutral-950 text-white"
                      : "text-neutral-500 hover:bg-[#f3f0eb] hover:text-neutral-950"
                  }`}
                >
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={
                      1.8
                    }
                  />

                  <span>
                    {item.label}
                  </span>
                </Link>
              );
            }
          )}
        </nav>

        {/* PAGE CONTENT */}

        <div className="mt-8">
          {children}
        </div>
      </div>
    </main>
  );
}

// ======================================================
// AUTHENTICATION LOADER
// ======================================================

function ProfileAuthLoader() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f5f1] px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] border border-black/[0.06] bg-white shadow-sm">
          <Loader2
            className="h-6 w-6 animate-spin text-neutral-700"
            strokeWidth={1.8}
          />
        </div>

        <p className="mt-4 text-sm font-semibold text-neutral-800">
          Checking your account
        </p>

        <p className="mt-1 text-xs text-neutral-400">
          This will only take a moment.
        </p>
      </div>
    </main>
  );
}