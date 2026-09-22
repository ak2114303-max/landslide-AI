import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RiskMap from "./pages/RiskMap";
import Prediction from "./pages/Prediction";
import Scenario from "./pages/Scenario";
import LiveMonitoring from "./pages/LiveMonitoring";
import Alerts from "./pages/Alerts";
import HistoricalEvents from "./pages/HistoricalEvents";
import InfrastructureRisk from "./pages/InfrastructureRisk";
import ReportLandslide from "./pages/ReportLandslide";
import ExplainableAI from "./pages/ExplainableAI";
import Settings from "./pages/Settings";


// Check whether user is logged in
function isLoggedIn() {
  return (
    localStorage.getItem(
      "landslideai_logged_in"
    ) === "true"
  );
}

// Protect dashboard pages
function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isLoggedIn()) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================= PROTECTED WEBSITE ================= */}

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Risk Map */}

        <Route
          path="/risk-map"
          element={
            <ProtectedRoute>
              <RiskMap />
            </ProtectedRoute>
          }
        />

        {/* AI Prediction */}

        <Route
          path="/prediction"
          element={
            <ProtectedRoute>
              <Prediction />
            </ProtectedRoute>
          }
        />

        {/* Location / Scenario Analysis */}

        <Route
          path="/scenario"
          element={
            <ProtectedRoute>
              <Scenario />
            </ProtectedRoute>
          }
        />

        {/* Live Monitoring */}

        <Route
          path="/live-monitoring"
          element={
            <ProtectedRoute>
              <LiveMonitoring />
            </ProtectedRoute>
          }
        />

        {/* Alerts */}

        <Route
          path="/alerts"
          element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          }
        />

        {/* Historical Events */}

        <Route
          path="/historical-events"
          element={
            <ProtectedRoute>
              <HistoricalEvents />
            </ProtectedRoute>
          }
        />

        {/* Infrastructure Risk */}

        <Route
          path="/infrastructure-risk"
          element={
            <ProtectedRoute>
              <InfrastructureRisk />
            </ProtectedRoute>
          }
        />

        {/* Report Landslide */}

        <Route
          path="/report-landslide"
          element={
            <ProtectedRoute>
              <ReportLandslide />
            </ProtectedRoute>
          }
        />
        <Route
  path="/explainable-ai"
  element={
    <ProtectedRoute>
      <ExplainableAI />
    </ProtectedRoute>
  }
/>
<Route
  path="/settings"
  element={
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  }
/>

        {/* ================= ROOT ================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

        {/* ================= UNKNOWN URL ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;