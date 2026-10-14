import React from "react";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };

    this.goHome = this.goHome.bind(this);
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error, info) {
    console.error(
      "YOUR STAY rendering error:",
      error,
      info
    );
  }

  goHome() {
    this.setState({ hasError: false });

    if (typeof window !== "undefined") {
      window.location.hash = "#/";
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="ys7-error">
        <div className="ys7-error__content">
          <span className="ys7-error__icon">
            <AlertCircle size={29} strokeWidth={1.4} />
          </span>

          <span className="ys7-error__eyebrow">
            SOMETHING INTERRUPTED YOUR STAY
          </span>

          <h1>
            A little detour,
            <br />
            <em>not the end of the journey.</em>
          </h1>

          <p>
            This page couldn't be displayed right now.
            You can try loading it again or return
            to the YOUR STAY homepage.
          </p>

          <div className="ys7-error__actions">
            <button
              type="button"
              onClick={() => window.location.reload()}
            >
              <RotateCcw size={17} />
              Reload website
            </button>

            <button
              type="button"
              className="ys7-error__secondary"
              onClick={this.goHome}
            >
              <ArrowLeft size={17} />
              Return home
            </button>
          </div>

          <span className="ys7-error__brand">
            YOUR STAY.
          </span>
        </div>
      </main>
    );
  }
}