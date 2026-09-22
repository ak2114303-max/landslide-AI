import os
import joblib
import pandas as pd
import numpy as np


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATA_FILE = os.path.join(
    BASE_DIR,
    "data",
    "imd_rainfall",
    "merged",
    "ner_landslide_ml_dataset.csv"
)

MODEL_FILE = os.path.join(
    BASE_DIR,
    "landslide_model.pkl"
)


# ============================================================
# LOAD MODEL
# ============================================================

model_package = joblib.load(MODEL_FILE)

model = model_package["model"]

FEATURES = model_package["features"]


# ============================================================
# LOAD ML DATASET
# ============================================================

df = pd.read_csv(DATA_FILE)


# ============================================================
# CLEAN DATA
# ============================================================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)


# ============================================================
# DATE
# ============================================================

if "date" in df.columns:

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )


# ============================================================
# RISK NAME
# ============================================================

RISK_NAMES = {
    0: "LOW",
    1: "MEDIUM",
    2: "HIGH"
}


# ============================================================
# GET LATEST DATA
# ============================================================

def get_latest_district_data():

    if "date" in df.columns:

        latest_date = df["date"].max()

        latest = df[
            df["date"] == latest_date
        ].copy()

    else:

        latest = df.copy()

    return latest


# ============================================================
# PREDICT DISTRICT RISK
# ============================================================

def predict_district(row):

    input_data = pd.DataFrame(
        [[
            row["rainfall_1d_mm"],
            row["rainfall_3d_mm"],
            row["rainfall_7d_mm"],
            row["rainfall_15d_mm"],
            row["elevation"],
            row["slope"],
            row["soil_moisture"],
            row["temperature"],
            row["ndvi"]
        ]],
        columns=FEATURES
    )

    prediction = int(
        model.predict(input_data)[0]
    )

    probabilities = model.predict_proba(
        input_data
    )[0]

    probability = float(
        max(probabilities) * 100
    )

    return {
        "risk_level": RISK_NAMES.get(
            prediction,
            "LOW"
        ),
        "risk_probability": round(
            probability,
            2
        )
    }


# ============================================================
# GET ALL DISTRICTS
# ============================================================

def get_all_district_risks():

    latest = get_latest_district_data()

    results = []

    for _, row in latest.iterrows():

        prediction = predict_district(row)

        results.append({

            "state":
                str(row["state"]),

            "district":
                str(row["district"]),

            "date":
                str(
                    row["date"].date()
                    if pd.notna(row["date"])
                    else ""
                ),

            "rainfall_1d_mm":
                round(
                    float(row["rainfall_1d_mm"]),
                    2
                ),

            "rainfall_3d_mm":
                round(
                    float(row["rainfall_3d_mm"]),
                    2
                ),

            "rainfall_7d_mm":
                round(
                    float(row["rainfall_7d_mm"]),
                    2
                ),

            "rainfall_15d_mm":
                round(
                    float(row["rainfall_15d_mm"]),
                    2
                ),

            "elevation":
                round(
                    float(row["elevation"]),
                    2
                ),

            "slope":
                round(
                    float(row["slope"]),
                    2
                ),

            "soil_moisture":
                round(
                    float(row["soil_moisture"]),
                    3
                ),

            "temperature":
                round(
                    float(row["temperature"]),
                    2
                ),

            "ndvi":
                round(
                    float(row["ndvi"]),
                    3
                ),

            "risk_level":
                prediction["risk_level"],

            "risk_probability":
                prediction["risk_probability"]

        })

    return results


# ============================================================
# GET SINGLE DISTRICT
# ============================================================

def get_district_risk(
    state,
    district
):

    latest = get_latest_district_data()

    result = latest[
        (
            latest["state"]
            .str.lower()
            ==
            state.lower()
        )
        &
        (
            latest["district"]
            .str.lower()
            ==
            district.lower()
        )
    ]

    if result.empty:

        return None

    row = result.iloc[0]

    prediction = predict_district(row)

    return {

        "state":
            str(row["state"]),

        "district":
            str(row["district"]),

        "date":
            str(
                row["date"].date()
                if pd.notna(row["date"])
                else ""
            ),

        "rainfall_1d_mm":
            round(
                float(row["rainfall_1d_mm"]),
                2
            ),

        "rainfall_3d_mm":
            round(
                float(row["rainfall_3d_mm"]),
                2
            ),

        "rainfall_7d_mm":
            round(
                float(row["rainfall_7d_mm"]),
                2
            ),

        "rainfall_15d_mm":
            round(
                float(row["rainfall_15d_mm"]),
                2
            ),

        "risk_level":
            prediction["risk_level"],

        "risk_probability":
            prediction["risk_probability"]

    }


# ============================================================
# SUMMARY
# ============================================================

def get_risk_summary():

    data = get_all_district_risks()

    low = sum(
        1
        for item in data
        if item["risk_level"] == "LOW"
    )

    medium = sum(
        1
        for item in data
        if item["risk_level"] == "MEDIUM"
    )

    high = sum(
        1
        for item in data
        if item["risk_level"] == "HIGH"
    )

    return {

        "total_districts":
            len(data),

        "low_risk":
            low,

        "medium_risk":
            medium,

        "high_risk":
            high

    }