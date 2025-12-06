/* bookhive/src/index.js */
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";

// Get root container safely
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in HTML!");
}

const root = ReactDOM.createRoot(container);
root.render(
  <HashRouter>
    <App />
  </HashRouter>
);
