import { useState } from "react";
import "./Settings.css";

function Settings() {
  const [notifications, setNotifications] =
    useState(true);

  const [autoRefresh, setAutoRefresh] =
    useState(true);

  const [saved, setSaved] =
    useState(false);

  const handleSave = () => {
    localStorage.setItem(
      "landslideai_notifications",
      String(notifications)
    );

    localStorage.setItem(
      "landslideai_auto_refresh",
      String(autoRefresh)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    setNotifications(true);
    setAutoRefresh(true);

    localStorage.removeItem(
      "landslideai_notifications"
    );

    localStorage.removeItem(
      "landslideai_auto_refresh"
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="settings-page">

      {/* Header */}
      <div className="settings-header">

        <div>
          <p className="settings-label">
            LANDSLIDEAI
          </p>

          <h1>
            ⚙️ Settings
          </h1>

          <p>
            Manage your dashboard preferences
            and monitoring options.
          </p>
        </div>

      </div>

      {/* Success message */}
      {saved && (
        <div className="settings-success">
          ✅ Settings saved successfully.
        </div>
      )}

      <div className="settings-grid">

        {/* Monitoring */}
        <div className="settings-card">

          <div className="settings-card-header">
            <div className="settings-icon">
              📡
            </div>

            <div>
              <h2>
                Monitoring
              </h2>

              <p>
                Configure monitoring preferences.
              </p>
            </div>
          </div>

          <div className="setting-row">

            <div>
              <strong>
                Automatic Monitoring
              </strong>

              <span>
                Keep district monitoring updates
                enabled.
              </span>
            </div>

            <button
              className={`toggle ${
                autoRefresh ? "active" : ""
              }`}
              onClick={() =>
                setAutoRefresh(!autoRefresh)
              }
              type="button"
            >
              <span />
            </button>

          </div>

          <div className="setting-row">

            <div>
              <strong>
                Refresh Interval
              </strong>

              <span>
                Current monitoring interval:
                30 seconds.
              </span>
            </div>

            <span className="setting-value">
              30 sec
            </span>

          </div>

        </div>

        {/* Notifications */}
        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              🔔
            </div>

            <div>
              <h2>
                Notifications
              </h2>

              <p>
                Manage alert notification preferences.
              </p>
            </div>

          </div>

          <div className="setting-row">

            <div>
              <strong>
                Risk Alerts
              </strong>

              <span>
                Show high and medium risk
                notifications.
              </span>
            </div>

            <button
              className={`toggle ${
                notifications ? "active" : ""
              }`}
              onClick={() =>
                setNotifications(
                  !notifications
                )
              }
              type="button"
            >
              <span />
            </button>

          </div>

        </div>

        {/* System */}
        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              🖥️
            </div>

            <div>
              <h2>
                System Information
              </h2>

              <p>
                Current LandslideAI system status.
              </p>
            </div>

          </div>

          <div className="system-info-list">

            <div>
              <span>
                Platform
              </span>

              <strong>
                LandslideAI
              </strong>
            </div>

            <div>
              <span>
                Region
              </span>

              <strong>
                North Eastern Region
              </strong>
            </div>

            <div>
              <span>
                Coverage
              </span>

              <strong>
                8 States
              </strong>
            </div>

            <div>
              <span>
                Monitoring
              </span>

              <strong className="status-online">
                ● Active
              </strong>
            </div>

          </div>

        </div>

        {/* AI Model */}
        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              🤖
            </div>

            <div>
              <h2>
                AI Model
              </h2>

              <p>
                Information about the risk
                prediction model.
              </p>
            </div>

          </div>

          <div className="model-info">

            <div>
              <span>
                Model
              </span>

              <strong>
                Random Forest
              </strong>
            </div>

            <div>
              <span>
                Risk Classes
              </span>

              <strong>
                Low / Medium / High
              </strong>
            </div>

            <div>
              <span>
                Model Inputs
              </span>

              <strong>
                Rainfall, Terrain & Environment
              </strong>
            </div>

          </div>

        </div>

      </div>

      {/* Actions */}
      <div className="settings-actions">

        <button
          className="reset-button"
          onClick={handleReset}
          type="button"
        >
          ↺ Reset Preferences
        </button>

        <button
          className="save-button"
          onClick={handleSave}
          type="button"
        >
          ✓ Save Settings
        </button>

      </div>

      {/* Notice */}
      <div className="settings-notice">

        <span>
          ℹ️
        </span>

        <div>
          <strong>
            Prototype Settings
          </strong>

          <p>
            These preferences are stored locally
            in your browser. They do not modify
            the underlying rainfall dataset or
            AI model.
          </p>
        </div>

      </div>

    </div>
  );
}

export default Settings;