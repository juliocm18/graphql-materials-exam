import {DataSource} from "typeorm";
import {AppService} from "../../config/app.config.service";
import {IDbConfig} from "../../config/db.config.interface";

const dbConfig: IDbConfig = AppService.DB_CONFIG;

const config = new DataSource({
  type: "postgres",
  ...dbConfig,
  migrations: ["src/migrations/*.ts", "migrations/*.js"],
  subscribers: [],
});

export const AppDataSource: DataSource = config;
