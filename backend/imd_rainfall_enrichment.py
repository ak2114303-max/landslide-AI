"""Enrich LandslideAI's master inventory with verified IMD gridded rainfall.

This script never downloads, simulates, or estimates rainfall. It only reads
official IMD 0.25 degree daily rainfall NetCDF files already placed in the
directory supplied with --imd-dir. It writes a new CSV by default so the
unmodified master inventory remains recoverable.
"""

from __future__ import annotations

import argparse
import re
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_INPUT = BASE_DIR / "ner_landslide_master_dataset.csv"
DEFAULT_IMD_DIR = BASE_DIR / "data" / "imd_rainfall"
DEFAULT_OUTPUT = BASE_DIR / "ner_landslide_master_dataset_imd_enriched.csv"
IMD_SOURCE = "IMD 0.25 degree daily gridded rainfall NetCDF"
IMD_SOURCE_URL = "https://imdpune.gov.in/cmpg/Griddata/Rainfall_25_NetCDF.html"


def find_name(names: list[str], choices: tuple[str, ...], label: str) -> str:
    normalized = {name.casefold(): name for name in names}
    for choice in choices:
        if choice in normalized:
            return normalized[choice]
    raise ValueError(f"Could not identify {label}. Available names: {names}")


def inspect_imd_file(file_path: Path) -> dict[str, object]:
    dataset = xr.open_dataset(file_path)
    try:
        time_name = find_name(list(dataset.coords) + list(dataset.dims), ("time", "date", "dates"), "time coordinate")
        lat_name = find_name(list(dataset.coords) + list(dataset.dims), ("lat", "latitude", "lats", "y"), "latitude coordinate")
        lon_name = find_name(list(dataset.coords) + list(dataset.dims), ("lon", "longitude", "lons", "x"), "longitude coordinate")

        candidates = [
            variable_name
            for variable_name, variable in dataset.data_vars.items()
            if time_name in variable.dims and lat_name in variable.dims and lon_name in variable.dims
        ]
        if len(candidates) != 1:
            raise ValueError(
                "Expected exactly one rainfall variable using time/latitude/longitude dimensions; "
                f"found {candidates}."
            )

        times = pd.to_datetime(dataset[time_name].values, errors="coerce")
        if times.isna().any():
            raise ValueError("The IMD time coordinate contains unreadable dates.")

        return {
            "dataset": dataset,
            "time_name": time_name,
            "lat_name": lat_name,
            "lon_name": lon_name,
            "rainfall_name": candidates[0],
            "dates": {timestamp.date().isoformat() for timestamp in times},
        }
    except Exception:
        dataset.close()
        raise


def make_file_index(imd_dir: Path) -> dict[int, list[Path]]:
    files = sorted(imd_dir.glob("*.nc"))
    index: dict[int, list[Path]] = {}
    for file_path in files:
        years = {int(value) for value in re.findall(r"(?<!\d)((?:19|20)\d{2})(?!\d)", file_path.name)}
        for year in years:
            index.setdefault(year, []).append(file_path)
    return index


def set_pending_status(row: pd.Series, status: str) -> pd.Series:
    row["rainfall_mm"] = pd.NA
    row["rainfall_date"] = pd.NA
    row["rainfall_source"] = "IMD"
    row["rainfall_status"] = status
    row["rainfall_file"] = pd.NA
    row["rainfall_grid_latitude"] = pd.NA
    row["rainfall_grid_longitude"] = pd.NA
    row["rainfall_spatial_method"] = pd.NA
    return row


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--imd-dir", type=Path, default=DEFAULT_IMD_DIR)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    arguments = parser.parse_args()

    data = pd.read_csv(arguments.input, dtype={"event_date": "string"})
    required_columns = {"latitude", "longitude", "event_date", "date_status", "rainfall_mm", "rainfall_status"}
    missing_columns = required_columns.difference(data.columns)
    if missing_columns:
        raise ValueError(f"Input is missing required columns: {sorted(missing_columns)}")

    for column in ("rainfall_file", "rainfall_grid_latitude", "rainfall_grid_longitude", "rainfall_spatial_method"):
        if column not in data.columns:
            data[column] = pd.NA

    file_index = make_file_index(arguments.imd_dir)
    opened_files: dict[Path, dict[str, object]] = {}
    completed = 0
    pending = 0

    try:
        for index, row in data.iterrows():
            if row["date_status"] != "DATE_EXACT" or pd.isna(row["event_date"]):
                data.loc[index] = set_pending_status(row.copy(), "PENDING_EVENT_DATE")
                pending += 1
                continue

            event_date = str(row["event_date"])
            event_year = int(event_date[:4])
            candidate_files = file_index.get(event_year, [])
            if not candidate_files:
                data.loc[index] = set_pending_status(row.copy(), "PENDING_IMD_FILE_NOT_AVAILABLE")
                pending += 1
                continue

            selected_file = None
            metadata = None
            for candidate_file in candidate_files:
                if candidate_file not in opened_files:
                    opened_files[candidate_file] = inspect_imd_file(candidate_file)
                candidate_metadata = opened_files[candidate_file]
                if event_date in candidate_metadata["dates"]:
                    selected_file = candidate_file
                    metadata = candidate_metadata
                    break

            if selected_file is None or metadata is None:
                data.loc[index] = set_pending_status(row.copy(), "PENDING_IMD_DATE_NOT_IN_FILE")
                pending += 1
                continue

            dataset = metadata["dataset"]
            time_name = str(metadata["time_name"])
            lat_name = str(metadata["lat_name"])
            lon_name = str(metadata["lon_name"])
            rainfall_name = str(metadata["rainfall_name"])
            sample = dataset[rainfall_name].sel({time_name: np.datetime64(event_date)})
            sample = sample.sel(
                {lat_name: float(row["latitude"]), lon_name: float(row["longitude"])},
                method="nearest",
            )
            rainfall_value = float(np.asarray(sample.values).squeeze())

            if not np.isfinite(rainfall_value) or rainfall_value < 0:
                data.loc[index] = set_pending_status(row.copy(), "PENDING_IMD_VALUE_INVALID")
                pending += 1
                continue

            data.at[index, "rainfall_mm"] = rainfall_value
            data.at[index, "rainfall_date"] = event_date
            data.at[index, "rainfall_source"] = IMD_SOURCE
            data.at[index, "rainfall_status"] = "VERIFIED_IMD_GRIDDED_RAINFALL"
            data.at[index, "rainfall_file"] = selected_file.name
            data.at[index, "rainfall_grid_latitude"] = float(sample[lat_name].values)
            data.at[index, "rainfall_grid_longitude"] = float(sample[lon_name].values)
            data.at[index, "rainfall_spatial_method"] = "NEAREST_IMD_0.25_DEGREE_GRID"
            completed += 1
    finally:
        for metadata in opened_files.values():
            metadata["dataset"].close()

    arguments.output.parent.mkdir(parents=True, exist_ok=True)
    data.to_csv(arguments.output, index=False)
    print(f"Output: {arguments.output}")
    print(f"Verified IMD rainfall rows: {completed}")
    print(f"Pending rainfall rows: {pending}")
    print(f"Generated at: {datetime.now(timezone.utc).isoformat()}")
    print(f"Source landing page: {IMD_SOURCE_URL}")


if __name__ == "__main__":
    main()
