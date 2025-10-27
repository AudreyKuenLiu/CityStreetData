CREATE TABLE sf_traffic_crashes_{suffix} (
    unique_id INTEGER,
    cnn_intrsctn_fkey INTEGER,
    cnn_sgmt_fkey INTEGER,
    case_id_pkey INTEGER,
    tb_latitude REAL,
    tb_longitude REAL,
    geocode_source TEXT,
    geocode_location TEXT,
    collision_datetime DATETIME,
    collision_date DATETIME,
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
    distance INTEGER,
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
    point TEXT,
    data_as_of DATETIME,
    data_updated_at DATETIME,
    data_loaded_at DATETIME,
    analysis_neighborhood TEXT,
    supervisor_district TEXT,
    police_district TEXT
);

CREATE INDEX sf_traffic_crashes_{suffix}_unique_id_idx ON sf_traffic_crashes_{suffix}(unique_id);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_traffic_crashes_{suffix}
AFTER INSERT ON sf_traffic_crashes_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_traffic_crashes_{suffix}
    SET 
        collision_datetime = dateTimeStrToEpoch(NEW.collision_datetime), 
        collision_date = dateTimeStrToEpoch(NEW.collision_date), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_updated_at = dateTimeStrToEpoch(NEW.data_updated_at), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        unique_id = NEW.unique_id;
END;