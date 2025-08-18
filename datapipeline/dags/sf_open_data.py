import os
import requests
import json
import logging
import psycopg2
import pandas as pd
from io import StringIO
from airflow.decorators import dag, task
from airflow.models.taskinstance import TaskInstance
from datetime import datetime, timedelta

sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")
project_dir = os.environ.get("AIRFLOW_PROJ_DIR", ".")
pg_user = os.environ.get("PGUSER")
pg_password = os.environ.get("PGPASSWORD")
pg_host = os.environ.get("PGHOST")
pg_port = os.environ.get("PGPORT")
pg_database = os.environ.get("PGDATABASE")

CONFIG_FILE=f"{project_dir}/dags/data_sf_config.json"
DATA_DIR=f"{project_dir}/data"
MAX_FILE_SIZE_IN_BYTES =100*2**20

def read_config():
    with open(CONFIG_FILE, 'r') as file:
        config = json.load(file)
    return config
config = read_config()

@task
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
def load_to_db(csv_string: str, sql_fields: list[dict], task_instance: TaskInstance, logical_date: datetime):
    logging.info(f"loading data to db {sql_fields} with this data {csv_string}")
    file_date = logical_date.strftime("%Y%m%d")
    task_id = task_instance.task_id
    csv_IO = StringIO(csv_string)
    csv_IO_to_load = StringIO()

    sql_fields_arr = [f"{field['name']} {field['type']}" for field in sql_fields]
    sql_fields_str = ", ".join(sql_fields_arr)
    sql_fields_arr_copy = [f"{field['name']}" for field in sql_fields]
    sql_fields_copy_str = ", ".join(sql_fields_arr_copy)

    df = pd.read_csv(csv_IO)
    df = df[sql_fields_arr_copy]
    df.to_csv(csv_IO_to_load, index=False)

    conn = psycopg2.connect(
        dbname=pg_database,
        user=pg_user,
        password=pg_password,
        host=pg_host,
        port=pg_port
    )
    cur = conn.cursor()
    cur.execute(f"DROP TABLE IF EXISTS {task_id}_{file_date}")
    cur.execute(f"CREATE TABLE IF NOT EXISTS {task_id}_{file_date} ({sql_fields_str})")

    cur.copy_expert(sql=f"COPY {task_id}_{file_date} ({sql_fields_copy_str}) FROM STDIN WITH CSV HEADER", file=csv_IO_to_load, size=MAX_FILE_SIZE_IN_BYTES)
    conn.commit()
    cur.close()
    conn.close()
    return

@dag(
    dag_id="sf_open_data_elt", 
    start_date=datetime(2025, 1, 1), 
    schedule="@weekly",
    catchup=False,
)
def get_sf_data_dag():
    for table in config:
        result = pull_from_data_sf.override(task_id=f"pull_{table['id']}")(
            api_endpoint=table["api_endpoint"],
            params=table.get("params", {})
        )
        load_to_db.override(task_id=f"load_{table['id']}")(
            csv_string=result,
            sql_fields=table["sql_fields"]
        )
    return

get_sf_data_dag()
