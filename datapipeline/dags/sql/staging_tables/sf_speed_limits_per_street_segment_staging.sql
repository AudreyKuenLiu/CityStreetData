CREATE TABLE sf_speed_limits_per_street_segment_{suffix} (
    objectid TEXT,
    cnn INTEGER,
    street TEXT,
    st_type TEXT,
    from_st TEXT,
    to_st TEXT,
    speedlimit INTEGER,
    schoolzone TEXT,
    schoolzone_limit INTEGER,
    mtab_date DATETIME,
    mtab_motion TEXT,
    mtab_reso_text TEXT,
    status TEXT,
    workorder TEXT,
    install_date DATETIME,
    shape TEXT,
    data_as_of DATETIME,
    data_loaded_at DATETIME,
    analysis_neighborhood TEXT,
    supervisor_district TEXT
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_speed_limits_per_street_segment_{suffix}
AFTER INSERT ON sf_speed_limits_per_street_segment_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_speed_limits_per_street_segment_{suffix}
    SET 
        mtab_date = dateTimeStrToEpoch(NEW.mtab_date), 
        install_date = dateTimeStrToEpoch(NEW.install_date), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        objectid = NEW.objectid;
END;