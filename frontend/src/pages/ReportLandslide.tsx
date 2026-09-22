import { useState } from "react";
import axios from "axios";

function ReportLandslide() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setMessage(
        "❌ Geolocation is not supported by your browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLocation(
          `${lat.toFixed(6)}, ${lon.toFixed(6)}`
        );

        setMessage("📍 Current location detected.");
      },
      () => {
        setMessage(
          "❌ Unable to access your location. Please enter it manually."
        );
      }
    );
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    console.log("SUBMIT BUTTON CLICKED");

    if (!image) {
      setMessage(
        "❌ Please upload a landslide image."
      );
      return;
    }

    if (!location.trim()) {
      setMessage(
        "❌ Please provide the landslide location."
      );
      return;
    }
    console.log("IMAGE AND LOCATION OK");

    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("image", image);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("date", date);

      
      console.log("FORM DATA CREATED");
      console.log("SENDING REQUEST...");


      // IMPORTANT: Plain URL, not Markdown link
      const response = await axios.post(
  "http://127.0.0.1:8000/api/landslide-report",
  formData,
  {
    timeout: 10000,
  }
);

console.log("SERVER RESPONSE:", response.data);
      console.log(
        "Landslide report response:",
        response.data
      );

      setMessage(
        "✅ Landslide report submitted successfully."
      );

      setImage(null);
      setPreview("");
      setLocation("");
      setDescription("");
      setDate("");
    } catch (error) {
      console.error(
        "Landslide report error:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "Response:",
          error.response?.data
        );
        console.error(
          "Status:",
          error.response?.status
        );
      }

      setMessage(
        "❌ Unable to submit the report. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-page">

      {/* Header */}
      <div className="report-header">
        <div>
          <h1>📸 Report a Landslide</h1>

          <p>
            Help monitor landslide events across the
            North Eastern Region of India.
          </p>
        </div>
      </div>

      <div className="report-container">

        {/* Left Side */}
        <div className="report-card">

          <h2>📷 Landslide Evidence</h2>

          <p className="section-description">
            Upload a clear photograph of the landslide
            area.
          </p>

          <label className="upload-box">

            {preview ? (
              <img
                src={preview}
                alt="Landslide preview"
                className="image-preview"
              />
            ) : (
              <div className="upload-content">

                <div className="upload-icon">
                  📷
                </div>

                <h3>
                  Upload Landslide Image
                </h3>

                <p>
                  Click here to select an image
                </p>

                <span>
                  JPG, JPEG, PNG
                </span>

              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

          </label>

          {image && (
            <div className="selected-file">
              📎 {image.name}
            </div>
          )}

        </div>

        {/* Right Side */}
        <div className="report-card">

          <h2>📍 Event Information</h2>

          <p className="section-description">
            Provide information about where and when
            the landslide occurred.
          </p>

          {/* Location */}
          <div className="form-group">

            <label>
              📍 Location
            </label>

            <div className="location-row">

              <input
                type="text"
                placeholder="Example: Gangtok, Sikkim"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
              />

              <button
                type="button"
                className="location-button"
                onClick={getLocation}
              >
                📍 Use GPS
              </button>

            </div>

            <small>
              Enter a NER location or use GPS coordinates.
            </small>

          </div>

          {/* Date */}
          <div className="form-group">

            <label>
              📅 Date of Event
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          </div>

          {/* Description */}
          <div className="form-group">

            <label>
              📝 Description
            </label>

            <textarea
              rows={5}
              placeholder="Describe what you observed..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

          </div>

          {/* Submit */}
          <button
            type="button"
            className="submit-report-button"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Submitting Report..."
              : "🚨 Submit Landslide Report"}
          </button>

          {/* Message */}
          {message && (
            <div className="report-message">
              {message}
            </div>
          )}

        </div>

      </div>

      {/* Information */}
      <div className="report-info">

        <div>

          <span>🔍</span>

          <div>

            <strong>
              Evidence Based Monitoring
            </strong>

            <p>
              Submitted photographs can help document
              and verify landslide events.
            </p>

          </div>

        </div>

        <div>

          <span>🗺️</span>

          <div>

            <strong>
              NER Focused
            </strong>

            <p>
              Reports are intended for landslide-prone
              areas across the 8 North Eastern states.
            </p>

          </div>

        </div>

        <div>

          <span>👮</span>

          <div>

            <strong>
              Review Before Use
            </strong>

            <p>
              Reports can be reviewed by authorized
              disaster-management personnel.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReportLandslide;