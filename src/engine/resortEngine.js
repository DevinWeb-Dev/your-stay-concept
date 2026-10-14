/** Pure resort demo engine. No network, payment gateway or actual reservations. */
import { ACCOMMODATIONS, ADD_ONS, RESORT_POLICIES, getStay } from "../data/config.js";

export const STORAGE_KEY = "your-stay-resort-concept-v1";
export const STATE_VERSION = 1;

export function createInitialResortState() {
  return {
    version: STATE_VERSION,
    reservations: [],
    maintenanceBlocks: [],
    favorites: [],
    activity: [],
  };
}

export function localDateKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date.");
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

// Treat YYYY-MM-DD as a calendar date, not a timezone-dependent datetime.
export function calendarDay(dateString) {
  if (typeof dateString !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    throw new Error("Choose a valid check-in and check-out date.");
  }
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.toISOString().slice(0, 10) !== dateString) {
    throw new Error("The selected date is invalid.");
  }
  return date.getTime() / 86_400_000;
}

export function countNights(checkIn, checkOut) {
  return calendarDay(checkOut) - calendarDay(checkIn);
}

export function validateStayDates(checkIn, checkOut, now = new Date()) {
  const today = calendarDay(localDateKey(now));
  const start = calendarDay(checkIn);
  const end = calendarDay(checkOut);
  const nights = end - start;

  if (start < today) throw new Error("Check-in cannot be in the past.");
  if (nights < RESORT_POLICIES.minimumNights) throw new Error("Check-out must be after check-in.");
  if (nights > RESORT_POLICIES.maximumNights) throw new Error(`Maximum stay is ${RESORT_POLICIES.maximumNights} nights.`);
  if (start - today > RESORT_POLICIES.maximumAdvanceDays) throw new Error("The date is beyond the booking window.");
  return nights;
}

const overlaps = (aStart, aEnd, bStart, bEnd) =>
  calendarDay(aStart) < calendarDay(bEnd) && calendarDay(bStart) < calendarDay(aEnd);

export function checkStayAvailability(state, { accommodationId, checkIn, checkOut }, now = new Date()) {
  const stay = getStay(accommodationId);
  if (!stay) return { available: false, reason: "Accommodation not found." };

  try {
    validateStayDates(checkIn, checkOut, now);
  } catch (error) {
    return { available: false, reason: error.message };
  }

  const maintenance = (state.maintenanceBlocks || []).some(
    (block) => block.accommodationId === accommodationId && overlaps(checkIn, checkOut, block.checkIn, block.checkOut)
  );
  if (maintenance) return { available: false, reason: "Blocked for maintenance during these dates." };

  const active = (state.reservations || []).filter(
    (booking) => booking.accommodationId === accommodationId &&
      ["confirmed", "checked_in"].includes(booking.status) &&
      overlaps(checkIn, checkOut, booking.checkIn, booking.checkOut)
  );

  return active.length >= (stay.maxUnits || 1)
    ? { available: false, reason: "This accommodation is already reserved for those dates." }
    : { available: true, reason: "Available in this browser's demo records." };
}

