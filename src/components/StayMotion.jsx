import {
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { useLocation } from "react-router-dom";

import "../styles/stay-motion-graphics.css";

/*
  YOUR STAY. / COASTAL MOTION SYSTEM

  Purely visual animations.
  Does not modify bookings, rates,
  availability or staff records.
*/

export function Reveal({
  as: Tag = "div",
  className = "",
  children,
  delay = 0,
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (
      reducedMotion ||
      !("IntersectionObserver" in window)
    ) {
      node.classList.add("is-visible");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.09,
        rootMargin: "0px 0px -25px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      {...props}
      ref={ref}
      className={`ya-reveal ${
        visible ? "is-visible" : ""
      } ${className}`.trim()}
      style={{
        ...(props.style || {}),

        "--ya-reveal-delay": `${
          Math.min(
            800,
            Math.max(0, delay)
          )
        }ms`,
      }}
    >
      {children}
    </Tag>
  );
}

/*
  Animated bathymetric / coastal lines.

  Each instance receives its own
  SVG gradient identifier.
*/

export function CoastalContours({
  className = "",
  pale = false,
}) {
  const gradientId = useId().replace(
    /:/g,
    ""
  );

  const lines = Array.from(
    { length: 10 },
    (_, index) => {
      const lift = index * 31;

      return `
        M -130 ${150 + lift}
        C 70 ${-5 + lift},
          245 ${335 + lift},
          440 ${165 + lift}
        S 810 ${35 + lift},
          1060 ${200 + lift}
        S 1380 ${340 + lift},
          1560 ${130 + lift}
      `;
    }
  );

  return (
    <svg
      className={`ya-contours ${
        pale
          ? "ya-contours--pale"
          : ""
      } ${className}`.trim()}
      viewBox="0 0 1420 620"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          x2="1"
          y1="0"
          y2="0"
        >
          <stop
            offset="0%"
            stopColor="currentColor"
            stopOpacity=".08"
          />

          <stop
            offset="43%"
            stopColor="currentColor"
            stopOpacity=".75"
          />

          <stop
            offset="100%"
            stopColor="currentColor"
            stopOpacity=".06"
          />
        </linearGradient>
      </defs>

      <g
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.5"
      >
        {lines.map((d, index) => (
          <path
            key={index}
            d={d}
            className="ya-contour-line"
            style={{
              "--line-index": index,
            }}
          />
        ))}
      </g>

      <g
        className="ya-tidal-markers"
        fill="none"
        stroke="currentColor"
      >
        <circle
          cx="277"
          cy="224"
          r="53"
        />

        <circle
          cx="277"
          cy="224"
          r="78"
        />

        <path
          d="M277 137 V311 M190 224 H364"
        />

        <circle
          cx="277"
          cy="224"
          r="5"
          className="ya-tidal-point"
        />

        <circle
          cx="1082"
          cy="405"
          r="36"
        />

        <path
          d="M1082 357 V453 M1034 405 H1130"
        />

        <circle
          cx="1082"
          cy="405"
          r="4"
          className="ya-tidal-point"
        />
      </g>
    </svg>
  );
}

/*
  Decorative navigational instrument.

  This is not a real compass sensor.
*/

export function TideCompass({
  className = "",
}) {
  const ticks = Array.from(
    { length: 36 },
    (_, index) => index
  );

  return (
    <div
      className={`ya-compass ${className}`.trim()}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 240 240"
        focusable="false"
      >
        <g className="ya-compass-orbit">
          <circle
            cx="120"
            cy="120"
            r="103"
            className="ya-compass-outer"
          />

          <circle
            cx="120"
            cy="120"
            r="85"
            className="ya-compass-mid"
          />

          {ticks.map((index) => (
            <path
              key={index}
              d={
                index % 3 === 0
                  ? "M120 19 V33"
                  : "M120 22 V29"
              }
              transform={`rotate(${
                index * 10
              } 120 120)`}
              className="ya-compass-tick"
            />
          ))}
        </g>

        <circle
          cx="120"
          cy="120"
          r="54"
          className="ya-compass-inner"
        />

        <g className="ya-compass-needle-group">
          <path
            d="
              M120 55
              L132 120
              L120 183
              L108 120
              Z
            "
            className="ya-compass-needle"
          />

          <path
            d="M120 55 L120 183"
            className="ya-compass-stem"
          />
        </g>

        <circle
          cx="120"
          cy="120"
          r="4.5"
          className="ya-compass-center"
        />

        <text
          x="120"
          y="10"
          textAnchor="middle"
        >
          N
        </text>

        <text
          x="230"
          y="124"
          textAnchor="middle"
        >
          E
        </text>

        <text
          x="120"
          y="238"
          textAnchor="middle"
        >
          S
        </text>

        <text
          x="10"
          y="124"
          textAnchor="middle"
        >
          W
        </text>
      </svg>
    </div>
  );
}

/*
  Thin scroll-progress indicator.
  Throttled using requestAnimationFrame.
*/

export function PageProgress() {
  const { pathname } = useLocation();

  const [percent, setPercent] =
    useState(0);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;

      const remaining =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const next =
        remaining > 0
          ? Math.min(
              100,
              Math.max(
                0,
                (
                  window.scrollY /
                  remaining
                ) * 100
              )
            )
          : 0;

      setPercent(next);
    };

    const schedule = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(
          update
        );
      }
    };

    schedule();

    window.addEventListener(
      "scroll",
      schedule,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      schedule
    );

    return () => {
      window.removeEventListener(
        "scroll",
        schedule
      );

      window.removeEventListener(
        "resize",
        schedule
      );

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [pathname]);

  return (
    <div
      className="ya-page-progress"
      aria-hidden="true"
    >
      <span
        style={{
          width: `${percent}%`,
        }}
      />
    </div>
  );
}