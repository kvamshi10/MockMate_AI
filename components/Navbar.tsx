"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import UserDropdown from "./UserDropdown";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/pricing", label: "Pricing" },
  { to: "/aboutus", label: "About Us" },
  { to: "/contactus", label: "Contact Us" },
];

// ✅ User is passed as a prop from the Server Layout — no client-side fetch needed!
// user is optional: authenticated layouts pass it, public layouts don't.
const Navbar = ({ user }: { user?: any }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60 border-b border-white/5" />
      <nav className="relative container mx-auto flex items-center justify-between h-16 px-4 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/10 shadow-[var(--shadow-glow)] group-hover:ring-aurora/50 transition-all">
            <Image 
              src="/AI_Logo.png" 
              alt="MockMateAI Logo" 
              fill
              sizes="40px"
              className="object-cover scale-[1.75]"
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-white group-hover:text-aurora transition-colors">
            MockMate<span className="text-aurora group-hover:text-white transition-colors">AI</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 glass rounded-full px-1.5 py-1.5">
          {links.map((l) => {
            const isActive = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
            return (
              <Link
                key={l.to}
                href={l.to}
                className={`px-4 py-1.5 text-sm rounded-full transition-all ${
                  isActive
                    ? "bg-aurora text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right: User or Sign In + Mobile toggle */}
        <div className="flex items-center gap-2">
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium glass-strong hover:ring-glow transition-all"
            >
              Sign in
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-glow" />
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl glass hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden relative border-t border-white/5 bg-background/95 backdrop-blur-2xl animate-fadeIn">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => {
              const isActive = pathname === l.to || (l.to !== "/" && pathname.startsWith(l.to));
              return (
                <Link
                  key={l.to}
                  href={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-aurora/15 text-white border border-aurora/30"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {!user && (
              <Link
                href="/sign-in"
                onClick={() => setMobileOpen(false)}
                className="mt-2 px-4 py-3 rounded-2xl text-sm font-semibold text-center bg-aurora text-white shadow-[var(--shadow-glow)]"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
