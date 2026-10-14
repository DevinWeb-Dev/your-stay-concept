import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BedDouble, CalendarDays,
  Check, CheckCircle2, ChevronDown, Heart, Search, SlidersHorizontal,
  Sparkles, Users, Waves, X,
} from "lucide-react";
import {
  ACCOMMODATIONS, ADD_ONS, AMENITIES, BRAND, PHOTOS, RESORT_ZONES,
  STAY_CATEGORIES, DEMO_NOTICES, formatPeso,
} from "../../data/config.js";
import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function dateOffset(n) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + n);
  return localDateKey(date);
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export default function StaysPage() {
  const [params] = useSearchParams();
  const { accommodations, favorites, actions, getQuote } = useResort();
  const [category, setCategory] = useState("all");
  const [zone, setZone] = useState(params.get("zone") || "all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recommended");
  const [showFavorites, setShowFavorites] = useState(params.get("favorites") === "1");
  const [guests, setGuests] = useState(Math.max(1, Math.min(8, Number(params.get("guests")) || 2)));
  const [checkIn, setCheckIn] = useState(params.get("checkIn") || dateOffset(2));
  const [checkOut, setCheckOut] = useState(params.get("checkOut") || dateOffset(3));
  const [compare, setCompare] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get("stay") || null);
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [addOnIds, setAddOnIds] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [reservation, setReservation] = useState(null);
  const selected = accommodations.find((s) => s.id === selectedId) || null;

  useEffect(() => {
    if (!selected) return;
    const close = (event) => event.key === "Escape" && setSelectedId(null);
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [selected]);

  const results = useMemo(() => {
    const query = search.toLowerCase().trim();
    return accommodations
      .filter((s) => category === "all" || s.category === category)
      .filter((s) => zone === "all" || s.zoneId === zone)
      .filter((s) => s.maxGuests >= guests)
      .filter((s) => !showFavorites || favorites.includes(s.id))
      .filter((s) => !query || `${s.name} ${s.description} ${s.amenities.join(" ")}`.toLowerCase().includes(query))
      .sort((a, b) => sort === "price-low" ? a.nightlyRate - b.nightlyRate
        : sort === "price-high" ? b.nightlyRate - a.nightlyRate
          : sort === "capacity" ? b.maxGuests - a.maxGuests
            : Number(b.featured) - Number(a.featured));
  }, [accommodations, category, zone, search, guests, showFavorites, favorites, sort]);

  const reservationGuests = selected ? Math.min(guests, selected.maxGuests) : guests;
  const selectedQuote = selected ? getQuote({ accommodationId: selected.id, checkIn, checkOut, guests: reservationGuests, addOnIds }) : null;
  const compareStays = compare.map((id) => accommodations.find((s) => s.id === id)).filter(Boolean);

  function openStay(id) {
    setSelectedId(id);
    setAddOnIds([]);
    setFeedback("");
    setReservation(null);
  }
  function changeCheckIn(next) {
    setCheckIn(next);
    if (next && checkOut <= next) {
      const d = new Date(`${next}T12:00:00`);
      d.setDate(d.getDate() + 1);
      setCheckOut(localDateKey(d));
    }
  }
  function toggleCompare(id) {
    setCompare((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : current.length < 2 ? [...current, id] : current);
  }
  function submitReservation(event) {
    event.preventDefault();
    if (!selectedQuote?.ok || !selected) return;
    const result = actions.reserveStay({
      accommodationId: selected.id, checkIn, checkOut, guests: reservationGuests,
      addOnIds, guestName: guestName.trim(), email: email.trim(),
    });
    if (result.ok) {
      setReservation(result.booking);
      setFeedback("");
    } else {
      setFeedback(result.error || "Unable to save this demo reservation.");
    }
  }

  return (
    <>
      <section className="ys-stays-hero">
        <img src={PHOTOS.villas} alt="Illustrative resort architecture and villa" />
        <div className="ys-stays-hero__shade" />
        <div className="ys-shell ys-stays-hero__content">
          <span className="ys-kicker ys-kicker--light">THE COLLECTION / 01—04</span>
          <h1 className="ys-display">A stay for<br /><em>every kind of escape.</em></h1>
          <p>Private villas, intimate suites, and hideaways designed for doing just a little less.</p>
        </div>
      </section>

      <section className="ys-shell ys-catalog ys-section" aria-label="Find your accommodation">
        <div className="ys-section-head ys-catalog__head">
          <div><span className="ys-kicker">THE COLLECTION</span><h2 className="ys-display">Make yourself <em>at home.</em></h2></div>
          <p>Explore four imagined spaces, each with its own distinct atmosphere. Dates and rates are illustrative.</p>
        </div>

        <div className="ys-catalog-filter">
          <label><span>CHECK IN</span><input type="date" min={dateOffset(0)} value={checkIn} onChange={(e) => changeCheckIn(e.target.value)} /></label>
          <label><span>CHECK OUT</span><input type="date" min={checkIn || dateOffset(1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label>
          <label><span>GUESTS</span><select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
          </select></label>
          <label><span>SETTING</span><select value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="all">All settings</option>{RESORT_ZONES.map((z) => <option key={z.id} value={z.id}>{z.label}</option>)}
          </select></label>
        </div>

        <div className="ys-catalog__toolbar">
          <div className="ys-tabs" aria-label="Accommodation type">
            {STAY_CATEGORIES.map((c) => <button key={c.id} type="button" className={category === c.id ? "is-active" : ""}
              onClick={() => setCategory(c.id)} aria-pressed={category === c.id}>{c.label}</button>)}
          </div>
          <div className="ys-catalog__tools">
            <label className="ys-catalog__search"><Search size={16} /><input aria-label="Search stays" placeholder="Search stays" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
            <label className="ys-catalog__sort"><SlidersHorizontal size={16} /><select aria-label="Sort accommodations" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="recommended">Recommended</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="capacity">Guest capacity</option>
            </select></label>
            <button type="button" className={`ys-only-favorites ${showFavorites ? "is-active" : ""}`} aria-pressed={showFavorites}
              onClick={() => setShowFavorites((value) => !value)}><Heart size={16} /> Saved ({favorites.length})</button>
          </div>
        </div>
        <div className="ys-catalog__count">SHOWING {results.length} OF {ACCOMMODATIONS.length} STAYS</div>
        {results.length === 0 ? (
          <div className="ys-empty"><Waves size={38} strokeWidth={1.2} /><h3>No stays found for those filters.</h3>
            <p>Try fewer guests, a different setting, or show all accommodation types.</p>
            <button type="button" className="ys-button" onClick={() => { setCategory("all"); setZone("all"); setGuests(2); setSearch(""); setShowFavorites(false); }}>Clear filters <ArrowRight size={18} /></button>
          </div>
        ) : (
          <div className="ys-listing-grid">
            {results.map((stay) => {
              const liked = favorites.includes(stay.id);
              const isCompared = compare.includes(stay.id);
              const quote = getQuote({ accommodationId: stay.id, checkIn, checkOut, guests, addOnIds: [] });
              return (
                <article key={stay.id} className="ys-listing-card">
                  <div className="ys-listing-card__image">
                    <img src={stay.images[0]} alt={`Illustrative view of ${stay.name}`} loading="lazy" />
                    <span className="ys-listing-card__badge">{stay.category === "villa" ? "PRIVATE VILLA" : stay.category === "suite" ? "COASTAL SUITE" : "NATURE HIDEAWAY"}</span>
                    <button type="button" className={`ys-favorite ${liked ? "is-active" : ""}`} aria-pressed={liked} aria-label={liked ? `Unsave ${stay.name}` : `Save ${stay.name}`}
                      onClick={() => actions.toggleFavorite(stay.id)}><Heart size={19} fill={liked ? "currentColor" : "none"} /></button>
                  </div>
                  <div className="ys-listing-card__body">
                    <div className="ys-listing-card__meta"><span><BedDouble size={15} /> {stay.bedrooms} {stay.bedrooms === 1 ? "bedroom" : "bedrooms"}</span><span><Users size={15} /> Up to {stay.maxGuests} guests</span></div>
                    <h3>{stay.name}</h3><p>{stay.description}</p>
                    <div className="ys-amenity-chips">{stay.amenities.slice(0, 3).map((id) => <span key={id}>{AMENITIES.find((a) => a.id === id)?.label || id}</span>)}</div>
                    <div className="ys-listing-card__availability"><span className={quote.ok ? "is-available" : ""} />{quote.ok ? `${quote.nights} night${quote.nights === 1 ? "" : "s"} available in demo` : (quote.error || "Change dates to check")}</div>
                    <div className="ys-listing-card__bottom">
                      <div className="ys-listing-card__price"><small>FROM / NIGHT</small><strong>{formatPeso(stay.nightlyRate)}</strong></div>
                      <button type="button" className="ys-button" onClick={() => openStay(stay.id)}>Explore stay <ArrowUpRight size={18} /></button>
                    </div>
                    <label className="ys-compare-check"><input type="checkbox" checked={isCompared} onChange={() => toggleCompare(stay.id)} disabled={!isCompared && compare.length >= 2} /> Compare this stay</label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p className="ys-photo-note">All accommodation names, prices, photographs and availability are examples for this concept website, not real resort offers.</p>
      </section>

      {compareStays.length > 0 && (
        <aside className="ys-compare-bar" aria-label="Stay comparison">
          <div className="ys-compare-bar__items"><strong>YOUR SHORTLIST</strong>{compareStays.map((stay) => <span key={stay.id}>{stay.name}<button type="button" aria-label={`Remove ${stay.name}`} onClick={() => toggleCompare(stay.id)}><X size={14} /></button></span>)}</div>
          <button type="button" className="ys-button ys-button--light" disabled={compareStays.length < 2} onClick={() => document.getElementById("ys-compare-details")?.showModal()}>Compare {compareStays.length}/2 <ArrowUpRight size={17} /></button>
        </aside>
      )}

      <dialog id="ys-compare-details" className="ys-dialog ys-compare-dialog">
        <div className="ys-dialog__top"><span className="ys-kicker">SIDE BY SIDE</span><button type="button" aria-label="Close comparison" onClick={() => document.getElementById("ys-compare-details")?.close()}><X size={22} /></button></div>
        <h2 className="ys-display">Find your <em>fit.</em></h2>
        <div className="ys-comparison-grid">{compareStays.map((s) => <div key={s.id}>
          <img src={s.images[0]} alt={`Illustrative ${s.name}`} /><h3>{s.name}</h3>
          <p>{formatPeso(s.nightlyRate)} / night</p><p>{s.bedrooms} bedrooms · {s.bathrooms} bathrooms</p><p>Up to {s.maxGuests} guests · {s.sizeSqm} m²</p>
          <button className="ys-button" type="button" onClick={() => { document.getElementById("ys-compare-details")?.close(); openStay(s.id); }}>View & reserve <ArrowRight size={17} /></button>
        </div>)}</div>
      </dialog>

      {selected && (
        <div className="ys-modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedId(null); }}>
          <section className="ys-booking-modal" role="dialog" aria-modal="true" aria-label={`Explore ${selected.name}`}>
            <button type="button" className="ys-booking-modal__close" aria-label="Close booking details" onClick={() => setSelectedId(null)}><X size={23} /></button>
            <div className="ys-booking-modal__cover"><img src={selected.images[0]} alt={`Illustrative accommodation ${selected.name}`} /></div>
            <div className="ys-booking-modal__content">
              {reservation ? (
                <div className="ys-booking-success" role="status"><CheckCircle2 size={45} /><span className="ys-kicker">SAVED IN THIS BROWSER</span>
                  <h2 className="ys-display">Your demo stay<br /><em>is reserved.</em></h2>
                  <p>Reference: <strong>{reservation.id}</strong></p>
                  <p>{formatDate(reservation.checkIn)} — {formatDate(reservation.checkOut)} · {reservation.guests} guest(s)</p>
                  <p className="ys-booking-warning">This is not a real reservation. No email has been sent, and no payment was taken.</p>
                  <button className="ys-button" type="button" onClick={() => setSelectedId(null)}>Back to collection <ArrowRight size={17} /></button>
                </div>
              ) : (
                <>
                  <span className="ys-kicker">YOUR PRIVATE ESCAPE</span><h2 className="ys-display">{selected.name}</h2>
                  <p>{selected.longDescription}</p>
                  <div className="ys-modal-highlights"><span>{selected.bedrooms} bedroom(s)</span><span>{selected.bathrooms} bathroom(s)</span><span>{selected.sizeSqm} m²</span><span>Max {selected.maxGuests} guests</span></div>
                  <div className="ys-modal-amenities">{selected.amenities.map((id) => <span key={id}><Check size={15} /> {AMENITIES.find((a) => a.id === id)?.label || id}</span>)}</div>
                  <form onSubmit={submitReservation} className="ys-booking-form">
                    <div className="ys-booking-form__row"><label>CHECK IN<input required type="date" min={dateOffset(0)} value={checkIn} onChange={(e) => changeCheckIn(e.target.value)} /></label>
                      <label>CHECK OUT<input required type="date" min={checkIn || dateOffset(1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label></div>
                    <label>GUESTS<select value={reservationGuests} onChange={(e) => setGuests(Number(e.target.value))}>
                      {Array.from({ length: selected.maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}</select></label>
                    <p className="ys-kicker ys-booking-form__addon-title">ENHANCE YOUR STAY / OPTIONAL</p>
                    <div className="ys-booking-form__addons">{ADD_ONS.map((addon) => <label key={addon.id}><input type="checkbox" checked={addOnIds.includes(addon.id)} onChange={(e) => setAddOnIds((old) => e.target.checked ? [...old, addon.id] : old.filter((id) => id !== addon.id))} /> <span>{addon.name}</span><b>{addon.price ? `+${formatPeso(addon.price)}` : "On request"}</b></label>)}</div>
                    <div className="ys-booking-form__row"><label>GUEST NAME<input required minLength={2} maxLength={80} value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" /></label>
                      <label>EMAIL<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label></div>
                    <div className="ys-quote"><span>{selectedQuote?.ok ? `${selectedQuote.nights} night(s) · estimated total` : "Availability / estimate"}</span>
                      <strong>{selectedQuote?.ok ? formatPeso(selectedQuote.total) : "—"}</strong></div>
                    {!selectedQuote?.ok && <p className="ys-form-error" role="status">{selectedQuote?.error || "Please choose valid dates."}</p>}
                    {feedback && <p className="ys-form-error" role="alert">{feedback}</p>}
                    <button type="submit" className="ys-button ys-button--wide" disabled={!selectedQuote?.ok}>Save demo reservation <ArrowUpRight size={19} /></button>
                    <p className="ys-booking-warning">{DEMO_NOTICES.booking} {DEMO_NOTICES.payment}</p>
                  </form>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
