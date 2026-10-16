import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  ADD_ONS,
  DEMO_NOTICES,
  PHOTOS,
  formatPeso,
  getZone,
} from "../../data/config.js";

import { useResort } from "../../context/ResortContext.jsx";

import {
  JOURNEY_PACKAGES,
  dateAfter,
  addDays,
  bookingHref,
} from "../../data/stayJourneys.js";

import {
  CoastalContours,
  Reveal,
  TideCompass,
} from "../../components/StayMotion.jsx";

import "../../styles/stay-booking-architectural.css";

const TABS = [
  {
    id: "all",
    label: "THE ENTIRE EDITION",
  },
  {
    id: "romance",
    label: "FOR TWO",
  },
  {
    id: "together",
    label: "TOGETHER",
  },
  {
    id: "nature",
    label: "THE QUIET SIDE",
  },
];

export default function PackagesPage() {
  const navigate = useNavigate();

  const { accommodations, getQuote } = useResort();

  const [filter, setFilter] = useState("all");

  const [activeId, setActiveId] = useState(
    JOURNEY_PACKAGES[0].id
  );

  const [arrival, setArrival] = useState(
    () => dateAfter(3)
  );

  const [people, setPeople] = useState(
    JOURNEY_PACKAGES[0].guests
  );

  const [extraIds, setExtraIds] = useState([]);

  const active =
    JOURNEY_PACKAGES.find(
      (item) => item.id === activeId
    ) || JOURNEY_PACKAGES[0];

  const stay = accommodations.find(
    (s) => s.id === active.stayId
  );

  const guests = Math.min(
    Math.max(people, 1),
    stay?.maxGuests || 1
  );

  const departure = useMemo(
    () => addDays(arrival, active.nights),
    [arrival, active.nights]
  );

  const included = active.addOnIds;

  const selectedIds = [
    ...included,
    ...extraIds.filter(
      (id) => !included.includes(id)
    ),
  ];

  const quote = stay
    ? getQuote({
        accommodationId: stay.id,
        checkIn: arrival,
        checkOut: departure,
        guests,
        addOnIds: selectedIds,
      })
    : {
        ok: false,
        error: "Residence not found.",
      };

  const visible = JOURNEY_PACKAGES.filter(
    (p) =>
      filter === "all" ||
      p.category === filter
  );

  useEffect(() => {
    document.title = "The Escape Editions | YOUR STAY.";

    return () => {
      document.title = "YOUR STAY.";
    };
  }, []);

  function selectPackage(item) {
    setActiveId(item.id);
    setPeople(item.guests);
    setExtraIds([]);

    document
      .getElementById("ar3-package-composer")
      ?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  }

  function toggleExtra(id) {
    setExtraIds((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]
    );
  }

  function continueBooking() {
    if (!quote.ok || !stay) return;

    navigate(
      bookingHref({
        stayId: stay.id,
        checkIn: arrival,
        checkOut: departure,
        guests,
        addOnIds: selectedIds,
        packageId: active.id,
      })
    );
  }

  return (
    <div className="ar3 ar3-packages">
      {/* EDITORIAL COVER */}

      <section className="ar3-edition-hero">
        <div className="ar3-edition-hero__image">
          <img
            src={PHOTOS.terrace}
            alt="Illustrative warm tropical resort terrace"
          />

          <div className="ar3-edition-hero__vertical">
            THE UNHURRIED ATLAS — EDITION 04
          </div>
        </div>

        <div className="ar3-edition-hero__copy">
          <span className="ar3-overline">
            VOL. 04 / CURATED TRAVEL EXPERIENCES
          </span>

          <div
            className="ar3-edition-hero__star"
            aria-hidden="true"
          >
            ✳
          </div>

          <h1>
            Little journeys, <em>beautifully</em> considered.
          </h1>

          <p>
            Not just accommodation. A collection of
            imagined moments, thoughtfully paired into
            escapes worth making time for.
          </p>

          <a
            href="#ar3-editions"
            className="ar3-underlined"
          >
            EXPLORE THE FOUR EDITIONS
            <ArrowDownRight size={19} />
          </a>

          <div className="ar3-edition-hero__counter">
            <b>04</b>
            <span>
              ESCAPES / ONE WAY TO SLOW DOWN
            </span>
          </div>
        </div>
      </section>

      {/* THE EDITION INDEX */}

      <section
        className="ar3-edition-intro ar3-container"
        id="ar3-editions"
      >
        <Reveal>
          <span className="ar3-overline">
            01 / THE CURATOR'S SELECTION
          </span>

          <h2>
            Collect moments, <em>not miles.</em>
          </h2>
        </Reveal>

        <p>
          Each composition pairs a real demo-engine
          accommodation with selected extras.
          The quote always uses standard rates:
          there are no invented package discounts.
        </p>
      </section>

      <div
        className="ar3-package-tabs ar3-container"
        role="group"
        aria-label="Filter curated escapes"
      >
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            aria-pressed={filter === tab.id}
            className={
              filter === tab.id
                ? "is-current"
                : ""
            }
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            <span>↗</span>
          </button>
        ))}
      </div>

      {/* ALTERNATING ARCHITECTURAL EDITIONS */}

      <section
        className="ar3-edition-list ar3-container"
        aria-label="Curated escape editions"
      >
        {visible.map((item, idx) => {
          const residence = accommodations.find(
            (s) => s.id === item.stayId
          );

          const entryQuote = residence
            ? getQuote({
                accommodationId: residence.id,
                checkIn: arrival,
                checkOut: addDays(
                  arrival,
                  item.nights
                ),
                guests: item.guests,
                addOnIds: item.addOnIds,
              })
            : null;

          return (
            <Reveal
              as="article"
              className={`ar3-edition-row ar3-edition-row--${idx % 2}`}
              key={item.id}
              delay={(idx % 2) * 100}
            >
              <div className="ar3-edition-row__media">
                <img
                  src={item.image}
                  alt={`Illustrative ${item.title} retreat`}
                  loading="lazy"
                />

                <span>
                  THE ESCAPE EDITION / {item.number}
                </span>

                <i aria-hidden="true" />
              </div>

              <div className="ar3-edition-row__body">
                <span className="ar3-overline">
                  {item.kicker}
                  {" / "}
                  {residence?.category.toUpperCase()}
                </span>

                <h3>{item.title}</h3>

                <p className="ar3-edition-row__subtitle">
                  {item.subtitle}
                </p>

                <p>{item.note}</p>

                <div className="ar3-edition-row__facts">
                  <span>
                    <CalendarDays size={15} />
                    {item.nights} NIGHTS
                  </span>

                  <span>
                    <Users size={15} />
                    {item.guests} GUESTS
                  </span>

                  <span>
                    <MapPin size={15} />
                    {getZone(
                      residence?.zoneId
                    )?.label}
                  </span>
                </div>

                <div className="ar3-edition-row__rate">
                  <div>
                    <small>
                      STANDARD DEMO QUOTE /
                      SELECTED DATES
                    </small>

                    <strong>
                      {entryQuote?.ok
                        ? formatPeso(entryQuote.total)
                        : "CHECK DATES"}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      selectPackage(item)
                    }
                  >
                    PERSONALIZE EDITION
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* INTERACTIVE ESCAPE COMPOSER */}

      <section
        className="ar3-composer"
        id="ar3-package-composer"
      >
        <CoastalContours pale />

        <div className="ar3-container ar3-composer__grid">
          <div className="ar3-composer__art">
            <span className="ar3-overline">
              02 / THE ESCAPE COMPOSER
            </span>

            <h2>
              The details make it <em>yours.</em>
            </h2>

            <p>
              Set a date, bring your favorite people
              and shape the rest of the journey around
              your chosen edition.
            </p>

            <div
              className="ar3-composer__photo"
              key={active.id}
            >
              <img
                src={active.image}
                alt={`Illustrative ${active.title} experience`}
              />

              <span>
                EDITION {active.number} /
                {active.kicker}
              </span>
            </div>

            <TideCompass />
          </div>

          <div className="ar3-composer__panel">
            <div className="ar3-composer__topline">
              <span>
                CURATED STAY / {active.number}
              </span>

              <Compass size={23} />
            </div>

            <h3>{active.title}</h3>

            <p className="ar3-composer__subtitle">
              {active.subtitle}
            </p>

            <div className="ar3-inclusion-list">
              {active.inclusions.map((text, i) => (
                <div key={text}>
                  <span>0{i + 1}</span>
                  <strong>{text}</strong>
                  <Check size={16} />
                </div>
              ))}
            </div>

            {/* LIVE PACKAGE DATE CONTROLS */}

            <div className="ar3-composer__inputs">
              <label>
                YOUR ARRIVAL
                <input
                  type="date"
                  min={dateAfter(0)}
                  value={arrival}
                  onChange={(e) =>
                    setArrival(e.target.value)
                  }
                />
              </label>

              <label>
                DEPARTURE / FIXED EDITION
                <input
                  type="date"
                  readOnly
                  value={departure}
                />
              </label>

              <label className="full">
                THE PEOPLE

                <select
                  value={guests}
                  onChange={(e) =>
                    setPeople(
                      Number(e.target.value)
                    )
                  }
                >
                  {Array.from(
                    {
                      length:
                        stay?.maxGuests || 1,
                    },
                    (_, i) => i + 1
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}{" "}
                      {n === 1
                        ? "guest"
                        : "guests"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* OPTIONAL EXPERIENCES */}

            <div className="ar3-composer__extras">
              <span className="ar3-overline">
                ANOTHER LITTLE THING?
              </span>

              {ADD_ONS.filter(
                (a) =>
                  !included.includes(a.id)
              ).map((addon) => (
                <label key={addon.id}>
                  <input
                    type="checkbox"
                    checked={extraIds.includes(
                      addon.id
                    )}
                    onChange={() =>
                      toggleExtra(addon.id)
                    }
                  />

                  <span>
                    <b>{addon.name}</b>
                    <small>
                      {addon.description}
                    </small>
                  </span>

                  <strong>
                    {addon.price
                      ? `+${formatPeso(
                          addon.price
                        )}`
                      : "REQUEST"}
                  </strong>
                </label>
              ))}
            </div>

            {/* ACTUAL ENGINE QUOTE */}

            {quote.ok ? (
              <div className="ar3-composer__total">
                <div>
                  <span>
                    VILLA / {quote.nights} NIGHTS
                  </span>

                  <strong>
                    {formatPeso(
                      quote.nightlySubtotal
                    )}
                  </strong>
                </div>

                {quote.extraGuestTotal > 0 && (
                  <div>
                    <span>ADDITIONAL GUESTS</span>

                    <strong>
                      {formatPeso(
                        quote.extraGuestTotal
                      )}
                    </strong>
                  </div>
                )}

                {quote.addOnTotal > 0 && (
                  <div>
                    <span>CURATED EXPERIENCES</span>

                    <strong>
                      {formatPeso(
                        quote.addOnTotal
                      )}
                    </strong>
                  </div>
                )}

                <div>
                  <span>
                    TOTAL / DEMO ESTIMATE
                  </span>

                  <strong>
                    {formatPeso(quote.total)}
                  </strong>
                </div>
              </div>
            ) : (
              <p
                className="ar3-error"
                role="status"
              >
                {quote.error}
              </p>
            )}

            <button
              className="ar3-main-action"
              type="button"
              onClick={continueBooking}
              disabled={!quote.ok}
            >
              COMPOSE MY RESERVATION
              <ArrowUpRight size={19} />
            </button>

            <p className="ar3-disclosure">
              <ShieldCheck size={16} />
              {DEMO_NOTICES.booking}{" "}
              {DEMO_NOTICES.payment}
            </p>
          </div>
        </div>
      </section>

      {/* OUTRO */}

      <section className="ar3-packages-finale">
        <div className="ar3-packages-finale__image">
          <img
            src={PHOTOS.escape}
            alt="Illustrative resort architecture and greenery"
            loading="lazy"
          />
        </div>

        <div>
          <span className="ar3-overline">
            THE STAY IS ONLY THE BEGINNING
          </span>

          <h2>
            A place for <em>the unscheduled.</em>
          </h2>

          <Link to="/stays">
            EXPLORE INDIVIDUAL RESIDENCES
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}