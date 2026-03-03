import Link from "next/link";
import { BRAND, NAV_ITEMS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-ch-hero-from to-ch-hero-to text-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-lg font-black bg-gradient-to-r from-ch-primary-light to-ch-accent-light bg-clip-text text-transparent">
              {BRAND.name}
            </p>
            <p className="text-sm text-white/50 mt-1">
              {BRAND.description}
            </p>
          </div>
          <nav className="flex gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/60 hover:text-ch-primary-light transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-xs text-white/30 text-center">
          &copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
