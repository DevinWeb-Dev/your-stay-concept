import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Settings2,
  Sparkles,
  Users,
  Waves,
  X,
} from "lucide-react";

import { useResort } from "../context/ResortContext.jsx";

const NAV = [
  {
    label: "Overview",
    path: "/staff",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Reservations",
    path: "/staff/reservations",
    icon: CalendarDays,
  },
  {
    label: "Villa Management",
    path: "/staff/villas",
    icon: Building2,
  },
  {
    label: "Housekeeping",
    path: "/staff/housekeeping",
    icon: ClipboardList,
  },
  {
    label: "Reports",
    path: "/staff/reports",
    icon: BarChart3,
  },
  {
    label: "Guest Records",
    path: "/staff/guests",
    icon: Users,
  },
  {
    label: "Booking Calendar",
    path: "/staff/calendar",
    icon: CalendarDays,
  },
  {
    label: "Settings",
    path: "/staff/settings",
    icon: Settings2,
  },
];

export default function StaffLayout() {
  const { stats, accommodations } = useResort();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;

    function onEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div className="ys5-admin">
      <aside
        className={`ys5-sidebar ${open ? "is-open" : ""}`}
        aria-label="Resort management navigation"
      >
        <Link to="/" className="ys5-sidebar-brand">
          <Waves size={26} strokeWidth={1.3} />
          <div>
            <strong>YOUR STAY.</strong>
            <small>RESORT OPERATIONS</small>
          </div>
        </Link>

        <div className="ys5-sidebar-label">
          MANAGEMENT CONSOLE
        </div>

        <nav className="ys5-sidebar-nav">
          {NAV.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.end)}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `ys5-sidebar-link ${
                    isActive ? "is-active" : ""
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.6} />
                <span>{item.label}</span>
                <ArrowUpRight size={15} />
              </NavLink>
            );
          })}
        </nav>

        <div className="ys5-sidebar-spacer" />

        <div className="ys5-sidebar-note">
          <Sparkles size={22} strokeWidth={1.4} />
          <strong>A calmer way to manage.</strong>
          <p>
            A demonstration workspace for resort operations,
            not a live property-management system.
          </p>
        </div>

        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="ys5-sidebar-back"
        >
          <ArrowLeft size={17} />
          Back to website
        </Link>
      </aside>

      {open && (
        <button
          className="ys5-mobile-scrim"
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <div className="ys5-admin-main">
        <header className="ys5-topbar">
          <div className="ys5-topbar-left">
            <button
              type="button"
              className="ys5-menu-button"
              onClick={() => setOpen((current) => !current)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </button>

            <div>
              <span className="ys5-topbar-kicker">
                RESORT OPERATIONS
              </span>
              <strong>YOUR STAY CONSOLE</strong>
            </div>
          </div>

          <div className="ys5-topbar-right">
            <span className="ys5-topbar-stat">
              <Building2 size={16} />
              {accommodations.length} stays
            </span>

            <span className="ys5-topbar-stat">
              <CalendarDays size={16} />
              {stats.activeReservations} active
            </span>

            <span className="ys5-demo-pill">
              DEMO MODE
            </span>
          </div>
        </header>

        <main className="ys5-workspace">
          <Outlet />
        </main>

        <footer className="ys5-admin-footer">
          <span>
            © {new Date().getFullYear()} YOUR STAY.
          </span>
          <span>
            Website Concept Made by: Web Developer Devin Planas
          </span>
        </footer>
      </div>
    </div>
  );
}