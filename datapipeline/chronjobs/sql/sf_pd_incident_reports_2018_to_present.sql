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
        PointFromText(point, 4326) as point,
        data_as_of,
        data_loaded_at
    FROM
        {data_table_name} as dtn
    WHERE
        dtn.cnn IS NOT NULL
)
INSERT INTO sf_events_traffic_arrests(
    occured_at,
    cnn,
    point,
    arrest_category,
    sf_data_id,
    metadata
)
SELECT
    dta.incident_datetime as occured_at,
    dta.cnn as cnn,
    dta.point as point,
    text_to_arrest_category(incident_category) as arrest_category,
    dta.incident_id as sf_data_id,
    json_object(
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
    sf_events_traffic_arrests as sfe ON sfe.sf_data_id = dta.incident_id
WHERE
    sfe.sf_data_id IS NULL;
