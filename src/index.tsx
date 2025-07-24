import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router/index";

const root = createRoot(document.getElementById("app"));
root.render(
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);
