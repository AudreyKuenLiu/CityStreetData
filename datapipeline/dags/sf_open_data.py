import os
import requests
import json
import logging
from airflow.decorators import dag, task
from airflow.hooks.postgres_hook import PostgresHook
from datetime import datetime, timedelta

CONFIG_FILE="/opt/airflow/dags/data_sf_config.json"

def read_config():
    with open(CONFIG_FILE, 'r') as file:
        config = json.load(file)
    return config
config = read_config()
sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")

@task
def pull_from_data_sf(api_endpoint: str, params:dict):
    logging.info(f"Pulling data from {api_endpoint} with fields {fields} and params {params}")
    headers = {
        "Accept": "application/json",
        "X-App-Token": sf_app_token
    }
    response = requests.get(api_endpoint, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        return data
    else:
        raise ValueError(json.dumps({"error": "Failed to retrieve data", "resp": response.text}))
    return 

@task
def load_data_to_postgres(data: list[dict], fields:list[dict]):
    return 

@dag(
    dag_id="sf_open_data_elt", 
    start_date=datetime(2025, 1, 1), 
    schedule="@weekly",
    catchup=False,
)
def get_sf_data_dag():
    for table in config:
        pull_from_data_sf.override(task_id=f"pull_{table['id']}")
        result = pull_from_data_sf(
            api_endpoint=table["api_endpoint"],
            params=table.get("params", {})
        )
        load_data_to_postgres.override(task_id=f"load_{table['id']}")
        load_data_to_postgres(data=result, fields=table["fields"])
    return

get_sf_data_dag()
