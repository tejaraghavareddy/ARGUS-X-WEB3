import { ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-navy-900/8 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-navy-900">
            <ShieldCheck size={18} />
            <span className="font-display text-lg font-semibold">SoulCert</span>
          </div>
          <p className="mt-2 max-w-md text-sm text-navy-700/70">
            Blockchain-backed, non-transferable certificates for the future of education.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm text-navy-700">
          <Link to="/verify" className="hover:text-navy-900">
            Verify
          </Link>
          <Link to="/issue" className="hover:text-navy-900">
            Issue
          </Link>
          <Link to="/dashboard" className="hover:text-navy-900">
            Dashboard
          </Link>
          <Link to="/admin" className="hover:text-navy-900">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
