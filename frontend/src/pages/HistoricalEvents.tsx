
import { useNavigate } from "react-router-dom";
import "./HistoricalEvents.css";

interface HistoricalEvent {
  id: number;
  date: string;
  location: string;
  risk_level: string;
  risk_score: number;
  rainfall_mm: number;
  status: string;
  description: string;
}

const historicalEvents: HistoricalEvent[] = [
  {
    id: 1,
    date: "2026-08-28",
    location: "Manali",
    risk_level: "Critical",
    risk_score: 94,
    rainfall_mm: 240,
    status: "High Alert",
    description:
      "Heavy rainfall and high soil moisture created critical landslide conditions.",
  },
  {
    id: 2,
    date: "2026-08-24",
    location: "Shimla",
    risk_level: "High",
    risk_score: 82,
    rainfall_mm: 185,
    status: "Monitored",
    description:
      "Elevated slope instability detected following sustained rainfall.",
  },
  {
    id: 3,
    date: "2026-08-19",
    location: "Dharamshala",
    risk_level: "High",
    risk_score: 76,
    rainfall_mm: 210,
    status: "Monitored",
    description:
      "High rainfall and increased soil moisture raised landslide susceptibility.",
  },
  {
    id: 4,
    date: "2026-08-15",
    location: "Dehradun",
    risk_level: "Moderate",
    risk_score: 58,
    rainfall_mm: 120,
    status: "Normal",
    description:
      "Moderate rainfall produced a manageable increase in landslide risk.",
  },
  {
    id: 5,
    date: "2026-08-10",
    location: "Manali",
    risk_level: "High",
    risk_score: 71,
    rainfall_mm: 190,
    status: "Resolved",
    description:
      "Temporary high-risk conditions reduced after rainfall intensity decreased.",
  },
  {
    id: 6,
    date: "2026-08-04",
    location: "Shimla",
    risk_level: "Moderate",
    risk_score: 55,
    rainfall_mm: 105,
    status: "Resolved",
    description:
      "Moderate environmental risk observed during a period of rainfall.",
  },
];

function HistoricalEvents() {
  const navigate = useNavigate();

  const getRiskClass = (riskLevel: string) => {
    return riskLevel.toLowerCase();
  };

  const getStatusClass = (status: string) => {
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
            DISASTER MANAGEMENT
          </p>

          <h1>
            Historical Events
          </h1>

          <span>
            Review previous landslide risk conditions and monitoring events.
          </span>
        </div>

        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

      </header>

      {/* Summary */}
      <section className="history-summary">

        <div className="history-stat">
          <span>Total Events</span>
          <strong>{historicalEvents.length}</strong>
          <small>Recorded events</small>
        </div>

        <div className="history-stat critical">
          <span>Critical Events</span>
          <strong>
            {
              historicalEvents.filter(
                (event) => event.risk_level === "Critical"
              ).length
            }
          </strong>
          <small>Immediate attention</small>
        </div>

        <div className="history-stat high">
          <span>High Risk Events</span>
          <strong>
            {
              historicalEvents.filter(
                (event) => event.risk_level === "High"
              ).length
            }
          </strong>
          <small>Elevated conditions</small>
        </div>

        <div className="history-stat resolved">
          <span>Resolved</span>
          <strong>
            {
              historicalEvents.filter(
                (event) => event.status === "Resolved"
              ).length
            }
          </strong>
          <small>Past conditions</small>
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
              Previously recorded landslide risk events
            </p>
          </div>

          <span className="history-live">
            ● Historical Data
          </span>

        </div>

        <div className="events-list">

          {historicalEvents.map((event) => (

            <div
              className="event-row"
              key={event.id}
            >

              <div className="event-date">
                <strong>
                  {new Date(event.date).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </strong>
              </div>

              <div className="event-location">

                <strong>
                  📍 {event.location}
                </strong>

                <p>
                  {event.description}
                </p>

              </div>

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

              <div className="event-rainfall">

                <span>
                  🌧️ Rainfall
                </span>

                <strong>
                  {event.rainfall_mm} mm
                </strong>

              </div>

              <div
                className={`event-status ${getStatusClass(
                  event.status
                )}`}
              >
                {event.status}
              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Footer */}
      <footer className="historical-footer">

        <span>
          LandslideAI • SIH26001 Prototype
        </span>

        <span>
          Predict. Monitor. Explain. Protect.
        </span>

      </footer>

    </div>
  );
}

export default HistoricalEvents;
