/** YOUR STAY • Frontend demo catalog. All rates/availability are illustrative. */
export const BRAND = Object.freeze({
  name: "YOUR STAY",
  shortName: "YS",
  wordmark: "YOUR STAY.",
  descriptor: "RESORTS · VILLAS · STAYCATIONS",
  tagline: "A place to stay. A feeling to remember.",
  description: "A thoughtfully designed escape, made for moments worth keeping.",
  developerCredit: "Website Concept Made by: Web Developer Devin Planas",
  conceptOnly: true,
  address: "", // Intentionally blank: do not invent a real address.
  email: "",   // Supply the business email when a real client is confirmed.
  phone: "",
});

export const COLORS = Object.freeze({
  lagoon: "#102F38",
  lagoonLight: "#204D55",
  seaGlass: "#BED9D1",
  pearl: "#F6F3EB",
  sand: "#D9C8B3",
  sunset: "#C78067",
  foliage: "#627E70",
  ink: "#183037",
  white: "#FFFFFF",
});

// Remote stock photographs are demo visuals, not photographs of an actual property.
export const PHOTOS = {
  hero: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2200&q=85",
  pool: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85",
  villas: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
  suite: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
  terrace: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=85",
  escape: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=85",
  dining: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=85",
};

export const RESORT_POLICIES = Object.freeze({
  currency: "PHP",
  checkInTime: "15:00",
  checkOutTime: "11:00",
  minimumNights: 1,
  maximumNights: 14,
  maximumAdvanceDays: 365,
  localDemoOnly: true,
  paymentProcessingEnabled: false,
  locationVerified: false,
});

export const STAY_CATEGORIES = [
  { id: "all", label: "All Stays" },
  { id: "villa", label: "Private Villas" },
  { id: "suite", label: "Coastal Suites" },
  { id: "cabin", label: "Nature Hideaways" },
];

export const RESORT_ZONES = [
  { id: "shore", label: "Shoreline", caption: "Steps from the water" },
  { id: "garden", label: "Tropical Garden", caption: "Surrounded by greenery" },
  { id: "ridge", label: "Hillside", caption: "Quiet, scenic outlooks" },
];

export const AMENITIES = [
  { id: "private-pool", label: "Private Pool", icon: "waves" },
  { id: "ocean-view", label: "Ocean View", icon: "sunset" },
  { id: "wifi", label: "Wi-Fi", icon: "wifi" },
  { id: "breakfast", label: "Breakfast Option", icon: "coffee" },
  { id: "aircon", label: "Air Conditioning", icon: "wind" },
  { id: "kitchen", label: "Kitchenette", icon: "cooking-pot" },
  { id: "outdoor", label: "Outdoor Space", icon: "trees" },
  { id: "parking", label: "Parking", icon: "car" },
];

// Demonstration rates are not offers by a real property.
export const ACCOMMODATIONS = [
  {
    id: "lagoon-villa",
    name: "Lagoon Private Villa",
    category: "villa",
    zoneId: "shore",
    description: "Private-pool living with a quiet, open-air coastal atmosphere.",
    longDescription: "Slow mornings, sunlit water, and uninterrupted moments in your own villa retreat.",
    nightlyRate: 9800,
    includedGuests: 4,
    maxGuests: 8,
    extraGuestNightlyRate: 650,
    maxUnits: 1,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 110,
    featured: true,
    amenities: ["private-pool", "ocean-view", "wifi", "aircon", "kitchen", "parking"],
    images: [PHOTOS.pool, PHOTOS.villas, PHOTOS.terrace],
  },
  {
    id: "sea-glass-suite",
    name: "Sea Glass Suite",
    category: "suite",
    zoneId: "shore",
    description: "An intimate coastal room for restful, unhurried escapes.",
    longDescription: "Understated textures and sun-washed tones invite a gentler rhythm.",
    nightlyRate: 4800,
    includedGuests: 2,
    maxGuests: 3,
    extraGuestNightlyRate: 700,
    maxUnits: 1,
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 42,
    featured: true,
    amenities: ["ocean-view", "wifi", "aircon", "breakfast", "parking"],
    images: [PHOTOS.suite, PHOTOS.escape, PHOTOS.terrace],
  },
  {
    id: "palm-garden-villa",
    name: "Palm Garden Villa",
    category: "villa",
    zoneId: "garden",
    description: "Tropical privacy for families and small celebrations.",
    longDescription: "A laid-back villa framed by palms and generous indoor-outdoor spaces.",
    nightlyRate: 7600,
    includedGuests: 4,
    maxGuests: 6,
    extraGuestNightlyRate: 600,
    maxUnits: 1,
    bedrooms: 2,
    bathrooms: 2,
    sizeSqm: 90,
    featured: true,
    amenities: ["private-pool", "wifi", "aircon", "kitchen", "outdoor", "parking"],
    images: [PHOTOS.villas, PHOTOS.pool, PHOTOS.escape],
  },
  {
    id: "ridge-hideaway",
    name: "Ridge Hideaway",
    category: "cabin",
    zoneId: "ridge",
    description: "A serene hideaway overlooking the greener side of paradise.",
    longDescription: "For the traveler who wants fresh air, slow evenings, and time to reconnect.",
    nightlyRate: 4200,
    includedGuests: 2,
    maxGuests: 4,
    extraGuestNightlyRate: 550,
    maxUnits: 1,
    bedrooms: 1,
    bathrooms: 1,
    sizeSqm: 55,
    featured: false,
    amenities: ["wifi", "aircon", "kitchen", "outdoor", "parking"],
    images: [PHOTOS.terrace, PHOTOS.suite, PHOTOS.escape],
  },
];

export const ADD_ONS = [
  { id: "floating-breakfast", name: "Floating Breakfast", price: 1200, unit: "per stay", description: "A playful poolside morning ritual." },
  { id: "sunset-dinner", name: "Sunset Dinner Setup", price: 2800, unit: "per stay", description: "An intimate dining experience with a sunset mood." },
  { id: "celebration", name: "Celebration Styling", price: 1800, unit: "per stay", description: "Simple, elegant setup for special occasions." },
  { id: "early-checkin-request", name: "Early Check-in Request", price: 0, unit: "subject to approval", description: "Request only; early access is not guaranteed." },
];

export const EXPERIENCES = [
  { id: "slow-mornings", title: "Slow Mornings", description: "Coffee, sunshine, and a gentler pace.", image: PHOTOS.terrace },
  { id: "poolside-hours", title: "Poolside Hours", description: "Time for a dip—or absolutely nothing.", image: PHOTOS.pool },
  { id: "tropical-table", title: "The Tropical Table", description: "Dine together, savor longer.", image: PHOTOS.dining },
];

export const DEMO_NOTICES = {
  booking: "Concept booking only. No real reservation is sent to a resort.",
  payment: "No real payment collection is connected.",
  images: "Photographs are illustrative and do not depict a verified YOUR STAY property.",
};

export const formatPeso = (value = 0) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(Number(value) || 0);

export const getStay = (id) => ACCOMMODATIONS.find((stay) => stay.id === id) ?? null;
export const getAddOn = (id) => ADD_ONS.find((addOn) => addOn.id === id) ?? null;
export const getFeaturedStays = () => ACCOMMODATIONS.filter((stay) => stay.featured);
export const getZone = (id) => RESORT_ZONES.find((zone) => zone.id === id) ?? null;
