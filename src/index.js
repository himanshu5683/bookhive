/* bookhive/src/index.js */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Get root container safely
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in HTML!");
}

// Detect if running locally or deployed
const isLocal = window.location.hostname === "localhost";

// Set basename only for deployed environment
const basename = isLocal ? "/" : "/bookhive";

const root = ReactDOM.createRoot(container);
root.render(
  <BrowserRouter basename={basename}>
    <App />
  </BrowserRouter>
);
