WITH data_to_add AS (
SELECT
    unique_id,
    cnn_intrsctn_fkey,
    cnn_sgmt_fkey,
    case_id_pkey,
    tb_latitude,
    tb_longitude,
    geocode_source,
    geocode_location,
    collision_datetime,
    collision_date,
    collision_time,
    accident_year,
    month,
    day_of_week,
    time_cat,
    juris,
    officer_id,
    reporting_district,
    beat_number,
    primary_rd,
    secondary_rd,
    distance,
    direction,
    weather_1,
    weather_2,
    collision_severity,
    type_of_collision,
    mviw,
    ped_action,
    road_surface,
    road_cond_1,
    road_cond_2,
    lighting,
    control_device,
    intersection,
    vz_pcf_code,
    vz_pcf_group,
    vz_pcf_description,
    vz_pcf_link,
    number_killed,
    number_injured,
    street_view,
    dph_col_grp,
    dph_col_grp_description,
    party_at_fault,
    party1_type,
    party1_dir_of_travel,
    party1_move_pre_acc,
    party2_type,
    party2_dir_of_travel,
    party2_move_pre_acc,
    point,
    data_as_of,
    data_updated_at,
    data_loaded_at,
    analysis_neighborhood,
    supervisor_district,
    police_district
FROM
    {data_table_name}
)
INSERT INTO sf_events(
    occured_at,
    event_type,
    cnn,
    point,
    metadata
)
SELECT
    collision_datetime as occured_at,
    'traffic_crash' as event_type,
    CASE WHEN cnn_sgmt_fkey IS NULL THEN cnn_intrsctn_fkey ELSE cnn_sgmt_fkey END as cnn,
    dta.point as point,
    format('{{
        "unique_id": %s,
        "case_id_pkey": "%s", 
        "tb_latitude": %s, 
        "tb_longitude": %s, 
        "geocode_source": "%s", 
        "geocode_location": "%s", 
        "day_of_week": "%s", 
        "time_cat": "%s", 
        "juris": "%s", 
        "officer_id": "%s",
        "reporting_district": "%s",
        "beat_number": "%s",
        "primary_rd": "%s",
        "secondary_rd": "%s",
        "distance": %s,
        "direction": "%s",
        "weather_1": "%s",
        "weather_2": "%s",
        "collision_severity": "%s",
        "type_of_collision": "%s",
        "mviw": "%s",
        "ped_action": "%s",
        "road_surface": "%s",
        "road_cond_1": "%s",
        "road_cond_2": "%s",
        "lighting": "%s",
        "control_device": "%s",
        "intersection": "%s",
        "vz_pcf_code": "%s",
        "vz_pcf_group": "%s",
        "vz_pcf_description": "%s",
        "vz_pcf_link": "%s",
        "number_killed": %s,
        "number_injured": %s,
        "street_view": "%s",
        "dph_col_grp": "%s",
        "dph_col_grp_description": "%s",
        "party_at_fault": "%s",
        "party1_type": "%s",
        "party1_dir_of_travel": "%s",
        "party1_move_pre_acc": "%s",
        "party2_type": "%s",
        "party2_dir_of_travel": "%s",
        "party2_move_pre_acc": "%s",
        "data_as_of": "%s",
        "data_updated_at": "%s",
        "data_loaded_at": "%s",
        "analysis_neighborhood": "%s",
        "supervisor_district": "%s",
        "police_district": "%s"}}',
        unique_id,
        case_id_pkey,
        tb_latitude,
        tb_longitude,
        geocode_source,
        geocode_location,
        day_of_week,
        time_cat,
        juris,
        officer_id,
        reporting_district,
        beat_number,
        primary_rd,
        secondary_rd,
        distance,
        direction,
        weather_1,
        weather_2,
        collision_severity,
        type_of_collision,
        mviw,
        ped_action,
        road_surface,
        road_cond_1,
        road_cond_2,
        lighting,
        control_device,
        intersection,
        vz_pcf_code,
        vz_pcf_group,
        vz_pcf_description,
        vz_pcf_link,
        number_killed,
        number_injured,
        street_view,
        dph_col_grp,
        dph_col_grp_description,
        party_at_fault,
        party1_type,
        party1_dir_of_travel,
        party1_move_pre_acc,
        party2_type,
        party2_dir_of_travel,
        party2_move_pre_acc,
        data_as_of,
        data_updated_at,
        data_loaded_at,
        analysis_neighborhood,
        supervisor_district,
        police_district
    )::JSON as metadata
