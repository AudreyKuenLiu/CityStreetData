import sqlite3
import os
from utils import (
    dateTimeStrToEpoch,
    validate_sf_intersection_level_traffic_calming_devices_fiscal_year,
    format_sf_intersection_level_traffic_calming_devices_fiscal_year,
    integer_to_class_code, 
    intersection_tc_measure_to_calming_measure, 
    midblock_tc_measure_to_calming_measure, 
    text_to_collision_type, 
    text_to_collision_severity, 
    text_to_arrest_category
) 

sqliteDB = os.environ.get("SQLITE_DB", ".")
def initConnection():
    conn = sqlite3.connect(f"/{sqliteDB}")
    conn.load_extension('mod_spatialite')
    conn.create_function("dateTimeStrToEpoch", 1, dateTimeStrToEpoch)
    conn.create_function("integer_to_class_code", 1, integer_to_class_code)
    conn.create_function("intersection_tc_measure_to_calming_measure", 1, intersection_tc_measure_to_calming_measure)
    conn.create_function("midblock_tc_measure_to_calming_measure", 1, midblock_tc_measure_to_calming_measure)
    conn.create_function("text_to_collision_type", 1, text_to_collision_type)
    conn.create_function("text_to_collision_severity", 1, text_to_collision_severity)
    conn.create_function("text_to_arrest_category", 1, text_to_arrest_category)
    conn.create_function("validate_sf_intersection_level_traffic_calming_devices_fiscal_year", 1, validate_sf_intersection_level_traffic_calming_devices_fiscal_year)
    conn.create_function("format_sf_intersection_level_traffic_calming_devices_fiscal_year", 1, format_sf_intersection_level_traffic_calming_devices_fiscal_year)
    cur = conn.cursor()
    cur.execute('SELECT SetDecimalPrecision(15);')
    return cur, conn

