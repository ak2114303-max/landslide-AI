import {
  MapContainer,
  TileLayer,
  Popup,
  Marker,
  Tooltip,
  Polyline,
  LayersControl,
  LayerGroup,
  GeoJSON,
} from "react-leaflet";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import L from "leaflet";
import axios from "axios";

import "leaflet/dist/leaflet.css";
import "./RiskMap.css";

import { NER_STATES } from "../data/nerStates";
import nerDistricts from "../data/nerDistricts.json";

// ==================================================
// API
// ==================================================

const API_BASE = "https://landslide-ai-backend.onrender.com";

// ==================================================
// Interfaces
// ==================================================

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

interface RoadData {
  id: number;
  name: string;
  status: string;
  risk_level: string;
  coordinates: [number, number][];
}

// ==================================================
// NER DISTRICT GEOJSON
// ==================================================

const nerGeoJson = {
  ...nerDistricts,

  features: nerDistricts.features.filter(
    (feature: any) =>
      NER_STATES.some(
        (state) =>
          state.trim().toUpperCase() ===
          feature.properties?.st_nm
            ?.trim()
            .toUpperCase()
      )
  ),
};

// ==================================================
// NORMALIZE STATE
// ==================================================

const normalizeState = (
  value: string = ""
) => {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
};

// ==================================================
// NORMALIZE DISTRICT
// ==================================================

const normalizeDistrict = (
  value: string = ""
) => {
  return value
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
};

// ==================================================
// RISK COLOR
// ==================================================

const getRiskColor = (
  riskLevel: string
) => {
  switch (
    riskLevel?.toUpperCase()
  ) {
    case "LOW":
      return "#22c55e";

    case "MEDIUM":
    case "MODERATE":
      return "#eab308";

    case "HIGH":
      return "#ef4444";

    case "CRITICAL":
      return "#991b1b";

    case "UNAVAILABLE":
      return "#94a3b8";

    default:
      return "#94a3b8";
  }
};

// ==================================================
// RISK MARKER
// ==================================================

const createRiskIcon = (
  riskLevel: string
) => {
  const color =
    getRiskColor(riskLevel);

  return L.divIcon({
    className:
      "custom-risk-marker",

    html: `
      <div
        style="
          width: 17px;
          height: 17px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "
      ></div>
    `,

    iconSize: [23, 23],

    iconAnchor: [11.5, 11.5],
  });
};

// ==================================================
// GET DISTRICT CENTER
// ==================================================

const getDistrictCenter = (
  feature: any
): [number, number] | null => {
  try {
    const layer =
      L.geoJSON(feature);

    const bounds =
      layer.getBounds();

    if (!bounds.isValid()) {
      return null;
    }

    const center =
      bounds.getCenter();

    return [
      center.lat,
      center.lng,
    ];
  } catch {
    return null;
  }
};

// ==================================================
// MAIN COMPONENT
// ==================================================

