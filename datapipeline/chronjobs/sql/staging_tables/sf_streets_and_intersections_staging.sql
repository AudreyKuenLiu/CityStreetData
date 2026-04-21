CREATE TABLE IF NOT EXISTS sf_streets_and_intersections_{suffix} (
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
    classcode              INTEGER,
    date_added             DATETIME,
    date_altered           DATETIME,
    date_dropped           DATETIME,
    gds_chg_id_add         TEXT,
    gds_chg_id_altered     TEXT,
    gds_chg_id_dropped     TEXT,
    jurisdiction           TEXT,
    layer                  TEXT,
    nhood                  TEXT,
    oneway                 TEXT,
    street_gc              TEXT,
    streetname             TEXT,
    streetname_gc          TEXT,
    zip_code               INTEGER,
    line                   TEXT,
    analysis_neighborhood  TEXT,
    supervisor_district    TEXT,
    data_as_of             DATETIME,
    data_loaded_at         DATETIME
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_streets_and_intersections_{suffix} 
AFTER INSERT ON sf_streets_and_intersections_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_streets_and_intersections_{suffix} 
    SET 
        date_added = dateTimeStrToEpoch(NEW.date_added), 
        date_altered = dateTimeStrToEpoch(NEW.date_altered), 
        date_dropped = dateTimeStrToEpoch(NEW.date_dropped), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        cnn = NEW.cnn;
END;