import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  ADD_ONS,
  PHOTOS,
  formatPeso,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

const PACKAGES = [
  {
    id: "lagoon-escape",
    number: "01",
    category: "couples",
    label: "THE SIGNATURE ESCAPE",
    name: "The Lagoon Escape",
    subtitle: "Private waters. Unhurried moments.",
    description:
      "A carefully imagined retreat with peaceful mornings, a private-pool setting and time to reconnect.",
    stayId: "lagoon-villa",
    nights: 2,
    guests: 2,
    addons: ["floating-breakfast"],
    image: PHOTOS.pool,
    inclusions: [
      "Two-night villa stay",
      "Private-pool accommodation",
      "Floating breakfast add-on",
      "Access to listed villa amenities",
    ],
  },
  {
    id: "family",
    number: "02",
    category: "family",
    label: "TOGETHER IS A DESTINATION",
    name: "The Family Gathering",
    subtitle: "More time with your favorite people.",
    description:
      "An intimate tropical setting designed for family conversations, poolside afternoons and celebrations.",
    stayId: "palm-garden-villa",
    nights: 2,
    guests: 4,
    addons: ["celebration"],
    image: PHOTOS.villas,
    inclusions: [
      "Two-night villa stay",
      "Accommodation for four guests",
      "Celebration styling add-on",
      "Private villa amenities",
    ],
  },
  {
    id: "coastal-reset",
    number: "03",
    category: "couples",
    label: "JUST THE TWO OF YOU",
    name: "The Coastal Reset",
    subtitle: "A quieter kind of beautiful.",
    description:
      "An understated suite escape for slow mornings, coastal inspiration and effortless comfort.",
    stayId: "sea-glass-suite",
    nights: 2,
    guests: 2,
    addons: [],
    image: PHOTOS.suite,
    inclusions: [
      "Two-night coastal suite stay",
      "Accommodation for two guests",
      "Access to listed suite amenities",
      "Flexible demo date selection",
    ],
  },
  {
    id: "nature-retreat",
    number: "04",
    category: "nature",
    label: "FIND YOUR STILLNESS",
    name: "The Nature Hideaway",
    subtitle: "Step away from the everyday.",
    description:
      "A secluded escape inspired by greener landscapes, fresh air and a more intentional pace.",
    stayId: "ridge-hideaway",
    nights: 3,
    guests: 2,
    addons: [],
    image: PHOTOS.terrace,
    inclusions: [
      "Three-night nature-inspired stay",
      "Accommodation for two guests",
      "Access to listed cabin amenities",
      "A sample slow-living itinerary",
    ],
  },
];

const FILTERS = [
  { id: "all", label: "All escapes" },
  { id: "couples", label: "For two" },
  { id: "family", label: "Family & friends" },
  { id: "nature", label: "Nature retreats" },
];

function dateAfter(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function addDays(value, count) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + count);
  return localDateKey(date);
}

