import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

const API_BASE = "https://landslide-ai-backend.onrender.com";

interface DistrictRisk {
  state: string;
  district: string;
  date: string;
  rainfall_1d_mm: number;
  rainfall_3d_mm: number;
  rainfall_7d_mm: number;
  rainfall_15d_mm: number;
  elevation: number;
  slope: number;
  soil_moisture: number;
  temperature: number;
  ndvi: number;
  risk_level: string;
  risk_probability: number;
}

interface DistrictResponse {
  success: boolean;
  total_districts: number;
  data: DistrictRisk[];
}

interface SummaryResponse {
  success: boolean;
  total_districts: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
}

function Dashboard() {
  const navigate = useNavigate();

  const [districts, setDistricts] =
    useState<DistrictRisk[]>([]);

  const [selectedState, setSelectedState] =
    useState("");

  const [selectedDistrict, setSelectedDistrict] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [apiOnline, setApiOnline] =
    useState(true);

  // --------------------------------
  // Load district data
  // --------------------------------

  const loadDashboardData = async (
    showLoading = false
  ) => {
    if (showLoading) {
      setIsRefreshing(true);
    }

    try {
      const [
        districtResponse,
        summaryResponse,
      ] = await Promise.all([
        axios.get<DistrictResponse>(
          `${API_BASE}/api/districts`
        ),

        axios.get<SummaryResponse>(
          `${API_BASE}/api/district-risk-summary`
        ),
      ]);

      if (districtResponse.data.success) {
        const data =
          districtResponse.data.data;

        setDistricts(data);

        if (
          data.length > 0 &&
          !selectedState
        ) {
          const first = data[0];

          setSelectedState(
            first.state
          );

          setSelectedDistrict(
            first.district
          );
        }
      }

      console.log(
        "District summary:",
        summaryResponse.data
      );

      setLastUpdated(new Date());
      setApiOnline(true);
    } catch (error) {
      console.error(
        "Dashboard API error:",
        error
      );

      setApiOnline(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // --------------------------------
  // Initial load + auto refresh
  // --------------------------------

  useEffect(() => {
    loadDashboardData();

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () =>
      clearInterval(interval);
  }, []);

  // --------------------------------
  // States
  // --------------------------------

  const states = useMemo(() => {
    return Array.from(
      new Set(
        districts.map(
          (item) => item.state
        )
      )
    ).sort();
  }, [districts]);

  // --------------------------------
  // Districts for selected state
  // --------------------------------

  const stateDistricts = useMemo(() => {
    if (!selectedState) {
      return [];
    }

    return districts
      .filter(
        (item) =>
          item.state === selectedState
      )
      .sort((a, b) =>
        a.district.localeCompare(
          b.district
        )
      );
  }, [
    districts,
    selectedState,
  ]);

  // --------------------------------
  // Current selected district
  // --------------------------------

  const currentDistrict =
    districts.find(
      (item) =>
        item.state === selectedState &&
        item.district === selectedDistrict
    );

  // --------------------------------
  // State change
  // --------------------------------

  const handleStateChange = (
    state: string
  ) => {
    setSelectedState(state);

    const firstDistrict =
      districts
        .filter(
          (item) =>
            item.state === state
        )
        .sort((a, b) =>
          a.district.localeCompare(
            b.district
          )
        )[0];

    if (firstDistrict) {
      setSelectedDistrict(
        firstDistrict.district
      );
    } else {
      setSelectedDistrict("");
    }
  };

  // --------------------------------
  // District change
  // --------------------------------

  const handleDistrictChange = (
    district: string
  ) => {
    setSelectedDistrict(district);
  };

  // --------------------------------
  // Risk counts
  // --------------------------------

  const riskCounts = useMemo(() => {
    return {
      low: districts.filter(
        (item) =>
          item.risk_level === "LOW"
      ).length,

      medium: districts.filter(
        (item) =>
          item.risk_level === "MEDIUM"
      ).length,

      high: districts.filter(
        (item) =>
          item.risk_level === "HIGH"
      ).length,
    };
  }, [districts]);

  // --------------------------------
  // Recent alerts
  // --------------------------------

  const recentAlerts = useMemo(() => {
    return [...districts]
      .filter(
        (item) =>
          item.risk_level ===
            "HIGH" ||
          item.risk_level ===
            "MEDIUM"
      )
      .sort(
        (a, b) =>
          b.risk_probability -
          a.risk_probability
      )
      .slice(0, 5);
  }, [districts]);

  // --------------------------------
  // Risk class
  // --------------------------------

  const getRiskClass = (
    risk: string
  ) => {
    if (risk === "HIGH") {
      return "high";
    }

    if (risk === "MEDIUM") {
      return "moderate";
    }

    return "low";
  };

  // --------------------------------
  // Risk description
  // --------------------------------

  const getRiskDescription = (
    risk: string
  ) => {
    if (risk === "HIGH") {
      return "High-risk conditions detected. Close monitoring is recommended.";
    }

    if (risk === "MEDIUM") {
      return "Moderate-risk conditions detected. Continue regular monitoring.";
    }

    return "Low-risk conditions detected. Current conditions appear stable.";
  };

  // --------------------------------
  // Last updated
  // --------------------------------

  const formatLastUpdated = () => {
    if (!lastUpdated) {
      return "Waiting for data...";
    }

    return lastUpdated.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  // --------------------------------
  // Scenario
  // --------------------------------

  const openScenario = () => {
    if (!currentDistrict) {
      navigate("/scenario");
      return;
    }

    navigate(
      `/scenario?location=${encodeURIComponent(
        currentDistrict.district
      )}&baselineRisk=${
        currentDistrict.risk_probability
      }&rainfall=${
        currentDistrict.rainfall_1d_mm
      }&soilMoisture=${
        currentDistrict.soil_moisture
      }&slope=${
        currentDistrict.slope
      }&elevation=${
        currentDistrict.elevation
      }&temperature=${
        currentDistrict.temperature
      }`
    );
  };

  // --------------------------------
  // Logout
  // --------------------------------

  const handleLogout = () => {
    localStorage.removeItem(
      "landslideai_logged_in"
    );

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div className="dashboard-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <div className="logo-icon">
            🌍
          </div>

          <div>
            <h2>LandslideAI</h2>
            <span>SIH26001</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <a className="active">
            📊 Dashboard
          </a>

          <a
            onClick={() =>
              navigate("/risk-map")
            }
          >
            🗺️ Risk Map
          </a>

          <a
            onClick={openScenario}
          >
            📍 Location Analysis
          </a>

          <a
            onClick={() =>
              navigate("/prediction")
            }
          >
            🤖 AI Prediction
          </a>

          <a
  onClick={() =>
    navigate("/explainable-ai")
  }
>
  🧠 Explainable AI
</a>

          {/* ================= LIVE MONITORING ================= */}

          <a
            onClick={() =>
              navigate("/live-monitoring")
            }
            style={{
              cursor: "pointer",
            }}
          >
            📡 Live Monitoring
          </a>

          <a
            onClick={() =>
              navigate(
                "/historical-events"
              )
            }
          >
            📜 Historical Events
          </a>

          <a
            onClick={() =>
              navigate(
                "/infrastructure-risk"
              )
            }
          >
            🏗️ Infrastructure Risk
          </a>

          <a
            onClick={() =>
              navigate("/alerts")
            }
          >
            ⚠️ Alerts
          </a>

          <a
            onClick={() =>
              navigate(
                "/report-landslide"
              )
            }
          >
            📸 Report a Landslide
          </a>

        </nav>

        {/* SIDEBAR BOTTOM */}

        <div className="sidebar-bottom">

         <a
  onClick={() =>
    navigate("/settings")
  }
  style={{
    cursor: "pointer",
  }}
>
  ⚙️ Settings
</a>

          <a
            onClick={handleLogout}
            style={{
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </a>

        </div>

      </aside>

      {/* ================= MAIN ================= */}

      <main className="dashboard-main">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="dashboard-label">
              NORTH EASTERN REGION
            </p>

            <h1>
              Risk Monitoring Dashboard
            </h1>

            <p className="dashboard-subtitle">
              District-level landslide risk
              monitoring across all 8 NER
              states.
            </p>

          </div>

          <div className="user-profile">

            <div className="notification">
              🔔
            </div>

            <div className="avatar">
              AI
            </div>

            <div>
              <strong>
                Administrator
              </strong>
            </div>

          </div>

        </header>

        {/* ================= SYSTEM STATUS ================= */}

        <div
          className={`system-status ${
            apiOnline
              ? "online"
              : "offline"
          }`}
        >

          <span className="status-dot"></span>

          <strong>
            {apiOnline
              ? "Live District Monitoring Active"
              : "Monitoring Connection Lost"}
          </strong>

          <span className="status-time">
            Last updated:{" "}
            {formatLastUpdated()}
          </span>

          <button
            className="refresh-button"
            onClick={() =>
              loadDashboardData(true)
            }
            disabled={isRefreshing}
          >
            {isRefreshing
              ? "Refreshing..."
              : "↻ Refresh"}
          </button>

        </div>

        {/* ================= STATISTICS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon green">
              📍
            </div>

            <div>

              <span>
                Monitored Districts
              </span>

              <strong>
                {districts.length}
              </strong>

              <small>
                Across 8 NER states
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              🟡
            </div>

            <div>

              <span>
                Medium Risk
              </span>

              <strong>
                {riskCounts.medium}
              </strong>

              <small>
                Districts
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon red">
              🔴
            </div>

            <div>

              <span>
                High Risk
              </span>

              <strong>
                {riskCounts.high}
              </strong>

              <small>
                Districts requiring
                attention
              </small>

            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              🟢
            </div>

            <div>

              <span>
                Low Risk
              </span>

              <strong>
                {riskCounts.low}
              </strong>

              <small>
                Stable districts
              </small>

            </div>

          </div>

        </section>

        {/* ================= MAIN GRID ================= */}

        <section className="dashboard-grid">

          {/* ================= RISK OVERVIEW ================= */}

          <div className="dashboard-card risk-overview">

            <div className="card-header">

              <div>

                <h2>
                  District Risk Overview
                </h2>

                <p>
                  Select a state and district
                  to view current AI risk
                  assessment.
                </p>

              </div>

              <div className="card-actions">

                <button
                  onClick={() =>
                    navigate(
                      "/risk-map"
                    )
                  }
                >
                  View Map →
                </button>

                <button
                  onClick={
                    openScenario
                  }
                >
                  Analyze →
                </button>

              </div>

            </div>

            {/* STATE + DISTRICT */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap: "15px",
                marginBottom:
                  "25px",
              }}
            >

              {/* STATE */}

              <div>

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontWeight:
                      600,
                  }}
                >
                  Select State
                </label>

                <select
                  value={selectedState}
                  onChange={(e) =>
                    handleStateChange(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    background:
                      "white",
                    fontSize:
                      "14px",
                    cursor:
                      "pointer",
                  }}
                >

                  <option value="">
                    Select State
                  </option>

                  {states.map(
                    (state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* DISTRICT */}

              <div>

                <label
                  style={{
                    display:
                      "block",
                    marginBottom:
                      "7px",
                    fontWeight:
                      600,
                  }}
                >
                  Select District
                </label>

                <select
                  value={
                    selectedDistrict
                  }
                  onChange={(e) =>
                    handleDistrictChange(
                      e.target.value
                    )
                  }
                  disabled={
                    !selectedState
                  }
                  style={{
                    width: "100%",
                    padding:
                      "12px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #d1d5db",
                    background:
                      selectedState
                        ? "white"
                        : "#f3f4f6",
                    fontSize:
                      "14px",
                    cursor:
                      selectedState
                        ? "pointer"
                        : "not-allowed",
                  }}
                >

                  {!selectedState ? (
                    <option value="">
                      Select state first
                    </option>
                  ) : (
                    stateDistricts.map(
                      (district) => (
                        <option
                          key={
                            district.district
                          }
                          value={
                            district.district
                          }
                        >
                          {
                            district.district
                          }
                        </option>
                      )
                    )
                  )}

                </select>

              </div>

            </div>

            {/* ================= RISK CONTENT ================= */}

            <div className="risk-content">

              <div className="risk-score">

                <div
                  className={`risk-circle ${
                    currentDistrict
                      ? getRiskClass(
                          currentDistrict.risk_level
                        )
                      : ""
                  }`}
                >

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.risk_probability}%`
                      : "0%"}
                  </strong>

                  <span>
                    {currentDistrict
                      ? `${currentDistrict.risk_level} RISK`
                      : "NO DATA"}
                  </span>

                </div>

              </div>

              <div className="risk-details">

                <h3>

                  {currentDistrict
                    ? `${currentDistrict.district}, ${currentDistrict.state}`
                    : "Select a district"}

                </h3>

                <p>

                  {currentDistrict
                    ? getRiskDescription(
                        currentDistrict.risk_level
                      )
                    : "Select a state and district to view risk information."}

                </p>

                <div className="factor">

                  <span>
                    🌧️ 1-Day Rainfall
                  </span>

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.rainfall_1d_mm} mm`
                      : "--"}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    🌧️ 3-Day Rainfall
                  </span>

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.rainfall_3d_mm} mm`
                      : "--"}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    🌧️ 7-Day Rainfall
                  </span>

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.rainfall_7d_mm} mm`
                      : "--"}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    🌧️ 15-Day Rainfall
                  </span>

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.rainfall_15d_mm} mm`
                      : "--"}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    ⛰️ Slope
                  </span>

                  <strong>
                    {currentDistrict
                      ? `${currentDistrict.slope}°`
                      : "--"}
                  </strong>

                </div>

                <div className="factor">

                  <span>
                    💧 Soil Moisture
                  </span>

                  <strong>
                    {currentDistrict
                      ? currentDistrict.soil_moisture
                      : "--"}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          {/* ================= RECENT ALERTS ================= */}

          <div className="dashboard-card alerts-card">

            <div className="card-header">

              <div>

                <h2>
                  Recent Alerts
                </h2>

                <p>
                  Latest district risk
                  notifications
                </p>

              </div>

              <button
                onClick={() =>
                  navigate(
                    "/alerts"
                  )
                }
              >
                View All →
              </button>

            </div>

            {recentAlerts.length ===
            0 ? (

              <div className="alert-item info">

                <span className="alert-symbol">
                  i
                </span>

                <div>

                  <strong>
                    No active alerts
                  </strong>

                  <p>
                    All monitored
                    districts are
                    currently stable.
                  </p>

                </div>

              </div>

            ) : (

              recentAlerts.map(
                (district) => (

                  <div
                    className={`alert-item ${
                      district.risk_level ===
                      "HIGH"
                        ? "warning"
                        : "info"
                    }`}
                    key={`${district.state}-${district.district}`}
                  >

                    <span className="alert-symbol">
                      !
                    </span>

                    <div>

                      <strong>
                        {district.risk_level ===
                        "HIGH"
                          ? "High landslide risk"
                          : "Medium landslide risk"}
                      </strong>

                      <p>
                        {
                          district.district
                        }
                        ,{" "}
                        {
                          district.state
                        }{" "}
                        • Probability:{" "}
                        {
                          district.risk_probability
                        }%
                      </p>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </section>

        {/* ================= RISK DISTRIBUTION ================= */}

        <section className="dashboard-card risk-distribution-card">

          <div className="card-header">

            <div>

              <h2>
                Risk Distribution
              </h2>

              <p>
                Current risk levels across
                all monitored districts
              </p>

            </div>

          </div>

          <div className="risk-distribution">

            {/* LOW */}

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
                      districts.length
                        ? (riskCounts.low /
                            districts.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            {/* MEDIUM */}

            <div className="distribution-item moderate">

              <div className="distribution-top">

                <span>
                  🟡 Medium Risk
                </span>

                <strong>
                  {riskCounts.medium}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      districts.length
                        ? (riskCounts.medium /
                            districts.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

            {/* HIGH */}

            <div className="distribution-item high">

              <div className="distribution-top">

                <span>
                  🔴 High Risk
                </span>

                <strong>
                  {riskCounts.high}
                </strong>

              </div>

              <div className="distribution-bar">

                <div
                  style={{
                    width: `${
                      districts.length
                        ? (riskCounts.high /
                            districts.length) *
                          100
                        : 0
                    }%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* ================= ALL DISTRICTS ================= */}

        <section className="dashboard-card">

          <div className="card-header">

            <div>

              <h2>
                All NER Districts
              </h2>

              <p>
                {districts.length} districts
                monitored across 8 states
              </p>

            </div>

            <button
              onClick={() =>
                navigate(
                  "/risk-map"
                )
              }
            >
              Open Full Map →
            </button>

          </div>

          <div
            style={{
              overflowX: "auto",
              maxHeight: "500px",
              overflowY: "auto",
            }}
          >

            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
              }}
            >

              <thead>

                <tr>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "10px",
                    }}
                  >
                    State
                  </th>

                  <th
                    style={{
                      textAlign:
                        "left",
                      padding:
                        "10px",
                    }}
                  >
                    District
                  </th>

                  <th
                    style={{
                      padding:
                        "10px",
                    }}
                  >
                    1-Day Rainfall
                  </th>

                  <th
                    style={{
                      padding:
                        "10px",
                    }}
                  >
                    7-Day Rainfall
                  </th>

                  <th
                    style={{
                      padding:
                        "10px",
                    }}
                  >
                    Risk
                  </th>

                  <th
                    style={{
                      padding:
                        "10px",
                    }}
                  >
                    Probability
                  </th>

                </tr>

              </thead>

              <tbody>

                {districts.map(
                  (district) => (

                    <tr
                      key={`${district.state}-${district.district}`}
                      onClick={() => {

                        setSelectedState(
                          district.state
                        );

                        setSelectedDistrict(
                          district.district
                        );

                        window.scrollTo({
                          top: 0,
                          behavior:
                            "smooth",
                        });

                      }}
                      style={{
                        cursor:
                          "pointer",
                      }}
                    >

                      <td
                        style={{
                          padding:
                            "10px",
                        }}
                      >
                        {
                          district.state
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "10px",
                          fontWeight:
                            600,
                        }}
                      >
                        {
                          district.district
                        }
                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "10px",
                        }}
                      >
                        {
                          district.rainfall_1d_mm
                        }{" "}
                        mm
                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "10px",
                        }}
                      >
                        {
                          district.rainfall_7d_mm
                        }{" "}
                        mm
                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "10px",
                        }}
                      >

                        {district.risk_level ===
                        "HIGH"
                          ? "🔴 HIGH"
                          : district.risk_level ===
                            "MEDIUM"
                          ? "🟡 MEDIUM"
                          : "🟢 LOW"}

                      </td>

                      <td
                        style={{
                          textAlign:
                            "center",
                          padding:
                            "10px",
                        }}
                      >
                        {
                          district.risk_probability
                        }%
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* ================= ENVIRONMENT ================= */}

        <section className="dashboard-grid bottom-grid">

          <div className="dashboard-card">

            <div className="card-header">

              <div>

                <h2>
                  Environmental Conditions
                </h2>

                <p>
                  Selected district
                  measurements
                </p>

              </div>

            </div>

            <div className="environment-grid">

              <div>

                <span>
                  🌧️ 15-Day Rainfall
                </span>

                <strong>
                  {currentDistrict
                    ? `${currentDistrict.rainfall_15d_mm} mm`
                    : "--"}
                </strong>

                <small>
                  IMD rainfall dataset
                </small>

              </div>

              <div>

                <span>
                  🌡️ Temperature
                </span>

                <strong>
                  {currentDistrict
                    ? `${currentDistrict.temperature}°C`
                    : "--"}
                </strong>

                <small>
                  Monitoring value
                </small>

              </div>

              <div>

                <span>
                  💧 Soil Moisture
                </span>

                <strong>
                  {currentDistrict
                    ? currentDistrict.soil_moisture
                    : "--"}
                </strong>

                <small>
                  Model input
                </small>

              </div>

              <div>

                <span>
                  ⛰️ Elevation
                </span>

                <strong>
                  {currentDistrict
                    ? `${currentDistrict.elevation} m`
                    : "--"}
                </strong>

                <small>
                  Model input
                </small>

              </div>

            </div>

          </div>

          {/* QUICK ACTIONS */}

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
              onClick={() =>
                navigate(
                  "/prediction"
                )
              }
            >
              🤖 Run AI Prediction
            </button>

            <button
              onClick={() =>
                navigate(
                  "/risk-map"
                )
              }
            >
              🗺️ Open Risk Map
            </button>

            <button
              onClick={() =>
                navigate(
                  "/alerts"
                )
              }
            >
              ⚠️ View Alerts
            </button>

            <button
              onClick={() =>
                navigate(
                  "/report-landslide"
                )
              }
            >
              📸 Report a Landslide
            </button>

          </div>

        </section>

        {/* ================= FOOTER ================= */}

        <footer className="dashboard-footer">

          <span>
            LandslideAI • SIH26001
            Prototype
          </span>

          <span>
            Predict. Monitor. Explain.
            Protect.
          </span>

        </footer>

      </main>

    </div>
  );
}

export default Dashboard;