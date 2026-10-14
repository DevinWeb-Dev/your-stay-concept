import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Compass,
  Heart,
  Sparkles,
  Waves,
  X,
} from "lucide-react";

import {
  EXPERIENCES,
  PHOTOS,
  ADD_ONS,
  formatPeso,
} from "../../data/config.js";

const EXPERIENCE_INFO = {
  "slow-mornings": {
    category: "slow",
    label: "SLOW LIVING",
    duration: "At your own pace",
    itinerary: [
      "Wake slowly to the gentle rhythm of the coast",
      "Enjoy a quiet breakfast surrounded by nature",
      "Spend an unhurried morning exploring the property",
    ],
    addOnId: "floating-breakfast",
  },
  "poolside-hours": {
    category: "water",
    label: "BY THE WATER",
    duration: "Half-day inspiration",
    itinerary: [
      "Find your favorite sun-soaked poolside corner",
      "Take a refreshing afternoon swim",
      "Unwind with a slow sunset moment",
    ],
    addOnId: null,
  },
  "tropical-table": {
    category: "dining",
    label: "DINING MOMENTS",
    duration: "Evening inspiration",
    itinerary: [
      "Gather for a thoughtfully styled dining experience",
      "Savor a memorable meal with your favorite people",
      "Finish the evening under warm coastal light",
    ],
    addOnId: "sunset-dinner",
  },
};

const FILTERS = [
  { id: "all", label: "All experiences" },
  { id: "slow", label: "Slow living" },
  { id: "water", label: "By the water" },
  { id: "dining", label: "Dining" },
];

const STORAGE_KEY = "your-stay-experience-plan-v1";

function loadPlan() {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved.filter((id) =>
      EXPERIENCES.some((experience) => experience.id === id)
    );
  } catch {
    return [];
  }
}

