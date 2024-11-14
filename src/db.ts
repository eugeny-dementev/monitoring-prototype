import { verbose } from "sqlite3";

const SQLite3 = verbose();

const db = new SQLite3.Database(':memory:'); //@FIXME: move db to file

const tableName = 'torrent'

const createDbSql = `CREATE TABLE IF NOT EXISTS ${tableName} (
  guid TEXT UNIQUE,
  publishDate TEXT
)`;

const addTorrentSql = `INSERT INTO ${tableName} VALUES (?, ?)`;

const readTorrentsSql = `SELECT rowid AS id, guid, publishDate FROM ${tableName}`;

export function defineDbTables() {
  db.serialize(()=>{
    db.run(createDbSql);
  });
}

export function addData(guid: string, publishDate: string) {
  db.serialize(() => {
    const stmt = db.prepare(addTorrentSql);
    stmt.run(guid, publishDate);
    stmt.finalize();

    db.each<{ id: number, guid: string, publishDate: string }>(readTorrentsSql, (err, row) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(tableName, row);
    });
  });
}
export function closeDb() {
  db.close();
}
