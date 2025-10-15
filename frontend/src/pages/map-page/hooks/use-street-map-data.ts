import React from "react";
import JSZip from "jszip";
import axios from "axios";
import sqlite3InitModule, { Database } from '@sqlite.org/sqlite-wasm';
import {asyncSQLiteExec} from "../../../utils/index";
import * as fflate from 'fflate';
import {unzip} from 'unzipit'

import {ZipReader, HttpReader, BlobWriter} from '@zip.js/zip.js'

export const useStreetMapData = (): void => {

  React.useEffect(() => {
  
    (async () => {

      /* ==========
      Version 1 - About 920ms on Laban's computer with cache disabled
      ===========*/

      const v1_synchronous = async () => {

        console.log("v1_synchronous")
        console.time("End to end run (from download to ready-to-use db)")
        
        // Fetch raw data
        console.time("Download file")
        const db_zip = await axios.get(`/new_sqlite_database.db.zip?cb=${Date.now()}`, {
          responseType: "arraybuffer",
        });
        console.timeEnd("Download file")
        
        // Expand and convert to in-memory db file
        console.time("Unzip file")
        const db_file = await(Object.values((await JSZip.loadAsync(db_zip.data)).files)[0].async("uint8array"));
        console.timeEnd("Unzip file")

        // Initialize empty SQL db 
        console.time("Instantiate empty SQLite db")
        sqlite3InitModule().then((sqlite3) => {
          try {
            const db = new sqlite3.oo1.DB();
            console.timeEnd("Instantiate empty SQLite db")
            
            console.time("Load SQLite DB")
            const data = sqlite3.wasm.allocFromTypedArray(db_file);
            if (db.pointer){
              sqlite3.capi.sqlite3_deserialize(
                db.pointer,
                'main',
                data,
                db_file.byteLength,
                db_file.byteLength,
                sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
              )
            }
            console.timeEnd("Load SQLite DB")
            console.timeEnd("End to end run (from download to ready-to-use db)")

            // Run a statement to prove it works
            console.log(
              db.exec(`
                SELECT cnn, f_node_cnn, t_node_cnn
                FROM sf_streets_and_intersections
                WHERE  cnn in (4161000, 5959000, 521000, 4160000, 522000, 10267101, 10267201, 10266201, 10266101, 4162000);`, 
                {returnValue: "resultRows"}
              )
            )
            
            return db;

          } catch (err) {
            console.log(err)
            console.log("Error instantiating database :'(");
          }
        })
        
      };

      /* ==========
      Version 2 - About 900ms on Laban's computer with cache disabled
      ===========*/

      const instantiateDB = async () => {
        console.time("Instantiate empty SQLite db")
        const sqlite3 = await sqlite3InitModule()
        try {
          const db = new sqlite3.oo1.DB();
          console.timeEnd("Instantiate empty SQLite db")
          return [sqlite3, db]
        }
        catch (err) {
          console.log(err)
          console.log("Error instantiating database :'(");
        }
      };

      const downloadFile = async () => {
        
        // Fetch raw data
        console.time("Download file")
        const db_zip = await axios.get(`/new_sqlite_database.db.zip?cb=${Date.now()}`, {
          responseType: "arraybuffer",
        });
        console.timeEnd("Download file")
        
        // Expand and convert to in-memory db file
        console.time("Unzip file")
        const db_file = await(Object.values((await JSZip.loadAsync(db_zip.data)).files)[0].async("uint8array"));
        console.timeEnd("Unzip file")

        return db_file
      };

      const loadDB = async(sqlite3: any, db: Database, fileBuffer: Uint8Array) => {

        console.time("Load SQLite DB")
        const data = sqlite3.wasm.allocFromTypedArray(fileBuffer);
        if (db.pointer) {
          sqlite3.capi.sqlite3_deserialize(
            db.pointer,
            'main',
            data,
            fileBuffer.byteLength,
            fileBuffer.byteLength,
            sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
          )
        }
        console.timeEnd("Load SQLite DB")
        return db;
      }

      const runTestQuery = (db: Database) => {
        // Run a statement to prove it works
        console.log(
          db.exec(`
                SELECT cnn, f_node_cnn, t_node_cnn
                FROM sf_streets_and_intersections
                WHERE  cnn in (4161000, 5959000, 521000, 4160000, 522000, 10267101, 10267201, 10266201, 10266101, 4162000);`,
            { returnValue: "resultRows" }
          )
        )

      }

      const v2_parallel = async () =>{
        console.log("v2_parallel")
        console.time("End to end run (from download to ready-to-use db)")

        const [dbConfig, dbData] = await Promise.all([instantiateDB(), downloadFile()]);
        console.log(dbData)
        await loadDB(dbConfig[0], dbConfig[1], dbData);

        console.timeEnd("End to end run (from download to ready-to-use db)")
        runTestQuery(dbConfig[1])

      }


      /* ==========
      Version 3 - About 1000ms on Laban's computer with cache disabled
      (Unexpected - thought fflate would be faster tbh)
      ===========*/

      const downloadFileZipJs = async () => {
  
        // Fetch raw data
        console.time("Download file")
        const db_zip = await axios.get(`/new_sqlite_database.db.zip?cb=${Date.now()}`, {
          responseType: "arraybuffer",
        });
        console.timeEnd("Download file")

        // Expand and convert to in-memory db file
        console.time("Convert file")
        const raw_bytes = new Uint8Array(db_zip.data)
        console.timeEnd("Convert file")
        console.time("Unzip file")
        const db_file = fflate.unzipSync(raw_bytes)
        console.timeEnd("Unzip file")

        return db_file
      };

      const v3_parallel = async () =>{
        console.log("v3_parallel")
        console.time("End to end run (from download to ready-to-use db)")
        const [dbConfig, dbData] = await Promise.all([instantiateDB(), downloadFileZipJs()]);
        await loadDB(dbConfig[0], dbConfig[1], dbData["new_sqlite_database.db"]);
        console.timeEnd("End to end run (from download to ready-to-use db)")
        runTestQuery(dbConfig[1])
      }


      /* ==========
      Version 4 - About 9500ms on Laban's computer with cache disabled
      ===========*/

      const downloadFileZipJsAsync = async () => {
        console.time("File Start")  
        // Fetch raw data
        console.time("Download file")
        const db_zip = await axios.get(`/new_sqlite_database.db.zip?cb=${Date.now()}`, {
          responseType: "arraybuffer",
        });
        console.timeEnd("Download file")

        // Expand and convert to in-memory db file
        console.time("Convert file")
        const raw_bytes = new Uint8Array(db_zip.data)
        console.timeEnd("Convert file")
        console.time("Unzip file")
        const db_file =  asyncWrapper(raw_bytes)
         
        return db_file
      };

      const asyncWrapper = (data: Uint8Array) => {
        return new Promise((resolve, reject) =>{
          fflate.unzip(data, (err, data) => {
            console.timeEnd("Unzip file")
            if (err){
              reject(err)
            }else{
              resolve(data)
            }
          })
        }) 
      }

      const v4_parallel = async () =>{
        console.log("v4_parallel")
        console.time("End to end run (from download to ready-to-use db)")
        console.time("Promise end to end run")
        const [dbConfig, dbData] = await Promise.all([instantiateDB(), downloadFileZipJsAsync()]);
        console.timeEnd("Promise end to end run")
        await loadDB(dbConfig[0], dbConfig[1], dbData["new_sqlite_database.db"]);
        console.timeEnd("End to end run (from download to ready-to-use db)")
        runTestQuery(dbConfig[1])
      }
      
      /* ==========
      Version 5 - About 700ms on Laban's computer with cache disabled
      This runs everything in parallel and switches to unzip library
      ===========*/

        const downloadFileuzipAsync = async () => {
        console.time("File Start")  
        // Fetch raw data
        console.time("Download file")
        const db_zip = await axios.get(`/new_sqlite_database.db.zip?cb=${Date.now()}`, {
          responseType: "arraybuffer",
        });
        console.timeEnd("Download file")

        // Expand and convert to in-memory db file
        console.time("Convert file")
        const raw_bytes = new Uint8Array(db_zip.data)
        console.timeEnd("Convert file")
        console.time("Unzip file")
        const db_file = await ((await unzip(raw_bytes))["entries"]["new_sqlite_database.db"].arrayBuffer())
        console.timeEnd("Unzip file")
        return db_file
      };

  
  
      const v5_parallel = async () =>{
        console.log("v5_parallel")
        console.time("End to end run (from download to ready-to-use db)")
        console.time("Promise end to end run")
        const [dbConfig, dbData] = await Promise.all([instantiateDB(), downloadFileuzipAsync()]);
        console.timeEnd("Promise end to end run")
        await loadDB(dbConfig[0], dbConfig[1], dbData);
        console.timeEnd("End to end run (from download to ready-to-use db)")
        runTestQuery(dbConfig[1])
      }

      // await v1_synchronous();
      // await v2_parallel();
      // await v3_parallel();
      // await v4_parallel();  
      await v5_parallel();  
      
    })();
  });
}
