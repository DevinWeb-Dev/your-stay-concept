import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Wrench,
} from "lucide-react";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

const todayKey = () => localDateKey();

const dateKey = (year, month, day) =>
  localDateKey(
    new Date(year, month, day, 12)
  );

const nextDay = (key) => {
  const [year, month, day] =
    key.split("-").map(Number);

  return dateKey(
    year,
    month - 1,
    day + 1
  );
};

const fullDate = (key) =>
  new Date(
    `${key}T12:00:00`
  ).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

  const [day, setDay] = useState(todayKey);

  const [selectedId, setSelectedId] = useState(
    accommodations[0]?.id || ""
  );

  const today = todayKey();

  const days = useMemo(
    () =>
      Array.from(
        {
          length: new Date(
            month.year,
            month.index + 1,
            0
          ).getDate(),
        },
        (_, index) =>
          dateKey(
            month.year,
            month.index,
            index + 1
          )
      ),
    [month]
  );

  const monthLabel = new Date(
    month.year,
    month.index,
    1
  ).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const currentStay = accommodations.find(
    (stay) => stay.id === selectedId
  );

  const bookings = reservations.filter(
    (booking) =>
      ["confirmed", "checked_in"].includes(
        booking.status
      )
  );

  const forDate = (items, stayId, date) =>
    items.filter(
      (item) =>
        item.accommodationId === stayId &&
        item.checkIn <= date &&
        date < item.checkOut
    );

  const currentBookings = forDate(
    bookings,
    selectedId,
    day
  );

  const currentBlocks = forDate(
    maintenanceBlocks,
    selectedId,
    day
  );

  const availability =
    currentStay && day >= today
      ? getAvailability({
          accommodationId: selectedId,
          checkIn: day,
          checkOut: nextDay(day),
        })
      : null;

  const params = new URLSearchParams({
    stay: selectedId,
    checkIn: day,
    checkOut: nextDay(day),
    guests: String(
      Math.min(
        2,
        currentStay?.maxGuests || 1
      )
    ),
  });

  const occupiedNights = accommodations.reduce(
    (total, stay) =>
      total +
      days.filter(
        (date) =>
          forDate(
            bookings,
            stay.id,
            date
          ).length > 0
      ).length,
    0
  );

  const blockedNights = accommodations.reduce(
    (total, stay) =>
      total +
      days.filter(
        (date) =>
          forDate(
            maintenanceBlocks,
            stay.id,
            date
          ).length > 0
      ).length,
    0
  );

  function moveMonth(offset) {
    const date = new Date(
      month.year,
      month.index + offset,
      1,
      12
    );

    setMonth({
      year: date.getFullYear(),
      index: date.getMonth(),
    });

    setDay(
      dateKey(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );
  }

  function jumpToday() {
    const date = new Date();

    setMonth({
      year: date.getFullYear(),
      index: date.getMonth(),
    });

    setDay(todayKey());
  }

  function chooseCell(stayId, date) {
    setSelectedId(stayId);
    setDay(date);
  }

  return (
    <div className="op4-page">
      <div className="op4-page-title">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 03 · THE SPATIAL TIMELINE
          </span>

          <h1>
            Every date has <em>a story.</em>
          </h1>

          <p>
            An architectural schedule of stays
            and maintenance, connected to your
            browser's demo reservations.
          </p>
        </div>

        <Link
          className="op4-dark-button"
          to="/staff/villas"
        >
          MANAGE BLOCKS
          <Wrench size={17} />
        </Link>
      </div>

      {/* MONTH SUMMARY */}

      <div className="op4-calendar-stats">
        <div>
          <span>RESERVATIONS / THIS VIEW</span>
          <strong>{occupiedNights}</strong>
          <small>
            Villa-nights occupied in this month
          </small>
        </div>

        <div>
          <span>MAINTENANCE / THIS VIEW</span>
          <strong>{blockedNights}</strong>
          <small>
            Villa-nights blocked in this month
          </small>
        </div>

        <div>
          <span>VILLAS / IN COLLECTION</span>

          <strong>
            {accommodations.length
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Each has one demo inventory unit
          </small>
        </div>
      </div>

      <div className="op4-calendar-layout">
        {/* RESERVATION MATRIX */}

        <section className="op4-panel op4-calendar-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / RESERVATION TAPE
              </span>

              <h2>{monthLabel}</h2>
            </div>

            <div className="op4-month-controls">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => moveMonth(-1)}
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                onClick={jumpToday}
              >
                TODAY
              </button>

              <button
                type="button"
                aria-label="Next month"
                onClick={() => moveMonth(1)}
              >
                <ChevronRight size={19} />
              </button>
            </div>
          </div>

          <div className="op4-calendar-legend">
            <span>
              <i className="op4-key op4-key--stay" />
              ACTIVE BOOKING
            </span>

            <span>
              <i className="op4-key op4-key--maint" />
              MAINTENANCE
            </span>

            <span>
              <i className="op4-key op4-key--today" />
              TODAY
            </span>
          </div>

          <div
            className="op4-timeline-scroll"
            tabIndex={0}
            aria-label="Horizontally scrollable reservation calendar"
          >
            <div
              className="op4-timeline"
              style={{
                "--op4-days": days.length,
              }}
            >
              <div className="op4-timeline-label op4-timeline-corner">
                RESIDENCE / DAY →
              </div>

              {days.map((date) => (
                <div
                  key={`heading-${date}`}
                  className={`op4-timeline-date ${
                    date === today
                      ? "is-today"
                      : ""
                  }`}
                >
                  <small>
                    {new Date(
                      `${date}T12:00:00`
                    )
                      .toLocaleDateString("en-PH", {
                        weekday: "short",
                      })
                      .slice(0, 2)}
                  </small>

                  <strong>
                    {Number(date.slice(-2))}
                  </strong>
                </div>
              ))}

              {accommodations.map(
                (stay, index) => (
                  <div
                    className="op4-timeline-line"
                    key={stay.id}
                  >
                    <button
                      type="button"
                      className={`op4-timeline-label ${
                        selectedId === stay.id
                          ? "is-picked"
                          : ""
                      }`}
                      onClick={() =>
                        setSelectedId(stay.id)
                      }
                    >
                      <span>
                        0{index + 1} /{" "}
                        {stay.category.toUpperCase()}
                      </span>

                      <strong>{stay.name}</strong>
                    </button>

                    {days.map((date) => {
                      const isBooked =
                        forDate(
                          bookings,
                          stay.id,
                          date
                        ).length > 0;

                      const isBlocked =
                        forDate(
                          maintenanceBlocks,
                          stay.id,
                          date
                        ).length > 0;

                      return (
                        <button
                          type="button"
                          key={date}
                          onClick={() =>
                            chooseCell(
                              stay.id,
                              date
                            )
                          }
                          aria-pressed={
                            day === date &&
                            selectedId === stay.id
                          }
                          aria-label={`${
                            stay.name
                          }, ${fullDate(date)}: ${
                            isBooked
                              ? "reserved"
                              : isBlocked
                              ? "maintenance"
                              : "no occupancy record"
                          }`}
                          className={[
                            "op4-timecell",
                            isBooked
                              ? "is-reserved"
                              : isBlocked
                              ? "is-maintenance"
                              : "",
                            day === date &&
                            selectedId === stay.id
                              ? "is-selected"
                              : "",
                            date === today
                              ? "is-today"
                              : "",
                          ].join(" ")}
                        >
                          <span />
                        </button>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          </div>

          <div className="op4-panel-note">
            Select a date square to inspect that
            villa. Check-out day is exclusive;
            a villa is not counted occupied on
            departure day unless another stay begins.
          </div>
        </section>

        {/* SELECTED DAY INSPECTOR */}

        <aside className="op4-panel op4-calendar-inspector">
          <span className="op4-eyebrow">
            02 / DAY INSPECTION
          </span>

          <h2>{fullDate(day)}</h2>

          <label className="op4-field">
            SELECT A RESIDENCE

            <select
              value={selectedId}
              onChange={(event) =>
                setSelectedId(event.target.value)
              }
            >
              {accommodations.map((stay) => (
                <option
                  value={stay.id}
                  key={stay.id}
                >
                  {stay.name}
                </option>
              ))}
            </select>
          </label>

          <div className="op4-inspector-counts">
            <div>
              <strong>
                {currentBookings.length}
              </strong>
              <span>ACTIVE STAY</span>
            </div>

            <div>
              <strong>
                {currentBlocks.length}
              </strong>
              <span>DATE BLOCK</span>
            </div>
          </div>

          <h3>Booking records</h3>

          {currentBookings.length ? (
            currentBookings.map((booking) => (
              <div
                key={booking.id}
                className="op4-calendar-entry"
              >
                <span>
                  {booking.status
                    .replaceAll("_", " ")
                    .toUpperCase()}
                </span>

                <strong>
                  {booking.guestName}
                </strong>

                <small>
                  {booking.checkIn} →{" "}
                  {booking.checkOut}
                </small>
              </div>
            ))
          ) : (
            <p className="op4-muted">
              No active reservation for the
              selected residence and date.
            </p>
          )}

          <h3>Maintenance notes</h3>

          {currentBlocks.length ? (
            currentBlocks.map((block) => (
              <div
                key={block.id}
                className="op4-calendar-entry"
              >
                <span>MAINTENANCE</span>
                <strong>{block.note}</strong>

                <small>
                  {block.checkIn} →{" "}
                  {block.checkOut}
                </small>
              </div>
            ))
          ) : (
            <p className="op4-muted">
              No maintenance block on this date.
            </p>
          )}

          {availability && (
            <div
              className={`op4-availability ${
                availability.available
                  ? "is-free"
                  : "is-busy"
              }`}
            >
              <Clock3 size={17} />
              <span>{availability.reason}</span>
            </div>
          )}

          {availability?.available && (
            <Link
              className="op4-dark-button"
              to={`/booking?${params}`}
            >
              PREVIEW A ONE-NIGHT BOOKING
              <ArrowRight size={16} />
            </Link>
          )}

          <Link
            className="op4-text-action"
            to="/staff/reservations"
          >
            OPEN RESERVATION DESK
            <ArrowUpRight size={16} />
          </Link>
        </aside>
      </div>
    </div>
  );
}