"use client";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  UserRound,
  X,
} from "lucide-react";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import UserNotificationBell from "@/components/notifications/UserNotificationBell";

import {
  useAuthContext,
} from "@/context/AuthContext";

import {
  useShop,
} from "@/context/ShopContext";

import {
  logoutUser,
} from "@/services/auth";

import HeaderBottom from "./header-bottom";

// ======================================================
// HEADER
// ======================================================

export default function Header() {
  const router =
    useRouter();

  const {
    user,
    logout,
  } = useAuthContext();

  const {
    cart,
    wishlist,
    cartLoading,
    wishlistLoading,
  } = useShop();

  const [
    openMenu,
    setOpenMenu,
  ] = useState(false);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    search,
    setSearch,
  ] = useState("");

  const menuRef =
    useRef<HTMLDivElement>(
      null
    );

  // ====================================================
  // COUNTS
  // ====================================================

  const cartCount =
    user &&
    !cartLoading
      ? cart.itemCount
      : 0;

  const wishlistCount =
    user &&
    !wishlistLoading
      ? wishlist.itemCount
      : 0;

  // ====================================================
  // CLOSE ACCOUNT DROPDOWN
  // ====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target as Node
        )
      ) {
        setOpenMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ====================================================
  // CLOSE MOBILE MENU ON RESIZE
  // ====================================================

  useEffect(() => {
    const handleResize =
      () => {
        if (
          window.innerWidth >=
          1024
        ) {
          setMobileMenuOpen(
            false
          );
        }
      };

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (
    event:
      FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const query =
      search.trim();

    if (!query) {
      return;
    }

    router.push(
      `/products?search=${encodeURIComponent(
        query
      )}`
    );
  };

  // ====================================================
  // LOGOUT
  // ====================================================

  const handleLogout =
    async () => {
      try {
        await logoutUser();

        logout();

        setOpenMenu(false);
        setMobileMenuOpen(false);

        router.push(
          "/login"
        );
      } catch (error) {
        console.error(
          "Logout failed:",
          error
        );
      }
    };

  return (
    <>
      {/* =================================================
          MAIN HEADER
      ================================================= */}

      <header className="relative z-[70] w-full border-b border-neutral-200/80 bg-white">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <div className="flex h-[76px] items-center gap-4 sm:h-[82px] lg:gap-8">
            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (current) =>
                    !current
                )
              }
              aria-label="Open navigation"
              aria-expanded={
                mobileMenuOpen
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-900 transition hover:bg-neutral-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* LOGO */}

            <Link
              href="/"
              className="group shrink-0"
              aria-label="Eshop home"
            >
              <div className="flex items-center">
                <span className="text-[26px] font-bold tracking-[-0.06em] text-neutral-950 sm:text-[30px]">
                  E
                </span>

                <span className="text-[26px] font-light tracking-[-0.06em] text-neutral-500 transition-colors group-hover:text-neutral-950 sm:text-[30px]">
                  shop
                </span>

                <span className="ml-1.5 mt-1 h-1.5 w-1.5 rounded-full bg-neutral-950" />
              </div>
            </Link>

            {/* DESKTOP SEARCH */}

            <form
              onSubmit={
                handleSearch
              }
              className="mx-auto hidden w-full max-w-[620px] lg:block"
            >
              <div className="group flex h-12 items-center rounded-full border border-neutral-200 bg-neutral-50 transition focus-within:border-neutral-400 focus-within:bg-white">
                <Search className="ml-5 h-[18px] w-[18px] shrink-0 text-neutral-400" />

                <input
                  type="search"
                  value={
                    search
                  }
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search products, brands and categories"
                  aria-label="Search products"
                  className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
                />

                <button
                  type="submit"
                  className="mr-1.5 rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-neutral-800"
                >
                  Search
                </button>
              </div>
            </form>

            {/* RIGHT ACTIONS */}

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
              {/* NOTIFICATIONS */}

              <UserNotificationBell />

              {/* ACCOUNT */}

              <div
                ref={
                  menuRef
                }
                className="relative"
              >
                {!user ? (
                  <Link
                    href="/login"
                    className="flex h-11 items-center gap-2 rounded-full px-2 transition hover:bg-neutral-100 sm:px-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200">
                      <UserRound className="h-[18px] w-[18px]" />
                    </span>

                    <span className="hidden text-left lg:block">
                      <span className="block text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                        Account
                      </span>

                      <span className="block text-sm font-semibold text-neutral-900">
                        Sign in
                      </span>
                    </span>
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      aria-expanded={
                        openMenu
                      }
                      aria-label="Open account menu"
                      className="flex h-11 items-center gap-2 rounded-full px-2 transition hover:bg-neutral-100 sm:px-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-950 text-white">
                        <UserRound className="h-[18px] w-[18px]" />
                      </span>

                      <span className="hidden max-w-[110px] text-left lg:block">
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                          Hello
                        </span>

                        <span className="block truncate text-sm font-semibold text-neutral-900">
                          {
                            user.name
                          }
                        </span>
                      </span>
                    </button>

                    {/* ACCOUNT DROPDOWN */}

                    {openMenu && (
                      <div className="absolute right-0 top-[calc(100%+12px)] z-[100] w-[260px] overflow-hidden rounded-[24px] border border-neutral-200 bg-white p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                        <div className="border-b border-neutral-100 px-3 py-3">
                          <p className="text-xs text-neutral-400">
                            Signed in as
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-neutral-950">
                            {
                              user.name
                            }
                          </p>
                        </div>

                        <div className="py-2">
                          <AccountLink
                            href="/profile"
                            icon={
                              <User className="h-[17px] w-[17px]" />
                            }
                          >
                            My Profile
                          </AccountLink>

                          <AccountLink
                            href="/profile/orders"
                            icon={
                              <Package className="h-[17px] w-[17px]" />
                            }
                          >
                            My Orders
                          </AccountLink>

                          <AccountLink
                            href="/wishlist"
                            icon={
                              <Heart className="h-[17px] w-[17px]" />
                            }
                          >
                            Wishlist

                            {wishlistCount >
                              0 && (
                              <span className="ml-auto text-xs font-semibold text-neutral-400">
                                {
                                  wishlistCount
                                }
                              </span>
                            )}
                          </AccountLink>
                        </div>

                        <div className="border-t border-neutral-100 pt-2">
                          <button
                            type="button"
                            onClick={
                              handleLogout
                            }
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                          >
                            <LogOut className="h-[17px] w-[17px]" />

                            Logout
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* WISHLIST */}

              <HeaderAction
                href="/wishlist"
                label={
                  wishlistCount > 0
                    ? `Wishlist, ${wishlistCount} items`
                    : "Wishlist"
                }
              >
                <Heart className="h-[20px] w-[20px]" />

                <CountBadge
                  count={
                    wishlistCount
                  }
                />
              </HeaderAction>

              {/* CART */}

              <HeaderAction
                href="/cart"
                label={
                  cartCount > 0
                    ? `Shopping cart, ${cartCount} items`
                    : "Shopping cart"
                }
              >
                <ShoppingBag className="h-[20px] w-[20px]" />

                <CountBadge
                  count={
                    cartCount
                  }
                />
              </HeaderAction>
            </div>
          </div>

          {/* TABLET / MOBILE SEARCH */}

          <form
            onSubmit={
              handleSearch
            }
            className="pb-4 lg:hidden"
          >
            <div className="flex h-11 items-center rounded-full border border-neutral-200 bg-neutral-50 focus-within:border-neutral-400 focus-within:bg-white">
              <Search className="ml-4 h-[17px] w-[17px] shrink-0 text-neutral-400" />

              <input
                type="search"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target
                      .value
                  )
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-neutral-400"
              />

              <button
                type="submit"
                aria-label="Submit search"
                className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* =================================================
          CATEGORY + NAVIGATION HEADER
      ================================================= */}

      <HeaderBottom
        mobileMenuOpen={
          mobileMenuOpen
        }
        closeMobileMenu={() =>
          setMobileMenuOpen(
            false
          )
        }
      />
    </>
  );
}

// ======================================================
// HEADER ACTION
// ======================================================

interface HeaderActionProps {
  href: string;
  label: string;
  children:
    React.ReactNode;
}

function HeaderAction({
  href,
  label,
  children,
}: HeaderActionProps) {
  return (
    <Link
      href={
        href
      }
      aria-label={
        label
      }
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-neutral-800 transition hover:bg-neutral-100"
    >
      {children}
    </Link>
  );
}

// ======================================================
// COUNT BADGE
// ======================================================

function CountBadge({
  count,
}: {
  count: number;
}) {
  if (count <= 0) {
    return null;
  }

  return (
    <span className="absolute right-0 top-0 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-neutral-950 px-1 text-[9px] font-bold text-white">
      {count > 99
        ? "99+"
        : count}
    </span>
  );
}

// ======================================================
// ACCOUNT LINK
// ======================================================

interface AccountLinkProps {
  href: string;
  icon:
    React.ReactNode;
  children:
    React.ReactNode;
}

function AccountLink({
  href,
  icon,
  children,
}: AccountLinkProps) {
  return (
    <Link
      href={
        href
      }
      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-neutral-950"
    >
      <span className="text-neutral-400">
        {icon}
      </span>

      {children}
    </Link>
  );
}