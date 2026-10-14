import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronLeft,
  ChevronRight,
  Images,
  X,
} from "lucide-react";

import {
  ACCOMMODATIONS,
  PHOTOS,
  formatPeso,
} from "../../data/config.js";

const FILTERS = [
  { id: "all", label: "All moments" },
  { id: "villa", label: "Villas" },
  { id: "suite", label: "Suites" },
  { id: "cabin", label: "Nature" },
  { id: "moments", label: "Resort moments" },
];

const stayPhotos = ACCOMMODATIONS.flatMap((stay) =>
  stay.images.map((image, index) => ({
    id: `${stay.id}-${index}`,
    src: image,
    title: stay.name,
    description:
      index === 0
        ? stay.description
        : "A closer look at the atmosphere of this escape.",
    category: stay.category,
    stayId: stay.id,
    price: stay.nightlyRate,
  }))
);

const moodPhotos = [
  {
    id: "resort-pool",
    src: PHOTOS.pool,
    title: "Still Waters",
    description: "An afternoon with nowhere else to be.",
    category: "moments",
  },
  {
    id: "resort-dining",
    src: PHOTOS.dining,
    title: "The Tropical Table",
    description: "Slow conversations and memorable meals.",
    category: "moments",
  },
  {
    id: "resort-terrace",
    src: PHOTOS.terrace,
    title: "Open-Air Living",
    description: "Breathe in the beauty of a slower day.",
    category: "moments",
  },
  {
    id: "resort-escape",
    src: PHOTOS.escape,
    title: "Somewhere Beautiful",
    description: "Discover a place that stays with you.",
    category: "moments",
  },
];

const ALL_PHOTOS = [...stayPhotos, ...moodPhotos];

export default function GalleryPage() {
  const [filter, setFilter] = useState("all");
  const [activeIndex, setActiveIndex] = useState(null);

  const visible = useMemo(
    () =>
      ALL_PHOTOS.filter(
        (photo) =>
          filter === "all" ||
          photo.category === filter
      ),
    [filter]
  );

  const activePhoto =
    activeIndex === null ? null : visible[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          (index + 1) % visible.length
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          (index - 1 + visible.length) % visible.length
        );
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, visible.length]);

  function changeFilter(next) {
    setFilter(next);
    setActiveIndex(null);
  }

  function changePhoto(direction) {
    setActiveIndex((current) =>
      (current + direction + visible.length) % visible.length
    );
  }

  return (
    <div className="ys3-page">
      <section className="ys3-gallery-hero">
        <div className="ys3-shell">
          <span className="ys-kicker ys-kicker--light">
            YOUR STAY / VISUAL JOURNAL
          </span>

          <h1 className="ys3-hero-title">
            A view to <em>remember.</em>
          </h1>

          <p>
            Some places stay with you long after you've left.
            Explore the moments and spaces that make an escape special.
          </p>
        </div>
      </section>

      <section className="ys3-shell ys3-section">
        <div className="ys3-section-heading">
          <div>
            <span className="ys-kicker">
              AN EDITORIAL COLLECTION
            </span>

            <h2 className="ys3-heading">
              Postcards from <em>paradise.</em>
            </h2>
          </div>

          <div className="ys3-gallery-count">
            <Images size={19} />
            {visible.length} photographs
          </div>
        </div>

        <div className="ys3-filters" role="group" aria-label="Gallery filter">
          {FILTERS.map((item) => (
            <button
              type="button"
              key={item.id}
              className={filter === item.id ? "is-active" : ""}
              aria-pressed={filter === item.id}
              onClick={() => changeFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="ys3-gallery-grid">
          {visible.map((photo, index) => (
            <button
              className={`ys3-gallery-tile ${
                index % 7 === 0 ? "ys3-gallery-tile--large" : ""
              }`}
              type="button"
              key={photo.id}
              aria-label={`View ${photo.title} photo`}
              onClick={() => setActiveIndex(index)}
            >
              <img
                src={photo.src}
                alt={`Illustrative photograph: ${photo.title}`}
                loading="lazy"
              />

              <div className="ys3-gallery-tile__overlay">
                <span>
                  {String(index + 1).padStart(2, "0")}
                  {" / "}
                  {String(visible.length).padStart(2, "0")}
                </span>

                <h3>{photo.title}</h3>

                <div>
                  <Camera size={18} />
                  View image
                  <ArrowUpRight size={18} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="ys3-disclaimer">
          All imagery is illustrative stock photography.
          It does not represent a verified physical resort property.
        </p>
      </section>

      <section className="ys3-gallery-bottom">
        <div className="ys3-shell ys3-gallery-bottom-grid">
          <div>
            <span className="ys-kicker ys-kicker--light">
              BEYOND THE FRAME
            </span>

            <h2 className="ys3-heading">
              Your next story <em>begins here.</em>
            </h2>

            <p>
              Explore a collection of imagined coastal villas
              and peaceful hideaways.
            </p>

            <Link to="/stays" className="ys3-outline-light">
              Discover the collection
              <ArrowRight size={18} />
            </Link>
          </div>

          <img
            src={PHOTOS.villas}
            alt="Illustrative luxury resort accommodation"
            loading="lazy"
          />
        </div>
      </section>

      {activePhoto && (
        <div
          className="ys3-lightbox"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setActiveIndex(null);
            }
          }}
        >
          <div
            className="ys3-lightbox-inner"
            role="dialog"
            aria-modal="true"
            aria-label={`${activePhoto.title} photo viewer`}
          >
            <div className="ys3-lightbox-top">
              <div>
                <span>YOUR STAY / THE GALLERY</span>
                <h2>{activePhoto.title}</h2>
              </div>

              <button
                type="button"
                autoFocus
                aria-label="Close photo viewer"
                onClick={() => setActiveIndex(null)}
              >
                <X size={23} />
              </button>
            </div>

            <div className="ys3-lightbox-photo">
              <img
                src={activePhoto.src}
                alt={`Illustrative view: ${activePhoto.title}`}
              />

              <button
                type="button"
                className="ys3-lightbox-prev"
                aria-label="Previous photo"
                onClick={() => changePhoto(-1)}
              >
                <ChevronLeft size={27} />
              </button>

              <button
                type="button"
                className="ys3-lightbox-next"
                aria-label="Next photo"
                onClick={() => changePhoto(1)}
              >
                <ChevronRight size={27} />
              </button>
            </div>

            <div className="ys3-lightbox-bottom">
              <div>
                <p>{activePhoto.description}</p>
                <small>
                  {activeIndex + 1} of {visible.length}
                </small>
              </div>

              {activePhoto.stayId && (
                <Link
                  to={`/stays/${activePhoto.stayId}`}
                  onClick={() => setActiveIndex(null)}
                >
                  Explore accommodation
                  <ArrowUpRight size={17} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}