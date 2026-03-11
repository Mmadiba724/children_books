import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
// Import token debugger to make it available in console
import "./utils/tokenDebugger";
// Import and initialize token storage
import tokenStorage from "./utils/tokenStorage";

const normalizeGitHubPagesHashRedirect = () => {
    const { pathname, hash } = window.location;

    // GitHub Pages SPA fallback can land on /index.html#route&query.
    if (!pathname.endsWith("/index.html") || !hash.startsWith("#")) {
        return;
    }

    const raw = hash.slice(1);
    if (!raw) {
        return;
    }

    const ampIndex = raw.indexOf("&");
    const routePart = ampIndex >= 0 ? raw.slice(0, ampIndex) : raw;
    const queryPart = ampIndex >= 0 ? raw.slice(ampIndex + 1) : "";

    const normalizedRoute = routePart.startsWith("/") ? routePart : `/${routePart}`;
    const normalizedQuery = queryPart ? `?${queryPart}` : "";

    const basePath = pathname.replace(/\/index\.html$/, "");
    const nextUrl = `${basePath}${normalizedRoute}${normalizedQuery}`;

    window.history.replaceState(null, "", nextUrl);
};

// Initialize secure token storage (migrate from localStorage if needed)
tokenStorage.initialize();
normalizeGitHubPagesHashRedirect();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
