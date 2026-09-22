import os
import math
import io
import requests
import rasterio
from functools import lru_cache
from dotenv import load_dotenv

load_dotenv()

CLIENT_ID = os.getenv("COPERNICUS_CLIENT_ID")
CLIENT_SECRET = os.getenv("COPERNICUS_CLIENT_SECRET")

TOKEN_URL = "https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token"
PROCESS_URL = "https://sh.dataspace.copernicus.eu/api/v1/process"


def get_access_token():
    response = requests.post(
        TOKEN_URL,
        data={
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
        timeout=30,
    )
    if response.status_code != 200:
         print("Copernicus status:", response.status_code)
         print("Copernicus response:", response.text)
    response.raise_for_status()

    return response.json()["access_token"]


def get_dem_elevation(latitude, longitude):
    token = get_access_token()

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    evalscript = """
    //VERSION=3
    function setup() {
      return {
        input: ["DEM"],
        output: {
          id: "default",
          bands: 1,
          sampleType: SampleType.FLOAT32
        }
      }
    }

    function evaluatePixel(sample) {
      return [sample.DEM]
    }
    """

    payload = {
        "input": {
            "bounds": {
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                "bbox": [
                    longitude - 0.001,
                    latitude - 0.001,
                    longitude + 0.001,
                    latitude + 0.001,
                ],
            },
            "data": [
                {
                    "type": "dem",
                    "dataFilter": {
                        "demInstance": "COPERNICUS_90"
                    },
                    "processing": {
                        "upsampling": "BILINEAR",
                        "downsampling": "BILINEAR",
                    },
                }
            ],
        },
        "output": {
            "width": 3,
            "height": 3,
            "responses": [
                {
                    "identifier": "default",
                    "format": {
                        "type": "image/tiff"
                    },
                }
            ],
        },
        "evalscript": evalscript,
    }

    response = requests.post(
        "https://sh.dataspace.copernicus.eu/process/v1",
        headers=headers,
        json=payload,
        timeout=60,
    )

    if response.status_code != 200:
        print("DEM status:", response.status_code)
        print("DEM response:", response.text)

    response.raise_for_status()

    with rasterio.open(io.BytesIO(response.content)) as dataset:
        elevation_grid = dataset.read(1)

    return elevation_grid


def calculate_slope(elevation_grid, pixel_size_m=90):
    dz_dx = (
        elevation_grid[0][2]
        + 2 * elevation_grid[1][2]
        + elevation_grid[2][2]
        - elevation_grid[0][0]
        - 2 * elevation_grid[1][0]
        - elevation_grid[2][0]
    ) / (8 * pixel_size_m)

    dz_dy = (
        elevation_grid[2][0]
        + 2 * elevation_grid[2][1]
        + elevation_grid[2][2]
        - elevation_grid[0][0]
        - 2 * elevation_grid[0][1]
        - elevation_grid[0][2]
    ) / (8 * pixel_size_m)

    slope_radians = math.atan(math.sqrt(dz_dx**2 + dz_dy**2))

    return math.degrees(slope_radians)
@lru_cache(maxsize=100)
def get_terrain_data(latitude, longitude):
    elevation_grid = get_dem_elevation(latitude, longitude)

    elevation_m = float(elevation_grid[1][1])

    slope_degree = calculate_slope(
        elevation_grid.tolist()
    )

    return {
        "elevation_m": round(elevation_m, 2),
        "slope_degree": round(slope_degree, 2),
    }