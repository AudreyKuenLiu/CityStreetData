CREATE TABLE sf_intersection_level_traffic_calming_devices_{suffix} (
    row_id INTEGER,
    objectid INTEGER,
    cnn INTEGER,
    streetname TEXT,
    project_lo TEXT,
    from_st TEXT,
    tc_measure TEXT,
    units INTEGER,
    install_mo INTEGER,
    install_yr INTEGER,
    install_date DATETIME,
    fiscal_yr TEXT,
    program TEXT,
    current_status TEXT,
    supervisor_district TEXT,
    analysis_neighborhood TEXT,
    data_as_of DATETIME,
    data_loaded_at DATETIME, 
    shape TEXT
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_intersection_level_traffic_calming_devices_{suffix} 
AFTER INSERT ON sf_intersection_level_traffic_calming_devices_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_intersection_level_traffic_calming_devices_{suffix} 
    SET 
        install_date = dateTimeStrToEpoch(NEW.install_date), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        row_id = NEW.row_id;
END;