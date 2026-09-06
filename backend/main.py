
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from demo_data import demo_locations
import joblib
from pydantic import BaseModel
from datetime import datetime



# Load trained ML model
model = joblib.load("landslide_model.pkl")
FEATURE_NAMES = [
    "rainfall_mm",
    "soil_moisture",
    "slope_degree",
    "elevation_m",
    "temperature_c",
]

FEATURE_IMPORTANCE = {
    name: round(float(importance), 4)
    for name, importance in zip(
        FEATURE_NAMES,
        model.feature_importances_
    )
}


class PredictionInput(BaseModel):
    rainfall_mm: float
    soil_moisture: float
    slope_degree: float
    elevation_m: float
    temperature_c: float


app = FastAPI(
    title="LandslideAI API",
    description="AI-based Landslide Risk Monitoring and Prediction API",
    version="1.0.0",
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "LandslideAI API is running",
        "status": "operational",
        "project": "SIH26001",
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
    }


# --------------------------------------------------
# Dynamic Risk Summary
# --------------------------------------------------

@app.get("/api/risk-summary")
def risk_summary():

    monitored_locations = len(demo_locations)

    high_risk_zones = len(
        [
            location
            for location in demo_locations
            if location["risk_level"] in ["High", "Critical"]
        ]
    )

    active_alerts = len(
        [
            location
            for location in demo_locations
            if location["risk_level"] in [
                "Moderate",
                "High",
                "Critical",
            ]
        ]
    )

    infrastructure_at_risk = len(
        [
            location
            for location in demo_locations
            if location["risk_score"] >= 60
        ]
    )

    return {
        "monitored_locations": monitored_locations,
        "high_risk_zones": high_risk_zones,
        "active_alerts": active_alerts,
        "infrastructure_at_risk": infrastructure_at_risk,
    }


# --------------------------------------------------
# Locations
# --------------------------------------------------

@app.get("/api/locations")
def get_locations():
    return demo_locations


# --------------------------------------------------
# AI Risk Prediction
# --------------------------------------------------

@app.post("/api/predict")
def predict_risk(data: PredictionInput):

    input_data = [[
        data.rainfall_mm,
        data.soil_moisture,
        data.slope_degree,
        data.elevation_m,
        data.temperature_c,
    ]]

    prediction = model.predict(input_data)[0]

    risk_score = round(float(prediction), 2)

    if risk_score >= 80:
        risk_level = "Critical"

    elif risk_score >= 60:
        risk_level = "High"

    elif risk_score >= 40:
        risk_level = "Moderate"

    else:
        risk_level = "Low"
    return {
    "risk_score": risk_score,
    "risk_level": risk_level,
    "model_name": "Random Forest",
    "feature_importance": FEATURE_IMPORTANCE,
}