FROM
    data_to_add as dta
    LEFT JOIN 
    sf_events ON dta.unique_id = sf_events.metadata->>'unique_id'
WHERE
    sf_events.metadata->>'unique_id' IS NULL
;

UPDATE sf_events AS sfe
SET 
    occured_at = collision_datetime,
    cnn = CASE WHEN cnn_sgmt_fkey IS NULL THEN cnn_intrsctn_fkey ELSE cnn_sgmt_fkey END,
    point = dtu.point,
    metadata = format('{{
        "unique_id": %s,
        "case_id_pkey": "%s", 
        "tb_latitude": %s, 
        "tb_longitude": %s, 
        "geocode_source": "%s", 
        "geocode_location": "%s", 
        "day_of_week": "%s", 
        "time_cat": "%s", 
        "juris": "%s", 
        "officer_id": "%s",
        "reporting_district": "%s",
        "beat_number": "%s",
        "primary_rd": "%s",
        "secondary_rd": "%s",
        "distance": %s,
        "direction": "%s",
        "weather_1": "%s",
        "weather_2": "%s",
        "collision_severity": "%s",
        "type_of_collision": "%s",
        "mviw": "%s",
        "ped_action": "%s",
        "road_surface": "%s",
        "road_cond_1": "%s",
        "road_cond_2": "%s",
        "lighting": "%s",
        "control_device": "%s",
        "intersection": "%s",
        "vz_pcf_code": "%s",
        "vz_pcf_group": "%s",
        "vz_pcf_description": "%s",
        "vz_pcf_link": "%s",
        "number_killed": %s,
        "number_injured": %s,
        "street_view": "%s",
        "dph_col_grp": "%s",
        "dph_col_grp_description": "%s",
        "party_at_fault": "%s",
        "party1_type": "%s",
        "party1_dir_of_travel": "%s",
        "party1_move_pre_acc": "%s",
        "party2_type": "%s",
        "party2_dir_of_travel": "%s",
        "party2_move_pre_acc": "%s",
        "data_as_of": "%s",
        "data_updated_at": "%s",
        "data_loaded_at": "%s",
        "analysis_neighborhood": "%s",
        "supervisor_district": "%s",
        "police_district": "%s"}}',
        unique_id,
        case_id_pkey,
        tb_latitude,
        tb_longitude,
        geocode_source,
        geocode_location,
        day_of_week,
        time_cat,
        juris,
        officer_id,
        reporting_district,
        beat_number,
        primary_rd,
        secondary_rd,
        distance,
        direction,
        weather_1,
        weather_2,
        collision_severity,
        type_of_collision,
        mviw,
        ped_action,
        road_surface,
        road_cond_1,
        road_cond_2,
        lighting,
        control_device,
        intersection,
        vz_pcf_code,
        vz_pcf_group,
        vz_pcf_description,
        vz_pcf_link,
        number_killed,
        number_injured,
        street_view,
        dph_col_grp,
        dph_col_grp_description,
        party_at_fault,
        party1_type,
        party1_dir_of_travel,
        party1_move_pre_acc,
        party2_type,
        party2_dir_of_travel,
        party2_move_pre_acc,
        data_as_of,
        data_updated_at,
        data_loaded_at,
        analysis_neighborhood,
        supervisor_district,
        police_district
    )::JSON
FROM
  {data_table_name} as dtu
