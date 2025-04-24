import json
import polars as pl
from geopy.distance import geodesic
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.utils.geocode_utils import transit_route_link


def core_filter(
    db: Session,
    dietary_needs: str,
    day: str,
    start_time: str,
    end_time: str,
    lat: float,
    lng: float,
    travel_ability: bool,
    relative_travel_ability: bool,
    kitchen_availability: bool,
) -> List[Dict[str, Any]]:
    reference_point = (lat, lng)

    if isinstance(dietary_needs, dict):
        dietary_lower = dietary_needs.get("original", "").strip().lower()
    else:
        dietary_lower = dietary_needs.strip().lower() if dietary_needs else ""

    day = day.strip().capitalize()
    target = "middle eastern/ north african"

    partner_df = pl.read_database(
        query="SELECT * FROM partners_hours", connection=db.bind
    )
    market_df = pl.read_database(
        query="SELECT * FROM markets_hours", connection=db.bind
    )
    partner_cultures_df = pl.read_database(
        query="SELECT * FROM partners_cultures", connection=db.bind
    )
    market_cultures_df = pl.read_database(
        query="SELECT * FROM markets_cultures", connection=db.bind
    )

    # Function to compute distance (modified for polars)
    def compute_distance(row):
        coordinates = row["coordinates"]
        if coordinates:
            try:
                coords = json.loads(str(coordinates))
                location = (coords.get("lat"), coords.get("lng"))
                return geodesic(reference_point, location).miles
            except (json.JSONDecodeError, TypeError):
                return None
        return None

    # Branch 1: travel_ability and relative_travel_ability are both false.
    if not travel_ability and not relative_travel_ability:
        # Filter partners with home delivery
        filtered_partners = partner_df.clone()
        print("Filtered Partners:", filtered_partners.head(3))

        # Filter for home delivery in distribution models
        filtered_partners = filtered_partners.filter(
            pl.col("Distribution Models")
            .fill_null("")
            .str.to_lowercase()
            .str.contains("home delivery")
        )

        if dietary_lower != "none":
            # Get halal partner IDs
            halal_partner_ids = (
                partner_cultures_df.filter(
                    pl.col("Cultural Populations Served")
                    .fill_null("")
                    .str.to_lowercase()
                    .str.contains(target)
                )
                .select("Agency ID")
                .unique()
                .to_series()
                .to_list()
            )

            filtered_partners = filtered_partners.filter(
                pl.col("External ID").is_in(halal_partner_ids)
            )

        # Apply distance calculation (need to handle this differently with polars)
        # Using with_columns to apply the function to each row
        filtered_partners = filtered_partners.with_columns(
            pl.struct(["coordinates"])
            .map_elements(compute_distance, return_dtype=pl.Float64)
            .alias("distance")
        )

        # Drop rows with null distance and sort
        filtered_partners = filtered_partners.filter(pl.col("distance").is_not_null())
        filtered_partners = filtered_partners.sort("distance").head(3)

        return filtered_partners.to_dicts()
    # Branch 2: At least one of travel_ability or relative_travel_ability is true
    else:
        if not kitchen_availability:
            # Filter partners by day and time
            partner_filtered = partner_df.filter(
                (pl.col("Day of Week") == day)
                & (
                    (pl.col("Starting Time") <= end_time)
                    | (pl.col("Ending Time") >= start_time)
                )
            )

            if dietary_lower != "none":
                # Get halal partner IDs
                halal_partner_ids = (
                    partner_cultures_df.filter(
                        pl.col("Cultural Populations Served")
                        .fill_null("")
                        .str.to_lowercase()
                        .str.contains(target)
                    )
                    .select("Agency ID")
                    .unique()
                    .to_series()
                    .to_list()
                )

                partner_filtered = partner_filtered.filter(
                    pl.col("External ID").is_in(halal_partner_ids)
                )

            # Check for prepared meals
            partner_filtered = partner_filtered.filter(
                pl.col("Food Format ")
                .fill_null("")
                .str.to_lowercase()
                .str.contains("prepared")
            )

            # Calculate distances
            partner_filtered = partner_filtered.with_columns(
                pl.struct(["coordinates"])
                .map_elements(compute_distance, return_dtype=pl.Float64)
                .alias("distance")
            )

            # Filter, sort and return
            partner_filtered = partner_filtered.filter(pl.col("distance").is_not_null())
            partner_filtered = partner_filtered.sort("distance").head(10)

            return partner_filtered.to_dicts()
        else:
            # Use both MarketHours and PartnerHours records
            market_filtered = market_df.filter(
                (pl.col("Day of Week") == day)
                & (
                    (pl.col("Starting Time") <= end_time)
                    | (pl.col("Ending Time") >= start_time)
                )
            )

            partner_filtered = partner_df.filter(
                (pl.col("Day of Week") == day)
                & (
                    (pl.col("Starting Time") <= end_time)
                    | (pl.col("Ending Time") >= start_time)
                )
            )

            if dietary_lower != "none":
                # Get halal market and partner IDs
                halal_market_ids = (
                    market_cultures_df.filter(
                        pl.col("Cultural Populations Served")
                        .fill_null("")
                        .str.to_lowercase()
                        .str.contains(target)
                    )
                    .select("Agency ID")
                    .unique()
                    .to_series()
                    .to_list()
                )

                halal_partner_ids = (
                    partner_cultures_df.filter(
                        pl.col("Cultural Populations Served")
                        .fill_null("")
                        .str.to_lowercase()
                        .str.contains(target)
                    )
                    .select("Agency ID")
                    .unique()
                    .to_series()
                    .to_list()
                )

                market_filtered = market_filtered.filter(
                    pl.col("Agency ID").is_in(halal_market_ids)
                )
                partner_filtered = partner_filtered.filter(
                    pl.col("External ID").is_in(halal_partner_ids)
                )

            market_filtered = market_filtered.with_columns(
                pl.struct(["coordinates"])
                .map_elements(compute_distance, return_dtype=pl.Float64)
                .alias("distance")
            )
            partner_filtered = partner_filtered.with_columns(
                pl.struct(["coordinates"])
                .map_elements(compute_distance, return_dtype=pl.Float64)
                .alias("distance")
            )

            market_filtered = market_filtered.filter(pl.col("distance").is_not_null())
            partner_filtered = partner_filtered.filter(pl.col("distance").is_not_null())

            market_list = (
                market_filtered.to_dicts() if not market_filtered.is_empty() else []
            )
            partner_list = (
                partner_filtered.to_dicts() if not partner_filtered.is_empty() else []
            )

            combined_list = market_list + partner_list
            combined_list.sort(key=lambda x: x.get("distance", float("inf")))

            combined_list = combined_list[:3]

            for item in combined_list:
                if item.get("coordinates"):
                    try:
                        coords = json.loads(str(item["coordinates"]))
                        dest = (coords.get("lat"), coords.get("lng"))
                        item["route"] = transit_route_link(reference_point, dest)
                    except (json.JSONDecodeError, TypeError, ValueError):
                        item["route"] = None

            return combined_list
