import { useNavigate } from "react-router-dom";
import "./InfrastructureRisk.css";

interface InfrastructureItem {
  id: number;
  name: string;
  type: string;
  location: string;
  riskLevel: string;
  riskScore: number;
  status: string;
}

const infrastructureData: InfrastructureItem[] = [
  {
    id: 1,
    name: "Manali Highway",
    type: "Highway",
    location: "Manali",
    riskLevel: "Critical",
    riskScore: 94,
    status: "Immediate Attention",
  },
  {
    id: 2,
    name: "Shimla Mountain Road",
    type: "Road",
    location: "Shimla",
    riskLevel: "High",
    riskScore: 82,
    status: "Monitoring",
  },
  {
    id: 3,
    name: "Dharamshala Road Network",
    type: "Road",
    location: "Dharamshala",
    riskLevel: "High",
    riskScore: 76,
    status: "Monitoring",
  },
  {
    id: 4,
    name: "Dehradun Bridge",
    type: "Bridge",
    location: "Dehradun",
    riskLevel: "Moderate",
    riskScore: 58,
    status: "Normal",
  },
];

function InfrastructureRisk() {
  const navigate = useNavigate();

  const getRiskClass = (level: string) => {
    return level.toLowerCase();
  };

  return (
    <div className="infrastructure-page">
      <header className="infrastructure-header">
        <div>
          <div className="infrastructure-label">
            INFRASTRUCTURE MONITORING
          </div>

          <h1>Infrastructure Risk</h1>

          <p>
            AI-based assessment of infrastructure exposed to
            landslide hazards.
          </p>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </header>

      <section className="infrastructure-summary">
        <div className="infra-stat">
          <strong>{infrastructureData.length}</strong>
          <span>Monitored Assets</span>
        </div>

        <div className="infra-stat critical">
          <strong>
            {
              infrastructureData.filter(
                (item) => item.riskLevel === "Critical"
              ).length
            }
          </strong>
          <span>Critical Risk</span>
        </div>

        <div className="infra-stat high">
          <strong>
            {
              infrastructureData.filter(
                (item) => item.riskLevel === "High"
              ).length
            }
          </strong>
          <span>High Risk</span>
        </div>

        <div className="infra-stat safe">
          <strong>
            {
              infrastructureData.filter(
                (item) => item.riskLevel === "Moderate"
              ).length
            }
          </strong>
          <span>Moderate Risk</span>
        </div>
      </section>

      <section className="infrastructure-card">
        <div className="infrastructure-card-header">
          <div>
            <h2>Infrastructure Exposure</h2>
            <p>
              Assets ranked according to current landslide risk.
            </p>
          </div>

          <span className="monitoring-badge">
            ● Live Monitoring
          </span>
        </div>

        <div className="infrastructure-list">
          {infrastructureData.map((item) => (
            <div
              className={`infrastructure-row ${getRiskClass(
                item.riskLevel
              )}`}
              key={item.id}
            >
              <div className="infra-main">
                <h3>{item.name}</h3>

                <div className="infra-details">
                  <span>{item.type}</span>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="infra-score">
                <strong>{item.riskScore}</strong>
                <span>/ 100</span>
              </div>

              <div
                className={`infra-risk ${getRiskClass(
                  item.riskLevel
                )}`}
              >
                {item.riskLevel}
              </div>

              <div
                className={`infra-status ${item.status
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="infrastructure-note">
        <strong>AI Risk Assessment:</strong> Risk scores are based on
        environmental conditions such as rainfall, soil moisture,
        slope and elevation. Current infrastructure information is
        prototype/demo data.
      </div>
    </div>
  );
}

export default InfrastructureRisk;