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

EOSQL
