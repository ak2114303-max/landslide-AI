import os
import joblib
import numpy as np
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report


# ============================================================
# 1. PROJECT PATH
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


# ============================================================
# 2. FIND RAINFALL DATASET
# ============================================================

possible_files = [
    os.path.join(
        BASE_DIR,
        "data",
        "imd_rainfall",
        "processed",
        "ner_rainfall_features.csv"
    ),
    os.path.join(
        BASE_DIR,
        "data",
        "imd_rainfall",
        "processed",
        "ner_rainfall_features.csv.csv"
    )
]

DATA_FILE = None

for file in possible_files:
    if os.path.exists(file):
        DATA_FILE = file
        break

if DATA_FILE is None:
    raise FileNotFoundError(
        "\nERROR: ner_rainfall_features.csv not found.\n"
        "Please check:\n"
        "backend/data/imd_rainfall/processed/\n"
    )

print("=" * 60)
print("LANDSLIDE AI - MODEL TRAINING")
print("=" * 60)

print("\nUsing dataset:")
print(DATA_FILE)


# ============================================================
# 3. LOAD DATA
# ============================================================

df = pd.read_csv(DATA_FILE)

print("\nDataset shape:", df.shape)

print("\nOriginal columns:")
print(df.columns.tolist())


# ============================================================
# 4. CLEAN COLUMN NAMES
# ============================================================

df.columns = (
    df.columns
    .str.strip()
    .str.lower()
    .str.replace(" ", "_")
)

print("\nCleaned columns:")
print(df.columns.tolist())


# ============================================================
# 5. FIND RAINFALL COLUMNS
# ============================================================

def find_column(possible_names):

    for name in possible_names:
        if name in df.columns:
            return name

    return None


rain1 = find_column([
    "rainfall_1d_mm",
    "rainfall_1d",
    "rainfall_1_day_mm",
    "rainfall_1_day",
    "rain_1d"
])

rain3 = find_column([
    "rainfall_3d_mm",
    "rainfall_3d",
    "rainfall_3_day_mm",
    "rainfall_3_day",
    "rain_3d"
])

rain7 = find_column([
    "rainfall_7d_mm",
    "rainfall_7d",
    "rainfall_7_day_mm",
    "rainfall_7_day",
    "rain_7d"
])

rain15 = find_column([
    "rainfall_15d_mm",
    "rainfall_15d",
    "rainfall_15_day_mm",
    "rainfall_15_day",
    "rain_15d"
])


print("\nDetected rainfall columns:")

print("1 Day  :", rain1)
print("3 Days :", rain3)
print("7 Days :", rain7)
print("15 Days:", rain15)


# ============================================================
# 6. CHECK REQUIRED COLUMNS
# ============================================================

required_rainfall = [
    rain1,
    rain3,
    rain7,
    rain15
]

if any(col is None for col in required_rainfall):

    raise ValueError(
        "\nRequired rainfall columns were not found.\n\n"
        f"Available columns:\n{df.columns.tolist()}"
    )


# ============================================================
# 7. CLEAN RAINFALL DATA
# ============================================================

for col in required_rainfall:

    df[col] = pd.to_numeric(
        df[col],
        errors="coerce"
    )

    df[col] = df[col].fillna(0)


# ============================================================
# 8. DATE CLEANING
# ============================================================

if "date" in df.columns:

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )


# ============================================================
# 9. PROTOTYPE ENVIRONMENT FEATURES
# ============================================================

# IMPORTANT:
# These features are prototype-derived/simulated.
# They should be replaced with verified real datasets
# when available.

rng = np.random.default_rng(42)


# Elevation in meters
df["elevation"] = rng.uniform(
    50,
    2500,
    len(df)
)


# Slope in degrees
df["slope"] = rng.uniform(
    5,
    45,
    len(df)
)


# Soil moisture proxy
df["soil_moisture"] = np.clip(
    0.25
    +
    (
        df[rain7]
        /
        (df[rain7].max() + 1)
    )
    * 0.65,
    0,
    1
)


# Temperature proxy
df["temperature"] = rng.uniform(
    15,
    32,
    len(df)
)


# NDVI proxy
df["ndvi"] = rng.uniform(
    0.25,
    0.85,
    len(df)
)


# ============================================================
# 10. RAINFALL INTENSITY SCORE
# ============================================================

df["rainfall_score"] = (
    df[rain1] * 0.35
    +
    df[rain3] * 0.25
    +
    df[rain7] * 0.25
    +
    df[rain15] * 0.15
)


# ============================================================
# 11. NORMALIZE RAINFALL
# ============================================================

rainfall_95 = df["rainfall_score"].quantile(
    0.95
)

rain_norm = (
    df["rainfall_score"]
    /
    (rainfall_95 + 1e-6)
)

rain_norm = rain_norm.clip(
    0,
    1
)


