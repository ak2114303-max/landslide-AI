
import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Scenario.css";

function Scenario() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const location = searchParams.get("location") || "Custom Location";

  // Original values of the selected location
  const originalRainfall =
    searchParams.get("rainfall") || "240";

  const originalSoilMoisture =
    searchParams.get("soilMoisture") || "86";

  const originalSlope =
    searchParams.get("slope") || "45";

  const originalElevation =
    searchParams.get("elevation") || "2050";

  const originalTemperature =
    searchParams.get("temperature") || "15";

  // Baseline risk of the selected location
  const baselineRisk = Number(
    searchParams.get("baselineRisk") || 0
  );

  const [rainfall, setRainfall] =
    useState(originalRainfall);

  const [soilMoisture, setSoilMoisture] =
    useState(originalSoilMoisture);

  const [slope, setSlope] =
    useState(originalSlope);

  const [elevation, setElevation] =
    useState(originalElevation);

  const [temperature, setTemperature] =
    useState(originalTemperature);

  const [result, setResult] = useState<{
    risk_score: number;
    risk_level: string;
  } | null>(null);

  const [loading, setLoading] =
    useState(false);

  const riskChange = result
    ? Number(
        (result.risk_score - baselineRisk).toFixed(2)
      )
    : 0;

  // Run AI scenario prediction
  const runScenario = async () => {
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/predict",
        {
          rainfall_mm: Number(rainfall),
          soil_moisture: Number(soilMoisture),
          slope_degree: Number(slope),
          elevation_m: Number(elevation),
          temperature_c: Number(temperature),
        }
      );

      setResult(response.data);
    } catch (error) {
      console.error(
        "Scenario prediction error:",
        error
      );

      alert(
        "Unable to connect to the AI prediction server."
      );
    }

    setLoading(false);
  };

  // Reset values to original location conditions
  const resetScenario = () => {
    setRainfall(originalRainfall);
    setSoilMoisture(originalSoilMoisture);
    setSlope(originalSlope);
    setElevation(originalElevation);
    setTemperature(originalTemperature);

    setResult(null);
  };

  return (
    <div className="scenario-page">

      {/* Header */}

      <div className="scenario-header">

        <p>WHAT-IF ANALYSIS</p>

        <h1>Scenario Analysis</h1>

        <span>
          Adjust environmental conditions and see
          how landslide risk changes.
        </span>

        <h3>
          📍 {location}
        </h3>

      </div>

      {/* Back Button */}

      <button
        className="scenario-back-button"
        onClick={() => navigate("/alerts")}
      >
        ← Back to Alerts
      </button>

      {/* Scenario Inputs */}

      <div className="scenario-card">

        <div className="scenario-input">

          <label>Rainfall (mm)</label>

          <input
            type="number"
            min="0"
            max="1000"
            value={rainfall}
            onChange={(e) =>
              setRainfall(e.target.value)
            }
          />

        </div>

        <div className="scenario-input">

          <label>Soil Moisture (%)</label>

          <input
            type="number"
            min="0"
            max="100"
            value={soilMoisture}
            onChange={(e) =>
              setSoilMoisture(e.target.value)
            }
          />

        </div>

        <div className="scenario-input">

          <label>Slope (degrees)</label>

          <input
            type="number"
            min="0"
            max="90"
            value={slope}
            onChange={(e) =>
              setSlope(e.target.value)
            }
          />

        </div>

        <div className="scenario-input">

          <label>Elevation (m)</label>

          <input
            type="number"
            min="0"
            max="9000"
            value={elevation}
            onChange={(e) =>
              setElevation(e.target.value)
            }
          />

        </div>

        <div className="scenario-input">

          <label>Temperature (°C)</label>

          <input
            type="number"
            min="-50"
            max="60"
            value={temperature}
            onChange={(e) =>
              setTemperature(e.target.value)
            }
          />

        </div>

        {/* Run + Reset Buttons */}

        <button
          onClick={runScenario}
          disabled={loading}
        >
          {loading
            ? "Analyzing Scenario..."
            : "Run Scenario Analysis"}
        </button>

        <button
          type="button"
          className="scenario-reset-button"
          onClick={resetScenario}
          disabled={loading}
        >
          ↺ Reset Scenario
        </button>

      </div>

      {/* Result */}

      {result && (

        <div
          className={`scenario-result ${result.risk_level.toLowerCase()}`}
        >

          <p>Scenario Result</p>

          <h2>
            {result.risk_score}%
          </h2>

          <h3>
            {result.risk_level} Risk
          </h3>

          {/* Baseline */}

          <p className="baseline-risk">
            Baseline Risk:{" "}
            <strong>
              {baselineRisk}%
            </strong>
          </p>

          {/* Risk Change */}

          <p
            className={`risk-change ${
              riskChange > 0
                ? "increase"
                : riskChange < 0
                ? "decrease"
                : "same"
            }`}
          >
            {riskChange > 0
              ? `Risk increased by ${riskChange} points ↑`
              : riskChange < 0
              ? `Risk decreased by ${Math.abs(
                  riskChange
                )} points ↓`
              : "Risk remained unchanged"}
          </p>

          <span>
            This risk estimate is based on the
            environmental conditions selected above.
          </span>

        </div>

      )}

    </div>
  );
}

export default Scenario;
