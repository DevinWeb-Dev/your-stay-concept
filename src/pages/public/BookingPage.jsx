import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  TicketCheck,
  Trash2,
  Users,
} from "lucide-react";

import {
  ACCOMMODATIONS,
  ADD_ONS,
  DEMO_NOTICES,
  RESORT_POLICIES,
  formatPeso,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function dateFromNow(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function nextDay(value) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return localDateKey(date);
}

function prettyDate(value) {
  if (!value) return "—";

  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-PH",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
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

  const initialStay = params.get("stay");
  const validStay = accommodations.some(
    (stay) => stay.id === initialStay
  );

  const [stayId, setStayId] = useState(
    validStay ? initialStay : accommodations[0]?.id || ""
  );

  const [checkIn, setCheckIn] = useState(
    params.get("checkIn") || dateFromNow(2)
  );

  const [checkOut, setCheckOut] = useState(
    params.get("checkOut") || dateFromNow(3)
  );

  const [guests, setGuests] = useState(
    Number(params.get("guests")) || 2
  );

  const [addOnIds, setAddOnIds] = useState(() => {
    const ids = (params.get("addOns") || "")
      .split(",")
      .filter(Boolean);

    return [...new Set(ids)].filter((id) =>
      ADD_ONS.some((addon) => addon.id === id)
    );
  });

  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(null);

  const stay = ACCOMMODATIONS.find(
    (item) => item.id === stayId
  );

  const actualGuests = Math.min(
    Math.max(1, guests),
    stay?.maxGuests || 1
  );

  const quote = stay
    ? getQuote({
        accommodationId: stayId,
        checkIn,
        checkOut,
        guests: actualGuests,
        addOnIds,
      })
    : { ok: false, error: "Choose an accommodation." };

  useEffect(() => {
    document.title = "Reserve Your Escape | YOUR STAY";
    return () => {
      document.title = "YOUR STAY";
    };
  }, []);

  function changeCheckIn(value) {
    setCheckIn(value);

    if (value && checkOut <= value) {
      setCheckOut(nextDay(value));
    }
  }

  function toggleAddon(id) {
    setAddOnIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function submitBooking(event) {
    event.preventDefault();
    setMessage("");
    setConfirmed(null);

    if (!quote.ok) {
      setMessage(quote.error);
      return;
    }

    const result = actions.reserveStay({
      accommodationId: stayId,
      checkIn,
      checkOut,
      guests: actualGuests,
      guestName: guestName.trim(),
      email: email.trim(),
      addOnIds,
    });

    if (result.ok && result.booking) {
      setConfirmed(result.booking);
      setMessage("");
    } else {
      setMessage(result.error || "Unable to create demo booking.");
    }
  }

  function cancelBooking(id) {
    if (
      !window.confirm(
        "Cancel this reservation in the local demo?"
      )
    ) {
      return;
    }

    const result = actions.cancelReservation(id);

    if (!result.ok) {
      setMessage(result.error);
    } else {
      setMessage("Demo reservation cancelled.");
      setConfirmed(null);
    }
  }

  const history = [...reservations].reverse();

  return (
    <div className="ys3-page">
      <section className="ys3-booking-hero">
        <div className="ys3-shell">
          <span className="ys-kicker ys-kicker--light">
            YOUR NEXT CHAPTER
          </span>

          <h1 className="ys3-title">
            Book your <em>somewhere.</em>
          </h1>

          <p>
            A little escape, designed around you.
            Plan your stay and preview your booking.
          </p>
        </div>
      </section>

      <div className="ys3-shell ys3-section">
        <div className="ys3-booking-grid">
          <form
            className="ys3-panel ys3-bookform"
            onSubmit={submitBooking}
          >
            <span className="ys-kicker">01 / ACCOMMODATION</span>
            <h2 className="ys3-subheading">Choose your escape.</h2>

            <label className="ys3-field">
              <span>YOUR VILLA OR SUITE</span>
              <select
                value={stayId}
                onChange={(e) => {
                  setStayId(e.target.value);
                  setMessage("");
                  setConfirmed(null);
                }}
              >
                {accommodations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {formatPeso(item.nightlyRate)}/night
                  </option>
                ))}
              </select>
            </label>

            {stay && (
              <Link
                to={`/stays/${stay.id}`}
                className="ys3-selected-stay"
              >
                <img
                  src={stay.images[0]}
                  alt={`Illustrative ${stay.name}`}
                />
                <span>
                  <strong>{stay.name}</strong>
                  <small>
                    {stay.bedrooms} bedroom(s) · Up to{" "}
                    {stay.maxGuests} guests
                  </small>
                </span>
                <ChevronRight size={19} />
              </Link>
            )}

            <div className="ys3-rule" />

            <span className="ys-kicker">02 / TRAVEL DATES</span>
            <h2 className="ys3-subheading">
              When shall we <em>meet?</em>
            </h2>

            <div className="ys3-form-grid">
              <label className="ys3-field">
                <span>CHECK IN</span>
                <input
                  required
                  type="date"
                  min={dateFromNow(0)}
                  value={checkIn}
                  onChange={(e) => changeCheckIn(e.target.value)}
                />
              </label>

              <label className="ys3-field">
                <span>CHECK OUT</span>
                <input
                  required
                  type="date"
                  min={checkIn || dateFromNow(1)}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </label>

              <label className="ys3-field ys3-full">
                <span>NUMBER OF GUESTS</span>
                <select
                  value={actualGuests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                >
                  {Array.from(
                    { length: stay?.maxGuests || 1 },
                    (_, i) => i + 1
                  ).map((number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="ys3-rule" />

            <span className="ys-kicker">03 / THE LITTLE EXTRAS</span>
            <h2 className="ys3-subheading">
              Make it <em>personal.</em>
            </h2>

            <div className="ys3-addons">
              {ADD_ONS.map((addon) => (
                <label className="ys3-addon" key={addon.id}>
                  <input
                    type="checkbox"
                    checked={addOnIds.includes(addon.id)}
                    onChange={() => toggleAddon(addon.id)}
                  />

                  <span>
                    <strong>{addon.name}</strong>
                    <small>{addon.description}</small>
                  </span>

                  <b>
                    {addon.price
                      ? `+${formatPeso(addon.price)}`
                      : "Request"}
                  </b>
                </label>
              ))}
            </div>

            <div className="ys3-rule" />

            <span className="ys-kicker">04 / GUEST INFORMATION</span>
            <h2 className="ys3-subheading">Almost paradise.</h2>

            <div className="ys3-form-grid">
              <label className="ys3-field ys3-full">
                <span>FULL NAME</span>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={80}
                  autoComplete="name"
                  placeholder="Your name"
                />
              </label>

              <label className="ys3-field ys3-full">
                <span>EMAIL ADDRESS</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <p className="ys3-disclaimer">
              This information is saved only in your browser's
              local demo records. Use sample details, not real
              personal information.
            </p>

            {message && (
              <div className="ys3-error" role="alert">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="ys3-btn ys3-btn--wide"
              disabled={!quote.ok}
            >
              <TicketCheck size={19} />
              Confirm demo reservation
              <ArrowRight size={18} />
            </button>

            <div className="ys3-trust">
              <ShieldCheck size={17} />
              No actual reservation or payment will be made.
            </div>
          </form>

          <aside className="ys3-booksummary">
            <div className="ys3-panel">
              <span className="ys-kicker">YOUR STAY SUMMARY</span>
              <h2 className="ys3-subheading">
                Your escape, <em>at a glance.</em>
              </h2>

              {stay && (
                <img
                  className="ys3-summary-photo"
                  src={stay.images[0]}
                  alt={`Illustrative view of ${stay.name}`}
                />
              )}

              <h3>{stay?.name}</h3>

              <div className="ys3-summary-data">
                <div>
                  <CalendarDays size={17} />
                  {prettyDate(checkIn)} — {prettyDate(checkOut)}
                </div>
                <div>
                  <Users size={17} />
                  {actualGuests} guest(s)
                </div>
              </div>

              {quote.ok ? (
                <div className="ys3-price-breakdown">
                  <div>
                    <span>{quote.nights} night(s)</span>
                    <span>{formatPeso(quote.nightlySubtotal)}</span>
                  </div>

                  {quote.extraGuestTotal > 0 && (
                    <div>
                      <span>Extra guests</span>
                      <span>
                        {formatPeso(quote.extraGuestTotal)}
                      </span>
                    </div>
                  )}

                  {quote.addOnTotal > 0 && (
                    <div>
                      <span>Experience add-ons</span>
                      <span>{formatPeso(quote.addOnTotal)}</span>
                    </div>
                  )}

                  <div className="ys3-total">
                    <strong>Estimated total</strong>
                    <strong>{formatPeso(quote.total)}</strong>
                  </div>
                </div>
              ) : (
                <p className="ys3-error" role="status">
                  {quote.error}
                </p>
              )}

              <p className="ys3-disclaimer">
                {DEMO_NOTICES.booking}
              </p>
            </div>
          </aside>
        </div>

        {confirmed && (
          <section
            className="ys3-success"
            role="status"
            aria-live="polite"
          >
            <CheckCircle2 size={39} />
            <span className="ys-kicker">
              DEMO RESERVATION SAVED
            </span>
            <h2 className="ys3-heading">
              Your escape is <em>on the calendar.</em>
            </h2>
            <p>
              Your reservation exists only in this browser's
              prototype data. It has not been sent to a resort.
            </p>

            <div className="ys3-ref">
              Reference: <strong>{confirmed.id}</strong>
            </div>
          </section>
        )}

        <section className="ys3-history">
          <div className="ys3-section-heading">
            <div>
              <span className="ys-kicker">
                YOUR BROWSER'S DEMO BOOKINGS
              </span>
              <h2 className="ys3-heading">
                Reservation <em>history.</em>
              </h2>
            </div>
            <span>{history.length} total</span>
          </div>

          {history.length === 0 ? (
            <div className="ys3-panel">
              <p>No demo reservations saved yet.</p>
            </div>
          ) : (
            <div className="ys3-history-list">
              {history.map((booking) => {
                const item = ACCOMMODATIONS.find(
                  (stay) => stay.id === booking.accommodationId
                );

                return (
                  <article
                    className="ys3-history-card"
                    key={booking.id}
                  >
                    <div>
                      <span className="ys-kicker">
                        {booking.id}
                      </span>

                      <h3>{item?.name || "Resort stay"}</h3>

                      <p>
                        {prettyDate(booking.checkIn)} —{" "}
                        {prettyDate(booking.checkOut)}
                      </p>

                      <strong>{formatPeso(booking.total)}</strong>
                    </div>

                    <div className="ys3-history-actions">
                      <span
                        className={`ys3-status ys3-status--${booking.status}`}
                      >
                        {booking.status.replaceAll("_", " ")}
                      </span>

                      {booking.status === "confirmed" && (
                        <button
                          type="button"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          <Trash2 size={15} />
                          Cancel demo
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}