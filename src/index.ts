import {ApolloServer} from "@apollo/server";
import {expressMiddleware} from "@apollo/server/express4";
import {buildSchema} from "type-graphql";
import {graphqlUploadExpress, GraphQLUpload} from "graphql-upload-minimal";
import {GraphQLScalarType} from "graphql";
import {MaterialResolver} from "./modules/material/infraestructure/resolver";
import {ManufacturerResolver} from "./modules/manufacturer/infraestructure/resolver";
import {CategoryResolver} from "./modules/category/infraestructure/resolver";
import {UnitOfMeasureResolver} from "./modules/unit-of-measure/infraestructure/resolver";
import {UploadResolver} from "./modules/material/infraestructure/upload.resolver";
import DatabaseBootstrap from "./core/bootstrap/database.bootstrap";
import {ApolloServerPluginDrainHttpServer} from "@apollo/server/plugin/drainHttpServer";
import http from "http";
import cors from "cors";
import express from "express";
import {AppService} from "./core/config/app.config.service";

async function bootstrap() {
  const database = new DatabaseBootstrap();
  await database.initialize();

  const app = express();
  const httpServer = http.createServer(app);

  const schema = await buildSchema({
    resolvers: [
      MaterialResolver,
      ManufacturerResolver,
      CategoryResolver,
      UnitOfMeasureResolver,
      UploadResolver,
    ],
    scalarsMap: [{type: GraphQLScalarType, scalar: GraphQLUpload}], // Asegurar que GraphQLUpload esté mapeado
  });

  const server = new ApolloServer({
    schema,
    introspection: true,
    csrfPrevention: false,
    plugins: [ApolloServerPluginDrainHttpServer({httpServer})],
  });

  await server.start();

  app.use(graphqlUploadExpress({maxFileSize: 5 * 1024 * 1024, maxFiles: 1})); // 5MB máx.
  app.use(cors<cors.CorsRequest>());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  app.use(
    "/graphql",
    expressMiddleware(server) as unknown as express.RequestHandler
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({port: AppService.PORT}, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:${AppService.PORT}/graphql`);
}

bootstrap();
