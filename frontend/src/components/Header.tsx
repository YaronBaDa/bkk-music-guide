"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/concerts?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-text-primary uppercase"
        >
          Live / BKK
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/concerts"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary uppercase tracking-wide"
          >
            Concerts
          </Link>
          <Link
            href="/venues"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary uppercase tracking-wide"
          >
            Venues
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-text-secondary transition-colors hover:text-text-primary"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-text-secondary transition-colors hover:text-text-primary md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-4">
          <form
            onSubmit={handleSearch}
            className="mx-auto max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" strokeWidth={1.5} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concerts, venues, artists..."
                className="w-full border border-border bg-surface py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-text-primary focus:outline-none"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-border px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/concerts"
              className="text-sm font-medium text-text-secondary uppercase tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              Concerts
            </Link>
            <Link
              href="/venues"
              className="text-sm font-medium text-text-secondary uppercase tracking-wide"
              onClick={() => setMenuOpen(false)}
            >
              Venues
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
