import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  Sparkles,
  Wrench,
} from "lucide-react";

import { useResort } from "../../context/ResortContext.jsx";

const STORAGE_KEY = "your-stay-housekeeping-demo-v1";

const STATUSES = [
  { id: "pending", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "ready", label: "Completed" },
];

function loadTasks() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(stored) ? stored : [];
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

  useEffect(() => {
    const checkedOut = reservations.filter(
      (booking) => booking.status === "checked_out"
    );

    setTasks((current) => {
      const existing = new Set(current.map((task) => task.id));

      const newTasks = checkedOut
        .filter(
          (booking) => !existing.has(`turnover:${booking.id}`)
        )
        .map((booking) => ({
          id: `turnover:${booking.id}`,
          accommodationId: booking.accommodationId,
          title: "Post-checkout room turnover",
          description:
            `Prepare the room after booking ${booking.id}.`,
          status: "pending",
          createdAt: new Date().toISOString(),
          source: "reservation",
        }));

      return newTasks.length
        ? [...newTasks, ...current]
        : current;
    });
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tasks)
      );
    } catch {
      // Local browser storage might be unavailable.
    }
  }, [tasks]);

  const getStayName = (id) =>
    accommodations.find((item) => item.id === id)?.name ||
    "Accommodation";

  const counts = Object.fromEntries(
    STATUSES.map((status) => [
      status.id,
      tasks.filter((task) => task.status === status.id)
        .length,
    ])
  );

  const visible = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          filter === "all" || task.status === filter
      )
      .sort((a, b) =>
        b.createdAt.localeCompare(a.createdAt)
      );
  }, [tasks, filter]);

  function addTask(event) {
    event.preventDefault();

    if (!stayId || note.trim().length < 3) {
      setFeedback("Enter a task description.");
      return;
    }

    const task = {
      id: `TASK-${Date.now()}-${Math.random()
        .toString(36).slice(2, 6)}`,
      accommodationId: stayId,
      title: "Manual housekeeping request",
      description: note.trim().slice(0, 150),
      status: "pending",
      createdAt: new Date().toISOString(),
      source: "manual",
    };

    setTasks((current) => [task, ...current]);
    setNote("");
    setFeedback("Housekeeping task added.");
    setFilter("all");
  }

  function updateTask(id, status) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updatedAt: new Date().toISOString(),
            }
          : task
      )
    );

    setFeedback("Task status updated in this browser.");
  }

  const taskBlockedStays = new Set(
    maintenanceBlocks.map((block) => block.accommodationId)
  );

  return (
    <div className="ys5-page">
      <div className="ys5-page-heading">
        <div>
          <span className="ys5-eyebrow">
            THE HOUSEKEEPING STUDIO
          </span>

          <h1>
            Ready for <em>every arrival.</em>
          </h1>

          <p>
            Organize turnover, cleaning and presentation
            tasks across the resort's accommodation collection.
          </p>
        </div>

        <Link to="/staff/villas" className="ys5-button">
          Manage date blocks <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="ys5-mini-stats">
        <button
          type="button"
          className={filter === "all" ? "is-active" : ""}
          onClick={() => setFilter("all")}
        >
          <strong>{tasks.length}</strong>
          <span>All tasks</span>
        </button>

        {STATUSES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? "is-active" : ""}
            onClick={() => setFilter(item.id)}
          >
            <strong>{counts[item.id]}</strong>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="ys5-housekeeping-grid">
        <section className="ys5-panel">
          <div className="ys5-panel-heading">
            <div>
              <span className="ys5-eyebrow">
                OPERATIONAL TASKS
              </span>
              <h2>Cleaning & preparation</h2>
            </div>
            <ClipboardList size={22} />
          </div>

          {visible.length === 0 ? (
            <div className="ys5-empty">
              <Sparkles size={30} />
              <p>
                No tasks in this view. Complete a demo guest
                checkout or create a cleaning request.
              </p>
            </div>
          ) : (
            <div className="ys5-task-list">
              {visible.map((task) => (
                <article className="ys5-task" key={task.id}>
                  <div className="ys5-task-top">
                    <span className="ys5-eyebrow">
                      {getStayName(task.accommodationId)}
                    </span>

                    <span
                      className={`ys5-status ys5-status-${task.status}`}
                    >
                      {task.status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <h3>{task.title}</h3>
                  <p>{task.description}</p>

                  <small>
                    Created{" "}
                    {new Date(task.createdAt).toLocaleString(
                      "en-PH"
                    )}
                  </small>

                  <div className="ys5-task-actions">
                    {task.status === "pending" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, "in_progress")
                        }
                      >
                        <Clock3 size={16} />
                        Start cleaning
                      </button>
                    )}

                    {task.status === "in_progress" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, "ready")
                        }
                      >
                        <CheckCircle2 size={16} />
                        Mark completed
                      </button>
                    )}

                    {task.status === "ready" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateTask(task.id, "pending")
                        }
                      >
                        Reopen task
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="ys5-housekeeping-side">
          <section className="ys5-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  CREATE NEW REQUEST
                </span>
                <h2>Add housekeeping task</h2>
              </div>
              <Plus size={22} />
            </div>

            <form onSubmit={addTask}>
              <label className="ys5-field">
                <span>ACCOMMODATION</span>
                <select
                  value={stayId}
                  onChange={(event) =>
                    setStayId(event.target.value)
                  }
                >
                  {accommodations.map((stay) => (
                    <option key={stay.id} value={stay.id}>
                      {stay.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ys5-field">
                <span>WORK DESCRIPTION</span>
                <textarea
                  value={note}
                  maxLength={150}
                  rows={4}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  placeholder="e.g. Refresh linens and inspect the bathroom"
                  required
                  minLength={3}
                />
              </label>

              <button
                className="ys5-button ys5-button-full"
                type="submit"
              >
                <Plus size={17} />
                Add task
              </button>

              {feedback && (
                <p className="ys5-feedback" role="status">
                  {feedback}
                </p>
              )}
            </form>
          </section>

          <section className="ys5-panel">
            <div className="ys5-panel-heading">
              <div>
                <span className="ys5-eyebrow">
                  BOOKING AVAILABILITY
                </span>
                <h2>Maintenance overview</h2>
              </div>
              <Wrench size={22} />
            </div>

            {accommodations.map((stay) => (
              <div className="ys5-housekeeping-room" key={stay.id}>
                <span>{stay.name}</span>
                <strong>
                  {taskBlockedStays.has(stay.id)
                    ? "Has date blocks"
                    : "No date blocks"}
                </strong>
              </div>
            ))}

            <p className="ys5-legal-note">
              This overview counts saved date blocks,
              including future and past dates. To check
              availability for specific dates, use Villa
              Management.
            </p>

            <Link to="/staff/villas" className="ys5-text-link">
              View maintenance blocks
              <ArrowUpRight size={16} />
            </Link>
          </section>
        </aside>
      </div>

      <p className="ys5-legal-note">
        Housekeeping checklist statuses are kept separately
        in this browser. Marking a task completed does not
        automatically remove maintenance blocks or change
        booking availability.
      </p>
    </div>
  );
}