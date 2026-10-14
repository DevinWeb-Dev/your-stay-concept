import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Heart,
  Leaf,
  Sun,
  Waves,
} from "lucide-react";

import {
  BRAND,
  PHOTOS,
  DEMO_NOTICES,
} from "../../data/config.js";

const VALUES = [
  {
    number: "01",
    icon: <Waves size={28} strokeWidth={1.25} />,
    title: "Space to breathe",
    description:
      "Open spaces, beautiful horizons and an atmosphere that invites a slower rhythm.",
  },
  {
    number: "02",
    icon: <Heart size={28} strokeWidth={1.25} />,
    title: "Thoughtful moments",
    description:
      "Details that turn an ordinary getaway into a more personal experience.",
  },
  {
    number: "03",
    icon: <Leaf size={28} strokeWidth={1.25} />,
    title: "Closer to nature",
    description:
      "A visual philosophy shaped by tropical greenery, water, and natural materials.",
  },
];

const CHAPTERS = [
  {
    number: "I",
    label: "THE IDEA",
    title: "An invitation to slow down.",
    description:
      "YOUR STAY is a concept built around a simple thought: the best escapes are not always about going farther. Sometimes, they are about finding a place where life feels a little lighter.",
    image: PHOTOS.terrace,
  },
  {
    number: "II",
    label: "THE SPACES",
    title: "Beautifully uncomplicated.",
    description:
      "Imagine villas framed by warm sunlight, coastal suites with understated character and hideaways designed for moments of stillness. Every space belongs to a different kind of escape.",
    image: PHOTOS.villas,
  },
  {
    number: "III",
    label: "THE EXPERIENCE",
    title: "A feeling that stays.",
    description:
      "It is the little things we remember: morning light on the water, good conversations, fresh air and afternoons without a schedule. Those moments shape the atmosphere of YOUR STAY.",
    image: PHOTOS.pool,
  },
];

export default function StoryPage() {
  return (
    <div className="ys4-page">
      <section className="ys4-hero ys4-hero--story">
        <img
          src={PHOTOS.terrace}
          alt="Illustrative open-air luxury resort architecture"
        />

        <div className="ys4-hero__shade" />

        <div className="ys4-container ys4-hero__content">
          <span className="ys4-eyebrow ys4-eyebrow--light">
            THE STORY / YOUR STAY
          </span>

          <h1>
            A slower way<br />
            <em>to stay.</em>
          </h1>

          <p>
            A destination imagined around beauty, simplicity
            and meaningful moments.
          </p>

          <a className="ys4-button ys4-button--light" href="#ys4-story-intro">
            Discover our vision <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section
        id="ys4-story-intro"
        className="ys4-story-intro ys4-container ys4-section"
      >
        <div className="ys4-story-intro__mark">
          <Compass size={58} strokeWidth={0.9} />
        </div>

        <div>
          <span className="ys4-eyebrow">
            THE PHILOSOPHY
          </span>

          <h2 className="ys4-title">
            Not just somewhere<br />
            to go. <em>Somewhere to feel.</em>
          </h2>

          <p>
            {BRAND.name} was imagined as a quiet invitation
            to reconnect—with your surroundings, your favorite
            people and the moments that deserve your time.
          </p>

          <p>
            This isn't a story about doing more. It's about
            creating room for less noise, more presence and a
            truly personal way of getting away.
          </p>

          <div className="ys4-signature">
            YOUR STAY.
            <span>{BRAND.tagline}</span>
          </div>
        </div>
      </section>

      <section className="ys4-story-quote">
        <div className="ys4-container">
          <span className="ys4-eyebrow ys4-eyebrow--light">
            THE ART OF GETTING AWAY
          </span>

          <blockquote>
            “The most beautiful places are the ones
            that make us feel <em>completely present.</em>”
          </blockquote>

          <span className="ys4-story-quote__credit">
            YOUR STAY / DESIGN PHILOSOPHY
          </span>
        </div>
      </section>

      <section className="ys4-container ys4-section">
        <div className="ys4-section-heading">
          <div>
            <span className="ys4-eyebrow">
              THE CONCEPT JOURNAL
            </span>

            <h2 className="ys4-title">
              A story told <em>in moments.</em>
            </h2>
          </div>

          <p>
            Three ideas shape the visual identity and guest
            experience imagined for YOUR STAY.
          </p>
        </div>

        <div className="ys4-story-chapters">
          {CHAPTERS.map((chapter, index) => (
            <article
              key={chapter.number}
              className={`ys4-story-chapter ${
                index % 2 ? "is-reversed" : ""
              }`}
            >
              <div className="ys4-story-chapter__image">
                <img
                  src={chapter.image}
                  alt={`Illustrative resort photograph for ${chapter.label}`}
                  loading="lazy"
                />

                <span>{chapter.number}</span>
              </div>

              <div className="ys4-story-chapter__text">
                <span className="ys4-eyebrow">
                  {chapter.label}
                </span>

                <h3>{chapter.title}</h3>

                <p>{chapter.description}</p>

                <div className="ys4-story-chapter__rule" />

                <span className="ys4-story-chapter__index">
                  CHAPTER {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="ys4-story-values">
        <div className="ys4-container ys4-section">
          <div className="ys4-section-heading">
            <div>
              <span className="ys4-eyebrow">
                OUR DESIGN PRINCIPLES
              </span>

              <h2 className="ys4-title">
                What makes a moment <em>matter.</em>
              </h2>
            </div>
          </div>

          <div className="ys4-values-grid">
            {VALUES.map((item) => (
              <article key={item.number}>
                <div className="ys4-value-icon">
                  {item.icon}
                </div>

                <span className="ys4-value-number">
                  {item.number}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ys4-story-final">
        <img
          src={PHOTOS.escape}
          alt="Illustrative peaceful resort exterior"
          loading="lazy"
        />

        <div className="ys4-story-final__overlay" />

        <div className="ys4-container ys4-story-final__content">
          <Sun size={38} strokeWidth={1} />

          <span className="ys4-eyebrow ys4-eyebrow--light">
            YOUR NEXT CHAPTER
          </span>

          <h2>
            The best stories<br />
            begin with <em>a little escape.</em>
          </h2>

          <Link className="ys4-button ys4-button--light" to="/stays">
            Discover the collection
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      <p className="ys4-story-disclosure">
        YOUR STAY is an illustrative website and resort brand concept,
        not a verified operating resort. {DEMO_NOTICES.images}
      </p>
    </div>
  );
}