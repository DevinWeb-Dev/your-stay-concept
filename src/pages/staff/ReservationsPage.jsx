import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Filter,
  Mail,
  Search,
  ShieldCheck,
  Ticket,
  X,
  XCircle,
} from "lucide-react";

import {
  ADD_ONS,
  formatPeso,
} from "../../data/config.js";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

import "../../styles/stay-staff-finish.css";

const FILTERS = [
  { id: "all", label: "All records" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked_in", label: "Checked in" },
  { id: "checked_out", label: "Checked out" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_LABEL = Object.fromEntries(
  FILTERS.map((item) => [
    item.id,
    item.label,
  ])
);

function pretty(key) {
  if (!key) return "—";

  return new Date(
    `${key}T12:00:00`
  ).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function safeCsvCell(value) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function saveCsv(filename, rows) {
  const content =
    "\uFEFF" +
    rows
      .map((row) =>
        row.map(safeCsvCell).join(",")
      )
      .join("\r\n");

  const url = URL.createObjectURL(
    new Blob([content], {
      type: "text/csv;charset=utf-8",
    })
  );

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

function Stamp({ status }) {
  return (
    <span
      className={`op5-stamp op5-stamp--${status}`}
    >
      {(
        STATUS_LABEL[status] || status
      ).toUpperCase()}
    </span>
  );
}

export default function ReservationsPage() {
  const {
    reservations,
    accommodations,
    actions,
  } = useResort();

  const [status, setStatus] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [dateRange, setDateRange] =
    useState("all");

  const [selectedId, setSelectedId] =
    useState(null);

  const [notice, setNotice] =
    useState("");

  const stayFor = (id) =>
    accommodations.find(
      (item) => item.id === id
    );

  const today = localDateKey();

  const matches = useMemo(
    () =>
      [...reservations]
        .filter((booking) => {
          if (
            status !== "all" &&
            booking.status !== status
          ) {
            return false;
          }

          const haystack = [
            booking.id,
            booking.guestName,
            booking.email,
            stayFor(
              booking.accommodationId
            )?.name,
          ]
            .join(" ")
            .toLowerCase();

          if (
            search.trim() &&
            !haystack.includes(
              search.trim().toLowerCase()
            )
          ) {
            return false;
          }

          if (
            dateRange === "upcoming" &&
            !(
              booking.checkIn >= today &&
              booking.status === "confirmed"
            )
          ) {
            return false;
          }

          if (
            dateRange === "inhouse" &&
            booking.status !== "checked_in"
          ) {
            return false;
          }

          if (
            dateRange === "departures" &&
            booking.checkOut !== today
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) =>
          String(b.createdAt).localeCompare(
            String(a.createdAt)
          )
        ),
    [
      reservations,
      accommodations,
      status,
      search,
      dateRange,
      today,
    ]
  );

  const selected =
    reservations.find(
      (booking) =>
        booking.id === selectedId
    ) || null;

  const selectedStay = selected
    ? stayFor(selected.accommodationId)
    : null;

  const counts = Object.fromEntries(
    FILTERS.map((item) => [
      item.id,
      item.id === "all"
        ? reservations.length
        : reservations.filter(
            (booking) =>
              booking.status === item.id
          ).length,
    ])
  );

  const activeValue = reservations
    .filter(
      (booking) =>
        booking.status !== "cancelled"
    )
    .reduce(
      (sum, booking) =>
        sum + (Number(booking.total) || 0),
      0
    );

  const nextArrival = reservations
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        booking.checkIn >= today
    )
    .sort((a, b) =>
      a.checkIn.localeCompare(b.checkIn)
    )[0];

  function transition(type) {
    if (!selected) return;

    const prompt = {
      checkin:
        `Simulate check-in for ${selected.id}? This changes the demo record immediately.`,
      checkout:
        `Simulate check-out for ${selected.id}? Housekeeping will get a turnover task.`,
      cancel:
        `Cancel demonstration reservation ${selected.id}? This cannot be undone.`,
    }[type];

    if (!window.confirm(prompt)) {
      return;
    }

    const result =
      type === "checkin"
        ? actions.checkInGuest(selected.id)
        : type === "checkout"
        ? actions.checkOutGuest(selected.id)
        : actions.cancelReservation(
            selected.id
          );

    setNotice(
      result.ok
        ? `${selected.id}: local status updated successfully.`
        : result.error ||
            "Update failed."
    );
  }

  function exportVisible() {
    saveCsv(
      "your-stay-demo-reservation-ledger.csv",
      [
        [
          "Demo reference",
          "Guest name",
          "Guest email",
          "Villa",
          "Arrival",
          "Departure",
          "Guests",
          "Nights",
          "Status",
          "Demo value PHP",
          "Created at",
        ],
        ...matches.map((booking) => [
          booking.id,
          booking.guestName,
          booking.email,
          stayFor(
            booking.accommodationId
          )?.name || "Unknown",
          booking.checkIn,
          booking.checkOut,
          booking.guests,
          booking.nights,
          booking.status,
          booking.total,
          booking.createdAt,
        ]),
      ]
    );

    setNotice(
      "Filtered local demonstration records exported. The file contains guest details—keep it private."
    );
  }

  return (
    <div className="op4-page op5-page">
      {/* ARCHITECTURAL COVER */}

      <section className="op5-res-hero">
        <div className="op5-res-hero-copy">
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 02 · RESERVATIONS
          </span>

          <h1>
            The arrival <em>ledger.</em>
          </h1>

          <p>
            Every arrival is an occasion.
            Find a reservation, inspect its
            journey, and progress the original
            frontend demo record through its
            permitted statuses.
          </p>

          <div className="op5-hero-links">
            <Link to="/booking">
              COMPOSE A DEMO STAY
              <ArrowUpRight size={17} />
            </Link>

            <Link to="/staff/calendar">
              OPEN BOOKING TIMELINE
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div
          className="op5-res-hero-art"
          aria-hidden="true"
        >
          <span className="op5-orbit op5-orbit--a" />
          <span className="op5-orbit op5-orbit--b" />

          <span className="op5-big-digit">
            02
          </span>

          <span className="op5-folio-stamp">
            YS / RESERVATION ATELIER
          </span>
        </div>
      </section>

      {/* EXECUTIVE RESERVATION METRICS */}

      <div
        className="op5-overview-grid"
        aria-label="Reservation statistics"
      >
        <div>
          <span>
            01 / ALL LOCAL RECORDS
          </span>

          <strong>
            {reservations.length
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Includes cancelled reservations
          </small>
        </div>

        <div>
          <span>
            02 / CURRENTLY CHECKED IN
          </span>

          <strong>
            {counts.checked_in
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Simulated staff status,
            not verified physical occupancy
          </small>
        </div>

        <div>
          <span>
            03 / NEXT CONFIRMED ARRIVAL
          </span>

          <strong className="op5-stat-date">
            {nextArrival
              ? pretty(
                  nextArrival.checkIn
                )
              : "—"}
          </strong>

          <small>
            {nextArrival
              ? stayFor(
                  nextArrival.accommodationId
                )?.name
              : "No future arrival"}
          </small>
        </div>

        <div>
          <span>
            04 / BOOKED DEMO VALUE
          </span>

          <strong className="op5-stat-date">
            {formatPeso(activeValue)}
          </strong>

          <small>
            Projected only · not collected revenue
          </small>
        </div>
      </div>

      <div className="op5-workspace-grid">
        {/* RESERVATION INDEX */}

        <section className="op4-panel op5-ledger">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / THE RESERVATION INDEX
              </span>

              <h2>Find a chapter.</h2>
            </div>

            <span className="op4-outline-mark">
              {matches.length} MATCHES
            </span>
          </div>

          <div
            className="op5-filter-strip"
            role="group"
            aria-label="Filter reservation status"
          >
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={
                  status === item.id
                }
                className={
                  status === item.id
                    ? "is-current"
                    : ""
                }
                onClick={() =>
                  setStatus(item.id)
                }
              >
                <b>{counts[item.id]}</b>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="op5-search-row">
            <label className="op5-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Guest, email, villa or reference"
                aria-label="Search reservations"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </label>

            <label className="op5-mini-select">
              <Filter size={16} />

              <select
                aria-label="Filter by reservation date"
                value={dateRange}
                onChange={(e) =>
                  setDateRange(e.target.value)
                }
              >
                <option value="all">
                  All dates
                </option>

                <option value="upcoming">
                  Upcoming arrivals
                </option>

                <option value="inhouse">
                  Checked in
                </option>

                <option value="departures">
                  Departing today
                </option>
              </select>
            </label>

            <button
              className="op5-export-btn"
              type="button"
              disabled={!matches.length}
              onClick={exportVisible}
            >
              <Download size={16} />
              CSV
            </button>
          </div>

          {notice && (
            <p
              className="op4-feedback"
              role="status"
            >
              {notice}
            </p>
          )}

          <div className="op5-ledger-list">
            {matches.length === 0 ? (
              <div className="op5-no-data">
                <CalendarDays size={30} />

                <h3>No matching stays.</h3>

                <p>
                  Adjust the filters or create
                  a fictional reservation to
                  populate this ledger.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setDateRange("all");
                  }}
                >
                  RESET FILTERS
                  <ArrowRight size={15} />
                </button>
              </div>
            ) : (
              matches.map((booking, index) => (
                <button
                  key={booking.id}
                  type="button"
                  className={`op5-booking-item ${
                    selectedId === booking.id
                      ? "is-selected"
                      : ""
                  }`}
                  aria-pressed={
                    selectedId === booking.id
                  }
                  onClick={() => {
                    setSelectedId(
                      booking.id
                    );
                    setNotice("");
                  }}
                >
                  <span className="op5-booking-number">
                    {String(
                      index + 1
                    ).padStart(2, "0")}
                  </span>

                  <span className="op5-booking-main">
                    <small>{booking.id}</small>

                    <strong>
                      {booking.guestName}
                    </strong>

                    <span>
                      {stayFor(
                        booking.accommodationId
                      )?.name || "Unknown villa"}
                      {" · "}
                      {pretty(booking.checkIn)}
                      {" — "}
                      {pretty(booking.checkOut)}
                    </span>
                  </span>

                  <span className="op5-booking-meta">
                    <Stamp
                      status={booking.status}
                    />

                    <strong>
                      {formatPeso(
                        booking.total
                      )}
                    </strong>
                  </span>

                  <ChevronRight size={17} />
                </button>
              ))
            )}
          </div>
        </section>

        {/* SELECTED BOOKING / TRAVEL FOLIO */}

        <aside
          className="op4-panel op5-res-inspector"
          aria-label="Reservation inspector"
        >
          {!selected ? (
            <div className="op5-inspector-empty">
              <Ticket
                size={43}
                strokeWidth={1}
              />

              <span className="op4-eyebrow">
                02 / THE TRAVEL FOLIO
              </span>

              <h2>
                Choose a{" "}
                <em>reservation.</em>
              </h2>

              <p>
                Select a record in the index
                to inspect guest, villa, dates,
                extras and permitted local
                status actions.
              </p>
            </div>
          ) : (
            <>
              <div className="op5-inspector-top">
                <span className="op4-eyebrow">
                  02 / SELECTED TRAVEL FOLIO
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedId(null)
                  }
                  aria-label="Close reservation inspector"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="op5-inspector-photo">
                <img
                  src={selectedStay?.images[0]}
                  alt="Illustrative villa scene"
                />

                <span>
                  RESERVATION / {selected.id}
                </span>
              </div>

              <div className="op5-inspector-content">
                <Stamp status={selected.status} />

                <h2>{selected.guestName}</h2>

                <p className="op5-email">
                  <Mail size={15} />
                  {selected.email}
                </p>

                <div className="op5-trip-line">
                  <div>
                    <span>ARRIVAL</span>

                    <strong>
                      {pretty(
                        selected.checkIn
                      )}
                    </strong>
                  </div>

                  <div
                    className="op5-trip-passage"
                    aria-hidden="true"
                  >
                    •••••
                  </div>

                  <div>
                    <span>DEPARTURE</span>

                    <strong>
                      {pretty(
                        selected.checkOut
                      )}
                    </strong>
                  </div>
                </div>

                <div className="op5-folio-facts">
                  <div>
                    <span>RESIDENCE</span>
                    <strong>
                      {selectedStay?.name ||
                        "Unknown"}
                    </strong>
                  </div>

                  <div>
                    <span>TRAVELERS</span>
                    <strong>
                      {selected.guests} guest(s)
                    </strong>
                  </div>

                  <div>
                    <span>NIGHTS</span>
                    <strong>
                      {selected.nights}
                    </strong>
                  </div>

                  <div>
                    <span>DEMO VALUE</span>
                    <strong>
                      {formatPeso(
                        selected.total
                      )}
                    </strong>
                  </div>
                </div>

                <div className="op5-extras">
                  <span>CURATED EXTRAS</span>

                  {selected.addOnIds?.length ? (
                    selected.addOnIds.map(
                      (id) => (
                        <strong key={id}>
                          <Check size={13} />

                          {ADD_ONS.find(
                            (item) =>
                              item.id === id
                          )?.name || id}
                        </strong>
                      )
                    )
                  ) : (
                    <small>
                      None selected
                    </small>
                  )}
                </div>

                <div className="op5-action-panel">
                  <span>
                    PERMITTED STATUS ACTIONS
                  </span>

                  {selected.status ===
                  "confirmed" ? (
                    <>
                      <button
                        className="op5-action-primary"
                        type="button"
                        onClick={() =>
                          transition("checkin")
                        }
                      >
                        <CheckCircle2 size={17} />
                        SIMULATE CHECK-IN
                        <ArrowUpRight size={16} />
                      </button>

                      <button
                        className="op5-action-danger"
                        type="button"
                        onClick={() =>
                          transition("cancel")
                        }
                      >
                        <XCircle size={17} />
                        CANCEL DEMO RESERVATION
                      </button>
                    </>
                  ) : selected.status ===
                    "checked_in" ? (
                    <button
                      className="op5-action-primary"
                      type="button"
                      onClick={() =>
                        transition("checkout")
                      }
                    >
                      <CheckCircle2 size={17} />
                      SIMULATE CHECK-OUT
                      <ArrowUpRight size={16} />
                    </button>
                  ) : (
                    <p>
                      Final state. The booking
                      engine does not allow
                      further status changes.
                    </p>
                  )}
                </div>

                <div className="op5-inspector-note">
                  <ShieldCheck size={17} />

                  <span>
                    Local simulation only.
                    Check-in and check-out
                    are staff demo actions,
                    not verified real-world events.
                  </span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <p className="op5-privacy-note">
        <ShieldCheck size={16} />

        Guest fields and CSV exports may contain
        information typed into this browser.
        Use fictional data and do not share
        exported files publicly.
      </p>
    </div>
  );
}