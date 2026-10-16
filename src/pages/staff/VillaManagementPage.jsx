import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";

import {
  formatPeso,
  getZone,
} from "../../data/config.js";

import {
  localDateKey,
} from "../../engine/resortEngine.js";

import {
  useResort,
} from "../../context/ResortContext.jsx";

function nextDay(key) {
  const [year, month, day] =
    key.split("-").map(Number);

  return localDateKey(
    new Date(
      year,
      month - 1,
      day + 1,
      12
    )
  );
}

export default function VillaManagementPage() {
  const {
    accommodations,
    reservations,
    maintenanceBlocks,
    actions,
    getAvailability,
  } = useResort();

  const [selectedId, setSelectedId] = useState(
    accommodations[0]?.id || ""
  );

  const [search, setSearch] = useState("");

  const [from, setFrom] = useState(localDateKey);

  const [to, setTo] = useState(
    () => nextDay(localDateKey())
  );

  const [note, setNote] = useState(
    "Preventive maintenance / inspection"
  );

  const [feedback, setFeedback] = useState("");

  const chosen = accommodations.find(
    (stay) => stay.id === selectedId
  );

  const active = reservations.filter(
    (booking) =>
      ["confirmed", "checked_in"].includes(
        booking.status
      )
  );

  const relatedBlocks = maintenanceBlocks
    .filter(
      (block) =>
        block.accommodationId === selectedId
    )
    .sort((a, b) =>
      a.checkIn.localeCompare(b.checkIn)
    );

  const availability = chosen
    ? getAvailability({
        accommodationId: chosen.id,
        checkIn: from,
        checkOut: to,
      })
    : null;

  const visible = accommodations.filter(
    (stay) =>
      `${
        stay.name
      } ${
        stay.category
      } ${
        getZone(stay.zoneId)?.label
      }`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  function choose(id) {
    setSelectedId(id);
    setFeedback("");
  }

  function createBlock(event) {
    event.preventDefault();

    const result = actions.addMaintenanceBlock({
      accommodationId: selectedId,
      checkIn: from,
      checkOut: to,
      note: note.trim(),
    });

    setFeedback(
      result.ok
        ? "Date block added to the local reservation engine."
        : result.error ||
          "Unable to block these dates."
    );
  }

  function removeBlock(id) {
    if (
      !window.confirm(
        "Remove this maintenance block from the local demo?"
      )
    ) {
      return;
    }

    const result =
      actions.removeMaintenanceBlock(id);

    setFeedback(
      result.ok
        ? "Maintenance block removed from local demo."
        : result.error ||
          "Unable to remove block."
    );
  }

  const today = localDateKey();

  return (
    <div className="op4-page">
      <div className="op4-page-title">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 04 · RESIDENCE MANAGEMENT
          </span>

          <h1>
            Four places.{" "}
            <em>Endless attention.</em>
          </h1>

          <p>
            Curate your residence directory
            and manage real demo-engine maintenance
            blocks without changing accommodation
            rates or public content.
          </p>
        </div>

        <Link
          className="op4-dark-button"
          to="/stays"
        >
          VIEW PUBLIC COLLECTION
          <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="op4-villa-grid">
        {/* ARCHITECTURAL PROPERTY INDEX */}

        <section className="op4-panel op4-villa-directory">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / THE ARCHITECTURAL INVENTORY
              </span>

              <h2>The collection.</h2>
            </div>

            <span className="op4-outline-mark">
              04 RESIDENCES
            </span>
          </div>

          <label className="op4-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search a residence or landscape"
              aria-label="Search villas"
            />
          </label>

          <div className="op4-villa-list">
            {visible.map((stay, index) => {
              const isOccupied = active.some(
                (booking) =>
                  booking.accommodationId === stay.id &&
                  booking.status === "checked_in" &&
                  booking.checkIn <= today &&
                  today < booking.checkOut
              );

              const blocked =
                maintenanceBlocks.some(
                  (block) =>
                    block.accommodationId === stay.id &&
                    block.checkIn <= today &&
                    today < block.checkOut
                );

              return (
                <button
                  key={stay.id}
                  type="button"
                  onClick={() =>
                    choose(stay.id)
                  }
                  aria-pressed={
                    selectedId === stay.id
                  }
                  className={`op4-villa-choice ${
                    selectedId === stay.id
                      ? "is-picked"
                      : ""
                  }`}
                >
                  <img
                    src={stay.images[0]}
                    alt=""
                    loading="lazy"
                  />

                  <span>
                    <small>
                      0{index + 1} /{" "}
                      {getZone(
                        stay.zoneId
                      )?.label.toUpperCase()}
                    </small>

                    <strong>{stay.name}</strong>

                    <small>
                      {formatPeso(
                        stay.nightlyRate
                      )}{" "}
                      / NIGHT
                    </small>
                  </span>

                  <b>
                    {isOccupied
                      ? "CHECKED IN"
                      : blocked
                      ? "BLOCKED TODAY"
                      : "VIEW DETAILS"}
                  </b>
                </button>
              );
            })}

            {visible.length === 0 && (
              <p className="op4-muted">
                No matching residences.
              </p>
            )}
          </div>
        </section>

        {/* PROPERTY PRESENTATION */}

        <aside className="op4-villa-detail">
          {chosen && (
            <>
              <div className="op4-villa-large-photo">
                <img
                  src={chosen.images[0]}
                  alt={`Illustrative ${chosen.name}`}
                />

                <span>
                  YOUR STAY / THE VILLA FIELD JOURNAL
                </span>
              </div>

              <div className="op4-panel op4-villa-detail-copy">
                <span className="op4-eyebrow">
                  02 / SELECTED RESIDENCE
                </span>

                <h2>{chosen.name}</h2>
                <p>{chosen.description}</p>

                <div className="op4-villa-facts">
                  <div>
                    <strong>
                      {chosen.sizeSqm} m²
                    </strong>
                    <span>SPACE</span>
                  </div>

                  <div>
                    <strong>
                      {chosen.bedrooms}
                    </strong>
                    <span>BEDROOMS</span>
                  </div>

                  <div>
                    <strong>
                      {chosen.maxGuests}
                    </strong>
                    <span>MAX GUESTS</span>
                  </div>
                </div>

                <div className="op4-villa-detail-meta">
                  <MapPin size={16} />

                  {getZone(
                    chosen.zoneId
                  )?.label}

                  <span>·</span>

                  {
                    active.filter(
                      (booking) =>
                        booking.accommodationId ===
                        chosen.id
                    ).length
                  }{" "}
                  ACTIVE DEMO BOOKINGS
                </div>

                <Link
                  className="op4-text-action"
                  to={`/stays/${chosen.id}`}
                >
                  OPEN PUBLIC PROPERTY JOURNAL
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </>
          )}
        </aside>
      </div>

      {/* MAINTENANCE MANAGEMENT */}

      <div className="op4-operations-grid">
        <section className="op4-panel op4-maintenance-form">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                03 / DATE PROTECTION
              </span>

              <h2>Hold time for care.</h2>
            </div>

            <Wrench size={22} />
          </div>

          <p className="op4-muted">
            A maintenance block prevents new demo
            reservations for those dates. The engine
            rejects conflicts with existing active
            reservations.
          </p>

          <form
            onSubmit={createBlock}
            className="op4-form-grid"
          >
            <label className="op4-field op4-wide">
              RESIDENCE

              <select
                value={selectedId}
                onChange={(event) =>
                  choose(event.target.value)
                }
              >
                {accommodations.map((stay) => (
                  <option
                    key={stay.id}
                    value={stay.id}
                  >
                    {stay.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="op4-field">
              BLOCK FROM

              <input
                required
                type="date"
                min={today}
                value={from}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  setFrom(value);

                  if (
                    value &&
                    to <= value
                  ) {
                    setTo(nextDay(value));
                  }
                }}
              />
            </label>

            <label className="op4-field">
              BLOCK UNTIL

              <input
                required
                type="date"
                min={nextDay(from)}
                value={to}
                onChange={(event) =>
                  setTo(event.target.value)
                }
              />
            </label>

            <label className="op4-field op4-wide">
              REASON / MAX 100 CHARACTERS

              <input
                required
                maxLength={100}
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
              />
            </label>

            <div
              className={`op4-availability op4-wide ${
                availability?.available
                  ? "is-free"
                  : "is-busy"
              }`}
            >
              <ShieldCheck size={17} />

              <span>
                {availability?.reason ||
                  "Choose a valid date range"}
              </span>
            </div>

            <button
              type="submit"
              className="op4-dark-button op4-wide"
            >
              ADD MAINTENANCE BLOCK
              <CalendarDays size={17} />
            </button>
          </form>

          {feedback && (
            <p
              className="op4-feedback"
              role="status"
            >
              {feedback}
            </p>
          )}
        </section>

        {/* MAINTENANCE LOG */}

        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                04 / OPEN MAINTENANCE LOG
              </span>

              <h2>Protected dates.</h2>
            </div>

            <span className="op4-outline-mark">
              {relatedBlocks.length} BLOCKS
            </span>
          </div>

          {relatedBlocks.length ? (
            <div className="op4-maintenance-list">
              {relatedBlocks.map((block) => (
                <div key={block.id}>
                  <span>
                    <b>
                      {block.checkIn} →{" "}
                      {block.checkOut}
                    </b>

                    <small>
                      {block.note}
                    </small>
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeBlock(block.id)
                    }
                    aria-label={`Remove maintenance block ${block.id}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="op4-empty">
              <CheckCircle2 size={24} />
              No maintenance blocks for this residence.
            </div>
          )}

          <Link
            className="op4-text-action"
            to="/staff/calendar"
          >
            INSPECT BOOKING TIMELINE
            <ArrowRight size={16} />
          </Link>
        </section>
      </div>
    </div>
  );
}