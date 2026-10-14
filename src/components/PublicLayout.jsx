import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  Menu,
  Waves,
  X,
} from "lucide-react";

import {
  BRAND,
  DEMO_NOTICES,
} from "../data/config.js";

import { useResort } from "../context/ResortContext.jsx";

const NAV_LINKS = [
  { label: "Discover", path: "/" },
  { label: "Villas & Suites", path: "/stays" },
  { label: "Packages", path: "/packages" },
  { label: "Offers", path: "/offers" },
  { label: "Experiences", path: "/experiences" },
  { label: "Gallery", path: "/gallery" },
  { label: "Our Story", path: "/story" },
];

export default function PublicLayout() {
  const { favorites } = useResort();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });

    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 42);

    update();

    window.addEventListener("scroll", update, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener(
        "keydown",
        closeOnEscape
      );
    };
  }, [menuOpen]);

  const transparent =
    location.pathname === "/" &&
    !scrolled &&
    !menuOpen;

  return (
    <div className="ys-site" id="top">
      <button
        className="ys-skip"
        type="button"
        onClick={() =>
          document.getElementById("main-content")?.focus()
        }
      >
        Skip to content
      </button>

      <header
        className={`ys-header ${
          transparent
            ? "ys-header--over-hero"
            : "ys-header--solid"
        }`}
      >
        <div className="ys-header__inner ys-shell">
          <Link
            to="/"
            className="ys-brand"
            aria-label="YOUR STAY home"
          >
            <span
              className="ys-brand__mark"
              aria-hidden="true"
            >
              <Waves size={23} strokeWidth={1.5} />
            </span>

            <span className="ys-brand__name">
              YOUR STAY
              <span className="ys-brand__dot">.</span>
            </span>
          </Link>

          <nav
            className="ys-desktop-nav"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `ys-nav-link ${
                    isActive ? "is-current" : ""
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ys-header__actions">
            <Link
              to="/stays?favorites=1"
              className="ys-icon-link"
              aria-label={`View saved stays, ${favorites.length} selected`}
            >
              <Heart size={19} strokeWidth={1.65} />

              {favorites.length > 0 && (
                <span className="ys-heart-count">
                  {favorites.length}
                </span>
              )}
            </Link>

            <Link
              to="/booking"
              className="ys-header__reserve"
            >
              Reserve a stay
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              className="ys-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="ys-mobile-menu"
              aria-label={
                menuOpen ? "Close menu" : "Open menu"
              }
              onClick={() =>
                setMenuOpen((current) => !current)
              }
            >
              {menuOpen ? (
                <X size={25} />
              ) : (
                <Menu size={25} />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        id="ys-mobile-menu"
        className={`ys-mobile-menu ${
          menuOpen ? "is-open" : ""
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="ys-mobile-menu__nav"
          aria-label="Mobile navigation"
        >
          <span className="ys-kicker">
            YOUR NEXT ESCAPE
          </span>

          {NAV_LINKS.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              <span className="ys-mobile-menu__num">
                {String(index + 1).padStart(2, "0")}
              </span>

              {item.label}

              <ArrowUpRight
                size={21}
                strokeWidth={1.4}
              />
            </NavLink>
          ))}

          <NavLink
            to="/contact"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            <span className="ys-mobile-menu__num">
              08
            </span>

            Contact

            <ArrowUpRight size={21} />
          </NavLink>

          <Link
            className="ys-mobile-menu__cta"
            to="/booking"
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setMenuOpen(false)}
          >
            Explore booking
            <ArrowRight size={17} />
          </Link>
        </nav>
      </div>

      <main
        id="main-content"
        tabIndex={-1}
        className="ys-main"
      >
        <Outlet />
      </main>

      <footer className="ys-footer">
        <div className="ys-shell">
          <div className="ys-footer__top">
            <div>
              <span className="ys-kicker ys-kicker--light">
                A DIFFERENT PACE OF LIFE
              </span>

              <h2>
                Some places
                <br />
                <em>stay with you.</em>
              </h2>
            </div>

            <Link
              to="/stays"
              className="ys-circle-cta"
              aria-label="Explore stays"
            >
              <ArrowUpRight size={27} />
            </Link>
          </div>

          <div className="ys-footer__grid">
            <div className="ys-footer__identity">
              <Link
                to="/"
                className="ys-footer__wordmark"
              >
                YOUR STAY.
              </Link>

              <p>{BRAND.tagline}</p>
            </div>

            <div className="ys-footer__links">
              <span>Explore</span>
              <Link to="/stays">The stays</Link>
              <Link to="/packages">Packages</Link>
              <Link to="/offers">Special offers</Link>
              <Link to="/experiences">Experiences</Link>
            </div>

            <div className="ys-footer__links">
              <span>Discover</span>
              <Link to="/gallery">Gallery</Link>
              <Link to="/story">Our story</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/stays?favorites=1">Saved stays</Link>
            </div>

            <div className="ys-footer__note">
              <Compass
                size={24}
                strokeWidth={1.3}
              />

              <p>
                Made for slow mornings, open skies
                and the beautiful art of doing less.
              </p>

              <span>
                Resort concept · Philippines-inspired
              </span>
            </div>
          </div>

          <div className="ys-footer__bottom">
            <span>
              © {new Date().getFullYear()}{" "}
              {BRAND.name} — Concept only
            </span>

            <span>{BRAND.developerCredit}</span>
          </div>

          <p className="ys-footer__disclaimer">
            {DEMO_NOTICES.booking}{" "}
            {DEMO_NOTICES.images}
          </p>
        </div>
      </footer>
    </div>
  );
}