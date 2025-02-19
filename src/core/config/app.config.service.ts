import * as dotenv from 'dotenv';
import { IDbConfig } from './db.config.interface';
dotenv.config();

export class AppService {

  static get PORT(): number {
    return +process.env.PORT;
  }

  static get DB_CONFIG(): IDbConfig {
    return {
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      entities: [process.env.DB_ENTITIES],
      username: process.env.DB_USER,
      password: '' + process.env.DB_PASS,
      database: process.env.DB_NAME,
      synchronize:  process.env.DB_SYNC === "true",
      logging: process.env.DB_LOG === "true",
    };
  }

}