export function quoteStay(state, input, now = new Date()) {
  try {
    const stay = getStay(input?.accommodationId);
    if (!stay) throw new Error("Choose an accommodation first.");
    const nights = validateStayDates(input.checkIn, input.checkOut, now);
    const guests = Number(input.guests);
    if (!Number.isInteger(guests) || guests < 1 || guests > stay.maxGuests) {
      throw new Error(`Select 1 to ${stay.maxGuests} guests for this stay.`);
    }
    const ids = input.addOnIds ?? [];
    if (!Array.isArray(ids) || new Set(ids).size !== ids.length) throw new Error("Invalid add-on selection.");
    const addons = ids.map((id) => {
      const item = ADD_ONS.find((candidate) => candidate.id === id);
      if (!item) throw new Error("Unrecognized stay add-on.");
      return item;
    });

    const availability = checkStayAvailability(state, input, now);
    if (!availability.available) throw new Error(availability.reason);

    const nightlySubtotal = nights * stay.nightlyRate;
    const extraGuestsPerNight = Math.max(0, guests - stay.includedGuests) * stay.extraGuestNightlyRate;
    const extraGuestTotal = nights * extraGuestsPerNight;
    const addOnTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
    const total = nightlySubtotal + extraGuestTotal + addOnTotal;
    return {
      ok: true,
      stay,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests,
      nights,
      addons,
      nightlySubtotal,
      extraGuestsPerNight,
      extraGuestTotal,
      addOnTotal,
      total,
      currency: "PHP",
      note: "Illustrative pricing only; no booking or payment has been submitted to a business.",
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Could not calculate the stay." };
  }
}

function activityEntry(action, description, timestamp = new Date()) {
  return {
    id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    description,
    timestamp: new Date(timestamp).toISOString(),
  };
}

function appendActivity(state, action, description, now) {
  return [...(state.activity || []), activityEntry(action, description, now)].slice(-250);
}

export function createReservation(state, input, now = new Date()) {
  const quote = quoteStay(state, input, now);
  if (!quote.ok) throw new Error(quote.error);

  const nickname = String(input.guestName || "").trim();
  const email = String(input.email || "").trim();
  if (nickname.length < 2 || nickname.length > 80) throw new Error("Enter a guest name (2–80 characters).");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  const booking = {
    id: `YS-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    accommodationId: quote.stay.id,
    guestName: nickname,
    email,
    checkIn: quote.checkIn,
    checkOut: quote.checkOut,
    guests: quote.guests,
    addOnIds: quote.addons.map((item) => item.id),
    total: quote.total,
    nights: quote.nights,
    status: "confirmed", // CONFIRMED ONLY WITHIN THIS LOCAL DEMO.
    createdAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    isDemo: true,
  };

  return {
    booking,
    state: {
      ...state,
      reservations: [...(state.reservations || []), booking],
      activity: appendActivity(state, "reservation_created", `${booking.id} • ${quote.stay.name}`, now),
    },
  };
}

export function updateReservationStatus(state, bookingId, nextStatus, now = new Date()) {
  const current = (state.reservations || []).find((booking) => booking.id === bookingId);
  if (!current) throw new Error("Reservation not found.");
  const allowed = {
    confirmed: ["checked_in", "cancelled"],
    checked_in: ["checked_out"],
    checked_out: [],
    cancelled: [],
  };
  if (!(allowed[current.status] || []).includes(nextStatus)) {
    throw new Error(`Cannot change ${current.status} to ${nextStatus}.`);
  }
  const booking = { ...current, status: nextStatus, updatedAt: new Date(now).toISOString() };
  return {
    booking,
    state: {
      ...state,
      reservations: state.reservations.map((item) => item.id === bookingId ? booking : item),
      activity: appendActivity(state, "reservation_updated", `${bookingId} → ${nextStatus}`, now),
    },
  };
}

export function toggleFavorite(state, accommodationId) {
  if (!ACCOMMODATIONS.some((stay) => stay.id === accommodationId)) throw new Error("Accommodation not found.");
  const previous = state.favorites || [];
  const favorites = previous.includes(accommodationId)
    ? previous.filter((id) => id !== accommodationId)
    : [...previous, accommodationId];
  return { ...state, favorites };
}

export function addMaintenanceBlock(state, input, now = new Date()) {
  const stay = getStay(input.accommodationId);
  if (!stay) throw new Error("Accommodation not found.");
  validateStayDates(input.checkIn, input.checkOut, now);
  const conflictsBooking = (state.reservations || []).some(
    (booking) => booking.accommodationId === stay.id &&
      ["confirmed", "checked_in"].includes(booking.status) &&
      overlaps(input.checkIn, input.checkOut, booking.checkIn, booking.checkOut)
  );
  if (conflictsBooking) throw new Error("A booking already exists in this date range.");
  const block = {
    id: `MAINT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    accommodationId: stay.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    note: String(input.note || "Maintenance").trim().slice(0, 100),
    createdAt: new Date(now).toISOString(),
  };
  return {
    block,
    state: {
      ...state,
      maintenanceBlocks: [...(state.maintenanceBlocks || []), block],
      activity: appendActivity(state, "maintenance_added", `${stay.name} • ${block.checkIn}–${block.checkOut}`, now),
    },
  };
}

export function removeMaintenanceBlock(state, blockId, now = new Date()) {
  if (!(state.maintenanceBlocks || []).some((block) => block.id === blockId)) throw new Error("Block not found.");
  return {
    state: {
      ...state,
      maintenanceBlocks: state.maintenanceBlocks.filter((block) => block.id !== blockId),
      activity: appendActivity(state, "maintenance_removed", blockId, now),
    },
  };
}

export function getDashboardStats(state) {
  const reservations = state.reservations || [];
  return {
    totalReservations: reservations.length,
    activeReservations: reservations.filter((r) => ["confirmed", "checked_in"].includes(r.status)).length,
    checkedIn: reservations.filter((r) => r.status === "checked_in").length,
    cancelled: reservations.filter((r) => r.status === "cancelled").length,
    bookedDemoValue: reservations.filter((r) => r.status !== "cancelled").reduce((sum, r) => sum + r.total, 0),
    // Do not present demo booking value as real collected revenue.
    collectedRevenue: 0,
    maintenanceBlocks: (state.maintenanceBlocks || []).length,
  };
}
