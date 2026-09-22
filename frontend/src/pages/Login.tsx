import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (
      username === "admin" &&
      password === "admin123"
    ) {
      localStorage.setItem(
        "landslideai_logged_in",
        "true"
      );

      navigate("/dashboard");
    } else {
      setError(
        "Invalid username or password"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-brand">

          <div className="login-logo">
            🌍
          </div>

          <h1>LandslideAI</h1>

          <p>
            AI-Powered Landslide
            Monitoring & Early Warning
          </p>

          <div className="login-features">

            <div>
              📊 District-level monitoring
            </div>

            <div>
              🗺️ Risk mapping
            </div>

            <div>
              🤖 AI-based prediction
            </div>

            <div>
              ⚠️ Early risk alerts
            </div>

          </div>

        </div>

        <div className="login-form-section">

          <div className="login-form-box">

            <h2>
              Welcome Back
            </h2>

            <p className="login-subtitle">
              Sign in to access
              LandslideAI dashboard
            </p>

            <form onSubmit={handleLogin}>

              <div className="form-group">

                <label>
                  Username
                </label>

                <input
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) =>
                    setUsername(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="form-group">

                <label>
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                />

              </div>

              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="login-button"
              >
                Sign In →
              </button>

            </form>

            <div className="demo-login">

              <strong>
                Demo Login
              </strong>

              <span>
                Username: admin
              </span>

              <span>
                Password: admin123
              </span>

            </div>

            <div className="login-footer">
              LandslideAI • SIH26001
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;