import React from "react";
import JSZip from "jszip";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
//import { db, Friend } from "./dexieDb";
import { db } from "./duckDB";

export const useStreetMapData = (): void => {
  const { data } = useQuery({
    queryKey: ["test.zip"],
    staleTime: Infinity,
    queryFn: async () => {
      return await axios.get(`/test.zip?cb=${Date.now()}`, {
        responseType: "arraybuffer",
      });
    },
  });
  React.useEffect(() => {
    if (!data) return;

    const initDb = async (): Promise<void> => {
      const zip = await JSZip.loadAsync(data.data);
      const files = Object.values(zip.files);

      const dbFile = files[0];
      const dbFileArrayData = await dbFile.async("uint8array");

      await db.registerFileBuffer("test.db", dbFileArrayData);
      const c = await db.connect();
      console.time("setup extensions");
      await c.query("INSTALL spatial;");
      await c.query("load spatial;");
      await c.query("INSTALL httpfs;");
      await c.query("LOAD httpfs;");
      console.timeEnd("setup extensions");
      console.time("attach db");
      await c.query("ATTACH 'test.db' AS db");
      console.timeEnd("attach db");

      console.time("duckdb query execute streets");
      const resultStreets = await c.query(
        `select 
          si.cnn,
          TRIM(si.street || ' ' || COALESCE(si.st_type, '')) as street, 
          cc.class_code,
          si.line
        from 
          db.sf_streets_and_intersections as si
          join  
          (select cnn, value as class_code from db.sf_street_feature_classcode) as cc on si.cnn = cc.cnn
        where
          si.active = 'true';
        `
      );

      console.log("this is the result streets", resultStreets.toArray());

      console.timeEnd("duckdb query execute streets");

      console.time("duckdb query execute crashes");
      const resultCrashes = await c.query(
        `
        WITH selected_streets AS (
          SELECT
            cnn, f_node_cnn, t_node_cnn
          FROM
            db.sf_streets_and_intersections
          WHERE 
            cnn in (4161000, 5959000, 521000, 4160000, 522000, 10267101, 10267201, 10266201, 10266101, 4162000)
        ),
        unique_intersections AS (
          SELECT
            intersection_cnn as cnn 
          FROM (
            (
              SELECT 
                DISTINCT(f_node_cnn) as intersection_cnn 
              FROM
                selected_streets
            )
            UNION
            (
              SELECT
                DISTINCT(t_node_cnn) as intersection_cnn
              FROM
                selected_streets
            )
          )
        ),
        unique_streets AS (
          SELECT
            DISTINCT(cnn) as cnn
          FROM
            selected_streets
        ),
        selected_intersections_and_streets AS (
          SELECT
            *
          FROM
          (
            (SELECT * from unique_intersections)
            UNION
            (SELECT * from unique_streets)
          )
          ORDER BY 1
        )
        SELECT
          sis.cnn, crashes.*
        FROM
          (
            SELECT
              *
            FROM
              selected_intersections_and_streets
          ) as sis
          LEFT JOIN
          (
            SELECT
              cnn, occured_at, collision_severity, collision_type, number_killed, number_injured 
            FROM db.sf_events_traffic_crashes 
            WHERE
              collision_severity in ('fatal', 'severe', 'other_visible', 'complaint_of_pain', 'medical')
          ) as crashes
          ON (sis.cnn = crashes.cnn)
        ORDER BY crashes.occured_at;
        `
      );
      console.timeEnd("duckdb query execute crashes");

      console.log("this is the result crashes", resultCrashes.toArray());

      const result2 = await c.query(`
        select count(*) from db.sf_streets_and_intersections;
      `);
      console.log("this is result2", result2.data);

      const result3 = await c.query(`
        select count(*) from db.sf_street_feature_classcode;
      `);
      console.log("this is result3", result3.data);
    };
    initDb();
  }, [data]);
  /*
  const { data } = useQuery({
    queryKey: ["initdata.zip"],
    //staleTime: Infinity,
    queryFn: async () => {
      return await axios.get(`/initdata.zip?cb=${Date.now()}`, {
        responseType: "arraybuffer",
      });
    },
  });
  console.log("this is the data response", data);
  // Unzip and list files when data is loaded
  React.useEffect(() => {
    if (!data) return;
    const unzip = async (): Promise<void> => {
      const c = await db.connect();
      await c.query(
        `CREATE TABLE IF NOT EXISTS people(id INTEGER, name VARCHAR);`
      );

      const zip = await JSZip.loadAsync(data.data);
      const files = Object.values(zip.files);

      console.time(`Unzip and process all files`);
      for (const file of files) {
        console.time(`Unzip and process a file ${file.name}`);
        if (!file.dir) {
          // Read file as text
          const text = await file.async("text");
          // Split into lines
          const lines = text.split(/\r?\n/);
          // Process each line
          let totalLines = 0;

          const data: { id: number; name: string }[] = [];
          lines.forEach((line, idx) => {
            // Do something with each line
            totalLines += 1;
            //console.log(`File: ${relativePath}, Line ${idx + 1}:`, line);
            data.push({
              id: idx,
              name: "1",
            });
          });
          await db.registerFileText("rows.json", JSON.stringify(data));
          await c.insertJSONFromPath("rows.json", {
            name: "people",
            create: false,
          });

          console.log("these are the total lines", totalLines);
          console.timeEnd(`Unzip and process a file ${file.name}`);
        }
      }

      console.timeEnd(`Unzip and process all files`);

      // List all files and folders
      // zip.forEach(async (relativePath, file) => {
      //   console.time(`Unzip and process a file ${file.name}`);
      //   if (!file.dir) {
      //     // Read file as text
      //     const text = await file.async("text");
      //     // Split into lines
      //     const lines = text.split(/\r?\n/);
      //     // Process each line
      //     let totalLines = 0;
      //     const data: { id: number; name: string }[] = [];
      //     lines.forEach((line, idx) => {
      //       // Do something with each line
      //       totalLines += 1;
      //       //console.log(`File: ${relativePath}, Line ${idx + 1}:`, line);
      //       data.push({
      //         id: idx,
      //         name: "1",
      //       });
      //     });
      //     await db.registerFileText("rows.json", JSON.stringify(data));
      //     await c.insertJSONFromPath("rows.json", {
      //       name: "people",
      //       create: false,
      //     });

      //     //db.friends.bulkAdd(friends);
      //     // for (const line of data) {
      //     //   await c.query(
      //     //     `INSERT INTO people VALUES (${line.id}, ${line.name});`
      //     //   );
      //     // }

      //     console.log("these are the total lines", totalLines);
      //     console.timeEnd(`Unzip and process a file ${file.name}`);
      //   }
      // });

      // Example: read a file as text
      // const text = await zip.file("somefile.txt")?.async("text");
    };

    unzip();
  }, [data]);
  */
  return;
};
