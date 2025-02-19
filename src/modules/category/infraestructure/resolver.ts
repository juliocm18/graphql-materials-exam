import {Resolver, Query, Mutation, Arg, Int} from "type-graphql";
import {Category} from "./model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Resolver()
export class CategoryResolver {
  @Query(() => [Category])
  async categories(
    @Arg("page", {defaultValue: 0}) page: string,
    @Arg("pageSize", {defaultValue: 10}) pageSize: string
  ) {
    const repository = DatabaseBootstrap.dataSource.getRepository(Category);
    const response = await repository.find({
      skip: +page * +pageSize,
      take: +pageSize,
    });
    return response;
  }

  @Mutation(() => Category)
  async createCategory(@Arg("name") name: string) {
    const repository = DatabaseBootstrap.dataSource.getRepository(Category);
    const response = await repository.save({name});
    return response;
  }
}
