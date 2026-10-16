import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BedDouble,
  CalendarDays,
  Check,
  Compass,
  Heart,
  Leaf,
  MapPin,
  MoveUpRight,
  Sun,
  Users,
  Waves,
} from "lucide-react";
import {
  ACCOMMODATIONS,
  EXPERIENCES,
  PHOTOS,
  RESORT_ZONES,
  formatPeso,
  getFeaturedStays,
} from "../../data/config.js";
import { localDateKey } from "../../engine/resortEngine.js";
import { useResort } from "../../context/ResortContext.jsx";
import "../../styles/stay-atlas.css";

function dateFromToday(delta) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + delta);
  return localDateKey(date);
}

function nextDay(value) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return localDateKey(date);
}

function SectionIntro({ number, label, heading, italic, children }) {
  return (
    <div className="tsa-section-intro">
      <div>
        <span className="tsa-micro">{number} / {label}</span>
        <h2>{heading} <em>{italic}</em></h2>
      </div>
      {children && <div className="tsa-section-intro__aside">{children}</div>}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { favorites, actions } = useResort();
  const [checkIn, setCheckIn] = useState(() => dateFromToday(2));
  const [checkOut, setCheckOut] = useState(() => dateFromToday(4));
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState("");

  const featured = getFeaturedStays();
  const maxGuests = Math.max(...ACCOMMODATIONS.map((stay) => stay.maxGuests), 1);

  function search(event) {
    event.preventDefault();
    if (!checkIn || !checkOut || checkOut <= checkIn || checkIn < dateFromToday(0)) {
      setDateError("Please select a valid future check-in and a later check-out date.");
      return;
    }
    setDateError("");
    const params = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
    navigate(`/stays?${params}`);
  }

  return (
    <div className="tsa-home">
      <section className="tsa-hero" aria-labelledby="tsa-hero-title">
        <div className="tsa-hero__copy">
          <div className="tsa-hero__overline">
            <span className="tsa-sunmark" aria-hidden="true">✳</span>
            <span>THE UNHURRIED ATLAS / PHILIPPINES INSPIRED</span>
          </div>
          <h1 id="tsa-hero-title">Where time<br />takes a <em>different</em><br />shape.</h1>
          <p>For those who collect mornings, not milestones. Explore imagined coastal hideaways, private villas and moments made to last longer.</p>
          <div className="tsa-hero__actions">
            <Link to="/stays" className="tsa-pill tsa-pill--dark">Find your escape <ArrowUpRight size={19} /></Link>
            <Link to="/story" className="tsa-underline-link">Our point of view <ArrowRight size={18} /></Link>
          </div>
          <div className="tsa-hero__foot">
            <span>01 — AN INVITATION TO SLOW DOWN</span>
            <span><ArrowDown size={16} /> KEEP EXPLORING</span>
          </div>
        </div>
        <div className="tsa-hero__visual">
          <img className="tsa-hero__main-image" src={PHOTOS.hero} alt="Illustrative blue-water resort swimming pool and palms" fetchPriority="high" />
          <div className="tsa-hero__glass" aria-hidden="true" />
          <div className="tsa-hero__ticket">
            <span>POSTCARD / NO. 001</span>
            <strong>More horizon.<br />Less hurry.</strong>
            <Waves size={25} strokeWidth={1.2} />
          </div>
          <img className="tsa-hero__inset" src={PHOTOS.terrace} alt="Illustrative lush resort terrace" />
          <div className="tsa-hero__image-label">THE WORLD CAN WAIT / PHOTO ESSAY 01</div>
          <div className="tsa-hero__roundel" aria-hidden="true"><Sun size={23} /><span>TAKE YOUR<br />SWEET TIME</span></div>
        </div>
      </section>

      <section className="tsa-planner" aria-label="Explore available stays">
        <div className="tsa-planner__heading">
          <span className="tsa-micro">YOUR NEXT CHAPTER</span>
          <strong>Where to?</strong>
          <Compass size={28} strokeWidth={1.2} />
        </div>
        <form onSubmit={search} className="tsa-planner__form">
          <label><span><CalendarDays size={15} /> CHECK IN</span>
            <input type="date" value={checkIn} min={dateFromToday(0)} required
              onChange={(event) => {
                const value = event.target.value;
                setCheckIn(value);
                setDateError("");
                if (value && checkOut <= value) setCheckOut(nextDay(value));
              }} />
          </label>
          <label><span><CalendarDays size={15} /> CHECK OUT</span>
            <input type="date" value={checkOut} min={checkIn ? nextDay(checkIn) : dateFromToday(1)} required
              onChange={(event) => { setCheckOut(event.target.value); setDateError(""); }} />
          </label>
          <label><span><Users size={15} /> GUESTS</span>
            <select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>
              {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
              ))}
            </select>
          </label>
          <button type="submit">Explore stays <ArrowUpRight size={19} /></button>
        </form>
        {dateError && <p className="tsa-planner__error" role="alert">{dateError}</p>}
      </section>

      <section className="tsa-manifesto" id="discover">
        <div className="tsa-manifesto__stamp" aria-hidden="true">✳</div>
        <p className="tsa-micro">A LITTLE NOTE FROM ELSEWHERE</p>
        <h2>What if the best thing<br />on your itinerary was <em>nothing?</em></h2>
        <div className="tsa-manifesto__foot">
          <span>WELCOME TO THE ART OF BEING AWAY.</span>
          <Link to="/story">The YOUR STAY philosophy <ArrowUpRight size={18} /></Link>
        </div>
      </section>

      <section className="tsa-collection" aria-labelledby="tsa-collection-title">
        <div className="tsa-container">
          <SectionIntro number="01" label="THE PRIVATE COLLECTION" heading="Rooms to" italic="remember.">
            <p>Four ways to step away. From private-pool mornings to cool green hideaways, each stay tells a different story.</p>
            <Link to="/stays">The complete collection <ArrowUpRight size={18} /></Link>
          </SectionIntro>
          <div className="tsa-collection__grid">
            {featured.map((stay, index) => {
              const liked = favorites.includes(stay.id);
              return (
                <article className={`tsa-stay tsa-stay--${index + 1}`} key={stay.id}>
                  <div className="tsa-stay__visual">
                    <Link to={`/stays/${stay.id}`} aria-label={`See details for ${stay.name}`} className="tsa-stay__image-link">
                      <img src={stay.images[0]} alt={`Illustrative photograph for ${stay.name}`} loading="lazy" />
                    </Link>
                    <span className="tsa-stay__index">STAY / {String(index + 1).padStart(2, "0")}</span>
                    <button
                      className={`tsa-stay__favorite ${liked ? "is-liked" : ""}`}
                      type="button"
                      aria-label={`${liked ? "Remove" : "Save"} ${stay.name} ${liked ? "from" : "to"} saved stays`}
                      aria-pressed={liked}
                      onClick={() => actions.toggleFavorite(stay.id)}
                    >
                      <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <div className="tsa-stay__details">
                    <div><span className="tsa-micro">{stay.bedrooms} BEDROOM{stay.bedrooms !== 1 ? "S" : ""} / UP TO {stay.maxGuests} GUESTS</span>
                      <h3><Link to={`/stays/${stay.id}`}>{stay.name}</Link></h3>
                      <p>{stay.description}</p>
                    </div>
                    <div className="tsa-stay__price"><span>FROM / NIGHT</span><strong>{formatPeso(stay.nightlyRate)}</strong></div>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="tsa-photo-disclaimer">Images, accommodations and nightly rates are illustrative. No real resort or property is represented.</p>
        </div>
      </section>

      <section className="tsa-escape" aria-labelledby="tsa-escape-title">
        <div className="tsa-escape__photo">
          <img src={PHOTOS.escape} alt="Illustrative warm resort architecture surrounded by palms" loading="lazy" />
          <span>FIELD NOTE / THE QUIETER SIDE</span>
        </div>
        <div className="tsa-escape__body">
          <span className="tsa-micro">02 / SMALL PLEASURES, BIG SKY</span>
          <h2 id="tsa-escape-title">A place for<br />the <em>in-between.</em></h2>
          <p>Slow breakfasts, long swims, afternoons without an agenda. This is travel that feels less like an itinerary and more like coming home to yourself.</p>
          <div className="tsa-escape__lines">
            <span><Sun size={21} /> Unhurried mornings</span>
            <span><Waves size={21} /> Space to unwind</span>
            <span><Leaf size={21} /> Nature close by</span>
          </div>
          <Link to="/experiences" className="tsa-pill tsa-pill--light">The little experiences <ArrowUpRight size={19} /></Link>
        </div>
      </section>

      <section className="tsa-moods" aria-labelledby="tsa-moods-title">
        <div className="tsa-container">
          <SectionIntro number="03" label="THE DESTINATION GUIDE" heading="Follow your" italic="feeling.">
            <p>Not every escape looks the same. Start with the landscape that speaks your language.</p>
          </SectionIntro>
          <div className="tsa-moods__grid">
            {RESORT_ZONES.map((zone, index) => (
              <Link to={`/stays?zone=${zone.id}`} key={zone.id} className="tsa-mood">
                <div className="tsa-mood__image">
                  <img src={[PHOTOS.pool, PHOTOS.villas, PHOTOS.terrace][index % 3]} alt={`Illustrative ${zone.label} resort setting`} loading="lazy" />
                </div>
                <span className="tsa-mood__num">0{index + 1} / THE DESTINATION</span>
                <div className="tsa-mood__caption"><h3>{zone.label}</h3><p>{zone.caption}</p></div>
                <MoveUpRight size={24} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tsa-experiences" aria-labelledby="tsa-experiences-title">
        <div className="tsa-container">
          <SectionIntro number="04" label="COLLECT MOMENTS" heading="The good" italic="kind of nothing.">
            <Link to="/experiences">All experiences <ArrowUpRight size={18} /></Link>
          </SectionIntro>
          <div className="tsa-experiences__grid">
            {EXPERIENCES.map((experience, index) => (
              <Link className="tsa-experience" to="/experiences" key={experience.id}>
                <div className="tsa-experience__photo"><img src={experience.image} alt={`Illustrative ${experience.title.toLowerCase()} experience`} loading="lazy" /></div>
                <div><span className="tsa-micro">MOMENT / 0{index + 1}</span><h3>{experience.title}</h3><p>{experience.description}</p></div>
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="tsa-finale" aria-labelledby="tsa-finale-title">
        <img src={PHOTOS.terrace} alt="Illustrative lush resort terrace" loading="lazy" />
        <div className="tsa-finale__shade" />
        <span className="tsa-micro">THERE'S A WHOLE WORLD TO UNHURRY IN</span>
        <h2 id="tsa-finale-title">The best days<br />are still <em>ahead.</em></h2>
        <p>Plan an imaginary getaway with our interactive resort booking prototype.</p>
        <Link to="/booking">Begin your stay <ArrowUpRight size={20} /></Link>
        <span className="tsa-finale__number">YOUR STAY / 01 — 2026</span>
      </section>
    </div>
  );
}