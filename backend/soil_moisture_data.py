import requests
from datetime import datetime


def get_soil_moisture(latitude, longitude, date=None):
    """
    Get soil moisture from Copernicus ERA5-Land.
    """

    if date is None:
        date = datetime(2025, 8, 1)

    url = "https://archive-api.open-meteo.com/v1/archive"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": "soil_moisture_0_to_7cm",
        "start_date": date.strftime("%Y-%m-%d"),
        "end_date": date.strftime("%Y-%m-%d"),
        "timezone": "UTC",
    }

    response = requests.get(
        url,
        params=params,
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

    soil_moisture_values = data.get("hourly", {}).get(
        "soil_moisture_0_to_7cm",
        []
    )

    if not soil_moisture_values:
        raise ValueError("Soil moisture data not available")

    valid_values = [
        value
        for value in soil_moisture_values
        if value is not None
    ]

    if not valid_values:
        raise ValueError("No valid soil moisture values found")

    average_soil_moisture = sum(valid_values) / len(valid_values)

    return round(float(average_soil_moisture), 4)