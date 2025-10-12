SET TIME ZONE 'America/Los_Angeles';
-- Function to convert tc_measure to calming_measure for mid-block traffic calming areas
-- Seems like there is only one kind of tc_measure at a time for most of the cases.
-- cnn = 574000 (has two different kinds of tc_measures but actually only has one)
-- cnn = 13796000 (is the only legitimate street segment with more than 1 kind of tc_measure)
-- cnn = 10814000 (is an example where there is two different kinds of tc_measure but one got replace by another)
-- i'm willing to go ahead and assume 1 cnn = 1 tc_measure only 

WITH data_to_add as (
    SELECT
        *
    FROM (
        SELECT
            row_id, 
            objectid, 
            cnn, -- try to get the cnn from the street intersection
            streetname, 
            project_location, 
            from_st, 
            to_st,
            tc_measure, 
            units, 
            install_mo, 
            install_yr, 
            install_datetime, 
            fiscal_yr,
            program, 
            current_status, 
            shape, 
            data_as_of, 
            data_loaded_at,
            ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY install_datetime DESC, row_id DESC) as rn
        FROM
            {data_table_name} as dtn
        WHERE
            dtn.current_status = 'Complete'
            AND
            dtn.cnn IS NOT NULL
            AND
            dtn.install_datetime IS NOT NULL
    )
    WHERE
        rn = 1
),
most_recent_mid_block_level_change AS (
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
            is_on_intersection = false
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
    dta.install_datetime as completed_at,
    dta.cnn as cnn,
    midblock_tc_measure_to_calming_measure(dta.tc_measure) as value,
    false as is_on_intersection,
    json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_datetime', dta.install_datetime,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'to_st', dta.to_st,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'mid_block_row_id', dta.row_id,
        'objectid', dta.objectid
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    most_recent_mid_block_level_change as mrmblc ON mrmblc.cnn = dta.cnn 
WHERE
    mrmblc.cnn IS NULL
    OR
    mrmblc.completed_at < dta.install_datetime; 

UPDATE sf_street_feature_calming_measure AS sf
SET
    metadata = json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_datetime', dta.install_datetime,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'to_st', dta.to_st,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'mid_block_row_id', dta.row_id,
        'objectid', dta.objectid
    )
FROM
     {data_table_name} as dta
WHERE
    sf.cnn = dta.cnn
    AND
    (sf.metadata->>'mid_block_row_id')::INTEGER = dta.row_id
    AND
    sf.metadata != json_build_object(
        'num_units', dta.units,
        'fiscal_yr', dta.fiscal_yr,
        'install_datetime', dta.install_datetime,
        'program', dta.program,
        'shape', ST_AsText(dta.shape),
        'streetname', dta.streetname,
        'to_st', dta.to_st,
        'from_st', dta.from_st,
        'current_status', TRIM(LOWER(dta.current_status)),
        'mid_block_row_id', dta.row_id,
        'objectid', dta.objectid
    )::JSONB;

-- WITH data_to_add as (
--     SELECT
--         *
--     FROM (
--         SELECT
--             row_id, 
--             objectid, 
--             cnn, -- try to get the cnn from the street intersection
--             streetname, 
--             project_location, 
--             from_st, 
--             to_st,
--             tc_measure, 
--             units, 
--             install_mo, 
--             install_yr, 
--             install_datetime, 
--             fiscal_yr,
--             program, 
--             current_status, 
--             shape, 
--             data_as_of, 
--             data_loaded_at,
--             ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY install_datetime DESC, row_id DESC) as rn
--         FROM
--             {data_table_name} as dtn
--         WHERE
--             dtn.current_status = 'Complete'
--             AND
--             dtn.cnn IS NOT NULL
--             AND
--             dtn.install_datetime IS NOT NULL
--     )
--     WHERE
--         rn = 1
-- ),
-- most_recent_mid_block_level_change AS (
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
--             and
--             is_on_intersection = false
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
--     dta.install_datetime as completed_at,
--     'calming_measure' as feature_type,
--     dta.cnn as cnn,
--     false as is_on_intersection,
--     json_build_object('type', 'calming_measure', 'value', midblock_tc_measure_to_calming_measure(dta.tc_measure)) as value,
--     json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_datetime', dta.install_datetime,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'to_st', dta.to_st,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'mid_block_row_id', dta.row_id,
--         'objectid', dta.objectid
--     ) as metadata
-- FROM
--     data_to_add as dta
--     LEFT JOIN 
--     most_recent_mid_block_level_change as mrmblc ON mrmblc.cnn = dta.cnn 
-- WHERE
--     mrmblc.cnn IS NULL
--     OR
--     mrmblc.completed_at < dta.install_datetime; 

-- UPDATE sf_street_features AS sf
-- SET
--     metadata = json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_datetime', dta.install_datetime,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'to_st', dta.to_st,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'mid_block_row_id', dta.row_id,
--         'objectid', dta.objectid
--     )
-- FROM
--      {data_table_name} as dta
-- WHERE
--     sf.cnn = dta.cnn
--     AND
--     (sf.metadata->>'mid_block_row_id')::INTEGER = dta.row_id
--     AND
--     sf.metadata != json_build_object(
--         'num_units', dta.units,
--         'fiscal_yr', dta.fiscal_yr,
--         'install_datetime', dta.install_datetime,
--         'program', dta.program,
--         'shape', ST_AsText(dta.shape),
--         'streetname', dta.streetname,
--         'to_st', dta.to_st,
--         'from_st', dta.from_st,
--         'current_status', TRIM(LOWER(dta.current_status)),
--         'mid_block_row_id', dta.row_id,
--         'objectid', dta.objectid
--     )::JSONB;

--DROP FUNCTION midblock_tc_measure_to_calming_measure;