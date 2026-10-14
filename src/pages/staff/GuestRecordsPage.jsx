import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Download,
  Mail,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { formatPeso } from "../../data/config.js";
import { useResort } from "../../context/ResortContext.jsx";

function formatDate(value) {
  if (!value) return "—";

  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
}

function csvCell(value) {
  let text = String(value ?? "");
  if (/^\s*[=+\-@\t\r]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}

export default function GuestRecordsPage() {
  const { reservations, accommodations } = useResort();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedEmail, setSelectedEmail] = useState(null);

  const guests = useMemo(() => {
    const grouped = new Map();

    for (const booking of reservations) {
      const email = String(booking.email || "")
        .trim()
        .toLowerCase();

      const key = email || `booking:${booking.id}`;

      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          email,
          name: booking.guestName || "Demo Guest",
          bookings: [],
        });
      }

      grouped.get(key).bookings.push(booking);
    }

    return [...grouped.values()]
      .map((guest) => {
        const sorted = [...guest.bookings].sort(
          (a, b) =>
            String(b.createdAt || "").localeCompare(
              String(a.createdAt || "")
            )
        );

        const valid = sorted.filter(
          (booking) => booking.status !== "cancelled"
        );

        return {
          ...guest,
          name: sorted[0]?.guestName || guest.name,
          bookings: sorted,
          bookingCount: sorted.length,
          activeCount: sorted.filter(
            (b) =>
              b.status === "confirmed" ||
              b.status === "checked_in"
          ).length,
          stayCount: valid.length,
          projectedValue: valid.reduce(
            (sum, b) => sum + (Number(b.total) || 0),
            0
          ),
          lastActivity: sorted[0]?.createdAt || "",
          repeat: valid.length >= 2,
        };
      })
      .sort((a, b) =>
        b.lastActivity.localeCompare(a.lastActivity)
      );
  }, [reservations]);

  const visible = guests.filter((guest) => {
    const query = search.toLowerCase().trim();

    const matches =
      !query ||
      `${guest.name} ${guest.email}`
        .toLowerCase()
        .includes(query);

    const matchesFilter =
      filter === "all" ||
      (filter === "repeat" && guest.repeat) ||
      (filter === "active" && guest.activeCount > 0);

    return matches && matchesFilter;
  });

  const selected = guests.find(
    (guest) => guest.key === selectedEmail
  );

  function exportGuests() {
    const rows = [
      [
        "Guest Name",
        "Demo Email",
        "All Bookings",
        "Non-cancelled Bookings",
        "Active Bookings",
        "Projected Booking Value PHP",
      ],
      ...visible.map((guest) => [
        guest.name,
        guest.email,
        guest.bookingCount,
        guest.stayCount,
        guest.activeCount,
        guest.projectedValue,
      ]),
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8",
      })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "your-stay-demo-guests.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const repeatGuests = guests.filter((g) => g.repeat).length;

  return (
    <div className="ys5-page ys6-page">
      <header className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">GUEST RELATIONSHIPS</span>
          <h1>
            The people behind <em>the moments.</em>
          </h1>
          <p>
            Review guest histories and repeat-booking patterns
            within this browser's prototype.
          </p>
        </div>

        <button
          type="button"
          className="ys5-button"
          disabled={!visible.length}
          onClick={exportGuests}
        >
          <Download size={17} />
          Export guests
        </button>
      </header>

      <div className="ys5-stat-grid">
        <article className="ys5-stat-card">
          <div className="ys5-stat-card-top">
            <span>Demo guest profiles</span>
            <Users size={21} />
          </div>
          <strong>{guests.length}</strong>
          <small>Grouped by entered email address</small>
        </article>

        <article className="ys5-stat-card">
          <div className="ys5-stat-card-top">
            <span>Repeat booking profiles</span>
            <UserRound size={21} />
          </div>
          <strong>{repeatGuests}</strong>
          <small>At least two non-cancelled bookings</small>
        </article>

        <article className="ys5-stat-card">
          <div className="ys5-stat-card-top">
            <span>Active guest profiles</span>
            <Mail size={21} />
          </div>
          <strong>
            {guests.filter((g) => g.activeCount > 0).length}
          </strong>
          <small>Have confirmed or checked-in bookings</small>
        </article>
      </div>

      <div className="ys6-guests-layout">
        <section className="ys5-panel">
          <div className="ys5-toolbar">
            <div className="ys5-search">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search guests"
                placeholder="Search name or email..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <select
              className="ys6-select"
              value={filter}
              aria-label="Guest type filter"
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="all">All guests</option>
              <option value="repeat">Repeat bookings</option>
              <option value="active">With active bookings</option>
            </select>
          </div>

          <div className="ys6-guest-list">
            {visible.length === 0 ? (
              <div className="ys5-empty">
                <Users size={27} />
                <p>No guest profiles found.</p>
              </div>
            ) : (
              visible.map((guest) => (
                <button
                  key={guest.key}
                  type="button"
                  className={`ys6-guest-row ${
                    selectedEmail === guest.key
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => setSelectedEmail(guest.key)}
                >
                  <span className="ys6-avatar">
                    {guest.name.charAt(0).toUpperCase()}
                  </span>

                  <span className="ys6-guest-row-info">
                    <strong>{guest.name}</strong>
                    <small>{guest.email || "No email"}</small>
                    <small>
                      {guest.bookingCount} booking(s) ·{" "}
                      {guest.repeat ? "Repeat guest" : "New guest"}
                    </small>
                  </span>

                  <ArrowUpRight size={19} />
                </button>
              ))
            )}
          </div>
        </section>

        <aside className="ys5-panel ys6-guest-detail">
          {!selected ? (
            <div className="ys5-empty">
              <UserRound size={29} />
              <p>
                Select a guest profile to view its demo history.
              </p>
            </div>
          ) : (
            <>
              <div className="ys6-detail-heading">
                <div>
                  <span className="ys5-eyebrow">GUEST PROFILE</span>
                  <h2>{selected.name}</h2>
                </div>
                <button
                  type="button"
                  aria-label="Close guest profile"
                  onClick={() => setSelectedEmail(null)}
                >
                  <X size={19} />
                </button>
              </div>

              <p className="ys6-muted">
                {selected.email || "No email recorded"}
              </p>

              <div className="ys6-guest-metrics">
                <div>
                  <span>Bookings</span>
                  <strong>{selected.bookingCount}</strong>
                </div>
                <div>
                  <span>Non-cancelled</span>
                  <strong>{selected.stayCount}</strong>
                </div>
                <div>
                  <span>Projected value</span>
                  <strong>
                    {formatPeso(selected.projectedValue)}
                  </strong>
                </div>
              </div>

              <h3 className="ys6-subheading">
                Reservation history
              </h3>

              <div className="ys6-guest-history">
                {selected.bookings.map((booking) => {
                  const stay = accommodations.find(
                    (item) =>
                      item.id === booking.accommodationId
                  );

                  return (
                    <article key={booking.id}>
                      <span className="ys5-eyebrow">
                        {booking.id}
                      </span>
                      <strong>
                        {stay?.name || "Accommodation"}
                      </strong>
                      <span>
                        {formatDate(booking.checkIn)} –{" "}
                        {formatDate(booking.checkOut)}
                      </span>
                      <div className="ys6-history-bottom">
                        <span
                          className={`ys5-status ys5-status-${booking.status}`}
                        >
                          {booking.status.replaceAll("_", " ")}
                        </span>
                        <strong>{formatPeso(booking.total)}</strong>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Link
                to="/staff/reservations"
                className="ys5-text-link"
              >
                Open reservation desk
                <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </aside>
      </div>

      <p className="ys5-legal-note">
        Guest identities are based only on typed names and emails.
        These records are not verified customer accounts. No staff
        authentication or server-side privacy controls exist in
        this prototype. Use fictional test information only.
      </p>
    </div>
  );
}