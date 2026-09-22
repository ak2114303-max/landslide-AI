import os
import json
import pandas as pd
import osmnx as ox


# ==================================================
# NER CAPITAL CITY BOUNDING BOXES
# ==================================================

locations = {

    "Itanagar": {
        "north": 27.12,
        "south": 27.04,
        "east": 93.66,
        "west": 93.55
    },

    "Guwahati": {
        "north": 26.20,
        "south": 26.10,
        "east": 91.80,
        "west": 91.68
    },

    "Shillong": {
        "north": 25.65,
        "south": 25.53,
        "east": 91.96,
        "west": 91.82
    },

    "Imphal": {
        "north": 24.87,
        "south": 24.75,
        "east": 94.00,
        "west": 93.88
    },

    "Aizawl": {
        "north": 23.78,
        "south": 23.66,
        "east": 92.78,
        "west": 92.65
    },

    "Kohima": {
        "north": 25.73,
        "south": 25.62,
        "east": 94.18,
        "west": 94.02
    },

    "Gangtok": {
        "north": 27.40,
        "south": 27.27,
        "east": 88.68,
        "west": 88.52
    },

    "Agartala": {
        "north": 23.88,
        "south": 23.78,
        "east": 91.34,
        "west": 91.23
    }
}


# ==================================================
# SETTINGS
# ==================================================

MAX_ROADS_PER_LOCATION = 50

roads = []

road_id = 1


# ==================================================
# DOWNLOAD ROADS
# ==================================================

for location_name, bbox in locations.items():

    print()
    print("=" * 50)
    print(f"Loading OSM roads for {location_name}...")
    print("=" * 50)

    try:

        graph = ox.graph.graph_from_bbox(
            (
                bbox["west"],
                bbox["south"],
                bbox["east"],
                bbox["north"]
            ),
            network_type="drive"
        )

        print(
            f"{location_name}: "
            f"OSM graph downloaded"
        )

        edges = ox.convert.graph_to_gdfs(
            graph,
            nodes=False,
            edges=True
        )

        location_road_count = 0

        for _, row in edges.iterrows():

            # ------------------------------------------
            # Road name
            # ------------------------------------------

            name = row.get("name")

            if isinstance(name, list):

                if len(name) == 0:
                    continue

                name = name[0]

            if name is None:
                continue

            if pd.isna(name):
                continue

            # ------------------------------------------
            # Geometry
            # ------------------------------------------

            geometry = row.geometry

            if geometry is None:
                continue

            # ------------------------------------------
            # LineString
            # ------------------------------------------

            if geometry.geom_type == "LineString":

                coordinates = [
                    [lat, lon]
                    for lon, lat in geometry.coords
                ]

            # ------------------------------------------
            # MultiLineString
            # ------------------------------------------

            elif geometry.geom_type == "MultiLineString":

                coordinates = []

                for line in geometry.geoms:

                    coordinates.extend(
                        [
                            [lat, lon]
                            for lon, lat in line.coords
                        ]
                    )

            else:
                continue

            if len(coordinates) < 2:
                continue

            # ------------------------------------------
            # Save road
            # ------------------------------------------

            roads.append({

                "id": road_id,

                "name": str(name),

                "location": location_name,

                "status": "Open",

                "risk_level": "Unknown",

                "coordinates": coordinates
            })

            road_id += 1
            location_road_count += 1

            print(
                f"{location_name}: "
                f"Road {location_road_count} "
                f"-> {name}"
            )

            # ------------------------------------------
            # Limit roads
            # ------------------------------------------

            if (
                location_road_count
                >= MAX_ROADS_PER_LOCATION
            ):
                break

        print()
        print(
            f"{location_name}: "
            f"{location_road_count} roads saved"
        )

    except Exception as error:

        print()
        print(
            f"ERROR in {location_name}:"
        )

        print(error)


# ==================================================
# SAVE CACHE
# ==================================================

cache_file = os.path.join(
    os.path.dirname(__file__),
    "roads_cache.json"
)


with open(
    cache_file,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        roads,
        file,
        ensure_ascii=False
    )


# ==================================================
# FINAL RESULT
# ==================================================

print()
print("=" * 60)

print(
    f"TOTAL ROADS SAVED: {len(roads)}"
)

print(
    f"Cache file created:"
)

print(cache_file)

print("=" * 60)