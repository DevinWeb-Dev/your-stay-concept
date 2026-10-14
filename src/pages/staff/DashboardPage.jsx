import { useMemo } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import {
  formatPeso,
  PHOTOS,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T12:00:00`).toLocaleDateString(
    "en-PH",
    { month: "short", day: "numeric", year: "numeric" }
  );
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <article className="ys5-stat-card">
      <div className="ys5-stat-card-top">
        <span>{label}</span>
        <Icon size={21} strokeWidth={1.5} />
      </div>

      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function DashboardPage() {
  const {
    stats,
    reservations,
    maintenanceBlocks,
    accommodations,
    activity,
  } = useResort();

  const today = localDateKey();

  const arrivals = useMemo(
    () =>
      reservations
        .filter(
          (item) =>
            item.status === "confirmed" &&
            item.checkIn >= today
        )
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
        .slice(0, 5),
    [reservations, today]
  );

  const currentlyOccupied = useMemo(
    () =>
      reservations.filter(
        (item) => item.status === "checked_in"
      ),
    [reservations]
  );

  const bookingActivity = useMemo(() => {
    const result = [];

    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      const key = localDateKey(date);

      const count = reservations.filter((item) => {
        return (
          item.createdAt &&
          localDateKey(new Date(item.createdAt)) === key
        );
      }).length;

      result.push({
        key,
        label: date.toLocaleDateString("en-PH", {
          weekday: "short",
        }),
        count,
      });
    }

    return result;
  }, [reservations]);

  const maxCount = Math.max(
    1,
    ...bookingActivity.map((item) => item.count)
  );

  const latestActivity = [...activity]
    .reverse()
    .slice(0, 6);

  const occupiedCount = currentlyOccupied.length;

  const occupancyPct = accommodations.length
    ? Math.round(
        (occupiedCount / accommodations.length) * 100
      )
    : 0;

  const getStayName = (id) =>
    accommodations.find((stay) => stay.id === id)?.name ||
    "Resort accommodation";

  return (
    <div className="ys5-page">
      <div className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            THE RESORT AT A GLANCE
          </span>

          <h1>
            A clearer view of <em>every stay.</em>
          </h1>

          <p>
            A refined operational overview of your
            browser's YOUR STAY demonstration records.
          </p>
        </div>

        <Link
          className="ys5-button"
          to="/staff/reservations"
        >
          Manage reservations <ArrowUpRight size={17} />
        </Link>
      </div>

      <section className="ys5-stat-grid" aria-label="Resort metrics">
        <StatCard
          icon={CalendarDays}
          label="Total demo reservations"
          value={stats.totalReservations}
          detail="Including cancelled reservations"
        />

        <StatCard
          icon={CheckCircle2}
          label="Active reservations"
          value={stats.activeReservations}
          detail="Confirmed and checked-in"
        />

        <StatCard
          icon={BedDouble}
          label="Currently checked-in"
          value={stats.checkedIn}
          detail="Based on demo booking statuses"
        />

        <StatCard
          icon={DollarSign}
          label="Demo booking value"
          value={formatPeso(stats.bookedDemoValue)}
          detail="Not collected revenue"
        />
      </section>

      <div className="ys5-dashboard-grid">
        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">
                LAST SEVEN DAYS
              </span>
              <h2>Booking activity</h2>
              <p>Reservations created per calendar day</p>
            </div>
            <CalendarDays size={22} />
          </div>

          <div
            className="ys5-chart"
            role="img"
            aria-label={`Seven-day reservation counts: ${bookingActivity
              .map((item) => `${item.label} ${item.count}`)
              .join(", ")}`}
          >
            {bookingActivity.map((item) => (
              <div className="ys5-chart-column" key={item.key}>
                <strong>{item.count}</strong>
                <div className="ys5-chart-track">
                  <div
                    className="ys5-chart-bar"
                    style={{
                      height: `${
                        (item.count / maxCount) * 100
                      }%`,
                    }}
                  />
                </div>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <p className="ys5-panel-footnote">
            Chart includes demo reservations, including
            those subsequently cancelled.
          </p>
        </section>

        <section className="ys5-panel ys5-occupancy-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">
                PROPERTY SNAPSHOT
              </span>
              <h2>Occupancy overview</h2>
            </div>
            <Users size={22} />
          </div>

          <div className="ys5-occupancy-number">
            {occupancyPct}<span>%</span>
          </div>

          <div
            className="ys5-progress"
            role="progressbar"
            aria-valuenow={occupancyPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Checked-in villa percentage"
          >
            <div style={{ width: `${occupancyPct}%` }} />
          </div>

          <div className="ys5-occupancy-details">
            <div>
              <span>Checked in</span>
              <strong>{occupiedCount}</strong>
            </div>
            <div>
              <span>Total listed units</span>
              <strong>{accommodations.length}</strong>
            </div>
            <div>
              <span>Maintenance blocks</span>
              <strong>{maintenanceBlocks.length}</strong>
            </div>
          </div>

          <Link to="/staff/villas" className="ys5-text-link">
            Manage villa availability
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>

      <div className="ys5-dashboard-grid">
        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">
                YOUR UPCOMING GUESTS
              </span>
              <h2>Expected arrivals</h2>
            </div>

            <Link to="/staff/reservations" className="ys5-text-link">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {arrivals.length === 0 ? (
            <div className="ys5-empty">
              <Clock3 size={29} />
              <p>No upcoming demo arrivals yet.</p>
            </div>
          ) : (
            <div className="ys5-list">
              {arrivals.map((booking) => (
                <div className="ys5-list-item" key={booking.id}>
                  <div className="ys5-list-avatar">
                    {booking.guestName?.charAt(0) || "G"}
                  </div>

                  <div className="ys5-list-copy">
                    <strong>{booking.guestName}</strong>
                    <span>
                      {getStayName(booking.accommodationId)}
                    </span>
                  </div>

                  <div className="ys5-list-end">
                    <strong>{formatDate(booking.checkIn)}</strong>
                    <span>{booking.guests} guests</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">
                ACTIVITY STREAM
              </span>
              <h2>Recent operations</h2>
            </div>
            <Sparkles size={22} />
          </div>

          {latestActivity.length === 0 ? (
            <div className="ys5-empty">
              <ShieldCheck size={29} />
              <p>No operational activity recorded yet.</p>
            </div>
          ) : (
            <div className="ys5-activity-list">
              {latestActivity.map((item) => (
                <div key={item.id}>
                  <span className="ys5-activity-dot" />
                  <div>
                    <strong>
                      {item.action.replaceAll("_", " ")}
                    </strong>
                    <p>{item.description}</p>
                    <small>
                      {new Date(item.timestamp)
                        .toLocaleString("en-PH")}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="ys5-banner">
        <div>
          <span className="ys5-eyebrow">
            HOUSEKEEPING & TURNOVER
          </span>
          <h2>
            Every arrival begins with <em>attention to detail.</em>
          </h2>
          <p>
            Coordinate turnover tasks and prepare each villa
            for the next guest.
          </p>
          <Link className="ys5-button ys5-button-light" to="/staff/housekeeping">
            Open housekeeping <ArrowUpRight size={17} />
          </Link>
        </div>
        <img
          src={PHOTOS.terrace}
          alt="Illustrative resort suite and terrace"
        />
      </section>
    </div>
  );
}