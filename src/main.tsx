import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
// Import token debugger to make it available in console
import "./utils/tokenDebugger";
// Import and initialize token storage
import tokenStorage from "./utils/tokenStorage";

// Initialize secure token storage (migrate from localStorage if needed)
tokenStorage.initialize();

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);
