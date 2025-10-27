CREATE TABLE sf_slow_streets_{suffix} (
    objectid INTEGER,
    shape TEXT,
    classcode INTEGER,
    cnn INTEGER,
    f_node_cnn INTEGER,
    f_st TEXT,
    nhood TEXT,
    oneway TEXT,
    st_type TEXT,
    streetname TEXT,
    t_st TEXT,
    zip_code INTEGER,
    slw_st INTEGER,
    length INTEGER,
    extents TEXT,
    status TEXT,
    phase INTEGER,
    install_date DATETIME,
    agency TEXT,
    type TEXT,
    supervisor_district TEXT,
    data_as_of DATETIME,
    data_loaded_at DATETIME 
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_slow_streets_{suffix}
AFTER INSERT ON sf_slow_streets_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_slow_streets_{suffix}
    SET 
        install_date = dateTimeStrToEpoch(NEW.install_date), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        cnn = NEW.cnn;
END;