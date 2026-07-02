import { NavLink, Outlet } from "react-router-dom";
import { HelpCircle, LayoutDashboard } from "lucide-react";
import ampcusMark from "../../assets/ampcus-mark.jpeg";

export default function AppLayout() {
  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
      isActive ? "bg-ink text-white shadow-card" : "text-slate-600 hover:bg-white hover:text-ink"
    }`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-mist/85 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <NavLink to="/" className="inline-flex items-center gap-3 font-bold text-ink">
            <img
              src={ampcusMark}
              alt="Ampcus"
              className="h-10 w-10 rounded-lg object-cover shadow-card"
            />
            <span className="leading-tight">
              J.A.R.V.I.S.
              <span className="block text-xs font-medium text-slate-500">by Ampcus</span>
            </span>
          </NavLink>

          <div className="flex items-center gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              <HelpCircle size={16} />
              FAQ
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard size={16} />
              Dashboard
            </NavLink>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
