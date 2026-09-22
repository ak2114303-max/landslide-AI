# NER LandslideAI Master Dataset

`ner_landslide_master_dataset.csv` is the initial master dataset for model development. It is based on the user-provided, cleaned GSI NER landslide inventory containing 6,554 historical landslide records.

## Preserved source fields

`sl_no`, `slide_no`, `state`, `district`, `slide_name`, `nh_sh_location`, `latitude`, `longitude`, `material_involved`, `movement_type`, and `history` are preserved from the cleaned inventory.

## Environmental enrichment policy

Environmental measurement cells are intentionally blank until a verified source is joined at the event location and relevant date.

| Field group | Intended source | Current status |
| --- | --- | --- |
| Rainfall | India Meteorological Department (IMD) | `PENDING_IMD_DATA` |
| Elevation and slope | Survey of India DEM | `PENDING_SOI_DEM` |
| Soil moisture | Official Indian source with full NER coverage | `SOURCE_REQUIRED_OFFICIAL_NER_COVERAGE` |
| Temperature | India Meteorological Department (IMD) | `PENDING_IMD_DATA` |
| NDVI | ISRO Resourcesat LISS-III | `PENDING_LISS3_DATA` |

`data_status` remains `PENDING_ENVIRONMENTAL_ENRICHMENT` for every record. No environmental values, risk scores, or labels were synthesized during this preparation step.

This file is not yet suitable for ML training. It contains landslide-event records only and still requires verified environmental enrichment and scientifically defensible non-landslide/background samples.
