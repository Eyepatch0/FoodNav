from datetime import datetime
from typing import Dict, Any


def get_location_string(data: Dict[str, Any]) -> str:
    location_data = data.get("location", {})
    if location_data:
        street_number = location_data.get("street-number", "")
        route = location_data.get("route", "")
        city = location_data.get("city", "")
        zip_code = location_data.get("zip-code", "")
        return ", ".join(
            filter(
                None,
                [
                    f"{street_number} {route}".strip()
                    if street_number or route
                    else "",
                    city,
                    zip_code,
                ],
            )
        )
    return "Location not provided"


def get_preferred_date(data) -> str:
    preferred_day = data.get("day", "")
    if preferred_day == "today":
        date_obj = datetime.now()
        day_name = date_obj.strftime("%A")
        return day_name
    else:
        other_preferred_day = data.get("specific_day", "")
        # Handle Dialogflow template expressions
        if "$" in other_preferred_day:
            # If it contains template variables, default to today
            date_obj = datetime.now()
            day_name = date_obj.strftime("%A")
            return day_name
        elif "||" in other_preferred_day:
            parts = other_preferred_day.split("||")
            date_str = parts[0].strip()
            try:
                date_obj = datetime.strptime(date_str, "%Y-%m-%d")
                day_name = date_obj.strftime("%A")
                return day_name
            except ValueError:
                # If parsing fails, default to today
                date_obj = datetime.now()
                day_name = date_obj.strftime("%A")
                return day_name
        else:
            try:
                date_obj = datetime.strptime(other_preferred_day, "%Y-%m-%d")
                day_name = date_obj.strftime("%A")
                return day_name
            except ValueError:
                return "Invalid date"


def get_time_range(data):
    time_data = data.get("time", {})
    if not time_data:
        return "Not specified", "Not specified"

    start_time_data = time_data.get("startTime", {})
    start_hours = int(start_time_data.get("hours", 0))
    start_minutes = int(start_time_data.get("minutes", 0))

    end_time_data = time_data.get("endTime", {})
    end_hours = int(end_time_data.get("hours", 0))
    end_minutes = int(end_time_data.get("minutes", 0))

    start_period = "AM" if start_hours < 12 else "PM"
    start_12h = start_hours % 12
    if start_12h == 0:
        start_12h = 12
    start_time_str = f"{start_12h}:{start_minutes:02d} {start_period}"

    end_period = "AM" if end_hours < 12 else "PM"
    end_12h = end_hours % 12
    if end_12h == 0:
        end_12h = 12
    end_time_str = f"{end_12h}:{end_minutes:02d} {end_period}"

    return start_time_str, end_time_str


def process_dietary_needs(dietary_needs):
    """Process dietary needs to return a string that can be used by core_filter."""
    if isinstance(dietary_needs, dict):
        return dietary_needs.get("original", "").strip()
    else:
        return dietary_needs.strip() if dietary_needs else ""


def process_boolean_value(value):
    """Convert string boolean values to actual booleans."""
    if isinstance(value, str):
        return value.lower() == "true"
    return bool(value)
