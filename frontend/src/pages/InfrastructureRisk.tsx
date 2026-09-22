import { useNavigate } from "react-router-dom";
import "./InfrastructureRisk.css";

interface InfrastructureItem {
  id: number;
  name: string;
  type: string;
  state: string;
  location: string;
  riskLevel: string;
  riskScore: number;
  status: string;
}

// NER-focused prototype infrastructure exposure data.
// These are demo/prototype asset records, not an official infrastructure inventory.
const infrastructureData: InfrastructureItem[] = [
  {
    id: 1,
    name: "Upper Siang Road Corridor",
    type: "Road",
    state: "Arunachal Pradesh",
    location: "Upper Siang",
    riskLevel: "Critical",
    riskScore: 99.5,
    status: "Immediate Attention",
  },
  {
    id: 2,
    name: "East Kameng Road Network",
    type: "Road",
    state: "Arunachal Pradesh",
    location: "East Kameng",
    riskLevel: "High",
    riskScore: 75,
    status: "Monitoring",
  },
  {
    id: 3,
    name: "Pakyong Transport Corridor",
    type: "Road",
    state: "Sikkim",
    location: "Pakyong",
    riskLevel: "High",
    riskScore: 82,
    status: "Monitoring",
  },
  {
    id: 4,
    name: "East Khasi Hills Road Network",
    type: "Road",
    state: "Meghalaya",
    location: "East Khasi Hills",
    riskLevel: "Moderate",
    riskScore: 64,
    status: "Monitoring",
  },
  {
    id: 5,
    name: "Kohima District Road Network",
    type: "Road",
    state: "Nagaland",
    location: "Kohima",
    riskLevel: "Moderate",
    riskScore: 61,
    status: "Monitoring",
  },
  {
    id: 6,
    name: "Aizawl Hill Road Corridor",
    type: "Road",
    state: "Mizoram",
    location: "Aizawl",
    riskLevel: "High",
    riskScore: 79,
    status: "Monitoring",
  },
  {
    id: 7,
    name: "Imphal West Road Network",
    type: "Road",
    state: "Manipur",
    location: "Imphal West",
    riskLevel: "Moderate",
    riskScore: 57,
    status: "Normal",
  },
  {
    id: 8,
    name: "West Tripura Transport Corridor",
    type: "Road",
    state: "Tripura",
    location: "West Tripura",
    riskLevel: "Moderate",
    riskScore: 55,
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

      {/* ================= HEADER ================= */}

      <header className="infrastructure-header">

        <div>

          <div className="infrastructure-label">
            NORTH EASTERN REGION
          </div>

          <h1>
            Infrastructure Risk
          </h1>

          <p>
            AI-based assessment of infrastructure
            exposed to landslide hazards across
            NER districts.
          </p>

        </div>

        <button
          className="back-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* ================= PROTOTYPE NOTICE ================= */}

      <div
        style={{
          background: "#fff8e7",
          border: "1px solid #f0d98a",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "18px",
          fontSize: "13px",
          color: "#765b00",
        }}
      >
        <strong>
          Prototype Infrastructure Data:
        </strong>{" "}
        Infrastructure assets shown here are
        demonstration records for the
        LandslideAI prototype and are not an
        official government infrastructure inventory.
      </div>

      {/* ================= SUMMARY ================= */}

      <section className="infrastructure-summary">

        <div className="infra-stat">

          <strong>
            {infrastructureData.length}
          </strong>

          <span>
            Monitored Assets
          </span>

        </div>

        <div className="infra-stat critical">

          <strong>
            {
              infrastructureData.filter(
                (item) =>
                  item.riskLevel ===
                  "Critical"
              ).length
            }
          </strong>

          <span>
            Critical Risk
          </span>

        </div>

        <div className="infra-stat high">

          <strong>
            {
              infrastructureData.filter(
                (item) =>
                  item.riskLevel ===
                  "High"
              ).length
            }
          </strong>

          <span>
            High Risk
          </span>

        </div>

        <div className="infra-stat safe">

          <strong>
            {
              infrastructureData.filter(
                (item) =>
                  item.riskLevel ===
                  "Moderate"
              ).length
            }
          </strong>

          <span>
            Moderate Risk
          </span>

        </div>

      </section>

      {/* ================= INFRASTRUCTURE EXPOSURE ================= */}

      <section className="infrastructure-card">

        <div className="infrastructure-card-header">

          <div>

            <h2>
              Infrastructure Exposure
            </h2>

            <p>
              Prototype infrastructure assets
              ranked according to landslide risk.
            </p>

          </div>

          <span className="monitoring-badge">
            ● Risk Monitoring
          </span>

        </div>

        {/* ================= ASSET LIST ================= */}

        <div className="infrastructure-list">

          {infrastructureData.map(
            (item) => (

              <div
                className={`infrastructure-row ${getRiskClass(
                  item.riskLevel
                )}`}
                key={item.id}
              >

                {/* Asset */}

                <div className="infra-main">

                  <h3>
                    {item.name}
                  </h3>

                  <div className="infra-details">

                    <span>
                      {item.type}
                    </span>

                    <span>
                      {item.location}
                    </span>

                    <span>
                      {item.state}
                    </span>

                  </div>

                </div>

                {/* Risk Score */}

                <div className="infra-score">

                  <strong>
                    {item.riskScore}
                  </strong>

                  <span>
                    / 100
                  </span>

                </div>

                {/* Risk Level */}

                <div
                  className={`infra-risk ${getRiskClass(
                    item.riskLevel
                  )}`}
                >
                  {item.riskLevel}
                </div>

                {/* Status */}

                <div
                  className={`infra-status ${item.status
                    .toLowerCase()
                    .replaceAll(" ", "-")}`}
                >
                  {item.status}
                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* ================= NOTE ================= */}

      <div className="infrastructure-note">

        <strong>
          AI Risk Assessment:
        </strong>{" "}
        Risk scores shown in this prototype
        represent demonstration assessments
        using environmental factors such as
        rainfall, soil moisture, slope and
        elevation. Infrastructure information
        is prototype/demo data.

      </div>

    </div>
  );
}

export default InfrastructureRisk;