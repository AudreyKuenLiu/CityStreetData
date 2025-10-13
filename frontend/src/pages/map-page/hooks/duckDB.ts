import * as duckdb from "@duckdb/duckdb-wasm";
// import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
// import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
// import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
// import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

// const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
//   mvp: {
//     mainModule: duckdb_wasm,
//     mainWorker: mvp_worker,
//   },
//   eh: {
//     mainModule: duckdb_wasm_eh,
//     mainWorker: eh_worker,
//   },
// };
// Select a bundle based on browser checks

async function instantiate(): Promise<duckdb.AsyncDuckDB> {
  console.time("instantiating db");
  const CDN_BUNDLES = duckdb.getJsDelivrBundles(),
    bundle = await duckdb.selectBundle(CDN_BUNDLES), // Select a bundle based on browser checks
    worker_url = URL.createObjectURL(
      new Blob([`importScripts("${bundle.mainWorker}");`], {
        type: "text/javascript",
      })
    );

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(worker_url),
    logger = new duckdb.ConsoleLogger(duckdb.LogLevel.DEBUG),
    //logger = new duckdb.VoidLogger()
    db = new duckdb.AsyncDuckDB(logger, worker);

  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(worker_url);
  console.timeEnd("instantiating db");

  // const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
  // // Instantiate the asynchronous version of DuckDB-wasm
  // const worker = new Worker(bundle.mainWorker!);
  // const logger = new duckdb.ConsoleLogger();
  // const db = new duckdb.AsyncDuckDB(logger, worker);
  // await db.instantiate(bundle.mainModule, bundle.pthreadWorker);

  return db;
}

async function insertThenQuery(db: duckdb.AsyncDuckDB): any {
  const c = await db.connect();

  await c.query(`CREATE TABLE people(id INTEGER, name VARCHAR);`);
  await c.query(`INSERT INTO people VALUES (1, 'Mark');`);
  await c.query(`INSERT INTO people VALUES (2, 'Phil');`);
  await c.query(`INSERT INTO people VALUES (3, 'Roger');`);

  const query = await c.query(`SELECT * FROM people`),
    result = query.toArray().map((row) => row.toArray());

  return result;
}

export const db = await instantiate();

// export default {
//   test: async function (): any {
//     const db = await instantiate(duckdb),
//       result = await insertThenQuery(db);

//     return result;
//   },
// };
