import { useMemo, useState } from "react";
import "./ExplainableAI.css";

type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

type Feature = {
  name: string;
  value: string;
  impact: "High" | "Medium" | "Low";
  explanation: string;
};

const DISTRICT_DATA: Record<
  string,
  {
    state: string;
    district: string;
    risk: RiskLevel;
    probability: number;
    rainfall1d: number;
    rainfall3d: number;
    rainfall7d: number;
    rainfall15d: number;
    slope: number;
    soilMoisture: number;
    elevation: number;
    temperature: number;
    ndvi: number;
  }
> = {
  "Upper Siang": {
    state: "Arunachal Pradesh",
    district: "Upper Siang",
    risk: "HIGH",
    probability: 99.5,
    rainfall1d: 4.9,
    rainfall3d: 48.2,
    rainfall7d: 136.2,
    rainfall15d: 216.3,
    slope: 37.71,
    soilMoisture: 0.517,
    elevation: 1840,
    temperature: 18.4,
    ndvi: 0.61,
  },

  "East Kameng": {
    state: "Arunachal Pradesh",
    district: "East Kameng",
    risk: "MEDIUM",
    probability: 75,
    rainfall1d: 12.4,
    rainfall3d: 63.8,
    rainfall7d: 162.1,
    rainfall15d: 191.7,
    slope: 28.6,
    soilMoisture: 0.49,
    elevation: 1450,
    temperature: 20.1,
    ndvi: 0.64,
  },

  "Pakyong": {
    state: "Sikkim",
    district: "Pakyong",
    risk: "MEDIUM",
    probability: 82,
    rainfall1d: 4.3,
    rainfall3d: 6.2,
    rainfall7d: 92.3,
    rainfall15d: 158.9,
    slope: 31.2,
    soilMoisture: 0.48,
    elevation: 1100,
    temperature: 19.2,
    ndvi: 0.68,
  },

  "Sore­ng": {
    state: "Sikkim",
    district: "Soreng",
    risk: "LOW",
    probability: 94.68,
    rainfall1d: 0,
    rainfall3d: 4,
    rainfall7d: 31,
    rainfall15d: 90.5,
    slope: 22.4,
    soilMoisture: 0.31,
    elevation: 1200,
    temperature: 20.3,
    ndvi: 0.71,
  },
};

function getRiskClass(risk: RiskLevel) {
  if (risk === "HIGH") return "high";
  if (risk === "MEDIUM") return "medium";
  return "low";
}

