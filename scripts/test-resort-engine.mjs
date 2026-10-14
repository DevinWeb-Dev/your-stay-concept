import assert from "node:assert/strict";

import {
  addMaintenanceBlock,
  checkStayAvailability,
  countNights,
  createInitialResortState,
  createReservation,
  localDateKey,
  quoteStay,
  removeMaintenanceBlock,
  updateReservationStatus,
} from "../src/engine/resortEngine.js";

import {
  ACCOMMODATIONS,
} from "../src/data/config.js";

// Fixed local date keeps this test independent
// of the actual day on which it is run.
const now = new Date(2026, 9, 15, 12, 0, 0);

function day(offset) {
  const value = new Date(now);
  value.setDate(value.getDate() + offset);

  return localDateKey(value);
}

const stay = ACCOMMODATIONS.find(
  (item) => item.id === "lagoon-villa"
);

assert.ok(
  stay,
  "Lagoon Villa must exist in the catalog."
);

const input = {
  accommodationId: stay.id,
  checkIn: day(3),
  checkOut: day(5),
  guests: stay.includedGuests + 1,
  addOnIds: ["floating-breakfast"],
};

let state = createInitialResortState();

// TEST 1: Count nights
assert.equal(
  countNights(input.checkIn, input.checkOut),
  2
);

// TEST 2: Calculate correct quote
const quote = quoteStay(state, input, now);

assert.equal(
  quote.ok,
  true,
  quote.error || "Expected valid quotation."
);

assert.equal(
  quote.nightlySubtotal,
  stay.nightlyRate * 2
);

assert.equal(
  quote.extraGuestTotal,
  stay.extraGuestNightlyRate * 2
);

assert.equal(quote.addOnTotal, 1200);

assert.equal(
  quote.total,
  quote.nightlySubtotal +
    quote.extraGuestTotal +
    quote.addOnTotal
);

// TEST 3: Invalid checkout date
const invalidDates = quoteStay(
  state,
  {
    ...input,
    checkOut: input.checkIn,
  },
  now
);

assert.equal(invalidDates.ok, false);

// TEST 4: Too many guests
assert.equal(
  quoteStay(
    state,
    {
      ...input,
      guests: stay.maxGuests + 1,
    },
    now
  ).ok,
  false
);

// TEST 5: Create a reservation
const first = createReservation(
  state,
  {
    ...input,
    guestName: "Demo Guest",
    email: "demo@example.test",
  },
  now
);

assert.ok(first.booking.id);

state = first.state;

assert.equal(state.reservations.length, 1);

// TEST 6: Prevent overlapping reservation
assert.equal(
  checkStayAvailability(state, input, now).available,
  false
);

assert.throws(
  () =>
    createReservation(
      state,
      {
        ...input,
        guestName: "Another Guest",
        email: "another@example.test",
      },
      now
    ),
  /already reserved/i
);

// TEST 7: Check-out dates can be reused
assert.equal(
  checkStayAvailability(
    state,
    {
      accommodationId: stay.id,
      checkIn: input.checkOut,
      checkOut: day(6),
    },
    now
  ).available,
  true
);

// TEST 8: Guest check-in
const checkin = updateReservationStatus(
  state,
  first.booking.id,
  "checked_in",
  now
);

state = checkin.state;

assert.equal(
  checkin.booking.status,
  "checked_in"
);

// TEST 9: Guest check-out
const checkout = updateReservationStatus(
  state,
  first.booking.id,
  "checked_out",
  now
);

state = checkout.state;

assert.equal(
  checkout.booking.status,
  "checked_out"
);

// TEST 10: Invalid status changes
assert.throws(() =>
  updateReservationStatus(
    state,
    first.booking.id,
    "cancelled",
    now
  )
);

// TEST 11: Maintenance blocking
const maintenance = addMaintenanceBlock(
  state,
  {
    accommodationId: stay.id,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    note: "Cleaning test",
  },
  now
);

state = maintenance.state;

assert.equal(
  checkStayAvailability(state, input, now).available,
  false
);

// TEST 12: Remove maintenance block
state = removeMaintenanceBlock(
  state,
  maintenance.block.id,
  now
).state;

assert.equal(
  checkStayAvailability(state, input, now).available,
  true
);

// TEST 13: Cancellation releases dates
const newBooking = createReservation(
  state,
  {
    ...input,
    guestName: "New Demo Guest",
    email: "new@example.test",
  },
  now
);

state = newBooking.state;

state = updateReservationStatus(
  state,
  newBooking.booking.id,
  "cancelled",
  now
).state;

assert.equal(
  checkStayAvailability(state, input, now).available,
  true
);

console.log("");
console.log("YOUR STAY — BOOKING ENGINE TESTS");
console.log("--------------------------------");
console.log("PASS: Night count");
console.log("PASS: Booking quotations");
console.log("PASS: Invalid date rejection");
console.log("PASS: Guest capacity validation");
console.log("PASS: Reservation creation");
console.log("PASS: Overlapping booking prevention");
console.log("PASS: Check-out date reuse");
console.log("PASS: Guest check-in and check-out");
console.log("PASS: Invalid status prevention");
console.log("PASS: Maintenance date blocking");
console.log("PASS: Maintenance block removal");
console.log("PASS: Cancellation availability");
console.log("");
console.log("ALL BOOKING ENGINE TESTS PASSED");