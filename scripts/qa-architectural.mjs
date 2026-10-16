import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const require = createRequire(import.meta.url);

const passed = [];
const failed = [];
const warnings = [];

const ok = (message) => passed.push(message);
const fail = (message) => failed.push(message);

function test(name, fn) {
  try {
    fn();
    ok(name);
  } catch (error) {
    fail(`${name}: ${error.message}`);
  }
}

function exists(relative) {
  return fs.existsSync(path.join(root, relative));
}

function display(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

/* ==========================================
   REQUIRED ARCHITECTURAL FILES
========================================== */

const requiredFiles = [
  "src/main.jsx",
  "src/App.jsx",

  "src/components/PublicLayout.jsx",
  "src/components/StaffLayout.jsx",
  "src/components/StayMotion.jsx",

  "src/context/ResortContext.jsx",
  "src/data/config.js",
  "src/data/stayJourneys.js",
  "src/engine/resortEngine.js",

  "src/styles/stay-architectural.css",
  "src/styles/stay-motion-graphics.css",
  "src/styles/stay-residences-architectural.css",
  "src/styles/stay-booking-architectural.css",
  "src/styles/stay-operations-architectural.css",
  "src/styles/stay-staff-finish.css",

  ...[
    "HomePage",
    "StaysPage",
    "VillaDetailsPage",
    "BookingPage",
    "PackagesPage",
    "OffersPage",
    "ExperiencesPage",
    "GalleryPage",
    "StoryPage",
    "ContactPage",
  ].map(
    (name) => `src/pages/public/${name}.jsx`
  ),

  ...[
    "DashboardPage",
    "ReservationsPage",
    "CalendarPage",
    "VillaManagementPage",
    "HousekeepingPage",
    "ReportsPage",
    "GuestRecordsPage",
    "SettingsPage",
  ].map(
    (name) => `src/pages/staff/${name}.jsx`
  ),
];

const missingFiles = requiredFiles.filter(
  (file) => !exists(file)
);

if (missingFiles.length) {
  for (const file of missingFiles) {
    fail(`Missing architectural file: ${file}`);
  }
} else {
  ok(
    `${requiredFiles.length} required files present`
  );
}

/* ==========================================
   COLLECT PROJECT SOURCES
========================================== */

const sources = [];

function collect(directory) {
  if (!fs.existsSync(directory)) return;

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true,
  })) {
    const filename = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      collect(filename);
    } else if (
      /\.(js|jsx|mjs|css)$/.test(entry.name)
    ) {
      sources.push(filename);
    }
  }
}

collect(path.join(root, "src"));

let babel;
let postcss;

try {
  babel = require("@babel/parser");
} catch {
  fail(
    "Cannot load @babel/parser. Run npm install first."
  );
}

try {
  postcss = require("postcss");
} catch {
  warnings.push(
    "PostCSS unavailable; CSS parsing skipped."
  );
}

/* ==========================================
   IMPORT AND SYNTAX INSPECTION
========================================== */

let parsedJs = 0;
let parsedCss = 0;
let checkedImports = 0;

const iconNames = new Set();

