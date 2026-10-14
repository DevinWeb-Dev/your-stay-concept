import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  ShieldCheck,
  Users,
  Waves,
} from "lucide-react";

import {
  ACCOMMODATIONS,
  ADD_ONS,
  AMENITIES,
  DEMO_NOTICES,
  RESORT_POLICIES,
  formatPeso,
  getZone,
} from "../../data/config.js";

import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function dateFromNow(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function nextDay(value) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return localDateKey(date);
}

export default function VillaDetailsPage() {
  const { stayId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {
    accommodations,
    favorites,
    actions,
    getQuote,
    getAvailability,
  } = useResort();

  const stay = accommodations.find((item) => item.id === stayId);

  const [photoIndex, setPhotoIndex] = useState(0);
  const [checkIn, setCheckIn] = useState(
    params.get("checkIn") || dateFromNow(2)
  );
  const [checkOut, setCheckOut] = useState(
    params.get("checkOut") || dateFromNow(3)
  );
  const [guests, setGuests] = useState(
    Number(params.get("guests")) || 2
  );
  const [addOnIds, setAddOnIds] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setPhotoIndex(0);
  }, [stayId]);

  if (!stay) {
    return (
      <section className="ys3-empty ys-shell">
        <span className="ys-kicker">ACCOMMODATION NOT FOUND</span>
        <h1 className="ys-display">Let's find your <em>somewhere.</em></h1>
        <p>That accommodation is not part of our concept collection.</p>
        <Link to="/stays" className="ys3-btn">
          Explore stays <ArrowRight size={18} />
        </Link>
      </section>
    );
  }

  const effectiveGuests = Math.min(
    Math.max(1, guests),
    stay.maxGuests
  );

  const images = stay.images;
  const activeImage = images[photoIndex % images.length];

  const input = {
    accommodationId: stay.id,
    checkIn,
    checkOut,
    guests: effectiveGuests,
    addOnIds,
  };

  const quote = getQuote(input);
  const availability = getAvailability(input);
  const liked = favorites.includes(stay.id);

  const zone = getZone(stay.zoneId);

  function changeCheckIn(value) {
    setCheckIn(value);

    if (value && checkOut <= value) {
      setCheckOut(nextDay(value));
    }
  }

  function toggleAddOn(id) {
    setAddOnIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function openBooking() {
    if (!quote.ok) {
      setNotice(quote.error);
      return;
    }

    const query = new URLSearchParams({
      stay: stay.id,
      checkIn,
      checkOut,
      guests: String(effectiveGuests),
      addOns: addOnIds.join(","),
    });

    navigate(`/booking?${query.toString()}`);
  }

  function changePhoto(direction) {
    setPhotoIndex((current) =>
      (current + direction + images.length) % images.length
    );
  }

  const related = ACCOMMODATIONS.filter(
    (item) => item.id !== stay.id
  ).slice(0, 2);

  return (
    <div className="ys3-page">
      <section className="ys3-detail-intro ys-shell">
        <Link to="/stays" className="ys3-back">
          <ArrowLeft size={16} />
          Back to the collection
        </Link>

        <div className="ys3-detail-heading">
          <div>
            <span className="ys-kicker">
              THE COLLECTION / PRIVATE ESCAPES
            </span>
            <h1 className="ys3-title">{stay.name}</h1>

            <p className="ys3-muted">
              <MapPin size={15} />
              {zone?.label || "Your private retreat"}
              <span className="ys3-dot">·</span>
              {stay.sizeSqm} m²
              <span className="ys3-dot">·</span>
              Up to {stay.maxGuests} guests
            </p>
          </div>

          <button
            type="button"
            className={`ys3-save ${liked ? "is-saved" : ""}`}
            aria-pressed={liked}
            onClick={() => {
              const result = actions.toggleFavorite(stay.id);

              if (!result.ok) {
                setNotice(result.error);
              }
            }}
          >
            <Heart
              size={18}
              fill={liked ? "currentColor" : "none"}
            />
            {liked ? "Saved" : "Save stay"}
          </button>
        </div>

        <div className="ys3-photo-layout">
          <div className="ys3-photo-main">
            <img
              src={activeImage}
              alt={`Illustrative view of ${stay.name}`}
            />

            <div className="ys3-photo-nav">
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => changePhoto(-1)}
              >
                <ChevronLeft size={20} />
              </button>
              <span>
                {photoIndex + 1} / {images.length}
              </span>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => changePhoto(1)}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="ys3-photo-thumbs">
            {images.map((image, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPhotoIndex(index)}
                className={index === photoIndex ? "is-active" : ""}
                aria-label={`View photo ${index + 1}`}
                aria-pressed={index === photoIndex}
              >
                <img
                  src={image}
                  alt={`Illustrative ${stay.name} photo ${index + 1}`}
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="ys3-shell ys3-detail-grid ys3-section">
        <div className="ys3-detail-content">
          <span className="ys-kicker">THE EXPERIENCE</span>
          <h2 className="ys3-heading">
            Make room for <em>the moment.</em>
          </h2>

          <p className="ys3-lead">{stay.longDescription}</p>
          <p className="ys3-muted">{stay.description}</p>

          <div className="ys3-feature-strip">
            <div>
              <BedDouble size={23} />
              <strong>{stay.bedrooms}</strong>
              <span>Bedrooms</span>
            </div>
            <div>
              <Waves size={23} />
              <strong>{stay.bathrooms}</strong>
              <span>Bathrooms</span>
            </div>
            <div>
              <Users size={23} />
              <strong>{stay.maxGuests}</strong>
              <span>Max guests</span>
            </div>
            <div>
              <Maximize2 size={23} />
              <strong>{stay.sizeSqm} m²</strong>
              <span>Floor area</span>
            </div>
          </div>

          <div className="ys3-rule" />

          <span className="ys-kicker">THOUGHTFUL DETAILS</span>
          <h3 className="ys3-subheading">
            Everything you need to <em>slow down.</em>
          </h3>

          <div className="ys3-amenities">
            {stay.amenities.map((id) => {
              const amenity = AMENITIES.find(
                (item) => item.id === id
              );

              return (
                <div key={id}>
                  <Check size={17} />
                  {amenity?.label || id}
                </div>
              );
            })}
          </div>

          <div className="ys3-rule" />

          <span className="ys-kicker">BEFORE YOU ARRIVE</span>

          <div className="ys3-policies">
            <div>
              <strong>Check-in</strong>
              <span>{RESORT_POLICIES.checkInTime}</span>
            </div>
            <div>
              <strong>Check-out</strong>
              <span>{RESORT_POLICIES.checkOutTime}</span>
            </div>
            <div>
              <strong>Maximum stay</strong>
              <span>{RESORT_POLICIES.maximumNights} nights</span>
            </div>
          </div>

          <p className="ys3-disclaimer">{DEMO_NOTICES.images}</p>
        </div>

        <aside className="ys3-book-card">
          <span className="ys-kicker">YOUR PRIVATE ESCAPE</span>

          <div className="ys3-rate">
            <strong>{formatPeso(stay.nightlyRate)}</strong>
            <span>/ night · demo rate</span>
          </div>

          <div className="ys3-form-grid">
            <label className="ys3-field">
              <span>CHECK IN</span>
              <input
                type="date"
                min={dateFromNow(0)}
                value={checkIn}
                onChange={(e) => changeCheckIn(e.target.value)}
              />
            </label>

            <label className="ys3-field">
              <span>CHECK OUT</span>
              <input
                type="date"
                min={checkIn || dateFromNow(1)}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </label>

            <label className="ys3-field ys3-full">
              <span>NUMBER OF GUESTS</span>
              <select
                value={effectiveGuests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {Array.from(
                  { length: stay.maxGuests },
                  (_, i) => i + 1
                ).map((number) => (
                  <option key={number} value={number}>
                    {number} {number === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="ys3-rule" />

          <span className="ys-kicker">MAKE IT YOURS</span>

          <div className="ys3-addons">
            {ADD_ONS.map((addon) => (
              <label key={addon.id} className="ys3-addon">
                <input
                  type="checkbox"
                  checked={addOnIds.includes(addon.id)}
                  onChange={() => toggleAddOn(addon.id)}
                />
                <span>
                  <strong>{addon.name}</strong>
                  <small>{addon.description}</small>
                </span>
                <b>
                  {addon.price > 0
                    ? `+${formatPeso(addon.price)}`
                    : "Request"}
                </b>
              </label>
            ))}
          </div>

          {quote.ok ? (
            <div className="ys3-price-breakdown">
              <div>
                <span>
                  {quote.nights} night{quote.nights !== 1 ? "s" : ""}
                </span>
                <span>{formatPeso(quote.nightlySubtotal)}</span>
              </div>

              {quote.extraGuestTotal > 0 && (
                <div>
                  <span>Extra guests</span>
                  <span>{formatPeso(quote.extraGuestTotal)}</span>
                </div>
              )}

              {quote.addOnTotal > 0 && (
                <div>
                  <span>Selected extras</span>
                  <span>{formatPeso(quote.addOnTotal)}</span>
                </div>
              )}

              <div className="ys3-total">
                <strong>Estimated total</strong>
                <strong>{formatPeso(quote.total)}</strong>
              </div>
            </div>
          ) : (
            <p className="ys3-error" role="status">
              {quote.error || availability.reason}
            </p>
          )}

          <button
            type="button"
            className="ys3-btn ys3-btn--wide"
            disabled={!quote.ok}
            onClick={openBooking}
          >
            Continue to booking <ArrowUpRight size={18} />
          </button>

          {notice && (
            <p className="ys3-error" role="alert">
              {notice}
            </p>
          )}

          <div className="ys3-trust">
            <ShieldCheck size={17} />
            Demo booking only — no real charge or confirmation
          </div>
        </aside>
      </section>

      <section className="ys3-related ys3-section">
        <div className="ys3-shell">
          <span className="ys-kicker">DISCOVER MORE</span>
          <h2 className="ys3-heading">
            Other ways to <em>get away.</em>
          </h2>

          <div className="ys3-card-grid">
            {related.map((item) => (
              <Link
                to={`/stays/${item.id}`}
                key={item.id}
                className="ys3-image-card"
              >
                <img
                  src={item.images[0]}
                  alt={`Illustrative ${item.name}`}
                  loading="lazy"
                />
                <div>
                  <h3>{item.name}</h3>
                  <span>
                    From {formatPeso(item.nightlyRate)} / night
                  </span>
                  <ArrowUpRight size={19} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}