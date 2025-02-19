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
interface MyContext {
  req: express.Request;
  res: express.Response;
}
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

  // 🚀 Middleware para manejar archivos y JSON
  app.use(graphqlUploadExpress({maxFileSize: 5 * 1024 * 1024, maxFiles: 1})); // 5MB máx.
  app.use(cors<cors.CorsRequest>());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}));

  // **Falta montar expressMiddleware para Apollo**
  app.use(
    "/graphql",
    expressMiddleware(server) as unknown as express.RequestHandler
  );
  await new Promise<void>((resolve) =>
    httpServer.listen({port: 4000}, resolve)
  );
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
}

bootstrap();
