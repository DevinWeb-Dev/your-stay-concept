import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Heart,
  Images,
  Maximize2,
  ShieldCheck,
  Users,
  Waves,
  X,
} from "lucide-react";

import {
  ADD_ONS,
  AMENITIES,
  DEMO_NOTICES,
  PHOTOS,
  RESORT_POLICIES,
  STAY_CATEGORIES,
  formatPeso,
  getZone,
} from "../../data/config.js";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

import {
  CoastalContours,
  Reveal,
  TideCompass,
} from "../../components/StayMotion.jsx";

import "../../styles/stay-residences-architectural.css";

const two = (value) =>
  String(value).padStart(2, "0");

function after(days) {
  const d = new Date();

  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);

  return localDateKey(d);
}

function plusOne(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) {
    return after(1);
  }

  const d = new Date(`${key}T12:00:00`);

  d.setDate(d.getDate() + 1);

  return localDateKey(d);
}

function bookingHref(
  stay,
  checkIn,
  checkOut,
  guests,
  extras
) {
  return `/booking?${new URLSearchParams({
    stay: stay.id,
    checkIn,
    checkOut,
    guests: String(guests),
    addOns: extras.join(","),
  })}`;
}

/* ===========================================
   CINEMATIC FULLSCREEN PHOTO GALLERY
=========================================== */

