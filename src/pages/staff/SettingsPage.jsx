import { useState } from "react";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Save,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import { BRAND } from "../../data/config.js";
import { useResort } from "../../context/ResortContext.jsx";

const DRAFT_KEY = "your-stay-profile-draft-v1";
const HOUSEKEEPING_KEY = "your-stay-housekeeping-demo-v1";

const EMPTY_PROFILE = {
  businessName: BRAND.name,
  email: "",
  phone: "",
  address: "",
  description: BRAND.description || "",
};

function loadProfile() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(DRAFT_KEY) || "null"
    );

    return saved && typeof saved === "object"
      ? { ...EMPTY_PROFILE, ...saved }
      : { ...EMPTY_PROFILE };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

function downloadJson(name, data) {
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
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

  const [draft, setDraft] = useState(loadProfile);
  const [feedback, setFeedback] = useState("");
  const [resetText, setResetText] = useState("");

  const [resetHousekeeping, setResetHousekeeping] =
    useState(true);

  const hasUnsavedChanges =
    JSON.stringify(draft) !==
    JSON.stringify(loadProfile());

  function update(field, value) {
    setDraft((old) => ({
      ...old,
      [field]: value,
    }));
    setFeedback("");
  }

  function saveDraft(event) {
    event.preventDefault();

    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify(draft)
      );

      setFeedback(
        "Profile draft saved in this browser only."
      );
    } catch {
      setFeedback(
        "Unable to save the draft. Browser storage may be disabled."
      );
    }
  }

  function exportBackup() {
    let housekeeping = [];

    try {
      const parsed = JSON.parse(
        localStorage.getItem(HOUSEKEEPING_KEY) || "[]"
      );

      if (Array.isArray(parsed)) housekeeping = parsed;
    } catch {
      // Ignore invalid optional data.
    }

    downloadJson("your-stay-demo-backup.json", {
      generatedAt: new Date().toISOString(),
      type: "YOUR STAY local demo backup",
      resortState: state,
      profileDraft: draft,
      housekeepingTasks: housekeeping,
    });

    setFeedback("Demo backup downloaded.");
  }

  function resetOperations() {
    if (resetText !== "RESET") {
      setFeedback("Type RESET to enable this action.");
      return;
    }

    if (
      !window.confirm(
        "Permanently reset demo reservations, maintenance blocks, favorites and activity in this browser?"
      )
    ) {
      return;
    }

    const result = actions.resetDemo();

    if (!result.ok) {
      setFeedback(result.error);
      return;
    }

    if (resetHousekeeping) {
      try {
        localStorage.removeItem(HOUSEKEEPING_KEY);
      } catch {
        // Browser storage may be unavailable.
      }
    }

    setResetText("");
    setFeedback(
      "Operational demo data reset. Profile draft was retained."
    );
  }

  return (
    <div className="ys5-page ys6-page">
      <header className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            SYSTEM PREFERENCES / DEMO
          </span>

          <h1>
            Make it <em>your own.</em>
          </h1>

          <p>
            Review the resort setup, prepare business profile
            drafts and manage local demonstration records.
          </p>
        </div>

        <button
          type="button"
          className="ys5-button"
          onClick={exportBackup}
        >
          <Download size={17} />
          Export JSON backup
        </button>
      </header>

      <div className="ys6-settings-grid">
        <div className="ys6-settings-main">
          <section className="ys5-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  BUSINESS PROFILE
                </span>
                <h2>Resort identity</h2>
                <p>
                  Draft business information for a future
                  real-client adaptation.
                </p>
              </div>
              <Settings2 size={22} />
            </div>

            <form onSubmit={saveDraft}>
              <label className="ys5-field">
                <span>BUSINESS NAME</span>
                <input
                  value={draft.businessName}
                  onChange={(e) =>
                    update("businessName", e.target.value)
                  }
                  maxLength={90}
                  required
                />
              </label>

              <div className="ys5-form-grid">
                <label className="ys5-field">
                  <span>BUSINESS EMAIL</span>
                  <input
                    type="email"
                    placeholder="To be configured"
                    value={draft.email}
                    onChange={(e) =>
                      update("email", e.target.value)
                    }
                  />
                </label>

                <label className="ys5-field">
                  <span>PHONE NUMBER</span>
                  <input
                    type="tel"
                    placeholder="To be configured"
                    value={draft.phone}
                    onChange={(e) =>
                      update("phone", e.target.value)
                    }
                    maxLength={30}
                  />
                </label>
              </div>

              <label className="ys5-field">
                <span>BUSINESS LOCATION</span>
                <input
                  value={draft.address}
                  placeholder="Not yet configured"
                  maxLength={180}
                  onChange={(e) =>
                    update("address", e.target.value)
                  }
                />
              </label>

              <label className="ys5-field">
                <span>BRAND DESCRIPTION</span>
                <textarea
                  rows={4}
                  value={draft.description}
                  maxLength={500}
                  onChange={(e) =>
                    update("description", e.target.value)
                  }
                />
              </label>

              <div className="ys6-settings-actions">
                <button className="ys5-button" type="submit">
                  <Save size={17} />
                  Save local draft
                </button>

                <button
                  type="button"
                  className="ys5-button ys5-button-outline"
                  disabled={!hasUnsavedChanges}
                  onClick={() => setDraft(loadProfile())}
                >
                  <RotateCcw size={17} />
                  Discard unsaved edits
                </button>
              </div>

              <p className="ys5-legal-note">
                Changes are draft-only. The public website,
                booking catalog and reservation engine still
                use the values in `src/data/config.js`.
              </p>
            </form>
          </section>

          <section className="ys5-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  OPERATING POLICIES
                </span>
                <h2>Reservation rules</h2>
              </div>
              <ShieldCheck size={22} />
            </div>

            <div className="ys6-policy-list">
              {[
                ["Check-in time", policies.checkInTime],
                ["Check-out time", policies.checkOutTime],
                ["Minimum nights", policies.minimumNights],
                ["Maximum nights", policies.maximumNights],
                [
                  "Booking window",
                  `${policies.maximumAdvanceDays} days`,
                ],
                [
                  "Real payment processing",
                  policies.paymentProcessingEnabled
                    ? "Enabled"
                    : "Not connected",
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <p className="ys5-legal-note">
              These policies are read-only. To change booking
              rules, update the centralized configuration
              and retest the resort engine.
            </p>
          </section>
        </div>

        <aside className="ys6-settings-side">
          <section className="ys5-panel">
            <span className="ys5-eyebrow">
              SYSTEM OVERVIEW
            </span>

            <h2 className="ys6-subheading">
              Local demo records
            </h2>

            <div className="ys6-policy-list">
              {[
                ["Accommodations", accommodations.length],
                ["Reservations", reservations.length],
                ["Maintenance blocks", maintenanceBlocks.length],
                ["Favorites", favorites.length],
                ["Activity events", activity.length],
              ].map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <div className="ys6-system-note">
              <CheckCircle2 size={20} />
              <span>
                {brand.wordmark || "YOUR STAY."}
                <small>
                  Frontend-only demonstration
                </small>
              </span>
            </div>
          </section>

          <section className="ys5-panel ys6-danger-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  DEMO DATA CONTROL
                </span>
                <h2>Reset operations</h2>
              </div>
              <ShieldAlert size={23} />
            </div>

            <p>
              This clears locally saved reservations,
              maintenance blocks, favorites and
              operational activity.
            </p>

            <label className="ys6-reset-check">
              <input
                type="checkbox"
                checked={resetHousekeeping}
                onChange={(e) =>
                  setResetHousekeeping(e.target.checked)
                }
              />
              Also clear housekeeping task data
            </label>

            <label className="ys5-field">
              <span>TYPE RESET TO CONFIRM</span>
              <input
                value={resetText}
                onChange={(e) =>
                  setResetText(e.target.value)
                }
                placeholder="RESET"
                autoComplete="off"
              />
            </label>

            <button
              type="button"
              className="ys6-danger-button"
              onClick={resetOperations}
              disabled={resetText !== "RESET"}
            >
              <Trash2 size={17} />
              Reset demo records
            </button>

            <p className="ys5-legal-note">
              Export a backup first if needed. This resets
              browser-local demo data, not a server database.
            </p>
          </section>
        </aside>
      </div>

      {feedback && (
        <div
          className="ys5-feedback"
          role="status"
          aria-live="polite"
        >
          {feedback}
        </div>
      )}
    </div>
  );
}