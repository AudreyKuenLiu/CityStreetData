#!/bin/bash

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

# Load PostGIS into both template_database and $POSTGRES_DB
echo "seeding $POSTGRES_DB tables"
"${psql[@]}" --dbname="$POSTGRES_DB" <<-'EOSQL'
WITH data_to_add AS (
SELECT
 cnn, 
 lf_fadd, 
 lf_toadd, 
 rt_fadd, 
 rt_toadd, 
 street, 
 st_type, 
 f_st, 
 t_st, 
 f_node_cnn, 
 t_node_cnn, 
 accepted, 
 active, 
 date_added, 
 date_altered, 
 date_dropped, 
 jurisdiction, 
 layer, 
 nhood, 
 oneway, 
 street_gc,
 streetname, 
 streetname_gc, 
 zip_code, 
 analysis_neighborhood, 
 supervisor_district, 
 line
FROM
 sf_streets_active_and_retired_streets_20250730_raw
)
INSERT INTO sf_streets_and_intersections (
 cnn,
 lf_fadd,
 lf_toadd,
 rt_fadd,
 rt_toadd,
 street,
 st_type,
 f_st,
 t_st,
 f_node_cnn,
 t_node_cnn,
 accepted,
 active,
 date_public_works_added,
 date_public_works_altered,
 date_public_works_dropped,
 jurisdiction,
 layer,
 nhood,
 oneway,
 street_gc,
 streetname,
 streetname_gc,
 zip_code,
 analysis_neighborhood,
 supervisor_district,
 line
)
SELECT
  dta.*
FROM
  data_to_add dta
  LEFT JOIN
  sf_streets_and_intersections sfsi
  ON dta.cnn = sfsi.cnn
WHERE
  sfsi.cnn is NULL 
  OR
  sfsi.lf_fadd != dta.lf_fadd 
  OR
  sfsi.lf_toadd != dta.lf_toadd 
  OR
  sfsi.rt_fadd != dta.rt_fadd 
  OR
  sfsi.rt_toadd != dta.rt_toadd 
  OR
  sfsi.street != dta.street 
  OR
  sfsi.st_type != dta.st_type 
  OR
  sfsi.f_st != dta.f_st 
  OR
  sfsi.t_st != dta.t_st 
  OR
  sfsi.f_node_cnn != dta.f_node_cnn 
  OR
  sfsi.t_node_cnn != dta.t_node_cnn 
  OR
  sfsi.accepted != dta.accepted 
  OR
  sfsi.active != dta.active 
  OR
  sfsi.date_public_works_added != dta.date_added 
  OR
  sfsi.date_public_works_altered != dta.date_altered 
  OR
  sfsi.date_public_works_dropped != dta.date_dropped 
  OR
  sfsi.jurisdiction != dta.jurisdiction 
  OR
  sfsi.layer != dta.layer 
  OR
  sfsi.nhood != dta.nhood 
  OR
  sfsi.oneway != dta.oneway 
  OR
  sfsi.street_gc != dta.street_gc 
  OR
  sfsi.streetname != dta.streetname 
  OR
  sfsi.streetname_gc != dta.streetname_gc 
  OR
  sfsi.zip_code != dta.zip_code 
  OR
  sfsi.analysis_neighborhood != dta.analysis_neighborhood 
  OR
  sfsi.supervisor_district != dta.supervisor_district 
  OR
  sfsi.line != dta.line;

/*
CREATE TYPE feature_type AS ENUM (
  '2_lump_speed_cushion',
  '3_lump_speed_cushion',
  '4_lump_speed_cushion',
  '5_lump_speed_cushion',
  '6_lump_speed_cushion',
  '7_lump_speed_cushion',
  'centerline_hardening_w_rubber_humps',
  'channelization',
  'chicane',
  'choker',
  'classcode',
  'edgeline',
  'left_turn_traffic_calming',
  'median_extension',
  'median_island',
  'one-way_conversion',
  'painted_island',
  'painted_traffic_circle',
  'ped_refuge_island',
  'raised_crosswalk',
  'road_diet',
  'schoolzone',
  'schoolzone_speed_limit',
  'slow_street', 
  'speed_bump',
  'speed_cushion',
  'speed_hump',
  'speed_limit',
  'speed_radar_sign',
  'speed_table',
  'striping',
  'traffic_circle',
  'traffic_island'
);

CREATE TABLE IF NOT EXISTS sf_street_features (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL,
  created_at   TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NOT NULL,
  feature_type feature_type NOT NULL, 
  cnn          INTEGER NOT NULL,
  value        JSONB NOT NULL,
  metadata     JSONB
);

CREATE TYPE event_type AS ENUM (
  'traffic_crash',
  'police_incident',
  'emergency_service'
);

CREATE TABLE IF NOT EXISTS sf_events {
  id         BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL,
  occured_at TIMESTAMP NOT NULL,
  event_type event_type NOT NULL, 
  cnn        INTEGER NOT NULL,
  metadata   JSONB
};
*/
EOSQL
