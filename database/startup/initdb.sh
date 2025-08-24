#!/bin/bash

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# Load PostGIS into both template_database and $POSTGRES_DB
echo "Loading PostGIS data into $POSTGRES_DB"
"${psql[@]}" --dbname="$POSTGRES_DB" <<-'EOSQL'
CREATE TABLE IF NOT EXISTS sf_traffic_crashes_data_20250729_raw (
  unique_id TEXT,
  cnn_intrsctn_fkey INTEGER,
  cnn_sgmt_fkey INTEGER,
  case_id_pkey TEXT,
  tb_latitude DOUBLE PRECISION,
  tb_longitude DOUBLE PRECISION,
  geocode_source TEXT,
  geocode_location TEXT,
  collision_datetime TIMESTAMP,
  collision_date TIMESTAMP,
  collision_time TEXT,
  accident_year TEXT,
  month TEXT,
  day_of_week TEXT,
  time_cat TEXT,
  juris TEXT,
  officer_id TEXT,
  reporting_district TEXT,
  beat_number TEXT,
  primary_rd TEXT,
  secondary_rd TEXT,
  distance SMALLINT,
  direction TEXT,
  weather_1 TEXT,
  weather_2 TEXT,
  collision_severity TEXT,
  type_of_collision TEXT,
  mviw TEXT,
  ped_action TEXT,
  road_surface TEXT,
  road_cond_1 TEXT,
  road_cond_2 TEXT,
  lighting TEXT,
  control_device TEXT,
  intersection TEXT,
  vz_pcf_code TEXT,
  vz_pcf_group TEXT,
  vz_pcf_description TEXT,
  vz_pcf_link TEXT,
  number_killed INTEGER,
  number_injured INTEGER,
  street_view TEXT,
  dph_col_grp TEXT,
  dph_col_grp_description TEXT,
  party_at_fault TEXT,
  party1_type TEXT,
  party1_dir_of_travel TEXT,
  party1_move_pre_acc TEXT,
  party2_type TEXT,
  party2_dir_of_travel TEXT,
  party2_move_pre_acc TEXT,
  point geometry(Point, 4326),
  data_as_of TIMESTAMP,
  data_updated_at TIMESTAMP,
  data_loaded_at TIMESTAMP,
  analysis_neighborhood TEXT,
  supervisor_district TEXT,
  police_district TEXT,
  current_police_districts SMALLINT,
  current_supervisor_districts SMALLINT,
  analysis_neighborhoods SMALLINT,
  neighborhoods SMALLINT,
  sf_find_neighborhoods SMALLINT
);