# ============================================================
# 12. NORMALIZE SLOPE
# ============================================================

slope_norm = (
    df["slope"] / 45
)

slope_norm = slope_norm.clip(
    0,
    1
)


# ============================================================
# 13. RISK SCORE
# ============================================================

df["risk_score"] = (
    rain_norm * 0.60
    +
    slope_norm * 0.20
    +
    df["soil_moisture"] * 0.20
)


# ============================================================
# 14. CREATE RISK LABEL
# ============================================================

def assign_risk(score):

    if score < 0.40:

        return 0       # LOW

    elif score < 0.70:

        return 1       # MEDIUM

    else:

        return 2       # HIGH


df["risk_label"] = (
    df["risk_score"]
    .apply(assign_risk)
)


# ============================================================
# 15. RISK NAME
# ============================================================

df["risk"] = (
    df["risk_label"]
    .map({
        0: "LOW",
        1: "MEDIUM",
        2: "HIGH"
    })
)


# ============================================================
# 16. ML FEATURES
# ============================================================

features = [

    rain1,
    rain3,
    rain7,
    rain15,

    "elevation",
    "slope",
    "soil_moisture",
    "temperature",
    "ndvi"
]


print("\nML Features:")

for feature in features:
    print(" -", feature)


# ============================================================
# 17. CREATE X AND Y
# ============================================================

X = df[features]

y = df["risk_label"]


# ============================================================
# 18. REMOVE INVALID VALUES
# ============================================================

X = X.replace(
    [np.inf, -np.inf],
    np.nan
)

X = X.fillna(0)

y = y.fillna(0)


# ============================================================
# 19. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(

    X,
    y,

    test_size=0.20,

    random_state=42,

    stratify=y
)


print("\nTraining samples:", len(X_train))
print("Testing samples :", len(X_test))


# ============================================================
# 20. RANDOM FOREST MODEL
# ============================================================

model = RandomForestClassifier(

    n_estimators=200,

    max_depth=12,

    random_state=42,

    class_weight="balanced",

    n_jobs=-1
)


print("\nTraining Random Forest...")

model.fit(
    X_train,
    y_train
)


print("Training completed.")


# ============================================================
# 21. MODEL PREDICTION
# ============================================================

predictions = model.predict(
    X_test
)


# ============================================================
# 22. MODEL EVALUATION
# ============================================================

print("\n")
print("=" * 60)
print("MODEL EVALUATION")
print("=" * 60)

print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "LOW",
            "MEDIUM",
            "HIGH"
        ],
        zero_division=0
    )
)


# ============================================================
# 23. MODEL PROBABILITY TEST
# ============================================================

probabilities = model.predict_proba(
    X_test
)

print("\nExample prediction probabilities:")

for i in range(
    min(5, len(probabilities))
):

    print(
        probabilities[i]
    )


# ============================================================
# 24. SAVE MODEL
# ============================================================

MODEL_FILE = os.path.join(

    BASE_DIR,

    "landslide_model.pkl"
)


model_package = {

    "model": model,

    "features": features,

    "risk_classes": {

        0: "LOW",

        1: "MEDIUM",

        2: "HIGH"

    }

}


joblib.dump(

    model_package,

    MODEL_FILE

)


print("\nModel saved at:")

print(MODEL_FILE)


# ============================================================
# 25. SAVE ML DATASET
# ============================================================

OUTPUT_DIR = os.path.join(

    BASE_DIR,

    "data",

    "imd_rainfall",

    "merged"

)


os.makedirs(

    OUTPUT_DIR,

    exist_ok=True

)


OUTPUT_FILE = os.path.join(

    OUTPUT_DIR,

    "ner_landslide_ml_dataset.csv"

)


df.to_csv(

    OUTPUT_FILE,

    index=False

)


print("\nML dataset saved at:")

print(OUTPUT_FILE)


# ============================================================
# 26. RISK DISTRIBUTION
# ============================================================

print("\n")
print("=" * 60)
print("RISK DISTRIBUTION")
print("=" * 60)

risk_distribution = (

    df["risk"]
    .value_counts()
)


print(
    risk_distribution
)


# ============================================================
# 27. FINAL SUMMARY
# ============================================================

print("\n")
print("=" * 60)
print("MODEL TRAINING COMPLETED SUCCESSFULLY")
print("=" * 60)

print(
    "\nTotal records:",
    len(df)
)

print(
    "Features:",
    len(features)
)

print(
    "Random Forest trees:",
    200
)

print(
    "\nRisk classes:"
)

print("0 = LOW")
print("1 = MEDIUM")
print("2 = HIGH")

print(
    "\nNext step:"
)

print(
    "Connect Random Forest model with FastAPI backend."
)

print(
    "\nNOTE:"
)

print(
    "Terrain/environment features are prototype-derived."
)