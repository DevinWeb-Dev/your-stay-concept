import { useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Ban,
  Building2,
  CalendarDays,
  CheckCircle2,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
} from "lucide-react";

import { formatPeso } from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

export default function VillaManagementPage() {
  const {
    accommodations,
    reservations,
    maintenanceBlocks,
    actions,
    getAvailability,
  } = useResort();

  const today = localDateKey();
  const tomorrow = addDays(today, 1);

  const [selectedId, setSelectedId] = useState(
    accommodations[0]?.id || ""
  );
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [note, setNote] = useState("Maintenance / inspection");
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  const stay = accommodations.find(
    (item) => item.id === selectedId
  );

  const availability = stay
    ? getAvailability({
        accommodationId: stay.id,
        checkIn,
        checkOut,
      })
    : { available: false, reason: "Choose a villa." };

  const visible = accommodations.filter((item) =>
    `${item.name} ${item.category} ${item.zoneId}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const maintenanceForSelected = maintenanceBlocks.filter(
    (block) => block.accommodationId === selectedId
  );

  const totalConfirmed = reservations.filter(
    (booking) =>
      booking.accommodationId === selectedId &&
      ["confirmed", "checked_in"].includes(booking.status)
  ).length;

  function updateStart(value) {
    setCheckIn(value);

    if (value && checkOut <= value) {
      setCheckOut(addDays(value, 1));
    }
  }

  function createBlock(event) {
    event.preventDefault();
    setFeedback("");

    const result = actions.addMaintenanceBlock({
      accommodationId: selectedId,
      checkIn,
      checkOut,
      note: note.trim(),
    });

    setFeedback(
      result.ok
        ? "Maintenance date block saved in local demo data."
        : result.error || "Unable to block these dates."
    );
  }

  function deleteBlock(block) {
    if (
      !window.confirm(
        `Remove maintenance block for ${block.checkIn} to ${block.checkOut}?`
      )
    ) {
      return;
    }

    const result = actions.removeMaintenanceBlock(block.id);

    setFeedback(
      result.ok
        ? "Maintenance block removed."
        : result.error || "Unable to remove block."
    );
  }

  return (
    <div className="ys5-page">
      <div className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            ACCOMMODATION OPERATIONS
          </span>
          <h1>
            Every villa, <em>perfectly considered.</em>
          </h1>
          <p>
            Review accommodation details and manage
            blocked dates within this resort prototype.
          </p>
        </div>

        <Link className="ys5-button" to="/stays">
          View public villas <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="ys5-villa-layout">
        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">THE COLLECTION</span>
              <h2>Villa directory</h2>
            </div>
            <Building2 size={22} />
          </div>

          <div className="ys5-search">
            <Search size={17} />
            <input
              type="search"
              placeholder="Search accommodations..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search accommodations"
            />
          </div>

          <div className="ys5-villa-list">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`ys5-villa-option ${
                  item.id === selectedId ? "is-active" : ""
                }`}
                onClick={() => {
                  setSelectedId(item.id);
                  setFeedback("");
                }}
              >
                <img
                  src={item.images[0]}
                  alt={`Illustrative ${item.name}`}
                />

                <span>
                  <strong>{item.name}</strong>
                  <small>
                    {item.maxGuests} guests ·{" "}
                    {formatPeso(item.nightlyRate)}/night
                  </small>
                </span>

                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
        </section>

        <div className="ys5-villa-detail-stack">
          {stay && (
            <section className="ys5-panel">
              <div className="ys5-panel-heading">
                <div>
                  <span className="ys5-eyebrow">
                    SELECTED ACCOMMODATION
                  </span>
                  <h2>{stay.name}</h2>
                  <p>{stay.description}</p>
                </div>
                <ShieldCheck size={22} />
              </div>

              <div className="ys5-villa-detail-photo">
                <img
                  src={stay.images[0]}
                  alt={`Illustrative ${stay.name}`}
                />
              </div>

              <div className="ys5-villa-facts">
                <div>
                  <span>Nightly demo rate</span>
                  <strong>{formatPeso(stay.nightlyRate)}</strong>
                </div>
                <div>
                  <span>Maximum guests</span>
                  <strong>{stay.maxGuests}</strong>
                </div>
                <div>
                  <span>Bedrooms</span>
                  <strong>{stay.bedrooms}</strong>
                </div>
                <div>
                  <span>Active demo bookings</span>
                  <strong>{totalConfirmed}</strong>
                </div>
              </div>

              <p className="ys5-legal-note">
                Rates and descriptions are read from the fixed
                Batch 1 catalog. Editing those values would
                require updating `src/data/config.js` or
                extending the shared engine in a later batch.
              </p>
            </section>
          )}

          <section className="ys5-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  BOOKING CONTROL
                </span>
                <h2>Date availability</h2>
                <p>
                  Check availability and create maintenance
                  blocks for the selected villa.
                </p>
              </div>
              <Wrench size={22} />
            </div>

            <form onSubmit={createBlock}>
              <div className="ys5-form-grid">
                <label className="ys5-field">
                  <span>START DATE</span>
                  <input
                    required
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(event) =>
                      updateStart(event.target.value)
                    }
                  />
                </label>

                <label className="ys5-field">
                  <span>END DATE</span>
                  <input
                    required
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(event) =>
                      setCheckOut(event.target.value)
                    }
                  />
                </label>
              </div>

              <div className="ys5-availability-result">
                {availability.available ? (
                  <>
                    <CheckCircle2 size={19} />
                    <span>
                      Available in local demo records
                    </span>
                  </>
                ) : (
                  <>
                    <Ban size={19} />
                    <span>{availability.reason}</span>
                  </>
                )}
              </div>

              <label className="ys5-field">
                <span>MAINTENANCE NOTE</span>
                <input
                  type="text"
                  value={note}
                  maxLength={100}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="e.g. Pool inspection"
                />
              </label>

              <button
                type="submit"
                className="ys5-button"
                disabled={!stay || !availability.available}
              >
                <Ban size={17} />
                Block these dates
              </button>

              {feedback && (
                <p className="ys5-feedback" role="status">
                  {feedback}
                </p>
              )}
            </form>

            <div className="ys5-panel-subheading">
              <h3>Existing maintenance blocks</h3>
              <span>
                {maintenanceForSelected.length} records
              </span>
            </div>

            {maintenanceForSelected.length === 0 ? (
              <div className="ys5-empty">
                <CalendarDays size={27} />
                <p>No date blocks for this villa.</p>
              </div>
            ) : (
              <div className="ys5-block-list">
                {maintenanceForSelected.map((block) => (
                  <div key={block.id}>
                    <div>
                      <strong>{block.note}</strong>
                      <span>
                        {block.checkIn} → {block.checkOut}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteBlock(block)}
                      aria-label={`Remove ${block.note} block`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <p className="ys5-legal-note">
        Maintenance blocks affect future demo booking
        availability. Existing active bookings cannot be
        overlapped by a new maintenance block.
        All changes are browser-local only.
      </p>
    </div>
  );
}