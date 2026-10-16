import {
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Download,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

import {
  formatPeso,
} from "../../data/config.js";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

const PERIODS = [
  { id: "7", label: "7 DAYS" },
  { id: "30", label: "30 DAYS" },
  { id: "90", label: "90 DAYS" },
  { id: "all", label: "ALL RECORDS" },
];

const STATUSES = [
  { id: "confirmed", label: "Confirmed" },
  { id: "checked_in", label: "Checked in" },
  { id: "checked_out", label: "Checked out" },
  { id: "cancelled", label: "Cancelled" },
];

function safeCsv(value) {
  let text = String(value ?? "");

  if (/^[\s]*[=+\-@\t\r]/.test(text)) {
    text = "'" + text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv(rows) {
  const content =
    "\uFEFF" +
    rows
      .map((row) =>
        row.map(safeCsv).join(",")
      )
      .join("\r\n");

  const url = URL.createObjectURL(
    new Blob([content], {
      type: "text/csv;charset=utf-8",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.download =
    "your-stay-demo-intelligence.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

export default function ReportsPage() {
  const {
    reservations,
    accommodations,
  } = useResort();

  const [period, setPeriod] = useState("30");

  const filtered = useMemo(() => {
    if (period === "all") {
      return reservations;
    }

    const cutoff =
      Date.now() -
      Number(period) * 86400000;

    return reservations.filter(
      (booking) =>
        Number.isFinite(
          Date.parse(booking.createdAt)
        ) &&
        Date.parse(booking.createdAt) >= cutoff
    );
  }, [reservations, period]);

  const live = filtered.filter(
    (booking) =>
      booking.status !== "cancelled"
  );

  const booked = live.reduce(
    (sum, booking) =>
      sum + (Number(booking.total) || 0),
    0
  );

  const nights = live.reduce(
    (sum, booking) =>
      sum + (Number(booking.nights) || 0),
    0
  );

  const avg = live.length
    ? booked / live.length
    : 0;

  const performance = accommodations
    .map((stay) => {
      const list = live.filter(
        (booking) =>
          booking.accommodationId === stay.id
      );

      return {
        ...stay,
        count: list.length,

        bookedValue: list.reduce(
          (sum, booking) =>
            sum +
            (Number(booking.total) || 0),
          0
        ),

        nights: list.reduce(
          (sum, booking) =>
            sum +
            (Number(booking.nights) || 0),
          0
        ),
      };
    })
    .sort(
      (a, b) =>
        b.bookedValue - a.bookedValue
    );

  const maxValue = Math.max(
    1,
    ...performance.map(
      (stay) => stay.bookedValue
    )
  );

  const statusCounts = STATUSES.map(
    (status) => ({
      ...status,

      count: filtered.filter(
        (booking) =>
          booking.status === status.id
      ).length,
    })
  );

  const lastDays = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setHours(12, 0, 0, 0);
      date.setDate(
        date.getDate() - (6 - index)
      );

      const key = localDateKey(date);

      return {
        key,

        label: date.toLocaleDateString(
          "en-PH",
          { weekday: "short" }
        ),

        count: filtered.filter(
          (booking) =>
            booking.createdAt &&
            localDateKey(
              new Date(booking.createdAt)
            ) === key
        ).length,
      };
    }
  );

  const maxDay = Math.max(
    1,
    ...lastDays.map(
      (item) => item.count
    )
  );

  const cancelled =
    statusCounts.find(
      (status) =>
        status.id === "cancelled"
    )?.count || 0;

  const cancellationRate = filtered.length
    ? Math.round(
        (cancelled /
          filtered.length) *
          100
      )
    : 0;

  function download() {
    exportCsv([
      [
        "Reference",
        "Residence",
        "Status",
        "Check-in",
        "Check-out",
        "Nights",
        "Guests",
        "Demo booked PHP",
        "Created at",
      ],

      ...filtered.map((booking) => [
        booking.id,

        accommodations.find(
          (stay) =>
            stay.id === booking.accommodationId
        )?.name || "Residence",

        booking.status,
        booking.checkIn,
        booking.checkOut,
        booking.nights,
        booking.guests,
        booking.total,
        booking.createdAt,
      ]),
    ]);
  }

  return (
    <div className="op4-page">
      <div className="op4-page-title">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 06 · RESORT INTELLIGENCE
          </span>

          <h1>
            Clarity in{" "}
            <em>every number.</em>
          </h1>

          <p>
            Analyze fictional booking activity
            and projected demo booking value with
            transparent, browser-only metrics.
          </p>
        </div>

        <button
          type="button"
          className="op4-dark-button"
          onClick={download}
        >
          <Download size={17} />
          EXPORT DEMO CSV
        </button>
      </div>

      {/* PERIOD FILTERS */}

      <div
        className="op4-report-period"
        role="group"
        aria-label="Filter booking period"
      >
        {PERIODS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() =>
              setPeriod(item.id)
            }
            aria-pressed={
              period === item.id
            }
            className={
              period === item.id
                ? "is-current"
                : ""
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* EXECUTIVE METRICS */}

      <section className="op4-metrics op4-report-metrics">
        <article className="op4-metric">
          <div>
            <span>01 / BOOKINGS</span>
            <CalendarDays size={20} />
          </div>

          <strong>
            {filtered.length}
          </strong>

          <small>
            All statuses in selected creation period
          </small>
        </article>

        <article className="op4-metric">
          <div>
            <span>
              02 / BOOKED DEMO VALUE
            </span>

            <TrendingUp size={20} />
          </div>

          <strong>
            {formatPeso(booked)}
          </strong>

          <small>
            Excludes cancelled records;
            not revenue
          </small>
        </article>

        <article className="op4-metric">
          <div>
            <span>03 / DEMO NIGHTS</span>
            <BarChart3 size={20} />
          </div>

          <strong>{nights}</strong>

          <small>
            Non-cancelled booked nights
          </small>
        </article>

        <article className="op4-metric">
          <div>
            <span>04 / AVERAGE VALUE</span>
            <ShieldCheck size={20} />
          </div>

          <strong>
            {formatPeso(avg)}
          </strong>

          <small>
            Mean booked demo value per
            non-cancelled stay
          </small>
        </article>
      </section>

      {/* ANALYTICS CHARTS */}

      <div className="op4-dash-columns">
        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / BOOKING FREQUENCY
              </span>

              <h2>The seven-day pulse.</h2>
            </div>

            <span className="op4-outline-mark">
              CREATED / DAY
            </span>
          </div>

          <div
            className="op4-bars"
            role="img"
            aria-label={lastDays
              .map(
                (item) =>
                  `${item.label}: ${item.count}`
              )
              .join(", ")}
          >
            {lastDays.map((item) => (
              <div
                className="op4-bar-item"
                key={item.key}
              >
                <strong>
                  {item.count}
                </strong>

                <div className="op4-bar-track">
                  <i
                    style={{
                      height: `${
                        (item.count / maxDay) * 100
                      }%`,
                    }}
                  />
                </div>

                <small>
                  {item.label}
                </small>
              </div>
            ))}
          </div>

          <p className="op4-panel-note">
            This chart displays the last seven days
            only, intersected with the selected
            report filter.
          </p>
        </section>

        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                02 / RESERVATION JOURNEY
              </span>

              <h2>Booking status mix.</h2>
            </div>

            <span className="op4-outline-mark">
              {cancellationRate}% CANCELLED
            </span>
          </div>

          <div className="op4-report-status">
            {statusCounts.map(
              (status) => (
                <div key={status.id}>
                  <span>
                    {status.label}
                  </span>

                  <div>
                    <i
                      style={{
                        width: `${
                          filtered.length
                            ? (status.count /
                                filtered.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <strong>
                    {status.count}
                  </strong>
                </div>
              )
            )}
          </div>

          <p className="op4-panel-note">
            Statuses reflect the current status
            of demo bookings created within
            the selected period.
          </p>
        </section>
      </div>

      {/* VILLA PERFORMANCE */}

      <section className="op4-panel op4-performance">
        <div className="op4-panel-head">
          <div>
            <span className="op4-eyebrow">
              03 / VILLA PERFORMANCE
            </span>

            <h2>The residence ledger.</h2>
          </div>

          <Link
            className="op4-text-action"
            to="/staff/villas"
          >
            VILLA OPERATIONS
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="op4-performance-list">
          {performance.map(
            (stay, index) => (
              <div
                key={stay.id}
                className="op4-performance-row"
              >
                <span className="op4-performance-index">
                  0{index + 1}
                </span>

                <img
                  src={stay.images[0]}
                  alt=""
                  loading="lazy"
                />

                <div className="op4-performance-name">
                  <strong>
                    {stay.name}
                  </strong>

                  <small>
                    {stay.count} bookings ·{" "}
                    {stay.nights} nights
                  </small>

                  <div className="op4-performance-track">
                    <i
                      style={{
                        width: `${
                          (stay.bookedValue /
                            maxValue) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <b>
                  {formatPeso(
                    stay.bookedValue
                  )}
                </b>
              </div>
            )
          )}
        </div>
      </section>

      <div className="op4-fine">
        <ShieldCheck size={16} />
        NOT A FINANCIAL STATEMENT · REAL COLLECTED
        REVENUE = ₱0 · NO BACKEND,
        PAYMENT GATEWAY OR LIVE CUSTOMER DATA.
      </div>
    </div>
  );
}