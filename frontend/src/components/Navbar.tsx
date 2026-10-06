import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { WalletButton } from "./WalletButton";

const links = [
  { to: "/", label: "Home" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/issue", label: "Issue" },
  { to: "/certificates", label: "Certificates" },
  { to: "/verify", label: "Verify" },
  { to: "/admin", label: "Admin" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy-900/8 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 text-navy-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
            <ShieldCheck size={18} />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">SoulCert</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-navy-900 text-white"
                    : "text-navy-700 hover:bg-navy-900/5"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <WalletButton />
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-navy-800 md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-navy-900/8 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? "bg-navy-900 text-white" : "text-navy-800"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-3 sm:hidden">
            <WalletButton />
          </div>
        </div>
      ) : null}
    </header>
  );
}
