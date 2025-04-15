from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import get_db
import traceback
import polars as pl

from .utils.extract_utils import (
    get_location_string,
    get_preferred_date,
    get_time_range,
    process_boolean_value,
    process_dietary_needs,
)
from .utils.geocode_utils import geocode_address
from .utils.core_logic import core_filter

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Welcome to the Food Nav API!"}


@app.get("/resources")
async def get_resources(db: Session = Depends(get_db)):
    try:
        market_hours = pl.read_database(
            query="SELECT * FROM markets_hours", connection=db.bind
        ).to_dicts()

        partner_hours = pl.read_database(
            query="SELECT * FROM partners_hours", connection=db.bind
        ).to_dicts()

        return {
            "status": "success",
            "market_hours": market_hours,
            "partner_hours": partner_hours,
        }

    except Exception as e:
        print(f"Error fetching resources: {e}")
        traceback.print_exc()
        return {"status": "error", "message": "Internal server error"}


@app.post("/results")
async def dialogflow_webhook(request: Request, db: Session = Depends(get_db)):
    try:
        data = await request.json()
        print("Received data:", data)

        location = get_location_string(data)
        lat, lng = geocode_address(location)

        day = get_preferred_date(data)
        start_time, end_time = get_time_range(data)

        travel_ability = process_boolean_value(data.get("canTravel", False))
        relative_travel_ability = process_boolean_value(
            data.get("relativeCanTravel", False)
        )
        dietary_needs = process_dietary_needs(data.get("dietaryNeeds", None))
        kitchen_availability = process_boolean_value(data.get("hasKitchen", False))

        print(f"Location: {location}, Lat: {lat}, Lng: {lng}")
        print(f"Day: {day}, Start Time: {start_time}, End Time: {end_time}")
        print(
            f"Travel Ability: {travel_ability}, Relative Travel Ability: {relative_travel_ability}"
        )
        print(
            f"Dietary Needs: {dietary_needs}, Kitchen Availability: {kitchen_availability}"
        )

        results = core_filter(
            db=db,
            dietary_needs=dietary_needs,
            day=day,
            start_time=start_time,
            end_time=end_time,
            lat=lat,
            lng=lng,
            travel_ability=travel_ability,
            relative_travel_ability=relative_travel_ability,
            kitchen_availability=kitchen_availability,
        )

        if not results:
            return {
                "status": "success",
                "message": "We couldn't find food pantries matching your criteria. Please call 202-644-9807 for immediate assistance finding food resources.",
                "results": [],
            }

        if relative_travel_ability:
            message = "Here are options your friend or family member can visit for you. Tell them to call ahead to verify requirements and current hours. If these options don't work for you, please call 202-644-9807 for additional support."
        elif not travel_ability:
            message = "Based on your needs, here are home delivery options available. These services offer food delivery to your location; requirements and wait times may vary. If none of these organizations can serve you, please call 202-644-9807 for more support."
        else:
            message = "Here are food pantries available based on your needs. Please call before visiting to confirm hours and required documentation. If any pantry lists 'by appointment only', be sure to schedule your visit in advance."

        return {
            "status": "success",
            "message": message,
            "results": results,
        }

    except Exception as e:
        print(f"Error Logging data: {e}")
        traceback.print_exc()
        return {"status": "error", "message": "Internal server error"}
