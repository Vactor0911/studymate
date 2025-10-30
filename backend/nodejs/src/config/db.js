import MariaDB from "mariadb";
import { config } from "./index.js";

// MariaDB 연결
export const dbPool = MariaDB.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  bigNumberStrings: true,
});

dbPool
  .getConnection()
  .then((conn) => {
    console.log("MariaDB 연결 성공");
    conn.release();
  })
  .catch((err) => {
    console.error("MariaDB 연결 실패:", err);
  });
