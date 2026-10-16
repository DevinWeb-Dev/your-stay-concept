import { PHOTOS } from "./config.js";

/*
  YOUR STAY. — CURATED JOURNEYS
  Editorial resort concepts only.
  No real promotional discounts or transactions.
*/

export const JOURNEY_PACKAGES = [
  {
    id: "lagoon-escape",
    number: "01",
    category: "romance",
    kicker: "THE WATER EDITION",
    title: "The Lagoon Escape",
    subtitle: "A slower kind of morning.",
    note:
      "Private-pool hours, long conversations, and a floating breakfast worth lingering over.",
    image: PHOTOS.pool,
    stayId: "lagoon-villa",
    guests: 2,
    nights: 2,
    addOnIds: ["floating-breakfast"],
    inclusions: [
      "Two nights in the Lagoon Private Villa",
      "Floating Breakfast",
      "Privacy and poolside downtime",
    ],
  },
  {
    id: "garden-gathering",
    number: "02",
    category: "together",
    kicker: "THE TOGETHER EDITION",
    title: "The Garden Gathering",
    subtitle: "Together, without a schedule.",
    note:
      "An easy tropical reunion with thoughtful celebration details and shared space.",
    image: PHOTOS.villas,
    stayId: "palm-garden-villa",
    guests: 4,
    nights: 2,
    addOnIds: ["celebration"],
    inclusions: [
      "Two nights in the Palm Garden Villa",
      "Celebration Styling",
      "Relaxed space for four",
    ],
  },
  {
    id: "sea-glass-weekend",
    number: "03",
    category: "romance",
    kicker: "THE SLOW WEEKEND",
    title: "The Sea Glass Weekend",
    subtitle: "Two days of quiet discovery.",
    note:
      "A cozy suite, an imagined sunset dinner, and time to settle into the coastal rhythm.",
    image: PHOTOS.suite,
    stayId: "sea-glass-suite",
    guests: 2,
    nights: 2,
    addOnIds: ["sunset-dinner"],
    inclusions: [
      "Two nights in Sea Glass Suite",
      "Sunset Dinner Setup",
      "Coastal downtime",
    ],
  },
  {
    id: "ridge-reset",
    number: "04",
    category: "nature",
    kicker: "THE QUIET EDITION",
    title: "The Ridge Reset",
    subtitle: "More nature. Less noise.",
    note:
      "A gentle escape to green views and unhurried mornings, without a complicated itinerary.",
    image: PHOTOS.terrace,
    stayId: "ridge-hideaway",
    guests: 2,
    nights: 3,
    addOnIds: [],
    inclusions: [
      "Three nights in Ridge Hideaway",
      "A quieter hillside atmosphere",
      "Flexible personal time",
    ],
  },
];

export const JOURNEY_OFFERS = [
  {
    id: "first-light",
    number: "01",
    kicker: "AN EARLY INTERLUDE",
    title: "First Light",
    note:
      "An illustrative early-escape savings idea. Sample only, not a real promotion.",
    code: "FIRSTLIGHT",
    badge: "10% SAMPLE",
    image: PHOTOS.pool,
    stayId: "lagoon-villa",
    guests: 2,
    nights: 2,
    discountPercent: 10,
  },
  {
    id: "longer-afternoons",
    number: "02",
    kicker: "STAY A LITTLE LONGER",
    title: "Longer Afternoons",
    note:
      "A hypothetical incentive for stretching the weekend into one more golden afternoon.",
    code: "LONGERDAYS",
    badge: "12% SAMPLE",
    image: PHOTOS.terrace,
    stayId: "ridge-hideaway",
    guests: 2,
    nights: 3,
    discountPercent: 12,
  },
  {
    id: "slow-together",
    number: "03",
    kicker: "THE SHARED EDITION",
    title: "Slow Together",
    note:
      "An imaginary family-escape offer preview, shown separately from the standard booking value.",
    code: "SLOWTOGETHER",
    badge: "8% SAMPLE",
    image: PHOTOS.villas,
    stayId: "palm-garden-villa",
    guests: 4,
    nights: 2,
    discountPercent: 8,
  },
];

function localKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function dateAfter(days = 0) {
  const date = new Date();

  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + Number(days));

  return localKey(date);
}

export function addDays(key, amount = 1) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) {
    return "";
  }

  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  if (localKey(date) !== key) {
    return "";
  }

  date.setDate(date.getDate() + Number(amount));

  return localKey(date);
}

export function prettyDay(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key || "")) {
    return "Select date";
  }

  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);

  if (localKey(date) !== key) {
    return "Select date";
  }

  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
  });
}

/*
  Hypothetical discounts only.
  The original resort booking engine is unchanged.
*/

export function offerPreview(offer, quote) {
  if (!offer || !quote?.ok) {
    return {
      saving: 0,
      hypotheticalTotal: 0,
    };
  }

  const percent = Math.max(
    0,
    Math.min(
      100,
      Number(offer.discountPercent) || 0
    )
  );

  const saving = Math.min(
    Number(quote.total),
    Math.round(
      (Number(quote.nightlySubtotal) || 0) *
        percent /
        100
    )
  );

  return {
    saving,
    hypotheticalTotal: Number(quote.total) - saving,
  };
}

/*
  Carry package, offer, dates and add-ons
  into the existing /booking route.
*/

export function bookingHref({
  stayId,
  checkIn,
  checkOut,
  guests,
  addOnIds = [],
  packageId,
  offerId,
}) {
  const params = new URLSearchParams({
    stay: stayId || "",
    checkIn: checkIn || "",
    checkOut: checkOut || "",
    guests: String(guests || 2),
    addOns: addOnIds.join(","),
  });

  if (packageId) {
    params.set("package", packageId);
  }

  if (offerId) {
    params.set("offer", offerId);
  }

  return `/booking?${params}`;
}