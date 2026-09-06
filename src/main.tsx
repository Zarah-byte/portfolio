import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Styles — documented load order: reset → common(tokens) → site-chrome → site-menu.
// common.css @imports cursor.css. Per-page CSS is imported by its route module.
import "./styles/reset.css";
import "./styles/common.css";
import "./styles/site-chrome.css";
import "./styles/site-menu.css";

import App from "./App";

const Home = lazy(() => import("./routes/Home"));
const About = lazy(() => import("./routes/About"));
const Play = lazy(() => import("./routes/Play"));
const CaseStudy = lazy(() => import("./routes/CaseStudy"));

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<App />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/play" element={<Play />} />
            <Route path="/projects/:slug" element={<CaseStudy />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
);
