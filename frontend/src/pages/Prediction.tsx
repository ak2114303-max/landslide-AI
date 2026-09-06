import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Prediction.css";

interface PredictionResult {
  risk_score: number;
  risk_level: string;
  model_name: string;
  feature_importance: {
    rainfall_mm: number;
    soil_moisture: number;
    slope_degree: number;
    elevation_m: number;
    temperature_c: number;
  };
}

interface RiskFactor {
  name: string;
  value: string;
  importance: number;
  description: string;
}

function Prediction() {
  const navigate = useNavigate();

  // Input values
  const [rainfall, setRainfall] = useState("");
  const [soilMoisture, setSoilMoisture] = useState("");
  const [slope, setSlope] = useState("");
  const [elevation, setElevation] = useState("");
  const [temperature, setTemperature] = useState("");

  // Prediction result
  const [result, setResult] = useState<PredictionResult | null>(null);

  // Loading state
  const [loading, setLoading] = useState(false);

  // Reset form
  const resetForm = () => {
    setRainfall("");
    setSoilMoisture("");
    setSlope("");
    setElevation("");
    setTemperature("");
    setResult(null);
  };

  // Predict landslide risk
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

  // Recommendation based on risk level
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

  // Get risk color class
  const getRiskClass = (riskLevel: string) => {
    return riskLevel.toLowerCase();
  };

  // Convert feature importance into readable values
  const getRiskFactors = (): RiskFactor[] => {
    if (!result) {
      return [];
    }

    const importance = result.feature_importance;

    return [
      {
        name: "Rainfall",
        value: `${rainfall} mm`,
        importance: importance.rainfall_mm,
        description:
          "Rainfall can increase soil saturation and reduce slope stability.",
      },
      {
        name: "Soil Moisture",
        value: `${soilMoisture}%`,
        importance: importance.soil_moisture,
        description:
          "Higher soil moisture can increase saturation and landslide susceptibility.",
      },
      {
        name: "Slope",
        value: `${slope}°`,
        importance: importance.slope_degree,
        description:
          "Steeper slopes generally have greater gravitational instability.",
      },
      {
        name: "Elevation",
        value: `${elevation} m`,
        importance: importance.elevation_m,
        description:
          "Elevation represents the mountainous terrain conditions used by the model.",
      },
      {
        name: "Temperature",
        value: `${temperature}°C`,
        importance: importance.temperature_c,
        description:
          "Temperature is included as an environmental feature in the prediction model.",
      },
    ];
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
        <div className="prediction-card-header">
          <div>
            <p>ENVIRONMENTAL INPUTS</p>
            <h2>Enter Location Conditions</h2>
          </div>

          <span className="ai-badge">AI MODEL</span>
        </div>

        <div className="prediction-form">
          {/* Rainfall */}
          <div className="input-group">
            <label htmlFor="rainfall">
              Rainfall
              <span>mm</span>
            </label>

            <input
              id="rainfall"
              type="number"
              placeholder="e.g. 180"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
            />
          </div>

          {/* Soil Moisture */}
          <div className="input-group">
            <label htmlFor="soil-moisture">
              Soil Moisture
              <span>%</span>
            </label>

            <input
              id="soil-moisture"
              type="number"
              placeholder="e.g. 70"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(e.target.value)}
            />
          </div>

          {/* Slope */}
          <div className="input-group">
            <label htmlFor="slope">
              Slope
              <span>degrees</span>
            </label>

            <input
              id="slope"
              type="number"
              placeholder="e.g. 35"
              value={slope}
              onChange={(e) => setSlope(e.target.value)}
            />
          </div>

          {/* Elevation */}
          <div className="input-group">
            <label htmlFor="elevation">
              Elevation
              <span>meters</span>
            </label>

            <input
              id="elevation"
              type="number"
              placeholder="e.g. 2000"
              value={elevation}
              onChange={(e) => setElevation(e.target.value)}
            />
          </div>

          {/* Temperature */}
          <div className="input-group">
            <label htmlFor="temperature">
              Temperature
              <span>°C</span>
            </label>

            <input
              id="temperature"
              type="number"
              placeholder="e.g. 18"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="prediction-actions">
          <button
            type="button"
            className="predict-button"
            onClick={predictRisk}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Predict Landslide Risk →"}
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={resetForm}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Prediction Result */}
      {result && (
        <div
          className={`prediction-result ${getRiskClass(
            result.risk_level
          )}`}
        >
          {/* Result Header */}
          <div className="result-header">
            <div>
              <p>AI PREDICTION RESULT</p>

              <h2>Landslide Risk Assessment</h2>
            </div>

            <div className="risk-level-badge">
              {result.risk_level}
            </div>
          </div>

          {/* Risk Score */}
          <div className="risk-score-section">
            <div className="risk-score-value">
              {Number(result.risk_score).toFixed(1)}
            </div>

            <div className="risk-score-label">
              Risk Score
              <span>out of 100</span>
            </div>
          </div>

          {/* Risk Meter */}
          <div className="risk-meter">
            <div className="risk-meter-labels">
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Critical</span>
            </div>

            <div className="risk-meter-track">
              <div
                className="risk-meter-fill"
                style={{
                  width: `${Math.min(
                    Math.max(Number(result.risk_score), 0),
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="recommendation-box">
            <p>RECOMMENDATION</p>

            <h3>
              {getRecommendation(result.risk_level)}
            </h3>
          </div>

          {/* Environmental Conditions */}
          <div className="result-conditions">
            <div className="conditions-header">
              <p>ENVIRONMENTAL CONDITIONS</p>

              <h3>Input Values Used by AI</h3>
            </div>

            <div className="condition-grid">
              <div className="condition-item">
                <span>Rainfall</span>
                <strong>{rainfall} mm</strong>
              </div>

              <div className="condition-item">
                <span>Soil Moisture</span>
                <strong>{soilMoisture}%</strong>
              </div>

              <div className="condition-item">
                <span>Slope</span>
                <strong>{slope}°</strong>
              </div>

              <div className="condition-item">
                <span>Elevation</span>
                <strong>{elevation} m</strong>
              </div>

              <div className="condition-item">
                <span>Temperature</span>
                <strong>{temperature}°C</strong>
              </div>
            </div>
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
              The model uses five environmental features to estimate
landslide risk. The percentages below show the relative
importance of each feature in the trained {result.model_name} model.
            </p>

            <div className="risk-factor-list">
              {getRiskFactors()
                .sort((a, b) => b.importance - a.importance)
                .map((factor) => (
                  <div
                    className="risk-factor"
                    key={factor.name}
                  >
                    <div className="factor-top">
                      <strong>{factor.name}</strong>

                      <span>{factor.value}</span>
                    </div>

                    <div className="factor-impact">
                      Model Importance:{" "}
                      {(factor.importance * 100).toFixed(2)}%
                    </div>

                    <div className="importance-bar">
                      <div
                        className="importance-bar-fill"
                        style={{
                          width: `${Math.min(
                            factor.importance * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>

                    <p>{factor.description}</p>
                  </div>
                ))}
            </div>
          </div>

          {/* Result Actions */}
          <div className="result-actions">
            <button
              type="button"
              className="new-prediction-button"
              onClick={resetForm}
            >
              + New Prediction
            </button>

            <button
              type="button"
              className="dashboard-result-button"
              onClick={() => navigate("/dashboard")}
            >
              View Dashboard →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prediction;