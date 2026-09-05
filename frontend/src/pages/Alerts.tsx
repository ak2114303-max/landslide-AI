import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Alerts.css";

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

function Alerts() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState<
    LocationData[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get(
        "http://127.0.0.1:8000/api/locations"
      )
      .then((response) => {
        setLocations(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(
          "Alerts API error:",
          error
        );

        setError(
          "Unable to load alerts. Please check the backend server."
        );

        setLoading(false);
      });
  }, []);

  const getAlertType = (
    riskLevel: string
  ) => {
    if (riskLevel === "Critical") {
      return "Critical Alert";
    }

    if (riskLevel === "High") {
      return "High Risk Alert";
    }

    if (riskLevel === "Moderate") {
      return "Monitoring Alert";
    }

    return "Information";
  };

  const getAlertMessage = (
    location: LocationData
  ) => {
    if (location.risk_level === "Critical") {
      return `Critical landslide risk detected at ${location.location}. Immediate monitoring and preventive action are recommended.`;
    }

    if (location.risk_level === "High") {
      return `High landslide risk detected at ${location.location}. Close monitoring is recommended.`;
    }

    if (location.risk_level === "Moderate") {
      return `Moderate landslide risk detected at ${location.location}. Continue regular monitoring.`;
    }

    return `Low landslide risk at ${location.location}. Current environmental conditions appear stable.`;
  };

  const criticalAlerts = locations.filter(
    (location) =>
      location.risk_level === "Critical"
  ).length;

  const highAlerts = locations.filter(
    (location) =>
      location.risk_level === "High"
  ).length;

  const moderateAlerts = locations.filter(
    (location) =>
      location.risk_level === "Moderate"
  ).length;

  const sortedLocations = [...locations].sort(
    (a, b) =>
      b.risk_score - a.risk_score
  );

  return (
    <div className="alerts-page">

      {/* Header */}

      <header className="alerts-header">

        <div>

          <p className="alerts-label">
            DISASTER MANAGEMENT
          </p>

          <h1>
            Alerts & Notifications
          </h1>

          <p className="alerts-subtitle">
            Monitor landslide risk alerts generated
            from current environmental conditions.
          </p>

        </div>

        <button
          className="back-dashboard-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* Summary */}

      <section className="alert-summary">

        <div className="alert-summary-card critical">

          <span>🔴</span>

          <div>
            <small>
              Critical Alerts
            </small>

            <strong>
              {criticalAlerts}
            </strong>
          </div>

        </div>

        <div className="alert-summary-card high">

          <span>🟠</span>

          <div>
            <small>
              High Risk Alerts
            </small>

            <strong>
              {highAlerts}
            </strong>
          </div>

        </div>

        <div className="alert-summary-card moderate">

          <span>🟡</span>

          <div>
            <small>
              Monitoring Alerts
            </small>

            <strong>
              {moderateAlerts}
            </strong>
          </div>

        </div>

        <div className="alert-summary-card total">

          <span>📍</span>

          <div>
            <small>
              Total Monitored
            </small>

            <strong>
              {locations.length}
            </strong>
          </div>

        </div>

      </section>

      {/* Alerts */}

      <section className="alerts-card">

        <div className="alerts-card-header">

          <div>

            <h2>
              Current Risk Alerts
            </h2>

            <p>
              Automatically generated from
              monitored locations
            </p>

          </div>

          <span className="live-indicator">
            ● Live
          </span>

        </div>

        {/* Loading */}

        {loading && (
          <div className="alerts-loading">
            Loading alerts...
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="alerts-error">
            {error}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          locations.length === 0 && (
            <div className="alerts-empty">
              No monitored locations available.
            </div>
          )}

        {/* Alert List */}

        {!loading &&
          !error &&
          locations.length > 0 && (

            <div className="alerts-list">

              {sortedLocations.map(
                (location) => (

                  <div
                    key={location.location}
                    className={`alert-row ${location.risk_level.toLowerCase()}`}
                  >

                    <div className="alert-icon">

                      {location.risk_level ===
                      "Critical"
                        ? "🚨"
                        : location.risk_level ===
                          "High"
                        ? "⚠️"
                        : location.risk_level ===
                          "Moderate"
                        ? "🟡"
                        : "ℹ️"}

                    </div>

                    <div className="alert-content">

                      <div className="alert-title-row">

                        <h3>
                          {getAlertType(
                            location.risk_level
                          )}
                        </h3>

                        <span className="alert-risk-score">
                          {location.risk_score}%
                        </span>

                      </div>

                      <p>
                        {getAlertMessage(
                          location
                        )}
                      </p>

                      <div className="alert-details">

                        <span>
                          📍{" "}
                          {location.location}
                        </span>

                        <span>
                          🌧️{" "}
                          {location.rainfall_mm} mm
                        </span>

                        <span>
                          💧{" "}
                          {location.soil_moisture}%
                        </span>

                        <span>
                          ⛰️{" "}
                          {location.slope_degree}°
                        </span>

                        <span>
                          🌡️{" "}
                          {location.temperature_c}°C
                        </span>

                      </div>

                      {/* Analyze Location */}

                      <button
                        className="alert-analyze-button"
                        onClick={() =>
                          navigate(
                            `/scenario?location=${encodeURIComponent(
                              location.location
                            )}&baselineRisk=${
                              location.risk_score
                            }&rainfall=${
                              location.rainfall_mm
                            }&soilMoisture=${
                              location.soil_moisture
                            }&slope=${
                              location.slope_degree
                            }&elevation=${
                              location.elevation_m
                            }&temperature=${
                              location.temperature_c
                            }`
                          )
                        }
                      >
                        Analyze Location →
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

      </section>

      {/* Footer */}

      <footer className="alerts-footer">

        <span>
          LandslideAI • SIH26001 Prototype
        </span>

        <span>
          Predict. Monitor. Explain. Protect.
        </span>

      </footer>

    </div>
  );
}

export default Alerts;