import csv
import os
import requests
import json
import logging
import pandas as pd
from io import StringIO
from airflow.sdk import dag, task
from airflow.models.taskinstance import TaskInstance
from datetime import datetime, timedelta
from utils import string_to_df, get_num_rows
from conn import initConnection

sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")
project_dir = os.environ.get("AIRFLOW_HOME", ".")

CONFIG_FILE=f"{project_dir}/dags/data_sf_config.json"
DATA_DIR=f"{project_dir}/data"

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

def pull_from_data_sf(api_endpoint: str, params:dict):
    logging.info(f"Pulling data from {api_endpoint} with params {params}")
    headers = {
        "Accept": "application/json",
        "X-App-Token": sf_app_token
    }
    response = requests.get(api_endpoint, headers=headers, params=params)
    if response.status_code == 200:
        data = response.text
        return data
    else:
        raise ValueError(json.dumps({"error": "Failed to retrieve data", "resp": response.text}))
    return 

@task
def load_to_db(table_id: str, api_endpoint: str, staging_fields: list[dict], params: dict, logical_date: datetime):
    file_date = logical_date.strftime("%Y%m%d")
    data_table_name = f"{table_id}_{file_date}_raw"
    params["$offset"] = 0

    cur, conn = initConnection()
    cur = conn.cursor()
    cur.execute(f"DROP TABLE IF EXISTS {data_table_name}")
    sql_data_staging_file = read_sql_file(f"{project_dir}/dags/sql/staging_tables/{table_id}_staging.sql")
    sql_data_staging_file = sql_data_staging_file.format(suffix=f"{file_date}_raw")
    if len(sql_data_staging_file) == 0:
        return 
    cur.executescript(sql_data_staging_file)

    while True:
        result_str = pull_from_data_sf(api_endpoint, params)
        if (result_str is None or len(result_str) == 0):
            break

        file_date = logical_date.strftime("%Y%m%d")
        df = string_to_df(result_str, staging_fields)

        # Break if no more data or only 1 row is returned (which is the header)
        numRowsToLoad = len(df)
        if (numRowsToLoad == 0):
            break

        staging_fields_str = ", ".join(staging_fields)
        logging.info(f"loading data to db table {data_table_name} ({staging_fields_str}): {numRowsToLoad} rows")

        df[staging_fields].to_sql(data_table_name, conn, if_exists='append', index=False)
        params["$offset"] += params["$limit"]

    sql_load_file = read_sql_file(f"{project_dir}/dags/sql/{table_id}.sql")
    sql_load_file = sql_load_file.format(data_table_name=data_table_name)
    if len(sql_load_file) > 0:
        cur.executescript(sql_load_file)

    conn.commit()
    cur.close()
    conn.close()

    return

@task
def dummy():
    pass

@dag(
    dag_id="sf_open_data_elt", 
    start_date=datetime(2025, 1, 1), 
    schedule="@monthly",
    catchup=False,
)
def get_sf_data_dag():
    it = dummy()
    for table in config:
        loadDBResult = load_to_db.override(task_id=f"load_{table['id']}")(
            table_id=table['id'],
            api_endpoint=table["api_endpoint"],
            staging_fields=table["staging_fields"],
            params=table.get("params", {})
        )
        loadDBResult.set_upstream(it)
        it = loadDBResult 
    return

get_sf_data_dag()