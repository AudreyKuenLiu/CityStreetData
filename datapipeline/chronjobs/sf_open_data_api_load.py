import json
import os
import requests
import pandas as pd
from conn import initConnection
from datetime import date, datetime, timedelta
from utils import string_to_df, get_num_rows

project_dir = os.environ.get("CHRON_HOME", ".")
CONFIG_FILE = f"{project_dir}/data_sf_config.json"

class SfOpenDataAPILoad:
    def __init__(self, logging):
        self.logging = logging
        self.config = self._read_config()
        self.sf_app_token = os.environ.get("SF_DATA_APP_TOKEN")
        return
    
    def run(self):
        for table in self.config:
            self._load_to_db(
                table['id'],
                table["api_endpoint"],
                table["staging_fields"],
                table.get("params", {})
            )
        return
    
    def _load_to_db(self, table_id: str,  api_endpoint: str, staging_fields: list[dict], params: dict):
        file_date = date.today().strftime("%Y%m%d")
        data_table_name = f"{table_id}_{file_date}_raw"
        params["$offset"] = 0

        cur, conn = initConnection()
        cur = conn.cursor()
        cur.execute(f"DROP TABLE IF EXISTS {data_table_name}")
        sql_data_staging_file = self._read_sql_file(f"{project_dir}/sql/staging_tables/{table_id}_staging.sql")
        sql_data_staging_file = sql_data_staging_file.format(suffix=f"{file_date}_raw")
        if len(sql_data_staging_file) == 0:
            return 
        cur.executescript(sql_data_staging_file)

        while True:
            result_str = self._pull_from_data_sf(api_endpoint, params)
            if (result_str is None or len(result_str) == 0):
                break

            df = string_to_df(result_str, staging_fields)

            # Break if no more data or only 1 row is returned (which is the header)
            numRowsToLoad = len(df)
            if (numRowsToLoad == 0):
                break

            staging_fields_str = ", ".join(staging_fields)
            self.logging.info(f"loading data to db table {data_table_name} ({staging_fields_str}): {numRowsToLoad} rows")

            df[staging_fields].to_sql(data_table_name, conn, if_exists='append', index=False)
            params["$offset"] += params["$limit"]

        sql_load_file = self._read_sql_file(f"{project_dir}/sql/{table_id}.sql")
        sql_load_file = sql_load_file.format(data_table_name=data_table_name)
        if len(sql_load_file) > 0:
            cur.executescript(sql_load_file)

        conn.commit()
        cur.close()
        conn.close()
        return
    
    def _pull_from_data_sf(self, api_endpoint: str, params:dict):
        self.logging.info(f"Pulling data from {api_endpoint} with params {params}")
        headers = {
            "Accept": "application/json",
            "X-App-Token": self.sf_app_token
        }
        response = requests.get(api_endpoint, headers=headers, params=params)
        if response.status_code == 200:
            data = response.text
            return data
        else:
            raise ValueError(json.dumps({"error": "Failed to retrieve data", "resp": response.text}))
        return 


    def _read_config(self):
        with open(CONFIG_FILE, 'r') as file:
            config = json.load(file)
        return config
    
    def _read_sql_file(self, sql_file_path: str):
        try:
            with open(sql_file_path, 'r') as file:
                file_contents = file.read()
        except FileNotFoundError:
            self.logging.warn(f"couldn't find file {sql_file_path}")
            return ""
        return file_contents

    