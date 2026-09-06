import pandas as pd
import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from xgboost import XGBRegressor


# ========================================
# Load Dataset
# ========================================

data = pd.read_csv("landslide_dataset.csv")

features = [
    "rainfall_mm",
    "soil_moisture",
    "slope_degree",
    "elevation_m",
    "temperature_c",
]

target = "risk_score"

X = data[features]
y = data[target]


# ========================================
# Train / Test Split
# ========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
)


# ========================================
# Models
# ========================================

models = {
    "Random Forest": RandomForestRegressor(
        n_estimators=200,
        random_state=42,
    ),

    "Gradient Boosting": GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        random_state=42,
    ),

    "XGBoost": XGBRegressor(
        n_estimators=100,
        learning_rate=0.05,
        max_depth=3,
        objective="reg:squarederror",
        random_state=42,
    ),
}


# ========================================
# Cross Validation
# ========================================

cv = KFold(
    n_splits=5,
    shuffle=True,
    random_state=42,
)


results = {}


print()
print("========================================")
print("LandslideAI Model Comparison")
print("========================================")


for name, model in models.items():

    # Train model
    model.fit(X_train, y_train)

    # Test prediction
    predictions = model.predict(X_test)

    # Evaluation metrics
    mae = mean_absolute_error(y_test, predictions)

    rmse = np.sqrt(
        mean_squared_error(y_test, predictions)
    )

    test_r2 = r2_score(y_test, predictions)

    # Cross-validation
    cv_scores = cross_val_score(
        model,
        X,
        y,
        cv=cv,
        scoring="r2",
    )

    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()

    results[name] = {
        "model": model,
        "mae": mae,
        "rmse": rmse,
        "test_r2": test_r2,
        "cv_mean": cv_mean,
        "cv_std": cv_std,
    }

    print()
    print(name)
    print("----------------------------")
    print(f"MAE: {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"Test R²: {test_r2:.4f}")
    print(f"Cross-validation R²: {cv_mean:.4f}")
    print(f"CV Standard Deviation: {cv_std:.4f}")


# ========================================
# Select Best Model
# ========================================

best_model_name = max(
    results,
    key=lambda name: results[name]["cv_mean"],
)

best_model = results[best_model_name]["model"]


print()
print("========================================")
print("Best Model")
print("========================================")

print(f"Selected model: {best_model_name}")

print(
    f"Cross-validation R²: "
    f"{results[best_model_name]['cv_mean']:.6f}"
)

print(
    f"CV Standard Deviation: "
    f"{results[best_model_name]['cv_std']:.6f}"
)


# ========================================
# Feature Importance
# ========================================

print()
print("Feature Importance:")
print("----------------------------")

if hasattr(best_model, "feature_importances_"):

    importances = best_model.feature_importances_

    for feature, importance in zip(features, importances):
        print(
            f"{feature}: "
            f"{importance * 100:.2f}%"
        )


# ========================================
# Save Best Model
# ========================================

joblib.dump(
    best_model,
    "landslide_model.pkl",
)


print()
print("Best model saved as landslide_model.pkl")
print("========================================")
print()