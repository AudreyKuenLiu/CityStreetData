CREATE OR REPLACE FUNCTION tc_measure_to_feature_type(tc_measure text)
RETURNS feature_type AS $$
BEGIN
    RETURN CASE TRIM(LOWER(tc_measure))
        WHEN 'median extension' THEN 'median_extension'
        WHEN 'channelization' THEN 'channelization'
        WHEN 'speed hump' THEN 'speed_hump'
        WHEN 'ped refuge island' THEN 'ped_refuge_island'
        WHEN 'chicane' THEN 'chicane'
        WHEN 'median island' THEN 'median_island'
        WHEN 'traffic circle' THEN 'traffic_circle'
        WHEN 'left turn traffic calming' THEN 'left_turn_traffic_calming'
        WHEN 'painted traffic circle' THEN 'painted_traffic_circle'
        WHEN 'traffic island' THEN 'traffic_island'
        WHEN 'speed table' THEN 'speed_table'
        WHEN 'painted island' THEN 'painted_island'
        WHEN 'raised crosswalk' THEN 'raised_crosswalk'
        WHEN 'centerline hardening w/rubber humps' THEN 'centerline_hardening_w_rubber_humps'
        WHEN 'speed radar sign' THEN 'speed_radar_sign'
        WHEN 'choker' THEN 'choker'
        ELSE NULL
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

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
        dtn.current_status = 'Complete'
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
            sf_street_features
        WHERE
            feature_type in (
                'median_extension',
                'channelization',
                'speed_hump',
                'ped_refuge_island',
                'chicane',
                'median_island',
                'traffic_circle',
                'left_turn_traffic_calming',
                'painted_traffic_circle',
                'traffic_island',
                'speed_table',
                'painted_island',
                'raised_crosswalk',
                'centerline_hardening_w_rubber_humps',
                'speed_radar_sign',
                'choker'
            )
    )
    WHERE
        rn = 1
)
INSERT INTO sf_street_features (
    completed_at,
    feature_type,
    cnn,
    is_on_intersection,
    value,
    metadata
)
SELECT
    CASE WHEN dta.install_date = '1900-01-01' AND fiscal_yr is NOT NULL THEN
        to_timestamp(substring(fiscal_yr FROM '\\d{{4}}$') || '-01-01', 'YYYY-MM-DD')
    ELSE 
        dta.install_date END as completed_at,
    tc_measure_to_feature_type(dta.tc_measure) as feature_type,
    dta.cnn as cnn,
    true as is_on_intersection,
    format('{{"type": "integer", "value": %s }}', dta.units)::JSON as value,
    format('{{
        "unit": "unit",
        "fiscal_yr": "%s", 
        "install_date": "%s", 
        "program": "%s", 
        "shape": "%s",
        "streetname": "%s",
        "from_st": "%s",
        "objectid": "%s"
    }}', 
    dta.fiscal_yr, 
    dta.install_date, 
    dta.program, 
    ST_AsText(dta.shape),
    dta.streetname,
    replace(dta.from_st, '\', '\\'),
    dta.objectid)::JSON as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    sf_street_features as sf ON sf.cnn = dta.cnn AND sf.feature_type::text = COALESCE(tc_measure_to_feature_type(dta.tc_measure)::text, 'NONE')
WHERE
    sf.cnn IS NULL
    OR
    sf.completed_at < dta.install_date;
