import os
import sqlite3
import pandas as pd

from app.utils.geocode_utils import add_coordinates_to_tables

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")

files_to_tables = {
    os.path.join(DATA_DIR, "CAFB_Markets_Cultures_Served.xlsx"): "markets_cultures",
    os.path.join(DATA_DIR, "CAFB_Markets_HOO.xlsx"): "markets_hours",
    os.path.join(DATA_DIR, "CAFB_Markets_Wraparound_Services.xlsx"): "markets_services",
    os.path.join(
        DATA_DIR, "CAFB_Shopping_Partners_Cultures_Served.xlsx"
    ): "partners_cultures",
    os.path.join(DATA_DIR, "CAFB_Shopping_Partners_HOO.xlsx"): "partners_hours",
    os.path.join(
        DATA_DIR, "CAFB_Shopping_Partners_Wraparound_Services.xlsx"
    ): "partners_services",
}

dataframes = {}
for file_path, table_name in files_to_tables.items():
    dataframes[table_name] = pd.read_excel(file_path)

dataframes = add_coordinates_to_tables(dataframes)

DB_PATH = os.path.join(BASE_DIR, "food_pantry.db")
with sqlite3.connect(DB_PATH) as conn:
    for table_name, df in dataframes.items():
        print(f"Saving {table_name} to database...")
        df.to_sql(table_name, conn, if_exists="replace", index=False)

print("Database created successfully!")
