import { useNavigate } from "react-router-dom";
import "./HistoricalEvents.css";

interface HistoricalEvent {
  id: number;
  date: string;
  state: string;
  location: string;
  risk_level: string;
  risk_score: number;
  rainfall_mm: number;
  status: string;
  description: string;
}

// NER-focused prototype historical monitoring records
// These are prototype monitoring events, not confirmed landslide-event records.
const historicalEvents: HistoricalEvent[] = [
  {
    id: 1,
    date: "2026-09-21",
    state: "Arunachal Pradesh",
    location: "Upper Siang",
    risk_level: "High",
    risk_score: 99.5,
    rainfall_mm: 136.2,
    status: "High Alert",
    description:
      "Elevated rainfall conditions and terrain factors resulted in a high-risk AI assessment.",
  },
  {
    id: 2,
    date: "2026-09-21",
    state: "Arunachal Pradesh",
    location: "East Kameng",
    risk_level: "High",
    risk_score: 75,
    rainfall_mm: 162.1,
    status: "Monitored",
    description:
      "Sustained rainfall conditions increased the prototype landslide risk assessment.",
  },
  {
    id: 3,
    date: "2026-09-20",
    state: "Assam",
    location: "Kamrup",
    risk_level: "Moderate",
    risk_score: 68,
    rainfall_mm: 118.4,
    status: "Monitored",
    description:
      "Moderate rainfall conditions resulted in an elevated monitoring risk assessment.",
  },
  {
    id: 4,
    date: "2026-09-19",
    state: "Meghalaya",
    location: "East Khasi Hills",
    risk_level: "Moderate",
    risk_score: 64,
    rainfall_mm: 104.7,
    status: "Monitored",
    description:
      "Accumulated rainfall contributed to increased prototype landslide susceptibility.",
  },
  {
    id: 5,
    date: "2026-09-18",
    state: "Sikkim",
    location: "Pakyong",
    risk_level: "Moderate",
    risk_score: 82,
    rainfall_mm: 92.3,
    status: "Monitored",
    description:
      "Seven-day rainfall accumulation produced a moderate AI risk assessment.",
  },
  {
    id: 6,
    date: "2026-09-17",
    state: "Nagaland",
    location: "Kohima",
    risk_level: "Moderate",
    risk_score: 61,
    rainfall_mm: 96.5,
    status: "Resolved",
    description:
      "Previous elevated rainfall conditions reduced, resulting in a lower monitoring concern.",
  },
  {
    id: 7,
    date: "2026-09-16",
    state: "Manipur",
    location: "Imphal West",
    risk_level: "Moderate",
    risk_score: 57,
    rainfall_mm: 88.2,
    status: "Resolved",
    description:
      "Moderate environmental conditions were observed during the monitoring period.",
  },
  {
    id: 8,
    date: "2026-09-15",
    state: "Mizoram",
    location: "Aizawl",
    risk_level: "High",
    risk_score: 79,
    rainfall_mm: 121.6,
    status: "High Alert",
    description:
      "Increased rainfall and terrain characteristics produced an elevated prototype risk assessment.",
  },
  {
    id: 9,
    date: "2026-09-14",
    state: "Tripura",
    location: "West Tripura",
    risk_level: "Moderate",
    risk_score: 55,
    rainfall_mm: 82.4,
    status: "Monitored",
    description:
      "Rainfall accumulation resulted in moderate landslide-risk monitoring conditions.",
  },
];

function HistoricalEvents() {
  const navigate = useNavigate();

  const getRiskClass = (
    riskLevel: string
  ) => {
    return riskLevel.toLowerCase();
  };

  const getStatusClass = (
    status: string
  ) => {
    if (status === "High Alert") {
      return "alert";
    }

    if (status === "Monitored") {
      return "monitored";
    }

    if (status === "Resolved") {
      return "resolved";
    }

    return "normal";
  };

  return (
    <div className="historical-page">

      {/* Header */}

      <header className="historical-header">

        <div>

          <p className="historical-label">
            NORTH EASTERN REGION
          </p>

          <h1>
            Historical Events
          </h1>

          <span>
            Review previous landslide risk
            monitoring conditions across
            the NER.
          </span>

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

      {/* Prototype Notice */}

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
          Prototype Historical Data:
        </strong>{" "}
        These records represent historical
        risk-monitoring examples for the
        LandslideAI prototype and are not
        confirmed landslide-event records.
      </div>

      {/* Summary */}

      <section className="history-summary">

        <div className="history-stat">

          <span>
            Total Events
          </span>

          <strong>
            {historicalEvents.length}
          </strong>

          <small>
            Recorded monitoring events
          </small>

        </div>

        <div className="history-stat critical">

          <span>
            Critical Events
          </span>

          <strong>
            {
              historicalEvents.filter(
                (event) =>
                  event.risk_level ===
                  "Critical"
              ).length
            }
          </strong>

          <small>
            Immediate attention
          </small>

        </div>

        <div className="history-stat high">

          <span>
            High Risk Events
          </span>

          <strong>
            {
              historicalEvents.filter(
                (event) =>
                  event.risk_level ===
                  "High"
              ).length
            }
          </strong>

          <small>
            Elevated conditions
          </small>

        </div>

        <div className="history-stat resolved">

          <span>
            Resolved
          </span>

          <strong>
            {
              historicalEvents.filter(
                (event) =>
                  event.status ===
                  "Resolved"
              ).length
            }
          </strong>

          <small>
            Past conditions
          </small>

        </div>

      </section>

      {/* Events */}

      <section className="history-card">

        <div className="history-card-header">

          <div>

            <h2>
              Event History
            </h2>

            <p>
              Previous NER risk-monitoring
              conditions
            </p>

          </div>

          <span className="history-live">
            ● Prototype Historical Data
          </span>

        </div>

        <div className="events-list">

          {historicalEvents.map(
            (event) => (

              <div
                className="event-row"
                key={event.id}
              >

                {/* Date */}

                <div className="event-date">

                  <strong>
                    {new Date(
                      event.date
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </strong>

                </div>

                {/* Location */}

                <div className="event-location">

                  <strong>
                    📍 {event.location}
                  </strong>

                  <small
                    style={{
                      display:
                        "block",
                      marginTop:
                        "3px",
                      fontWeight:
                        600,
                    }}
                  >
                    {event.state}
                  </small>

                  <p>
                    {event.description}
                  </p>

                </div>

                {/* Risk */}

                <div
                  className={`event-risk ${getRiskClass(
                    event.risk_level
                  )}`}
                >

                  <span>
                    {event.risk_level}
                  </span>

                  <strong>
                    {event.risk_score}%
                  </strong>

                </div>

                {/* Rainfall */}

                <div className="event-rainfall">

                  <span>
                    🌧️ Rainfall
                  </span>

                  <strong>
                    {event.rainfall_mm} mm
                  </strong>

                </div>

                {/* Status */}

                <div
                  className={`event-status ${getStatusClass(
                    event.status
                  )}`}
                >
                  {event.status}
                </div>

              </div>

            )
          )}

        </div>

      </section>

      {/* Footer */}

      <footer className="historical-footer">

        <span>
          LandslideAI • SIH26001
          Prototype
        </span>

        <span>
          Predict. Monitor. Explain.
          Protect.
        </span>

      </footer>

    </div>
  );
}

export default HistoricalEvents;