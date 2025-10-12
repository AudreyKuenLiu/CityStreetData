SET TIME ZONE 'America/Los_Angeles';
-- if schoolezone = YES then schoolzone_limit > 0 - the opposite is also true
-- you can also have a school zone + a different speed limit on the street
-- okay i think what i should do is still collapse these by CNN and then make the decision later whether
-- to display x or y

-- generally there is only one objectID/speed limit per speed segment. 
-- the exceptions are (4216000, 7553000, 0, 5769000) 
-- There are actually cases where the same street segment can have two speed limits
-- which is honestly really rare.
-- what I could do is just join on cnn and shape instead of just the cnn.
-- I also need to write code to backfill the historical speed limits on these streets.

-- there are different statuses that the speed limit can have. which are Implemented(I) and Legislated(L)
-- however it is not uncommon to see something legislated but actually implemented :(
-- it is also possible to have something implemented but no install date :(

-- i'm going to have to say that if it is legislated it is going to be implemented - even though it might not actually be
-- we may have to make an assuption here that mtab_date will be the completed at date if there is no install_date :(
-- I am going to have to make more assumptions here that the data I get from SF will always have the most up-to-date 
-- speed limits for every street segment including subsegments.

WITH data_to_add AS (
    SELECT * 
    FROM (
        SELECT
            objectid, 
            cnn, 
            street, 
            st_type, 
            from_st, 
            to_st, 
            speedlimit, 
            schoolzone, 
            schoolzone_limit, 
            mtab_date,
            mtab_motion, 
            mtab_reso_text, 
            install_date,
            MAX(COALESCE(install_date, mtab_date, '1900-01-01')) OVER(PARTITION BY cnn) as assumed_install_date, 
            status, 
            workorder, 
            shape, 
            data_as_of, 
            data_loaded_at, 
            analysis_neighborhood, 
            supervisor_district,
            DENSE_RANK() OVER (PARTITION BY cnn, shape ORDER BY objectid DESC) as rn
        FROM
            {data_table_name}
        WHERE
            cnn != 0
    )
    WHERE
        rn = 1
),
most_recent_speedlimit_change AS (
    SELECT *
    FROM (
        SELECT 
            cnn,
            completed_at,
            value,
            metadata,
            DENSE_RANK() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
        FROM
            sf_street_feature_speed_limit
    )
    WHERE
        rn = 1
)
INSERT INTO sf_street_feature_speed_limit (
    completed_at,
    cnn,
    value,
    unit, 
    use_defacto_limit,
    metadata
)
SELECT
    dta.assumed_install_date as completed_at,
    dta.cnn as cnn,
    COALESCE(dta.speedlimit, 0) as value,
    'mph' as unit, 
    CASE WHEN COALESCE(dta.speedlimit, 0) = 0 THEN true ELSE false END as use_defacto_limit, --if there is no speed limit defined we need to use defacto limit
    json_build_object(
        'mtab_date', mtab_date, 
        'mtab_motion', mtab_motion, 
        'mtab_reso_text', mtab_reso_text, 
        'status', status, 
        'workorder', workorder, 
        'install_date', install_date, 
        'shape', ST_AsText(shape), 
        'data_as_of', data_as_of, 
        'data_loaded_at', data_loaded_at
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN
    most_recent_speedlimit_change as slc ON slc.cnn = dta.cnn AND ST_Equals(ST_GeomFromText(slc.metadata->>'shape', 4326), dta.shape)
WHERE
    slc.cnn IS NULL
    OR
    (slc.value != dta.speedlimit AND slc.completed_at < dta.assumed_install_date);

WITH data_to_add AS (
    SELECT * 
    FROM (
        SELECT
            objectid, 
            cnn, 
            street, 
            st_type, 
            from_st, 
            to_st, 
            speedlimit, 
            schoolzone, 
            schoolzone_limit, 
            mtab_date, 
            mtab_motion, 
            mtab_reso_text, 
            status, 
            workorder, 
            install_date, 
            MAX(COALESCE(install_date, mtab_date, '1900-01-01')) OVER(PARTITION BY cnn) as assumed_install_date, 
            shape, 
            data_as_of, 
            data_loaded_at, 
            analysis_neighborhood, 
            supervisor_district,
            DENSE_RANK() OVER (PARTITION BY cnn, shape ORDER BY objectid DESC) as rn
        FROM
            {data_table_name}
        WHERE
            cnn != 0
    )
    WHERE
        rn = 1
),
most_recent_schoolzone_change AS (
    SELECT *
    FROM (
        SELECT 
            cnn,
            completed_at,
            value,
            metadata,
            DENSE_RANK() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
        FROM
            sf_street_feature_school_zone
    )
    WHERE
        rn = 1
)
INSERT INTO sf_street_feature_school_zone (
    completed_at,
    cnn,
    value,
    unit, 
    is_active,
    metadata
)
SELECT
    dta.assumed_install_date as completed_at,
    dta.cnn as cnn,
    COALESCE(dta.schoolzone_limit, 0) as value, -- schoolzone_limit of 0 means there is no school zone
    'mph' as unit,
    CASE WHEN COALESCE(dta.schoolzone_limit, 0) > 0 THEN true ELSE false END as is_active,
    json_build_object(
        'mtab_date', mtab_date,
        'mtab_motion', mtab_motion,
        'mtab_reso_text', mtab_reso_text,
        'status', status,
        'workorder', workorder,
        'install_date', install_date,
        'shape', ST_AsText(shape),
        'data_as_of', data_as_of,
        'data_loaded_at', data_loaded_at
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN
    most_recent_schoolzone_change as szc ON szc.cnn = dta.cnn AND ST_Equals(ST_GeomFromText(szc.metadata->>'shape', 4326), dta.shape)
WHERE
    szc.cnn IS NULL
    OR
    (szc.value != COALESCE(dta.schoolzone_limit, 0) AND szc.completed_at < dta.assumed_install_date);



-- WITH data_to_add AS (
--     SELECT * 
--     FROM (
--         SELECT
--             objectid, 
--             cnn, 
--             street, 
--             st_type, 
--             from_st, 
--             to_st, 
--             speedlimit, 
--             schoolzone, 
--             schoolzone_limit, 
--             mtab_date,
--             mtab_motion, 
--             mtab_reso_text, 
--             install_date,
--             MAX(COALESCE(install_date, mtab_date, '1900-01-01')) OVER(PARTITION BY cnn) as assumed_install_date, 
--             status, 
--             workorder, 
--             shape, 
--             data_as_of, 
--             data_loaded_at, 
--             analysis_neighborhood, 
--             supervisor_district,
--             DENSE_RANK() OVER (PARTITION BY cnn, shape ORDER BY objectid DESC) as rn
--         FROM
--             {data_table_name}
--         WHERE
--             cnn != 0
--     )
--     WHERE
--         rn = 1
-- ),
-- most_recent_speedlimit_change AS (
--     SELECT *
--     FROM (
--         SELECT 
--             cnn,
--             completed_at,
--             value,
--             metadata,
--             DENSE_RANK() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
--         FROM
--             sf_street_features
--         WHERE
--             feature_type = 'speed_limit'
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
--     dta.assumed_install_date as completed_at,
--     'speed_limit' as feature_type,
--     dta.cnn as cnn,
--     false as is_on_intersection,
--     json_build_object('type', '"integer"', 'value', COALESCE(dta.speedlimit, 0)) as value,
--     json_build_object(
--         'unit', 'mph', 
--         'use_defacto_limit', CASE WHEN COALESCE(dta.speedlimit, 0) = 0 THEN true ELSE false END, --if there is no speed limit defined we need to use defacto limit
--         'mtab_date', mtab_date, 
--         'mtab_motion', mtab_motion, 
--         'mtab_reso_text', mtab_reso_text, 
--         'status', status, 
--         'workorder', workorder, 
--         'install_date', install_date, 
--         'shape', ST_AsText(shape), 
--         'data_as_of', data_as_of, 
--         'data_loaded_at', data_loaded_at
--     ) as metadata
-- FROM
--     data_to_add as dta
--     LEFT JOIN
--     most_recent_speedlimit_change as slc ON slc.cnn = dta.cnn AND ST_Equals(ST_GeomFromText(slc.metadata->>'shape', 4326), dta.shape)
-- WHERE
--     slc.cnn IS NULL
--     OR
--     ((slc.value->>'value')::INTEGER != dta.speedlimit AND slc.completed_at < dta.assumed_install_date);

-- WITH data_to_add AS (
--     SELECT * 
--     FROM (
--         SELECT
--             objectid, 
--             cnn, 
--             street, 
--             st_type, 
--             from_st, 
--             to_st, 
--             speedlimit, 
--             schoolzone, 
--             schoolzone_limit, 
--             mtab_date, 
--             mtab_motion, 
--             mtab_reso_text, 
--             status, 
--             workorder, 
--             install_date, 
--             MAX(COALESCE(install_date, mtab_date, '1900-01-01')) OVER(PARTITION BY cnn) as assumed_install_date, 
--             shape, 
--             data_as_of, 
--             data_loaded_at, 
--             analysis_neighborhood, 
--             supervisor_district,
--             DENSE_RANK() OVER (PARTITION BY cnn, shape ORDER BY objectid DESC) as rn
--         FROM
--             {data_table_name}
--         WHERE
--             cnn != 0
--     )
--     WHERE
--         rn = 1
-- ),
-- most_recent_schoolzone_change AS (
--     SELECT *
--     FROM (
--         SELECT 
--             cnn,
--             completed_at,
--             value,
--             metadata,
--             DENSE_RANK() OVER (PARTITION BY cnn ORDER BY completed_at DESC) as rn 
--         FROM
--             sf_street_features
--         WHERE
--             feature_type = 'school_zone'
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
--     dta.assumed_install_date as completed_at,
--     'school_zone' as feature_type,
--     dta.cnn as cnn,
--     false as is_on_intersection,
--     json_build_object('type', 'integer', 'value', COALESCE(dta.schoolzone_limit, 0)) as value, -- schoolzone_limit of 0 means there is no school zone
--     json_build_object(
--         'unit', 'mph',
--         'schoolzone_active', CASE WHEN COALESCE(dta.schoolzone_limit, 0) > 0 THEN true ELSE false END,
--         'mtab_date', mtab_date,
--         'mtab_motion', mtab_motion,
--         'mtab_reso_text', mtab_reso_text,
--         'status', status,
--         'workorder', workorder,
--         'install_date', install_date,
--         'shape', ST_AsText(shape),
--         'data_as_of', data_as_of,
--         'data_loaded_at', data_loaded_at
--     ) as metadata
-- FROM
--     data_to_add as dta
--     LEFT JOIN
--     most_recent_schoolzone_change as szc ON szc.cnn = dta.cnn AND ST_Equals(ST_GeomFromText(szc.metadata->>'shape', 4326), dta.shape)
-- WHERE
--     szc.cnn IS NULL
--     OR
--     ((szc.value->>'value')::INTEGER != COALESCE(dta.schoolzone_limit, 0) AND szc.completed_at < dta.assumed_install_date);

