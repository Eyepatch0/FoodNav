from sqlalchemy import Column, String, JSON, PrimaryKeyConstraint
from .database import Base


class MarketHours(Base):
    __tablename__ = "markets_hours"
    agency_id = Column("Agency ID", String, primary_key=True, index=True)
    agency_name = Column("Agency Name", String)
    shipping_address = Column("Shipping Address", String)
    day_of_week = Column("Day of Week", String)
    starting_time = Column("Starting Time", String)
    ending_time = Column("Ending Time", String)
    frequency = Column("Frequency", String)
    food_pantry_requirements = Column("Food Pantry Requirements", String)
    food_format = Column("Food Format ", String)
    choice_options = Column("Choice Options ", String)
    distribution_models = Column("Distribution Models", String)
    coordinates = Column("coordinates", JSON)


class MarketCultures(Base):
    __tablename__ = "markets_cultures"
    agency_id = Column("Agency ID", String, primary_key=True, index=True)
    agency_name = Column("Agency Name", String)
    cultural_populations_served = Column("Cultural Populations Served", String)


class MarketWraparoundServices(Base):
    __tablename__ = "markets_services"
    agency_id = Column("Agency ID", String, primary_key=True, index=True)
    agency_name = Column("Agency Name", String)
    wraparound_service = Column("Wraparound Service", String)


class PartnerCultures(Base):
    __tablename__ = "partners_cultures"
    agency_id = Column("Agency ID", String, primary_key=True, index=True)
    company_name = Column("Company Name", String)
    cultural_populations_served = Column("Cultural Populations Served", String)


class PartnerHours(Base):
    __tablename__ = "partners_hours"
    external_id = Column("External ID", String, index=True)
    name = Column("Name", String)
    status = Column("Status", String)
    last_so_create_date = Column("Last SO Create Date", String)
    agency_region = Column("Agency Region", String)
    county_ward = Column("County/Ward", String)
    shipping_address = Column("Shipping Address", String)
    phone = Column("Phone", String)
    day_of_week = Column("Day of Week", String, index=True)
    monthly_options = Column("Monthly Options", String)
    starting_time = Column("Starting Time", String)
    ending_time = Column("Ending Time", String)
    by_appointment_only = Column("By Appointment Only", String)
    food_pantry_requirements = Column("Food Pantry Requirements", String)
    date_of_last_verification = Column("Date of Last Verification", String)
    distribution_models = Column("Distribution Models", String)
    food_format = Column("Food Format ", String)
    additional_note_on_hours_of_operations = Column(
        "Additional Note on Hours of Operations", String
    )
    coordinates = Column("coordinates", JSON)

    __table_args__ = (PrimaryKeyConstraint("External ID", "Day of Week"),)


class PartnerWraparoundServices(Base):
    __tablename__ = "partners_services"
    agency_id = Column("Agency ID", String, primary_key=True, index=True)
    agency_name = Column("Agency Name", String)
    wraparound_service = Column("Wraparound Service", String)
