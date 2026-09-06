import Link from "next/link";

import {
  ArrowRight,
  
  Mail,
} from "lucide-react";

const shopLinks = [
  {
    label: "New arrivals",
    href: "/products?sort=newest",
  },
  {
    label: "All products",
    href: "/products",
  },
  {
    label: "Fashion",
    href: "/products?category=Clothing",
  },
  {
    label: "Electronics",
    href: "/products?category=Electronics",
  },
];

const accountLinks = [
  {
    label: "My account",
    href: "/profile",
  },
  {
    label: "Wishlist",
    href: "/wishlist",
  },
  {
    label: "Cart",
    href: "/cart",
  },
  {
    label: "Orders",
    href: "/orders",
  },
];

const supportLinks = [
  {
    label: "Help centre",
    href: "/help",
  },
  {
    label: "Shipping",
    href: "/shipping",
  },
  {
    label: "Returns",
    href: "/returns",
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

export default function Footer() {
  return (
    <footer className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 border-b border-white/10 py-14 sm:py-16 lg:grid-cols-[1.35fr_0.65fr_0.65fr_0.65fr] lg:py-20">
          <div className="max-w-md">
            <Link
              href="/"
              className="text-2xl font-semibold tracking-[-0.04em]"
            >
              Eshop
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-white/50">
              A modern marketplace
              for discovering products,
              offers and everyday
              essentials from sellers
              across categories.
            </p>

            <div className="mt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                Stay in the loop
              </p>

              <div className="mt-3 flex max-w-sm items-center rounded-full border border-white/10 bg-white/5 p-1.5">
                <div className="flex min-w-0 flex-1 items-center gap-2 px-3">
                  <Mail className="h-4 w-4 shrink-0 text-white/30" />

                  <input
                    type="email"
                    placeholder="Email address"
                    className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30"
                  />
                </div>

                <button
                  type="button"
                  aria-label="Subscribe"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-950 transition hover:bg-neutral-200"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <FooterColumn
            title="Shop"
            links={shopLinks}
          />

          <FooterColumn
            title="Account"
            links={accountLinks}
          />

          <FooterColumn
            title="Support"
            links={supportLinks}
          />
        </div>

        <div className="flex flex-col gap-5 py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()}{" "}
            Eshop. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            <Link
              href="/privacy"
              className="transition hover:text-white"
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="transition hover:text-white"
            >
              Terms
            </Link>

           
          </div>
        </div>
      </div>
    </footer>
  );
}

interface FooterColumnProps {
  title: string;

  links: {
    label: string;
    href: string;
  }[];
}

function FooterColumn({
  title,
  links,
}: FooterColumnProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
        {title}
      </h3>

      <ul className="mt-5 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-sm text-white/60 transition hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}