export default function ExperiencesPage() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [plan, setPlan] = useState(loadPlan);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(plan)
      );
    } catch {
      // Browser storage may be unavailable.
    }
  }, [plan]);

  const visible = EXPERIENCES.filter((experience) => {
    const info = EXPERIENCE_INFO[experience.id];

    return (
      filter === "all" ||
      info?.category === filter
    );
  });

  const selected = EXPERIENCES.filter((experience) =>
    plan.includes(experience.id)
  );

  function togglePlan(id) {
    setPlan((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <div className="ys3-page">
      <section className="ys3-experience-hero">
        <img
          src={PHOTOS.terrace}
          alt="Illustrative tropical resort terrace"
        />

        <div className="ys3-experience-overlay" />

        <div className="ys3-shell ys3-experience-content">
          <span className="ys-kicker ys-kicker--light">
            BEYOND THE ACCOMMODATION
          </span>

          <h1 className="ys3-hero-title">
            The art of <em>being here.</em>
          </h1>

          <p>
            Some moments are worth slowing down for.
            Explore meaningful ways to spend your stay.
          </p>

          <a className="ys3-outline-light" href="#explore-experiences">
            Discover experiences
            <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section
        className="ys3-shell ys3-section"
        id="explore-experiences"
      >
        <div className="ys3-section-heading">
          <div>
            <span className="ys-kicker">
              CURATED EXPERIENCES
            </span>

            <h2 className="ys3-heading">
              Moments to <em>remember.</em>
            </h2>
          </div>

          <p>
            From peaceful mornings to warm tropical evenings,
            create your own collection of unforgettable moments.
          </p>
        </div>

        <div className="ys3-filters" role="group" aria-label="Experience category">
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={filter === item.id ? "is-active" : ""}
              aria-pressed={filter === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ys3-experience-grid">
          {visible.map((experience, index) => {
            const info = EXPERIENCE_INFO[experience.id] || {};
            const saved = plan.includes(experience.id);
            const opened = expanded === experience.id;

            const relatedAddon = ADD_ONS.find(
              (addon) => addon.id === info.addOnId
            );

            return (
              <article
                className="ys3-experience-card"
                key={experience.id}
              >
                <div className="ys3-experience-image">
                  <img
                    src={experience.image}
                    alt={`Illustrative ${experience.title} experience`}
                    loading="lazy"
                  />

                  <span className="ys3-experience-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="ys3-experience-body">
                  <span className="ys-kicker">
                    {info.label || "YOUR EXPERIENCE"}
                  </span>

                  <h3>{experience.title}</h3>

                  <p>{experience.description}</p>

                  <div className="ys3-experience-duration">
                    <Clock3 size={16} />
                    {info.duration}
                  </div>

                  <button
                    type="button"
                    className="ys3-text-button"
                    aria-expanded={opened}
                    onClick={() =>
                      setExpanded(
                        opened ? null : experience.id
                      )
                    }
                  >
                    {opened ? "Hide details" : "Discover the experience"}
                    <ArrowUpRight size={17} />
                  </button>

                  {opened && (
                    <div className="ys3-experience-details">
                      <strong>A glimpse of your moment</strong>

                      {info.itinerary?.map((activity) => (
                        <div key={activity}>
                          <Check size={15} />
                          <span>{activity}</span>
                        </div>
                      ))}

                      {relatedAddon && (
                        <p>
                          Suggested demo add-on:{" "}
                          <strong>{relatedAddon.name}</strong>
                          {relatedAddon.price > 0 &&
                            ` — ${formatPeso(relatedAddon.price)}`}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="ys3-experience-actions">
                    <button
                      type="button"
                      className={`ys3-plan-button ${saved ? "is-active" : ""}`}
                      onClick={() => togglePlan(experience.id)}
                      aria-pressed={saved}
                    >
                      {saved ? <Check size={17} /> : <Heart size={17} />}
                      {saved ? "Added to plan" : "Add to my plan"}
                    </button>

                    <Link
                      to={
                        info.addOnId
                          ? `/booking?addOns=${info.addOnId}`
                          : "/booking"
                      }
                      className="ys3-text-button"
                    >
                      Explore booking
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ys3-itinerary">
        <div className="ys3-shell ys3-itinerary-grid">
          <div>
            <span className="ys-kicker ys-kicker--light">
              DESIGN YOUR ESCAPE
            </span>

            <h2 className="ys3-heading">
              Your stay, <em>your story.</em>
            </h2>

            <p>
              Collect the experiences that feel right for you.
              We'll keep your selections in this browser.
            </p>

            <div className="ys3-itinerary-symbol">
              <Compass size={54} strokeWidth={1} />
            </div>
          </div>

          <div className="ys3-itinerary-panel">
            <div className="ys3-itinerary-head">
              <span>YOUR PERSONAL ITINERARY</span>
              <strong>{selected.length} selected</strong>
            </div>

            {selected.length === 0 ? (
              <div className="ys3-itinerary-empty">
                <Waves size={34} />
                <p>
                  Your escape starts with a moment.
                  Choose an experience above to begin.
                </p>
              </div>
            ) : (
              <div className="ys3-itinerary-list">
                {selected.map((experience, index) => (
                  <div key={experience.id}>
                    <span>
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div>
                      <strong>{experience.title}</strong>
                      <small>{experience.description}</small>
                    </div>

                    <button
                      type="button"
                      aria-label={`Remove ${experience.title}`}
                      onClick={() => togglePlan(experience.id)}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="ys3-rule" />

            <Link className="ys3-btn ys3-btn--wide" to="/booking">
              Plan your resort stay
              <ArrowUpRight size={18} />
            </Link>

            <p className="ys3-disclaimer">
              Your itinerary is a personal demo wishlist.
              Adding an experience does not reserve a service,
              time slot, or resort accommodation.
            </p>
          </div>
        </div>
      </section>

      <section className="ys3-experience-cta">
        <Sparkles size={28} />

        <h2>
          Leave the ordinary <em>behind.</em>
        </h2>

        <p>
          Beautiful spaces. Thoughtful moments. A different pace.
        </p>

        <Link to="/stays" className="ys3-btn">
          Discover your stay <ArrowUpRight size={18} />
        </Link>
      </section>
    </div>
  );
}