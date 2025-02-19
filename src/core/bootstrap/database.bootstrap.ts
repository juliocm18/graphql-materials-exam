import {DataSource} from "typeorm";
import IBootstrap from "./bootstrap.interface";
import {AppDataSource} from "../infraestructure/typeorm/typeorm.config";

export default class DatabaseBootstrap implements IBootstrap {
  private static appDataSource: DataSource;

  initialize(): Promise<any> {
    DatabaseBootstrap.appDataSource = AppDataSource;
    return AppDataSource.initialize();
  }

  close(): void {
    DatabaseBootstrap.appDataSource?.destroy();
  }

  static get dataSource(): DataSource {
    return DatabaseBootstrap.appDataSource;
  }
}
