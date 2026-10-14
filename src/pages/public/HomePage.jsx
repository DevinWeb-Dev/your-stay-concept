import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BedDouble, CalendarDays,
  ChevronDown, Compass, Heart, MoveUpRight, Sun, Users, Waves,
} from "lucide-react";
import {
  ACCOMMODATIONS, BRAND, EXPERIENCES, PHOTOS, RESORT_ZONES,
  formatPeso, getFeaturedStays,
} from "../../data/config.js";
import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";

function dayFromNow(delta) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + delta);
  return localDateKey(date);
}

export default function HomePage() {
  const navigate = useNavigate();
  const { favorites, actions } = useResort();
  const [checkIn, setCheckIn] = useState(() => dayFromNow(2));
  const [checkOut, setCheckOut] = useState(() => dayFromNow(3));
  const [guests, setGuests] = useState(2);
  const featured = getFeaturedStays();

  const submitSearch = (event) => {
    event.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn) return;
    const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/stays?${query.toString()}`);
  };

  return (
    <>
      <section className="ys-hero" aria-labelledby="ys-hero-heading">
        <img className="ys-hero__image" src={PHOTOS.hero} alt="Illustrative tropical resort with blue swimming pool" fetchPriority="high" />
        <div className="ys-hero__shade" />
        <div className="ys-hero__side" aria-hidden="true">CURATED COASTAL ESCAPES — EST. IN IMAGINATION</div>
        <div className="ys-hero__content ys-shell">
          <div className="ys-hero__eyebrow"><span className="ys-line" /> RESORTS · VILLAS · STAYCATIONS</div>
          <h1 id="ys-hero-heading">Find your<br /><em>somewhere.</em></h1>
          <p>Beyond the everyday, there is a place where time slows down and every detail feels like an invitation to stay.</p>
          <Link className="ys-text-link ys-text-link--light" to="/stays">The art of getting away <ArrowUpRight size={20} /></Link>
        </div>
        <button className="ys-hero__scroll" type="button" onClick={() => document.getElementById("ys-intro")?.scrollIntoView({ behavior: "smooth" })}><ArrowDown size={17} /> Scroll to discover</button>
        <div className="ys-hero__index" aria-hidden="true"><b>01</b><span>/ 04</span></div>
      </section>

      <div className="ys-shell ys-search-wrap">
        <form className="ys-search-bar" onSubmit={submitSearch} aria-label="Find an accommodation">
          <div className="ys-search-bar__heading"><Compass size={23} strokeWidth={1.35} /><span>YOUR NEXT<br /><strong>ESCAPE</strong></span></div>
          <label className="ys-search-field"><span><CalendarDays size={15} /> Check in</span>
            <input type="date" value={checkIn} min={dayFromNow(0)}
              onChange={(e) => { setCheckIn(e.target.value); if (checkOut <= e.target.value) { const next = new Date(`${e.target.value}T12:00:00`); next.setDate(next.getDate() + 1); setCheckOut(localDateKey(next)); } }} required />
          </label>
          <label className="ys-search-field"><span><CalendarDays size={15} /> Check out</span>
            <input type="date" value={checkOut} min={checkIn || dayFromNow(1)} onChange={(e) => setCheckOut(e.target.value)} required />
          </label>
          <label className="ys-search-field"><span><Users size={15} /> Guests</span>
            <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((n) => <option value={n} key={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
            </select><ChevronDown size={15} className="ys-search-field__arrow" />
          </label>
          <button className="ys-search-button" type="submit">Explore stays <ArrowUpRight size={20} /></button>
        </form>
      </div>

      <section id="ys-intro" className="ys-intro ys-section ys-shell">
        <div className="ys-intro__left">
          <span className="ys-kicker"><span className="ys-small-line" /> THE FEELING OF BEING AWAY</span>
          <h2 className="ys-display">A little further<br />from <em>ordinary.</em></h2>
        </div>
        <div className="ys-intro__right">
          <span className="ys-intro__symbol"><Sun size={35} strokeWidth={1.2} /></span>
          <p>Some escapes aren't about how far you travel. They're about how deeply you unwind. Discover spaces that give you the freedom to simply be.</p>
          <Link to="/story" className="ys-text-link">Discover the philosophy <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <section className="ys-stay-showcase ys-section" aria-labelledby="ys-featured-heading">
        <div className="ys-shell">
          <div className="ys-section-head">
            <div><span className="ys-kicker">01 / THE COLLECTION</span><h2 id="ys-featured-heading" className="ys-display">Stays worth <em>slowing for.</em></h2></div>
            <Link className="ys-text-link" to="/stays">View all accommodations <ArrowUpRight size={19} /></Link>
          </div>
          <div className="ys-featured-grid">
            {featured.map((stay, index) => {
              const liked = favorites.includes(stay.id);
              return (
                <article key={stay.id} className={`ys-featured-card ${index === 0 ? "ys-featured-card--wide" : ""}`}>
                  <div className="ys-featured-card__media">
                    <img src={stay.images[0]} loading="lazy" alt={`Illustrative photograph for ${stay.name}`} />
                    <span className="ys-featured-card__tag">{index === 0 ? "THE SIGNATURE ESCAPE" : `0${index + 1} / THE COLLECTION`}</span>
                    <button className={`ys-favorite ${liked ? "is-active" : ""}`} aria-label={liked ? `Remove ${stay.name} from favorites` : `Save ${stay.name}`}
                      aria-pressed={liked} type="button" onClick={() => actions.toggleFavorite(stay.id)}><Heart size={19} fill={liked ? "currentColor" : "none"} /></button>
                    <Link className="ys-featured-card__arrow" to={`/stays?stay=${stay.id}`} aria-label={`Explore ${stay.name}`}><ArrowUpRight size={23} /></Link>
                  </div>
                  <div className="ys-featured-card__details">
                    <div><span>{stay.bedrooms} {stay.bedrooms === 1 ? "bedroom" : "bedrooms"} · Up to {stay.maxGuests} guests</span>
                      <h3>{stay.name}</h3><p>{stay.description}</p></div>
                    <div className="ys-featured-card__rate"><small>FROM / NIGHT</small><strong>{formatPeso(stay.nightlyRate)}</strong></div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="ys-photo-note">Illustrative stock photography and demo accommodation rates. No real property is represented.</p>
        </div>
      </section>

      <section className="ys-immersion" aria-label="Discover the resort experience">
        <div className="ys-immersion__image"><img src={PHOTOS.terrace} alt="Illustrative resort terrace and open-air view" loading="lazy" /></div>
        <div className="ys-immersion__copy">
          <span className="ys-kicker ys-kicker--light">02 / THE WAY WE STAY</span>
          <h2 className="ys-display">Space to breathe.<br /><em>Room to feel.</em></h2>
          <p>From quiet coastal suites to private-pool villas, every corner of YOUR STAY is imagined around one beautiful idea: that taking your time is a luxury.</p>
          <div className="ys-immersion__features">
            <span><Waves size={22} strokeWidth={1.3} /> Coastal calm</span>
            <span><BedDouble size={22} strokeWidth={1.3} /> Restful spaces</span>
            <span><Sun size={22} strokeWidth={1.3} /> Unhurried days</span>
          </div>
          <Link className="ys-button ys-button--light" to="/stays">Find your space <ArrowUpRight size={19} /></Link>
        </div>
      </section>

      <section className="ys-zones ys-section ys-shell">
        <div className="ys-section-head ys-section-head--center">
          <div><span className="ys-kicker">03 / A PLACE FOR EVERY PACE</span><h2 className="ys-display">Choose your <em>element.</em></h2></div>
          <p>Three distinct moods. One invitation to feel perfectly at home, wherever you find yourself.</p>
        </div>
        <div className="ys-zone-grid">
          {RESORT_ZONES.map((zone, i) => (
            <Link to={`/stays?zone=${zone.id}`} key={zone.id} className="ys-zone-card">
              <img src={[PHOTOS.pool, PHOTOS.villas, PHOTOS.terrace][i]} alt={`${zone.label} illustrative setting`} loading="lazy" />
              <span>0{i + 1} / EXPLORE</span>
              <div><h3>{zone.label}</h3><p>{zone.caption}</p></div>
              <ArrowUpRight size={22} className="ys-zone-card__arrow" />
            </Link>
          ))}
        </div>
      </section>

      <section className="ys-moments ys-section">
        <div className="ys-shell">
          <div className="ys-section-head"><div><span className="ys-kicker">04 / THE LITTLE THINGS</span><h2 className="ys-display">Moments that <em>linger.</em></h2></div>
            <Link className="ys-text-link" to="/experiences">Explore experiences <ArrowRight size={18} /></Link></div>
          <div className="ys-moment-grid">
            {EXPERIENCES.map((item, i) => (
              <article className="ys-moment" key={item.id}>
                <div className="ys-moment__image"><img src={item.image} alt={`Illustrative ${item.title.toLowerCase()} resort experience`} loading="lazy" /></div>
                <span>0{i + 1} / THE EXPERIENCE</span><h3>{item.title}</h3><p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ys-end-cta" style={{ backgroundImage: `linear-gradient(90deg, rgba(16,47,56,.88), rgba(16,47,56,.30)),url('${PHOTOS.escape}')` }}>
        <div className="ys-shell"><span className="ys-kicker ys-kicker--light">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2 className="ys-display">The world can wait.<br /><em>Your stay can't.</em></h2>
          <p>Make room for the moments you've been meaning to have.</p>
          <Link to="/stays" className="ys-button ys-button--light">Explore the collection <MoveUpRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
