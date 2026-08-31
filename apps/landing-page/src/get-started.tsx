import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { GetStartedPage } from "./pages/GetStartedPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GetStartedPage />
  </StrictMode>
);
