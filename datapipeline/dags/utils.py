import re
import csv
from io import StringIO
from typing import IO
import pandas as pd
from dateutil.parser import parse
from zoneinfo import ZoneInfo

def validate_sf_intersection_level_traffic_calming_devices_fiscal_year(fiscal_yr: str | None) -> bool:
    if fiscal_yr is None:
        return False
    return bool(re.match(r"FY \d{4}-\d{4}", fiscal_yr))

def format_sf_intersection_level_traffic_calming_devices_fiscal_year(fiscal_yr: str) -> str | None:
    fiscalArr = fiscal_yr.split(" ")
    if len(fiscalArr) == 0:
        return None
    yearArr = fiscalArr[1].split("-")
    if len(yearArr) == 0:
        return None
    return yearArr[0]

def dateTimeStrToEpoch(datetimestr: str | None) -> int:
    LOS_ANGELES = ZoneInfo("America/Los_Angeles")
    if datetimestr is None:
        return 0
    try:
        datetime = parse(datetimestr)
        dateTimePacificTime = datetime.replace(tzinfo=LOS_ANGELES)
        return dateTimePacificTime.timestamp()
    except Exception as err:
        print("this is the error", err)
    return 0

def integer_to_class_code(int_class_code: int):
    mapping = {
        0: 'other',
        1: 'freeway',
        2: 'highway_or_major_street',
        3: 'arterial',
        4: 'collector',
        5: 'residential',
        6: 'freeway_ramp'
    }
    return mapping.get(int_class_code, 'other')

def intersection_tc_measure_to_calming_measure(tc_measure: str):
    mapping = {
        'median extension': 'median_extension',
        'channelization': 'channelization',
        'speed hump': 'speed_hump',
        'ped refuge island': 'ped_refuge_island',
        'chicane': 'chicane',
        'median island': 'median_island',
        'traffic circle': 'traffic_circle',
        'left turn traffic calming': 'left_turn_traffic_calming',
        'painted traffic circle': 'painted_traffic_circle',
        'traffic island': 'traffic_island',
        'speed table': 'speed_table',
        'painted island': 'painted_island',
        'raised crosswalk': 'raised_crosswalk',
        'centerline hardening w/rubber humps': 'centerline_hardening_w_rubber_humps',
        'speed radar sign': 'speed_radar_sign',
        'choker': 'choker'
    }
    if tc_measure is None:
        return None
    return mapping.get(tc_measure.strip().lower())

def midblock_tc_measure_to_calming_measure(tc_measure):
    mapping = {
        'striping': 'striping',
        'speed radar sign': 'speed_radar_sign',
        'choker': 'choker',
        '5-lump speed cushion': '5_lump_speed_cushion',
        'channelization': 'channelization',
        '7-lump speed cushion': '7_lump_speed_cushion',
        'speed hump': 'speed_hump',
        '3-lump speed cushion': '3_lump_speed_cushion',
        '4-lump speed cushion': '4_lump_speed_cushion',
        'chicane': 'chicane',
        'speed cushion': 'speed_cushion',
        'speed bump': 'speed_bump',
        'road diet': 'road_diet',
        'edgeline': 'edgeline',
        '6-lump speed cushion': '6_lump_speed_cushion',
        'one-way conversion': 'one_way_conversion',
        'traffic island': 'traffic_island',
        '2-lump speed cushion': '2_lump_speed_cushion',
        'speed table': 'speed_table',
        'raised crosswalk': 'raised_crosswalk'
    }
    if tc_measure is None:
        return None
    return mapping.get(tc_measure.strip().lower())

def text_to_collision_type(tc_measure):
    mapping = {
        'vehicle/pedestrian': 'vehicle_pedestrian',
        'broadside': 'broadside',
        'rear end': 'rear_end',
        'hit object': 'hit_object',
        'sideswipe': 'sideswipe',
        'overturned': 'overturned',
        'other': 'other',
        'head-on': 'head_on',
        'not stated': 'not_stated'
    }
    if tc_measure is None:
        return None
    return mapping.get(tc_measure.strip().lower())

def text_to_collision_severity(tc_measure):
    mapping = {
        'medical': 'medical',
        'fatal': 'fatal',
        'injury (other visible)': 'other_visible',
        'injury (severe)': 'severe',
        'injury (complaint of pain)': 'complaint_of_pain'
    }
    if tc_measure is None:
        return None
    return mapping.get(tc_measure.strip().lower())

def text_to_arrest_category(tc_measure):
    mapping = {
        'traffic collision': 'traffic_collision',
        'traffic violation arrest': 'traffic_violation_arrest'
    }
    if tc_measure is None:
        return None
    return mapping.get(tc_measure.strip().lower())

def string_to_df(data: str, fields: list[str]) -> pd.DataFrame:
    input_io = StringIO(data)
    df = pd.read_csv(input_io, low_memory=False)
    for field in fields:
        if field not in df.columns:
            df[field] = None
    df = df[fields]
    return df

def csvIO_to_stringIO(input_io: IO, fields: list[str]) -> StringIO:
    """
    Convert a CSV IO object to a StringIO object with specific fields.
    """
    csv_IO_to_load = StringIO()

    df = pd.read_csv(input_io, low_memory=False)
    for field in fields:
        if field not in df.columns:
            df[field] = None
    df = df[fields]
    df.to_csv(csv_IO_to_load, index=False, quotechar='"', quoting=csv.QUOTE_MINIMAL)
    csv_IO_to_load.seek(0) #YOU MUST SEEK THE POINTER TO 0 OR ELSE COPY_EXPERT WON'T COPY IN THE END

    return csv_IO_to_load

def get_num_rows(csv_io: IO) -> int:
    """
    Get the number of rows in a CSV IO object.
    """
    csv_io.seek(0)
    df = pd.read_csv(csv_io, low_memory=False)
    csv_io.seek(0)
    return df.shape[0]