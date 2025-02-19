import {Application} from "express";
import http from "http";
import IBootstrap from "./bootstrap.interface";
import {AppService} from "../config/app.config.service";

export default class implements IBootstrap {
  constructor(private readonly app: Application) {}

  initialize() {
    return new Promise((resolve, reject) => {
      const server = http.createServer(this.app);

      server
        .listen(AppService.PORT, "0.0.0.0")
        .on("listening", () => {
          const date = new Date();
          console.log(
            `Server is listening on ppuerto ${AppService.PORT} at ${date}`
          );
          resolve(`Server is listening on ppuerto ${AppService.PORT}`);
        })
        .on("error", (error) => {
          reject(error);
          console.log("Server error", error);
          process.exit(1);
        });
    });
  }

  close(): void {
    process.exit(1);
  }
}
