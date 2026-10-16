import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Download,
  Heart,
  Mail,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { formatPeso } from "../../data/config.js";
import { useResort } from "../../context/ResortContext.jsx";

import "../../styles/stay-staff-finish.css";

function formatted(date) {
  if (!date) return "—";

  const raw = date.includes("T")
    ? date
    : `${date}T12:00:00`;

  const value = new Date(raw);

  return Number.isNaN(value.getTime())
    ? "—"
    : value.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function csv(value) {
  let text = String(value ?? "");

  if (/^\s*[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv(rows) {
  const content =
    "\uFEFF" +
    rows
      .map((row) =>
        row.map(csv).join(",")
      )
      .join("\r\n");

  const url = URL.createObjectURL(
    new Blob([content], {
      type: "text/csv;charset=utf-8",
    })
  );

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download =
    "your-stay-demo-guest-folios.csv";

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

export default function GuestRecordsPage() {
  const {
    reservations,
    accommodations,
  } = useResort();

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("all");

  const [selectedKey, setSelectedKey] =
    useState(null);

  const [includeEmails, setIncludeEmails] =
    useState(false);

  const [feedback, setFeedback] =
    useState("");

  const villaName = (id) =>
    accommodations.find(
      (item) => item.id === id
    )?.name || "Concept residence";

  const guests = useMemo(() => {
    const map = new Map();

    for (const booking of reservations) {
      const email = String(
        booking.email || ""
      )
        .trim()
        .toLowerCase();

      const key =
        email ||
        `reservation:${booking.id}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          email,
          bookings: [],
        });
      }

      map.get(key).bookings.push(booking);
    }

    return [...map.values()]
      .map((guest) => {
        const history = [
          ...guest.bookings,
        ].sort((a, b) =>
          String(
            b.createdAt || ""
          ).localeCompare(
            String(a.createdAt || "")
          )
        );

        const nonCancelled =
          history.filter(
            (booking) =>
              booking.status !== "cancelled"
          );

        const active = history.filter(
          (booking) =>
            [
              "confirmed",
              "checked_in",
            ].includes(booking.status)
        );

        return {
          ...guest,
          history,

          name:
            history[0]?.guestName ||
            "Demo guest",

          total: history.length,

          nonCancelled:
            nonCancelled.length,

          active: active.length,

          repeat:
            nonCancelled.length >= 2,

          bookedValue:
            nonCancelled.reduce(
              (total, booking) =>
                total +
                (Number(booking.total) || 0),
              0
            ),

          lastActivity:
            history[0]?.createdAt || "",
        };
      })
      .sort((a, b) =>
        b.lastActivity.localeCompare(
          a.lastActivity
        )
      );
  }, [reservations]);

  const visible = useMemo(
    () =>
      guests.filter((guest) => {
        if (
          search.trim() &&
          !`${guest.name} ${guest.email}`
            .toLowerCase()
            .includes(
              search.trim().toLowerCase()
            )
        ) {
          return false;
        }

        return (
          filter === "all" ||
          (filter === "repeat" &&
            guest.repeat) ||
          (filter === "active" &&
            guest.active > 0)
        );
      }),
    [guests, search, filter]
  );

  const selected =
    guests.find(
      (guest) =>
        guest.key === selectedKey
    ) || null;

  const repeatCount =
    guests.filter(
      (guest) => guest.repeat
    ).length;

  const activeCount =
    guests.filter(
      (guest) => guest.active > 0
    ).length;

  function download() {
    if (!visible.length) return;

    const rows = [
      includeEmails
        ? [
            "Name (unverified)",
            "Email (unverified)",
            "Booking records",
            "Non-cancelled bookings",
            "Active booking records",
            "Booked demo value PHP",
          ]
        : [
            "Name (unverified)",
            "Booking records",
            "Non-cancelled bookings",
            "Active booking records",
            "Booked demo value PHP",
          ],
    ];

    for (const guest of visible) {
      rows.push(
        includeEmails
          ? [
              guest.name,
              guest.email,
              guest.total,
              guest.nonCancelled,
              guest.active,
              guest.bookedValue,
            ]
          : [
              guest.name,
              guest.total,
              guest.nonCancelled,
              guest.active,
              guest.bookedValue,
            ]
      );
    }

    exportCsv(rows);

    setFeedback(
      `Exported ${visible.length} fictional guest profile(s)${
        includeEmails
          ? " with contact fields"
          : " without email addresses"
      }.`
    );
  }

  return (
    <div className="op4-page op5-page op5-guests-page">
      {/* GUEST RELATIONSHIP COVER */}

      <section className="op5-guest-hero">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 07 ·
            GUEST RELATIONSHIPS
          </span>

          <h1>
            The people{" "}
            <em>behind the moments.</em>
          </h1>

          <p>
            An intimate index of demonstration
            guests and repeat-booking patterns.
            Profile cards are grouped from
            sample emails—not verified
            customer accounts.
          </p>

          <Link to="/staff/reservations">
            OPEN THE RESERVATION DESK
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div
          className="op5-guest-hero-art"
          aria-hidden="true"
        >
          <span>Y/S</span>
          <i />

          <small>
            THE GUEST ATLAS · VOL. 07
          </small>
        </div>
      </section>

      {/* GUEST METRICS */}

      <div className="op5-overview-grid op5-guest-stats">
        <div>
          <span>
            01 / UNIQUE EMAIL GROUPS
          </span>

          <strong>
            {guests.length
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Browser-local sample profiles
          </small>
        </div>

        <div>
          <span>
            02 / REPEAT-BOOKING PROFILES
          </span>

          <strong>
            {repeatCount
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Two or more non-cancelled bookings
          </small>
        </div>

        <div>
          <span>
            03 / ACTIVE PROFILES
          </span>

          <strong>
            {activeCount
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            At least one confirmed or
            checked-in booking
          </small>
        </div>

        <div>
          <span>
            04 / RESERVATION RECORDS
          </span>

          <strong>
            {reservations.length
              .toString()
              .padStart(2, "0")}
          </strong>

          <small>
            Not actual resort customers
          </small>
        </div>
      </div>

      <div className="op5-workspace-grid op5-guest-layout">
        {/* GUEST DIRECTORY */}

        <section className="op4-panel op5-guest-directory">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / THE PEOPLE INDEX
              </span>

              <h2>Names in the atlas.</h2>
            </div>

            <span className="op4-outline-mark">
              {visible.length} PROFILES
            </span>
          </div>

          <div className="op5-search-row">
            <label className="op5-search">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search sample name or email"
                value={search}
                aria-label="Search guest profiles"
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </label>

            <label className="op5-mini-select">
              <Users size={16} />

              <select
                aria-label="Guest grouping filter"
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="all">
                  All profiles
                </option>

                <option value="repeat">
                  Repeat-booking
                </option>

                <option value="active">
                  Active booking
                </option>
              </select>
            </label>
          </div>

          <div className="op5-guest-list">
            {visible.length ? (
              visible.map((guest, index) => (
                <button
                  type="button"
                  key={guest.key}
                  className={`op5-guest-choice ${
                    selectedKey === guest.key
                      ? "is-selected"
                      : ""
                  }`}
                  aria-pressed={
                    selectedKey === guest.key
                  }
                  onClick={() => {
                    setSelectedKey(
                      guest.key
                    );

                    setFeedback("");
                  }}
                >
                  <span className="op5-guest-avatar">
                    {guest.name
                      .trim()
                      .slice(0, 1)
                      .toUpperCase() || "?"}
                  </span>

                  <span className="op5-guest-identity">
                    <small>
                      FOLIO /{" "}
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </small>

                    <strong>
                      {guest.name}
                    </strong>

                    <span>
                      {guest.total} booking
                      record(s) ·{" "}
                      {guest.repeat
                        ? "Repeat-booking"
                        : "Standard"}
                    </span>
                  </span>

                  <ArrowUpRight size={18} />
                </button>
              ))
            ) : (
              <div className="op5-no-data">
                <UserRound size={27} />

                <h3>No profiles found.</h3>

                <p>
                  Guest records appear after
                  you create demo reservations.
                </p>
              </div>
            )}
          </div>

          {/* PRIVACY-AWARE CSV EXPORT */}

          <div className="op5-export-zone">
            <span className="op4-eyebrow">
              PRIVATE DATA EXPORT
            </span>

            <label>
              <input
                type="checkbox"
                checked={includeEmails}
                onChange={(e) =>
                  setIncludeEmails(
                    e.target.checked
                  )
                }
              />

              Include entered email
              addresses in CSV
            </label>

            <button
              type="button"
              className="op5-export-full"
              disabled={!visible.length}
              onClick={download}
            >
              <Download size={16} />
              EXPORT VISIBLE PROFILES
              <ArrowUpRight size={16} />
            </button>

            <small>
              Contact fields are excluded by
              default. Spreadsheet-formula
              strings are escaped during
              CSV export.
            </small>
          </div>

          {feedback && (
            <p
              role="status"
              className="op4-feedback"
            >
              {feedback}
            </p>
          )}
        </section>

        {/* SELECTED GUEST FOLIO */}

        <aside
          className="op4-panel op5-guest-inspector"
          aria-label="Guest folio"
        >
          {!selected ? (
            <div className="op5-inspector-empty">
              <Heart
                size={42}
                strokeWidth={1}
              />

              <span className="op4-eyebrow">
                02 / AN OPEN FOLIO
              </span>

              <h2>
                Every guest has{" "}
                <em>a chapter.</em>
              </h2>

              <p>
                Choose a sample profile to see
                its reservation history and
                booking patterns.
              </p>
            </div>
          ) : (
            <>
              <div className="op5-inspector-top">
                <span className="op4-eyebrow">
                  02 / PROFILE JOURNAL
                </span>

                <button
                  type="button"
                  aria-label="Close guest folio"
                  onClick={() =>
                    setSelectedKey(null)
                  }
                >
                  <X size={18} />
                </button>
              </div>

              <div className="op5-guest-profile-heading">
                <span className="op5-guest-profile-monogram">
                  {selected.name
                    .slice(0, 1)
                    .toUpperCase()}
                </span>

                <div>
                  <span>
                    UNVERIFIED DEMO PROFILE
                  </span>

                  <h2>{selected.name}</h2>

                  <p>
                    <Mail size={14} />

                    {selected.email ||
                      "No email recorded"}
                  </p>
                </div>
              </div>

              <div className="op5-profile-metrics">
                <div>
                  <span>RECORDS</span>
                  <strong>
                    {selected.total}
                  </strong>
                </div>

                <div>
                  <span>ACTIVE</span>
                  <strong>
                    {selected.active}
                  </strong>
                </div>

                <div>
                  <span>
                    BOOKED DEMO VALUE
                  </span>

                  <strong className="op5-compact-money">
                    {formatPeso(
                      selected.bookedValue
                    )}
                  </strong>
                </div>
              </div>

              <div className="op5-history-heading">
                <span className="op4-eyebrow">
                  03 / THE STAY JOURNAL
                </span>

                <h3>
                  Reservations in time.
                </h3>
              </div>

              <div className="op5-guest-history">
                {selected.history.map(
                  (booking, index) => (
                    <article
                      key={booking.id}
                      className="op5-history-item"
                    >
                      <span className="op5-history-axis">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </span>

                      <div>
                        <small>
                          {booking.id}
                        </small>

                        <strong>
                          {villaName(
                            booking.accommodationId
                          )}
                        </strong>

                        <p>
                          <CalendarDays size={13} />

                          {formatted(
                            booking.checkIn
                          )}
                          {" — "}
                          {formatted(
                            booking.checkOut
                          )}
                        </p>

                        <div className="op5-history-bottom">
                          <span
                            className={`op5-stamp op5-stamp--${booking.status}`}
                          >
                            {booking.status
                              .replaceAll(
                                "_",
                                " "
                              )
                              .toUpperCase()}
                          </span>

                          <b>
                            {formatPeso(
                              booking.total
                            )}
                          </b>
                        </div>
                      </div>
                    </article>
                  )
                )}
              </div>

              <Link
                className="op4-text-action"
                to="/staff/reservations"
              >
                MANAGE RESERVATION STATUSES
                <ArrowRight size={16} />
              </Link>
            </>
          )}
        </aside>
      </div>

      <div className="op5-privacy-note">
        <ShieldCheck size={17} />

        <span>
          Guest identities and emails are
          unverified values entered by a
          browser visitor. No login,
          server storage, cross-device sync
          or real customer relationship system
          exists. Use fictional details only.
        </span>
      </div>
    </div>
  );
}