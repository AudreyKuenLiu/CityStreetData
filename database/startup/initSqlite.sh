#!/bin/bash

set -e

# Load PostGIS into both template_database and $POSTGRES_DB
echo "setting up DB"
sqlite3 $SQLITE_DB <<-'EOSQL'
    PRAGMA journal_mode = WAL;
    SELECT load_extension('mod_spatialite');
    SELECT InitSpatialMetaData();

    CREATE TABLE IF NOT EXISTS sf_streets_and_intersections (
        id                     INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at             INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at             INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        cnn                    INTEGER,
        lf_fadd                INTEGER,
        lf_toadd               INTEGER,
        rt_fadd                INTEGER,
        rt_toadd               INTEGER,
        street                 TEXT,
        st_type                TEXT,
        f_st                   TEXT,
        t_st                   TEXT,
        f_node_cnn             INTEGER,
        t_node_cnn             INTEGER,
        accepted               BOOLEAN,
        active                 BOOLEAN,
        date_public_works_added INTEGER,
        date_public_works_altered INTEGER,
        date_public_works_dropped INTEGER,
        jurisdiction           TEXT,
        layer                  TEXT,
        nhood                  TEXT,
        oneway                 TEXT,
        street_gc              TEXT,
        streetname             TEXT,
        streetname_gc          TEXT,
        zip_code               INTEGER,
        analysis_neighborhood  TEXT,
        supervisor_district    TEXT
    );
    SELECT AddGeometryColumn('sf_streets_and_intersections', 'line', 4326, 'LINESTRING', 2);
    SELECT CreateSpatialIndex('sf_streets_and_intersections', 'line');
    CREATE UNIQUE INDEX sf_streets_and_intersections_cnn_idx ON sf_streets_and_intersections(cnn); 

    CREATE TRIGGER update_sf_streets_and_intersections_time AFTER UPDATE ON sf_streets_and_intersections
    BEGIN
        UPDATE sf_streets_and_intersections SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_street_feature_classcode (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        completed_at INTEGER NOT NULL,
        removed_at   INTEGER,
        cnn          INTEGER NOT NULL,
        value        TEXT NOT NULL CHECK(value in ('other', 'freeway', 'highway_or_major_street', 'arterial', 'collector', 'residential','freeway_ramp')), 
        is_active    BOOLEAN
    );
    CREATE INDEX sf_street_feature_classcode_cnn_idx ON sf_street_feature_classcode(cnn); 
    CREATE INDEX sf_street_feature_classcode_value_idx ON sf_street_feature_classcode(value); 

    CREATE TRIGGER update_sf_street_feature_classcode_time AFTER UPDATE ON sf_street_feature_classcode 
    BEGIN
        UPDATE sf_street_feature_classcode SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_street_feature_school_zone (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        completed_at INTEGER NOT NULL,
        removed_at   INTEGER,
        cnn          INTEGER NOT NULL,
        value        INTEGER NOT NULL, --Speed Limit in MPH
        metadata     JSONB,
        unit         TEXT NOT NULL CHECK(unit in ('mph')), 
        is_active    BOOLEAN NOT NULL
    );
    CREATE INDEX sf_street_feature_school_zone_cnn_idx ON sf_street_feature_school_zone(cnn); 

    CREATE TRIGGER update_sf_street_feature_school_zone_time AFTER UPDATE ON sf_street_feature_school_zone
    BEGIN
        UPDATE sf_street_feature_school_zone SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_street_feature_speed_limit (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        completed_at INTEGER NOT NULL,
        removed_at   INTEGER,
        cnn          INTEGER NOT NULL,
        value        INTEGER NOT NULL, --Speed Limit in MPH
        metadata     JSONB,
        unit         TEXT NOT NULL CHECK(unit in ('mph')),
        use_defacto_limit BOOLEAN NOT NULL
    );
    CREATE INDEX sf_street_feature_speed_limit_cnn_idx ON sf_street_feature_speed_limit(cnn); 

    CREATE TRIGGER update_sf_street_feature_speed_limit_time AFTER UPDATE ON sf_street_feature_speed_limit 
    BEGIN
        UPDATE sf_street_feature_speed_limit SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_street_feature_slow_street (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        completed_at INTEGER NOT NULL,
        removed_at   INTEGER,
        cnn          INTEGER NOT NULL,
        value        TEXT NOT NULL,
        metadata     JSONB
    );
    CREATE INDEX sf_street_feature_slow_street_cnn_idx ON sf_street_feature_slow_street(cnn); 

    CREATE TRIGGER update_sf_street_feature_slow_street_time AFTER UPDATE ON sf_street_feature_slow_street
    BEGIN
        UPDATE sf_street_feature_slow_street_zone SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_street_feature_calming_measure (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at   INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        completed_at INTEGER NOT NULL,
        removed_at   INTEGER,
        cnn          INTEGER NOT NULL,
        value        TEXT NOT NULL CHECK(
            value in (
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
            )),
        metadata     JSONB,
        is_on_intersection BOOLEAN NOT NULL 
    );
    CREATE INDEX sf_street_feature_calming_measure_cnn_idx ON sf_street_feature_calming_measure(cnn); 

    CREATE TRIGGER update_sf_street_feature_calming_measure_time AFTER UPDATE ON sf_street_feature_calming_measure
    BEGIN
        UPDATE sf_street_feature_calming_measure SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_events_traffic_crashes (
        id                 INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at         INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        occured_at         INTEGER NOT NULL,
        cnn                INTEGER NOT NULL,
        is_on_intersection BOOLEAN NOT NULL, 
        collision_severity TEXT NOT NULL CHECK(
            collision_severity IN (
                'medical',
                'other_visible',
                'fatal',
                'severe',
                'complaint_of_pain'
            )),
        collision_type     TEXT NOT NULL CHECK(
            collision_type IN (
                'vehicle_pedestrian',
                'broadside',
                'rear_end',
                'hit_object',
                'sideswipe',
                'overturned',
                'other',
                'head_on',
                'not_stated'
            )),
        number_killed      INTEGER NOT NULL, --fatal
        number_injured     INTEGER NOT NULL, --severe, complaint_of_pain, other_visible
        sf_data_id         INTEGER NOT NULL,
        metadata           JSONB
    );
    SELECT AddGeometryColumn('sf_events_traffic_crashes', 'point', 4326, 'POINT', 2);
    SELECT CreateSpatialIndex('sf_events_traffic_crashes', 'point');
    CREATE INDEX sf_events_traffic_crashes_cnn_idx on sf_events_traffic_crashes(cnn);
    CREATE INDEX sf_events_traffic_crashes_sf_data_id on sf_events_traffic_crashes(sf_data_id);
    --CREATE INDEX sf_events_traffic_crashes_crash_unique_id on sf_events_traffic_crashes(metadata->>'$.crash_unique_id');


    CREATE TRIGGER update_sf_events_traffic_crashes_time AFTER UPDATE ON sf_events_traffic_crashes
    BEGIN
        UPDATE sf_events_traffic_crashes SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

    CREATE TABLE IF NOT EXISTS sf_events_traffic_arrests (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        updated_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        created_at      INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        occured_at      INTEGER NOT NULL,
        cnn             INTEGER NOT NULL,
        arrest_category TEXT NOT NULL CHECK(
            arrest_category IN (
                'traffic_collision',
                'traffic_violation_arrest'
            )),
        sf_data_id      INTEGER NOT NULL,
        metadata        JSONB
    );
    SELECT AddGeometryColumn('sf_events_traffic_arrests', 'point', 4326, 'POINT', 2);
    SELECT CreateSpatialIndex('sf_events_traffic_arrests', 'point');
    CREATE INDEX sf_events_traffic_arrests_cnn_idx on sf_events_traffic_arrests(cnn);
    CREATE INDEX sf_events_traffic_arrests_sf_data_id on sf_events_traffic_arrests(sf_data_id);
    --CREATE INDEX sf_events_traffic_arrests_crash_row_id on sf_events_traffic_arrests(CAST(json_extract(metadata, '$.row_id') AS INTEGER));

    CREATE TRIGGER update_sf_events_traffic_arrests_time AFTER UPDATE ON sf_events_traffic_arrests 
    BEGIN
        UPDATE sf_events_traffic_arrests SET updated_at = strftime('%s','now') WHERE id = NEW.id;
    END;

EOSQL
