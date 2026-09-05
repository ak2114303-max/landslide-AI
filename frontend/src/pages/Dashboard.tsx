
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

interface LocationData {
  location: string;
  risk_score: number;
  risk_level: string;
  rainfall_mm: number;
  soil_moisture: number;
  slope_degree: number;
  elevation_m: number;
  temperature_c: number;
}

interface SummaryData {
  monitored_locations: number;
  high_risk_zones: number;
  active_alerts: number;
  infrastructure_at_risk: number;
}

function Dashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<SummaryData>({
    monitored_locations: 0,
    high_risk_zones: 0,
    active_alerts: 0,
    infrastructure_at_risk: 0,
  });

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);

  const selectedLocation = locations[selectedIndex];

  const riskCounts = {
    low: locations.filter(
      (location) => location.risk_level === "Low"
    ).length,

    moderate: locations.filter(
      (location) => location.risk_level === "Moderate"
    ).length,

    high: locations.filter(
      (location) => location.risk_level === "High"
    ).length,

    critical: locations.filter(
      (location) => location.risk_level === "Critical"
    ).length,
  };

  const loadDashboardData = async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }

    try {
      const [summaryResponse, locationsResponse] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/risk-summary"),
        axios.get("http://127.0.0.1:8000/api/locations"),
      ]);

      setSummary(summaryResponse.data);
      setLocations(locationsResponse.data);

      setLastUpdated(new Date());
      setApiOnline(true);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setApiOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getAlertTitle = (location: LocationData) => {
    if (location.risk_level === "Critical") {
      return "Critical landslide risk";
    }

    if (location.risk_level === "High") {
      return "High landslide risk";
    }

    if (location.risk_level === "Moderate") {
      return "Moderate landslide risk";
    }

    return "Low landslide risk";
  };

  const getAlertSymbol = (riskLevel: string) => {
    if (
      riskLevel === "Critical" ||
      riskLevel === "High" ||
      riskLevel === "Moderate"
    ) {
      return "!";
    }

    return "i";
  };

  const getAlertClass = (riskLevel: string) => {
    if (riskLevel === "Critical") {
      return "critical";
    }

    if (riskLevel === "High") {
      return "warning";
    }

    return "info";
  };

  const recentAlerts = [...locations]
    .filter((location) => location.risk_level !== "Low")
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 3);

  const formatLastUpdated = () => {
    if (!lastUpdated) {
      return "Waiting for data...";
    }

    return lastUpdated.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const openScenario = () => {
    if (!selectedLocation) {
      navigate("/scenario");
      return;
    }

    navigate(
      `/scenario?location=${encodeURIComponent(
        selectedLocation.location
      )}&baselineRisk=${selectedLocation.risk_score}&rainfall=${
        selectedLocation.rainfall_mm
      }&soilMoisture=${selectedLocation.soil_moisture}&slope=${
        selectedLocation.slope_degree
      }&elevation=${selectedLocation.elevation_m}&temperature=${
        selectedLocation.temperature_c
      }`
    );
  };

  return (
    <div className="dashboard-page">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">🌍</div>

          <div>
            <h2>LandslideAI</h2>
            <span>SIH26001</span>
          </div>
        </div>

        <nav className="sidebar-nav">

          <a className="active">
            📊 Dashboard
          </a>

          <a onClick={() => navigate("/risk-map")}>
            🗺️ Risk Map
          </a>

          <a onClick={openScenario}>
            📍 Location Analysis
          </a>

          <a onClick={() => navigate("/prediction")}>
            🤖 AI Prediction
          </a>

          <a onClick={() => navigate("/prediction")}>
            🧠 Explainable AI
          </a>

          <a
            onClick={() =>
              document
                .querySelector(".system-status")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            📡 Live Monitoring
          </a>

          <a>
            <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    navigate("/historical-events");
  }}
>
  📜 Historical Events
</a>
          </a>

          <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    navigate("/infrastructure-risk");
  }}
>
  🏗️ Infrastructure Risk
