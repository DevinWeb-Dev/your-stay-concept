import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Check,
  ClipboardCheck,
  Clock3,
  Plus,
  Sparkles,
  Waves,
  Wrench,
} from "lucide-react";

import {
  useResort,
} from "../../context/ResortContext.jsx";

// Preserve existing housekeeping tasks.
const STORAGE_KEY =
  "your-stay-housekeeping-demo-v1";

const STAGES = [
  {
    id: "pending",
    label: "To prepare",
  },
  {
    id: "in_progress",
    label: "In progress",
  },
  {
    id: "ready",
    label: "Ready / completed",
  },
];

function loadTasks() {
  try {
    const value = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(value)
      ? value
      : [];
  } catch {
    return [];
  }
}

export default function HousekeepingPage() {
  const {
    accommodations,
    reservations,
    maintenanceBlocks,
  } = useResort();

  const [tasks, setTasks] = useState(loadTasks);
  const [filter, setFilter] = useState("all");

  const [stayId, setStayId] = useState(
    accommodations[0]?.id || ""
  );

  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState("");

  // Automatically prepare checkout turnover tasks.
  useEffect(() => {
    const checkedOut = reservations.filter(
      (booking) =>
        booking.status === "checked_out"
    );

    setTasks((current) => {
      const exists = new Set(
        current.map((task) => task.id)
      );

      const incoming = checkedOut
        .filter(
          (booking) =>
            !exists.has(
              `turnover:${booking.id}`
            )
        )
        .map((booking) => ({
          id: `turnover:${booking.id}`,
          accommodationId:
            booking.accommodationId,
          title: "Post-checkout room turnover",
          description:
            `Prepare the room after booking ${booking.id}.`,
          status: "pending",
          createdAt: new Date().toISOString(),
          source: "reservation",
        }));

      return incoming.length
        ? [...incoming, ...current]
        : current;
    });
  }, [reservations]);

  // Store changes locally.
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch {
      // Browser storage can be unavailable.
    }
  }, [tasks]);

  const counts = Object.fromEntries(
    STAGES.map((stage) => [
      stage.id,
      tasks.filter(
        (task) =>
          task.status === stage.id
      ).length,
    ])
  );

  const visible = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            filter === "all" ||
            task.status === filter
        )
        .sort((a, b) =>
          (b.createdAt || "").localeCompare(
            a.createdAt || ""
          )
        ),
    [tasks, filter]
  );

  const getName = (id) =>
    accommodations.find(
      (stay) => stay.id === id
    )?.name || "Residence";

  const complete = tasks.length
    ? Math.round(
        (counts.ready / tasks.length) * 100
      )
    : 0;

  function addTask(event) {
    event.preventDefault();

    if (note.trim().length < 3) {
      setFeedback(
        "Write at least three characters for the task."
      );
      return;
    }

    const task = {
      id: `TASK-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,

      accommodationId: stayId,
      title: "Manual housekeeping request",
      description: note.trim().slice(0, 150),
      status: "pending",
      createdAt: new Date().toISOString(),
      source: "manual",
    };

    setTasks((old) => [task, ...old]);
    setNote("");
    setFilter("all");

    setFeedback(
      "New housekeeping task created in this browser."
    );
  }

  function moveTask(id, status) {
    setTasks((old) =>
      old.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updatedAt:
                new Date().toISOString(),
            }
          : task
      )
    );

    setFeedback(
      "Housekeeping status saved locally."
    );
  }

  return (
    <div className="op4-page">
      <div className="op4-page-title">
        <div>
          <span className="op4-eyebrow">
            OPERATIONS / CHAPTER 05 · PRESENTATION & READINESS
          </span>

          <h1>
            Prepared with{" "}
            <em>quiet precision.</em>
          </h1>

          <p>
            A thoughtful cleaning and room-readiness
            studio, connected to demo checkout events
            and persisted within this browser.
          </p>
        </div>

        <Link
          className="op4-dark-button"
          to="/staff/villas"
        >
          VILLA DATE BLOCKS
          <Wrench size={17} />
        </Link>
      </div>

      {/* HOUSEKEEPING MOTION GRAPHIC */}

      <section className="op4-house-banner">
        <div>
          <span className="op4-eyebrow">
            THE ROOM PREPARATION INDEX
          </span>

          <h2>
            Every room tells a{" "}
            <em>fresh story.</em>
          </h2>

          <p>
            From post-checkout turnover to the
            final presentation check, follow
            each local task through three stages.
          </p>
        </div>

        <div
          className="op4-house-dial"
          style={{
            "--pct": `${complete}%`,
          }}
        >
          <strong>{complete}%</strong>
          <span>COMPLETED</span>
        </div>
      </section>

      {/* INTERACTIVE STATUS FILTERS */}

      <div
        className="op4-house-status"
        role="group"
        aria-label="Filter housekeeping tasks"
      >
        <button
          type="button"
          aria-pressed={filter === "all"}
          className={
            filter === "all"
              ? "is-current"
              : ""
          }
          onClick={() => setFilter("all")}
        >
          <span>00 / ALL TASKS</span>
          <strong>{tasks.length}</strong>
        </button>

        {STAGES.map((stage, index) => (
          <button
            type="button"
            key={stage.id}
            aria-pressed={
              filter === stage.id
            }
            className={
              filter === stage.id
                ? "is-current"
                : ""
            }
            onClick={() =>
              setFilter(stage.id)
            }
          >
            <span>
              0{index + 1} /{" "}
              {stage.label.toUpperCase()}
            </span>

            <strong>
              {counts[stage.id]}
            </strong>
          </button>
        ))}
      </div>

      <div className="op4-house-grid">
        {/* WORKFLOW BOARD */}

        <section className="op4-panel">
          <div className="op4-panel-head">
            <div>
              <span className="op4-eyebrow">
                01 / WORKFLOW BOARD
              </span>

              <h2>The preparation log.</h2>
            </div>

            <ClipboardCheck size={22} />
          </div>

          {visible.length ? (
            <div className="op4-task-board">
              {visible.map((task) => (
                <article
                  key={task.id}
                  className={`op4-task op4-task--${task.status}`}
                >
                  <div className="op4-task-top">
                    <span>
                      {getName(
                        task.accommodationId
                      )}
                    </span>

                    <b>
                      {task.status
                        .replaceAll("_", " ")
                        .toUpperCase()}
                    </b>
                  </div>

                  <h3>{task.title}</h3>
                  <p>{task.description}</p>

                  <small>
                    {task.source === "reservation"
                      ? "AUTOMATIC CHECKOUT TASK"
                      : "MANUAL TASK"}{" "}
                    ·{" "}
                    {new Date(
                      task.createdAt
                    ).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </small>

                  <div className="op4-task-actions">
                    {STAGES.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        disabled={
                          task.status === stage.id
                        }
                        onClick={() =>
                          moveTask(
                            task.id,
                            stage.id
                          )
                        }
                      >
                        {task.status ===
                        stage.id ? (
                          <Check size={14} />
                        ) : null}

                        {stage.label}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="op4-empty">
              <Sparkles size={26} />
              No tasks in this view. Add a
              preparation request or simulate
              guest checkout.
            </div>
          )}
        </section>

        <aside className="op4-house-aside">
          {/* CREATE HOUSEKEEPING TASK */}

          <section className="op4-panel">
            <div className="op4-panel-head">
              <div>
                <span className="op4-eyebrow">
                  02 / NEW PREPARATION REQUEST
                </span>

                <h2>Make it ready.</h2>
              </div>

              <Plus size={22} />
            </div>

            <form
              className="op4-form-grid"
              onSubmit={addTask}
            >
              <label className="op4-field op4-wide">
                ACCOMMODATION

                <select
                  value={stayId}
                  onChange={(event) =>
                    setStayId(event.target.value)
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

              <label className="op4-field op4-wide">
                TASK DESCRIPTION

                <textarea
                  required
                  maxLength={150}
                  rows={4}
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="e.g. Refresh linens, inspect terrace, replenish amenities"
                />
              </label>

              <button
                className="op4-dark-button op4-wide"
                type="submit"
              >
                ADD HOUSEKEEPING TASK
                <ArrowUpRight size={16} />
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

          {/* OPERATIONS NOTES */}

          <section className="op4-panel op4-house-notes">
            <span className="op4-eyebrow">
              03 / OPERATIONAL NOTES
            </span>

            <h2>Keep the details close.</h2>

            <div>
              <Clock3 size={17} />
              Checked-out demo reservations
              automatically generate turnover tasks.
            </div>

            <div>
              <Wrench size={17} />

              {maintenanceBlocks.length} maintenance
              blocks exist in the booking engine.
            </div>

            <div>
              <Waves size={17} />
              Task statuses are browser-local,
              not synced to a live housekeeping service.
            </div>

            <Link
              className="op4-text-action"
              to="/staff/reservations"
            >
              OPEN RESERVATION DESK
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}