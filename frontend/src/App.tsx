import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import RiskMap from "./pages/RiskMap";
import Prediction from "./pages/Prediction";
import Scenario from "./pages/Scenario";
import Alerts from "./pages/Alerts";
import HistoricalEvents from "./pages/HistoricalEvents";
import InfrastructureRisk from "./pages/InfrastructureRisk";

function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <div className="nav-brand">
          <NavLink to="/dashboard">
            LandslideAI
          </NavLink>

          <span>
            AI-Powered Landslide Monitoring
          </span>
        </div>

        <div className="nav-links">
          <NavLink to="/dashboard">
            Dashboard
          </NavLink>

          <NavLink to="/risk-map">
            Risk Map
          </NavLink>

          <NavLink to="/prediction">
            Prediction
          </NavLink>

          <NavLink to="/scenario">
            Scenario
          </NavLink>

          <NavLink to="/alerts">
            Alerts
          </NavLink>
        </div>
      </nav>

      <Routes>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/risk-map"
          element={<RiskMap />}
        />

        <Route
          path="/prediction"
          element={<Prediction />}
        />

        <Route
          path="/scenario"
          element={<Scenario />}
        />

        <Route
          path="/alerts"
          element={<Alerts />}
        />

        <Route
          path="/historical-events"
          element={<HistoricalEvents />}
        />
        <Route
  path="/infrastructure-risk"
  element={<InfrastructureRisk />}
/>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;