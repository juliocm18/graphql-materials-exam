import {Resolver, Query, Mutation, Arg} from "type-graphql";
import {Manufacturer} from "./model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Resolver()
export class ManufacturerResolver {
  @Query(() => [Manufacturer])
  async manufacturers() {
    const repository = DatabaseBootstrap.dataSource.getRepository(Manufacturer);
    return repository.find();
  }

  @Mutation(() => Manufacturer)
  async createManufacturer(@Arg("name") name: string) {
    const repository = DatabaseBootstrap.dataSource.getRepository(Manufacturer);
    await repository.save({name});
    return repository;
  }
}
