import "reflect-metadata";
import { DataSource } from "typeorm";
import { Player } from "./entity/Player";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "0941416856ia",
  database: "gebetadb",
  synchronize: true,
  logging: false,
  entities: [Player],
  migrations: [],
  subscribers: [],
});