function ExplainableAI() {
  const [selectedDistrict, setSelectedDistrict] =
    useState("Upper Siang");

  const data =
    DISTRICT_DATA[selectedDistrict];

  const features: Feature[] = useMemo(() => {
    if (!data) return [];

    return [
      {
        name: "7-Day Rainfall",
        value: `${data.rainfall7d.toFixed(1)} mm`,
        impact:
          data.rainfall7d > 120
            ? "High"
            : data.rainfall7d > 70
            ? "Medium"
            : "Low",
        explanation:
          data.rainfall7d > 120
            ? "High accumulated rainfall increases soil saturation and landslide susceptibility."
            : data.rainfall7d > 70
            ? "Moderate accumulated rainfall contributes to increased slope moisture."
            : "Lower accumulated rainfall contributes less to the current risk.",
      },
      {
        name: "15-Day Rainfall",
        value: `${data.rainfall15d.toFixed(1)} mm`,
        impact:
          data.rainfall15d > 180
            ? "High"
            : data.rainfall15d > 100
            ? "Medium"
            : "Low",
        explanation:
          data.rainfall15d > 180
            ? "Longer-term rainfall accumulation can maintain high soil moisture."
            : data.rainfall15d > 100
            ? "Recent rainfall accumulation has a moderate influence on the risk."
            : "Longer-term rainfall accumulation is relatively low.",
      },
      {
        name: "Slope",
        value: `${data.slope.toFixed(2)}°`,
        impact:
          data.slope > 30
            ? "High"
            : data.slope > 20
            ? "Medium"
            : "Low",
        explanation:
          data.slope > 30
            ? "Steeper terrain generally has greater potential for slope instability."
            : data.slope > 20
            ? "Moderate terrain steepness contributes to slope susceptibility."
            : "Lower slope angle contributes less to instability.",
      },
      {
        name: "Soil Moisture",
        value: data.soilMoisture.toFixed(3),
        impact:
          data.soilMoisture > 0.5
            ? "High"
            : data.soilMoisture > 0.35
            ? "Medium"
            : "Low",
        explanation:
          data.soilMoisture > 0.5
            ? "Higher soil moisture can reduce effective soil strength."
            : data.soilMoisture > 0.35
            ? "Moderate soil moisture contributes to the current risk."
            : "Relatively low soil moisture reduces this risk factor.",
      },
      {
        name: "Elevation",
        value: `${data.elevation} m`,
        impact: "Medium",
        explanation:
          "Elevation is included as a terrain/environmental feature in the prototype model.",
      },
      {
        name: "Temperature",
        value: `${data.temperature.toFixed(1)} °C`,
        impact: "Low",
        explanation:
          "Temperature is included as an environmental feature in the prototype model.",
      },
      {
        name: "NDVI",
        value: data.ndvi.toFixed(2),
        impact: "Low",
        explanation:
          "Vegetation condition is included as an environmental feature in the prototype model.",
      },
    ];
  }, [data]);

  return (
    <div className="explainable-page">

      {/* Header */}
      <div className="explainable-header">
        <div>
          <h1>🧠 Explainable AI</h1>

          <p>
            Understand which environmental and terrain
            factors influence the current landslide-risk
            prediction.
          </p>
        </div>

        <div className="model-badge">
          🤖 Random Forest
        </div>
      </div>

      {/* District Selection */}
      <div className="explainable-card selection-card">

        <div>
          <h2>📍 Select District</h2>

          <p>
            Choose a monitored NER district to inspect
            the model explanation.
          </p>
        </div>

        <select
          value={selectedDistrict}
          onChange={(e) =>
            setSelectedDistrict(e.target.value)
          }
        >
          {Object.keys(DISTRICT_DATA).map(
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

      {/* Prediction Summary */}
      <div className="explainable-summary">

        <div className="summary-main">

          <span className="summary-label">
            Current Risk
          </span>

          <div
            className={`risk-value ${getRiskClass(
              data.risk
            )}`}
          >
            {data.risk}
          </div>

          <p>
            {data.district},{" "}
            {data.state}
          </p>

        </div>

        <div className="summary-stat">

          <span>Risk Probability</span>

          <strong>
            {data.probability.toFixed(1)}%
          </strong>

        </div>

        <div className="summary-stat">

          <span>7-Day Rainfall</span>

          <strong>
            {data.rainfall7d.toFixed(1)} mm
          </strong>

        </div>

        <div className="summary-stat">

          <span>Slope</span>

          <strong>
            {data.slope.toFixed(2)}°
          </strong>

        </div>

      </div>

      {/* Explanation */}
      <div className="explanation-section">

        <div className="section-heading">

          <h2>🔍 Risk Factors</h2>

          <p>
            These features are used by the prototype
            Random Forest model to generate the risk
            prediction.
          </p>

        </div>

        <div className="factor-grid">

          {features.map((feature) => (

            <div
              className="factor-card"
              key={feature.name}
            >

              <div className="factor-top">

                <h3>
                  {feature.name}
                </h3>

                <span
                  className={`impact-badge ${feature.impact.toLowerCase()}`}
                >
                  {feature.impact} Impact
                </span>

              </div>

              <div className="factor-value">
                {feature.value}
              </div>

              <p>
                {feature.explanation}
              </p>

            </div>

          ))}

        </div>

      </div>

      {/* Model Explanation */}
      <div className="explainable-card model-explanation">

        <h2>🤖 How the Model Works</h2>

        <div className="workflow">

          <div className="workflow-step">
            <span>1</span>
            <div>
              <strong>
                Environmental Data
              </strong>
              <p>
                Rainfall, soil moisture,
                temperature and NDVI are collected
                as model inputs.
              </p>
            </div>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <span>2</span>
            <div>
              <strong>
                Terrain Data
              </strong>
              <p>
                Elevation and slope provide
                terrain-related information.
              </p>
            </div>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <span>3</span>
            <div>
              <strong>
                Random Forest
              </strong>
              <p>
                The trained prototype model evaluates
                the feature combination.
              </p>
            </div>
          </div>

          <div className="workflow-arrow">
            →
          </div>

          <div className="workflow-step">
            <span>4</span>
            <div>
              <strong>
                Risk Output
              </strong>
              <p>
                The system returns Low, Medium or
                High risk with a probability.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Prototype Notice */}
      <div className="prototype-notice">

        <span>ℹ️</span>

        <div>

          <strong>
            Prototype Explanation
          </strong>

          <p>
            This explanation shows how the selected
            environmental and terrain features contribute
            to the prototype prediction. It should not be
            interpreted as a scientific causal analysis or
            as proof that an individual factor alone causes
            a landslide.
          </p>

        </div>

      </div>

    </div>
  );
}

export default ExplainableAI;