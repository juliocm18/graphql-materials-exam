import {Resolver, Query, Mutation, Arg, Int, Float} from "type-graphql";
import {Material} from "./model.entity";
import {Manufacturer} from "../../manufacturer/infraestructure/model.entity";
import {Category} from "../../category/infraestructure/model.entity";
import {UnitOfMeasure} from "../../unit-of-measure/infraestructure/model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";
import {ILike} from "typeorm";

@Resolver()
export class MaterialResolver {
  @Query(() => [Material])
  async materials(
    @Arg("page", {defaultValue: 0}) page: string,
    @Arg("pageSize", {defaultValue: 10}) pageSize: string,
    @Arg("manufacturerName", {nullable: true}) manufacturerName?: string
  ) {
    const repository = DatabaseBootstrap.dataSource.getRepository(Material);

    const whereClause = manufacturerName
      ? {manufacturer: {name: ILike(`%${manufacturerName}%`)}}
      : {};
    //console.log(whereClause);
    const response = await repository.find({
      skip: +page * +pageSize,
      take: +pageSize,
      where: whereClause,
      relations: ["manufacturer", "category", "unit_of_measure"],
    });
    return response;
  }

  @Mutation(() => Material)
  async createMaterial(
    @Arg("name") name: string,
    @Arg("description", {nullable: true}) description: string,
    @Arg("long_description", {nullable: true}) long_description: string,
    @Arg("customer_part_id", {nullable: true}) customer_part_id: string,
    @Arg("manufacturer_id") manufacturer_id: string,
    @Arg("manufacturer_part_id", {nullable: true}) manufacturer_part_id: string,
    @Arg("competitor_name", {nullable: true}) competitor_name: string,
    @Arg("competitor_part_name", {nullable: true}) competitor_part_name: string,
    @Arg("competitor_part_id", {nullable: true}) competitor_part_id: string,
    @Arg("category_id") category_id: string,
    @Arg("unit_of_measure_id") unit_of_measure_id: string,
    @Arg("unit_quantity", () => Float, {nullable: true}) unit_quantity?: number,
    @Arg("requested_quantity", () => Float, {nullable: true})
    requested_quantity?: number,
    @Arg("requested_unit_price", () => Float, {nullable: true})
    requested_unit_price?: number
  ) {
    const materialRepository =
      DatabaseBootstrap.dataSource.getRepository(Material);
    const categoryRepository =
      DatabaseBootstrap.dataSource.getRepository(Category);
    const unitOfMeasureRepository =
      DatabaseBootstrap.dataSource.getRepository(UnitOfMeasure);
    const manufacturerRepository =
      DatabaseBootstrap.dataSource.getRepository(Manufacturer);

    const manufacturer = await manufacturerRepository.findOne({
      where: {id: manufacturer_id},
    });
    const category = await categoryRepository.findOne({
      where: {id: category_id},
    });
    const unitOfMeasure = await unitOfMeasureRepository.findOne({
      where: {id: unit_of_measure_id},
    });

    if (!manufacturer || !category || !unitOfMeasure) {
      throw new Error("Manufacturer, Category, or UnitOfMeasure not found");
    }

    const material = await materialRepository.save({
      name,
      description,
      long_description,
      customer_part_id,
      manufacturer,
      manufacturer_part_id,
      competitor_name,
      competitor_part_name,
      competitor_part_id,
      category,
      unit_of_measure: unitOfMeasure,
      unit_quantity,
      requested_quantity,
      requested_unit_price,
    });
    return material;
  }
}