function RiskMap() {
  const navigate =
    useNavigate();

  // ==================================================
  // STATE
  // ==================================================

  const [districts, setDistricts] =
    useState<DistrictRisk[]>([]);

  const [selectedDistrict, setSelectedDistrict] =
    useState<DistrictRisk | null>(
      null
    );

  const [roads, setRoads] =
    useState<RoadData[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==================================================
  // FETCH DISTRICT DATA
  // ==================================================

  const fetchDistrictRisk =
    async () => {
      try {
        setError("");

        const response =
          await axios.get(
            `${API_BASE}/api/districts`,
            {
              timeout: 30000,
            }
          );

        if (
          !response.data ||
          !Array.isArray(
            response.data.data
          )
        ) {
          throw new Error(
            "Invalid district API response"
          );
        }

        const districtData =
          response.data.data as DistrictRisk[];

        setDistricts(
          districtData
        );

        setSelectedDistrict(
          (current) => {
            if (!current) {
              return (
                districtData[0] ||
                null
              );
            }

            const updated =
              districtData.find(
                (item) =>
                  normalizeState(
                    item.state
                  ) ===
                    normalizeState(
                      current.state
                    ) &&
                  normalizeDistrict(
                    item.district
                  ) ===
                    normalizeDistrict(
                      current.district
                    )
              );

            return (
              updated ||
              districtData[0] ||
              null
            );
          }
        );

        console.log(
          "Districts received:",
          districtData.length
        );

        console.log(
          "Sikkim districts:",
          districtData.filter(
            (item) =>
              normalizeState(
                item.state
              ) === "SIKKIM"
          )
        );
      } catch (err) {
        console.error(
          "District API error:",
          err
        );

        setError(
          "Unable to load district risk data from the server."
        );
      }
    };

  // ==================================================
  // FETCH ROADS
  // ==================================================

  const fetchRoads =
    async () => {
      try {
        const response =
          await axios.get(
            `${API_BASE}/api/roads`,
            {
              timeout: 30000,
            }
          );

        setRoads(
          response.data || []
        );
      } catch (err) {
        console.error(
          "Road API error:",
          err
        );

        setRoads([]);
      }
    };

  // ==================================================
  // INITIAL LOAD
  // ==================================================

  useEffect(() => {
    const loadData =
      async () => {
        setLoading(true);

        await Promise.all([
          fetchDistrictRisk(),
          fetchRoads(),
        ]);

        setLoading(false);
      };

    loadData();
  }, []);

  // ==================================================
  // REFRESH
  // ==================================================

  const handleRefresh =
    async () => {
      setRefreshing(true);

      await Promise.all([
        fetchDistrictRisk(),
        fetchRoads(),
      ]);

      setRefreshing(false);
    };

  // ==================================================
  // FIND DISTRICT
  // ==================================================

  const getDistrictData =
    (
      state: string,
      district: string
    ) => {

      const targetState =
        normalizeState(state);

      const targetDistrict =
        normalizeDistrict(
          district
        );

      // ==================================================
      // SIKKIM SPECIAL MAPPING
      //
      // GeoJSON:
      // East Sikkim -> Backend Pakyong
      // West Sikkim -> Backend Soreng
      // ==================================================

      if (
        targetState === "SIKKIM"
      ) {

        if (
          targetDistrict ===
            "EAST SIKKIM" ||
          targetDistrict ===
            "EAST DISTRICT" ||
          targetDistrict ===
            "EAST"
        ) {

          return districts.find(
            (item) =>
              normalizeState(
                item.state
              ) === "SIKKIM" &&
              normalizeDistrict(
                item.district
              ) === "PAKYONG"
          );

        }

        if (
          targetDistrict ===
            "WEST SIKKIM" ||
          targetDistrict ===
            "WEST DISTRICT" ||
          targetDistrict ===
            "WEST"
        ) {

          return districts.find(
            (item) =>
              normalizeState(
                item.state
              ) === "SIKKIM" &&
              normalizeDistrict(
                item.district
              ) === "SORENG"
          );

        }
      }

      // ==================================================
      // NORMAL MATCHING
      // ==================================================

      return districts.find(
        (item) =>
          normalizeState(
            item.state
          ) === targetState &&
          normalizeDistrict(
            item.district
          ) === targetDistrict
      );
    };

  // ==================================================
  // STATISTICS
  // ==================================================

  const lowCount =
    districts.filter(
      (d) =>
        d.risk_level?.toUpperCase() ===
        "LOW"
    ).length;

  const mediumCount =
    districts.filter(
      (d) =>
        [
          "MEDIUM",
          "MODERATE",
        ].includes(
          d.risk_level?.toUpperCase()
        )
    ).length;

  const highCount =
    districts.filter(
      (d) =>
        [
          "HIGH",
          "CRITICAL",
        ].includes(
          d.risk_level?.toUpperCase()
        )
    ).length;

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <div className="risk-map-page">

        <div className="risk-map-header">

          <div>

            <p className="map-label">
              LANDSLIDE MONITORING
            </p>

            <h1>
              Interactive Risk Map
            </h1>

            <p>
              Loading NER district risk data...
            </p>

          </div>

        </div>

      </div>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <div className="risk-map-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="risk-map-header">

        <div>

          <p className="map-label">
            LANDSLIDE MONITORING
          </p>

          <h1>
            Interactive Risk Map
          </h1>

          <button
            className="back-dashboard-button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            ← Back to Dashboard
          </button>

          <p>
            District-level AI-powered
            landslide risk monitoring
            across the eight North Eastern
            Region states.
          </p>

        </div>

        <div className="map-status">

          <span></span>

          AI Monitoring

          <small>
            {refreshing
              ? "Updating district data..."
              : `${districts.length} districts connected`}
          </small>

        </div>

        <button
          className="refresh-button"
          onClick={
            handleRefresh
          }
          disabled={
            refreshing
          }
        >
          {refreshing
            ? "Updating..."
            : "↻ Refresh Data"}
        </button>

      </div>

      {/* ==================================================
          MAIN LAYOUT
      ================================================== */}

      <div className="map-layout">

        {/* ==================================================
            LEFT PANEL
        ================================================== */}

        <aside className="map-panel">

          <h2>
            AI Risk Overview
          </h2>

          <p className="panel-description">
            Current district-level
            landslide risk generated by
            the Random Forest model using
            IMD rainfall and environmental
            features.
          </p>

          {/* ==================================================
              LEGEND
          ================================================== */}

          <div className="risk-legend">

            <div>

              <span
                className="legend-dot low"
              ></span>

              Low

            </div>

            <div>

              <span
                className="legend-dot moderate"
              ></span>

              Medium

            </div>

            <div>

              <span
                className="legend-dot high"
              ></span>

              High

            </div>

            <div>

              <span
                className="legend-dot"
                style={{
                  background:
                    "#94a3b8",
                }}
              ></span>

              No Data

            </div>

          </div>

          {/* ==================================================
              DISTRICT COUNT
          ================================================== */}

          <div className="location-count">

            <span>
              📍 NER Districts
            </span>

            <strong>
              {districts.length}
            </strong>

          </div>

          {/* LOW */}

          <div className="location-count">

            <span>
              🟢 Low Risk
            </span>

            <strong>
              {lowCount}
            </strong>

          </div>

          {/* MEDIUM */}

          <div className="location-count">

            <span>
              🟡 Medium Risk
            </span>

            <strong>
              {mediumCount}
            </strong>

          </div>

          {/* HIGH */}

          <div className="location-count">

            <span>
              🔴 High Risk
            </span>

            <strong>
              {highCount}
            </strong>

          </div>

          {/* ROADS */}

          <div className="location-count">

            <span>
              🛣️ Monitored Roads
            </span>

            <strong>
              {roads.length}
            </strong>

          </div>

          {/* ERROR */}

          {error && (
            <div className="map-error">
              ⚠️ {error}
            </div>
          )}

          {/* ==================================================
              SELECTED DISTRICT
          ================================================== */}

          <div className="selected-location">

            <span className="location-tag">
              AI MONITORED DISTRICT
            </span>

            <h3>
              {selectedDistrict
                ? selectedDistrict.district
                : "Select a district"}
            </h3>

            {selectedDistrict && (
              <>

                {/* STATE */}

                <div className="location-factor">

                  <span>
                    🗺️ State
                  </span>

                  <strong>
                    {
                      selectedDistrict.state
                    }
                  </strong>

                </div>

                {/* RISK */}

                <div
                  className={`risk-score-large ${selectedDistrict.risk_level.toLowerCase()}`}
                >

                  <strong>
                    {
                      selectedDistrict.risk_probability
                    }%
                  </strong>

                  <span>
                    {
                      selectedDistrict.risk_level.toUpperCase()
                    }{" "}
                    RISK
                  </span>

                </div>

                {/* DATE */}

                <div className="location-factor">

                  <span>
                    📅 Data Date
                  </span>

                  <strong>
                    {
                      selectedDistrict.date
                    }
                  </strong>

                </div>

                {/* RAINFALL 1 DAY */}

                <div className="location-factor">

                  <span>
                    🌧️ Rainfall 1 Day
                  </span>

                  <strong>
                    {
                      selectedDistrict.rainfall_1d_mm
                    }{" "}
                    mm
                  </strong>

                </div>

                {/* RAINFALL 3 DAYS */}

                <div className="location-factor">

                  <span>
                    🌧️ Rainfall 3 Days
                  </span>

                  <strong>
                    {
                      selectedDistrict.rainfall_3d_mm
                    }{" "}
                    mm
                  </strong>

                </div>

                {/* RAINFALL 7 DAYS */}

                <div className="location-factor">

                  <span>
                    🌧️ Rainfall 7 Days
                  </span>

                  <strong>
                    {
                      selectedDistrict.rainfall_7d_mm
                    }{" "}
                    mm
                  </strong>

                </div>

                {/* RAINFALL 15 DAYS */}

                <div className="location-factor">

                  <span>
                    🌧️ Rainfall 15 Days
                  </span>

                  <strong>
                    {
                      selectedDistrict.rainfall_15d_mm
                    }{" "}
                    mm
                  </strong>

                </div>

                {/* SLOPE */}

                <div className="location-factor">

                  <span>
                    ⛰️ Slope
                  </span>

                  <strong>
                    {
                      selectedDistrict.slope.toFixed(
                        2
                      )
                    }°
                  </strong>

                </div>

                {/* SOIL MOISTURE */}

                <div className="location-factor">

                  <span>
                    💧 Soil Moisture
                  </span>

                  <strong>
                    {
                      selectedDistrict.soil_moisture.toFixed(
                        2
                      )
                    }%
                  </strong>

                </div>

                {/* ELEVATION */}

                <div className="location-factor">

                  <span>
                    🏔️ Elevation
                  </span>

                  <strong>
                    {
                      selectedDistrict.elevation.toFixed(
                        0
                      )
                    } m
                  </strong>

                </div>

                {/* TEMPERATURE */}

                <div className="location-factor">

                  <span>
                    🌡️ Temperature
                  </span>

                  <strong>
                    {
                      selectedDistrict.temperature.toFixed(
                        1
                      )
                    } °C
                  </strong>

                </div>

                {/* NDVI */}

                <div className="location-factor">

                  <span>
                    🛰️ NDVI
                  </span>

                  <strong>
                    {
                      selectedDistrict.ndvi.toFixed(
                        4
                      )
                    }
                  </strong>

                </div>

                {/* MODEL */}

                <div className="location-factor">

                  <span>
                    🤖 AI Model
                  </span>

                  <strong>
                    Random Forest
                  </strong>

                </div>

                {/* SOURCE */}

                <div className="location-factor">

                  <span>
                    🌧️ Rainfall Source
                  </span>

                  <strong>
                    IMD
                  </strong>

                </div>

              </>
            )}

            {/* ==================================================
                ANALYZE DISTRICT
            ================================================== */}

            <button
              className="analysis-button"
              onClick={() => {

                if (!selectedDistrict) {

                  alert(
                    "Please select a district on the map first."
                  );

                  return;
                }

                navigate(
                  `/scenario?location=${encodeURIComponent(
                    selectedDistrict.district
                  )}&baselineRisk=${
                    selectedDistrict.risk_probability
                  }&rainfall=${
                    selectedDistrict.rainfall_1d_mm
                  }&soilMoisture=${
                    selectedDistrict.soil_moisture
                  }&slope=${
                    selectedDistrict.slope
                  }&elevation=${
                    selectedDistrict.elevation
                  }&temperature=${
                    selectedDistrict.temperature
                  }`
                );

              }}
            >
              Analyze District →
            </button>

          </div>

        </aside>

        {/* ==================================================
            MAP
        ================================================== */}

        <div className="map-wrapper">

          <MapContainer
            center={[
              27.5,
              93.5,
            ]}
            zoom={6}
            scrollWheelZoom={true}
            className="leaflet-map"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LayersControl
              position="topright"
            >

              {/* ==================================================
                  DISTRICT RISK
              ================================================== */}

              <LayersControl.Overlay
                checked
                name="District Landslide Risk"
              >

                <LayerGroup>

                  {nerGeoJson.features.map(
                    (
                      feature: any,
                      index: number
                    ) => {

                      const districtName =
                        feature.properties?.district ||
                        feature.properties?.DISTRICT ||
                        feature.properties?.District ||
                        "";

                      const stateName =
                        feature.properties?.st_nm ||
                        feature.properties?.STATE ||
                        feature.properties?.state ||
                        "";

                      const districtData =
                        getDistrictData(
                          stateName,
                          districtName
                        );

                      const hasData =
                        !!districtData;

                      const riskLevel =
                        districtData?.risk_level ||
                        "UNAVAILABLE";

                      const riskColor =
                        getRiskColor(
                          riskLevel
                        );

                      const center =
                        getDistrictCenter(
                          feature
                        );

                      return (
                        <div
                          key={`${stateName}-${districtName}-${index}`}
                        >

                          {/* ==================================================
                              DISTRICT POLYGON
                          ================================================== */}

                          <GeoJSON
                            data={feature}

                            style={() => ({
                              color:
                                "#1e293b",

                              weight:
                                hasData
                                  ? 1.5
                                  : 1,

                              fillColor:
                                riskColor,

                              fillOpacity:
                                hasData
                                  ? 0.58
                                  : 0.12,
                            })}

                            eventHandlers={{
                              click: () => {

                                if (
                                  districtData
                                ) {

                                  setSelectedDistrict(
                                    districtData
                                  );

                                }

                              },

                              mouseover: (
                                event
                              ) => {

                                event.target.setStyle({
                                  weight: 3,

                                  fillOpacity:
                                    hasData
                                      ? 0.8
                                      : 0.25,
                                });

                              },

                              mouseout: (
                                event
                              ) => {

                                event.target.setStyle({
                                  weight:
                                    hasData
                                      ? 1.5
                                      : 1,

                                  fillOpacity:
                                    hasData
                                      ? 0.58
                                      : 0.12,
                                });

                              },
                            }}
                          />

                          {/* ==================================================
                              DISTRICT POINT
                          ================================================== */}

                          {districtData &&
                            center && (

                              <Marker
                                position={
                                  center
                                }

                                icon={
                                  createRiskIcon(
                                    districtData.risk_level
                                  )
                                }

                                eventHandlers={{
                                  click: () =>
                                    setSelectedDistrict(
                                      districtData
                                    ),
                                }}
                              >

                                <Tooltip
                                  direction="top"
                                  offset={[
                                    0,
                                    -10,
                                  ]}
                                >

                                  <strong>
                                    {
                                      districtName
                                    }
                                  </strong>

                                  <br />

                                  {
                                    districtData.risk_level
                                  }

                                  {" — "}

                                  {
                                    districtData.risk_probability
                                  }%

                                </Tooltip>

                                <Popup>

                                  <strong>
                                    {
                                      districtName
                                    }
                                  </strong>

                                  <br />

                                  State:
                                  {" "}
                                  {
                                    stateName
                                  }

                                  <br />

                                  Risk:
                                  {" "}
                                  <strong>
                                    {
                                      districtData.risk_level
                                    }
                                  </strong>

                                  <br />

                                  Probability:
                                  {" "}
                                  {
                                    districtData.risk_probability
                                  }%

                                  <br />

                                  1-Day Rainfall:
                                  {" "}
                                  {
                                    districtData.rainfall_1d_mm
                                  }{" "}
                                  mm

                                  <br />

                                  3-Day Rainfall:
                                  {" "}
                                  {
                                    districtData.rainfall_3d_mm
                                  }{" "}
                                  mm

                                  <br />

                                  7-Day Rainfall:
                                  {" "}
                                  {
                                    districtData.rainfall_7d_mm
                                  }{" "}
                                  mm

                                  <br />

                                  15-Day Rainfall:
                                  {" "}
                                  {
                                    districtData.rainfall_15d_mm
                                  }{" "}
                                  mm

                                  <br />

                                  Slope:
                                  {" "}
                                  {
                                    districtData.slope.toFixed(
                                      2
                                    )
                                  }°

                                  <br />

                                  Soil Moisture:
                                  {" "}
                                  {
                                    districtData.soil_moisture.toFixed(
                                      2
                                    )
                                  }%

                                  <br />

                                  Elevation:
                                  {" "}
                                  {
                                    districtData.elevation.toFixed(
                                      0
                                    )
                                  }{" "}
                                  m

                                  <br />

                                  Temperature:
                                  {" "}
                                  {
                                    districtData.temperature.toFixed(
                                      1
                                    )
                                  }{" "}
                                  °C

                                  <br />

                                  NDVI:
                                  {" "}
                                  {
                                    districtData.ndvi.toFixed(
                                      4
                                    )
                                  }

                                  <br />

                                  <small>
                                    🤖 Random Forest
                                    + IMD Rainfall
                                  </small>

                                </Popup>

                              </Marker>

                            )}

                        </div>
                      );
                    }
                  )}

                </LayerGroup>

              </LayersControl.Overlay>

              {/* ==================================================
                  ROAD CONNECTIVITY
              ================================================== */}

              <LayersControl.Overlay
                checked
                name="Road Connectivity"
              >

                <LayerGroup>

                  {roads.map(
                    (road) => {

                      const roadColor =
                        getRiskColor(
                          road.risk_level
                        );

                      return (

                        <Polyline
                          key={`road-${road.id}`}
                          positions={
                            road.coordinates
                          }

                          pathOptions={{
                            color:
                              roadColor,

                            weight: 6,

                            opacity: 0.85,
                          }}
                        >

                          <Popup>

                            <strong>
                              🛣️{" "}
                              {road.name}
                            </strong>

                            <br />

                            Road Status:
                            {" "}
                            <strong>
                              {road.status}
                            </strong>

                            <br />

                            Risk Level:
                            {" "}
                            <strong>
                              {road.risk_level}
                            </strong>

                          </Popup>

                        </Polyline>

                      );
                    }
                  )}

                </LayerGroup>

              </LayersControl.Overlay>

              {/* ==================================================
                  DISTRICT BOUNDARIES
              ================================================== */}

              <LayersControl.Overlay
                checked
                name="District Boundaries"
              >

                <GeoJSON
                  data={
                    nerGeoJson as any
                  }

                  style={() => ({
                    color:
                      "#0f172a",

                    weight: 1,

                    fillOpacity: 0,
                  })}

                  onEachFeature={(
                    feature,
                    layer
                  ) => {

                    const district =
                      feature.properties?.district ||
                      "Unknown District";

                    const state =
                      feature.properties?.st_nm ||
                      "Northeastern State";

                    layer.bindTooltip(
                      `${district}, ${state}`
                    );

                  }}
                />

              </LayersControl.Overlay>

            </LayersControl>

          </MapContainer>

          {/* ==================================================
              MAP INFO
          ================================================== */}

          <div className="map-info">

            <strong>
              🗺️ District-Level AI Risk Map
            </strong>

            <span>

              🟢 Low &nbsp;&nbsp;

              🟡 Medium &nbsp;&nbsp;

              🔴 High &nbsp;&nbsp;

              ⚪ No Data

              <br />

              Click a district point or
              district boundary to view
              its latest risk assessment.

            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default RiskMap;