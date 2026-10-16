import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Copy,
  ShieldCheck,
  Ticket,
  Waves,
} from "lucide-react";

import {
  DEMO_NOTICES,
  PHOTOS,
  formatPeso,
} from "../../data/config.js";

import { useResort } from "../../context/ResortContext.jsx";

import {
  JOURNEY_OFFERS,
  dateAfter,
  addDays,
  bookingHref,
  offerPreview,
} from "../../data/stayJourneys.js";

import {
  CoastalContours,
  Reveal,
  TideCompass,
} from "../../components/StayMotion.jsx";

import "../../styles/stay-booking-architectural.css";

export default function OffersPage() {
  const navigate = useNavigate();

  const {
    accommodations,
    getQuote,
  } = useResort();

  const [activeId, setActiveId] = useState(
    JOURNEY_OFFERS[0].id
  );

  const [arrival, setArrival] = useState(
    () => dateAfter(4)
  );

  const [copied, setCopied] = useState("");

  const active =
    JOURNEY_OFFERS.find(
      (o) => o.id === activeId
    ) || JOURNEY_OFFERS[0];

  const residence = accommodations.find(
    (s) => s.id === active.stayId
  );

  const departure = addDays(
    arrival,
    active.nights
  );

  const quote = residence
    ? getQuote({
        accommodationId: residence.id,
        checkIn: arrival,
        checkOut: departure,
        guests: active.guests,
        addOnIds: [],
      })
    : {
        ok: false,
        error: "Residence not found.",
      };

  const demoPreview = offerPreview(
    active,
    quote
  );

  useEffect(() => {
    document.title = "Special Editions | YOUR STAY.";

    return () => {
      document.title = "YOUR STAY.";
    };
  }, []);

  function select(id) {
    setActiveId(id);
    setCopied("");

    document
      .getElementById("ar3-offer-study")
      ?.scrollIntoView({
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start",
      });
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(
        active.code
      );

      setCopied("SAMPLE CODE COPIED");
    } catch {
      setCopied(
        `COPY MANUALLY: ${active.code}`
      );
    }
  }

  function go() {
    if (!quote.ok || !residence) return;

    navigate(
      bookingHref({
        stayId: residence.id,
        checkIn: arrival,
        checkOut: departure,
        guests: active.guests,
        addOnIds: [],
        offerId: active.id,
      })
    );
  }

  return (
    <div className="ar3 ar3-offers">
      {/* TYPOGRAPHIC COVER */}

      <section className="ar3-offer-cover">
        <div className="ar3-offer-cover__typography">
          <span className="ar3-overline">
            YOUR STAY. / THE SPECIAL EDITION / 05
          </span>

          <span
            className="ar3-offer-cover__outline"
            aria-hidden="true"
          >
            GOOD DAYS
          </span>

          <h1>
            A little extra <em>time.</em>
          </h1>

          <p>
            An editorial exploration of what a
            considered resort promotion could feel like.
            Beautifully imagined, transparently priced.
          </p>

          <a
            href="#ar3-offer-index"
            className="ar3-underlined"
          >
            EXPLORE THE OFFERS
            <ArrowDownRight size={18} />
          </a>

          <div className="ar3-offer-cover__coordinates">
            NOT REAL PROMOTIONS / NO CODES REDEEMED /
            CONCEPT 2026
          </div>
        </div>

        <div className="ar3-offer-cover__visual">
          <img
            src={PHOTOS.escape}
            alt="Illustrative tropical resort exterior"
          />

          <CoastalContours pale />

          <span>THE PRIVATE EDITION</span>

          <div
            className="ar3-offer-cover__rosette"
            aria-hidden="true"
          >
            ✳
            <small>THE UNHURRIED ATLAS</small>
          </div>
        </div>
      </section>

      {/* COLLECTIBLE OFFER FOLIOS */}

      <section
        className="ar3-offer-index ar3-container"
        id="ar3-offer-index"
      >
        <Reveal className="ar3-offer-index__heading">
          <div>
            <span className="ar3-overline">
              01 / THREE GOOD REASONS TO LINGER
            </span>

            <h2>
              Every invitation <em>tells a story.</em>
            </h2>
          </div>

          <p>
            Promotional visuals below are
            hypothetical samples. The local reservation
            system always saves the standard quote,
            not the discount preview.
          </p>
        </Reveal>

        <div className="ar3-offer-folios">
          {JOURNEY_OFFERS.map((item, i) => (
            <Reveal
              as="article"
              key={item.id}
              className={`ar3-offer-folio ar3-offer-folio--${i}`}
              delay={i * 90}
            >
              <div className="ar3-offer-folio__number">
                <b>0{i + 1}</b>

                <span>
                  THE OFFER NOTEBOOK
                </span>
              </div>

              <div className="ar3-offer-folio__photo">
                <img
                  src={item.image}
                  alt={`Illustrative ${item.title} resort getaway`}
                  loading="lazy"
                />

                <span>
                  CONCEPT / NOT REDEEMABLE
                </span>
              </div>

              <div className="ar3-offer-folio__copy">
                <span className="ar3-overline">
                  {item.kicker}
                </span>

                <h3>{item.title}</h3>

                <p>{item.note}</p>

                <div className="ar3-offer-folio__facts">
                  <span>
                    {item.nights} NIGHTS /{" "}
                    {item.guests} GUESTS
                  </span>

                  <span>
                    {item.badge}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    select(item.id)
                  }
                >
                  VIEW PRICING STUDY
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRANSPARENT PRICE CALCULATOR */}

      <section
        className="ar3-offer-study"
        id="ar3-offer-study"
      >
        <div className="ar3-container ar3-offer-study__grid">
          <div
            className="ar3-offer-study__photo"
            key={active.id}
          >
            <img
              src={active.image}
              alt={`Illustrative ${active.title} concept villa`}
            />

            <span>
              PHOTOGRAPHIC REFERENCE / VOL 05
            </span>

            <TideCompass />
          </div>

          <div className="ar3-offer-study__body">
            <span className="ar3-overline">
              02 / THE TRANSPARENT PRICING STUDIO
            </span>

            <h2>
              Imagine the <em>possibility.</em>
            </h2>

            <p className="ar3-offer-study__intro">
              Explore a sample rate illustration.
              Every calculation is explicitly separated
              from the standard reservation quote.
            </p>

            <div className="ar3-offer-study__active">
              <div>
                <span>
                  SELECTED EDITION / {active.code}
                </span>

                <h3>{active.title}</h3>

                <small>
                  {residence?.name}
                  {" / "}
                  {active.nights} NIGHTS
                </small>
              </div>

              <Ticket size={27} />
            </div>

            <label className="ar3-offer-study__date">
              <span>
                <CalendarDays size={15} />
                CHANGE SAMPLE CHECK-IN
              </span>

              <input
                type="date"
                min={dateAfter(0)}
                value={arrival}
                onChange={(e) =>
                  setArrival(e.target.value)
                }
              />
            </label>

            {/* PROMOTION SPECIMEN */}

            <div className="ar3-offer-study__voucher">
              <div>
                <span>
                  SAMPLE PROMOTION CODE
                </span>

                <strong>
                  {active.code}
                </strong>

                <small>
                  DISPLAY-ONLY / NO REDEMPTION
                </small>
              </div>

              <button
                type="button"
                aria-label="Copy example promo code"
                onClick={copyCode}
              >
                <Copy size={20} />
              </button>
            </div>

            {copied && (
              <p
                role="status"
                className="ar3-offer-study__copied"
              >
                {copied}
              </p>
            )}

            {quote.ok ? (
              <>
                <div className="ar3-offer-study__math">
                  <div>
                    <span>
                      STANDARD RESORT ENGINE TOTAL
                    </span>

                    <strong>
                      {formatPeso(quote.total)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      HYPOTHETICAL SAVING
                    </span>

                    <strong>
                      −{formatPeso(
                        demoPreview.saving
                      )}
                    </strong>
                  </div>

                  <div className="ar3-offer-study__illustration">
                    <span>
                      ILLUSTRATIVE PROMO ESTIMATE
                    </span>

                    <strong>
                      {formatPeso(
                        demoPreview.hypotheticalTotal
                      )}
                    </strong>
                  </div>
                </div>

                <p className="ar3-offer-study__warning">
                  <ShieldCheck size={19} />

                  <span>
                    <b>Important:</b> The saved booking
                    will still use{" "}
                    <b>{formatPeso(quote.total)}</b>.
                    This preview is not a live deal
                    or discount.
                  </span>
                </p>
              </>
            ) : (
              <p
                className="ar3-error"
                role="status"
              >
                {quote.error}
              </p>
            )}

            <button
              type="button"
              disabled={!quote.ok}
              className="ar3-main-action"
              onClick={go}
            >
              CONTINUE AT STANDARD DEMO RATE
              <ArrowUpRight size={19} />
            </button>

            <p className="ar3-disclosure">
              {DEMO_NOTICES.booking}
              {" "}
              {DEMO_NOTICES.payment}
            </p>
          </div>
        </div>
      </section>

      {/* FINAL EDITORIAL FRAME */}

      <section className="ar3-offers-finale ar3-container">
        <Reveal>
          <span className="ar3-overline">
            AN INVITATION WITHOUT CONDITIONS
          </span>

          <h2>
            The stay itself is <em>the occasion.</em>
          </h2>

          <p>
            Move beyond the offer study and explore
            thoughtful villas and curated experiences.
          </p>

          <div>
            <Link to="/stays">
              THE RESIDENCE COLLECTION
              <ArrowUpRight size={18} />
            </Link>

            <Link to="/packages">
              CURATED ESCAPES
              <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>

        <div className="ar3-offers-finale__motif">
          <CoastalContours />
          <Waves size={43} />
          <span>THE UNHURRIED ATLAS</span>
        </div>
      </section>
    </div>
  );
}