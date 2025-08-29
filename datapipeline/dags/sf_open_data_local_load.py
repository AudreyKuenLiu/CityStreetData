import csv
import os
import json
import logging
import psycopg2
import pandas as pd
from io import StringIO
from airflow.decorators import dag, task
from airflow.models.taskinstance import TaskInstance
from datetime import datetime, timedelta
from utils import csvIO_to_stringIO

sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")
project_dir = os.environ.get("AIRFLOW_PROJ_DIR", ".")
pg_user = os.environ.get("PGUSER")
pg_password = os.environ.get("PGPASSWORD")
pg_host = os.environ.get("PGHOST")
pg_port = os.environ.get("PGPORT")
pg_database = os.environ.get("PGDATABASE")

CONFIG_FILE = f"{project_dir}/dags/data_sf_config.json"
MAX_FILE_SIZE_IN_BYTES = 100*2**20
ID_TO_CSV_FILE = {
    "sf_streets_and_intersections": "sf_streets_active_and_retired_streets_20250730_raw.csv",
    "sf_traffic_crashes": "sf_traffic_crashes_resulting_in_injury_20250729_raw.csv",
    "sf_speed_limits_per_street_segment": "sf_speed_limits_per_street_segment_20250729_raw.csv",
    "sf_intersection_level_traffic_calming_devices": "sf_intersection_level_traffic_calming_devices_20250802_raw.csv",
    "sf_mid_block_traffic_calming_areas": "sf_mid_block_traffic_calming_areas_20250802_raw.csv",
    "sf_slow_streets": "sf_slow_streets_20250802_raw.csv",
    "sf_pd_incident_reports_2018_to_present": "sf_pd_incident_reports_2018_to_present_20250802_raw.csv"
}

def read_config():
    with open(CONFIG_FILE, 'r') as file:
        config = json.load(file)
    return config
config = read_config()

def read_sql_file(sql_file_path: str):
    try:
        with open(sql_file_path, 'r') as file:
            file_contents = file.read()
    except FileNotFoundError:
        logging.warn(f"couldn't find file {sql_file_path}")
        return ""

    return file_contents

@task
def load_to_db(table_id: str, staging_fields: list[dict]):
    sql_data_staging_file = read_sql_file(f"{project_dir}/dags/sql/staging_tables/{table_id}_staging.sql")
    sql_data_staging_file = sql_data_staging_file.format(suffix=f"initdata_raw")
    if len(sql_data_staging_file) == 0:
        return 
    
    csv_IO_to_load = StringIO()
    with open(f"{project_dir}/dags/initdata/{ID_TO_CSV_FILE[table_id]}", "r") as f:
        csv_IO_to_load = csvIO_to_stringIO(f, staging_fields)

    data_table_name = f"{table_id}_initdata_raw"
    sql_load_file = read_sql_file(f"{project_dir}/dags/sql/{table_id}.sql")
    sql_load_file = sql_load_file.format(data_table_name=data_table_name)

    staging_fields_str = ", ".join(staging_fields)
    logging.info(f"loading data to db table {data_table_name} ({staging_fields_str})")

    conn = psycopg2.connect(
        dbname=pg_database,
        user=pg_user,
        password=pg_password,
        host=pg_host,
        port=pg_port
    )
    cur = conn.cursor()
    cur.execute(f"DROP TABLE IF EXISTS {data_table_name}")
    cur.execute(sql_data_staging_file)
    cur.copy_expert(sql=f"COPY {data_table_name} ({staging_fields_str}) FROM STDIN WITH CSV HEADER", file=csv_IO_to_load, size=MAX_FILE_SIZE_IN_BYTES)
    if len(sql_load_file) > 0:
        cur.execute(sql_load_file)

    conn.commit()
    cur.close()
    conn.close()
    return

@task
def dummy():
    pass

@dag(
    dag_id="sf_local_load", 
    start_date=datetime(2025, 1, 1)
)
def load_local_data_dag():
    it = dummy()
    for table in config:
        result = load_to_db.override(task_id=f"load_{table['id']}")(
            table_id=table['id'],
            staging_fields=table["staging_fields"],
        )
        result.set_upstream(it)
        it = result
    return

load_local_data_dag()