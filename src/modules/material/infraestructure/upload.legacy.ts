import {Resolver, Mutation, Arg} from "type-graphql";
import {GraphQLUpload} from "graphql-upload-minimal";
import {parse} from "csv-parse";
import {Manufacturer} from "../../manufacturer/infraestructure/model.entity";
import {Category} from "../../category/infraestructure/model.entity";
import {UnitOfMeasure} from "../../unit-of-measure/infraestructure/model.entity";
import {Material} from "./model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Resolver()
export class UploadResolverLegacy {
  @Mutation(() => Boolean)
  async uploadMaterials(@Arg("file", () => GraphQLUpload) file: any) {
    const {createReadStream} = file;
    const stream = createReadStream();

    const parser = parse({
      delimiter: ",",
      columns: true,
    });

    stream.pipe(parser);
    const materialRepository =
      DatabaseBootstrap.dataSource.getRepository(Material);

    const manufacturerRepository =
      DatabaseBootstrap.dataSource.getRepository(Manufacturer);

    const categoryRepository =
      DatabaseBootstrap.dataSource.getRepository(Category);

    const unitOfMeasureRepository =
      DatabaseBootstrap.dataSource.getRepository(UnitOfMeasure);

    for await (const record of parser) {
      let manufacturer = await manufacturerRepository.findOne({
        where: {name: record.manufacturer_name},
      });
      let category = await categoryRepository.findOne({
        where: {name: record.category},
      });
      let unitOfMeasure = await unitOfMeasureRepository.findOne({
        where: {name: record.unit_of_measure},
      });

      if (!manufacturer) {
        manufacturer = await manufacturerRepository.save({
          name: record.manufacturer_name,
        });
      }

      if (!category) {
        category = await categoryRepository.save({name: record.category});
      }

      if (!unitOfMeasure) {
        unitOfMeasure = await unitOfMeasureRepository.save({
          name: record.unit_of_measure,
        });
      }

      const material = await materialRepository.save({
        name: record.name,
        description: record.description,
        long_description: record.long_description,
        customer_part_id: record.customer_part_id,
        manufacturer,
        manufacturer_part_id: record.manufacturer_part_id,
        competitor_name: record.competitor_name,
        competitor_part_name: record.competitor_part_name,
        competitor_part_id: record.competitor_part_id,
        category,
        unit_of_measure: unitOfMeasure,
        unit_quantity: parseFloat(record.unit_quantity) || null,
        requested_quantity: parseFloat(record.requested_quantity) || null,
        requested_unit_price: parseFloat(record.requested_unit_price) || null,
      });
    }

    return true;
  }
}
