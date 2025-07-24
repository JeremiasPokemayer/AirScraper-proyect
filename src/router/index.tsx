import { Routes, Route } from "react-router-dom";
import { Home } from "../pages/home/index";
import { Flights } from "../pages/flights";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/">
        <Route index element={<Home />}></Route>
        <Route path="flights" element={<Flights />}></Route>
      </Route>
    </Routes>
  );
}

export { AppRoutes };
