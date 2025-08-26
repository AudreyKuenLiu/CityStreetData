DROP TABLE IF EXISTS sf_speed_limits_per_street_segment_{suffix};
CREATE TABLE sf_speed_limits_per_street_segment_{suffix} (
    objectid VARCHAR(64),
    cnn INTEGER,
    street VARCHAR(64),
    st_type VARCHAR(8),
    from_st VARCHAR(64),
    to_st VARCHAR(64),
    speedlimit SMALLINT,
    schoolzone VARCHAR(8),
    schoolzone_limit SMALLINT,
    mtab_date TIMESTAMP,
    mtab_motion VARCHAR(32),
    mtab_reso_text VARCHAR(32),
    status VARCHAR(32),
    workorder VARCHAR(16),
    install_date TIMESTAMP,
    shape geometry(MultiLineString, 4326),
    data_as_of TIMESTAMP,
    data_loaded_at TIMESTAMP,
    analysis_neighborhood VARCHAR(64),
    supervisor_district VARCHAR(32)
);