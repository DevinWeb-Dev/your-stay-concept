import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Database,
  Download,
  FileJson,
  LockKeyhole,
  RotateCcw,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Waves,
} from "lucide-react";

import { BRAND } from "../../data/config.js";
import { useResort } from "../../context/ResortContext.jsx";

import "../../styles/stay-staff-finish.css";

const PROFILE_KEY = "your-stay-profile-draft-v1";
const HOUSEKEEPING_KEY =
  "your-stay-housekeeping-demo-v1";

const defaultProfile = {
  businessName: BRAND.name,
  email: "",
  phone: "",
  address: "",
  description: BRAND.description || "",
};

function loadProfile() {
  try {
    const value = JSON.parse(
      localStorage.getItem(PROFILE_KEY) || "null"
    );

    return value &&
      typeof value === "object" &&
      !Array.isArray(value)
      ? {
          ...defaultProfile,
          ...Object.fromEntries(
            Object.entries(value).filter(
              ([key]) => key in defaultProfile
            )
          ),
        }
      : { ...defaultProfile };
  } catch {
    return { ...defaultProfile };
  }
}

function getHousekeeping() {
  try {
    const data = JSON.parse(
      localStorage.getItem(HOUSEKEEPING_KEY) ||
        "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function downloadJson(filename, value) {
  const blob = new Blob(
    [JSON.stringify(value, null, 2)],
    {
      type: "application/json;charset=utf-8",
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(
    () => URL.revokeObjectURL(url),
    1000
  );
}

export default function SettingsPage() {
  const {
    brand,
    policies,
    accommodations,
    reservations,
    maintenanceBlocks,
    activity,
    favorites,
    state,
    actions,
  } = useResort();

  const [saved, setSaved] =
    useState(loadProfile);

  const [draft, setDraft] =
    useState(loadProfile);

  const [includeContacts, setIncludeContacts] =
    useState(false);

  const [
    includeHousekeeping,
    setIncludeHousekeeping,
  ] = useState(true);

  const [resetText, setResetText] =
    useState("");

  const [
    resetHousekeeping,
    setResetHousekeeping,
  ] = useState(true);

  const [notice, setNotice] =
    useState("");

  const dirty =
    JSON.stringify(draft) !==
    JSON.stringify(saved);

  function update(key, value) {
    setDraft((old) => ({
      ...old,
      [key]: value,
    }));

    setNotice("");
  }

  function save(event) {
    event.preventDefault();

    try {
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify(draft)
      );

      setSaved({ ...draft });

      setNotice(
        "Profile draft saved in this browser. Public branding and booking rules are unchanged."
      );
    } catch {
      setNotice(
        "Browser storage is unavailable. Draft could not be saved."
      );
    }
  }

  function undo() {
    setDraft({ ...saved });

    setNotice(
      "Unsaved draft changes discarded."
    );
  }

  function exportBackup() {
    const sensitive = includeContacts;

    if (
      sensitive &&
      !window.confirm(
        "This JSON will include the entered guest names and emails. Export only fictional demo data and store the file privately. Continue?"
      )
    ) {
      return;
    }

    const resortState = {
      ...state,

      reservations: (
        state.reservations || []
      ).map((booking) =>
        sensitive
          ? booking
          : {
              ...booking,
              guestName: "[REDACTED]",
              email: "[REDACTED]",
            }
      ),
    };

    const housekeeping =
      includeHousekeeping
        ? getHousekeeping()
        : [];

    const tasks = sensitive
      ? housekeeping
      : housekeeping.map((task) => ({
          ...task,
          description: "[REDACTED]",
        }));

    try {
      downloadJson(
        "your-stay-demo-archive.json",
        {
          type:
            "YOUR STAY / LOCAL CONCEPT ARCHIVE",

          generatedAt:
            new Date().toISOString(),

          isDemo: true,

          containsOriginalGuestContacts:
            sensitive,

          restorableThroughWebsite: false,

          note:
            "Archive only: this portfolio prototype does not provide a restore/import workflow.",

          resortState,

          profileDraft: sensitive
            ? draft
            : {
                ...draft,
                email: "[REDACTED]",
                phone: "[REDACTED]",
                address: "[REDACTED]",
              },

          housekeepingTasks: tasks,
        }
      );

      setNotice(
        "Local demo JSON archive exported. No data was uploaded anywhere."
      );
    } catch {
      setNotice(
        "Could not prepare the JSON archive."
      );
    }
  }

  function resetOperations() {
    if (resetText !== "RESET") {
      setNotice(
        "Type RESET exactly to enable the action."
      );
      return;
    }

    if (
      !window.confirm(
        "Reset all local demo reservations, maintenance blocks, favorites and activity? This cannot be undone. Export an archive first if needed."
      )
    ) {
      return;
    }

    const response = actions.resetDemo();

    if (!response.ok) {
      setNotice(
        response.error ||
          "Unable to reset demo."
      );
      return;
    }

    if (resetHousekeeping) {
      try {
        localStorage.removeItem(
          HOUSEKEEPING_KEY
        );
      } catch {
        setNotice(
          "Resort records reset, but housekeeping storage could not be cleared."
        );

        setResetText("");
        return;
      }
    }

    setResetText("");

    setNotice(
      `Local resort records reset.${
        resetHousekeeping
          ? " Housekeeping tasks cleared for the next visit to the Housekeeping page."
          : " Housekeeping tasks retained."
      } Profile draft retained.`
    );
  }

  const policiesRows = [
    ["Arrival", policies.checkInTime],
    ["Departure", policies.checkOutTime],
    ["Minimum nights", policies.minimumNights],
    ["Maximum nights", policies.maximumNights],
    [
      "Booking window",
      `${policies.maximumAdvanceDays} days`,
    ],
    [
      "Online payments",
      policies.paymentProcessingEnabled
        ? "Enabled"
        : "NOT CONNECTED",
    ],
    [
      "Verified resort location",
      policies.locationVerified
        ? "Verified"
        : "NOT VERIFIED",
    ],
  ];

  const statRows = [
    ["Residences", accommodations.length],
    ["Reservation records", reservations.length],
    [
      "Maintenance windows",
      maintenanceBlocks.length,
    ],
    ["Saved villas", favorites.length],
    ["Activity events", activity.length],
    [
      "Housekeeping tasks",
      getHousekeeping().length,
    ],
  ];

  return (
    <div className="op4-page op5-page op5-settings-page">
      {/* ARCHITECTURAL SETTINGS COVER */}

      <section className="op5-settings-hero">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 08 ·
            THE CONFIGURATION VAULT
          </span>

          <h1>
            Designed down to{" "}
            <em>the details.</em>
          </h1>

          <p>
            A considered home for local profile
            drafts, transparent policies,
            demonstration data exports and
            careful reset controls. Nothing
            here updates a real business or server.
          </p>
        </div>

        <div
          className="op5-settings-hero-graphic"
          aria-hidden="true"
        >
          <span className="op5-graphic-rings" />

          <Settings2
            size={64}
            strokeWidth={0.8}
          />

          <small>
            THE SYSTEM FIELD GUIDE · 08
          </small>
        </div>
      </section>

      {/* SETTINGS CHAPTER NAVIGATION */}

      <div className="op5-settings-nav">
        <a href="#op5-identity">
          01 — BRAND DRAFT
          <ArrowRight size={13} />
        </a>

        <a href="#op5-policies">
          02 — BOOKING POLICIES
          <ArrowRight size={13} />
        </a>

        <a href="#op5-vault">
          03 — THE DATA VAULT
          <ArrowRight size={13} />
        </a>
      </div>

      <div className="op5-settings-grid">
        <div className="op5-settings-primary">
          {/* BRAND PROFILE DRAFT */}

          <section
            id="op5-identity"
            className="op4-panel op5-settings-section"
          >
            <div className="op4-panel-head">
              <div>
                <span className="op4-eyebrow">
                  01 / BRAND & HOSPITALITY IDENTITY
                </span>

                <h2>The identity atelier.</h2>
              </div>

              <span className="op4-outline-mark">
                DRAFT ONLY
              </span>
            </div>

            <p className="op4-muted">
              Prepare client-ready contact
              information without affecting
              the published site. Public pages
              continue to read from{" "}
              <code>
                src/data/config.js
              </code>.
            </p>

            <form
              className="op5-settings-form"
              onSubmit={save}
            >
              <label className="op4-field op5-field-full">
                RESORT / BUSINESS NAME

                <input
                  required
                  maxLength={90}
                  value={draft.businessName}
                  onChange={(e) =>
                    update(
                      "businessName",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="op4-field">
                CONTACT EMAIL

                <input
                  type="email"
                  maxLength={160}
                  placeholder="Not configured"
                  value={draft.email}
                  onChange={(e) =>
                    update(
                      "email",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="op4-field">
                TELEPHONE

                <input
                  type="tel"
                  maxLength={30}
                  placeholder="Not configured"
                  value={draft.phone}
                  onChange={(e) =>
                    update(
                      "phone",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="op4-field op5-field-full">
                LOCATION / ADDRESS

                <input
                  maxLength={180}
                  placeholder="Not verified"
                  value={draft.address}
                  onChange={(e) =>
                    update(
                      "address",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="op4-field op5-field-full">
                BRAND STORY

                <textarea
                  maxLength={500}
                  rows={5}
                  value={draft.description}
                  onChange={(e) =>
                    update(
                      "description",
                      e.target.value
                    )
                  }
                />
              </label>

              <div className="op5-draft-actions">
                <button
                  className="op4-dark-button"
                  type="submit"
                >
                  <Save size={16} />
                  SAVE LOCAL DRAFT
                </button>

                <button
                  className="op5-secondary-action"
                  type="button"
                  disabled={!dirty}
                  onClick={undo}
                >
                  <RotateCcw size={16} />
                  DISCARD UNSAVED
                </button>

                <span
                  className={
                    dirty
                      ? "is-dirty"
                      : ""
                  }
                >
                  {dirty
                    ? "UNSAVED EDITS"
                    : "NO UNSAVED EDITS"}
                </span>
              </div>
            </form>

            {/* LIVE BRAND PREVIEW */}

            <div className="op5-brand-preview">
              <div>
                <Waves size={26} />

                <span>
                  PREVIEW / DRAFT ONLY
                </span>
              </div>

              <h3>
                {draft.businessName ||
                  "YOUR STAY."}
              </h3>

              <p>
                {draft.description ||
                  "A place to stay. A feeling to remember."}
              </p>

              <small>
                {[
                  draft.email,
                  draft.phone,
                  draft.address,
                ]
                  .filter(Boolean)
                  .join("   ·   ") ||
                  "BUSINESS CONTACTS NOT YET CONFIGURED"}
              </small>
            </div>
          </section>

          {/* READ-ONLY ENGINE POLICIES */}

          <section
            id="op5-policies"
            className="op4-panel op5-settings-section"
          >
            <div className="op4-panel-head">
              <div>
                <span className="op4-eyebrow">
                  02 / CENTRAL BOOKING LOGIC
                </span>

                <h2>The house rules.</h2>
              </div>

              <ShieldCheck size={22} />
            </div>

            <div className="op5-policy-list">
              {policiesRows.map(
                ([key, value], index) => (
                  <div key={key}>
                    <span>
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                      {" / "}
                      {key}
                    </span>

                    <strong>{value}</strong>
                  </div>
                )
              )}
            </div>

            <p className="op5-inline-disclaimer">
              <LockKeyhole size={17} />

              READ-ONLY ENGINE VALUES.
              Changes must be made in the
              real source configuration and
              validated against engine tests.
            </p>
          </section>
        </div>

        {/* DEMO DATA CONTROL COLUMN */}

        <aside
          id="op5-vault"
          className="op5-settings-aside"
        >
          <section className="op4-panel op5-vault">
            <span className="op4-eyebrow">
              03 / BROWSER-LOCAL INVENTORY
            </span>

            <h2>
              The data <em>vault.</em>
            </h2>

            <p className="op4-muted">
              Nothing is stored in a business
              database or synchronized between
              devices. These are counts of
              demonstration records in the
              current browser.
            </p>

            <div className="op5-policy-list">
              {statRows.map(
                ([label, count]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{count}</strong>
                  </div>
                )
              )}
            </div>

            <div className="op5-connection-stamp">
              <CheckCircle2 size={19} />

              <span>
                {brand.wordmark ||
                  "YOUR STAY."}

                <small>
                  FRONTEND DEMO · NO SERVER SYNC
                </small>
              </span>
            </div>
          </section>

          {/* PRIVACY-CONSCIOUS ARCHIVE */}

          <section className="op4-panel op5-archive">
            <div className="op4-panel-head">
              <div>
                <span className="op4-eyebrow">
                  04 / SAFE LOCAL EXPORT
                </span>

                <h2>Keep an archive.</h2>
              </div>

              <FileJson size={23} />
            </div>

            <p>
              Download a JSON snapshot for
              inspection. This is{" "}
              <strong>not</strong> a website
              restore/import system.
            </p>

            <label className="op5-checkline">
              <input
                type="checkbox"
                checked={includeContacts}
                onChange={(e) =>
                  setIncludeContacts(
                    e.target.checked
                  )
                }
              />

              Include guest and business
              contact fields
            </label>

            <label className="op5-checkline">
              <input
                type="checkbox"
                checked={includeHousekeeping}
                onChange={(e) =>
                  setIncludeHousekeeping(
                    e.target.checked
                  )
                }
              />

              Include housekeeping tasks
            </label>

            <button
              type="button"
              className="op4-dark-button"
              onClick={exportBackup}
            >
              <Download size={16} />
              DOWNLOAD DEMO JSON
              <ArrowUpRight size={16} />
            </button>

            <small>
              Contact fields are redacted
              by default. Store archives
              privately even when using
              fictional data.
            </small>
          </section>

          {/* CONFIRMED DESTRUCTIVE ACTION */}

          <section className="op4-panel op5-danger">
            <div className="op4-panel-head">
              <div>
                <span className="op4-eyebrow">
                  05 / IRREVERSIBLE DATA ACTION
                </span>

                <h2>Clear the slate.</h2>
              </div>

              <ShieldAlert size={23} />
            </div>

            <p>
              Resets the original frontend
              engine's reservations, maintenance
              windows, saved villas and activity
              log. Draft branding stays intact.
            </p>

            <label className="op5-checkline">
              <input
                type="checkbox"
                checked={resetHousekeeping}
                onChange={(e) =>
                  setResetHousekeeping(
                    e.target.checked
                  )
                }
              />

              Also clear housekeeping tasks
            </label>

            <label className="op4-field">
              TYPE RESET TO CONFIRM

              <input
                type="text"
                autoComplete="off"
                placeholder="RESET"
                value={resetText}
                onChange={(e) =>
                  setResetText(
                    e.target.value
                  )
                }
              />
            </label>

            <button
              className="op5-danger-action"
              type="button"
              disabled={
                resetText !== "RESET"
              }
              onClick={resetOperations}
            >
              <Trash2 size={17} />
              RESET LOCAL OPERATIONS
            </button>

            <p className="op5-inline-disclaimer">
              <Database size={16} />

              This does not delete server data:
              no server exists in this concept.
            </p>
          </section>
        </aside>
      </div>

      {notice && (
        <p
          className="op4-feedback op5-settings-notice"
          role="status"
          aria-live="polite"
        >
          {notice}
        </p>
      )}

      <p className="op5-privacy-note">
        <ShieldCheck size={16} />

        The website's permanent developer
        credit is unchanged:{" "}
        {brand.developerCredit}
      </p>
    </div>
  );
}