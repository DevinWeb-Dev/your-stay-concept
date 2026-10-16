import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  LayoutDashboard,
  Menu,
  MoveUpRight,
  Waves,
  X,
} from "lucide-react";
import { BRAND, DEMO_NOTICES } from "../data/config.js";
import { useResort } from "../context/ResortContext.jsx";
import "../styles/stay-atlas.css";

const links = [
  { path: "/", label: "Discover", end: true },
  { path: "/stays", label: "The collection" },
  { path: "/experiences", label: "Experiences" },
  { path: "/packages", label: "Packages" },
  { path: "/offers", label: "Offers" },
  { path: "/gallery", label: "The journal" },
  { path: "/story", label: "Our philosophy" },
];

function Brand({ light = false, onClick }) {
  return (
    <Link
      to="/"
      className={`tsa-brand ${light ? "tsa-brand--light" : ""}`}
      onClick={onClick}
      aria-label="YOUR STAY, return to home"
    >
      <span className="tsa-brand__symbol" aria-hidden="true">
        <Waves size={24} strokeWidth={1.35} />
      </span>
      <span className="tsa-brand__text">
        <strong>YOUR STAY<span>.</span></strong>
        <small>THE UNHURRIED ATLAS</small>
      </span>
    </Link>
  );
}

export default function PublicLayout() {
  const location = useLocation();
  const { favorites } = useResort();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef(null);
  const toggleRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector("a[href]")?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const items = [...panelRef.current.querySelectorAll("a[href], button:not([disabled])")]
        .filter((element) => element.getClientRects().length > 0);
      if (!items.length) return;
      if (event.shiftKey && document.activeElement === items[0]) {
        event.preventDefault();
        items.at(-1).focus();
      } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault();
        items[0].focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [open]);

  return (
    <div className="ys-site tsa-site" id="top">
      <a href="#main-content" className="tsa-skip">Skip to content</a>
      <div className="tsa-issue-strip">
        <span>YOUR STAY / COASTAL COLLECTION</span>
        <span>NOT ALL WHO WANDER NEED TO HURRY</span>
        <span>A DEV CODEWORKS CONCEPT · 2026</span>
      </div>

      <header className={`tsa-header ${scrolled ? "is-scrolled" : ""}`}>
        <div className="tsa-header__inner">
          <Brand />
          <nav className="tsa-header__nav" aria-label="Main navigation">
            {links.slice(0, 5).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) => `tsa-header__link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="tsa-header__actions">
            <Link
              className="tsa-header__saved"
              to="/stays?favorites=1"
              aria-label={`View ${favorites.length} saved stays`}
            >
              <Heart size={20} strokeWidth={1.7} />
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </Link>
            <Link className="tsa-header__staff" to="/staff">
              <LayoutDashboard size={16} /> Staff demo
            </Link>
            <Link className="tsa-header__book" to="/booking">
              Plan your escape <ArrowUpRight size={17} />
            </Link>
            <button
              className="tsa-header__menu"
              type="button"
              ref={toggleRef}
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="tsa-drawer"
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <button
          className="tsa-drawer__backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="tsa-drawer"
        className={`tsa-drawer ${open ? "is-open" : ""}`}
        ref={panelRef}
        inert={!open}
        role={open ? "dialog" : undefined}
        aria-modal={open ? "true" : undefined}
        aria-label="Site navigation"
      >
        <div className="tsa-drawer__top">
          <span>THE DESTINATION INDEX / VOL. 01</span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={22} /></button>
        </div>
        <nav aria-label="Expanded navigation" className="tsa-drawer__links">
          {links.map((item, index) => (
            <NavLink key={item.path} to={item.path} end={item.end}>
              <small>{String(index + 1).padStart(2, "0")}</small>
              <strong>{item.label}</strong>
              <MoveUpRight size={21} />
            </NavLink>
          ))}
        </nav>
        <div className="tsa-drawer__bottom">
          <Link to="/contact">Contact us <ArrowUpRight size={16} /></Link>
          <Link to="/staff"><LayoutDashboard size={17} /> Enter staff demo <ArrowUpRight size={16} /></Link>
          <span>EXPLORATION, REIMAGINED.</span>
        </div>
      </aside>

      <main id="main-content" className="ys-main" tabIndex={-1}>
        <Outlet />
      </main>

      <section className="tsa-between" aria-label="Explore the resort management demo">
        <div>
          <span className="tsa-micro">FOR BUSINESS OWNERS / THE OTHER SIDE OF THE STAY</span>
          <h2>The guest sees paradise.<br /><em>You see the whole picture.</em></h2>
        </div>
        <Link to="/staff">Enter management demo <ArrowUpRight size={19} /></Link>
      </section>

      <footer className="tsa-footer">
        <div className="tsa-footer__intro">
          <span className="tsa-micro">ISSUE 01 · A PLACE TO REMEMBER</span>
          <h2>Meet me <em>elsewhere.</em></h2>
          <Link to="/stays" aria-label="Discover the villa collection"><ArrowUpRight size={33} /></Link>
        </div>
        <div className="tsa-footer__columns">
          <div className="tsa-footer__identity">
            <Brand light />
            <p>{BRAND.tagline}</p>
          </div>
          <div className="tsa-footer__column">
            <strong>THE DESTINATIONS</strong>
            <Link to="/stays">Villas & suites</Link>
            <Link to="/packages">Packages</Link>
            <Link to="/offers">Seasonal offers</Link>
            <Link to="/experiences">Experiences</Link>
            <Link to="/booking">Booking demo</Link>
          </div>
          <div className="tsa-footer__column">
            <strong>THE JOURNAL</strong>
            <Link to="/gallery">Gallery</Link>
            <Link to="/story">Our story</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/stays?favorites=1">Saved stays</Link>
            <Link to="/staff">Staff dashboard</Link>
          </div>
          <div className="tsa-footer__note">
            <Compass size={25} strokeWidth={1.2} />
            <p>Made for people who believe a change of scenery can change everything.</p>
            <small>Philippines-inspired / Fictional resort concept</small>
          </div>
        </div>
        <div className="tsa-footer__legal">
          <span>© {new Date().getFullYear()} YOUR STAY. · DESIGN CONCEPT</span>
          <span>{BRAND.developerCredit}</span>
        </div>
        <p className="tsa-footer__disclaimer">{DEMO_NOTICES.booking} {DEMO_NOTICES.images} {DEMO_NOTICES.payment}</p>
      </footer>

      <Link className="tsa-staff-float" to="/staff" aria-label="Open the interactive resort management dashboard">
        <LayoutDashboard size={19} />
        <span>EXPLORE STAFF DEMO</span>
        <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}