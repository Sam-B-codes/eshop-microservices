// "use client";

// import { Loader2, LogOut, Menu } from "lucide-react";

// import { useRouter } from "next/navigation";

// import { useState } from "react";

// import { useAdminContext } from "@/context/AdminContext";

// import { logoutAdmin } from "@/services/auth.service";

// interface AdminHeaderProps {
//   onOpenMenu: () => void;
// }

// export default function AdminHeader({ onOpenMenu }: AdminHeaderProps) {
//   const router = useRouter();

//   const { admin, clearAdmin } = useAdminContext();

//   const [loggingOut, setLoggingOut] = useState(false);

//   const handleLogout = async () => {
//     try {
//       setLoggingOut(true);

//       await logoutAdmin();
//     } catch (error) {
//       console.error("Admin logout failed:", error);
//     } finally {
//       clearAdmin();

//       router.replace("/login");

//       setLoggingOut(false);
//     }
//   };

//   const initials =
//     admin?.name
//       .split(" ")
//       .filter(Boolean)
//       .slice(0, 2)
//       .map((part) => part.charAt(0))
//       .join("")
//       .toUpperCase() || "AD";

//   return (
//     <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
//       <div className="flex min-h-[82px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
//         <button
//           type="button"
//           aria-label="Open navigation"
//           aria-haspopup="dialog"
//           onClick={onOpenMenu}
//           className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-700 transition hover:bg-neutral-50 lg:hidden"
//         >
//           <Menu className="h-5 w-5" />
//         </button>

//         <div className="min-w-0">
//           <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:text-[10px] sm:tracking-[0.2em]">
//             Administration
//           </p>

//           <p className="mt-1 truncate text-sm font-semibold text-neutral-950">
//             Platform Control Centre
//           </p>
//         </div>

//         <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
//           <div className="hidden text-right sm:block">
//             <p className="max-w-[180px] truncate text-sm font-semibold text-neutral-950">
//               {admin?.name}
//             </p>

//             <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
//               {admin?.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
//             </p>
//           </div>

//           <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#080d19] text-xs font-semibold text-white sm:h-11 sm:w-11 sm:text-sm">
//             {initials}
//           </div>

//           <button
//             type="button"
//             onClick={() => void handleLogout()}
//             disabled={loggingOut}
//             aria-label="Logout"
//             className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.07] text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-11 sm:w-11"
//           >
//             {loggingOut ? (
//               <Loader2 className="h-[18px] w-[18px] animate-spin" />
//             ) : (
//               <LogOut className="h-[18px] w-[18px]" />
//             )}
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }




"use client";

import {
  Loader2,
  LogOut,
  Menu,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import AdminNotificationBell from "@/components/notifications/AdminNotificationBell";

import {
  useAdminContext,
} from "@/context/AdminContext";

import {
  logoutAdmin,
} from "@/services/auth.service";

interface AdminHeaderProps {
  onOpenMenu: () => void;
}

export default function AdminHeader({
  onOpenMenu,
}: AdminHeaderProps) {
  const router =
    useRouter();

  const {
    admin,
    clearAdmin,
  } = useAdminContext();

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);

  const handleLogout =
    async () => {
      if (loggingOut) {
        return;
      }

      try {
        setLoggingOut(true);

        await logoutAdmin();
      } catch (error) {
        console.error(
          "Admin logout failed:",
          error
        );
      } finally {
        clearAdmin();

        router.replace(
          "/login"
        );

        setLoggingOut(false);
      }
    };

  const initials =
    admin?.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part.charAt(0)
      )
      .join("")
      .toUpperCase() ||
    "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-[82px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Open navigation"
          aria-haspopup="dialog"
          onClick={
            onOpenMenu
          }
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-white text-neutral-700 transition hover:bg-neutral-50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:text-[10px] sm:tracking-[0.2em]">
            Administration
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-neutral-950">
            Platform Control Centre
          </p>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <AdminNotificationBell />

          <div className="hidden text-right sm:block">
            <p className="max-w-[180px] truncate text-sm font-semibold text-neutral-950">
              {admin?.name}
            </p>

            <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-400">
              {admin?.role ===
              "SUPER_ADMIN"
                ? "Super Admin"
                : "Admin"}
            </p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#080d19] text-xs font-semibold text-white sm:h-11 sm:w-11 sm:text-sm">
            {initials}
          </div>

          <button
            type="button"
            onClick={() =>
              void handleLogout()
            }
            disabled={
              loggingOut
            }
            aria-label="Logout"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-black/[0.07] text-neutral-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-11 sm:w-11"
          >
            {loggingOut ? (
              <Loader2 className="h-[18px] w-[18px] animate-spin" />
            ) : (
              <LogOut className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}