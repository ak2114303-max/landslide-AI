import requests
import io
import numpy as np
import rasterio

from dem_data import get_access_token


token = get_access_token()

latitude = 27.0844
longitude = 93.6053

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
        input: ["B04", "B08"],
        output: {
            bands: 2,
            sampleType: SampleType.FLOAT32
        }
    };
}

function evaluatePixel(sample) {
    return [sample.B04, sample.B08];
}
"""

request_data = {
    "input": {
        "bounds": {
            "properties": {
                "crs": "http://www.opengis.net/def/crs/OGC/1.3/CRS84"
            },
            "bbox": bbox
        },
        "data": [
            {
                "type": "sentinel-2-l2a",
                "dataFilter": {
                    "timeRange": {
                        "from": "2025-08-25T00:00:00Z",
                        "to": "2025-08-26T00:00:00Z"
                    },
                   
                }
            }
        ]
    },
    "output": {
        "width": 10,
        "height": 10,
        "responses": [
            {
                "identifier": "default",
                "format": {
                    "type": "image/tiff"
                }
            }
        ]
    },
    "evalscript": evalscript
}

url = "https://sh.dataspace.copernicus.eu/process/v1"

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

response = requests.post(
    url,
    headers=headers,
    json=request_data,
    timeout=120
)

print("STATUS:", response.status_code)

if response.status_code == 200:

    with rasterio.open(io.BytesIO(response.content)) as dataset:

        red = dataset.read(1)
        nir = dataset.read(2)

        print("RED MIN:", float(np.min(red)))
        print("RED MAX:", float(np.max(red)))
        print("RED MEAN:", float(np.mean(red)))

        print("NIR MIN:", float(np.min(nir)))
        print("NIR MAX:", float(np.max(nir)))
        print("NIR MEAN:", float(np.mean(nir)))

else:
    print("REQUEST FAILED")
    print(response.text[:3000])