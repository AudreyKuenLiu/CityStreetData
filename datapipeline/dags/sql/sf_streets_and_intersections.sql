WITH data_to_add AS (
SELECT
  cnn, 
  lf_fadd, 
  lf_toadd, 
  rt_fadd, 
  rt_toadd, 
  street, 
  st_type, 
  f_st, 
  t_st, 
  f_node_cnn, 
  t_node_cnn, 
  accepted, 
  active, 
  date_added, 
  date_altered, 
  date_dropped, 
  jurisdiction, 
  layer, 
  nhood, 
  oneway, 
  street_gc,
  streetname, 
  streetname_gc, 
  zip_code, 
  analysis_neighborhood, 
  supervisor_district, 
  line
FROM
  {data_table_name} as dtn
WHERE
  dtn.cnn IS NOT NULL
)
INSERT INTO sf_streets_and_intersections (
  cnn,
  lf_fadd,
  lf_toadd,
  rt_fadd,
  rt_toadd,
  street,
  st_type,
  f_st,
  t_st,
  f_node_cnn,
  t_node_cnn,
  accepted,
  active,
  date_public_works_added,
  date_public_works_altered,
  date_public_works_dropped,
  jurisdiction,
  layer,
  nhood,
  oneway,
  street_gc,
  streetname,
  streetname_gc,
  zip_code,
  analysis_neighborhood,
  supervisor_district,
  line
)
SELECT
  dta.*
FROM
  data_to_add dta
  LEFT JOIN
  sf_streets_and_intersections sfsi
  ON dta.cnn = sfsi.cnn
WHERE
  sfsi.cnn is NULL;

UPDATE sf_streets_and_intersections AS sfsi
SET 
  lf_fadd = dtu.lf_fadd,
  lf_toadd = dtu.lf_toadd,
  rt_fadd = dtu.rt_fadd,
  rt_toadd = dtu.rt_toadd,
  street = dtu.street,
  st_type = dtu.st_type,
  f_st = dtu.f_st,
  t_st = dtu.t_st,
  f_node_cnn = dtu.f_node_cnn,
  t_node_cnn = dtu.t_node_cnn,
  accepted = dtu.accepted,
  active = dtu.active,
  date_public_works_added = dtu.date_added,
  date_public_works_altered = dtu.date_altered,
  date_public_works_dropped = dtu.date_dropped,
  jurisdiction = dtu.jurisdiction,
  layer = dtu.layer,
  nhood = dtu.nhood,
  oneway = dtu.oneway,
  street_gc = dtu.street_gc,
  streetname = dtu.streetname,
  streetname_gc = dtu.streetname_gc,
  zip_code = dtu.zip_code,
  analysis_neighborhood = dtu.analysis_neighborhood,
  supervisor_district = dtu.supervisor_district,
  line = dtu.line
FROM
  {data_table_name} as dtu
WHERE
  sfsi.cnn = dtu.cnn
  AND (
    sfsi.lf_fadd != dtu.lf_fadd 
    OR
    sfsi.lf_toadd != dtu.lf_toadd 
    OR
    sfsi.rt_fadd != dtu.rt_fadd 
    OR
    sfsi.rt_toadd != dtu.rt_toadd 
    OR
    sfsi.street != dtu.street 
    OR
    sfsi.st_type != dtu.st_type 
    OR
    sfsi.f_st != dtu.f_st 
    OR
    sfsi.t_st != dtu.t_st 
    OR
    sfsi.f_node_cnn != dtu.f_node_cnn 
    OR
    sfsi.t_node_cnn != dtu.t_node_cnn 
    OR
    sfsi.accepted != dtu.accepted 
    OR
    sfsi.active != dtu.active 
    OR
    sfsi.date_public_works_added != dtu.date_added 
    OR
    sfsi.date_public_works_altered != dtu.date_altered 
    OR
    sfsi.date_public_works_dropped != dtu.date_dropped 
    OR
    sfsi.jurisdiction != dtu.jurisdiction 
    OR
    sfsi.layer != dtu.layer 
    OR
    sfsi.nhood != dtu.nhood 
    OR
    sfsi.oneway != dtu.oneway 
    OR
    sfsi.street_gc != dtu.street_gc 
    OR
    sfsi.streetname != dtu.streetname 
    OR
    sfsi.streetname_gc != dtu.streetname_gc 
    OR
    sfsi.zip_code != dtu.zip_code 
    OR
    sfsi.analysis_neighborhood != dtu.analysis_neighborhood 
    OR
    sfsi.supervisor_district != dtu.supervisor_district 
    OR
    NOT ST_OrderingEquals(sfsi.line, dtu.line)
  );

WITH data_to_add AS (
SELECT
  cnn, 
  classcode,
  date_added,
  date_altered,
  date_dropped,
  data_as_of,
  active
FROM
  {data_table_name} as dtn
WHERE
  dtn.cnn IS NOT NULL
),
most_recent_classcode AS (
  SELECT
  *
  FROM ( 
    SELECT
      cnn,
      completed_at,
      created_at,
      value,
      ROW_NUMBER() OVER (PARTITION BY cnn ORDER BY completed_at DESC, created_at DESC) as rn
    FROM
      sf_street_features
    WHERE
      feature_type = 'classcode'
    )
  WHERE 
    rn = 1
)
INSERT INTO sf_street_features(
  cnn,
  completed_at,
  feature_type,
  is_on_intersection,
  value,
  metadata
)
SELECT
  dta.cnn,
  CASE WHEN mrc.cnn is NULL THEN COALESCE(dta.date_added, dta.data_as_of)
       WHEN mrc.cnn is NOT NULL AND 
            dta.date_altered is NOT NULL
            THEN dta.date_altered
       ELSE dta.data_as_of
  END as completed_at,
  'classcode' as feature_type,
  false as is_on_intersection,
  json_build_object('type', 'integer', 'value', dta.classcode) as value,
  json_build_object('active', dta.active) as metadata
FROM
  data_to_add dta
  LEFT JOIN
  most_recent_classcode mrc
  ON dta.cnn = mrc.cnn
WHERE
  mrc.cnn is NULL
  OR
  dta.classcode != (mrc.value->>'value')::NUMERIC
;