export default function PackagesPage() {
  const navigate = useNavigate();

  const {
    accommodations,
    getQuote,
  } = useResort();

  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(PACKAGES[0].id);
  const [checkIn, setCheckIn] = useState(dateAfter(3));
  const [guests, setGuests] = useState(PACKAGES[0].guests);

  const selected =
    PACKAGES.find((item) => item.id === selectedId) ||
    PACKAGES[0];

  const stay = accommodations.find(
    (item) => item.id === selected.stayId
  );

  const checkOut = useMemo(
    () => checkIn ? addDays(checkIn, selected.nights) : "",
    [checkIn, selected.nights]
  );

  const validGuests = Math.min(
    Math.max(1, guests),
    stay?.maxGuests || 1
  );

  const quote = stay
    ? getQuote({
        accommodationId: stay.id,
        checkIn,
        checkOut,
        guests: validGuests,
        addOnIds: selected.addons,
      })
    : {
        ok: false,
        error: "Accommodation is unavailable in the catalog.",
      };

  const visible = PACKAGES.filter(
    (item) => filter === "all" || item.category === filter
  );

  function selectPackage(item) {
    setSelectedId(item.id);
    setGuests(item.guests);

    document.getElementById("ys4-package-builder")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  function continueBooking() {
    if (!quote.ok || !stay) return;

    const params = new URLSearchParams({
      stay: stay.id,
      checkIn,
      checkOut,
      guests: String(validGuests),
      addOns: selected.addons.join(","),
    });

    navigate(`/booking?${params.toString()}`);
  }

  return (
    <div className="ys4-page">
      <section className="ys4-hero ys4-hero--packages">
        <img
          src={PHOTOS.hero}
          alt="Illustrative tropical resort and swimming pool"
        />

        <div className="ys4-hero__shade" />

        <div className="ys4-container ys4-hero__content">
          <span className="ys4-eyebrow ys4-eyebrow--light">
            YOUR STAY / CURATED ESCAPES
          </span>

          <h1>
            More than<br />
            a place to <em>stay.</em>
          </h1>

          <p>
            Thoughtfully paired accommodations and experiences.
            Find a little more of what makes your getaway yours.
          </p>

          <a className="ys4-button ys4-button--light" href="#ys4-packages">
            Explore the packages <ArrowRight size={17} />
          </a>
        </div>

        <div className="ys4-hero__index">
          THE COLLECTION — 01 / 04
        </div>
      </section>

      <section
        className="ys4-section ys4-container"
        id="ys4-packages"
      >
        <div className="ys4-section-heading">
          <div>
            <span className="ys4-eyebrow">
              DESIGNED AROUND YOUR MOMENTS
            </span>

            <h2 className="ys4-title">
              The escape <em>collection.</em>
            </h2>
          </div>

          <p>
            Every stay is different. Find the setting,
            atmosphere and rhythm that feels right for you.
          </p>
        </div>

        <div
          className="ys4-filters"
          role="group"
          aria-label="Filter packages"
        >
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? "is-active" : ""}
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ys4-package-grid">
          {visible.map((item) => {
            const accommodation = accommodations.find(
              (stayItem) => stayItem.id === item.stayId
            );

            const isSelected = selectedId === item.id;

            return (
              <article
                key={item.id}
                className={`ys4-package-card ${
                  isSelected ? "is-selected" : ""
                }`}
              >
                <div className="ys4-package-card__image">
                  <img
                    src={item.image}
                    alt={`Illustrative ${item.name} resort package`}
                    loading="lazy"
                  />

                  <span>{item.number} / YOUR STAY</span>
                </div>

                <div className="ys4-package-card__body">
                  <span className="ys4-eyebrow">{item.label}</span>
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>

                  <div className="ys4-package-meta">
                    <span>
                      <CalendarDays size={15} />
                      {item.nights} nights
                    </span>

                    <span>
                      <Users size={15} />
                      {item.guests} guests
                    </span>
                  </div>

                  <div className="ys4-card-divider" />

                  <div className="ys4-package-card__bottom">
                    <span>
                      <small>Accommodation rate from</small>
                      <strong>
                        {formatPeso(
                          (accommodation?.nightlyRate || 0) *
                          item.nights
                        )}
                      </strong>
                      <small>Excludes selected add-ons</small>
                    </span>

                    <button
                      type="button"
                      onClick={() => selectPackage(item)}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? "Selected" : "Explore"}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <p className="ys4-fineprint">
          Package descriptions and photographs are illustrative.
          Exact demo totals are calculated below using the
          current booking engine.
        </p>
      </section>

      <section
        className="ys4-package-builder"
        id="ys4-package-builder"
      >
        <div className="ys4-container ys4-builder-grid">
          <div className="ys4-builder-copy">
            <span className="ys4-eyebrow ys4-eyebrow--light">
              MAKE YOUR ESCAPE YOURS
            </span>

            <h2 className="ys4-title">
              All the little<br />
              <em>details matter.</em>
            </h2>

            <p>
              Preview your dates, guests and inclusions
              before continuing to your demo reservation.
            </p>

            <div className="ys4-builder-photo">
              <img
                src={selected.image}
                alt={`Illustrative ${selected.name}`}
              />

              <span>
                <Sparkles size={17} />
                YOUR STAY SIGNATURE COLLECTION
              </span>
            </div>
          </div>

          <div className="ys4-builder-panel">
            <span className="ys4-eyebrow">YOUR SELECTED PACKAGE</span>
            <h3>{selected.name}</h3>
            <p>{selected.subtitle}</p>

            <div className="ys4-inclusions">
              {selected.inclusions.map((item) => (
                <div key={item}>
                  <Check size={17} />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="ys4-card-divider" />

            <div className="ys4-form-row">
              <label className="ys4-field">
                <span>CHECK-IN DATE</span>
                <input
                  type="date"
                  min={dateAfter(0)}
                  value={checkIn}
                  onChange={(event) =>
                    setCheckIn(event.target.value)
                  }
                />
              </label>

              <label className="ys4-field">
                <span>CHECK-OUT</span>
                <input
                  type="date"
                  value={checkOut}
                  readOnly
                />
              </label>
            </div>

            <label className="ys4-field">
              <span>NUMBER OF GUESTS</span>

              <select
                value={validGuests}
                onChange={(event) =>
                  setGuests(Number(event.target.value))
                }
              >
                {Array.from(
                  { length: stay?.maxGuests || 1 },
                  (_, index) => index + 1
                ).map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </label>

            <div className="ys4-summary">
              {quote.ok ? (
                <>
                  <div>
                    <span>Accommodation</span>
                    <strong>
                      {formatPeso(quote.nightlySubtotal)}
                    </strong>
                  </div>

                  {quote.extraGuestTotal > 0 && (
                    <div>
                      <span>Additional guests</span>
                      <strong>
                        {formatPeso(quote.extraGuestTotal)}
                      </strong>
                    </div>
                  )}

                  {quote.addOnTotal > 0 && (
                    <div>
                      <span>Included package add-ons</span>
                      <strong>
                        {formatPeso(quote.addOnTotal)}
                      </strong>
                    </div>
                  )}

                  <div className="ys4-summary__total">
                    <span>Estimated package total</span>
                    <strong>{formatPeso(quote.total)}</strong>
                  </div>
                </>
              ) : (
                <p className="ys4-error" role="status">
                  {quote.error}
                </p>
              )}
            </div>

            <button
              type="button"
              className="ys4-button ys4-button--full"
              disabled={!quote.ok}
              onClick={continueBooking}
            >
              Continue to booking <ArrowRight size={18} />
            </button>

            <div className="ys4-demo-notice">
              <ShieldCheck size={17} />
              Concept booking only. No payment or actual resort
              reservation is made.
            </div>
          </div>
        </div>
      </section>

      <section className="ys4-container ys4-section ys4-ending">
        <span className="ys4-eyebrow">EXPLORE A LITTLE MORE</span>

        <h2 className="ys4-title">
          A beautiful stay begins <em>somewhere.</em>
        </h2>

        <p>
          Prefer to create your own escape?
          Explore our full collection of villas and suites.
        </p>

        <Link className="ys4-button" to="/stays">
          Discover all stays <ArrowUpRight size={18} />
        </Link>
      </section>
    </div>
  );
}