import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useSearchParams } from "react-router-dom";

import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Compass,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

import {
  AMENITIES,
  DEMO_NOTICES,
  PHOTOS,
  RESORT_ZONES,
  STAY_CATEGORIES,
  formatPeso,
  getZone,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

import {
  CoastalContours,
  Reveal,
  TideCompass,
} from "../../components/StayMotion.jsx";

import "../../styles/stay-residences-architectural.css";

const COMPARE_KEY = "your-stay-architectural-compare-v1";
const money = formatPeso;

const two = (n) => String(n).padStart(2, "0");

const cap = (v, min, max) =>
  Math.min(max, Math.max(min, Number(v) || min));

const dateIn = (days) => {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);

  return localDateKey(date);
};

const nextDay = (key) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) {
    return dateIn(1);
  }

  const d = new Date(`${key}T12:00:00`);

  d.setDate(d.getDate() + 1);

  return localDateKey(d);
};

const detailLink = (stay, dates) => {
  const q = new URLSearchParams({
    checkIn: dates.checkIn,
    checkOut: dates.checkOut,
    guests: String(Math.min(dates.guests, stay.maxGuests)),
  });

  return `/stays/${stay.id}?${q}`;
};

/* ===========================================
   COMPARISON STUDIO
=========================================== */

function CompareStudio({
  selected,
  dates,
  getQuote,
  onRemove,
  onClose,
}) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);

  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    ref.current?.querySelector("button")?.focus();

    function keydown(event) {
      if (event.key === "Escape") {
        return closeRef.current();
      }

      if (event.key !== "Tab" || !ref.current) return;

      const nodes = [
        ...ref.current.querySelectorAll(
          'a[href],button:not([disabled])'
        ),
      ];

      if (!nodes.length) return;

      if (
        event.shiftKey &&
        document.activeElement === nodes[0]
      ) {
        event.preventDefault();
        nodes.at(-1).focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === nodes.at(-1)
      ) {
        event.preventDefault();
        nodes[0].focus();
      }
    }

    document.addEventListener("keydown", keydown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", keydown);

      if (previous?.isConnected) previous.focus();
    };
  }, []);

  const rows = [
    ["Architecture", (s) => s.category.toUpperCase()],
    ["Setting", (s) => getZone(s.zoneId)?.label || "—"],
    ["Nightly rate", (s) => money(s.nightlyRate)],
    ["Interior", (s) => `${s.sizeSqm} m²`],
    ["Bedrooms / baths", (s) => `${s.bedrooms} / ${s.bathrooms}`],
    ["Guest capacity", (s) => `Up to ${s.maxGuests}`],
    [
      "Private pool",
      (s) =>
        s.amenities.includes("private-pool")
          ? "Included"
          : "Not listed",
    ],
    [
      "Ocean outlook",
      (s) =>
        s.amenities.includes("ocean-view")
          ? "Included"
          : "Not listed",
    ],
    [
      "Selected date estimate",
      (s) => {
        const q = getQuote({
          accommodationId: s.id,
          ...dates,
          guests: Math.min(dates.guests, s.maxGuests),
          addOnIds: [],
        });

        return q.ok ? money(q.total) : "Unavailable";
      },
    ],
  ];

  return createPortal(
    <div
      className="yr2-modal-backdrop"
      onMouseDown={(e) =>
        e.target === e.currentTarget && onClose()
      }
    >
      <section
        className="yr2-compare-modal"
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Compare selected villas"
      >
        <div className="yr2-compare-heading">
          <div>
            <span className="yr2-eyebrow">
              THE SELECTION ROOM / SIDE BY SIDE
            </span>

            <h2>
              Consider the <em>differences.</em>
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
          >
            <X size={22} />
          </button>
        </div>

        <div className="yr2-compare-scroll">
          <div
            className="yr2-compare-matrix"
            style={{ "--columns": selected.length }}
          >
            <div className="yr2-compare-label">
              VILLA INDEX / CONCEPT
            </div>

            {selected.map((stay) => (
              <div className="yr2-compare-cover" key={stay.id}>
                <img
                  src={stay.images[0]}
                  alt={`Illustrative ${stay.name}`}
                />

                <strong>{stay.name}</strong>

                <button
                  type="button"
                  onClick={() => onRemove(stay.id)}
                >
                  <X size={13} /> REMOVE
                </button>
              </div>
            ))}

            {rows.map(([label, getValue]) => (
              <div className="yr2-compare-line" key={label}>
                <span>{label}</span>

                {selected.map((stay) => (
                  <strong key={stay.id}>
                    {getValue(stay)}
                  </strong>
                ))}
              </div>
            ))}

            <div className="yr2-compare-line yr2-compare-final">
              <span>NEXT CHAPTER</span>

              {selected.map((stay) => (
                <Link
                  key={stay.id}
                  to={detailLink(stay, dates)}
                  onClick={onClose}
                >
                  EXPLORE <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="yr2-micro-note">
          Rates, photographs and availability are illustrative.
          The estimates above come from the local booking engine.
        </p>
      </section>
    </div>,
    document.body
  );
}

/* ===========================================
   RESIDENCE FOLIO
=========================================== */

function StayPlate({
  stay,
  index,
  dates,
  saved,
  selected,
  onFavorite,
  onCompare,
  getQuote,
}) {
  const quote = getQuote({
    accommodationId: stay.id,
    ...dates,
    guests: Math.min(dates.guests, stay.maxGuests),
    addOnIds: [],
  });

  const amenityNames = stay.amenities.slice(0, 3).map(
    (id) => AMENITIES.find((a) => a.id === id)?.label || id
  );

  return (
    <Reveal
      as="article"
      className={`yr2-residence yr2-residence--${index % 4}`}
      delay={(index % 2) * 100}
    >
      <div className="yr2-residence-media">
        <Link
          to={detailLink(stay, dates)}
          className="yr2-residence-photo"
          aria-label={`Explore ${stay.name}`}
        >
          <img
            src={stay.images[0]}
            loading="lazy"
            alt={`Illustrative architecture of ${stay.name}`}
          />
        </Link>

        <div className="yr2-residence-image-index">
          <span>YS / {two(index + 1)}</span>
          <span>
            {getZone(stay.zoneId)?.label?.toUpperCase()}
          </span>
        </div>

        <div className="yr2-residence-secondary">
          <img
            src={stay.images[1] || stay.images[0]}
            loading="lazy"
            alt={`Illustrative interior of ${stay.name}`}
          />
          <span>SPACE STUDY {two(index + 1)}</span>
        </div>

        <button
          className={`yr2-heart ${saved ? "is-saved" : ""}`}
          type="button"
          onClick={onFavorite}
          aria-label={`${saved ? "Remove" : "Save"} ${stay.name}`}
          aria-pressed={saved}
        >
          <Heart
            size={20}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="yr2-residence-details">
        <div className="yr2-residence-label">
          <span>THE COLLECTION / {two(index + 1)}</span>
          <span>
            {stay.sizeSqm} M² · {stay.bedrooms} BEDROOMS
          </span>
        </div>

        <h3>
          <Link to={detailLink(stay, dates)}>
            {stay.name}
          </Link>
        </h3>

        <p>{stay.longDescription}</p>

        <div className="yr2-residence-features">
          {amenityNames.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>

        <div className="yr2-residence-quote">
          <span
            className={
              quote.ok ? "available" : "unavailable"
            }
          >
            <i />

            {quote.ok
              ? `DEMO AVAILABLE · ${quote.nights} NIGHTS`
              : quote.error}
          </span>

          <strong>
            {quote.ok ? money(quote.total) : "—"}

            <small>
              {quote.ok
                ? " / STAY ESTIMATE"
                : " / NO QUOTE"}
            </small>
          </strong>
        </div>

        <div className="yr2-residence-actions">
          <Link to={detailLink(stay, dates)}>
            VIEW RESIDENCE
            <ArrowUpRight size={17} />
          </Link>

          <button
            type="button"
            onClick={onCompare}
            aria-pressed={selected}
            className={selected ? "selected" : ""}
          >
            <ArrowLeftRight size={16} />
            {selected ? "SELECTED" : "COMPARE"}
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/* ===========================================
   THE ARCHITECTURAL DISCOVERY CATALOG
=========================================== */

export default function StaysPage() {
  const [params, setParams] = useSearchParams();

  const {
    accommodations,
    favorites,
    actions,
    getQuote,
    reservations,
    maintenanceBlocks,
  } = useResort();

  const highest = Math.max(
    ...accommodations.map((s) => s.nightlyRate),
    1000
  );

  const maxGuests = Math.max(
    ...accommodations.map((s) => s.maxGuests),
    1
  );

  const [dates, setDates] = useState(() => ({
    checkIn: params.get("checkIn") || dateIn(2),
    checkOut: params.get("checkOut") || dateIn(4),
    guests: cap(params.get("guests") || 2, 1, maxGuests),
  }));

  const [query, setQuery] = useState(params.get("q") || "");
  const [zone, setZone] = useState(
    params.get("zone") || "all"
  );

  const [category, setCategory] = useState(
    params.get("category") || "all"
  );

  const [amenity, setAmenity] = useState("all");
  const [price, setPrice] = useState(highest);
  const [sort, setSort] = useState("editorial");

  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [savedOnly, setSavedOnly] = useState(
    params.get("favorites") === "1"
  );

  const [expanded, setExpanded] = useState(false);

  const [compare, setCompare] = useState(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem(COMPARE_KEY) || "[]"
      );

      return Array.isArray(value)
        ? value
            .filter((id) =>
              accommodations.some((s) => s.id === id)
            )
            .slice(0, 3)
        : [];
    } catch {
      return [];
    }
  });

  const [compareOpen, setCompareOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (params.get("favorites") === "1") {
      setSavedOnly(true);
    }

    const incoming = params.get("zone");

    if (RESORT_ZONES.some((z) => z.id === incoming)) {
      setZone(incoming);
    }

    const checkIn = params.get("checkIn");
    const checkOut = params.get("checkOut");

    if (checkIn && checkOut) {
      setDates((d) => ({
        ...d,
        checkIn,
        checkOut,
      }));
    }
  }, [params]);

  useEffect(() => {
    try {
      localStorage.setItem(
        COMPARE_KEY,
        JSON.stringify(compare)
      );
    } catch {
      // Comparison storage is optional.
    }
  }, [compare]);

  const shortlist = compare
    .map((id) => accommodations.find((s) => s.id === id))
    .filter(Boolean);

  const listed = useMemo(
    () =>
      accommodations
        .filter((stay) => {
          const text = `
            ${stay.name}
            ${stay.description}
            ${getZone(stay.zoneId)?.label}
            ${stay.amenities.join(" ")}
          `.toLowerCase();

          if (
            query &&
            !text.includes(query.trim().toLowerCase())
          ) {
            return false;
          }

          if (zone !== "all" && stay.zoneId !== zone) {
            return false;
          }

          if (
            category !== "all" &&
            stay.category !== category
          ) {
            return false;
          }

          if (
            amenity !== "all" &&
            !stay.amenities.includes(amenity)
          ) {
            return false;
          }

          if (
            stay.nightlyRate > price ||
            stay.maxGuests < dates.guests
          ) {
            return false;
          }

          if (
            savedOnly &&
            !favorites.includes(stay.id)
          ) {
            return false;
          }

          if (
            onlyAvailable &&
            !getQuote({
              accommodationId: stay.id,
              ...dates,
              addOnIds: [],
            }).ok
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          if (sort === "price-up") {
            return a.nightlyRate - b.nightlyRate;
          }

          if (sort === "price-down") {
            return b.nightlyRate - a.nightlyRate;
          }

          if (sort === "size") {
            return b.sizeSqm - a.sizeSqm;
          }

          return Number(b.featured) - Number(a.featured);
        }),
    [
      accommodations,
      favorites,
      reservations,
      maintenanceBlocks,
      getQuote,
      query,
      zone,
      category,
      amenity,
      price,
      dates,
      savedOnly,
      onlyAvailable,
      sort,
    ]
  );

  function changeDate(key, value) {
    setDates((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "checkIn" &&
      value &&
      prev.checkOut <= value
        ? { checkOut: nextDay(value) }
        : {}),
    }));
  }

  function toggleComparison(id) {
    if (compare.includes(id)) {
      return setCompare((p) =>
        p.filter((x) => x !== id)
      );
    }

    if (compare.length >= 3) {
      setNotice(
        "The selection room holds three villas. Remove one before choosing another."
      );
      return;
    }

    setCompare((p) => [...p, id]);
    setNotice("");
  }

  function clear() {
    setQuery("");
    setZone("all");
    setCategory("all");
    setAmenity("all");
    setPrice(highest);
    setSavedOnly(false);
    setOnlyAvailable(false);
    setSort("editorial");

    setDates({
      checkIn: dateIn(2),
      checkOut: dateIn(4),
      guests: 2,
    });

    setParams({}, { replace: true });
  }

  function toggleFavorite(id) {
    const response = actions.toggleFavorite(id);

    if (!response.ok) {
      setNotice(
        response.error ||
          "Unable to update favorites."
      );
    }
  }

  return (
    <div className="yr2-page yr2-catalog">
      {/* ARCHITECTURAL INDEX HERO */}

      <section className="yr2-index-hero">
        <div className="yr2-index-copy">
          <span className="yr2-eyebrow">
            YOUR STAY / ARCHITECTURAL INDEX / VOL. 02
          </span>

          <div className="yr2-index-heading">
            <span>THE UNHURRIED ATLAS</span>

            <h1>
              Spaces that
              <br />
              <em>stay with you.</em>
            </h1>

            <p>
              Four imagined residences, each a different
              way to inhabit the horizon. Discover them
              by feeling, setting, scale, and the small
              details that matter.
            </p>
          </div>

          <a
            href="#yr2-discovery"
            className="yr2-hero-explore"
          >
            ENTER THE COLLECTION
            <ArrowDown size={17} />
          </a>

          <TideCompass className="yr2-index-compass" />
        </div>

        <div className="yr2-index-photo">
          <img
            src={PHOTOS.pool}
            alt="Illustrative tropical villa pool and architecture"
          />

          <CoastalContours pale />

          <span className="yr2-index-vertical">
            ARCHITECTURE / HORIZON / REST
          </span>

          <span className="yr2-index-image-note">
            Y/S — FIELD STUDY 002
          </span>

          <div className="yr2-index-circle">
            THE PRIVATE
            <br />
            COLLECTION
            <br />
            <strong>04</strong>
          </div>
        </div>
      </section>

      {/* DISCOVERY STUDIO */}

      <section
        className="yr2-discovery"
        id="yr2-discovery"
      >
        <div className="yr2-shell">
          <Reveal className="yr2-heading">
            <div>
              <span className="yr2-eyebrow">
                01 / THE DISCOVERY STUDIO
              </span>

              <h2>
                Find your <em>elsewhere.</em>
              </h2>
            </div>

            <p>
              Explore the collection with a custom
              architectural index. Your selected nights
              and guests are checked against the
              actual local demo inventory.
            </p>
          </Reveal>

          <div className="yr2-filter-studio">
            <div className="yr2-filter-heading">
              <span>
                <SlidersHorizontal size={18} />
                THE DISCOVERY CONTROLS
              </span>

              <button
                type="button"
                onClick={() =>
                  setExpanded((v) => !v)
                }
                aria-expanded={expanded}
                aria-controls="yr2-advanced"
              >
                {expanded
                  ? "LESS DETAIL"
                  : "MORE FILTERS"}
                <ChevronDown size={16} />
              </button>
            </div>

            <div className="yr2-filter-primary">
              <label className="yr2-date-field">
                <span>
                  <CalendarDays size={15} />
                  ARRIVAL
                </span>

                <input
                  type="date"
                  aria-label="Arrival"
                  min={dateIn(0)}
                  value={dates.checkIn}
                  onChange={(e) =>
                    changeDate(
                      "checkIn",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="yr2-date-field">
                <span>
                  <CalendarDays size={15} />
                  DEPARTURE
                </span>

                <input
                  type="date"
                  aria-label="Departure"
                  min={nextDay(dates.checkIn)}
                  value={dates.checkOut}
                  onChange={(e) =>
                    changeDate(
                      "checkOut",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="yr2-date-field">
                <span>
                  <Users size={15} />
                  PEOPLE
                </span>

                <select
                  value={dates.guests}
                  onChange={(e) =>
                    changeDate(
                      "guests",
                      Number(e.target.value)
                    )
                  }
                >
                  {Array.from(
                    { length: maxGuests },
                    (_, i) => i + 1
                  ).map((g) => (
                    <option key={g} value={g}>
                      {g} {g === 1 ? "guest" : "guests"}
                    </option>
                  ))}
                </select>
              </label>

              <label className="yr2-date-field">
                <span>
                  <MapPin size={15} />
                  LANDSCAPE
                </span>

                <select
                  value={zone}
                  onChange={(e) =>
                    setZone(e.target.value)
                  }
                >
                  <option value="all">
                    Any setting
                  </option>

                  {RESORT_ZONES.map((z) => (
                    <option value={z.id} key={z.id}>
                      {z.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div
              className="yr2-types"
              role="group"
              aria-label="Accommodation type"
            >
              {STAY_CATEGORIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={
                    category === item.id
                      ? "active"
                      : ""
                  }
                  aria-pressed={
                    category === item.id
                  }
                  onClick={() =>
                    setCategory(item.id)
                  }
                >
                  {item.label}

                  <sup>
                    {item.id === "all"
                      ? accommodations.length
                      : accommodations.filter(
                          (s) =>
                            s.category === item.id
                        ).length}
                  </sup>
                </button>
              ))}
            </div>

            <div
              id="yr2-advanced"
              className={`yr2-advanced ${
                expanded ? "is-open" : ""
              }`}
              hidden={!expanded}
            >
              <div className="yr2-advanced-grid">
                <label className="yr2-search">
                  <Search size={19} />

                  <input
                    type="search"
                    aria-label="Search villas"
                    placeholder="A villa, a setting, a feeling..."
                    value={query}
                    onChange={(e) =>
                      setQuery(e.target.value)
                    }
                  />
                </label>

                <label className="yr2-select-label">
                  SORT THE INDEX

                  <select
                    value={sort}
                    onChange={(e) =>
                      setSort(e.target.value)
                    }
                  >
                    <option value="editorial">
                      Curator's selection
                    </option>
                    <option value="price-up">
                      Lowest nightly rate
                    </option>
                    <option value="price-down">
                      Highest nightly rate
                    </option>
                    <option value="size">
                      Largest architecture
                    </option>
                  </select>
                </label>

                <label className="yr2-select-label">
                  SIGNATURE DETAIL

                  <select
                    value={amenity}
                    onChange={(e) =>
                      setAmenity(e.target.value)
                    }
                  >
                    <option value="all">
                      All amenities
                    </option>

                    {AMENITIES.map((a) => (
                      <option
                        key={a.id}
                        value={a.id}
                      >
                        {a.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="yr2-advanced-foot">
                <label className="yr2-budget">
                  <span>
                    MAXIMUM RATE / NIGHT
                    <strong>{money(price)}</strong>
                  </span>

                  <input
                    type="range"
                    min="0"
                    max={highest}
                    step="100"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        Number(e.target.value)
                      )
                    }
                  />
                </label>

                <div className="yr2-switches">
                  <button
                    type="button"
                    aria-pressed={savedOnly}
                    className={
                      savedOnly ? "active" : ""
                    }
                    onClick={() =>
                      setSavedOnly((v) => !v)
                    }
                  >
                    <Heart size={15} />
                    SAVED ONLY
                  </button>

                  <button
                    type="button"
                    aria-pressed={onlyAvailable}
                    className={
                      onlyAvailable ? "active" : ""
                    }
                    onClick={() =>
                      setOnlyAvailable((v) => !v)
                    }
                  >
                    <CheckCircle2 size={15} />
                    AVAILABLE ONLY
                  </button>
                </div>
              </div>
            </div>

            <div className="yr2-filter-bottom">
              <span>
                <strong>{two(listed.length)}</strong>
                RESIDENCES IN VIEW
                <small>/ 04 STUDIES</small>
              </span>

              <button
                type="button"
                onClick={clear}
              >
                RESET DISCOVERY
                <X size={14} />
              </button>
            </div>
          </div>

          {/* ASYMMETRICAL VILLA COLLECTION */}

          {listed.length > 0 ? (
            <div className="yr2-residence-grid">
              {listed.map((stay, index) => (
                <StayPlate
                  key={stay.id}
                  stay={stay}
                  index={index}
                  dates={dates}
                  saved={favorites.includes(stay.id)}
                  selected={compare.includes(stay.id)}
                  onFavorite={() =>
                    toggleFavorite(stay.id)
                  }
                  onCompare={() =>
                    toggleComparison(stay.id)
                  }
                  getQuote={getQuote}
                />
              ))}
            </div>
          ) : (
            <div className="yr2-no-match">
              <Compass
                size={42}
                strokeWidth={1}
              />

              <h3>
                Not every horizon
                <br />
                <em>fits today.</em>
              </h3>

              <p>
                Nothing matches those selections.
                Try a different setting, more
                flexible dates or fewer filters.
              </p>

              <button
                type="button"
                onClick={clear}
              >
                RESET YOUR SEARCH
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {notice && (
            <p
              className="yr2-message"
              role="status"
            >
              {notice}
            </p>
          )}

          <div className="yr2-index-foot">
            <span>
              ILLUSTRATIVE RESIDENCES / NOT A LIVE RESORT
            </span>

            <span>
              YS — PRIVATE COLLECTION 2026
            </span>
          </div>
        </div>
      </section>

      {/* EDITORIAL OUTRO */}

      <section className="yr2-chapter-outro">
        <CoastalContours pale />

        <div>
          <span className="yr2-eyebrow">
            BEYOND THE RESIDENCE / 03
          </span>

          <h2>
            The horizon is
            <br />
            <em>just the beginning.</em>
          </h2>

          <p>
            Stay for the space. Remember everything
            that happens around it.
          </p>

          <Link to="/experiences">
            DISCOVER THE EXPERIENCES
            <ArrowUpRight size={19} />
          </Link>
        </div>

        <img
          src={PHOTOS.terrace}
          alt="Illustrative tropical terrace"
          loading="lazy"
        />
      </section>

      <p className="yr2-legal">
        {DEMO_NOTICES.images} {DEMO_NOTICES.booking}
      </p>

      {/* COMPARISON SHORTLIST */}

      {shortlist.length > 0 && (
        <div
          className="yr2-shortlist"
          role="region"
          aria-label="Your comparison shortlist"
        >
          <div>
            <span>
              SELECTION ROOM / {shortlist.length} OF 3
            </span>

            <strong>
              {shortlist
                .map((s) => s.name)
                .join(" · ")}
            </strong>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setCompare([])}
            >
              CLEAR <X size={14} />
            </button>

            <button
              type="button"
              disabled={shortlist.length < 2}
              onClick={() =>
                setCompareOpen(true)
              }
            >
              COMPARE VILLAS
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      )}

      {compareOpen && shortlist.length >= 2 && (
        <CompareStudio
          selected={shortlist}
          dates={dates}
          getQuote={getQuote}
          onRemove={toggleComparison}
          onClose={() =>
            setCompareOpen(false)
          }
        />
      )}
    </div>
  );
}