function relativeImportExists(file, reference) {
  const base = path.resolve(
    path.dirname(file),
    reference
  );

  return [
    base,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.mjs`,
    `${base}.css`,
    path.join(base, "index.js"),
  ].some((candidate) =>
    fs.existsSync(candidate)
  );
}

function inspectNode(node, filename) {
  if (!node || typeof node !== "object") {
    return;
  }

  const isImport =
    node.type === "ImportDeclaration" ||
    node.type === "ExportNamedDeclaration" ||
    node.type === "ExportAllDeclaration";

  if (isImport && node.source?.value) {
    const source = node.source.value;

    if (source.startsWith(".")) {
      checkedImports++;

      if (
        !relativeImportExists(
          filename,
          source
        )
      ) {
        fail(
          `Unresolved import: ${display(filename)} -> ${source}`
        );
      }
    }

    if (source === "lucide-react") {
      for (const spec of node.specifiers || []) {
        if (
          spec.type === "ImportSpecifier"
        ) {
          iconNames.add(
            spec.imported.name ||
              spec.imported.value
          );
        }
      }
    }
  }

  const dynamicImport =
    node.type === "CallExpression" &&
    node.callee?.type === "Import" &&
    node.arguments?.[0]?.type ===
      "StringLiteral";

  if (dynamicImport) {
    const source = node.arguments[0].value;

    if (source.startsWith(".")) {
      checkedImports++;

      if (
        !relativeImportExists(
          filename,
          source
        )
      ) {
        fail(
          `Unresolved lazy import: ${display(filename)} -> ${source}`
        );
      }
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (
      [
        "loc",
        "start",
        "end",
        "comments",
        "tokens",
        "extra",
      ].includes(key)
    ) {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (
          item &&
          typeof item === "object"
        ) {
          inspectNode(item, filename);
        }
      });
    } else if (
      value &&
      typeof value === "object"
    ) {
      inspectNode(value, filename);
    }
  }
}

for (const filename of sources) {
  const code = fs.readFileSync(
    filename,
    "utf8"
  );

  if (filename.endsWith(".css")) {
    if (!postcss) continue;

    try {
      postcss.parse(code, {
        from: filename,
      });

      parsedCss++;
    } catch (error) {
      fail(
        `CSS syntax: ${display(filename)} — ${error.message}`
      );
    }

    continue;
  }

  if (!babel) continue;

  try {
    const ast = babel.parse(code, {
      sourceType: "module",
      plugins: ["jsx"],
      errorRecovery: false,
    });

    parsedJs++;

    inspectNode(
      ast.program,
      filename
    );
  } catch (error) {
    fail(
      `JSX syntax: ${display(filename)} — ${error.message}`
    );
  }
}

if (babel) {
  ok(
    `${parsedJs} JS/JSX files parsed; ${checkedImports} local imports inspected`
  );
}

if (postcss) {
  ok(`${parsedCss} CSS files parsed`);
}

/* ==========================================
   LUCIDE ICON VERIFICATION
========================================== */

if (iconNames.size) {
  try {
    const lucide = await import(
      "lucide-react"
    );

    const missing = [
      ...iconNames,
    ].filter(
      (name) => !(name in lucide)
    );

    if (missing.length) {
      fail(
        `Lucide missing exports: ${missing.join(", ")}`
      );
    } else {
      ok(
        `${iconNames.size} Lucide icon names resolve`
      );
    }
  } catch (error) {
    fail(
      `Lucide import failed: ${error.message}`
    );
  }
}

/* ==========================================
   ENGINE REGRESSION TESTS
========================================== */

if (
  exists("src/data/config.js") &&
  exists("src/engine/resortEngine.js")
) {
  try {
    const config = await import(
      pathToFileURL(
        path.join(
          root,
          "src/data/config.js"
        )
      ).href
    );

    const engine = await import(
      pathToFileURL(
        path.join(
          root,
          "src/engine/resortEngine.js"
        )
      ).href
    );

    test(
      "Concept branding and demo-only payment settings",
      () => {
        assert.equal(
          config.BRAND.developerCredit,
          "Website Concept Made by: Web Developer Devin Planas"
        );

        assert.equal(
          config.BRAND.conceptOnly,
          true
        );

        assert.equal(
          config.RESORT_POLICIES.localDemoOnly,
          true
        );

        assert.equal(
          config.RESORT_POLICIES.paymentProcessingEnabled,
          false
        );

        assert.equal(
          config.ACCOMMODATIONS.length,
          4
        );
      }
    );

    function offset(days) {
      const date = new Date();

      date.setHours(12, 0, 0, 0);
      date.setDate(
        date.getDate() + days
      );

      return engine.localDateKey(date);
    }

    const input = {
      accommodationId: "lagoon-villa",
      checkIn: offset(6),
      checkOut: offset(8),
      guests: 4,
      addOnIds: ["floating-breakfast"],
      guestName: "Demo Traveler",
      email: "demo@example.com",
    };

    let state =
      engine.createInitialResortState();

    test(
      "Correct villa quote: ₱20,800",
      () => {
        assert.equal(
          engine.quoteStay(
            state,
            input
          ).total,
          20800
        );
      }
    );

    test(
      "Reservations prevent overlapping stays",
      () => {
        const result =
          engine.createReservation(
            state,
            input
          );

        state = result.state;

        assert.equal(
          result.booking.status,
          "confirmed"
        );

        assert.equal(
          engine.quoteStay(
            state,
            input
          ).ok,
          false
        );

        assert.equal(
          engine.checkStayAvailability(
            state,
            input
          ).available,
          false
        );

        assert.throws(() =>
          engine.addMaintenanceBlock(
            state,
            {
              accommodationId:
                input.accommodationId,
              checkIn: input.checkIn,
              checkOut: input.checkOut,
              note: "Conflict test",
            }
          )
        );
      }
    );

    test(
      "Check-in and checkout status transitions",
      () => {
        const id =
          state.reservations[0].id;

        state =
          engine.updateReservationStatus(
            state,
            id,
            "checked_in"
          ).state;

        state =
          engine.updateReservationStatus(
            state,
            id,
            "checked_out"
          ).state;

        assert.equal(
          engine.checkStayAvailability(
            state,
            input
          ).available,
          true
        );
      }
    );

    test(
      "Maintenance dates block reservations",
      () => {
        const result =
          engine.addMaintenanceBlock(
            state,
            {
              accommodationId:
                input.accommodationId,
              checkIn: input.checkIn,
              checkOut: input.checkOut,
              note: "Maintenance test",
            }
          );

        state = result.state;

        assert.equal(
          engine.checkStayAvailability(
            state,
            input
          ).available,
          false
        );

        state =
          engine.removeMaintenanceBlock(
            state,
            result.block.id
          ).state;

        assert.equal(
          engine.checkStayAvailability(
            state,
            input
          ).available,
          true
        );
      }
    );

    test(
      "Favorites toggle and no collected revenue",
      () => {
        state = engine.toggleFavorite(
          state,
          input.accommodationId
        );

        assert.equal(
          state.favorites.includes(
            input.accommodationId
          ),
          true
        );

        state = engine.toggleFavorite(
          state,
          input.accommodationId
        );

        assert.equal(
          state.favorites.includes(
            input.accommodationId
          ),
          false
        );

        assert.equal(
          engine.getDashboardStats(
            state
          ).collectedRevenue,
          0
        );
      }
    );

    test(
      "Cancellation releases villa dates",
      () => {
        const another = {
          ...input,
          checkIn: offset(10),
          checkOut: offset(12),
        };

        const booking =
          engine.createReservation(
            state,
            another
          );

        const cancelled =
          engine.updateReservationStatus(
            booking.state,
            booking.booking.id,
            "cancelled"
          );

        assert.equal(
          engine.checkStayAvailability(
            cancelled.state,
            another
          ).available,
          true
        );
      }
    );

    /* PACKAGE / OFFER INTEGRATION */

    if (
      exists("src/data/stayJourneys.js")
    ) {
      try {
        const journeys = await import(
          pathToFileURL(
            path.join(
              root,
              "src/data/stayJourneys.js"
            )
          ).href
        );

        test(
          "Curated journeys use existing villas and add-ons",
          () => {
            assert.ok(
              Array.isArray(
                journeys.JOURNEY_PACKAGES
              )
            );

            assert.ok(
              journeys.JOURNEY_PACKAGES.length >
                0
            );

            assert.ok(
              Array.isArray(
                journeys.JOURNEY_OFFERS
              )
            );

            assert.ok(
              journeys.JOURNEY_OFFERS.length >
                0
            );

            const all = [
              ...journeys.JOURNEY_PACKAGES,
              ...journeys.JOURNEY_OFFERS,
            ];

            for (const item of all) {
              assert.ok(
                config.ACCOMMODATIONS.some(
                  (stay) =>
                    stay.id ===
                    item.stayId
                ),
                `${item.id} has invalid stayId`
              );

              for (const id of item.addOnIds || []) {
                assert.ok(
                  config.ADD_ONS.some(
                    (addon) =>
                      addon.id === id
                  ),
                  `${item.id}: invalid add-on ${id}`
                );
              }
            }

            assert.equal(
              typeof journeys.offerPreview,
              "function"
            );

            assert.equal(
              typeof journeys.bookingHref,
              "function"
            );
          }
        );

        test(
          "Offer preview never changes the engine total",
          () => {
            const offer =
              journeys.JOURNEY_OFFERS[0];

            const quote =
              engine.quoteStay(
                engine.createInitialResortState(),
                {
                  accommodationId:
                    offer.stayId,
                  checkIn: offset(4),
                  checkOut: offset(
                    4 + offer.nights
                  ),
                  guests: offer.guests,
                  addOnIds: [],
                }
              );

            assert.equal(
              quote.ok,
              true
            );

            const original =
              quote.total;

            const sample =
              journeys.offerPreview(
                offer,
                quote
              );

            assert.ok(
              sample.saving >= 0 &&
                sample.saving <=
                  original
            );

            assert.equal(
              sample.hypotheticalTotal,
              original -
                sample.saving
            );

            assert.equal(
              quote.total,
              original
            );
          }
        );
      } catch (error) {
        fail(
          `Journey integration: ${error.message}`
        );
      }
    }
  } catch (error) {
    fail(
      `Resort engine import: ${error.message}`
    );
  }
}

/* ==========================================
   FINAL REPORT
========================================== */

console.log(
  "\nYOUR STAY. — ARCHITECTURAL QA\n" +
    "─".repeat(40)
);

for (const line of passed) {
  console.log(`PASS  ${line}`);
}

for (const line of warnings) {
  console.log(`WARN  ${line}`);
}

for (const line of failed) {
  console.log(`FAIL  ${line}`);
}

console.log(
  `\nRESULT: ${passed.length} passed / ${failed.length} failed / ${warnings.length} warnings`
);

console.log(
  "\nMANUAL BROWSER QA STILL REQUIRED:"
);

console.log(
  "Desktop/tablet/mobile overflow, images, animations, keyboard navigation, reservations, staff workflows, and deployment."
);

if (failed.length > 0) {
  process.exitCode = 1;
}