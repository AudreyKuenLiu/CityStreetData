import json
import os
import pandas as pd
from conn import initConnection

project_dir = os.environ.get("CHRON_HOME", ".")
CONFIG_FILE = f"{project_dir}/data_sf_config.json"
ID_TO_CSV_FILE = {
    "sf_streets_and_intersections": "sf_streets_active_and_retired_streets_20250730_raw.csv",
    "sf_traffic_crashes": "sf_traffic_crashes_resulting_in_injury_20250729_raw.csv",
    "sf_speed_limits_per_street_segment": "sf_speed_limits_per_street_segment_20240225_raw.csv",
    "sf_intersection_level_traffic_calming_devices": "sf_intersection_level_traffic_calming_devices_20250802_raw.csv",
    "sf_mid_block_traffic_calming_areas": "sf_mid_block_traffic_calming_areas_20250802_raw.csv",
    "sf_slow_streets": "sf_slow_streets_20250802_raw.csv",
    "sf_pd_incident_reports_2018_to_present": "sf_pd_incident_reports_2018_to_present_20250802_raw.csv"
}
class SfOpenDataLocalLoad:
    def __init__(self, logging):
        self.logging = logging
        self.config = self._read_config()
        return
    
    def run(self):
        for table in self.config:
            self._load_to_db(
                table['id'],
                table["staging_fields"],
            )
        return
    
    def _load_to_db(self, table_id: str, staging_fields: list[dict]):
        cur, conn = initConnection()

        sql_data_staging_file = self._read_sql_file(f"{project_dir}/sql/staging_tables/{table_id}_staging.sql")
        sql_data_staging_file = sql_data_staging_file.format(suffix=f"initdata_raw")
        if len(sql_data_staging_file) == 0:
            return 
        
        data_table_name = f"{table_id}_initdata_raw"
        sql_load_file = self._read_sql_file(f"{project_dir}/sql/{table_id}.sql")
        sql_load_file = sql_load_file.format(data_table_name=data_table_name)

        staging_fields_str = ", ".join(staging_fields)
        self.logging.info(f"creating staging table {data_table_name} ({staging_fields_str})")

        cur.execute(f"DROP TABLE IF EXISTS {data_table_name};")
        cur.executescript(sql_data_staging_file)
        
        self.logging.info(f"inserting into {data_table_name} ({staging_fields_str})")
        with open(f"{project_dir}/initdata/{ID_TO_CSV_FILE[table_id]}", "r") as f:
            df = pd.read_csv(f)
            for field in staging_fields:
                if field not in df.columns:
                    df[field] = None
            df[staging_fields].to_sql(data_table_name, conn, if_exists='append', index=False)
        
        self.logging.info(f"loading data")
        if len(sql_load_file) > 0:
            cur.executescript(sql_load_file)

        conn.commit()
        cur.close()
        conn.close()
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

    