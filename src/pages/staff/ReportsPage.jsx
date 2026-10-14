import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  TrendingUp,
  Users,
} from "lucide-react";

import { formatPeso } from "../../data/config.js";
import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

const PERIODS = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "all", label: "All time" },
];

function amount(value) {
  return Number(value) || 0;
}

function csvCell(value) {
  let text = String(value ?? "");

  // Prevent spreadsheet applications from interpreting text as formulas.
  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <article className="ys5-stat-card">
      <div className="ys5-stat-card-top">
        <span>{label}</span>
        <Icon size={20} />
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function ReportsPage() {
  const { reservations, accommodations } = useResort();
  const [period, setPeriod] = useState("30");

  const filtered = useMemo(() => {
    if (period === "all") return reservations;

    const cutoff =
      Date.now() - Number(period) * 24 * 60 * 60 * 1000;

    return reservations.filter((booking) => {
      const timestamp = Date.parse(booking.createdAt);
      return Number.isFinite(timestamp) && timestamp >= cutoff;
    });
  }, [reservations, period]);

  const confirmed = filtered.filter(
    (r) => r.status === "confirmed"
  );
  const checkedIn = filtered.filter(
    (r) => r.status === "checked_in"
  );
  const checkedOut = filtered.filter(
    (r) => r.status === "checked_out"
  );
  const cancelled = filtered.filter(
    (r) => r.status === "cancelled"
  );

  const nonCancelled = filtered.filter(
    (r) => r.status !== "cancelled"
  );

  const projectedValue = nonCancelled.reduce(
    (sum, r) => sum + amount(r.total),
    0
  );

  const averageBooking = nonCancelled.length
    ? projectedValue / nonCancelled.length
    : 0;

  const cancellationRate = filtered.length
    ? Math.round((cancelled.length / filtered.length) * 100)
    : 0;

  const performance = accommodations.map((stay) => {
    const matching = nonCancelled.filter(
      (r) => r.accommodationId === stay.id
    );

    return {
      ...stay,
      bookings: matching.length,
      value: matching.reduce(
        (sum, r) => sum + amount(r.total),
        0
      ),
      nights: matching.reduce(
        (sum, r) => sum + (Number(r.nights) || 0),
        0
      ),
    };
  }).sort((a, b) => b.value - a.value);

  const chartDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (6 - i));

      const key = localDateKey(date);

      return {
        key,
        label: date.toLocaleDateString("en-PH", {
          weekday: "short",
        }),
        count: filtered.filter((booking) => {
          if (!booking.createdAt) return false;

          const created = new Date(booking.createdAt);

          return (
            !Number.isNaN(created.getTime()) &&
            localDateKey(created) === key
          );
        }).length,
      };
    });
  }, [filtered]);

  const maxChart = Math.max(
    1,
    ...chartDays.map((d) => d.count)
  );

  const statuses = [
    {
      label: "Confirmed",
      count: confirmed.length,
      color: "confirmed",
    },
    {
      label: "Checked in",
      count: checkedIn.length,
      color: "checked_in",
    },
    {
      label: "Checked out",
      count: checkedOut.length,
      color: "checked_out",
    },
    {
      label: "Cancelled",
      count: cancelled.length,
      color: "cancelled",
    },
  ];

  function exportReport() {
    const rows = [
      [
        "Reference",
        "Created At",
        "Accommodation",
        "Check-in",
        "Check-out",
        "Guest Count",
        "Status",
        "Booking Value PHP",
      ],
      ...filtered.map((booking) => [
        booking.id,
        booking.createdAt,
        accommodations.find(
          (stay) => stay.id === booking.accommodationId
        )?.name || "Unknown",
        booking.checkIn,
        booking.checkOut,
        booking.guests,
        booking.status,
        amount(booking.total),
      ]),
    ];

    downloadCsv("your-stay-booking-report.csv", rows);
  }

  return (
    <div className="ys5-page ys6-page">
      <header className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            BUSINESS INTELLIGENCE / DEMO DATA
          </span>
          <h1>
            The numbers behind <em>every escape.</em>
          </h1>
          <p>
            Explore booking activity, villa performance and
            projected reservation value.
          </p>
        </div>

        <button
          type="button"
          className="ys5-button"
          onClick={exportReport}
          disabled={!filtered.length}
        >
          <Download size={17} />
          Export CSV
        </button>
      </header>

      <div className="ys6-toolbar">
        <div className="ys6-segments" role="group" aria-label="Report period">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              className={period === item.id ? "is-active" : ""}
              onClick={() => setPeriod(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <span className="ys6-muted">
          Filtered by date reservation was created
        </span>
      </div>

      <section className="ys5-stat-grid">
        <Metric
          icon={CalendarDays}
          label="Reservations"
          value={filtered.length}
          detail="Total demo booking records"
        />
        <Metric
          icon={TrendingUp}
          label="Projected booking value"
          value={formatPeso(projectedValue)}
          detail="Not payments or collected revenue"
        />
        <Metric
          icon={BarChart3}
          label="Average booking value"
          value={formatPeso(averageBooking)}
          detail="Excludes cancelled reservations"
        />
        <Metric
          icon={Users}
          label="Cancellation rate"
          value={`${cancellationRate}%`}
          detail="Percentage of selected bookings"
        />
      </section>

      <div className="ys5-dashboard-grid">
        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">LAST 7 DAYS</span>
              <h2>Reservation activity</h2>
              <p>Count of bookings created each day</p>
            </div>
            <BarChart3 size={23} />
          </div>

          <div
            className="ys6-chart"
            role="img"
            aria-label={
              "Daily booking counts: " +
              chartDays.map((d) => `${d.label} ${d.count}`).join(", ")
            }
          >
            {chartDays.map((day) => (
              <div className="ys6-chart-col" key={day.key}>
                <strong>{day.count}</strong>
                <div className="ys6-chart-track">
                  <div
                    className="ys6-chart-bar"
                    style={{
                      height: `${(day.count / maxChart) * 100}%`,
                    }}
                  />
                </div>
                <small>{day.label}</small>
              </div>
            ))}
          </div>

          <p className="ys5-legal-note">
            Activity includes cancelled reservations.
            No sample bookings are fabricated.
          </p>
        </section>

        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">BOOKING HEALTH</span>
              <h2>Status distribution</h2>
            </div>
          </div>

          <div className="ys6-status-list">
            {statuses.map((item) => (
              <div key={item.label}>
                <div className="ys6-status-heading">
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className="ys6-status-track">
                  <div
                    className={`ys6-status-fill ys6-${item.color}`}
                    style={{
                      width: `${
                        filtered.length
                          ? (item.count / filtered.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="ys5-panel">
        <div className="ys5-panel-heading">
          <div>
            <span className="ys5-eyebrow">THE COLLECTION</span>
            <h2>Accommodation performance</h2>
            <p>Based on non-cancelled demo bookings</p>
          </div>
        </div>

        <div className="ys6-report-table-wrap">
          <table className="ys6-table">
            <thead>
              <tr>
                <th>Accommodation</th>
                <th>Bookings</th>
                <th>Reserved nights</th>
                <th>Projected value</th>
              </tr>
            </thead>
            <tbody>
              {performance.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="ys6-table-stay">
                      <img src={item.images[0]} alt="" />
                      <strong>{item.name}</strong>
                    </div>
                  </td>
                  <td>{item.bookings}</td>
                  <td>{item.nights}</td>
                  <td>{formatPeso(item.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="ys5-legal-note">
          This is reservation value, not recognized
          revenue. There is no payment processing or
          accounting backend.
        </p>
      </section>

      <div className="ys6-bottom-link">
        <Link className="ys5-text-link" to="/staff/reservations">
          Review reservations <ArrowUpRight size={17} />
        </Link>
      </div>
    </div>
  );
}