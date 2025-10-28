import os
import json
import logging
import pandas as pd
from airflow.sdk import dag, task
from airflow.models.taskinstance import TaskInstance
from datetime import datetime, date, timedelta
from utils import dateTimeStrToEpoch
from conn import initConnection

sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")
project_dir = os.environ.get("AIRFLOW_HOME", ".")


start_date = '2000-01-01'
end_date = '2050-01-01'

def load_to_table(table_name: str, freq: str):
    _, conn = initConnection()

    dates = pd.date_range(
        start=pd.to_datetime(start_date).tz_localize("America/Los_Angeles"), 
        end=pd.to_datetime(end_date).tz_localize("America/Los_Angeles"),
        freq=freq
    )

    epochArr = [d.timestamp() for d in dates]
    
    logging.info(f"inserting into {table_name} {epochArr} {dates}") 
    df = pd.DataFrame({
        "epoch_date": epochArr,
        "string_date": dates,
    })

    df.to_sql(table_name, conn, if_exists='append', index=False)

    conn.close()
    return

@task
def load_time_dim_tables():
    load_to_table("time_days", "D")
    load_to_table("time_weeks", "W")
    load_to_table("time_months", "MS")
    load_to_table("time_years", "YS")
    return

@dag(
    dag_id="load_time_dim_tables", 
    start_date=datetime(2025, 1, 1)
)
def load_local_data_dag():
    load_time_dim_tables()
    return

load_local_data_dag()