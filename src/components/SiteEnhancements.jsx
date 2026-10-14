import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const PAGE_NAMES = {
  "/": "Discover",
  "/stays": "Villas & Suites",
  "/booking": "Reservations",
  "/packages": "Resort Packages",
  "/offers": "Special Offers",
  "/experiences": "Experiences",
  "/gallery": "Gallery",
  "/story": "Our Story",
  "/contact": "Contact",

  "/staff": "Resort Dashboard",
  "/staff/reservations": "Reservation Management",
  "/staff/villas": "Villa Management",
  "/staff/housekeeping": "Housekeeping",
  "/staff/reports": "Reports & Analytics",
  "/staff/guests": "Guest Records",
  "/staff/calendar": "Booking Calendar",
  "/staff/settings": "Resort Settings",
};

function getPageName(pathname) {
  if (pathname.startsWith("/stays/")) {
    return "Villa Details";
  }

  return PAGE_NAMES[pathname] || "Page Not Found";
}

export default function SiteEnhancements() {
  const location = useLocation();

  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const page = getPageName(location.pathname);

    document.title = `${page} | YOUR STAY`;

    setAnnouncement(`${page} page loaded`);
  }, [location.pathname]);

  useEffect(() => {
    function handleImageFailure(event) {
      const element = event.target;

      if (!(element instanceof HTMLImageElement)) {
        return;
      }

      // Keep the original alt text accessible.
      // The styling provides a visual fallback.
      element.classList.add("ys7-image-failed");
    }

    document.addEventListener(
      "error",
      handleImageFailure,
      true
    );

    return () => {
      document.removeEventListener(
        "error",
        handleImageFailure,
        true
      );
    };
  }, []);

  return (
    <span className="ys7-screen-reader" aria-live="polite">
      {announcement}
    </span>
  );
}