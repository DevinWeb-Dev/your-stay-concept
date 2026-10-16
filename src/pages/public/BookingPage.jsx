import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  Waves,
} from "lucide-react";

import {
  ADD_ONS,
  DEMO_NOTICES,
  PHOTOS,
  RESORT_POLICIES,
  formatPeso,
  getZone,
} from "../../data/config.js";

import { useResort } from "../../context/ResortContext.jsx";

import {
  JOURNEY_PACKAGES,
  JOURNEY_OFFERS,
  dateAfter,
  addDays,
  prettyDay,
  offerPreview,
} from "../../data/stayJourneys.js";

import {
  CoastalContours,
  Reveal,
  TideCompass,
} from "../../components/StayMotion.jsx";

import "../../styles/stay-booking-architectural.css";

const validExtras = (ids) =>
  [...new Set(ids)].filter((id) =>
    ADD_ONS.some((a) => a.id === id)
  );

function Readout({ label, value }) {
  return (
    <div className="ar3-readout">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function BookingPage() {
  const [params] = useSearchParams();

  const {
    accommodations,
    reservations,
    actions,
    getQuote,
  } = useResort();

  const ready = useRef(null);

  const requestedPackage = JOURNEY_PACKAGES.find(
    (p) => p.id === params.get("package")
  );

  const requestedOffer = JOURNEY_OFFERS.find(
    (o) => o.id === params.get("offer")
  );

  const requestedStay = params.get("stay");

  const [stayId, setStayId] = useState(() =>
    accommodations.some((s) => s.id === requestedStay)
      ? requestedStay
      : accommodations[0]?.id || ""
  );

  const [checkIn, setCheckIn] = useState(
    () => params.get("checkIn") || dateAfter(3)
  );

  const [checkOut, setCheckOut] = useState(
    () => params.get("checkOut") || dateAfter(5)
  );

  const [guests, setGuests] = useState(
    () =>
      Number(params.get("guests")) ||
      requestedPackage?.guests ||
      2
  );

  const [addOnIds, setAddOnIds] = useState(() =>
    validExtras(
      params.has("addOns")
        ? (params.get("addOns") || "").split(",")
        : requestedPackage?.addOnIds || []
    )
  );

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copyLabel, setCopyLabel] = useState("COPY REFERENCE");

  const stay = accommodations.find((s) => s.id === stayId);

  const actualGuests = Math.min(
    Math.max(Number(guests) || 1, 1),
    stay?.maxGuests || 1
  );

  const quote = stay
    ? getQuote({
        accommodationId: stay.id,
        checkIn,
        checkOut,
        guests: actualGuests,
        addOnIds,
      })
    : {
        ok: false,
        error: "Select a residence.",
      };

  const contextPackage =
    requestedPackage?.stayId === stayId
      ? requestedPackage
      : null;

  const contextOffer =
    requestedOffer?.stayId === stayId
      ? requestedOffer
      : null;

  const offer = offerPreview(contextOffer, quote);

  const history = useMemo(
    () => [...reservations].reverse().slice(0, 6),
    [reservations]
  );

  useEffect(() => {
    document.title = "The Reservation Atelier | YOUR STAY.";

    return () => {
      document.title = "YOUR STAY.";
    };
  }, []);

  useEffect(() => {
    if (result) {
      ready.current?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "center",
      });
    }
  }, [result]);

  const clearFeedback = () => {
    setError("");
    setResult(null);
  };

  function changeArrival(value) {
    clearFeedback();
    setCheckIn(value);

    if (value && checkOut <= value) {
      setCheckOut(addDays(value, 1));
    }
  }

  function chooseStay(id) {
    const next = accommodations.find((s) => s.id === id);
    if (!next) return;

    clearFeedback();
    setStayId(id);
    setGuests((g) => Math.min(g, next.maxGuests));
  }

  function toggleExtra(id) {
    clearFeedback();

    setAddOnIds((old) =>
      old.includes(id)
        ? old.filter((x) => x !== id)
        : [...old, id]
    );
  }

  function save(event) {
    event.preventDefault();
    clearFeedback();

    if (!quote.ok) {
      setError(quote.error);
      return;
    }

    if (!accepted) {
      setError(
        "Please acknowledge the local demo conditions."
      );
      return;
    }

    const response = actions.reserveStay({
      accommodationId: stay.id,
      checkIn,
      checkOut,
      guests: actualGuests,
      addOnIds,
      guestName: guestName.trim(),
      email: email.trim(),
    });

    if (!response.ok) {
      setError(
        response.error ||
          "The local demo could not save this reservation."
      );
      return;
    }

    setResult(response.booking);
  }

  function cancel(id) {
    if (
      !window.confirm(
        "Cancel this local demonstration reservation?"
      )
    ) {
      return;
    }

    const response = actions.cancelReservation(id);

    if (!response.ok) {
      setError(
        response.error ||
          "Unable to cancel the local record."
      );
    } else {
      setError("");
      setResult((old) => (old?.id === id ? null : old));
    }
  }

  async function copyReference() {
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.id);
      setCopyLabel("COPIED");
    } catch {
      setCopyLabel("SELECT & COPY THE REFERENCE");
    }
  }

  return (
    <div className="ar3 ar3-booking">
      {/* ARCHITECTURAL ARRIVAL */}

      <section
        className="ar3-book-cover"
        aria-labelledby="ar3-book-title"
      >
        <div className="ar3-book-cover__copy">
          <span className="ar3-overline">
            THE UNHURRIED ATLAS <i /> CHAPTER 03
          </span>

          <div
            className="ar3-book-cover__numbers"
            aria-hidden="true"
          >
            03 / RESERVATIONS
          </div>

          <h1 id="ar3-book-title">
            Your days, <em>beautifully</em> arranged.
          </h1>

          <p>
            The reservation atelier. Choose the
            residence, the moments and the people.
            We will compose your stay into one
            considered journey.
          </p>

          <a
            href="#ar3-reserve"
            className="ar3-underlined"
          >
            COMPOSE YOUR ITINERARY
            <ArrowDownRight size={19} />
          </a>

          <div className="ar3-book-cover__foot">
            <span>
              DESIGNED FOR THE SPACE BETWEEN PLACES
            </span>
            <span>YS — 03 / 06</span>
          </div>
        </div>

        <div className="ar3-book-cover__photo">
          <img
            src={stay?.images[0] || PHOTOS.hero}
            alt="Illustrative coastal resort villa architecture"
          />

          <CoastalContours pale />

          <div className="ar3-book-cover__seal">
            <TideCompass />
            <span>WHERE THE TIME GOES SLOWER</span>
          </div>

          <span className="ar3-photo-caption">
            A TRAVEL STUDY / YOUR STAY. 2026
          </span>
        </div>
      </section>

      {/* TRAVEL DOCUMENT STAGES */}

      <section
        className="ar3-journey-rail"
        aria-label="Reservation stages"
      >
        {[
          "THE RESIDENCE",
          "THE MOMENTS",
          "THE TRAVELER",
          "THE ITINERARY",
        ].map((name, i) => (
          <a key={name} href={`#ar3-step-${i + 1}`}>
            <span>0{i + 1}</span>
            {name}
            <ArrowUpRight size={13} />
          </a>
        ))}
      </section>

      <section
        className="ar3-reservation-layout ar3-container"
        id="ar3-reserve"
      >
        <div className="ar3-reservation-form-column">
          <Reveal className="ar3-section-heading">
            <span className="ar3-overline">
              01 — YOUR RESERVATION JOURNAL
            </span>

            <h2>
              Every great stay begins with{" "}
              <em>a little intention.</em>
            </h2>

            <p>
              Dates and pricing are calculated from the
              original local resort engine. No live
              property is connected.
            </p>
          </Reveal>

          {contextPackage && (
            <div className="ar3-context">
              <Sparkles size={18} />
              <span>
                <b>{contextPackage.title}</b> /
                Curated package selections carried
                into your quote.
              </span>
            </div>
          )}

          {contextOffer && (
            <div className="ar3-context ar3-context--offer">
              <Ticket size={18} />
              <span>
                <b>{contextOffer.title}</b> /
                Sample promotional preview only.
                No discount is redeemed.
              </span>
            </div>
          )}

          <form onSubmit={save} className="ar3-form">
            {/* RESIDENCE SELECTOR */}

            <section
              className="ar3-chapter"
              id="ar3-step-1"
            >
              <header>
                <span>01 / THE PLACE</span>
                <h3>
                  Choose your <em>horizon.</em>
                </h3>
              </header>

              <div
                className="ar3-residence-picker"
                role="group"
                aria-label="Choose residence"
              >
                {accommodations.map((item, i) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => chooseStay(item.id)}
                    aria-pressed={stayId === item.id}
                    className={
                      stayId === item.id
                        ? "is-current"
                        : ""
                    }
                  >
                    <img
                      src={item.images[0]}
                      alt=""
                      loading="lazy"
                    />

                    <span>
                      <small>RESIDENCE / 0{i + 1}</small>
                      <strong>{item.name}</strong>
                      <small>
                        {formatPeso(item.nightlyRate)} / NIGHT
                      </small>
                    </span>

                    <span className="ar3-residence-picker__check">
                      {stayId === item.id ? (
                        <Check size={17} />
                      ) : (
                        <Plus size={17} />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="ar3-date-bar">
                <label>
                  <span>
                    <CalendarDays size={15} />
                    ARRIVAL
                  </span>

                  <input
                    type="date"
                    min={dateAfter(0)}
                    required
                    value={checkIn}
                    onChange={(e) =>
                      changeArrival(e.target.value)
                    }
                  />
                </label>

                <label>
                  <span>
                    <CalendarDays size={15} />
                    DEPARTURE
                  </span>

                  <input
                    type="date"
                    min={
                      checkIn
                        ? addDays(checkIn, 1)
                        : dateAfter(1)
                    }
                    required
                    value={checkOut}
                    onChange={(e) => {
                      clearFeedback();
                      setCheckOut(e.target.value);
                    }}
                  />
                </label>

                <div className="ar3-guests">
                  <span>
                    <Users size={15} />
                    TRAVELERS
                  </span>

                  <div>
                    <button
                      type="button"
                      aria-label="One fewer guest"
                      disabled={actualGuests <= 1}
                      onClick={() => {
                        clearFeedback();
                        setGuests((g) =>
                          Math.max(1, g - 1)
                        );
                      }}
                    >
                      <Minus size={16} />
                    </button>

                    <strong>
                      {actualGuests}{" "}
                      {actualGuests === 1
                        ? "GUEST"
                        : "GUESTS"}
                    </strong>

                    <button
                      type="button"
                      aria-label="One more guest"
                      disabled={
                        actualGuests >=
                        (stay?.maxGuests || 1)
                      }
                      onClick={() => {
                        clearFeedback();
                        setGuests((g) =>
                          Math.min(
                            stay.maxGuests,
                            g + 1
                          )
                        );
                      }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="ar3-policy-strip">
                <Clock3 size={17} />
                <span>
                  ARRIVAL {RESORT_POLICIES.checkInTime}
                  {" / "}
                  DEPARTURE {RESORT_POLICIES.checkOutTime}
                  {" / "}
                  MAX {RESORT_POLICIES.maximumNights} NIGHTS
                </span>
              </div>
            </section>

            {/* OPTIONAL EXPERIENCES */}

            <section
              className="ar3-chapter"
              id="ar3-step-2"
            >
              <header>
                <span>02 / PERSONAL TOUCHES</span>

                <h3>
                  The things <em>you'll remember.</em>
                </h3>

                <p>
                  Add-ons are charged once per reservation,
                  as defined by the demonstration engine.
                </p>
              </header>

              <div className="ar3-experience-choices">
                {ADD_ONS.map((addon, index) => (
                  <label
                    key={addon.id}
                    className={
                      addOnIds.includes(addon.id)
                        ? "is-selected"
                        : ""
                    }
                  >
                    <input
                      type="checkbox"
                      checked={addOnIds.includes(addon.id)}
                      onChange={() =>
                        toggleExtra(addon.id)
                      }
                    />

                    <span className="ar3-experience-choices__number">
                      0{index + 1}
                    </span>

                    <span className="ar3-experience-choices__copy">
                      <strong>{addon.name}</strong>
                      <small>{addon.description}</small>
                    </span>

                    <span className="ar3-experience-choices__rate">
                      {addon.price
                        ? `+${formatPeso(addon.price)}`
                        : "REQUEST ONLY"}
                    </span>

                    <span className="ar3-choice-mark">
                      {addOnIds.includes(addon.id) ? (
                        <Check size={17} />
                      ) : (
                        <Plus size={17} />
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* TRAVELER DETAILS */}

            <section
              className="ar3-chapter"
              id="ar3-step-3"
            >
              <header>
                <span>03 / THE TRAVELER</span>

                <h3>
                  A name for <em>your postcard.</em>
                </h3>

                <p>
                  For privacy, please use fictional
                  sample details. The demo saves the name
                  and email in this browser only.
                </p>
              </header>

              <div className="ar3-traveler-fields">
                <label>
                  GUEST NAME
                  <input
                    required
                    minLength={2}
                    maxLength={80}
                    autoComplete="off"
                    value={guestName}
                    placeholder="Sample Traveler"
                    onChange={(e) =>
                      setGuestName(e.target.value)
                    }
                  />
                </label>

                <label>
                  SAMPLE EMAIL
                  <input
                    required
                    type="email"
                    autoComplete="off"
                    value={email}
                    placeholder="sample@example.com"
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />
                </label>
              </div>

              <label className="ar3-acknowledgment">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={(e) =>
                    setAccepted(e.target.checked)
                  }
                />

                <span>
                  I understand this is a local
                  portfolio simulation: no actual
                  villa is booked, no email is sent
                  and no payment is processed.
                </span>
              </label>

              {error && (
                <p className="ar3-error" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="ar3-main-action"
                disabled={!quote.ok || !accepted}
              >
                SAVE DEMONSTRATION RESERVATION
                <ArrowUpRight size={19} />
              </button>

              <p className="ar3-disclosure">
                <ShieldCheck size={16} />
                {DEMO_NOTICES.booking}{" "}
                {DEMO_NOTICES.payment}
              </p>
            </section>
          </form>
        </div>

        {/* STICKY RESERVATION TRAVEL DOCUMENT */}

        <aside
          className="ar3-itinerary"
          id="ar3-step-4"
          aria-label="Live itinerary and reservation total"
        >
          <div className="ar3-itinerary__image">
            <img
              src={stay?.images[0] || PHOTOS.hero}
              alt={`Illustrative ${
                stay?.name || "resort villa"
              }`}
            />

            <span>
              YOUR STAY / PERSONAL ITINERARY
            </span>
          </div>

          <div className="ar3-itinerary__content">
            <div className="ar3-ticket-head">
              <span>
                THE TRAVEL DOCUMENT / NO. 03
              </span>
              <Waves size={24} />
            </div>

            <h2>
              Your <em>elsewhere.</em>
            </h2>

            <h3>{stay?.name}</h3>

            <div className="ar3-route">
              <div>
                <span>ARRIVE</span>
                <strong>{prettyDay(checkIn)}</strong>
              </div>

              <span className="ar3-route__line">
                <i />
              </span>

              <div>
                <span>DEPART</span>
                <strong>{prettyDay(checkOut)}</strong>
              </div>
            </div>

            <div className="ar3-itinerary__facts">
              <Readout
                label="LANDSCAPE"
                value={
                  getZone(stay?.zoneId)?.label || "—"
                }
              />

              <Readout
                label="TRAVELERS"
                value={`${actualGuests} GUEST${
                  actualGuests === 1 ? "" : "S"
                }`}
              />

              <Readout
                label="EXTRAS"
                value={`${addOnIds.length} SELECTED`}
              />
            </div>

            {quote.ok ? (
              <div className="ar3-itemized">
                <Readout
                  label={`${quote.nights} NIGHTS / VILLA`}
                  value={formatPeso(
                    quote.nightlySubtotal
                  )}
                />

                {quote.extraGuestTotal > 0 && (
                  <Readout
                    label="ADDITIONAL GUESTS"
                    value={formatPeso(
                      quote.extraGuestTotal
                    )}
                  />
                )}

                {quote.addOnTotal > 0 && (
                  <Readout
                    label="PERSONAL TOUCHES"
                    value={formatPeso(
                      quote.addOnTotal
                    )}
                  />
                )}

                <div className="ar3-itinerary__total">
                  <span>STANDARD DEMO TOTAL</span>
                  <strong>
                    {formatPeso(quote.total)}
                  </strong>
                </div>
              </div>
            ) : (
              <div
                className="ar3-error"
                role="status"
              >
                {quote.error}
              </div>
            )}

            {contextOffer && quote.ok && (
              <div className="ar3-preview">
                <span>
                  ILLUSTRATIVE OFFER /{" "}
                  {contextOffer.code}
                </span>

                <Readout
                  label="SAMPLE SAVING"
                  value={`−${formatPeso(offer.saving)}`}
                />

                <Readout
                  label="HYPOTHETICAL TOTAL"
                  value={formatPeso(
                    offer.hypotheticalTotal
                  )}
                />

                <p>
                  Not redeemable. The record is
                  saved using the <b>standard total</b>{" "}
                  shown above.
                </p>
              </div>
            )}

            <div className="ar3-ticket-stamp">
              <TideCompass />
              <span>
                RESERVATION CONCEPT ONLY
                {" / "}
                NOT VALID FOR TRAVEL
              </span>
            </div>
          </div>
        </aside>
      </section>

      {/* DEMONSTRATION CONFIRMATION */}

      {result && (
        <section
          className="ar3-success ar3-container"
          ref={ready}
          role="status"
          aria-live="polite"
        >
          <CoastalContours pale />

          <div>
            <CheckCircle2 size={43} />

            <span className="ar3-overline">
              LOCAL DEMO RECORD CREATED
            </span>

            <h2>
              A little journey, <em>imagined.</em>
            </h2>

            <p>
              Reference <strong>{result.id}</strong>{" "}
              is saved in this browser and visible in
              the staff demo. No real reservation
              was submitted.
            </p>

            <div className="ar3-success__actions">
              <button
                type="button"
                onClick={copyReference}
              >
                <Copy size={16} />
                {copyLabel}
              </button>

              <Link to="/staff/reservations">
                OPEN STAFF RESERVATIONS
                <ArrowUpRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* LOCAL BROWSER RESERVATION LOG */}

      <section className="ar3-log ar3-container">
        <div className="ar3-log__heading">
          <span className="ar3-overline">
            04 / THE BROWSER'S PRIVATE LOG
          </span>

          <h2>
            Previous <em>chapters.</em>
          </h2>

          <p>
            Local demonstration reservations on
            this browser, not real booking history.
          </p>
        </div>

        <div className="ar3-log__entries">
          {history.length === 0 ? (
            <div className="ar3-log__empty">
              NO DEMONSTRATION RESERVATIONS YET /
              BEGIN WITH YOUR FIRST STAY
            </div>
          ) : (
            history.map((booking) => (
              <article key={booking.id}>
                <div>
                  <span>{booking.id}</span>

                  <h3>
                    {accommodations.find(
                      (s) =>
                        s.id === booking.accommodationId
                    )?.name || "Concept villa"}
                  </h3>

                  <p>
                    {prettyDay(booking.checkIn)}
                    {" — "}
                    {prettyDay(booking.checkOut)}
                    {" / "}
                    {booking.guests} guests
                  </p>
                </div>

                <div>
                  <span
                    className={`ar3-status ar3-status--${booking.status}`}
                  >
                    {booking.status.replaceAll("_", " ")}
                  </span>

                  <strong>
                    {formatPeso(booking.total)}
                  </strong>

                  {booking.status === "confirmed" && (
                    <button
                      type="button"
                      onClick={() =>
                        cancel(booking.id)
                      }
                    >
                      <Trash2 size={14} />
                      CANCEL DEMO
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="ar3-bottom-banner">
        <span>
          THE UNHURRIED ATLAS / NEXT CHAPTER
        </span>

        <h2>
          It's the moments <em>in between.</em>
        </h2>

        <Link to="/packages">
          EXPLORE CURATED ESCAPES
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}