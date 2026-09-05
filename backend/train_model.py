import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
import joblib

# Demo landslide dataset
data = {
    "rainfall_mm": [80, 120, 150, 180, 210, 240, 270, 300, 100, 160, 200, 250],
    "soil_moisture": [35, 45, 50, 60, 65, 72, 80, 90, 40, 55, 70, 85],
    "slope_degree": [10, 15, 20, 25, 30, 35, 40, 45, 12, 22, 32, 42],
    "elevation_m": [500, 700, 900, 1100, 1300, 1500, 1700, 2000, 600, 1000, 1400, 1800],
    "temperature_c": [28, 26, 24, 22, 20, 18, 16, 14, 27, 23, 19, 15],
    "risk_score": [15, 25, 32, 42, 52, 65, 78, 92, 20, 38, 58, 85],
}

df = pd.DataFrame(data)

# Input features
X = df[
    [
        "rainfall_mm",
        "soil_moisture",
        "slope_degree",
        "elevation_m",
        "temperature_c",
    ]
]

# Target value
y = df["risk_score"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Create ML model
model = RandomForestRegressor(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Check model accuracy
score = model.score(X_test, y_test)

print("Model trained successfully!")
print("Model R² score:", round(score, 2))

# Save model
joblib.dump(model, "landslide_model.pkl")

print("Model saved as landslide_model.pkl")