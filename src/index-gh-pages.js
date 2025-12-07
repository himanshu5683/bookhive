/* bookhive/src/index-gh-pages.js - For GitHub Pages deployment */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Get root container safely
const container = document.getElementById("root");
if (!container) {
  throw new Error("Root container missing in HTML!");
}

const root = ReactDOM.createRoot(container);
root.render(
  <BrowserRouter basename="/bookhive">
    <App />
  </BrowserRouter>
);

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}