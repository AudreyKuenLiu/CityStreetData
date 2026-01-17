WITH data_to_add as (
    SELECT
        objectid,
        shape,
        classcode,
        cnn,
        f_node_cnn,
        f_st,
        nhood,
        oneway,
        st_type,
        streetname,
        t_st,
        zip_code,
        slw_st,
        length,
        extents,
        status,
        phase,
        install_date,
        agency,
        type,
        supervisor_district,
        data_as_of,
        data_loaded_at
    FROM
        {data_table_name} as dtn
    WHERE
        LOWER(TRIM(dtn.status)) = 'implemented'
        AND
        dtn.cnn is NOT NULL
),
most_recent_slowstreet AS (
    SELECT *
    FROM (
        SELECT 
            cnn,
            completed_at,
            value,
            metadata,
            ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
        FROM
            sf_street_feature_slow_street
    )
    WHERE
        rn = 1
)
INSERT INTO sf_street_feature_slow_street (
    completed_at,
    cnn,
    value,
    metadata
)
SELECT
    dta.install_date as completed_at,
    dta.cnn as cnn,
    lower(dta.streetname) as value,
    json_object(
        'objectid', dta.objectid,
        'length', dta.length,
        'shape', ST_AsText(ST_LineFromText(dta.shape, 4326)),
        'classcode', dta.classcode,
        'f_node_cnn', dta.f_node_cnn,
        'f_st', dta.f_st,
        't_st', dta.t_st,
        'oneway', dta.oneway,
        'extents', dta.extents,
        'status', dta.status,
        'phase', dta.phase,
        'agency', dta.agency,
        'type', dta.type
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    most_recent_slowstreet as mrs ON mrs.cnn = dta.cnn 
WHERE
    mrs.cnn IS NULL
    OR
    mrs.completed_at < dta.install_date;
