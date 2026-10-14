import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import { ResortProvider } from "./context/ResortContext.jsx";
import App from "./App.jsx";

import "./styles/base.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <HashRouter>
      <ResortProvider>
        <App />
      </ResortProvider>
    </HashRouter>
  </React.StrictMode>
);