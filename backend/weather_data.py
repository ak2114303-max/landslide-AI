import json
import os
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEATHER_CACHE_FILE = os.path.join(BASE_DIR, "weather_cache.json")

# NER locations
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


def load_weather_cache():
    """Load locally stored weather data."""

    if not os.path.exists(WEATHER_CACHE_FILE):
        return {}

    try:
        with open(WEATHER_CACHE_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    except Exception:
        return {}


def get_weather_data(latitude, longitude, date=None):
    """
    Return locally cached historical/demo weather data.

    No external API call is made during normal website usage.
    """

    cache = load_weather_cache()

    location_name = None

    for name, location in WEATHER_LOCATIONS.items():
        if (
            abs(location["latitude"] - latitude) < 0.01
            and abs(location["longitude"] - longitude) < 0.01
        ):
            location_name = name
            break

    if location_name and location_name in cache:
        data = cache[location_name]

        return {
            "rainfall_mm": data["rainfall_mm"],
            "temperature_c": data["temperature_c"],
            "source": data.get(
                "source",
                "Copernicus ERA5-Land Historical Demo Data"
            ),
            "date": data.get("date", "2025-08-01"),
            "status": "cached",
        }

    # Safe fallback
    return {
        "rainfall_mm": 0.0,
        "temperature_c": 25.0,
        "source": "Local Demo Data",
        "date": "2025-08-01",
        "status": "fallback",
    }