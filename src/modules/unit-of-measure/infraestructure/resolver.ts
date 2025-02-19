import {Resolver, Query, Mutation, Arg} from "type-graphql";
import {UnitOfMeasure} from "./model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Resolver()
export class UnitOfMeasureResolver {
  @Query(() => [UnitOfMeasure])
  async unitOfMeasures() {
    const repository =
      DatabaseBootstrap.dataSource.getRepository(UnitOfMeasure);
    return repository.find();
  }

  @Mutation(() => UnitOfMeasure)
  async createUnitOfMeasure(@Arg("name") name: string) {
    const repository =
      DatabaseBootstrap.dataSource.getRepository(UnitOfMeasure);
    await repository.save({name});
    return repository;
  }
}
