import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Waves,
  Wrench,
} from "lucide-react";

import {
  formatPeso,
  PHOTOS,
} from "../../data/config.js";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

function dayOffset(offset) {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);

  return localDateKey(date);
}

function briefDate(key) {
  return new Date(
    `${key}T12:00:00`
  ).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

function Metric({
  index,
  icon: Icon,
  label,
  value,
  note,
}) {
  return (
    <article className="op4-metric">
      <div>
        <span>0{index} / {label}</span>
        <Icon
          size={20}
          strokeWidth={1.4}
        />
      </div>

      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export default function DashboardPage() {
  const {
    accommodations,
    reservations,
    maintenanceBlocks,
    activity,
    stats,
  } = useResort();

  const today = dayOffset(0);

  const occupied = reservations.filter(
    (booking) =>
      booking.status === "checked_in" &&
      booking.checkIn <= today &&
      today < booking.checkOut
  );

  const arrivals = reservations
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        booking.checkIn >= today
    )
    .sort((a, b) =>
      a.checkIn.localeCompare(b.checkIn)
    )
    .slice(0, 4);

  const counts = Array.from(
    { length: 7 },
    (_, index) => {
      const key = dayOffset(index - 6);

      return {
        key,

        label: new Date(
          `${key}T12:00:00`
        ).toLocaleDateString("en-PH", {
          weekday: "short",
        }),

        count: reservations.filter(
          (booking) =>
            booking.createdAt &&
            localDateKey(
              new Date(booking.createdAt)
            ) === key
        ).length,
      };
    }
  );

  const peak = Math.max(
    1,
    ...counts.map((item) => item.count)
  );

  const occupiedIds = new Set(
    occupied.map(
      (booking) => booking.accommodationId
    )
  );

  const blockedIds = new Set(
    maintenanceBlocks
      .filter(
        (block) =>
          block.checkIn <= today &&
          today < block.checkOut
      )
      .map(
        (block) => block.accommodationId
      )
  );

  const stayName = (id) =>
    accommodations.find(
      (stay) => stay.id === id
    )?.name || "Residence";

  const recent = [...activity]
    .reverse()
    .slice(0, 4);

  return (
    <div className="op4-page">
      {/* CINEMATIC COMMAND CENTER */}

      <section className="op4-dash-hero">
        <div>
          <span className="op4-eyebrow">
            THE PRIVATE OPERATIONS JOURNAL / 01
          </span>

          <h1>
            Good mornings begin{" "}
            <em>behind the scenes.</em>
          </h1>

          <p>
            An architectural overview of arrivals,
            reservations, residence readiness and the
            details that make a stay feel effortless.
          </p>

          <div className="op4-hero-actions">
            <Link to="/staff/reservations">
              OPEN RESERVATION DESK
              <ArrowUpRight size={17} />
            </Link>

            <Link to="/staff/calendar">
              VIEW CALENDAR
              <CalendarDays size={17} />
            </Link>
          </div>
        </div>

        <div className="op4-hero-visual">
          <img
            src={PHOTOS.pool}
            alt="Illustrative private resort pool"
          />

          <div
            className="op4-orbit"
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
          </div>

          <div className="op4-hero-visual-label">
            YS / RESORT OPERATIONS — DEMO
          </div>
        </div>
      </section>

      <div className="op4-briefline">
        <span>
          OPERATIONS BRIEF /{" "}
          {briefDate(today).toUpperCase()}
        </span>

        <span>
          ALL FIGURES ARE LOCAL DEMONSTRATION RECORDS
        </span>
      </div>

      {/* OPERATIONAL METRICS */}

      <section
        className="op4-metrics"
        aria-label="Resort operational metrics"
      >
        <Metric
          index={1}
          icon={CalendarDays}
          label="DEMO BOOKINGS"
          value={stats.totalReservations}
          note="Includes all historical statuses"
        />

        <Metric
          index={2}
          icon={CheckCircle2}
          label="ACTIVE RESERVATIONS"
          value={stats.activeReservations}
          note="Confirmed and checked in"
        />

        <Metric
          index={3}
          icon={BedDouble}
          label="CURRENTLY CHECKED IN"
          value={occupied.length}
          note={`Of ${accommodations.length} concept residences`}
        />

        <Metric
          index={4}
          icon={CircleDollarSign}
          label="BOOKED DEMO VALUE"
          value={formatPeso(stats.bookedDemoValue)}
          note="Not collected revenue"
        />
      </section>

      {/* BOOKINGS + VILLA READINESS */}

      <div className="op4-dash-columns">
        <section className="op4-panel op4-chart-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                02 / BOOKING PULSE
              </span>

              <h2>The last seven days.</h2>
            </div>

            <span className="op4-outline-mark">
              07 DAYS
            </span>
          </div>

          <div
            className="op4-bars"
            role="img"
            aria-label={counts
              .map(
                (item) =>
                  `${item.label}: ${item.count} reservations`
              )
              .join(", ")}
          >
            {counts.map((item) => (
              <div
                className="op4-bar-item"
                key={item.key}
              >
                <strong>{item.count}</strong>

                <div className="op4-bar-track">
                  <i
                    style={{
                      height: `${
                        (item.count / peak) * 100
                      }%`,
                    }}
                  />
                </div>

                <small>{item.label}</small>
              </div>
            ))}
          </div>

          <p className="op4-panel-note">
            Counted by local reservation creation
            date, including subsequently cancelled
            records.
          </p>
        </section>

        <section className="op4-panel op4-occupancy">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                03 / THE RESIDENCE KEY
              </span>

              <h2>Today's room status.</h2>
            </div>

            <Waves size={24} />
          </div>

          <div className="op4-occupancy-number">
            <strong>
              {accommodations.length
                ? Math.round(
                    (occupied.length /
                      accommodations.length) *
                      100
                  )
                : 0}
              %
            </strong>

            <span>
              CHECKED-IN SHARE
              <br />
              OF FOUR DEMO RESIDENCES
            </span>
          </div>

          <div className="op4-room-stack">
            {accommodations.map(
              (stay, index) => (
                <div
                  key={stay.id}
                  className="op4-room-row"
                >
                  <span>0{index + 1}</span>

                  <strong>{stay.name}</strong>

                  <b
                    className={
                      occupiedIds.has(stay.id)
                        ? "is-occupied"
                        : blockedIds.has(stay.id)
                        ? "is-blocked"
                        : "is-clear"
                    }
                  >
                    {occupiedIds.has(stay.id)
                      ? "CHECKED IN"
                      : blockedIds.has(stay.id)
                      ? "MAINTENANCE"
                      : "NO GUEST CHECKED IN"}
                  </b>
                </div>
              )
            )}
          </div>

          <Link
            className="op4-text-action"
            to="/staff/villas"
          >
            OPEN VILLA OPERATIONS
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      {/* ARRIVALS + ACTIVITY */}

      <div className="op4-dash-columns op4-dash-columns--secondary">
        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                04 / THE ARRIVAL SHEET
              </span>

              <h2>Next arrivals.</h2>
            </div>

            <Clock3 size={22} />
          </div>

          {arrivals.length ? (
            <div className="op4-arrivals">
              {arrivals.map((booking) => (
                <div key={booking.id}>
                  <time dateTime={booking.checkIn}>
                    {briefDate(booking.checkIn)}
                  </time>

                  <span>
                    <strong>
                      {stayName(
                        booking.accommodationId
                      )}
                    </strong>

                    <small>
                      {booking.guestName} ·{" "}
                      {booking.guests} guests ·{" "}
                      {booking.id}
                    </small>
                  </span>

                  <ArrowUpRight size={17} />
                </div>
              ))}
            </div>
          ) : (
            <div className="op4-empty">
              No future confirmed arrivals in this
              browser.

              <Link to="/booking">
                Create a demo stay
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          <Link
            className="op4-text-action"
            to="/staff/reservations"
          >
            GO TO RESERVATION DESK
            <ArrowUpRight size={16} />
          </Link>
        </section>

        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                05 / THE HOUSE LOG
              </span>

              <h2>Recent activity.</h2>
            </div>

            <Wrench size={22} />
          </div>

          {recent.length ? (
            <div className="op4-activity">
              {recent.map((entry) => (
                <div key={entry.id}>
                  <span className="op4-activity-dot" />

                  <div>
                    <strong>
                      {entry.action.replaceAll(
                        "_",
                        " "
                      )}
                    </strong>

                    <small>
                      {entry.description}
                    </small>
                  </div>

                  <time>
                    {new Date(
                      entry.timestamp
                    ).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <div className="op4-empty">
              Your local activity journal is empty.
              Reservation and maintenance actions
              will appear here.
            </div>
          )}

          <Link
            className="op4-text-action"
            to="/staff/reports"
          >
            EXPLORE PERFORMANCE
            <ArrowUpRight size={16} />
          </Link>
        </section>
      </div>

      <div className="op4-fine">
        <CheckCircle2 size={16} />

        DEMO-ONLY DASHBOARD · REVENUE COLLECTED:{" "}
        {formatPeso(stats.collectedRevenue)} ·
        NO LIVE BOOKINGS OR PAYMENTS
      </div>
    </div>
  );
}