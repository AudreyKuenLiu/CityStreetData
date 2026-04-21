CREATE TABLE sf_mid_block_traffic_calming_areas_{suffix} (
    row_id INTEGER,
    objectid INTEGER,
    cnn INTEGER,
    nhood TEXT,
    streetname TEXT,
    district TEXT,
    from_st TEXT,
    to_st TEXT,
    project_location TEXT,
    tc_measure TEXT,
    units INTEGER,
    install_mo INTEGER,
    install_yr INTEGER,
    install_datetime DATETIME,
    fiscal_yr TEXT,
    program TEXT,
    current_status TEXT,
    current_ti TEXT,
    next_step TEXT,
    next_step_2 TEXT,
    shape TEXT,
    data_as_of DATETIME,
    data_loaded_at DATETIME 
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_mid_block_traffic_calming_areas_{suffix} 
AFTER INSERT ON sf_mid_block_traffic_calming_areas_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_mid_block_traffic_calming_areas_{suffix}
    SET 
        install_datetime = dateTimeStrToEpoch(NEW.install_datetime), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        row_id = NEW.row_id;
END;