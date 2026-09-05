
import {
  MapContainer,
  TileLayer,
  Circle,
  Popup,
  Marker,
  Tooltip,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "./RiskMap.css";

interface LocationData {
  location: string;
  latitude: number;
  longitude: number;
  risk_score: number;
  risk_level: string;
  rainfall_mm: number;
  soil_moisture: number;
  slope_degree: number;
  elevation_m: number;
  temperature_c: number;
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case "Low":
      return "#4caf50";
    case "Moderate":
      return "#e0b43c";
    case "High":
      return "#e67e22";
    case "Critical":
      return "#d64545";
    default:
      return "#e0b43c";
  }
};

const createRiskIcon = (riskLevel: string) => {
  const color = getRiskColor(riskLevel);

  return L.divIcon({
    className: "custom-risk-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function RiskMap() {
  const navigate = useNavigate();

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<LocationData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLocations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/locations"
      );

      setLocations(response.data);

      if (response.data.length > 0) {
        setSelectedLocation(response.data[0]);
      }
    } catch (error) {
      console.error("Location API error:", error);
      setError("Unable to load location data from the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return (
    <div className="risk-map-page">

      {/* Header */}
      <div className="risk-map-header">
        <div>
          <p className="map-label">LANDSLIDE MONITORING</p>

          <h1>Interactive Risk Map</h1>

          <button
            className="back-dashboard-button"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <p>
            Explore landslide risk zones and monitored locations
            across mountainous regions.
          </p>
        </div>

        <div className="map-status">
          <span></span>
          Live Monitoring

          <small>
            {loading ? "Updating..." : "Updated just now"}
          </small>
        </div>

        <button
          className="refresh-button"
          onClick={fetchLocations}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh Data"}
        </button>
      </div>

      {/* Main Layout */}
      <div className="map-layout">

        {/* Left Panel */}
        <aside className="map-panel">

          <h2>Risk Overview</h2>

          <p className="panel-description">
            Current landslide risk assessment
          </p>

          {/* Risk Legend */}
          <div className="risk-legend">
            <div>
              <span className="legend-dot low"></span>
              Low
            </div>

            <div>
              <span className="legend-dot moderate"></span>
              Moderate
            </div>

            <div>
              <span className="legend-dot high"></span>
              High
            </div>

            <div>
              <span className="legend-dot critical"></span>
              Critical
            </div>
          </div>

          {/* Location Count */}
          <div className="location-count">
            <span>📍 Monitored Locations</span>
            <strong>{locations.length}</strong>
          </div>

          {/* Error */}
          {error && (
            <div className="map-error">
              ⚠️ {error}
            </div>
          )}

          {/* Selected Location */}
          <div className="selected-location">

            {loading && (
              <p className="loading-text">
                Loading locations...
              </p>
            )}

            <span className="location-tag">
              MONITORED LOCATION
            </span>

            <h3>
              {selectedLocation?.location || "Select a location"}
            </h3>

            {/* Risk Score */}
            <div
              className={`risk-score-large ${
                selectedLocation?.risk_level?.toLowerCase() || ""
              }`}
            >
              <strong>
                {selectedLocation
                  ? `${selectedLocation.risk_score}%`
                  : "--"}
              </strong>

              <span>
                {selectedLocation
                  ? `${selectedLocation.risk_level.toUpperCase()} RISK`
                  : "SELECT LOCATION"}
              </span>
            </div>

            {/* Environmental Factors */}
            {selectedLocation && (
              <>
                <div className="location-factor">
                  <span>📍 Location</span>
                  <strong>{selectedLocation.location}</strong>
                </div>

                <div className="location-factor">
                  <span>🌧️ Rainfall</span>
                  <strong>
                    {selectedLocation.rainfall_mm} mm
                  </strong>
                </div>

                <div className="location-factor">
                  <span>⛰️ Slope</span>
                  <strong>
                    {selectedLocation.slope_degree}°
                  </strong>
                </div>

                <div className="location-factor">
                  <span>💧 Soil Moisture</span>
                  <strong>
                    {selectedLocation.soil_moisture}%
                  </strong>
                </div>

                <div className="location-factor">
                  <span>🏔️ Elevation</span>
                  <strong>
                    {selectedLocation.elevation_m} m
                  </strong>
                </div>

                <div className="location-factor">
                  <span>🌡️ Temperature</span>
                  <strong>
                    {selectedLocation.temperature_c} °C
                  </strong>
                </div>
              </>
            )}

            {/* Analyze Location */}
            <button
              className="analysis-button"
              onClick={() => {
                if (!selectedLocation) {
                  alert("Please select a location on the map first.");
                  return;
                }

                navigate(
                  `/scenario?location=${encodeURIComponent(
                    selectedLocation.location
                  )}&baselineRisk=${
                    selectedLocation.risk_score
                  }&rainfall=${
                    selectedLocation.rainfall_mm
                  }&soilMoisture=${
                    selectedLocation.soil_moisture
                  }&slope=${
                    selectedLocation.slope_degree
                  }&elevation=${
                    selectedLocation.elevation_m
                  }&temperature=${
                    selectedLocation.temperature_c
                  }`
                );
              }}
            >
              Analyze Location →
            </button>

          </div>
        </aside>

        {/* Map */}
        <div className="map-wrapper">

          <MapContainer
            center={[31.8, 77.5]}
            zoom={7}
            scrollWheelZoom={true}
            className="leaflet-map"
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {locations.map((location) => {
              const circleColor = getRiskColor(
                location.risk_level
              );

              return (
                <Fragment key={location.location}>

                  {/* Risk Marker */}
                  <Marker
                    position={[
                      location.latitude,
                      location.longitude,
                    ]}
                    icon={createRiskIcon(
                      location.risk_level
                    )}
                    eventHandlers={{
                      click: () =>
                        setSelectedLocation(location),
                    }}
                  >
                    <Tooltip permanent direction="top">
                      <strong>
                        {location.location} —{" "}
                        {location.risk_score}%
                      </strong>
                    </Tooltip>
                  </Marker>

                  {/* Risk Circle */}
                  <Circle
                    center={[
                      location.latitude,
                      location.longitude,
                    ]}
                    radius={18000}
                    eventHandlers={{
                      click: () =>
                        setSelectedLocation(location),
                    }}
                    pathOptions={{
                      color: circleColor,
                      fillColor: circleColor,
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <strong>{location.location}</strong>

                      <br />

                      Risk Level: {location.risk_level}

                      <br />

                      Risk Score: {location.risk_score}%

                      <br />

                      Rainfall: {location.rainfall_mm} mm

                      <br />

                      Soil Moisture:{" "}
                      {location.soil_moisture}%

                      <br />

                      Slope: {location.slope_degree}°

                      <br />

                      Elevation: {location.elevation_m} m

                      <br />

                      Temperature:{" "}
                      {location.temperature_c} °C
                    </Popup>
                  </Circle>

                </Fragment>
              );
            })}

          </MapContainer>

          {/* Map Information */}
          <div className="map-info">
            <strong>⚠️ Prototype Map</strong>

            <span>
              Risk zones are currently based on simulated demo data.
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RiskMap;