</a>

          <a onClick={() => navigate("/alerts")}>
            ⚠️ Alerts
          </a>

        </nav>

        <div className="sidebar-bottom">
          <a>⚙️ Settings</a>
          <a>🚪 Logout</a>
        </div>

      </aside>

      {/* Main Content */}
      <main className="dashboard-main">

        {/* Header */}
        <header className="dashboard-header">

          <div>
            <p className="dashboard-label">
              DISASTER MANAGEMENT
            </p>

            <h1>
              Risk Monitoring Dashboard
            </h1>

            <p className="dashboard-subtitle">
              Real-time landslide risk overview and environmental monitoring.
            </p>
          </div>

          <div className="user-profile">

            <div className="notification">
              🔔
            </div>

            <div className="avatar">
              AG
            </div>

            <div>
              <strong>Anuj Gangwar</strong>
              <span>Administrator</span>
            </div>

          </div>

        </header>

        {/* Live System Status */}
        <div className={`system-status ${apiOnline ? "online" : "offline"}`}>

          <span className="status-dot"></span>

          <strong>
            {apiOnline
              ? "Live Monitoring Active"
              : "Monitoring Connection Lost"}
          </strong>

          <span className="status-time">
            Last updated: {formatLastUpdated()}
          </span>

          <button
            className="refresh-button"
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? "Refreshing..." : "↻ Refresh"}
          </button>

        </div>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon green">
              📍
            </div>

            <div>
              <span>
                Monitored Locations
              </span>

              <strong>
                {summary.monitored_locations.toLocaleString()}
              </strong>

              <small>
                Active monitoring
              </small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              ⚠️
            </div>

            <div>
              <span>
                High Risk Zones
              </span>

              <strong>
                {summary.high_risk_zones}
              </strong>

              <small>
                Elevated risk detected
              </small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              🚨
            </div>

            <div>
              <span>
                Active Alerts
              </span>

              <strong>
                {summary.active_alerts}
              </strong>

              <small>
                Requires attention
              </small>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              🏗️
            </div>

            <div>
              <span>
                Infrastructure at Risk
              </span>

              <strong>
                {summary.infrastructure_at_risk}
              </strong>

              <small>
                Across monitored regions
              </small>
            </div>

          </div>

        </section>

        {/* Main Dashboard Cards */}
        <section className="dashboard-grid">

          {/* Risk Overview */}
          <div className="dashboard-card risk-overview">

            <div className="card-header">

              <div>
                <h2>
                  Current Risk Overview
                </h2>

                <p>
                  Overall regional landslide risk assessment
                </p>
              </div>

              <div className="card-actions">

                <button
                  onClick={() => navigate("/risk-map")}
                >
                  View Map →
                </button>

                <button
                  onClick={openScenario}
                >
                  Analyze Location →
                </button>

              </div>

            </div>

            <div className="risk-content">

              <div className="risk-score">

                <div
                  className={`risk-circle ${
                    selectedLocation
                      ? selectedLocation.risk_level.toLowerCase()
                      : ""
                  }`}
                >

                  <strong>
                    {selectedLocation
                      ? `${selectedLocation.risk_score}%`
                      : "0%"}
                  </strong>

                  <span>
                    {selectedLocation
                      ? `${selectedLocation.risk_level.toUpperCase()} RISK`
                      : "NO DATA"}
                  </span>

                </div>

              </div>

              {/* Location Selector */}
              <select
                value={selectedIndex}
                onChange={(e) =>
                  setSelectedIndex(Number(e.target.value))
                }
              >

                {locations.length === 0 ? (
                  <option value={0}>
                    Loading locations...
                  </option>
                ) : (
                  locations.map((location, index) => (
                    <option
                      key={location.location}
                      value={index}
                    >
                      {location.location}
                    </option>
                  ))
                )}

              </select>

              <div className="risk-details">

                <h3>
                  {selectedLocation
                    ? selectedLocation.location
                    : "Loading..."}
                </h3>

                <p>
                  {selectedLocation
                    ? selectedLocation.risk_level === "Critical"
                      ? "Critical conditions detected. Immediate monitoring and preventive action are recommended."
                      : selectedLocation.risk_level === "High"
                      ? "High-risk conditions detected. Close monitoring is recommended."
                      : selectedLocation.risk_level === "Moderate"
                      ? "Moderate-risk conditions detected. Continue regular monitoring."
                      : "Low-risk conditions detected. Current conditions appear stable."
                    : "Loading risk information..."}
                </p>

                <div className="factor">

                  <span>
                    🌧️ Rainfall
                  </span>

                  <strong>
                    {selectedLocation
                      ? `${selectedLocation.rainfall_mm} mm`
                      : "Loading..."}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    ⛰️ Slope
                  </span>

                  <strong>
                    {selectedLocation
                      ? `${selectedLocation.slope_degree}°`
                      : "Loading..."}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    💧 Soil Moisture
                  </span>

                  <strong>
                    {selectedLocation
                      ? `${selectedLocation.soil_moisture}%`
                      : "Loading..."}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* Recent Alerts */}
          <div className="dashboard-card alerts-card">

            <div className="card-header">

              <div>
                <h2>
                  Recent Alerts
                </h2>

                <p>
                  Latest risk notifications
                </p>
              </div>

              <button
                onClick={() => navigate("/alerts")}
              >
                View All →
              </button>

            </div>

            {recentAlerts.length === 0 ? (

              <div className="alert-item info">

                <span className="alert-symbol">
                  i
                </span>

                <div>
                  <strong>
                    No active risk alerts
                  </strong>

                  <p>
                    All monitored locations are currently stable.
                  </p>
                </div>

              </div>

            ) : (

              recentAlerts.map((location) => (

                <div
                  className={`alert-item ${getAlertClass(
                    location.risk_level
                  )}`}
                  key={location.location}
                >

                  <span className="alert-symbol">
                    {getAlertSymbol(location.risk_level)}
                  </span>

                  <div>
                    <strong>
                      {getAlertTitle(location)}
                    </strong>

                    <p>
                      {location.location} • Risk score:{" "}
                      {location.risk_score}%
                    </p>
                  </div>

                </div>

              ))

            )}

          </div>

        </section>

        {/* Risk Distribution */}
        <section className="dashboard-card risk-distribution-card">

          <div className="card-header">

            <div>
              <h2>
                Risk Distribution
              </h2>

              <p>
                Current risk levels across monitored locations
              </p>
            </div>

          </div>

          <div className="risk-distribution">

            <div className="distribution-item low">

              <div className="distribution-top">

                <span>
                  🟢 Low Risk
                </span>

                <strong>
                  {riskCounts.low}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      locations.length > 0
                        ? (riskCounts.low / locations.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>

              </div>

            </div>

            <div className="distribution-item moderate">

              <div className="distribution-top">

                <span>
                  🟡 Moderate Risk
                </span>

                <strong>
                  {riskCounts.moderate}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      locations.length > 0
                        ? (riskCounts.moderate / locations.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>

              </div>

            </div>

            <div className="distribution-item high">

              <div className="distribution-top">

                <span>
                  🟠 High Risk
                </span>

                <strong>
                  {riskCounts.high}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      locations.length > 0
                        ? (riskCounts.high / locations.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>

              </div>

            </div>

            <div className="distribution-item critical">

              <div className="distribution-top">

                <span>
                  🔴 Critical Risk
                </span>

                <strong>
                  {riskCounts.critical}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      locations.length > 0
                        ? (riskCounts.critical / locations.length) * 100
                        : 0
                    }%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </section>

        {/* Bottom Cards */}
        <section className="dashboard-grid bottom-grid">

          {/* Environmental Conditions */}
          <div className="dashboard-card">

            <div className="card-header">

              <div>
                <h2>
                  Environmental Conditions
                </h2>

                <p>
                  Current regional measurements
                </p>
              </div>

            </div>

            <div className="environment-grid">

              <div>

                <span>
                  🌧️ Rainfall
                </span>

                <strong>
                  {selectedLocation
                    ? `${selectedLocation.rainfall_mm} mm`
                    : "Loading..."}
                </strong>

                <small>
                  Last 24 hours
                </small>

              </div>

              <div>

                <span>
                  🌡️ Temperature
                </span>

                <strong>
                  {selectedLocation
                    ? `${selectedLocation.temperature_c}°C`
                    : "Loading..."}
                </strong>

                <small>
                  Current
                </small>

              </div>

              <div>

                <span>
                  💧 Soil Moisture
                </span>

                <strong>
                  {selectedLocation
                    ? `${selectedLocation.soil_moisture}%`
                    : "Loading..."}
                </strong>

                <small>
                  Current
                </small>

              </div>

              <div>

                <span>
                  ⛰️ Elevation
                </span>

                <strong>
                  {selectedLocation
                    ? `${selectedLocation.elevation_m} m`
                    : "Loading..."}
                </strong>

                <small>
                  Above sea level
                </small>

              </div>

            </div>

          </div>

          {/* Quick Actions */}
          <div className="dashboard-card quick-actions">

            <div className="card-header">

              <div>
                <h2>
                  Quick Actions
                </h2>

                <p>
                  Common monitoring tasks
                </p>
              </div>

            </div>

            <button
              onClick={() => navigate("/prediction")}
            >
              🤖 Run AI Prediction
            </button>

            <button
              onClick={() => navigate("/risk-map")}
            >
              🗺️ Open Risk Map
            </button>

            <button
              onClick={() => navigate("/alerts")}
            >
              ⚠️ View Alerts
            </button>

          </div>

        </section>

        {/* Footer */}
        <footer className="dashboard-footer">

          <span>
            LandslideAI • SIH26001 Prototype
          </span>

          <span>
            Predict. Monitor. Explain. Protect.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;