WHERE
  sfe.metadata->>'unique_id' = dtu.unique_id
  AND (
    (cnn != COALESCE(dtu.cnn_intrsctn_fkey, 0) and cnn != COALESCE(dtu.cnn_sgmt_fkey, 0)) OR
    sfe.metadata->>'case_id_pkey' != dtu.case_id_pkey OR
    (sfe.metadata->>'tb_latitude')::double precision != dtu.tb_latitude OR
    (sfe.metadata->>'tb_longitude')::double precision != dtu.tb_longitude OR
    sfe.metadata->>'geocode_source' != dtu.geocode_source OR
    sfe.metadata->>'geocode_location' != dtu.geocode_location OR
    sfe.metadata->>'day_of_week' != dtu.day_of_week OR
    sfe.metadata->>'time_cat' != dtu.time_cat OR
    sfe.metadata->>'juris' != dtu.juris OR
    sfe.metadata->>'officer_id' != dtu.officer_id OR
    sfe.metadata->>'reporting_district' != dtu.reporting_district OR
    sfe.metadata->>'beat_number' != dtu.beat_number OR
    sfe.metadata->>'primary_rd' != dtu.primary_rd OR
    sfe.metadata->>'secondary_rd' != dtu.secondary_rd OR
    (sfe.metadata->>'distance')::int != dtu.distance OR
    sfe.metadata->>'direction' != dtu.direction OR
    sfe.metadata->>'weather_1' != dtu.weather_1 OR
    sfe.metadata->>'weather_2' != dtu.weather_2 OR
    sfe.metadata->>'collision_severity' != dtu.collision_severity OR
    sfe.metadata->>'type_of_collision' != dtu.type_of_collision OR
    sfe.metadata->>'mviw' != dtu.mviw OR
    sfe.metadata->>'ped_action' != dtu.ped_action OR
    sfe.metadata->>'road_surface' != dtu.road_surface OR
    sfe.metadata->>'road_cond_1' != dtu.road_cond_1 OR
    sfe.metadata->>'road_cond_2' != dtu.road_cond_2 OR
    sfe.metadata->>'lighting' != dtu.lighting OR
    sfe.metadata->>'control_device' != dtu.control_device OR
    sfe.metadata->>'intersection' != dtu.intersection OR
    sfe.metadata->>'vz_pcf_code' != dtu.vz_pcf_code OR
    sfe.metadata->>'vz_pcf_group' != dtu.vz_pcf_group OR
    sfe.metadata->>'vz_pcf_description' != dtu.vz_pcf_description OR
    sfe.metadata->>'vz_pcf_link' != dtu.vz_pcf_link OR
    (sfe.metadata->>'number_killed')::int != dtu.number_killed OR
    (sfe.metadata->>'number_injured')::int != dtu.number_injured OR
    sfe.metadata->>'street_view' != dtu.street_view OR
    sfe.metadata->>'dph_col_grp' != dtu.dph_col_grp OR
    sfe.metadata->>'dph_col_grp_description' != dtu.dph_col_grp_description OR
    sfe.metadata->>'party_at_fault' != dtu.party_at_fault OR
    sfe.metadata->>'party1_type' != dtu.party1_type OR
    sfe.metadata->>'party1_dir_of_travel' != dtu.party1_dir_of_travel OR
    sfe.metadata->>'party1_move_pre_acc' != dtu.party1_move_pre_acc OR
    sfe.metadata->>'party2_type' != dtu.party2_type OR
    sfe.metadata->>'party2_dir_of_travel' != dtu.party2_dir_of_travel OR
    sfe.metadata->>'party2_move_pre_acc' != dtu.party2_move_pre_acc OR
    NOT ST_OrderingEquals(sfe.point, dtu.point) OR
    (sfe.metadata->>'data_as_of')::timestamp != dtu.data_as_of OR
    sfe.metadata->>'analysis_neighborhood' != dtu.analysis_neighborhood OR
    sfe.metadata->>'supervisor_district' != dtu.supervisor_district OR
    sfe.metadata->>'police_district' != dtu.police_district
);
