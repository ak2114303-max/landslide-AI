import io

import numpy as np
import rasterio
import requests
from dotenv import load_dotenv

from dem_data import get_access_token


load_dotenv()


def get_ndvi(latitude: float, longitude: float):

    token = get_access_token()

    bbox = [
        longitude - 0.01,
        latitude - 0.01,
        longitude + 0.01,
        latitude + 0.01,
    ]

    evalscript = """
    //VERSION=3

    function setup() {
        return {
            input: [
                {
                    bands: ["B04", "B08"],
                    units: "REFLECTANCE"
                }
            ],
            output: {
                bands: 1,
                sampleType: SampleType.FLOAT32
            }
        };
    }

    function evaluatePixel(sample) {

        let denominator = sample.B08 + sample.B04;

        if (denominator <= 0) {
            return [NaN];
        }

        return [
            (sample.B08 - sample.B04) / denominator
        ];
    }
    """

    request_data = {
        "input": {
            "bounds": {
                "properties": {
                    "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
                },
                "bbox": bbox,
            },
            "data": [
                {
                    "type": "sentinel-2-l2a",
                    "dataFilter": {
                        "timeRange": {
                            "from": "2025-08-25T00:00:00Z",
                            "to": "2025-08-26T00:00:00Z",
                        }
                    }
                }
            ],
        },
        "output": {
            "width": 10,
            "height": 10,
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

    url = "https://sh.dataspace.copernicus.eu/process/v1"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        url,
        headers=headers,
        json=request_data,
        timeout=120,
    )

    response.raise_for_status()

    with rasterio.open(io.BytesIO(response.content)) as dataset:

        ndvi_data = dataset.read(1)

        valid_values = ndvi_data[
            np.isfinite(ndvi_data)
        ]

        if len(valid_values) == 0:
            raise ValueError("No valid NDVI values returned")

        ndvi_mean = float(np.mean(valid_values))

    return {
        "latitude": latitude,
        "longitude": longitude,
        "ndvi": round(ndvi_mean, 4),
        "source": "Sentinel-2 L2A",
        "date": "2025-08-25",
        "status": "success",
    }