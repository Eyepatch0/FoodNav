import time
import json
import os
from typing import Optional, Tuple

from dotenv import load_dotenv
from googlemaps import Client
from googlemaps.exceptions import Timeout, ApiError

load_dotenv()
gmaps = Client(key=os.environ.get("GOOGLE_MAPS_API_KEY"))


def geocode_address(
    address: str, max_retries: int = 3, delay: float = 1.0
) -> Tuple[Optional[float], Optional[float]]:
    retries = 0
    while retries <= max_retries:
        try:
            result = gmaps.geocode(address)
            if result and len(result) > 0:
                location = result[0].get("geometry", {}).get("location", {})
                lat = location.get("lat")
                lng = location.get("lng")
                if lat is not None and lng is not None:
                    return lat, lng
            return None, None
        except (Timeout, ApiError):
            if retries == max_retries:
                return None, None
            retries += 1
            time.sleep(delay)
    return None, None


def add_coordinates_to_tables(dataframes: dict) -> dict:
    tables_to_process = {
        "markets_hours": "Shipping Address",
        "partners_hours": "Shipping Address",
    }

    for table_name, address_column in tables_to_process.items():
        if table_name in dataframes:
            df = dataframes[table_name]
            if address_column in df.columns:
                print(f"Processing geocoding for {table_name}...")

                df["coordinates"] = None

                for idx, row in df.iterrows():
                    address = row[address_column]
                    if address and isinstance(address, str):
                        lat, lng = geocode_address(address)
                        if lat is not None and lng is not None:
                            df.at[idx, "coordinates"] = json.dumps(
                                {"lat": lat, "lng": lng}
                            )
                            print(f"Geocoded {address}: ({lat}, {lng})")
                        else:
                            print(f"Could not geocode address: {address}")

                    time.sleep(1.5)  # Rate limit

                dataframes[table_name] = df
            else:
                print(
                    f"Warning: Column '{address_column}' not found in table '{table_name}'"
                )

    return dataframes
