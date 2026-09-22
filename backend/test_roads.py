import osmnx as ox
import pandas as pd

north = 27.15
south = 27.00
east = 93.70
west = 93.50

print("Downloading real road network...")

graph = ox.graph.graph_from_bbox(
    (west, south, east, north),
    network_type="drive"
)

edges = ox.convert.graph_to_gdfs(
    graph,
    nodes=False,
    edges=True
)

print("DOWNLOAD SUCCESS")
print("Total road segments:", len(edges))

print("\nFIRST 10 NAMED ROADS:\n")

count = 0

for _, row in edges.iterrows():

    name = row.get("name")

    if pd.isna(name):
        continue

    if isinstance(name, list):
        name = name[0]

    geometry = row.geometry

    if geometry is None:
        continue

    coordinates = [
        [lat, lon]
        for lon, lat in geometry.coords
    ]

    print({
        "name": name,
        "coordinates": coordinates[:3]
    })

    count += 1

    if count == 10:
        break

print("\nNamed roads found:", count)