CREATE TABLE IF NOT EXISTS sf_speed_limits_per_street_segment_20250729_raw (
  objectid              VARCHAR(64),
  cnn                   INTEGER,
  street                VARCHAR(64),
  st_type               VARCHAR(8),
  from_st               VARCHAR(64),
  to_st                 VARCHAR(64),
  speedlimit            SMALLINT,
  schoolzone            VARCHAR(8),
  schoolzone_limit      SMALLINT,
  mtab_date             TIMESTAMP,
  mtab_motion           VARCHAR(32),
  mtab_reso_text        VARCHAR(32),
  status                VARCHAR(32),
  workorder             VARCHAR(16),
  install_date          TIMESTAMP,
  shape                 geometry(MultiLineString, 4326),
  data_as_of            TIMESTAMP,
  data_loaded_at        TIMESTAMP,
  analysis_neighborhood VARCHAR(64),
  supervisor_district   VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS sf_streets_active_and_retired_streets_20250730_raw (
  cnn                    INTEGER,
  lf_fadd                SMALLINT,
  lf_toadd               SMALLINT,
  rt_fadd                SMALLINT,
  rt_toadd               SMALLINT,
  street                 VARCHAR(32),
  st_type                VARCHAR(8),
  f_st                   VARCHAR(64),
  t_st                   VARCHAR(64),
  f_node_cnn             INTEGER,
  t_node_cnn             INTEGER,
  accepted               BOOLEAN,
  active                 BOOLEAN,
  classcode              SMALLINT,
  date_added             TIMESTAMP,
  date_altered           TIMESTAMP,
  date_dropped           TIMESTAMP,
  gds_chg_id_add         VARCHAR(32),
  gds_chg_id_altered     VARCHAR(32),
  gds_chg_id_dropped     VARCHAR(32),
  jurisdiction           VARCHAR(8),
  layer                  VARCHAR(32),
  nhood                  VARCHAR(32),
  oneway                 VARCHAR(4),
  street_gc              VARCHAR(32),
  streetname             VARCHAR(32),
  streetname_gc          VARCHAR(32),
  zip_code               INTEGER,
  analysis_neighborhood  VARCHAR(32),
  supervisor_district    VARCHAR(32),
  line                   geometry(LineString, 4326),
  data_as_of             TIMESTAMP,
  data_loaded_at         TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sf_intersection_level_traffic_calming_devices_20250802_raw (
  row_id INTEGER, 
  objectid INTEGER, 
  cnn INTEGER, 
  streetname TEXT, 
  project_lo TEXT, 
  from_st TEXT, 
  tc_measure TEXT, 
  units INTEGER, 
  install_mo SMALLINT, 
  install_yr INTEGER, 
  install_date TIMESTAMP, 
  fiscal_yr TEXT,
  program TEXT, 
  current_status TEXT, 
  supervisor_district VARCHAR(32), 
  analysis_neighborhood TEXT, 
  shape geometry(Point, 4326), 
  data_as_of TIMESTAMP, 
  data_loaded_at TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS sf_mid_block_traffic_calming_areas_20250802_raw (
  row_id INTEGER, 
  objectid INTEGER, 
  cnn INTEGER, 
  nhood TEXT, 
  streetname TEXT, 
  district VARCHAR(32), 
  from_st TEXT,
  to_st TEXT, 
  project_location TEXT, 
  tc_measure TEXT, 
  units SMALLINT,
  install_mo SMALLINT,
  install_yr SMALLINT,
  install_datetime TIMESTAMP,
  fiscal_yr TEXT,
  program TEXT,
  current_status TEXT,
  current_ti TEXT,
  next_step TEXT,
  next_step_2 TEXT,
  shape geometry(LineString, 4326),
  data_as_of TIMESTAMP,
  data_loaded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sf_slow_streets_20250802_raw (
  objectid INTEGER,
  shape geometry(LineString, 4326), 
  classcode INTEGER,
  cnn INTEGER,
  f_node_cnn INTEGER,
  f_st TEXT,
  nhood TEXT,
  oneway VARCHAR(4),
  st_type VARCHAR(16),
  streetname TEXT,
  t_st TEXT,
  zip_code INT,
  slw_st INTEGER,
  length NUMERIC,
  extents TEXT,
  status TEXT,
  phase INTEGER,
  install_date TIMESTAMP,
  agency VARCHAR(16),
  type TEXT,
  supervisor_district VARCHAR(32),
  data_as_of TIMESTAMP,
  data_loaded_at TIMESTAMP 
);

CREATE TABLE IF NOT EXISTS sf_vision_zero_high_injury_network_20250802_raw (
  objectid INTEGER,
  geom_length DECIMAL,
  cnn_sgmt_pkey INTEGER,
  street_name TEXT,
  street_type TEXT,
  street_layer TEXT,
  full_street_name TEXT,
  class_code SMALLINT,
  gis_length_miles DECIMAL,
  duel_car_way_yn TEXT,
  duel_car_way_id INTEGER,
  f_node_cnn_intrsctn_fkey INTEGER,
  t_node_cnn_intrsctn_fkey INTEGER,
  shape_length INTEGER,
  corrected_length_miles DECIMAL,
  direction TEXT,
  from_intrsctn TEXT,
  to_intrsctn TEXT,
  geom geometry(LineString, 4326),
  data_as_of TIMESTAMP,
  data_loaded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sf_pd_incident_reports_2018_to_Present_20250802_raw (
  row_id BIGINT,
  incident_datetime TIMESTAMP,
  incident_date DATE,
  incident_time VARCHAR(8),
  incident_year SMALLINT,
  incident_day_of_week TEXT,
  report_datetime TIMESTAMP,
  incident_id INTEGER,
  incident_number INTEGER,
  cad_number INTEGER,
  report_type_code VARCHAR(4),
  report_type_description TEXT,
  filed_online BOOLEAN,
  incident_code TEXT,
  incident_category TEXT,
  incident_subcategory TEXT,
  incident_description TEXT,
  resolution TEXT,
  intersection TEXT,
  cnn INTEGER,
  police_district TEXT,
  analysis_neighborhood TEXT,
  supervisor_district TEXT,
  supervisor_district_2012 TEXT,
  latitude DOUBLE PRECISION, 
  longitude DOUBLE PRECISION,
  point geometry(Point, 4326), 
  data_as_of TIMESTAMP, 
  data_loaded_at TIMESTAMP 
);

COPY sf_speed_limits_per_street_segment_20250729_raw FROM '/initdata/sf_speed_limits_per_street_segment_20250729_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_streets_active_and_retired_streets_20250730_raw FROM '/initdata/sf_streets_active_and_retired_streets_20250730_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_traffic_crashes_data_20250729_raw FROM '/initdata/sf_traffic_crashes_data_20250729_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_intersection_level_traffic_calming_devices_20250802_raw FROM '/initdata/sf_intersection_level_traffic_calming_devices_20250802_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_mid_block_traffic_calming_areas_20250802_raw FROM '/initdata/sf_mid_block_traffic_calming_areas_20250802_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_slow_streets_20250802_raw FROM '/initdata/sf_slow_streets_20250802_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_vision_zero_high_injury_network_20250802_raw FROM '/initdata/sf_vision_zero_high_injury_network_20250802_raw.csv' DELIMITER ',' CSV HEADER;
COPY sf_pd_incident_reports_2018_to_Present_20250802_raw FROM '/initdata/sf_pd_incident_reports_2018_to_Present_20250802_raw.csv' DELIMITER ',' CSV HEADER;
EOSQL

# Load PostGIS into both template_database and $POSTGRES_DB
echo "Loading creating $POSTGRES_DB tables"
"${psql[@]}" --dbname="$POSTGRES_DB" <<-'EOSQL'
CREATE OR REPLACE FUNCTION update_updated_at_column()   
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;   
END;
$$ language 'plpgsql';

CREATE TABLE IF NOT EXISTS sf_streets_and_intersections (
  id                     BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  created_at             TIMESTAMP DEFAULT NOW(),
  updated_at             TIMESTAMP DEFAULT NOW(),
  cnn                    INTEGER,
  lf_fadd                SMALLINT,
  lf_toadd               SMALLINT,
  rt_fadd                SMALLINT,
  rt_toadd               SMALLINT,
  street                 VARCHAR(32),
  st_type                VARCHAR(8),
  f_st                   VARCHAR(64),
  t_st                   VARCHAR(64),
  f_node_cnn             INTEGER,
  t_node_cnn             INTEGER,
  accepted               BOOLEAN,
  active                 BOOLEAN,
  date_public_works_added TIMESTAMP,
  date_public_works_altered TIMESTAMP,
  date_public_works_dropped TIMESTAMP,
  jurisdiction           VARCHAR(8),
  layer                  VARCHAR(32),
  nhood                  VARCHAR(32),
  oneway                 VARCHAR(4),
  street_gc              VARCHAR(32),
  streetname             VARCHAR(32),
  streetname_gc          VARCHAR(32),
  zip_code               INTEGER,
  analysis_neighborhood  VARCHAR(32),
  supervisor_district    VARCHAR(32),
  line                   geometry(LineString, 4326)
);
CREATE TRIGGER update_sf_streets_and_intersections_time BEFORE UPDATE ON sf_streets_and_intersections FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TYPE feature_type AS ENUM (
  'classcode',
  'school_zone',
  'slow_street', 
  'speed_limit',
  'calming_measure'
);

CREATE TABLE IF NOT EXISTS sf_street_features (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  feature_type feature_type NOT NULL, 
  cnn          INTEGER NOT NULL,
  is_on_intersection BOOLEAN NOT NULL, 
  value        JSONB NOT NULL,
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_features_time BEFORE UPDATE ON sf_street_features FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TYPE event_type AS ENUM (
  'traffic_crash_resulting_in_injury',
  'police_traffic_arrest',
  'emergency_service'
);

CREATE TABLE IF NOT EXISTS sf_events (
  id         BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  occured_at TIMESTAMP NOT NULL,
  event_type event_type NOT NULL, 
  cnn        INTEGER NOT NULL,
  point      geometry(Point, 4326),
  metadata   JSONB
);
CREATE TRIGGER update_sf_events_time BEFORE UPDATE ON sf_events FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

EOSQL
