DROP TABLE IF EXISTS sf_intersection_level_traffic_calming_devices_{suffix};
CREATE TABLE sf_intersection_level_traffic_calming_devices_{suffix} (
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