function GalleryViewer({
  stay,
  start,
  onClose,
}) {
  const [active, setActive] = useState(start);

  const dialog = useRef(null);
  const close = useRef(onClose);

  close.current = onClose;

  const images = stay.images;

  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    dialog.current
      ?.querySelector("button")
      ?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        close.current();
      }

      if (e.key === "ArrowRight") {
        setActive(
          (i) => (i + 1) % images.length
        );
      }

      if (e.key === "ArrowLeft") {
        setActive(
          (i) =>
            (i - 1 + images.length) % images.length
        );
      }

      if (e.key !== "Tab" || !dialog.current) return;

      const items = [
        ...dialog.current.querySelectorAll(
          'button:not([disabled])'
        ),
      ];

      if (
        e.shiftKey &&
        document.activeElement === items[0]
      ) {
        e.preventDefault();
        items.at(-1).focus();
      }

      if (
        !e.shiftKey &&
        document.activeElement === items.at(-1)
      ) {
        e.preventDefault();
        items[0].focus();
      }
    };

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;

      if (previous?.isConnected) {
        previous.focus();
      }
    };
  }, [images.length]);

  return createPortal(
    <div
      className="yr2-lightbox"
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${stay.name} photo gallery`}
    >
      <div className="yr2-lightbox-top">
        <span>
          YOUR STAY / PHOTOGRAPHIC SURVEY ·{" "}
          {two(active + 1)} / {two(images.length)}
        </span>

        <button
          type="button"
          aria-label="Close gallery"
          onClick={onClose}
        >
          <X size={22} />
        </button>
      </div>

      <div className="yr2-lightbox-image">
        <img
          src={images[active]}
          alt={`Illustrative ${stay.name}, image ${
            active + 1
          }`}
        />
      </div>

      <div className="yr2-lightbox-bottom">
        <button
          type="button"
          onClick={() =>
            setActive(
              (i) =>
                (i - 1 + images.length) %
                images.length
            )
          }
        >
          <ChevronLeft size={20} />
          PREVIOUS
        </button>

        <span>
          THE RESIDENCE JOURNAL / ILLUSTRATIVE IMAGERY
        </span>

        <button
          type="button"
          onClick={() =>
            setActive(
              (i) => (i + 1) % images.length
            )
          }
        >
          NEXT
          <ChevronRight size={20} />
        </button>
      </div>
    </div>,
    document.body
  );
}

/* ===========================================
   CONCEPTUAL SPATIAL DIAGRAM
=========================================== */

function SpatialDiagram({ stay }) {
  return (
    <div
      className="yr2-spatial-visual"
      aria-label="Abstract illustration of villa spaces, not an architectural floor plan"
    >
      <svg
        viewBox="0 0 650 420"
        role="img"
        aria-label="Conceptual diagram suggesting spaces and circulation; not an actual floor plan"
      >
        <defs>
          <pattern
            id="yr2-lines"
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="9"
              stroke="currentColor"
              strokeOpacity=".11"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <g
          className="yr2-plan-grid"
          stroke="currentColor"
          strokeWidth=".6"
          opacity=".22"
        >
          {Array.from(
            { length: 9 },
            (_, i) => (
              <line
                key={`v${i}`}
                x1={46 + i * 70}
                y1="15"
                x2={46 + i * 70}
                y2="400"
              />
            )
          )}

          {Array.from(
            { length: 6 },
            (_, i) => (
              <line
                key={`h${i}`}
                x1="20"
                y1={42 + i * 67}
                x2="630"
                y2={42 + i * 67}
              />
            )
          )}
        </g>

        <g
          className="yr2-plan-shapes"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        >
          <path d="M118 88 H490 V329 H118 Z" />

          <path
            d="
              M118 192 H336 V329
              M336 88 V260 H490
              M220 192 V260
            "
          />

          <path d="M336 260 H422 V329 M118 260 H220" />

          <path
            d="M99 68 H510 V350 H99 Z"
            strokeDasharray="2 10"
            strokeWidth="1"
          />
        </g>

        <rect
          x="342"
          y="94"
          width="140"
          height="158"
          fill="url(#yr2-lines)"
        />

        <g
          className="yr2-plan-movement"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="4 11"
        >
          <path
            d="
              M150 287
              C205 220 289 277 320 209
              S386 147 446 163
            "
          />
        </g>

        <g
          className="yr2-plan-nodes"
          fill="currentColor"
        >
          <circle cx="150" cy="287" r="5" />
          <circle cx="320" cy="209" r="5" />
          <circle cx="446" cy="163" r="5" />
        </g>

        <g
          className="yr2-plan-labels"
          fill="currentColor"
        >
          <text x="139" y="118">01 / ARRIVE</text>
          <text x="135" y="218">02 / UNWIND</text>
          <text x="356" y="119">03 / OPEN</text>
          <text x="342" y="301">04 / REST</text>

          <text x="100" y="382">
            YS — CONCEPTUAL SPATIAL STUDY
          </text>
        </g>
      </svg>

      <div className="yr2-spatial-watermark">
        {stay.sizeSqm}
        <small>M² / LISTED AREA</small>
      </div>

      <p>
        Abstract exploration of movement,
        openness and rest. Not an accurate
        floor plan or verified property drawing.
      </p>
    </div>
  );
}

/* ===========================================
   IMMERSIVE INDIVIDUAL VILLA JOURNAL
=========================================== */

export default function VillaDetailsPage() {
  const { stayId } = useParams();
  const [params] = useSearchParams();

  const {
    accommodations,
    favorites,
    actions,
    getQuote,
  } = useResort();

  const stay = accommodations.find(
    (s) => s.id === stayId
  );

  const [imageIndex, setImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const [checkIn, setCheckIn] = useState(
    params.get("checkIn") || after(2)
  );

  const [checkOut, setCheckOut] = useState(
    params.get("checkOut") || after(4)
  );

  const [guests, setGuests] = useState(
    Math.max(
      1,
      Number(params.get("guests")) || 2
    )
  );

  const [extras, setExtras] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setImageIndex(0);
    setLightbox(false);
    setExtras([]);
    setNotice("");
  }, [stayId]);

  useEffect(() => {
    const checkIn = params.get("checkIn");
    const checkOut = params.get("checkOut");
    const guests = Number(params.get("guests"));

    if (checkIn && checkOut) {
      setCheckIn(checkIn);
      setCheckOut(checkOut);
    }

    if (
      Number.isInteger(guests) &&
      guests > 0
    ) {
      setGuests(guests);
    }
  }, [params]);

  if (!stay) {
    return (
      <section className="yr2-page yr2-missing">
        <Compass size={48} />

        <span className="yr2-eyebrow">
          UNLISTED DESTINATION
        </span>

        <h1>
          This place is <em>elsewhere.</em>
        </h1>

        <p>
          It's not in our current concept collection.
        </p>

        <Link to="/stays">
          RETURN TO THE VILLAS
          <ArrowRight size={17} />
        </Link>
      </section>
    );
  }

  const images = stay.images;

  const validGuests = Math.min(
    stay.maxGuests,
    Math.max(1, guests)
  );

  const zone = getZone(stay.zoneId);
  const saved = favorites.includes(stay.id);

  const quote = getQuote({
    accommodationId: stay.id,
    checkIn,
    checkOut,
    guests: validGuests,
    addOnIds: extras,
  });

  const related = accommodations
    .filter((s) => s.id !== stay.id)
    .slice(0, 2);

  const position = Math.max(
    0,
    accommodations.findIndex(
      (s) => s.id === stay.id
    )
  );

  function toggleSaved() {
    const result = actions.toggleFavorite(stay.id);

    if (!result.ok) {
      setNotice(
        result.error ||
          "Unable to update favorites."
      );
    } else {
      setNotice(
        saved
          ? "Removed from your saved stays."
          : "Saved to your private collection."
      );
    }
  }

  function changeStart(value) {
    setCheckIn(value);
    setNotice("");

    if (value && checkOut <= value) {
      setCheckOut(plusOne(value));
    }
  }

  function toggleExtra(id) {
    setExtras((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]
    );
  }

  return (
    <div className="yr2-page yr2-detail">
      {/* BREADCRUMB */}

      <div className="yr2-detail-crumb yr2-shell">
        <Link to="/stays">
          <ArrowLeft size={17} />
          THE RESIDENCE INDEX
        </Link>

        <span>
          THE UNHURRIED ATLAS / SPACE{" "}
          {two(position + 1)} OF{" "}
          {two(accommodations.length)}
        </span>
      </div>

      {/* PROPERTY HEADER */}

      <section className="yr2-detail-intro yr2-shell">
        <div>
          <span className="yr2-eyebrow">
            ARCHITECTURAL JOURNAL /{" "}
            {zone?.label?.toUpperCase()} /{" "}
            {STAY_CATEGORIES.find(
              (c) => c.id === stay.category
            )?.label?.toUpperCase()}
          </span>

          <h1>
            {stay.name}
            <span>.</span>
          </h1>

          <p>{stay.longDescription}</p>
        </div>

        <div className="yr2-detail-intro-aside">
          <TideCompass />

          <button
            type="button"
            className={saved ? "saved" : ""}
            aria-pressed={saved}
            onClick={toggleSaved}
          >
            <Heart
              size={18}
              fill={saved ? "currentColor" : "none"}
            />

            {saved
              ? "SAVED"
              : "SAVE TO ATLAS"}
          </button>
        </div>
      </section>

      {/* ARCHITECTURAL PHOTO GALLERY */}

      <section
        className="yr2-detail-gallery yr2-shell"
        aria-label="Villa photographic survey"
      >
        <div className="yr2-gallery-stage">
          <button
            type="button"
            onClick={() => setLightbox(true)}
            aria-label="Open expanded villa gallery"
          >
            <img
              key={`${stay.id}-${imageIndex}`}
              className="yr2-gallery-current"
              src={images[imageIndex]}
              alt={`Illustrative ${stay.name} photograph ${
                imageIndex + 1
              }`}
            />
          </button>

          <div className="yr2-gallery-folio">
            <span>
              THE PHOTOGRAPHIC SURVEY /{" "}
              {two(imageIndex + 1)} — {two(images.length)}
            </span>

            <button
              type="button"
              onClick={() => setLightbox(true)}
            >
              <Images size={17} />
              VIEW ALL PHOTOS
            </button>
          </div>

          <div className="yr2-gallery-arrows">
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() =>
                setImageIndex(
                  (i) =>
                    (i - 1 + images.length) %
                    images.length
                )
              }
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              aria-label="Next photo"
              onClick={() =>
                setImageIndex(
                  (i) =>
                    (i + 1) % images.length
                )
              }
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="yr2-gallery-thumbs">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className={
                imageIndex === i
                  ? "is-current"
                  : ""
              }
              onClick={() => setImageIndex(i)}
              aria-pressed={imageIndex === i}
              aria-label={`Show photograph ${i + 1}`}
            >
              <img
                src={src}
                alt={`Villa thumbnail ${i + 1}`}
              />

              <span>{two(i + 1)}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="yr2-gallery-note yr2-shell">
        <span>
          ILLUSTRATIVE PHOTOGRAPHY /
          NOT A VERIFIED PROPERTY
        </span>

        <span>
          Y/S 02 — MATERIAL, LIGHT & SPACE
        </span>
      </div>

      {/* DETAILS / RESERVATION STUDIO */}

      <div className="yr2-detail-main yr2-shell">
        <div className="yr2-detail-story">
          <Reveal className="yr2-detail-lede">
            <span className="yr2-eyebrow">
              01 / THE PLACE
            </span>

            <h2>
              Made for the
              <br />
              <em>hours between.</em>
            </h2>

            <p>
              {stay.longDescription}{" "}
              {stay.description}
            </p>
          </Reveal>

          {/* PROPERTY SPECIFICATIONS */}

          <Reveal
            className="yr2-detail-facts"
            aria-label="Villa specifications"
          >
            <div>
              <BedDouble size={21} />
              <strong>{two(stay.bedrooms)}</strong>
              <span>BEDROOMS</span>
            </div>

            <div>
              <Waves size={21} />
              <strong>{two(stay.bathrooms)}</strong>
              <span>BATHROOMS</span>
            </div>

            <div>
              <Users size={21} />
              <strong>{two(stay.maxGuests)}</strong>
              <span>GUEST CAPACITY</span>
            </div>

            <div>
              <Maximize2 size={21} />
              <strong>{stay.sizeSqm}</strong>
              <span>SQUARE METRES</span>
            </div>
          </Reveal>

          {/* ANIMATED CONCEPT DIAGRAM */}

          <Reveal className="yr2-detail-chapter">
            <span className="yr2-eyebrow">
              02 / THE SPACE STUDY
            </span>

            <h3>
              Considered from
              <br />
              <em>every angle.</em>
            </h3>

            <SpatialDiagram stay={stay} />
          </Reveal>

          {/* RESORT AMENITIES */}

          <Reveal className="yr2-detail-chapter yr2-amenities">
            <span className="yr2-eyebrow">
              03 / THE LITTLE DETAILS
            </span>

            <h3>
              Room for <em>everything.</em>
            </h3>

            <div>
              {stay.amenities.map((id, i) => (
                <div key={id}>
                  <span>{two(i + 1)}</span>

                  <strong>
                    {AMENITIES.find(
                      (a) => a.id === id
                    )?.label || id}
                  </strong>

                  <Check size={17} />
                </div>
              ))}
            </div>
          </Reveal>

          {/* STAY POLICIES */}

          <Reveal className="yr2-detail-chapter yr2-policies">
            <span className="yr2-eyebrow">
              04 / A FEW USEFUL NOTES
            </span>

            <h3>
              Before you <em>arrive.</em>
            </h3>

            <div>
              <span>STANDARD ARRIVAL</span>
              <strong>
                {RESORT_POLICIES.checkInTime}
              </strong>
            </div>

            <div>
              <span>STANDARD DEPARTURE</span>
              <strong>
                {RESORT_POLICIES.checkOutTime}
              </strong>
            </div>

            <div>
              <span>DEMO STAY LIMIT</span>
              <strong>
                {RESORT_POLICIES.maximumNights} NIGHTS
              </strong>
            </div>
          </Reveal>
        </div>

        {/* ENGINE-CONNECTED BOOKING ATELIER */}

        <aside
          className="yr2-booking-atelier"
          aria-label="Live villa estimate"
        >
          <div className="yr2-booking-top">
            <span>
              THE BOOKING ATELIER / RESIDENCE{" "}
              {two(position + 1)}
            </span>

            <strong>
              {formatPeso(stay.nightlyRate)}
              <small> / NIGHT FROM</small>
            </strong>

            <p>
              Choose your preferred dates and experiences.
              Pricing and availability come directly from
              the browser-only engine.
            </p>
          </div>

          <div className="yr2-booking-inputs">
            <label>
              CHECK IN

              <input
                type="date"
                min={after(0)}
                value={checkIn}
                onChange={(e) =>
                  changeStart(e.target.value)
                }
              />
            </label>

            <label>
              CHECK OUT

              <input
                type="date"
                min={plusOne(checkIn)}
                value={checkOut}
                onChange={(e) => {
                  setCheckOut(e.target.value);
                  setNotice("");
                }}
              />
            </label>

            <label className="full">
              GUESTS

              <select
                value={validGuests}
                onChange={(e) =>
                  setGuests(Number(e.target.value))
                }
              >
                {Array.from(
                  { length: stay.maxGuests },
                  (_, i) => i + 1
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "guest" : "guests"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* OPTIONAL EXPERIENCES */}

          <div className="yr2-booking-extras">
            <span className="yr2-eyebrow">
              PERSONALIZE YOUR STAY
            </span>

            {ADD_ONS.map((item) => (
              <label key={item.id}>
                <input
                  type="checkbox"
                  checked={extras.includes(item.id)}
                  onChange={() =>
                    toggleExtra(item.id)
                  }
                />

                <span>
                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    {item.description}
                  </small>
                </span>

                <b>
                  {item.price
                    ? `+${formatPeso(item.price)}`
                    : "REQUEST"}
                </b>
              </label>
            ))}
          </div>

          {/* LIVE ESTIMATE */}

          <div
            className="yr2-booking-totals"
            aria-live="polite"
          >
            {quote.ok ? (
              <>
                <div>
                  <span>
                    {quote.nights} NIGHTS / BASE
                  </span>

                  <b>
                    {formatPeso(
                      quote.nightlySubtotal
                    )}
                  </b>
                </div>

                {quote.extraGuestTotal > 0 && (
                  <div>
                    <span>
                      ADDITIONAL GUESTS
                    </span>

                    <b>
                      {formatPeso(
                        quote.extraGuestTotal
                      )}
                    </b>
                  </div>
                )}

                {quote.addOnTotal > 0 && (
                  <div>
                    <span>
                      EXPERIENCES
                    </span>

                    <b>
                      {formatPeso(
                        quote.addOnTotal
                      )}
                    </b>
                  </div>
                )}

                <div className="yr2-booking-total">
                  <span>
                    ILLUSTRATIVE TOTAL
                  </span>

                  <strong>
                    {formatPeso(quote.total)}
                  </strong>
                </div>
              </>
            ) : (
              <p className="yr2-unavailable">
                <X size={18} />
                {quote.error}
              </p>
            )}
          </div>

          {quote.ok ? (
            <Link
              className="yr2-booking-submit"
              to={bookingHref(
                stay,
                checkIn,
                checkOut,
                validGuests,
                extras
              )}
            >
              CONTINUE TO DEMO BOOKING
              <ArrowUpRight size={18} />
            </Link>
          ) : (
            <button
              type="button"
              className="yr2-booking-submit"
              disabled
            >
              UNAVAILABLE FOR SELECTED DATES
              <X size={17} />
            </button>
          )}

          {notice && (
            <p
              className="yr2-message"
              role="status"
            >
              {notice}
            </p>
          )}

          <p className="yr2-booking-disclosure">
            <ShieldCheck size={17} />

            {DEMO_NOTICES.booking}{" "}
            {DEMO_NOTICES.payment}
          </p>
        </aside>
      </div>

      {/* SECOND EDITORIAL PHOTO CHAPTER */}

      <section className="yr2-detail-editorial">
        <div className="yr2-detail-editorial-image">
          <img
            src={images[1] || PHOTOS.terrace}
            alt={`Illustrative perspective inside ${stay.name}`}
            loading="lazy"
          />

          <span>
            IMAGE STUDY / THE QUIETER SIDE
          </span>
        </div>

        <div className="yr2-detail-editorial-copy">
          <CoastalContours pale />

          <Reveal>
            <span className="yr2-eyebrow">
              ARCHITECTURE / NOT JUST A PLACE
            </span>

            <h2>
              The feeling
              <br />
              stays <em>longer.</em>
            </h2>

            <p>
              Rest is designed into the details:
              the changing light, the open horizon,
              the unhurried transitions from
              one space to another.
            </p>

            <Link to="/packages">
              DISCOVER CURATED ESCAPES
              <ArrowUpRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* MORE VILLAS */}

      <section className="yr2-related yr2-shell">
        <Reveal className="yr2-related-heading">
          <span className="yr2-eyebrow">
            05 / ELSEWHERE IN THE COLLECTION
          </span>

          <h2>
            A different kind of <em>quiet.</em>
          </h2>

          <Link to="/stays">
            VIEW THE COMPLETE INDEX
            <ArrowUpRight size={17} />
          </Link>
        </Reveal>

        <div className="yr2-related-grid">
          {related.map((item, i) => (
            <Link
              to={`/stays/${item.id}`}
              key={item.id}
            >
              <div>
                <img
                  src={item.images[0]}
                  alt={`Illustrative ${item.name}`}
                  loading="lazy"
                />

                <span>
                  ANOTHER RESIDENCE / {two(i + 1)}
                </span>
              </div>

              <section>
                <h3>{item.name}</h3>

                <p>
                  {getZone(item.zoneId)?.label}
                  {" / FROM "}
                  {formatPeso(item.nightlyRate)}
                  {" NIGHTLY"}
                </p>

                <ArrowUpRight size={21} />
              </section>
            </Link>
          ))}
        </div>
      </section>

      {/* FULLSCREEN IMAGE VIEWER */}

      {lightbox && (
        <GalleryViewer
          key={stay.id}
          stay={stay}
          start={imageIndex}
          onClose={() =>
            setLightbox(false)
          }
        />
      )}
    </div>
  );
}