import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Alerts.css";

const API_BASE = "http://127.0.0.1:8000";

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

function normalizeRisk(risk: string) {
  return String(risk || "LOW").toUpperCase();
}

function getRiskClass(risk: string) {
  const value = normalizeRisk(risk);

  if (value === "HIGH" || value === "CRITICAL") {
    return "high";
  }

  if (value === "MEDIUM" || value === "MODERATE") {
    return "medium";
  }

  return "low";
}

function Alerts() {
  const navigate = useNavigate();

  const [districts, setDistricts] = useState<DistrictRisk[]>([]);
  const [selectedState, setSelectedState] = useState("ALL");
  const [selectedDistrict, setSelectedDistrict] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchAlerts = async () => {
    try {
      setError("");

      const response = await axios.get(
        `${API_BASE}/api/districts`,
        {
          timeout: 60000,
        }
      );

      const data: DistrictRisk[] = response.data?.data ?? [];

      setDistricts(data);
      setLastUpdated(new Date().toLocaleTimeString());

      setSelectedState((current) => {
        if (current === "ALL") {
          return current;
        }

        return data.some(
          (item) => item.state === current
        )
          ? current
          : "ALL";
      });

      setSelectedDistrict((current) => {
        if (current === "ALL") {
          return current;
        }

        return data.some(
          (item) =>
            item.district === current &&
            (selectedState === "ALL" ||
              item.state === selectedState)
        )
          ? current
          : "ALL";
      });
    } catch (err) {
      console.error(
        "Failed to load district alerts:",
        err
      );

      setError(
        "Unable to load district risk data. Please check the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = window.setInterval(
      fetchAlerts,
      30000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const states = useMemo(() => {
    return Array.from(
      new Set(
        districts.map((item) => item.state)
      )
    ).sort();
  }, [districts]);

  const districtOptions = useMemo(() => {
    if (selectedState === "ALL") {
      return [];
    }

    return Array.from(
      new Set(
        districts
          .filter(
            (item) =>
              item.state === selectedState
          )
          .map((item) => item.district)
      )
    ).sort();
  }, [districts, selectedState]);

  const filteredDistricts = useMemo(() => {
    return districts
      .filter(
        (item) =>
          selectedState === "ALL" ||
          item.state === selectedState
      )
      .filter(
        (item) =>
          selectedDistrict === "ALL" ||
          item.district === selectedDistrict
      )
      .sort((a, b) => {
        const riskOrder: Record<string, number> = {
          CRITICAL: 0,
          HIGH: 1,
          MEDIUM: 2,
          MODERATE: 2,
          LOW: 3,
        };

        return (
          (riskOrder[
            normalizeRisk(a.risk_level)
          ] ?? 4) -
            (riskOrder[
              normalizeRisk(b.risk_level)
            ] ?? 4) ||
          b.risk_probability -
            a.risk_probability
        );
      });
  }, [
    districts,
    selectedState,
    selectedDistrict,
  ]);

  const counts = useMemo(() => {
    return {
      high: filteredDistricts.filter(
        (item) => {
          const risk = normalizeRisk(
            item.risk_level
          );

          return (
            risk === "HIGH" ||
            risk === "CRITICAL"
          );
        }
      ).length,

      medium: filteredDistricts.filter(
        (item) => {
          const risk = normalizeRisk(
            item.risk_level
          );

          return (
            risk === "MEDIUM" ||
            risk === "MODERATE"
          );
        }
      ).length,

      low: filteredDistricts.filter(
        (item) =>
          normalizeRisk(
            item.risk_level
          ) === "LOW"
      ).length,

      total: filteredDistricts.length,
    };
  }, [filteredDistricts]);

  const highRiskDistricts = useMemo(() => {
    return filteredDistricts.filter(
      (item) => {
        const risk = normalizeRisk(
          item.risk_level
        );

        return (
          risk === "HIGH" ||
          risk === "CRITICAL"
        );
      }
    );
  }, [filteredDistricts]);

  const handleStateChange = (
    value: string
  ) => {
    setSelectedState(value);
    setSelectedDistrict("ALL");
  };

  const resetFilters = () => {
    setSelectedState("ALL");
    setSelectedDistrict("ALL");
  };

  const formatNumber = (
    value: number,
    digits = 1
  ) => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number.toFixed(digits)
      : "0.0";
  };

  if (loading) {
    return (
      <div className="alerts-page">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>
            Loading district risk alerts...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-page">

      {/* Header */}
      <div className="page-header">
        <div className="header-content">

          <div>
            <h1 className="page-title">
              🚨 Risk Alerts
            </h1>

            <p className="page-subtitle">
              District-level landslide risk
              monitoring across the North
              Eastern Region
            </p>
          </div>

          <div className="header-actions">

            <span className="last-updated">
              Updated:{" "}
              {lastUpdated || "--"}
            </span>

            <button
              className="refresh-btn"
              onClick={fetchAlerts}
            >
              🔄 Refresh
            </button>

            <button
              className="refresh-btn"
              onClick={() =>
                navigate("/dashboard")
              }
            >
              ← Dashboard
            </button>

          </div>
        </div>
      </div>

      <div className="alerts-content">

        {/* Error */}
        {error && (
          <div className="alerts-error">
            ⚠️ {error}
          </div>
        )}

        {/* Filters */}
        <div
          className="alert-filter-panel"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            alignItems: "end",
            marginBottom: "24px",
            padding: "20px",
            borderRadius: "14px",
            background: "#ffffff",
            border:
              "1px solid #e2e8f0",
            boxShadow:
              "0 4px 16px rgba(15, 23, 42, 0.06)",
          }}
        >

          {/* State */}
          <div>
            <label
              htmlFor="alert-state"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 700,
                color: "#334155",
              }}
            >
              State
            </label>

            <select
              id="alert-state"
              value={selectedState}
              onChange={(e) =>
                handleStateChange(
                  e.target.value
                )
              }
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1",
                background: "#fff",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              <option value="ALL">
                All States
              </option>

              {states.map((state) => (
                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label
              htmlFor="alert-district"
              style={{
                display: "block",
                marginBottom: "7px",
                fontWeight: 700,
                color: "#334155",
              }}
            >
              District
            </label>

            <select
              id="alert-district"
              value={selectedDistrict}
              onChange={(e) =>
                setSelectedDistrict(
                  e.target.value
                )
              }
              disabled={
                selectedState === "ALL"
              }
              style={{
                width: "100%",
                padding: "11px 12px",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1",
                background:
                  selectedState === "ALL"
                    ? "#f1f5f9"
                    : "#fff",
                fontSize: "14px",
                cursor:
                  selectedState === "ALL"
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              <option value="ALL">
                All Districts
              </option>

              {districtOptions.map(
                (district) => (
                  <option
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>
                )
              )}
            </select>
          </div>

          {/* Reset */}
          <div>
            <button
              type="button"
              onClick={resetFilters}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "9px",
                border:
                  "1px solid #cbd5e1",
                background: "#f8fafc",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              ↺ Reset Filters
            </button>
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Showing{" "}
            <strong>
              {filteredDistricts.length}
            </strong>{" "}
            of{" "}
            <strong>
              {districts.length}
            </strong>{" "}
            monitored districts
          </div>

        </div>

        {/* Summary */}
        <div className="summary-grid">

          <div className="summary-card high-risk">
            <div className="summary-icon">
              🔴
            </div>

            <div>
              <div className="summary-value">
                {counts.high}
              </div>

              <div className="summary-label">
                High Risk
              </div>
            </div>
          </div>

          <div className="summary-card medium-risk">
            <div className="summary-icon">
              🟠
            </div>

            <div>
              <div className="summary-value">
                {counts.medium}
              </div>

              <div className="summary-label">
                Medium Risk
              </div>
            </div>
          </div>

          <div className="summary-card low-risk">
            <div className="summary-icon">
              🟢
            </div>

            <div>
              <div className="summary-value">
                {counts.low}
              </div>

              <div className="summary-label">
                Low Risk
              </div>
            </div>
          </div>

          <div className="summary-card monitored">
            <div className="summary-icon">
              📍
            </div>

            <div>
              <div className="summary-value">
                {counts.total}
              </div>

              <div className="summary-label">
                Monitored Districts
              </div>
            </div>
          </div>

        </div>

        {/* High Risk Alerts */}
        <section className="high-risk-section">

          <div className="section-header">
            <div>
              <h2>
                🔴 High Risk Alerts
              </h2>

              <p>
                {selectedState === "ALL"
                  ? "Districts currently requiring attention"
                  : `High-risk districts in ${selectedState}`}
              </p>
            </div>
          </div>

          {highRiskDistricts.length ===
          0 ? (
            <div
              style={{
                padding: "22px",
                borderRadius: "12px",
                background: "#f0fdf4",
                border:
                  "1px solid #bbf7d0",
                color: "#166534",
                marginBottom: "24px",
              }}
            >
              🟢 No high-risk alert in
              the current selection.
            </div>
          ) : (
            <div className="alert-list">

              {highRiskDistricts.map(
                (item) => (
                  <div
                    className={`alert-card ${getRiskClass(
                      item.risk_level
                    )}`}
                    key={`${item.state}-${item.district}`}
                  >

                    <div className="alert-main">

                      <div>
                        <h3>
                          {item.district}
                        </h3>

                        <p>
                          {item.state}
                        </p>
                      </div>

                      <div className="risk-badge">
                        {normalizeRisk(
                          item.risk_level
                        )}{" "}
                        ·{" "}
                        {formatNumber(
                          item.risk_probability,
                          1
                        )}
                        %
                      </div>

                    </div>

                    <div className="alert-details">

                      <div>
                        <span>
                          🌧️ 1-day rainfall
                        </span>

                        <strong>
                          {formatNumber(
                            item.rainfall_1d_mm
                          )}{" "}
                          mm
                        </strong>
                      </div>

                      <div>
                        <span>
                          🌧️ 7-day rainfall
                        </span>

                        <strong>
                          {formatNumber(
                            item.rainfall_7d_mm
                          )}{" "}
                          mm
                        </strong>
                      </div>

                      <div>
                        <span>
                          💧 Soil moisture
                        </span>

                        <strong>
                          {formatNumber(
                            item.soil_moisture,
                            3
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          ⛰️ Slope
                        </span>

                        <strong>
                          {formatNumber(
                            item.slope,
                            2
                          )}
                          °
                        </strong>
                      </div>

                    </div>

                    <div className="alert-footer">
                      <span>
                        🤖 Random Forest
                      </span>

                      <span>
                        📅 {item.date}
                      </span>
                    </div>

                  </div>
                )
              )}

            </div>
          )}
        </section>

        {/* District Status */}
        <section className="district-status-section">

          <div className="section-header">

            <div>
              <h2>
                📍 Current District Risk
                Status
              </h2>

              <p>
                {selectedDistrict !==
                "ALL"
                  ? `${selectedDistrict}, ${selectedState}`
                  : selectedState !==
                    "ALL"
                  ? `All districts in ${selectedState}`
                  : "All NER districts"}
              </p>
            </div>

          </div>

          <div className="district-list">

            {filteredDistricts.map(
              (item) => (
                <div
                  className="district-card"
                  key={`${item.state}-${item.district}`}
                >

                  <div className="district-info">

                    <div>
                      <h3>
                        {item.district}
                      </h3>

                      <p>
                        {item.state}
                      </p>
                    </div>

                    <span
                      className={`risk-badge ${getRiskClass(
                        item.risk_level
                      )}`}
                    >
                      {normalizeRisk(
                        item.risk_level
                      )}
                    </span>

                  </div>

                  <div className="district-metrics">

                    <div>
                      <span>
                        Probability
                      </span>

                      <strong>
                        {formatNumber(
                          item.risk_probability,
                          1
                        )}
                        %
                      </strong>
                    </div>

                    <div>
                      <span>
                        1D Rainfall
                      </span>

                      <strong>
                        {formatNumber(
                          item.rainfall_1d_mm
                        )}{" "}
                        mm
                      </strong>
                    </div>

                    <div>
                      <span>
                        3D Rainfall
                      </span>

                      <strong>
                        {formatNumber(
                          item.rainfall_3d_mm
                        )}{" "}
                        mm
                      </strong>
                    </div>

                    <div>
                      <span>
                        7D Rainfall
                      </span>

                      <strong>
                        {formatNumber(
                          item.rainfall_7d_mm
                        )}{" "}
                        mm
                      </strong>
                    </div>

                    <div>
                      <span>
                        15D Rainfall
                      </span>

                      <strong>
                        {formatNumber(
                          item.rainfall_15d_mm
                        )}{" "}
                        mm
                      </strong>
                    </div>

                    <div>
                      <span>
                        Slope
                      </span>

                      <strong>
                        {formatNumber(
                          item.slope,
                          2
                        )}
                        °
                      </strong>
                    </div>

                  </div>

                  <div className="district-date">
                    Data date: {item.date}
                  </div>

                </div>
              )
            )}

          </div>

          {filteredDistricts.length ===
            0 && (
            <div className="alerts-error">
              No district data found for
              the selected filters.
            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default Alerts;