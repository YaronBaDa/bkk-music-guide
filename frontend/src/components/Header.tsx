"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Music } from "lucide-react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-text-primary"
        >
          <Music className="h-5 w-5 text-accent" />
          <span>
            Live <span className="text-accent">/</span> BKK
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/concerts"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Concerts
          </Link>
          <Link
            href="/venues"
            className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            Venues
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border px-4 py-3">
          <form
            action="/concerts"
            method="GET"
            className="mx-auto max-w-2xl"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="search"
                name="q"
                placeholder="Search concerts, venues, artists..."
                className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none"
                autoFocus
              />
            </div>
          </form>
        </div>
      )}

      {menuOpen && (
        <nav className="border-t border-border px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/concerts"
              className="text-sm font-medium text-text-secondary"
              onClick={() => setMenuOpen(false)}
            >
              Concerts
            </Link>
            <Link
              href="/venues"
              className="text-sm font-medium text-text-secondary"
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
