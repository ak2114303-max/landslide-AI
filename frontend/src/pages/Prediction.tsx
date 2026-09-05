
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Prediction.css";

interface PredictionResult {
  risk_score: number;
  risk_level: string;
}

function Prediction() {
  const navigate = useNavigate();

  const [rainfall, setRainfall] = useState("");
  const [soilMoisture, setSoilMoisture] = useState("");
  const [slope, setSlope] = useState("");
  const [elevation, setElevation] = useState("");
  const [temperature, setTemperature] = useState("");

  const [result, setResult] =
    useState<PredictionResult | null>(null);

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setRainfall("");
    setSoilMoisture("");
    setSlope("");
    setElevation("");
    setTemperature("");
    setResult(null);
  };

  const predictRisk = async () => {
    if (
      !rainfall ||
      !soilMoisture ||
      !slope ||
      !elevation ||
      !temperature
    ) {
      alert("Please enter all environmental values.");
      return;
    }

    setLoading(true);
    setResult(null);

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
      console.error("Prediction error:", error);
      alert("Unable to connect to the AI prediction server.");
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = (riskLevel: string) => {
    if (riskLevel === "Critical") {
      return "⚠️ Immediate monitoring and preventive action are recommended.";
    }

    if (riskLevel === "High") {
      return "⚠️ Close monitoring is recommended due to elevated landslide risk.";
    }

    if (riskLevel === "Moderate") {
      return "🟡 Continue regular monitoring of environmental conditions.";
    }

    return "🟢 Current conditions appear relatively stable.";
  };

  /* AI explanation */

  const getRiskFactors = () => {
    const factors: {
      name: string;
      value: string;
      impact: string;
      description: string;
      level: string;
    }[] = [];

    const rainfallValue = Number(rainfall);
    const moistureValue = Number(soilMoisture);
    const slopeValue = Number(slope);
    const elevationValue = Number(elevation);

    if (rainfallValue >= 200) {
      factors.push({
        name: "Rainfall",
        value: `${rainfallValue} mm`,
        impact: "High Impact",
        description:
          "Heavy rainfall can increase soil saturation and slope instability.",
        level: "high",
      });
    } else if (rainfallValue >= 100) {
      factors.push({
        name: "Rainfall",
        value: `${rainfallValue} mm`,
        impact: "Moderate Impact",
        description:
          "Moderate rainfall may increase soil moisture and landslide susceptibility.",
        level: "moderate",
      });
    } else {
      factors.push({
        name: "Rainfall",
        value: `${rainfallValue} mm`,
        impact: "Low Impact",
        description:
          "Lower rainfall generally reduces rainfall-related slope instability.",
        level: "low",
      });
    }

    if (moistureValue >= 80) {
      factors.push({
        name: "Soil Moisture",
        value: `${moistureValue}%`,
        impact: "High Impact",
        description:
          "Highly saturated soil can reduce slope stability.",
        level: "high",
      });
    } else if (moistureValue >= 60) {
      factors.push({
        name: "Soil Moisture",
        value: `${moistureValue}%`,
        impact: "Moderate Impact",
        description:
          "Moderate soil moisture indicates increased water content in the ground.",
        level: "moderate",
      });
    } else {
      factors.push({
        name: "Soil Moisture",
        value: `${moistureValue}%`,
        impact: "Low Impact",
        description:
          "Lower soil moisture generally indicates better ground stability.",
        level: "low",
      });
    }

    if (slopeValue >= 40) {
      factors.push({
        name: "Slope",
        value: `${slopeValue}°`,
        impact: "High Impact",
        description:
          "Steep slopes are generally more susceptible to gravitational failure.",
        level: "high",
      });
    } else if (slopeValue >= 25) {
      factors.push({
        name: "Slope",
        value: `${slopeValue}°`,
        impact: "Moderate Impact",
        description:
          "Moderately steep terrain can contribute to slope instability.",
        level: "moderate",
      });
    } else {
      factors.push({
        name: "Slope",
        value: `${slopeValue}°`,
        impact: "Low Impact",
        description:
          "Gentler slopes generally have lower gravitational instability.",
        level: "low",
      });
    }

    if (elevationValue >= 2000) {
      factors.push({
        name: "Elevation",
        value: `${elevationValue} m`,
        impact: "Moderate Impact",
        description:
          "High-elevation mountainous terrain can experience challenging environmental conditions.",
        level: "moderate",
      });
    } else {
      factors.push({
        name: "Elevation",
        value: `${elevationValue} m`,
        impact: "Low Impact",
        description:
          "The entered elevation has a relatively lower contribution in this prototype.",
        level: "low",
      });
    }

    return factors;
  };

  return (
    <div className="prediction-page">

      {/* Header */}

      <div className="prediction-header">
        <button
          type="button"
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <p>AI RISK PREDICTION</p>

        <h1>Landslide Risk Prediction</h1>

        <span>
          Enter environmental conditions to estimate landslide risk.
        </span>
      </div>

      {/* Input Card */}

      <div className="prediction-card">

        <div className="input-group">
          <label>Rainfall (mm)</label>
          <input
            type="number"
            min="0"
            max="1000"
            value={rainfall}
            onChange={(e) => setRainfall(e.target.value)}
            placeholder="Example: 240"
          />
        </div>

        <div className="input-group">
          <label>Soil Moisture (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={soilMoisture}
            onChange={(e) => setSoilMoisture(e.target.value)}
            placeholder="Example: 86"
          />
        </div>

        <div className="input-group">
          <label>Slope (degrees)</label>
          <input
            type="number"
            min="0"
            max="90"
            value={slope}
            onChange={(e) => setSlope(e.target.value)}
            placeholder="Example: 45"
          />
        </div>

        <div className="input-group">
          <label>Elevation (m)</label>
          <input
            type="number"
            min="0"
            max="9000"
            value={elevation}
            onChange={(e) => setElevation(e.target.value)}
            placeholder="Example: 2050"
          />
        </div>

        <div className="input-group">
          <label>Temperature (°C)</label>
          <input
            type="number"
            min="-50"
            max="60"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            placeholder="Example: 15"
          />
        </div>

        <button
          onClick={predictRisk}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Predict Landslide Risk"}
        </button>

        <button
          type="button"
          className="reset-button"
          onClick={resetForm}
          disabled={loading}
        >
          Reset
        </button>
      </div>

      {/* Prediction Result */}

      {result && (
        <div
          className={`prediction-result ${result.risk_level.toLowerCase()}`}
        >

          <p>AI Prediction Result</p>

          {/* Risk Meter */}

          <div className="risk-meter">
            <div
              className="risk-meter-fill"
              style={{
                width: `${Math.min(
                  Math.max(result.risk_score, 0),
                  100
                )}%`,
              }}
            ></div>
          </div>

          <h2>{result.risk_score}%</h2>

          <h3>{result.risk_level} Risk</h3>

          <span>
            The AI model has analyzed the environmental conditions
            and estimated the current landslide risk.
          </span>

          {/* Recommendation */}

          <div className="risk-recommendation">
            <h4>Recommendation</h4>

            <p>
              {getRecommendation(result.risk_level)}
            </p>
          </div>

          {/* Explainable AI */}

          <div className="ai-explanation">

            <div className="explanation-header">
              <div>
                <p>AI EXPLANATION</p>
                <h4>Why is this risk predicted?</h4>
              </div>

              <span>Explainable AI</span>
            </div>

            <p className="explanation-intro">
              The prediction is influenced by the environmental
              conditions entered above. Higher rainfall, soil moisture,
              and slope can increase landslide susceptibility.
            </p>

            <div className="risk-factor-list">
              {getRiskFactors().map((factor) => (
                <div
                  className={`risk-factor ${factor.level}`}
                  key={factor.name}
                >
                  <div className="factor-top">
                    <strong>{factor.name}</strong>

                    <span>{factor.value}</span>
                  </div>

                  <div className="factor-impact">
                    {factor.impact}
                  </div>

                  <p>{factor.description}</p>
                </div>
              ))}
            </div>

          </div>

          {/* Environmental Factors */}

          <div className="prediction-factors">

            <h4>Environmental Conditions</h4>

            <div className="factor-grid">

              <div>
                <span>🌧️ Rainfall</span>
                <strong>{rainfall} mm</strong>
              </div>

              <div>
                <span>💧 Soil Moisture</span>
                <strong>{soilMoisture}%</strong>
              </div>

              <div>
                <span>⛰️ Slope</span>
                <strong>{slope}°</strong>
              </div>

              <div>
                <span>🏔️ Elevation</span>
                <strong>{elevation} m</strong>
              </div>

              <div>
                <span>🌡️ Temperature</span>
                <strong>{temperature}°C</strong>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Prediction;
