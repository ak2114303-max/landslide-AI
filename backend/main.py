from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
)

from fastapi.middleware.cors import CORSMiddleware

from dem_data import get_terrain_data
from soil_moisture_data import get_soil_moisture
from satellite_data import get_ndvi
from demo_data import demo_locations
from weather_data import get_weather_data

from district_risk import (
    get_all_district_risks,
    get_district_risk,
    get_risk_summary,
)

import pandas as pd
import joblib
from pydantic import BaseModel
from datetime import datetime
import os
import json
import uuid


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "landslide_model.pkl"
)

ROAD_CACHE_FILE = os.path.join(
    BASE_DIR,
    "roads_cache.json"
)

# ============================================================
# LANDSLIDE REPORT STORAGE
# ============================================================

REPORTS_DIR = os.path.join(
    BASE_DIR,
    "landslide_reports"
)

REPORTS_METADATA_FILE = os.path.join(
    REPORTS_DIR,
    "reports.json"
)

# Create report folder automatically
os.makedirs(
    REPORTS_DIR,
    exist_ok=True
)


# ============================================================
# LOAD TRAINED ML MODEL
# ============================================================

model_package = joblib.load(
    MODEL_FILE
)

# New model is stored as a dictionary
if isinstance(model_package, dict):

    model = model_package["model"]

    FEATURE_NAMES = model_package.get(
        "features",
        []
    )

else:

    # Backward compatibility
    model = model_package

    FEATURE_NAMES = [
        "rainfall_mm",
        "soil_moisture",
        "slope_degree",
        "elevation_m",
        "temperature_c",
    ]


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

try:

    FEATURE_IMPORTANCE = {
        name: round(
            float(importance),
            4
        )
        for name, importance in zip(
            FEATURE_NAMES,
            model.feature_importances_
        )
    }

except Exception:

    FEATURE_IMPORTANCE = {}


# ============================================================
# PREDICTION INPUT
# ============================================================

class PredictionInput(BaseModel):

    rainfall_1d_mm: float
    rainfall_3d_mm: float
    rainfall_7d_mm: float
    rainfall_15d_mm: float

    elevation: float
    slope: float
    soil_moisture: float
    temperature: float
    ndvi: float


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="LandslideAI API",

    description=(
        "AI-based Landslide Risk Monitoring "
        "and Prediction API for North Eastern Region"
    ),

    version="2.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message":
            "LandslideAI API is running",

        "status":
            "operational",

        "project":
            "SIH26001",

        "version":
            "2.0",

        "region":
            "North Eastern Region",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health_check():

    return {
        "status":
            "healthy",

        "timestamp":
            datetime.now().isoformat(),

        "model_loaded":
            True,
    }


# ============================================================
# ALL NER DISTRICTS
# ============================================================

