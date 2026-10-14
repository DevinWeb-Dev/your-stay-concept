import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Search,
  Users,
  XCircle,
} from "lucide-react";

import { formatPeso } from "../../data/config.js";
import { useResort } from "../../context/ResortContext.jsx";

const FILTERS = [
  { id: "all", label: "All bookings" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked_in", label: "Checked in" },
  { id: "checked_out", label: "Checked out" },
  { id: "cancelled", label: "Cancelled" },
];

function prettyDate(value) {
  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-PH",
    { month: "short", day: "numeric", year: "numeric" }
  );
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export default function ReservationsPage() {
  const {
    reservations,
    accommodations,
    actions,
  } = useResort();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [feedback, setFeedback] = useState("");

  const getStayName = (id) =>
    accommodations.find((stay) => stay.id === id)?.name ||
    "Unknown accommodation";

  const visible = useMemo(() => {
    return [...reservations]
      .filter((booking) => {
        const query = search.toLowerCase().trim();

        const matchesSearch =
          !query ||
          [
            booking.id,
            booking.guestName,
            booking.email,
            getStayName(booking.accommodationId),
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        return (
          matchesSearch &&
          (filter === "all" || booking.status === filter)
        );
      })
      .sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
  }, [reservations, accommodations, search, filter]);

  const counts = Object.fromEntries(
    FILTERS.map((item) => [
      item.id,
      item.id === "all"
        ? reservations.length
        : reservations.filter(
            (booking) => booking.status === item.id
          ).length,
    ])
  );

  function changeStatus(booking, type) {
    const messages = {
      checkin: "Simulate guest check-in?",
      checkout: "Simulate guest check-out?",
      cancel: "Cancel this demo reservation?",
    };

    if (!window.confirm(messages[type])) return;

    const result =
      type === "checkin"
        ? actions.checkInGuest(booking.id)
        : type === "checkout"
        ? actions.checkOutGuest(booking.id)
        : actions.cancelReservation(booking.id);

    if (result.ok) {
      setFeedback(
        `${booking.id} updated successfully in this browser.`
      );
    } else {
      setFeedback(result.error || "Unable to update booking.");
    }
  }

  function exportCsv() {
    const header = [
      "Reference",
      "Guest",
      "Email",
      "Accommodation",
      "Check-in",
      "Check-out",
      "Guests",
      "Status",
      "Demo Total PHP",
    ];

    const rows = visible.map((booking) => [
      booking.id,
      booking.guestName,
      booking.email,
      getStayName(booking.accommodationId),
      booking.checkIn,
      booking.checkOut,
      booking.guests,
      booking.status,
      booking.total,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "your-stay-demo-reservations.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="ys5-page">
      <div className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">THE RESERVATION DESK</span>
          <h1>
            Every stay, <em>beautifully organized.</em>
          </h1>
          <p>
            Browse local demo bookings, simulate arrivals,
            process check-outs and manage cancellations.
          </p>
        </div>

        <Link to="/booking" className="ys5-button">
          Open booking form <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="ys5-mini-stats">
        {FILTERS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={filter === item.id ? "is-active" : ""}
            onClick={() => setFilter(item.id)}
            aria-pressed={filter === item.id}
          >
            <strong>{counts[item.id]}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <section className="ys5-panel">
        <div className="ys5-toolbar">
          <div className="ys5-search">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search guest, booking ID or villa..."
              aria-label="Search reservations"
            />
          </div>

          <button
            type="button"
            className="ys5-button ys5-button-outline"
            onClick={exportCsv}
            disabled={visible.length === 0}
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>

        {feedback && (
          <p className="ys5-feedback" role="status">
            {feedback}
          </p>
        )}

        <div className="ys5-reservation-list">
          {visible.length === 0 ? (
            <div className="ys5-empty">
              <CalendarDays size={31} />
              <p>No reservations match the current filters.</p>
            </div>
          ) : (
            visible.map((booking) => (
              <article
                key={booking.id}
                className="ys5-reservation-card"
              >
                <div className="ys5-reservation-top">
                  <div>
                    <span className="ys5-eyebrow">
                      {booking.id}
                    </span>
                    <h3>{booking.guestName}</h3>
                    <p>
                      {getStayName(booking.accommodationId)}
                    </p>
                  </div>

                  <span
                    className={`ys5-status ys5-status-${booking.status}`}
                  >
                    {booking.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="ys5-reservation-details">
                  <div>
                    <span>CHECK IN</span>
                    <strong>{prettyDate(booking.checkIn)}</strong>
                  </div>
                  <div>
                    <span>CHECK OUT</span>
                    <strong>{prettyDate(booking.checkOut)}</strong>
                  </div>
                  <div>
                    <span>GUESTS</span>
                    <strong>
                      <Users size={15} />
                      {booking.guests}
                    </strong>
                  </div>
                  <div>
                    <span>DEMO VALUE</span>
                    <strong>{formatPeso(booking.total)}</strong>
                  </div>
                </div>

                <div className="ys5-reservation-bottom">
                  <div>
                    <strong>{booking.email}</strong>
                    <small>
                      Created{" "}
                      {new Date(booking.createdAt)
                        .toLocaleString("en-PH")}
                    </small>
                  </div>

                  <div className="ys5-action-row">
                    {booking.status === "confirmed" && (
                      <>
                        <button
                          className="ys5-small-btn"
                          type="button"
                          onClick={() =>
                            changeStatus(booking, "checkin")
                          }
                        >
                          <CheckCircle2 size={16} />
                          Simulate check-in
                        </button>

                        <button
                          className="ys5-small-btn ys5-small-btn-danger"
                          type="button"
                          onClick={() =>
                            changeStatus(booking, "cancel")
                          }
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </>
                    )}

                    {booking.status === "checked_in" && (
                      <button
                        className="ys5-small-btn"
                        type="button"
                        onClick={() =>
                          changeStatus(booking, "checkout")
                        }
                      >
                        <CheckCircle2 size={16} />
                        Simulate check-out
                      </button>
                    )}

                    {["checked_out", "cancelled"].includes(
                      booking.status
                    ) && (
                      <span className="ys5-muted">
                        No further status actions available
                      </span>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <p className="ys5-legal-note">
        Demo operations only. Check-in and check-out buttons
        simulate status changes regardless of today's date.
        Data is not synchronized across devices. CSV exports
        contain locally entered guest details—handle them carefully.
      </p>
    </div>
  );
}