#!/bin/bash

set -e

# Perform all actions as $POSTGRES_USER
export PGUSER="$POSTGRES_USER"

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
CREATE INDEX sf_streets_and_intersections_line_idx ON sf_streets_and_intersections USING GIST(line);
CREATE INDEX sf_streets_and_intersections_cnn_idx ON sf_streets_and_intersections(cnn); 

CREATE TYPE speed_limit_unit AS ENUM (
  'mph'
);

/*
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
  removed_at   TIMESTAMP,
  feature_type feature_type NOT NULL, 
  cnn          INTEGER NOT NULL,
  is_on_intersection BOOLEAN NOT NULL, 
  value        JSONB NOT NULL,
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_features_time BEFORE UPDATE ON sf_street_features FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_features_cnn_idx ON sf_street_features(cnn); 
*/

CREATE TYPE class_code as ENUM (
	'other',
	'freeway',
	'highway_or_major_street',
	'arterial',
	'collector',
	'residential',
	'freeway_ramp'
);

CREATE TABLE IF NOT EXISTS sf_street_feature_classcode (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  removed_at   TIMESTAMP,
  cnn          INTEGER NOT NULL,
  value        class_code NOT NULL, 
  is_active    BOOLEAN
);
CREATE TRIGGER update_sf_street_feature_classcode BEFORE UPDATE ON sf_street_feature_classcode FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_feature_classcode_cnn_idx ON sf_street_feature_classcode(cnn); 
CREATE INDEX sf_street_feature_classcode_value_idx ON sf_street_feature_classcode(value); 

