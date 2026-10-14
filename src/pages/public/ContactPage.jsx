import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";

import {
  BRAND,
  PHOTOS,
} from "../../data/config.js";

const TOPICS = [
  {
    id: "reservation",
    label: "Reservation Inquiry",
    description: "Questions about villas, dates and accommodation.",
  },
  {
    id: "events",
    label: "Private Events",
    description: "Birthdays, celebrations and intimate gatherings.",
  },
  {
    id: "packages",
    label: "Resort Packages",
    description: "Curated escapes and special experiences.",
  },
  {
    id: "general",
    label: "General Inquiry",
    description: "Anything else you'd like to ask.",
  },
];

function getTopicLabel(id) {
  return TOPICS.find((item) => item.id === id)?.label ||
    "General Inquiry";
}

const CONTACT_DETAILS = [
  {
    label: "EMAIL",
    value: BRAND.email || "Not configured for this concept",
    icon: Mail,
  },
  {
    label: "PHONE",
    value: BRAND.phone || "Not configured for this concept",
    icon: Phone,
  },
  {
    label: "LOCATION",
    value: BRAND.address || "Location to be confirmed",
    icon: MapPin,
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    topic: "reservation",
    fullName: "",
    email: "",
    preferredDate: "",
    message: "",
  });

  const [feedback, setFeedback] = useState("");
  const [prepared, setPrepared] = useState(false);

  const [showDraft, setShowDraft] = useState(false);

  const hasBusinessEmail = Boolean(
    BRAND.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(BRAND.email)
  );

  const inquiry = useMemo(() => {
    return [
      "YOUR STAY — Website Concept Inquiry",
      "",
      `Subject: ${getTopicLabel(form.topic)}`,
      `Name: ${form.fullName.trim()}`,
      `Reply-to email: ${form.email.trim()}`,
      `Preferred date: ${form.preferredDate || "Not specified"}`,
      "",
      "Message:",
      form.message.trim(),
      "",
      "Prepared from the YOUR STAY portfolio concept.",
    ].join("\n");
  }, [form]);

  function update(name, value) {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
    setFeedback("");
    setPrepared(false);
    setShowDraft(false);
  }

  function prepareInquiry(event) {
    event.preventDefault();

    if (
      form.fullName.trim().length < 2 ||
      !form.email.trim() ||
      form.message.trim().length < 10
    ) {
      setFeedback(
        "Please provide your name, email and a message of at least 10 characters."
      );
      return;
    }

    setPrepared(true);
    setShowDraft(true);

    setFeedback(
      "Inquiry prepared. Nothing has been submitted to a server."
    );
  }

  async function copyInquiry() {
    try {
      await navigator.clipboard.writeText(inquiry);
      setFeedback("Inquiry copied to clipboard.");
    } catch {
      setShowDraft(true);
      setFeedback(
        "Clipboard access is unavailable. Select and copy the prepared message below."
      );
    }
  }

  function openEmailApp() {
    if (!hasBusinessEmail || !prepared) return;

    const subject = encodeURIComponent(
      `YOUR STAY — ${getTopicLabel(form.topic)}`
    );

    const body = encodeURIComponent(inquiry);

    window.location.href =
      `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="ys4-page">
      <section className="ys4-hero ys4-hero--contact">
        <img
          src={PHOTOS.escape}
          alt="Illustrative luxury resort entrance and landscape"
        />

        <div className="ys4-hero__shade" />

        <div className="ys4-container ys4-hero__content">
          <span className="ys4-eyebrow ys4-eyebrow--light">
            YOUR STAY / GET IN TOUCH
          </span>

          <h1>
            Let's dream<br />
            <em>somewhere.</em>
          </h1>

          <p>
            Questions, thoughtful plans or a getaway worth
            celebrating? Start the conversation here.
          </p>

          <a
            className="ys4-button ys4-button--light"
            href="#ys4-contact-form"
          >
            Prepare an inquiry <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section
        className="ys4-container ys4-section ys4-contact-layout"
        id="ys4-contact-form"
      >
        <div className="ys4-contact-copy">
          <span className="ys4-eyebrow">
            SOMETHING BEAUTIFUL BEGINS HERE
          </span>

          <h2 className="ys4-title">
            Tell us your <em>plans.</em>
          </h2>

          <p>
            The perfect escape begins with a little imagination.
            Explore how a dedicated resort inquiry experience
            could work for prospective guests.
          </p>

          <div className="ys4-contact-topic-list">
            {TOPICS.map((topic) => (
              <button
                type="button"
                key={topic.id}
                className={
                  form.topic === topic.id ? "is-active" : ""
                }
                aria-pressed={form.topic === topic.id}
                onClick={() => update("topic", topic.id)}
              >
                <span>
                  <strong>{topic.label}</strong>
                  <small>{topic.description}</small>
                </span>

                <ArrowUpRight size={19} />
              </button>
            ))}
          </div>

          <div className="ys4-contact-photo">
            <img
              src={PHOTOS.terrace}
              alt="Illustrative open-air resort terrace"
              loading="lazy"
            />
          </div>
        </div>

        <div className="ys4-contact-form-panel">
          <div className="ys4-contact-form-header">
            <MessageCircle size={26} strokeWidth={1.3} />

            <span className="ys4-eyebrow">
              YOUR INQUIRY
            </span>

            <h3>
              A conversation starts <em>here.</em>
            </h3>

            <p>
              Fill out the form to prepare a sample inquiry.
              This concept does not automatically send messages.
            </p>
          </div>

          <form onSubmit={prepareInquiry}>
            <div className="ys4-form-row">
              <label className="ys4-field">
                <span>FULL NAME</span>

                <input
                  required
                  minLength={2}
                  maxLength={80}
                  type="text"
                  placeholder="Your name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(event) =>
                    update("fullName", event.target.value)
                  }
                />
              </label>

              <label className="ys4-field">
                <span>EMAIL ADDRESS</span>

                <input
                  required
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    update("email", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="ys4-form-row">
              <label className="ys4-field">
                <span>INQUIRY TYPE</span>

                <select
                  value={form.topic}
                  onChange={(event) =>
                    update("topic", event.target.value)
                  }
                >
                  {TOPICS.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="ys4-field">
                <span>PREFERRED DATE (OPTIONAL)</span>

                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(event) =>
                    update("preferredDate", event.target.value)
                  }
                />
              </label>
            </div>

            <label className="ys4-field">
              <span>YOUR MESSAGE</span>

              <textarea
                required
                rows={6}
                minLength={10}
                maxLength={2000}
                placeholder="Tell us a little about your plans..."
                value={form.message}
                onChange={(event) =>
                  update("message", event.target.value)
                }
              />
            </label>

            <div className="ys4-contact-form-actions">
              <button
                type="submit"
                className="ys4-button ys4-button--full"
              >
                Prepare inquiry <Send size={17} />
              </button>

              {prepared && (
                <button
                  type="button"
                  className="ys4-button ys4-button--outline ys4-button--full"
                  onClick={copyInquiry}
                >
                  <Copy size={17} />
                  Copy prepared message
                </button>
              )}

              {prepared && hasBusinessEmail && (
                <button
                  type="button"
                  className="ys4-button ys4-button--outline ys4-button--full"
                  onClick={openEmailApp}
                >
                  <Mail size={17} />
                  Open email app
                </button>
              )}
            </div>

            {feedback && (
              <div
                className="ys4-feedback"
                role="status"
                aria-live="polite"
              >
                <CheckCircle2 size={19} />
                <span>{feedback}</span>
              </div>
            )}

            {prepared && showDraft && (
              <label className="ys4-field ys4-draft">
                <span>PREPARED MESSAGE — COPY IF NEEDED</span>
                <textarea
                  readOnly
                  rows={10}
                  value={inquiry}
                  onFocus={(event) =>
                    event.target.select()
                  }
                />
              </label>
            )}

            <div className="ys4-demo-notice">
              <ShieldCheck size={17} />
              This demo does not send or save guest inquiries.
              Use sample details rather than real personal information.
            </div>
          </form>
        </div>
      </section>

      <section className="ys4-contact-info">
        <div className="ys4-container">
          <div className="ys4-section-heading">
            <div>
              <span className="ys4-eyebrow">
                STAY CONNECTED
              </span>

              <h2 className="ys4-title">
                Find your <em>way to us.</em>
              </h2>
            </div>

            <p>
              Official business details can be added when
              the resort concept is adapted for a real client.
            </p>
          </div>

          <div className="ys4-contact-info-grid">
            {CONTACT_DETAILS.map((item) => {
              const IconComponent = item.icon;

              return (
                <article key={item.label}>
                  <IconComponent size={26} strokeWidth={1.25} />
                  <span className="ys4-eyebrow">
                    {item.label}
                  </span>

                  <p>{item.value}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="ys4-container ys4-section ys4-ending">
        <span className="ys4-eyebrow">
          READY TO EXPLORE?
        </span>

        <h2 className="ys4-title">
          Your next escape is <em>waiting to be imagined.</em>
        </h2>

        <p>
          Discover the villa collection or explore curated
          packages created for different kinds of getaways.
        </p>

        <div className="ys4-actions">
          <Link to="/stays" className="ys4-button">
            Explore villas <ArrowUpRight size={17} />
          </Link>

          <Link
            to="/packages"
            className="ys4-button ys4-button--outline"
          >
            View packages <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </div>
  );
}