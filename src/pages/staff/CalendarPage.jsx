import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Wrench,
} from "lucide-react";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

const WEEKDAYS = [
  "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
];

function keyFor(year, month, day) {
  return localDateKey(
    new Date(year, month, day, 12, 0, 0)
  );
}

function addDays(key, amount) {
  const [year, month, day] = key.split("-").map(Number);
  return localDateKey(
    new Date(year, month - 1, day + amount, 12)
  );
}

function prettyDate(key) {
  return new Date(`${key}T12:00:00`).toLocaleDateString(
    "en-PH",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );
}

export default function CalendarPage() {
  const {
    accommodations,
    reservations,
    maintenanceBlocks,
    getAvailability,
  } = useResort();

  const [month, setMonth] = useState(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      index: now.getMonth(),
    };
  });

  const [selectedStay, setSelectedStay] = useState("all");
  const [selectedDate, setSelectedDate] = useState(
    localDateKey()
  );

  const firstDay = new Date(
    month.year,
    month.index,
    1,
    12
  );

  const daysInMonth = new Date(
    month.year,
    month.index + 1,
    0
  ).getDate();

  const monthLabel = firstDay.toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const activeBookings = useMemo(
    () =>
      reservations.filter((booking) =>
        ["confirmed", "checked_in"].includes(booking.status)
      ),
    [reservations]
  );

  function matchesSelectedStay(item) {
    return (
      selectedStay === "all" ||
      item.accommodationId === selectedStay
    );
  }

  function eventsForDay(dayKey) {
    const bookings = activeBookings.filter(
      (booking) =>
        matchesSelectedStay(booking) &&
        booking.checkIn <= dayKey &&
        dayKey < booking.checkOut
    );

    const blocks = maintenanceBlocks.filter(
      (block) =>
        matchesSelectedStay(block) &&
        block.checkIn <= dayKey &&
        dayKey < block.checkOut
    );

    return { bookings, blocks };
  }

  const cells = useMemo(() => {
    const empty = firstDay.getDay();

    return [
      ...Array(empty).fill(null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => keyFor(month.year, month.index, i + 1)
      ),
    ];
  }, [month.year, month.index, daysInMonth]);

  const selectedEvents = eventsForDay(selectedDate);

  const today = localDateKey();
  const isPast = selectedDate < today;

  const selectedStayData = accommodations.find(
    (stay) => stay.id === selectedStay
  );

  const availability =
    selectedStayData && !isPast
      ? getAvailability({
          accommodationId: selectedStayData.id,
          checkIn: selectedDate,
          checkOut: addDays(selectedDate, 1),
        })
      : null;

  const bookingParams =
    selectedStayData && !isPast
      ? new URLSearchParams({
          stay: selectedStayData.id,
          checkIn: selectedDate,
          checkOut: addDays(selectedDate, 1),
          guests: String(
            Math.min(2, selectedStayData.maxGuests)
          ),
        }).toString()
      : "";

  function changeMonth(direction) {
    const next = new Date(
      month.year,
      month.index + direction,
      1,
      12
    );

    setMonth({
      year: next.getFullYear(),
      index: next.getMonth(),
    });

    setSelectedDate(
      keyFor(next.getFullYear(), next.getMonth(), 1)
    );
  }

  function jumpToday() {
    const now = new Date();

    setMonth({
      year: now.getFullYear(),
      index: now.getMonth(),
    });

    setSelectedDate(localDateKey(now));
  }

  const stayName = (id) =>
    accommodations.find((stay) => stay.id === id)?.name ||
    "Unknown accommodation";

  return (
    <div className="ys5-page ys6-page">
      <header className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            YOUR STAY / RESERVATION TIMELINE
          </span>
          <h1>
            Every date, <em>every detail.</em>
          </h1>
          <p>
            Explore upcoming stays and maintenance periods
            across your resort's accommodation collection.
          </p>
        </div>

        <Link className="ys5-button" to="/staff/villas">
          <Wrench size={17} />
          Manage date blocks
        </Link>
      </header>

      <div className="ys6-calendar-layout">
        <section className="ys5-panel ys6-calendar-main">
          <div className="ys6-calendar-toolbar">
            <div>
              <span className="ys5-eyebrow">
                MONTHLY OVERVIEW
              </span>
              <h2>{monthLabel}</h2>
            </div>

            <div className="ys6-calendar-controls">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                <ChevronLeft size={21} />
              </button>

              <button
                type="button"
                onClick={jumpToday}
              >
                Today
              </button>

              <button
                type="button"
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                <ChevronRight size={21} />
              </button>
            </div>
          </div>

          <label className="ys5-field ys6-calendar-filter">
            <span>ACCOMMODATION FILTER</span>

            <select
              value={selectedStay}
              onChange={(event) =>
                setSelectedStay(event.target.value)
              }
            >
              <option value="all">All accommodations</option>
              {accommodations.map((stay) => (
                <option key={stay.id} value={stay.id}>
                  {stay.name}
                </option>
              ))}
            </select>
          </label>

          <div className="ys6-calendar-legend">
            <span>
              <i className="ys6-dot ys6-dot--booked" />
              Reservation
            </span>
            <span>
              <i className="ys6-dot ys6-dot--maintenance" />
              Maintenance
            </span>
            <span>
              <i className="ys6-dot ys6-dot--today" />
              Today
            </span>
          </div>

          <div className="ys6-calendar-grid">
            {WEEKDAYS.map((day) => (
              <div className="ys6-calendar-weekday" key={day}>
                {day}
              </div>
            ))}

            {cells.map((day, index) => {
              if (!day) {
                return (
                  <div
                    className="ys6-calendar-blank"
                    key={`blank-${index}`}
                  />
                );
              }

              const events = eventsForDay(day);

              const number = Number(day.slice(-2));
              const isToday = day === today;

              return (
                <button
                  type="button"
                  key={day}
                  className={[
                    "ys6-calendar-day",
                    day === selectedDate ? "is-selected" : "",
                    isToday ? "is-today" : "",
                    day < today ? "is-past" : "",
                  ].join(" ")}
                  aria-pressed={day === selectedDate}
                  aria-label={
                    `${prettyDate(day)}. ` +
                    `${events.bookings.length} booked, ` +
                    `${events.blocks.length} maintenance blocks`
                  }
                  onClick={() => setSelectedDate(day)}
                >
                  <strong>{number}</strong>

                  <div className="ys6-calendar-day-tags">
                    {events.bookings.length > 0 && (
                      <span className="ys6-cal-tag is-booked">
                        {events.bookings.length} stay
                      </span>
                    )}

                    {events.blocks.length > 0 && (
                      <span className="ys6-cal-tag is-maintenance">
                        {events.blocks.length} block
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="ys5-legal-note">
            Check-out dates are not marked occupied unless
            another reservation begins on that day.
          </p>
        </section>

        <aside className="ys5-panel ys6-calendar-sidebar">
          <span className="ys5-eyebrow">
            SELECTED DATE
          </span>

          <h2>{prettyDate(selectedDate)}</h2>

          <div className="ys6-calendar-summary">
            <div>
              <CalendarDays size={19} />
              <strong>
                {selectedEvents.bookings.length}
              </strong>
              <span>Active bookings</span>
            </div>

            <div>
              <Wrench size={19} />
              <strong>
                {selectedEvents.blocks.length}
              </strong>
              <span>Maintenance blocks</span>
            </div>
          </div>

          <h3 className="ys6-subheading">
            Reserved accommodations
          </h3>

          {selectedEvents.bookings.length === 0 ? (
            <p className="ys6-muted">
              No active demo reservations on this date.
            </p>
          ) : (
            <div className="ys6-calendar-events">
              {selectedEvents.bookings.map((booking) => (
                <article key={booking.id}>
                  <span className="ys5-eyebrow">
                    {booking.status.replaceAll("_", " ")}
                  </span>
                  <strong>
                    {stayName(booking.accommodationId)}
                  </strong>
                  <small>
                    {booking.checkIn} → {booking.checkOut}
                  </small>
                </article>
              ))}
            </div>
          )}

          <h3 className="ys6-subheading">
            Maintenance periods
          </h3>

          {selectedEvents.blocks.length === 0 ? (
            <p className="ys6-muted">
              No maintenance recorded for this date.
            </p>
          ) : (
            <div className="ys6-calendar-events">
              {selectedEvents.blocks.map((block) => (
                <article key={block.id}>
                  <span className="ys5-eyebrow">
                    MAINTENANCE
                  </span>
                  <strong>
                    {stayName(block.accommodationId)}
                  </strong>
                  <small>{block.note}</small>
                </article>
              ))}
            </div>
          )}

          <div className="ys6-calendar-actions">
            {selectedStayData && !isPast && (
              <>
                <h3 className="ys6-subheading">
                  One-night availability
                </h3>

                <p
                  className={`ys6-availability ${
                    availability?.available ? "is-free" : "is-busy"
                  }`}
                  role="status"
                >
                  {availability?.available
                    ? "Available in this browser's demo"
                    : availability?.reason}
                </p>

                {availability?.available && (
                  <Link
                    className="ys5-button ys5-button-full"
                    to={`/booking?${bookingParams}`}
                  >
                    Preview booking
                    <ArrowRight size={17} />
                  </Link>
                )}
              </>
            )}

            {selectedStay === "all" && (
              <p className="ys6-muted">
                Select a specific villa to check one-night
                availability.
              </p>
            )}

            <Link
              to="/staff/reservations"
              className="ys5-text-link"
            >
              View reservation desk
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}