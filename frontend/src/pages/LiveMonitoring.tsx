import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./LiveMonitoring.css";

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

function LiveMonitoring() {
  const [districts, setDistricts] = useState<DistrictRisk[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiOnline, setApiOnline] = useState(false);
  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] =
    useState("ALL");
  const [stateFilter, setStateFilter] =
    useState("ALL");

  const loadData = async (
    manualRefresh = false
  ) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response =
        await axios.get<DistrictResponse>(
          `${API_BASE}/api/districts`,
          {
            timeout: 0,
          }
        );

      if (response.data.success) {
        setDistricts(response.data.data);
        setApiOnline(true);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error(
        "Live monitoring error:",
        error
      );
      setApiOnline(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const states = useMemo(() => {
    return Array.from(
      new Set(
        districts.map(
          (item) => item.state
        )
      )
    ).sort();
  }, [districts]);

  const filteredDistricts = useMemo(() => {
    return districts
      .filter((item) => {
        const matchesSearch =
          item.district
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          item.state
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchesRisk =
          riskFilter === "ALL" ||
          item.risk_level === riskFilter;

        const matchesState =
          stateFilter === "ALL" ||
          item.state === stateFilter;

        return (
          matchesSearch &&
          matchesRisk &&
          matchesState
        );
      })
      .sort(
        (a, b) =>
          b.risk_probability -
          a.risk_probability
      );
  }, [
    districts,
    search,
    riskFilter,
    stateFilter,
  ]);

  const highRisk = districts.filter(
    (item) =>
      item.risk_level === "HIGH"
  ).length;

  const mediumRisk = districts.filter(
    (item) =>
      item.risk_level === "MEDIUM"
  ).length;

  const lowRisk = districts.filter(
    (item) =>
      item.risk_level === "LOW"
  ).length;

  const formatTime = () => {
    if (!lastUpdated) {
      return "--";
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

  const getRiskClass = (
    risk: string
  ) => {
    if (risk === "HIGH") {
      return "high";
    }

    if (risk === "MEDIUM") {
      return "medium";
    }

    return "low";
  };

  return (
    <div className="live-monitoring-page">

      {/* Header */}
      <div className="live-header">

        <div>
          <div className="live-title-row">
            <h1>
              📡 Live Monitoring
            </h1>

            <span
              className={
                apiOnline
                  ? "connection-badge online"
                  : "connection-badge offline"
              }
            >
              <span className="connection-dot" />
              {apiOnline
                ? "API Online"
                : "API Offline"}
            </span>
          </div>

          <p>
            Real-time district-level landslide
            risk monitoring across the North
            Eastern Region.
          </p>
        </div>

        <button
          className="refresh-live-button"
          onClick={() =>
            loadData(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh Now"}
        </button>

      </div>

      {/* Status bar */}
      <div className="monitor-status">

        <div>
          <span className="status-pulse" />
          <strong>
            Live District Monitoring
          </strong>
          <span>
            Automatic refresh every 30 seconds
          </span>
        </div>

        <span>
          Last updated: {formatTime()}
        </span>

      </div>

      {/* Statistics */}
      <div className="monitor-stats">

        <div className="monitor-stat">
          <span className="stat-icon total">
            📍
          </span>

          <div>
            <small>
              Monitored Districts
            </small>

            <strong>
              {districts.length}
            </strong>
          </div>
        </div>

        <div className="monitor-stat">
          <span className="stat-icon high">
            🔴
          </span>

          <div>
            <small>
              High Risk
            </small>

            <strong>
              {highRisk}
            </strong>
          </div>
        </div>

        <div className="monitor-stat">
          <span className="stat-icon medium">
            🟡
          </span>

          <div>
            <small>
              Medium Risk
            </small>

            <strong>
              {mediumRisk}
            </strong>
          </div>
        </div>

        <div className="monitor-stat">
          <span className="stat-icon low">
            🟢
          </span>

          <div>
            <small>
              Low Risk
            </small>

            <strong>
              {lowRisk}
            </strong>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="monitor-card filter-card">

        <div className="filter-title">
          <h2>
            🔎 Monitoring Filters
          </h2>

          <span>
            {filteredDistricts.length} results
          </span>
        </div>

        <div className="filter-row">

          <input
            type="text"
            placeholder="Search district or state..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={stateFilter}
            onChange={(e) =>
              setStateFilter(
                e.target.value
              )
            }
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

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(
                e.target.value
              )
            }
          >
            <option value="ALL">
              All Risk Levels
            </option>

            <option value="HIGH">
              High Risk
            </option>

            <option value="MEDIUM">
              Medium Risk
            </option>

            <option value="LOW">
              Low Risk
            </option>
          </select>

        </div>

      </div>

      {/* Monitoring table */}
      <div className="monitor-card table-card">

        <div className="table-header">

          <div>
            <h2>
              📊 Live District Status
            </h2>

            <p>
              Current model output and
              environmental conditions
            </p>
          </div>

          <span className="data-source">
            District Risk API
          </span>

        </div>

        {loading ? (
          <div className="monitor-loading">
            <div className="loading-spinner" />
            <p>
              Loading live monitoring data...
            </p>
          </div>
        ) : filteredDistricts.length ===
          0 ? (
          <div className="empty-monitor">
            <span>🔍</span>
            <h3>
              No districts found
            </h3>
            <p>
              Try changing your search or
              filter.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="monitor-table">

              <thead>
                <tr>
                  <th>
                    District
                  </th>

                  <th>
                    State
                  </th>

                  <th>
                    1-Day Rain
                  </th>

                  <th>
                    7-Day Rain
                  </th>

                  <th>
                    Soil Moisture
                  </th>

                  <th>
                    Slope
                  </th>

                  <th>
                    Risk
                  </th>

                  <th>
                    Probability
                  </th>

                  <th>
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDistricts.map(
                  (item) => (
                    <tr
                      key={`${item.state}-${item.district}`}
                    >
                      <td>
                        <strong>
                          {item.district}
                        </strong>
                      </td>

                      <td>
                        {item.state}
                      </td>

                      <td>
                        {item.rainfall_1d_mm.toFixed(
                          1
                        )}{" "}
                        mm
                      </td>

                      <td>
                        {item.rainfall_7d_mm.toFixed(
                          1
                        )}{" "}
                        mm
                      </td>

                      <td>
                        {item.soil_moisture.toFixed(
                          3
                        )}
                      </td>

                      <td>
                        {item.slope.toFixed(
                          2
                        )}°
                      </td>

                      <td>
                        <span
                          className={`risk-badge ${getRiskClass(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {item.risk_probability.toFixed(
                            1
                          )}%
                        </strong>
                      </td>

                      <td>
                        {item.date}
                      </td>
                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* Info */}
      <div className="monitor-info">

        <div>
          <span>🔄</span>

          <div>
            <strong>
              Automatic Updates
            </strong>

            <p>
              Monitoring data refreshes
              automatically every 30 seconds.
            </p>
          </div>
        </div>

        <div>
          <span>🤖</span>

          <div>
            <strong>
              AI Risk Assessment
            </strong>

            <p>
              Risk levels are provided by the
              existing Random Forest prototype.
            </p>
          </div>
        </div>

        <div>
          <span>🌧️</span>

          <div>
            <strong>
              Rainfall Monitoring
            </strong>

            <p>
              Rainfall values are sourced from
              the existing district dataset.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}

export default LiveMonitoring;