import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Prediction.css";

const API_BASE = "https://landslide-ai-backend.onrender.com";

interface PredictionResult {
  risk_score: number;
  risk_level: string;
}

interface RiskFactor {
  name: string;
  value: string;
  description: string;
}

const playBuzzer = (riskLevel: string) => {
  const level = riskLevel.toUpperCase();

  if (level !== "HIGH" && level !== "CRITICAL") {
    return;
  }

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "sawtooth";

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (level === "CRITICAL") {
      oscillator.frequency.setValueAtTime(
        500,
        audioContext.currentTime
      );

      oscillator.frequency.linearRampToValueAtTime(
        1000,
        audioContext.currentTime + 0.4
      );

      oscillator.frequency.linearRampToValueAtTime(
        500,
        audioContext.currentTime + 0.8
      );

      gainNode.gain.value = 0.25;

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 1600);
    } else {
      oscillator.frequency.value = 700;
      gainNode.gain.value = 0.18;

      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 700);
    }
  } catch (error) {
    console.log("Audio unavailable:", error);
  }
};

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

  // --------------------------------
  // Reset
  // --------------------------------

  const resetForm = () => {
    setRainfall("");
    setSoilMoisture("");
    setSlope("");
    setElevation("");
    setTemperature("");
    setResult(null);
  };

  // --------------------------------
  // AI Prediction
  // --------------------------------

  const predictRisk = async () => {
    if (
      !rainfall ||
      !soilMoisture ||
      !slope ||
      !elevation ||
      !temperature
    ) {
      alert(
        "Please enter all environmental values."
      );
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const rainfallValue = Number(rainfall);

      const response = await axios.post(
        `${API_BASE}/api/predict`,
        {
          // Current ML model requires 4 rainfall features
          rainfall_1d_mm: rainfallValue,
          rainfall_3d_mm: rainfallValue,
          rainfall_7d_mm: rainfallValue,
          rainfall_15d_mm: rainfallValue,

          // Current ML model features
          elevation: Number(elevation),
          slope: Number(slope),

          // UI accepts percentage, model uses 0-1
          soil_moisture:
            Number(soilMoisture) / 100,

          temperature: Number(temperature),

          // Prototype default because UI
          // does not currently ask for NDVI
          ndvi: 0.5,
        }
      );

      const data = response.data;

      const riskScore = Number(
        data.risk_score ??
        data.risk_probability ??
        0
      );

      const riskLevel =
        data.risk_level || "LOW";

      const predictionResult = {
        risk_score: Number(
          Math.min(
            Math.max(riskScore, 0),
            100
          ).toFixed(2)
        ),
        risk_level: String(
          riskLevel
        ).toUpperCase(),
      };

      setResult(predictionResult);

      playBuzzer(
        predictionResult.risk_level
      );
    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      alert(
        "Unable to connect to the AI prediction server."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // Recommendation
  // --------------------------------

  const getRecommendation = (
    riskLevel: string
  ) => {
    const level =
      riskLevel.toUpperCase();

    if (level === "CRITICAL") {
      return "⚠️ Immediate monitoring and preventive action are recommended.";
    }

    if (level === "HIGH") {
      return "⚠️ Close monitoring is recommended due to elevated landslide risk.";
    }

    if (level === "MEDIUM") {
      return "🟡 Continue regular monitoring of environmental conditions.";
    }

    return "🟢 Current conditions appear relatively stable.";
  };

  // --------------------------------
  // Risk class
  // --------------------------------

  const getRiskClass = (
    riskLevel: string
  ) => {
    return riskLevel
      .toLowerCase();
  };

  // --------------------------------
  // Explainable AI
  // --------------------------------

  const getRiskFactors =
    (): RiskFactor[] => {
      return [
        {
          name: "Rainfall",
          value: `${rainfall} mm`,
          description:
            "Rainfall is an important factor because prolonged or intense rainfall can increase soil saturation and slope instability.",
        },
        {
          name: "Soil Moisture",
          value: `${soilMoisture}%`,
          description:
            "Higher soil moisture can indicate increased ground saturation and may contribute to slope instability.",
        },
        {
          name: "Slope",
          value: `${slope}°`,
          description:
            "Steeper terrain generally has greater gravitational susceptibility to landslide movement.",
        },
        {
          name: "Elevation",
          value: `${elevation} m`,
          description:
            "Elevation represents the terrain characteristics supplied to the machine-learning model.",
        },
        {
          name: "Temperature",
          value: `${temperature}°C`,
          description:
            "Temperature is included as an environmental input used by the prototype model.",
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
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <p>
          AI RISK PREDICTION
        </p>

        <h1>
          Landslide Risk Prediction
        </h1>

        <span>
          Enter environmental conditions
          to estimate landslide risk.
        </span>

      </div>

      {/* Input Card */}

      <div className="prediction-card">

        <div className="prediction-card-header">

          <div>
            <p>
              ENVIRONMENTAL INPUTS
            </p>

            <h2>
              Enter Location Conditions
            </h2>
          </div>

          <span className="ai-badge">
            AI MODEL
          </span>

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
              min="0"
              max="1000"
              placeholder="e.g. 180"
              value={rainfall}
              onChange={(e) =>
                setRainfall(
                  e.target.value
                )
              }
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
              min="0"
              max="100"
              placeholder="e.g. 70"
              value={soilMoisture}
              onChange={(e) =>
                setSoilMoisture(
                  e.target.value
                )
              }
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
              min="0"
              max="90"
              placeholder="e.g. 35"
              value={slope}
              onChange={(e) =>
                setSlope(
                  e.target.value
                )
              }
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
              min="0"
              max="9000"
              placeholder="e.g. 2000"
              value={elevation}
              onChange={(e) =>
                setElevation(
                  e.target.value
                )
              }
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
              min="-50"
              max="60"
              placeholder="e.g. 18"
              value={temperature}
              onChange={(e) =>
                setTemperature(
                  e.target.value
                )
              }
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
            {loading
              ? "Analyzing..."
              : "Predict Landslide Risk →"}
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

              <p>
                AI PREDICTION RESULT
              </p>

              <h2>
                Landslide Risk Assessment
              </h2>

            </div>

            <div className="risk-level-badge">
              {result.risk_level}
            </div>

          </div>

          {/* Risk Score */}

          <div className="risk-score-section">

            <div className="risk-score-value">
              {Number(
                result.risk_score
              ).toFixed(1)}
            </div>

            <div className="risk-score-label">
              Risk Score
              <span>
                out of 100
              </span>
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
                    Math.max(
                      Number(
                        result.risk_score
                      ),
                      0
                    ),
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

          {/* Recommendation */}

          <div className="recommendation-box">

            <p>
              RECOMMENDATION
            </p>

            <h3>
              {getRecommendation(
                result.risk_level
              )}
            </h3>

          </div>

          {/* Environmental Conditions */}

          <div className="result-conditions">

            <div className="conditions-header">

              <p>
                ENVIRONMENTAL CONDITIONS
              </p>

              <h3>
                Input Values Used by AI
              </h3>

            </div>

            <div className="condition-grid">

              <div className="condition-item">
                <span>Rainfall</span>
                <strong>
                  {rainfall} mm
                </strong>
              </div>

              <div className="condition-item">
                <span>
                  Soil Moisture
                </span>
                <strong>
                  {soilMoisture}%
                </strong>
              </div>

              <div className="condition-item">
                <span>Slope</span>
                <strong>
                  {slope}°
                </strong>
              </div>

              <div className="condition-item">
                <span>Elevation</span>
                <strong>
                  {elevation} m
                </strong>
              </div>

              <div className="condition-item">
                <span>
                  Temperature
                </span>
                <strong>
                  {temperature}°C
                </strong>
              </div>

            </div>

          </div>

          {/* Explainable AI */}

          <div className="ai-explanation">

            <div className="explanation-header">

              <div>

                <p>
                  AI EXPLANATION
                </p>

                <h4>
                  Why is this risk predicted?
                </h4>

              </div>

              <span>
                Explainable AI
              </span>

            </div>

            <p className="explanation-intro">
              The prediction uses rainfall,
              terrain and environmental
              conditions as inputs to the
              trained Random Forest model.
              The information below explains
              the role of each input used in
              this prediction.
            </p>

            <div className="risk-factor-list">

              {getRiskFactors().map(
                (factor) => (

                  <div
                    className="risk-factor"
                    key={factor.name}
                  >

                    <div className="factor-top">

                      <strong>
                        {factor.name}
                      </strong>

                      <span>
                        {factor.value}
                      </span>

                    </div>

                    <p>
                      {factor.description}
                    </p>

                  </div>

                )
              )}

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
              onClick={() =>
                navigate("/dashboard")
              }
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