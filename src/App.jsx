import {
  Suspense,
  lazy,
} from "react";

import {
  Link,
  Route,
  Routes,
} from "react-router-dom";

import { ArrowUpRight } from "lucide-react";

import { PHOTOS } from "./data/config.js";

// BATCH 7 SHARED COMPONENTS
import ResortLoader from "./components/ResortLoader.jsx";
import AppErrorBoundary from "./components/AppErrorBoundary.jsx";
import SiteEnhancements from "./components/SiteEnhancements.jsx";

// LAYOUTS
const PublicLayout = lazy(() =>
  import("./components/PublicLayout.jsx")
);

const StaffLayout = lazy(() =>
  import("./components/StaffLayout.jsx")
);

// PUBLIC PAGES
const HomePage = lazy(() =>
  import("./pages/public/HomePage.jsx")
);

const StaysPage = lazy(() =>
  import("./pages/public/StaysPage.jsx")
);

const VillaDetailsPage = lazy(() =>
  import("./pages/public/VillaDetailsPage.jsx")
);

const BookingPage = lazy(() =>
  import("./pages/public/BookingPage.jsx")
);

const ExperiencesPage = lazy(() =>
  import("./pages/public/ExperiencesPage.jsx")
);

const GalleryPage = lazy(() =>
  import("./pages/public/GalleryPage.jsx")
);

const PackagesPage = lazy(() =>
  import("./pages/public/PackagesPage.jsx")
);

const OffersPage = lazy(() =>
  import("./pages/public/OffersPage.jsx")
);

const StoryPage = lazy(() =>
  import("./pages/public/StoryPage.jsx")
);

const ContactPage = lazy(() =>
  import("./pages/public/ContactPage.jsx")
);

// STAFF PAGES
const DashboardPage = lazy(() =>
  import("./pages/staff/DashboardPage.jsx")
);

const ReservationsPage = lazy(() =>
  import("./pages/staff/ReservationsPage.jsx")
);

const VillaManagementPage = lazy(() =>
  import("./pages/staff/VillaManagementPage.jsx")
);

const HousekeepingPage = lazy(() =>
  import("./pages/staff/HousekeepingPage.jsx")
);

const ReportsPage = lazy(() =>
  import("./pages/staff/ReportsPage.jsx")
);

const GuestRecordsPage = lazy(() =>
  import("./pages/staff/GuestRecordsPage.jsx")
);

const CalendarPage = lazy(() =>
  import("./pages/staff/CalendarPage.jsx")
);

const SettingsPage = lazy(() =>
  import("./pages/staff/SettingsPage.jsx")
);

function NotFoundPage() {
  return (
    <section className="ys-chapter">
      <div className="ys-chapter__body">
        <span className="ys-kicker">
          PAGE NOT FOUND
        </span>

        <h1 className="ys-display">
          Let's find <em>your way.</em>
        </h1>

        <p>
          This destination isn't part of
          the YOUR STAY website concept.
        </p>

        <Link className="ys-button" to="/stays">
          Explore the villas
          <ArrowUpRight size={18} />
        </Link>
      </div>

      <img
        className="ys-chapter__image"
        src={PHOTOS.pool}
        alt="Illustrative tropical resort pool"
        loading="lazy"
      />
    </section>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <SiteEnhancements />

      <Suspense
        fallback={
          <ResortLoader message="Preparing your escape" />
        }
      >
        <Routes>
          {/* CUSTOMER WEBSITE */}
          <Route element={<PublicLayout />}>
            <Route
              index
              element={<HomePage />}
            />

            <Route
              path="stays"
              element={<StaysPage />}
            />

            <Route
              path="stays/:stayId"
              element={<VillaDetailsPage />}
            />

            <Route
              path="booking"
              element={<BookingPage />}
            />

            <Route
              path="packages"
              element={<PackagesPage />}
            />

            <Route
              path="offers"
              element={<OffersPage />}
            />

            <Route
              path="experiences"
              element={<ExperiencesPage />}
            />

            <Route
              path="gallery"
              element={<GalleryPage />}
            />

            <Route
              path="story"
              element={<StoryPage />}
            />

            <Route
              path="contact"
              element={<ContactPage />}
            />
          </Route>

          {/* RESORT MANAGEMENT SYSTEM */}
          <Route
            path="staff"
            element={<StaffLayout />}
          >
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="reservations"
              element={<ReservationsPage />}
            />

            <Route
              path="villas"
              element={<VillaManagementPage />}
            />

            <Route
              path="housekeeping"
              element={<HousekeepingPage />}
            />

            <Route
              path="reports"
              element={<ReportsPage />}
            />

            <Route
              path="guests"
              element={<GuestRecordsPage />}
            />

            <Route
              path="calendar"
              element={<CalendarPage />}
            />

            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>

          {/* FALLBACK PAGE */}
          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}