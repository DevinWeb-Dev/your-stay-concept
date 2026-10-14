import { Waves } from "lucide-react";

export default function ResortLoader({
  message = "Preparing your escape",
}) {
  return (
    <div
      className="ys7-loader"
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="ys7-loader__scene" aria-hidden="true">
        <span className="ys7-loader__ring ys7-loader__ring--one" />
        <span className="ys7-loader__ring ys7-loader__ring--two" />
        <span className="ys7-loader__ring ys7-loader__ring--three" />

        <span className="ys7-loader__symbol">
          <Waves size={34} strokeWidth={1.15} />
        </span>
      </div>

      <div className="ys7-loader__copy">
        <span className="ys7-loader__eyebrow">
          RESORTS · VILLAS · STAYCATIONS
        </span>

        <strong>
          YOUR STAY<span>.</span>
        </strong>

        <p>{message}</p>
      </div>

      <div className="ys7-loader__progress" aria-hidden="true">
        <span />
      </div>

      <span className="ys7-loader__footer">
        A PLACE TO STAY. A FEELING TO REMEMBER.
      </span>
    </div>
  );
}