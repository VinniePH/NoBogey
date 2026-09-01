import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ContactPage } from "./pages/ContactPage";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ContactPage />
  </StrictMode>
);