@app.get("/api/districts")
def get_districts():

    try:

        data = get_all_district_risks()

        return {
            "success":
                True,

            "total_districts":
                len(data),

            "data":
                data,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# DISTRICT RISK SUMMARY
# ============================================================

@app.get("/api/district-risk-summary")
def district_risk_summary():

    try:

        return {
            "success":
                True,

            **get_risk_summary()
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# SINGLE DISTRICT
# ============================================================

@app.get(
    "/api/district/{state}/{district}"
)
def district_prediction(
    state: str,
    district: str
):

    try:

        result = get_district_risk(
            state,
            district
        )

        if result is None:

            raise HTTPException(
                status_code=404,

                detail=(
                    f"District '{district}' "
                    f"not found in '{state}'"
                )
            )

        return {
            "success":
                True,

            "data":
                result,
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# STATES LIST
# ============================================================

@app.get("/api/states")
def get_states():

    try:

        districts = (
            get_all_district_risks()
        )

        states = sorted(
            list(
                set(
                    item["state"]
                    for item in districts
                )
            )
        )

        return {
            "success":
                True,

            "total_states":
                len(states),

            "states":
                states,
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# DISTRICTS BY STATE
# ============================================================

@app.get(
    "/api/districts/{state}"
)
def get_state_districts(
    state: str
):

    try:

        districts = (
            get_all_district_risks()
        )

        state_data = [
            item
            for item in districts
            if item["state"].lower()
            == state.lower()
        ]

        if not state_data:

            raise HTTPException(
                status_code=404,

                detail=(
                    f"State '{state}' "
                    "not found"
                )
            )

        return {
            "success":
                True,

            "state":
                state_data[0]["state"],

            "total_districts":
                len(state_data),

            "data":
                state_data,
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


# ============================================================
# OLD DEMO RISK SUMMARY
# ============================================================

@app.get("/api/risk-summary")
def risk_summary():

    monitored_locations = len(
        demo_locations
    )

    high_risk_zones = len(
        [
            location
            for location in demo_locations
            if location["risk_level"]
            in ["High", "Critical"]
        ]
    )

    active_alerts = len(
        [
            location
            for location in demo_locations
            if location["risk_level"]
            in [
                "Moderate",
                "High",
                "Critical"
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

        "monitored_locations":
            monitored_locations,

        "high_risk_zones":
            high_risk_zones,

        "active_alerts":
            active_alerts,

        "infrastructure_at_risk":
            infrastructure_at_risk,
    }


# ============================================================
# OLD DEMO LOCATIONS
# ============================================================

@app.get("/api/locations")
def get_locations():

    return demo_locations


# ============================================================
# ML PREDICTION
# ============================================================

@app.post("/api/predict")
def predict_risk(
    data: PredictionInput
):

    input_data = pd.DataFrame(
        [[

            data.rainfall_1d_mm,

            data.rainfall_3d_mm,

            data.rainfall_7d_mm,

            data.rainfall_15d_mm,

            data.elevation,

            data.slope,

            data.soil_moisture,

            data.temperature,

            data.ndvi,

        ]],

        columns=FEATURE_NAMES
    )

    prediction = int(
        model.predict(
            input_data
        )[0]
    )

    probabilities = (
        model.predict_proba(
            input_data
        )[0]
    )

    risk_probability = round(
        float(
            max(probabilities) * 100
        ),
        2
    )

    risk_names = {
        0: "LOW",
        1: "MEDIUM",
        2: "HIGH",
    }

    risk_level = risk_names.get(
        prediction,
        "LOW"
    )

    return {

        "risk_probability":
            risk_probability,

        "risk_level":
            risk_level,

        "prediction_class":
            prediction,

        "model_name":
            "Random Forest",

        "feature_importance":
            FEATURE_IMPORTANCE,
    }


# ============================================================
# WEATHER LOCATIONS
# ============================================================

WEATHER_LOCATIONS = {

    "Itanagar": {
        "latitude": 27.0844,
        "longitude": 93.6053,
    },

    "Guwahati": {
        "latitude": 26.1445,
        "longitude": 91.7362,
    },

    "Imphal": {
        "latitude": 24.8170,
        "longitude": 93.9368,
    },

    "Shillong": {
        "latitude": 25.5788,
        "longitude": 91.8933,
    },

    "Aizawl": {
        "latitude": 23.7271,
        "longitude": 92.7176,
    },

    "Kohima": {
        "latitude": 25.6751,
        "longitude": 94.1086,
    },

    "Gangtok": {
        "latitude": 27.3389,
        "longitude": 88.6065,
    },

    "Agartala": {
        "latitude": 23.8315,
        "longitude": 91.2868,
    },
}


# ============================================================
# WEATHER - ALL CAPITAL LOCATIONS
# ============================================================

@app.get("/api/weather-all")
def get_all_weather():

    results = []

    for location in WEATHER_LOCATIONS:

        coordinates = (
            WEATHER_LOCATIONS[location]
        )

        try:

            data = get_weather_data(
                latitude=
                    coordinates["latitude"],

                longitude=
                    coordinates["longitude"],

                date=
                    datetime(
                        2025,
                        8,
                        1
                    ),
            )

            results.append({

                "location":
                    location,

                "rainfall_mm":
                    data["rainfall_mm"],

                "temperature_c":
                    data["temperature_c"],

                "source":
                    "Copernicus ERA5-Land",
            })

        except Exception as error:

            results.append({

                "location":
                    location,

                "error":
                    str(error),
            })

    return results


# ============================================================
# WEATHER - SINGLE LOCATION
# ============================================================

@app.get(
    "/api/weather/{location}"
)
def get_location_weather(
    location: str
):

    location = location.title()

    if location not in WEATHER_LOCATIONS:

        return {

            "error":
                "Location not found",

            "available_locations":
                list(
                    WEATHER_LOCATIONS.keys()
                ),
        }

    coordinates = (
        WEATHER_LOCATIONS[location]
    )

    data = get_weather_data(

        latitude=
            coordinates["latitude"],

        longitude=
            coordinates["longitude"],

        date=
            datetime(
                2025,
                8,
                1
            ),
    )

    return {

        "location":
            location,

        "rainfall_mm":
            data["rainfall_mm"],

        "temperature_c":
            data["temperature_c"],

        "source":
            "Copernicus ERA5-Land",
    }


# ============================================================
# SATELLITE NDVI
# ============================================================

@app.get(
    "/api/satellite/{location}"
)
def satellite_data(
    location: str
):

    location = location.title()

    if location not in WEATHER_LOCATIONS:

        raise HTTPException(
            status_code=404,
            detail="Location not found",
        )

    latitude = (
        WEATHER_LOCATIONS[location]
        ["latitude"]
    )

    longitude = (
        WEATHER_LOCATIONS[location]
        ["longitude"]
    )

    return get_ndvi(
        latitude,
        longitude,
    )


# ============================================================
# OLD AI PREDICTION - DEMO LOCATIONS
# ============================================================

@app.get(
    "/api/predict-location/{location}"
)
def predict_location(
    location: str
):

    location = location.title()

    matching_locations = [

        item

        for item in demo_locations

        if item["location"]
        == location
    ]

    if not matching_locations:

        return {

            "error":
                "Location not found",

            "available_locations": [

                item["location"]

                for item in demo_locations
            ],
        }

    location_data = (
        matching_locations[0].copy()
    )


    # --------------------------------------------------------
    # TERRAIN
    # --------------------------------------------------------

    try:

        terrain = get_terrain_data(

            latitude=
                location_data["latitude"],

            longitude=
                location_data["longitude"],
        )

        location_data[
            "elevation_m"
        ] = terrain[
            "elevation_m"
        ]

        location_data[
            "slope_degree"
        ] = terrain[
            "slope_degree"
        ]

    except Exception as error:

        print(
            "Terrain data error:",
            error
        )

        location_data[
            "elevation_m"
        ] = 0

        location_data[
            "slope_degree"
        ] = 0


    # --------------------------------------------------------
    # SOIL MOISTURE
    # --------------------------------------------------------

    try:

        soil_moisture = (
            get_soil_moisture(

                latitude=
                    location_data[
                        "latitude"
                    ],

                longitude=
                    location_data[
                        "longitude"
                    ],

                date=
                    datetime(
                        2025,
                        8,
                        1
                    ),
            )
        )

        location_data[
            "soil_moisture"
        ] = soil_moisture

    except Exception as error:

        print(
            "Soil moisture data error:",
            error
        )

        location_data[
            "soil_moisture"
        ] = 0


    # --------------------------------------------------------
    # WEATHER
    # --------------------------------------------------------

    coordinates = (
        WEATHER_LOCATIONS.get(
            location
        )
    )

    if not coordinates:

        return {

            "error":
                "Weather coordinates not available"
        }

    weather = get_weather_data(

        latitude=
            coordinates["latitude"],

        longitude=
            coordinates["longitude"],

        date=
            datetime(
                2025,
                8,
                1
            ),
    )


    # --------------------------------------------------------
    # RETURN EXISTING DEMO ENVIRONMENT DATA
    # --------------------------------------------------------

    return {

        "location":
            location,

        "rainfall_mm":
            weather["rainfall_mm"],

        "temperature_c":
            weather["temperature_c"],

        "soil_moisture":
            location_data[
                "soil_moisture"
            ],

        "slope_degree":
            location_data[
                "slope_degree"
            ],

        "elevation_m":
            location_data[
                "elevation_m"
            ],

        "weather_source":
            "Copernicus ERA5-Land",

        "model_name":
            "Random Forest",

        "feature_importance":
            FEATURE_IMPORTANCE,
    }


# ============================================================
# LANDSLIDE REPORT SUBMISSION
# ============================================================

def load_reports():

    if not os.path.exists(
        REPORTS_METADATA_FILE
    ):

        return []

    try:

        with open(
            REPORTS_METADATA_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    except Exception:

        return []


def save_reports(
    reports
):

    with open(
        REPORTS_METADATA_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            reports,
            file,
            indent=4,
            ensure_ascii=False
        )


@app.post(
    "/api/landslide-report"
)
async def submit_landslide_report(

    image: UploadFile = File(...),

    location: str = Form(...),

    description: str = Form(""),

    date: str = Form(""),

):

    try:

        # ----------------------------------------------------
        # Validate image format
        # ----------------------------------------------------

        allowed_types = {
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
        }

        if image.content_type not in allowed_types:

            raise HTTPException(
                status_code=400,

                detail=(
                    "Invalid image format. "
                    "Please upload JPG, JPEG, PNG "
                    "or WEBP."
                )
            )


        # ----------------------------------------------------
        # Validate location
        # ----------------------------------------------------

        if not location.strip():

            raise HTTPException(
                status_code=400,

                detail=
                    "Location is required."
            )


        # ----------------------------------------------------
        # Read image
        # ----------------------------------------------------

        image_data = (
            await image.read()
        )

        if not image_data:

            raise HTTPException(
                status_code=400,

                detail=
                    "Uploaded image is empty."
            )


        # ----------------------------------------------------
        # Generate unique report ID
        # ----------------------------------------------------

        report_id = str(
            uuid.uuid4()
        )


        # ----------------------------------------------------
        # Get extension
        # ----------------------------------------------------

        extension = os.path.splitext(
            image.filename or ""
        )[1].lower()

        if not extension:

            extension = ".jpg"


        # ----------------------------------------------------
        # Create safe filename
        # ----------------------------------------------------

        saved_filename = (
            f"{report_id}{extension}"
        )


        image_path = os.path.join(
            REPORTS_DIR,
            saved_filename
        )


        # ----------------------------------------------------
        # Save uploaded image
        # ----------------------------------------------------

        with open(
            image_path,
            "wb"
        ) as file:

            file.write(
                image_data
            )


        # ----------------------------------------------------
        # Create report record
        # ----------------------------------------------------

        report = {

            "report_id":
                report_id,

            "original_filename":
                image.filename,

            "image_filename":
                saved_filename,

            "location":
                location.strip(),

            "description":
                description.strip(),

            "date":
                date,

            "submitted_at":
                datetime.now().isoformat(),

            "status":
                "Submitted",

            "region":
                "North Eastern Region",
        }


        # ----------------------------------------------------
        # Save report metadata
        # ----------------------------------------------------

        reports = load_reports()

        reports.append(
            report
        )

        save_reports(
            reports
        )


        # ----------------------------------------------------
        # Return success response
        # ----------------------------------------------------

        return {

            "success":
                True,

            "message":
                "Landslide report submitted successfully.",

            "report_id":
                report_id,

            "location":
                location.strip(),

            "status":
                "Submitted",
        }


    except HTTPException:

        raise

    except Exception as error:

        print(
            "Landslide report error:",
            error
        )

        raise HTTPException(
            status_code=500,

            detail=(
                "Unable to save landslide report."
            )
        )


# ============================================================
# ROADS
# ============================================================

@app.get("/api/roads")
def get_roads():

    print(
        "Road API called"
    )

    if not os.path.exists(
        ROAD_CACHE_FILE
    ):

        return {

            "error":
                "Road cache not found",

            "message":
                "Please run download_roads.py first.",
        }

    try:

        with open(
            ROAD_CACHE_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            roads = json.load(file)

        print(
            f"Road cache loaded: "
            f"{len(roads)} roads"
        )

        return roads

    except Exception as error:

        print(
            f"Road cache error: {error}"
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to read road cache",
        )


# ============================================================
# VILLAGES
# ============================================================

@app.get("/api/villages")
def get_villages():

    return {

        "message":
            "Village data endpoint ready",

        "status":
            "prototype",

        "data":
            []
    }