CREATE TABLE IF NOT EXISTS sf_street_feature_school_zone (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  removed_at   TIMESTAMP,
  cnn          INTEGER NOT NULL,
  value        INTEGER NOT NULL, --Speed Limit in MPH
  unit         speed_limit_unit NOT NULL, 
  is_active    BOOLEAN NOT NULL,
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_feature_school_zone_time BEFORE UPDATE ON sf_street_feature_school_zone FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_feature_school_zone_cnn_idx ON sf_street_feature_school_zone(cnn); 

CREATE TABLE IF NOT EXISTS sf_street_feature_slow_street (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  removed_at   TIMESTAMP,
  cnn          INTEGER NOT NULL,
  value        TEXT NOT NULL,
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_feature_slow_street_time BEFORE UPDATE ON sf_street_feature_slow_street FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_feature_slow_street_cnn_idx ON sf_street_feature_slow_street(cnn); 

CREATE TABLE IF NOT EXISTS sf_street_feature_speed_limit (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  removed_at   TIMESTAMP,
  cnn          INTEGER NOT NULL,
  value        INTEGER NOT NULL, --Speed Limit in MPH
  unit         speed_limit_unit NOT NULL, 
  use_defacto_limit BOOLEAN NOT NULL,
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_feature_speed_limit_time BEFORE UPDATE ON sf_street_feature_speed_limit FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_feature_speed_limit_cnn_idx ON sf_street_feature_speed_limit(cnn); 

CREATE TYPE calming_measure AS ENUM (
    'median_extension',
    'channelization',
    'speed_hump',
    'ped_refuge_island',
    'chicane',
    'median_island',
    'traffic_circle',
    'left_turn_traffic_calming',
    'painted_traffic_circle',
    'traffic_island',
    'speed_table',
    'painted_island',
    'raised_crosswalk',
    'centerline_hardening_w_rubber_humps',
    'speed_radar_sign',
    'choker',
    'striping',
    '5_lump_speed_cushion',
    '7_lump_speed_cushion',
    '3_lump_speed_cushion',
    '4_lump_speed_cushion',
    'speed_cushion',
    'speed_bump',
    'road_diet',
    'edgeline',
    '6_lump_speed_cushion',
    'one_way_conversion',
    '2_lump_speed_cushion'
);

CREATE TABLE IF NOT EXISTS sf_street_feature_calming_measure (
  id           BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP NOT NULL,
  removed_at   TIMESTAMP,
  cnn          INTEGER NOT NULL,
  value        calming_measure NOT NULL,
  is_on_intersection BOOLEAN NOT NULL, 
  metadata     JSONB
);
CREATE TRIGGER update_sf_street_feature_calming_measure_time BEFORE UPDATE ON sf_street_feature_calming_measure FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_street_feature_calming_measure_cnn_idx ON sf_street_feature_calming_measure(cnn); 

/*
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
CREATE INDEX sf_events_point_idx ON sf_events USING GIST(point);
CREATE INDEX sf_events_cnn_idx on sf_events(cnn);
*/

CREATE TYPE collision_severity AS ENUM (
  'medical',
  'other_visible',
  'fatal',
  'severe',
  'complaint_of_pain'
);

CREATE TYPE collision_type AS ENUM (
  'vehicle_pedestrian',
  'broadside',
  'rear_end',
  'hit_object',
  'sideswipe',
  'overturned',
  'other',
  'head_on',
  'not_stated'
);

CREATE TABLE IF NOT EXISTS sf_events_traffic_crashes (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMP NOT NULL DEFAULT NOW(),
  occured_at         TIMESTAMP NOT NULL,
  cnn                INTEGER NOT NULL,
  point              geometry(Point, 4326),
  is_on_intersection BOOLEAN NOT NULL, 
  collision_severity collision_severity NOT NULL,
  collision_type  collision_type NOT NULL,
  number_killed      INTEGER NOT NULL, --fatal
  number_injured     INTEGER NOT NULL, --severe, complaint_of_pain, other_visible
  metadata           JSONB
);
CREATE TRIGGER update_sf_events_traffic_crashes_time BEFORE UPDATE ON sf_events_traffic_crashes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_events_traffic_crashes_point_idx ON sf_events_traffic_crashes USING GIST(point);
CREATE INDEX sf_events_traffic_crashes_cnn_idx on sf_events_traffic_crashes(cnn);

CREATE TYPE arrest_category AS ENUM (
  'traffic_collision',
  'traffic_violation_arrest'
);

CREATE TABLE IF NOT EXISTS sf_events_traffic_arrests (
  id              BIGINT GENERATED ALWAYS AS IDENTITY primary key,
  updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
  occured_at      TIMESTAMP NOT NULL,
  cnn             INTEGER NOT NULL,
  point           geometry(Point, 4326),
  arrest_category arrest_category,
  metadata        JSONB
);
CREATE TRIGGER update_sf_events_traffic_arrests_time BEFORE UPDATE ON sf_events_traffic_arrests FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE INDEX sf_events_traffic_arrests_point_idx ON sf_events_traffic_arrests USING GIST(point);
CREATE INDEX sf_events_traffic_arrests_cnn_idx on sf_events_traffic_arrests(cnn);

CREATE OR REPLACE FUNCTION integer_to_class_code(int_class_code INTEGER)
RETURNS class_code AS $$
BEGIN
    RETURN CASE int_class_code
        WHEN 0 THEN 'other'
        WHEN 1 THEN 'freeway'
        WHEN 2 THEN 'highway_or_major_street'
        WHEN 3 THEN 'arterial'
        WHEN 4 THEN 'collector'
        WHEN 5 THEN 'residential'
        WHEN 6 THEN 'freeway_ramp'
        ELSE 'other'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION intersection_tc_measure_to_calming_measure(tc_measure text)
RETURNS calming_measure AS $$
BEGIN
    RETURN CASE TRIM(LOWER(tc_measure))
        WHEN 'median extension' THEN 'median_extension'
        WHEN 'channelization' THEN 'channelization'
        WHEN 'speed hump' THEN 'speed_hump'
        WHEN 'ped refuge island' THEN 'ped_refuge_island'
        WHEN 'chicane' THEN 'chicane'
        WHEN 'median island' THEN 'median_island'
        WHEN 'traffic circle' THEN 'traffic_circle'
        WHEN 'left turn traffic calming' THEN 'left_turn_traffic_calming'
        WHEN 'painted traffic circle' THEN 'painted_traffic_circle'
        WHEN 'traffic island' THEN 'traffic_island'
        WHEN 'speed table' THEN 'speed_table'
        WHEN 'painted island' THEN 'painted_island'
        WHEN 'raised crosswalk' THEN 'raised_crosswalk'
        WHEN 'centerline hardening w/rubber humps' THEN 'centerline_hardening_w_rubber_humps'
        WHEN 'speed radar sign' THEN 'speed_radar_sign'
        WHEN 'choker' THEN 'choker'
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION midblock_tc_measure_to_calming_measure(tc_measure text)
RETURNS calming_measure AS $$
BEGIN
	RETURN CASE TRIM(LOWER(tc_measure))
		WHEN 'striping' THEN 'striping'
		WHEN 'speed radar sign' THEN 'speed_radar_sign'
		WHEN 'choker' THEN 'choker'
		WHEN '5-lump speed cushion' THEN '5_lump_speed_cushion'
		WHEN 'channelization' THEN 'channelization'
		WHEN '7-lump speed cushion' THEN '7_lump_speed_cushion'
		WHEN 'speed hump' THEN 'speed_hump'
		WHEN '3-lump speed cushion' THEN '3_lump_speed_cushion'
		WHEN '4-lump speed cushion' THEN '4_lump_speed_cushion'
		WHEN 'chicane' THEN 'chicane'
		WHEN 'speed cushion' THEN 'speed_cushion'
		WHEN 'speed bump' THEN 'speed_bump'
		WHEN 'road diet' THEN 'road_diet'
		WHEN 'edgeline' THEN 'edgeline'
		WHEN '6-lump speed cushion' THEN '6_lump_speed_cushion'
		WHEN 'one-way conversion' THEN 'one_way_conversion'
		WHEN 'traffic island' THEN 'traffic_island'
		WHEN '2-lump speed cushion' THEN '2_lump_speed_cushion'
		WHEN 'speed table' THEN 'speed_table'
		WHEN 'raised crosswalk' THEN 'raised_crosswalk'
		ELSE NULL
	END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION text_to_collision_type(tc_measure text)
RETURNS collision_type AS $$
BEGIN
	RETURN CASE TRIM(LOWER(tc_measure))
    WHEN 'vehicle/pedestrian' THEN 'vehicle_pedestrian'
    WHEN 'broadside' THEN 'broadside'
    WHEN 'rear end' THEN 'rear_end'
    WHEN 'hit object' THEN 'hit_object'
    WHEN 'sideswipe' THEN 'sideswipe'
    WHEN 'overturned' THEN 'overturned'
    WHEN 'other' THEN 'other'
    WHEN 'head-on' THEN 'head_on'
    WHEN 'not stated' THEN 'not_stated'
		ELSE NULL
	END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION text_to_collision_severity(tc_measure text)
RETURNS collision_severity AS $$
BEGIN
	RETURN CASE TRIM(LOWER(tc_measure))
    WHEN 'medical' THEN 'medical'
    WHEN 'fatal' THEN 'fatal'
    WHEN 'injury (other visible)' THEN 'other_visible'
    WHEN 'injury (severe)' THEN 'severe'
    WHEN 'injury (complaint of pain)' THEN 'complaint_of_pain'
		ELSE NULL
	END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION text_to_arrest_category(tc_measure text)
RETURNS arrest_category AS $$
BEGIN
	RETURN CASE TRIM(LOWER(tc_measure))
    WHEN 'traffic collision' THEN 'traffic_collision'
    WHEN 'traffic violation arrest' THEN 'traffic_violation_arrest'
		ELSE NULL
	END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

EOSQL
