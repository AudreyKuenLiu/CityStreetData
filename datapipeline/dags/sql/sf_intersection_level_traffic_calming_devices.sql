WITH data_to_add as (
    SELECT
        row_id, 
        objectid, 
        CASE WHEN dtn.cnn is NULL THEN sfi.f_node_cnn ELSE dtn.cnn END as cnn, -- try to get the cnn from the street intersection
        dtn.streetname, 
        project_lo, 
        from_st, 
        tc_measure, 
        units, 
        install_mo, 
        install_yr, 
        install_date, 
        fiscal_yr,
        program, 
        current_status, 
        dtn.supervisor_district, 
        dtn.analysis_neighborhood, 
        dtn.shape, 
        dtn.data_as_of, 
        dtn.data_loaded_at 
    FROM
        {data_table_name} as dtn
        LEFT JOIN
        sf_streets_and_intersections sfi ON LOWER(CONCAT(sfi.streetname, ' ', sfi.st_type)) = LOWER(dtn.streetname) AND LOWER(sfi.f_st) = LOWER(replace(dtn.from_st, '\', '\\'))
    WHERE
        lower(dtn.current_status) = 'complete'
        AND
        (dtn.cnn IS NOT NULL OR sfi.cnn IS NOT NULL) -- if no cnn can be found we should not put it in the db
),
most_recent_intersection_level_change AS (
    SELECT *
    FROM (
        SELECT 
            cnn,
            completed_at,
            value,
            metadata,
            ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
        FROM
            sf_street_feature_calming_measure
        WHERE
            is_on_intersection = true
    )
    WHERE
        rn = 1
)
INSERT INTO sf_street_feature_calming_measure(
    completed_at,
    cnn,
    value,
    is_on_intersection, 
    metadata
)
SELECT
    CASE WHEN dta.install_date = '1900-01-01' AND fiscal_yr is NOT NULL THEN
        to_timestamp(substring(fiscal_yr FROM '(\d{{4}})$') || '-01-01', 'YYYY-MM-DD')
    WHEN dta.install_date is NOT NULL THEN dta.install_date
    ELSE dta.data_as_of END as completed_at,
    dta.cnn as cnn,
    intersection_tc_measure_to_calming_measure(dta.tc_measure) as value,
    true as is_on_intersection,
    json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_date', dta.install_date,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'row_id', dta.row_id,
        'objectid', dta.objectid
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    most_recent_intersection_level_change as mrilc ON mrilc.cnn = dta.cnn 
WHERE
    mrilc.cnn IS NULL
    OR
    mrilc.completed_at < dta.install_date;


UPDATE sf_street_feature_calming_measure AS sf
SET
    metadata = json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_date', dta.install_date,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'intersection_row_id', dta.row_id,
        'objectid', dta.objectid
    )
FROM
     {data_table_name} as dta
WHERE
    sf.cnn = dta.cnn
    AND
    (sf.metadata->>'intersection_row_id')::INTEGER = dta.row_id
    AND
    sf.metadata != json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_date', dta.install_date,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'intersection_row_id', dta.row_id,
        'objectid', dta.objectid
    )::JSONB;

-- WITH data_to_add as (
--     SELECT
--         row_id, 
--         objectid, 
--         CASE WHEN dtn.cnn is NULL THEN sfi.f_node_cnn ELSE dtn.cnn END as cnn, -- try to get the cnn from the street intersection
--         dtn.streetname, 
--         project_lo, 
--         from_st, 
--         tc_measure, 
--         units, 
--         install_mo, 
--         install_yr, 
--         install_date, 
--         fiscal_yr,
--         program, 
--         current_status, 
--         dtn.supervisor_district, 
--         dtn.analysis_neighborhood, 
--         dtn.shape, 
--         dtn.data_as_of, 
--         dtn.data_loaded_at 
--     FROM
--         {data_table_name} as dtn
--         LEFT JOIN
--         sf_streets_and_intersections sfi ON LOWER(CONCAT(sfi.streetname, ' ', sfi.st_type)) = LOWER(dtn.streetname) AND LOWER(sfi.f_st) = LOWER(replace(dtn.from_st, '\', '\\'))
--     WHERE
--         lower(dtn.current_status) = 'complete'
--         AND
--         (dtn.cnn IS NOT NULL OR sfi.cnn IS NOT NULL) -- if no cnn can be found we should not put it in the db
-- ),
-- most_recent_intersection_level_change AS (
--     SELECT *
--     FROM (
--         SELECT 
--             cnn,
--             completed_at,
--             value,
--             metadata,
--             ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
--         FROM
--             sf_street_features
--         WHERE
--             feature_type = 'calming_measure'
--             AND
--             is_on_intersection = true
--     )
--     WHERE
--         rn = 1
-- )
-- INSERT INTO sf_street_features (
--     completed_at,
--     feature_type,
--     cnn,
--     is_on_intersection,
--     value,
--     metadata
-- )
-- SELECT
--     CASE WHEN dta.install_date = '1900-01-01' AND fiscal_yr is NOT NULL THEN
--         to_timestamp(substring(fiscal_yr FROM '(\d{{4}})$') || '-01-01', 'YYYY-MM-DD')
--     ELSE 
--         dta.install_date END as completed_at,
--     'calming_measure' as feature_type,
--     dta.cnn as cnn,
--     true as is_on_intersection,
--     json_build_object('type', 'calming_measure', 'value', intersection_tc_measure_to_calming_measure(dta.tc_measure)) as value,
--     json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_date', dta.install_date,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'row_id', dta.row_id,
--         'objectid', dta.objectid
--     ) as metadata
-- FROM
--     data_to_add as dta
--     LEFT JOIN 
--     most_recent_intersection_level_change as mrilc ON mrilc.cnn = dta.cnn 
-- WHERE
--     mrilc.cnn IS NULL
--     OR
--     mrilc.completed_at < dta.install_date;


-- UPDATE sf_street_features AS sf
-- SET
--     metadata = json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_date', dta.install_date,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'intersection_row_id', dta.row_id,
--         'objectid', dta.objectid
--     )
-- FROM
--      {data_table_name} as dta
-- WHERE
--     sf.cnn = dta.cnn
--     AND
--     (sf.metadata->>'intersection_row_id')::INTEGER = dta.row_id
--     AND
--     sf.metadata != json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_date', dta.install_date,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'intersection_row_id', dta.row_id,
--         'objectid', dta.objectid
--     )::JSONB;

--DROP FUNCTION intersection_tc_measure_to_calming_measure;