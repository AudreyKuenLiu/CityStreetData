WITH data_to_add as (
    SELECT
        row_id,
        incident_datetime,
        incident_date,
        incident_time,
        incident_year,
        incident_day_of_week,
        report_datetime,
        incident_id,
        incident_number,
        cad_number,
        report_type_code,
        report_type_description,
        filed_online,
        incident_code,
        incident_category,
        incident_subcategory,
        incident_description,
        resolution,
        intersection,
        cnn,
        police_district,
        analysis_neighborhood,
        supervisor_district,
        supervisor_district_2012,
        latitude,
        longitude,
        point,
        data_as_of,
        data_loaded_at
    FROM
        {data_table_name} as dtn
)
INSERT INTO sf_events(
    occured_at,
    event_type,
    cnn,
    point,
    metadata
)
SELECT
    dta.incident_datetime as occured_at,
    'police_traffic_arrest' as event_type,
    dta.cnn as cnn,
    dta.point as point,
    json_build_object(
        'row_id', dta.row_id,
        'report_datetime', dta.report_datetime,
        'incident_id', dta.incident_id,
        'incident_number', dta.incident_number,
        'cad_number', dta.cad_number,
        'report_type_code', dta.report_type_code,
        'report_type_description', dta.report_type_description,
        'filed_online', dta.filed_online,
        'incident_code', dta.incident_code,
        'incident_category', dta.incident_category,
        'incident_subcategory', dta.incident_subcategory,
        'incident_description', dta.incident_description,
        'resolution', dta.resolution,
        'intersection', dta.intersection,
        'police_district', dta.police_district,
        'analysis_neighborhood', dta.analysis_neighborhood,
        'supervisor_district', dta.supervisor_district,
        'supervisor_district_2012', dta.supervisor_district_2012,
        'latitude', dta.latitude,
        'longitude', dta.longitude,
        'data_as_of', dta.data_as_of,
        'data_loaded_at', dta.data_loaded_at
    ) as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    sf_events as sfe ON (sfe.metadata->>'row_id')::BIGINT = dta.row_id
WHERE
    sfe.metadata->>'row_id' IS NULL;
