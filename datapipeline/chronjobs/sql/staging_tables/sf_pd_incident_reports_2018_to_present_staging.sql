CREATE TABLE sf_pd_incident_reports_2018_to_present_{suffix} (
    row_id INTEGER,
    incident_datetime DATETIME,
    incident_date DATE,
    incident_time TEXT,
    incident_year INTEGER,
    incident_day_of_week TEXT,
    report_datetime DATETIME,
    incident_id INTEGER,
    incident_number INTEGER,
    cad_number INTEGER,
    report_type_code VARCHAR,
    report_type_description TEXT,
    filed_online BOOLEAN,
    incident_code TEXT,
    incident_category TEXT,
    incident_subcategory TEXT,
    incident_description TEXT,
    resolution TEXT,
    intersection TEXT,
    cnn INTEGER,
    police_district TEXT,
    analysis_neighborhood TEXT,
    supervisor_district TEXT,
    supervisor_district_2012 TEXT,
    latitude REAL,
    longitude REAL,
    point TEXT,
    data_as_of DATETIME,
    data_loaded_at DATETIME
);

CREATE TRIGGER IF NOT EXISTS update_dates_sf_pd_incident_reports_2018_to_present_{suffix}
AFTER INSERT ON sf_pd_incident_reports_2018_to_present_{suffix}
FOR EACH ROW
BEGIN
    UPDATE 
        sf_pd_incident_reports_2018_to_present_{suffix}
    SET 
        incident_datetime = dateTimeStrToEpoch(NEW.incident_datetime), 
        report_datetime = dateTimeStrToEpoch(NEW.report_datetime), 
        data_as_of = dateTimeStrToEpoch(NEW.data_as_of), 
        data_loaded_at = dateTimeStrToEpoch(NEW.data_loaded_at)
    WHERE
        row_id = NEW.row_id;
END;