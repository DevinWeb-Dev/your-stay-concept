import {
  useEffect,
  useRef,
  useState,
} from "react";

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
  ClipboardCheck,
  Compass,
  LayoutDashboard,
  Menu,
  Settings2,
  Users,
  Waves,
  X,
} from "lucide-react";

import {
  useResort,
} from "../context/ResortContext.jsx";

import "../styles/stay-operations-architectural.css";

const NAV = [
  {
    to: "/staff",
    label: "Command center",
    icon: LayoutDashboard,
    end: true,
  },
  {
    to: "/staff/reservations",
    label: "Reservation desk",
    icon: ClipboardCheck,
  },
  {
    to: "/staff/calendar",
    label: "Booking calendar",
    icon: CalendarDays,
  },
  {
    to: "/staff/villas",
    label: "Villa operations",
    icon: Building2,
  },
  {
    to: "/staff/housekeeping",
    label: "Housekeeping",
    icon: Waves,
  },
  {
    to: "/staff/reports",
    label: "Intelligence",
    icon: BarChart3,
  },
  {
    to: "/staff/guests",
    label: "Guest records",
    icon: Users,
  },
  {
    to: "/staff/settings",
    label: "Settings",
    icon: Settings2,
  },
];

export default function StaffLayout() {
  const { pathname } = useLocation();

  const {
    accommodations,
    stats,
  } = useResort();

  const [open, setOpen] =
    useState(false);

  const [mobile, setMobile] =
    useState(
      () =>
        typeof window !== "undefined" &&
        window.matchMedia?.(
          "(max-width: 1120px)"
        ).matches
    );

  const sidebar = useRef(null);
  const menuButton = useRef(null);

  const current = NAV.find((item) =>
    item.end
      ? pathname === item.to
      : pathname === item.to ||
        pathname.startsWith(
          `${item.to}/`
        )
  );

  useEffect(() => {
    const media = window.matchMedia(
      "(max-width: 1120px)"
    );

    const sync = () =>
      setMobile(media.matches);

    sync();

    media.addEventListener(
      "change",
      sync
    );

    return () =>
      media.removeEventListener(
        "change",
        sync
      );
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!open || !mobile) return;

    const previous =
      document.activeElement;

    const overflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    sidebar.current
      ?.querySelector("a[href]")
      ?.focus();

    function keydown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
        return;
      }

      if (
        event.key !== "Tab" ||
        !sidebar.current
      ) {
        return;
      }

      const items = [
        ...sidebar.current.querySelectorAll(
          'a[href],button:not([disabled])'
        ),
      ].filter(
        (node) =>
          node.getClientRects().length
      );

      if (!items.length) return;

      if (
        event.shiftKey &&
        document.activeElement ===
          items[0]
      ) {
        event.preventDefault();
        items.at(-1).focus();
      }

      if (
        !event.shiftKey &&
        document.activeElement ===
          items.at(-1)
      ) {
        event.preventDefault();
        items[0].focus();
      }
    }

    document.addEventListener(
      "keydown",
      keydown
    );

    return () => {
      document.body.style.overflow =
        overflow;

      document.removeEventListener(
        "keydown",
        keydown
      );

      if (previous?.isConnected) {
        previous.focus();
      }
    };
  }, [open, mobile]);

  return (
    <div className="ys5-admin op4-shell">
      {open && mobile && (
        <button
          type="button"
          className="op4-scrim"
          aria-label="Close staff navigation"
          onClick={() =>
            setOpen(false)
          }
        />
      )}

      <aside
        ref={sidebar}
        id="op4-sidebar"
        className={`op4-sidebar ${
          open ? "is-open" : ""
        }`}
        aria-label="Staff workspace navigation"
        inert={mobile && !open}
      >
        <Link
          className="op4-brand"
          to="/staff"
          onClick={() =>
            setOpen(false)
          }
        >
          <span className="op4-brand-symbol">
            <Waves
              size={25}
              strokeWidth={1.25}
            />
          </span>

          <span>
            <strong>
              YOUR STAY.
            </strong>

            <small>
              HOSPITALITY ATELIER
            </small>
          </span>
        </Link>

        <div className="op4-side-edition">
          <span>
            OPERATIONS / NO. 01
          </span>

          <Compass size={18} />
        </div>

        <nav
          className="op4-nav"
          aria-label="Staff sections"
        >
          {NAV.map(
            (
              {
                to,
                label,
                icon: Icon,
                end,
              },
              index
            ) => (
              <NavLink
                key={to}
                end={end}
                to={to}
                onClick={() =>
                  setOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  `op4-nav-link ${
                    isActive
                      ? "is-active"
                      : ""
                  }`
                }
              >
                <small>
                  {String(
                    index + 1
                  ).padStart(2, "0")}
                </small>

                <Icon
                  size={18}
                  strokeWidth={1.5}
                />

                <span>{label}</span>

                <ArrowUpRight
                  size={15}
                  className="op4-nav-arrow"
                />
              </NavLink>
            )
          )}
        </nav>

        <div className="op4-side-bottom">
          <div className="op4-side-note">
            <span>
              THE QUIET SIDE OF OPERATIONS
            </span>

            <p>
              Every reservation is a story.
              Every detail deserves attention.
            </p>

            <small>
              FRONTEND DEMO / LOCAL DATA ONLY
            </small>
          </div>

          <Link
            className="op4-side-return"
            to="/"
          >
            <ArrowLeft size={17} />
            RETURN TO RESORT SITE
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </aside>

      <div className="op4-main">
        <header className="op4-topbar">
          <div className="op4-top-left">
            <button
              ref={menuButton}
              className="op4-menu"
              type="button"
              aria-expanded={open}
              aria-controls="op4-sidebar"
              aria-label={
                open
                  ? "Close staff navigation"
                  : "Open staff navigation"
              }
              onClick={() =>
                setOpen((value) => !value)
              }
            >
              {open ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>

            <div>
              <span>
                THE UNHURRIED ATLAS / OPERATIONS
              </span>

              <strong>
                {current?.label ||
                  "Resort operations"}
              </strong>
            </div>
          </div>

          <div className="op4-top-right">
            <span>
              {accommodations.length}
              {" "}RESIDENCES
            </span>

            <span>
              {stats.activeReservations}
              {" "}ACTIVE RECORDS
            </span>

            <b>
              LOCAL DEMO
            </b>
          </div>
        </header>

        <main
          className="op4-content"
          id="staff-main"
        >
          <Outlet />
        </main>

        <footer className="op4-footer">
          <span>
            YOUR STAY. / CONCEPT
            OPERATIONS STUDIO
          </span>

          <span>
            Website Concept Made by:
            Web Developer Devin Planas
          </span>
        </footer>
      </div>
    </div>
  );
}