import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  Gift,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";

import {
  PHOTOS,
  formatPeso,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

const OFFERS = [
  {
    id: "first-light",
    code: "FIRSTLIGHT08",
    eyebrow: "A GENTLE BEGINNING",
    title: "The First Light Escape",
    description:
      "Imagine arriving somewhere quiet, where a gentle coastal morning is all you need.",
    headline: "8% off",
    type: "percent",
    value: 8,
    cap: 1200,
    stayId: "sea-glass-suite",
    nights: 2,
    guests: 2,
    image: PHOTOS.suite,
    color: "sea",
    highlights: [
      "Two-night coastal suite concept",
      "For two guests",
      "Sample discount applied to accommodation only",
    ],
  },
  {
    id: "lagoon",
    code: "LAGOON12",
    eyebrow: "STAY A LITTLE LONGER",
    title: "The Lagoon Long Stay",
    description:
      "Three unhurried nights in a private villa, with more time for the moments that matter.",
    headline: "12% off",
    type: "percent",
    value: 12,
    cap: 2500,
    stayId: "lagoon-villa",
    nights: 3,
    guests: 4,
    image: PHOTOS.pool,
    color: "lagoon",
    highlights: [
      "Three-night private villa concept",
      "For four guests",
      "Illustrative discount with a cap",
    ],
  },
  {
    id: "garden",
    code: "GARDEN500",
    eyebrow: "MOMENTS TOGETHER",
    title: "The Garden Gathering",
    description:
      "Give yourself and your favorite people a reason to escape the ordinary.",
    headline: "₱500 off",
    type: "fixed",
    value: 500,
    cap: 500,
    stayId: "palm-garden-villa",
    nights: 2,
    guests: 4,
    image: PHOTOS.villas,
    color: "clay",
    highlights: [
      "Two-night garden villa concept",
      "For four guests",
      "Sample fixed-value saving",
    ],
  },
];

function dateAfter(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function addDays(dateKey, count) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  date.setDate(date.getDate() + count);
  return localDateKey(date);
}

export default function OffersPage() {
  const navigate = useNavigate();
  const { accommodations, getQuote } = useResort();

  const [activeId, setActiveId] = useState(OFFERS[0].id);
  const [checkIn, setCheckIn] = useState(dateAfter(4));
  const [copyStatus, setCopyStatus] = useState("");

  const selected =
    OFFERS.find((item) => item.id === activeId) || OFFERS[0];

  const accommodation = accommodations.find(
    (item) => item.id === selected.stayId
  );

  const checkOut = checkIn
    ? addDays(checkIn, selected.nights)
    : "";

  const quote = accommodation
    ? getQuote({
        accommodationId: accommodation.id,
        checkIn,
        checkOut,
        guests: selected.guests,
        addOnIds: [],
      })
    : {
        ok: false,
        error: "Accommodation not found.",
      };

  const demoDiscount = quote.ok
    ? selected.type === "percent"
      ? Math.min(
          quote.nightlySubtotal * (selected.value / 100),
          selected.cap
        )
      : Math.min(selected.value, quote.nightlySubtotal)
    : 0;

  const previewTotal = quote.ok
    ? Math.max(0, quote.total - demoDiscount)
    : 0;

  function chooseOffer(id) {
    setActiveId(id);
    setCopyStatus("");

    document.getElementById("ys4-offer-preview")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(selected.code);
      setCopyStatus(`Copied sample code: ${selected.code}`);
    } catch {
      setCopyStatus(
        `Copy this sample code manually: ${selected.code}`
      );
    }
  }

  function exploreBooking() {
    if (!quote.ok || !accommodation) return;

    const params = new URLSearchParams({
      stay: accommodation.id,
      checkIn,
      checkOut,
      guests: String(selected.guests),
    });

    navigate(`/booking?${params.toString()}`);
  }

  return (
    <div className="ys4-page">
      <section className="ys4-hero ys4-hero--offers">
        <img
          src={PHOTOS.escape}
          alt="Illustrative coastal resort escape"
        />
        <div className="ys4-hero__shade" />

        <div className="ys4-container ys4-hero__content">
          <span className="ys4-eyebrow ys4-eyebrow--light">
            YOUR STAY / SPECIAL MOMENTS
          </span>

          <h1>
            Beautiful days.<br />
            <em>Better reasons to stay.</em>
          </h1>

          <p>
            Explore promotional ideas designed around slow
            mornings, longer escapes and meaningful experiences.
          </p>

          <a className="ys4-button ys4-button--light" href="#ys4-offers">
            Explore the offers <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="ys4-container ys4-section" id="ys4-offers">
        <div className="ys4-section-heading">
          <div>
            <span className="ys4-eyebrow">
              THE OFFERS COLLECTION
            </span>

            <h2 className="ys4-title">
              An invitation <em>to escape.</em>
            </h2>
          </div>

          <p>
            Designed to demonstrate how promotional offers
            could appear on a premium resort booking website.
          </p>
        </div>

        <div className="ys4-offers-grid">
          {OFFERS.map((offer) => (
            <article className="ys4-offer-card" key={offer.id}>
              <div className="ys4-offer-card__media">
                <img
                  src={offer.image}
                  alt={`Illustrative resort setting for ${offer.title}`}
                  loading="lazy"
                />

                <div className="ys4-offer-card__tag">
                  <Tag size={15} />
                  CONCEPT OFFER
                </div>
              </div>

              <div className="ys4-offer-card__body">
                <span className="ys4-eyebrow">{offer.eyebrow}</span>

                <strong className="ys4-offer-headline">
                  {offer.headline}
                </strong>

                <h3>{offer.title}</h3>
                <p>{offer.description}</p>

                <div className="ys4-card-divider" />

                <div className="ys4-offer-highlights">
                  {offer.highlights.map((item) => (
                    <span key={item}>
                      <Check size={15} />
                      {item}
                    </span>
                  ))}
                </div>

                <button
                  className="ys4-button ys4-button--outline"
                  type="button"
                  onClick={() => chooseOffer(offer.id)}
                >
                  Preview this offer
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="ys4-fineprint">
          These offers are fictional examples. No discount code
          is currently valid for a real transaction or booking.
        </p>
      </section>

      <section
        className="ys4-offer-preview"
        id="ys4-offer-preview"
      >
        <div className="ys4-container ys4-offer-preview__grid">
          <div className="ys4-offer-preview__visual">
            <img
              src={selected.image}
              alt={`Illustrative ${selected.title}`}
            />

            <div>
              <span className="ys4-eyebrow ys4-eyebrow--light">
                THE EXPERIENCE
              </span>

              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
            </div>
          </div>

          <div className="ys4-offer-preview__panel">
            <span className="ys4-eyebrow">
              INTERACTIVE OFFER PREVIEW
            </span>

            <h2 className="ys4-subtitle">
              See what your stay <em>could look like.</em>
            </h2>

            <p>
              Explore a hypothetical promotional calculation.
              The actual demo booking continues at the normal
              engine-calculated rate.
            </p>

            <label className="ys4-field">
              <span>CHECK-IN DATE</span>

              <input
                type="date"
                min={dateAfter(0)}
                value={checkIn}
                onChange={(event) =>
                  setCheckIn(event.target.value)
                }
              />
            </label>

            <div className="ys4-preview-meta">
              <div>
                <CalendarDays size={18} />
                <span>{selected.nights} nights</span>
              </div>

              <div>
                <Gift size={18} />
                <span>{selected.headline} sample offer</span>
              </div>
            </div>

            <div className="ys4-promo-code">
              <div>
                <small>SAMPLE PROMO CODE</small>
                <strong>{selected.code}</strong>
              </div>

              <button
                type="button"
                onClick={copyCode}
                aria-label="Copy sample promo code"
              >
                <Copy size={18} />
              </button>
            </div>

            {copyStatus && (
              <p className="ys4-copy-status" role="status">
                {copyStatus}
              </p>
            )}

            {quote.ok ? (
              <div className="ys4-summary">
                <div>
                  <span>Standard demo total</span>
                  <strong>{formatPeso(quote.total)}</strong>
                </div>

                <div>
                  <span>Hypothetical saving</span>
                  <strong>-{formatPeso(demoDiscount)}</strong>
                </div>

                <div className="ys4-summary__total">
                  <span>Illustrative offer total</span>
                  <strong>{formatPeso(previewTotal)}</strong>
                </div>
              </div>
            ) : (
              <p className="ys4-error" role="status">
                {quote.error}
              </p>
            )}

            <button
              type="button"
              className="ys4-button ys4-button--full"
              disabled={!quote.ok}
              onClick={exploreBooking}
            >
              Explore standard booking <ArrowRight size={18} />
            </button>

            <div className="ys4-demo-notice">
              <ShieldCheck size={17} />
              Offer preview only. The booking page does not apply
              this discount, and no actual payment is processed.
            </div>
          </div>
        </div>
      </section>

      <section className="ys4-container ys4-section ys4-ending">
        <Sparkles size={29} strokeWidth={1.3} />

        <h2 className="ys4-title">
          Some moments are <em>priceless.</em>
        </h2>

        <p>
          Browse the complete accommodation collection or
          discover curated ways to spend your stay.
        </p>

        <div className="ys4-actions">
          <Link to="/stays" className="ys4-button">
            Explore stays <ArrowUpRight size={17} />
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