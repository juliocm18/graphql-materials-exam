import {Resolver, Mutation, Arg} from "type-graphql";
import {GraphQLUpload} from "graphql-upload-minimal";
import {parse} from "csv-parse";
import {Manufacturer} from "../../manufacturer/infraestructure/model.entity";
import {Category} from "../../category/infraestructure/model.entity";
import {UnitOfMeasure} from "../../unit-of-measure/infraestructure/model.entity";
import {Material} from "./model.entity";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Resolver()
export class UploadResolver {
  @Mutation(() => Boolean)
  async uploadMaterials(@Arg("file", () => GraphQLUpload) file: any) {
    const {createReadStream} = file;
    const stream = createReadStream();

    const parser = parse({delimiter: ",", columns: true});

    const materialRepository =
      DatabaseBootstrap.dataSource.getRepository(Material);
    const manufacturerRepository =
      DatabaseBootstrap.dataSource.getRepository(Manufacturer);
    const categoryRepository =
      DatabaseBootstrap.dataSource.getRepository(Category);
    const unitOfMeasureRepository =
      DatabaseBootstrap.dataSource.getRepository(UnitOfMeasure);

    const materials: any[] = [];
    const manufacturersMap = new Map<string, Manufacturer>();
    const categoriesMap = new Map<string, Category>();
    const unitOfMeasuresMap = new Map<string, UnitOfMeasure>();

    // Obtener todos los fabricantes, categorías y unidades de medida existentes
    const existingManufacturers = await manufacturerRepository.find();
    const existingCategories = await categoryRepository.find();
    const existingUnitsOfMeasure = await unitOfMeasureRepository.find();

    existingManufacturers.forEach((m) => manufacturersMap.set(m.name, m));
    existingCategories.forEach((c) => categoriesMap.set(c.name, c));
    existingUnitsOfMeasure.forEach((u) => unitOfMeasuresMap.set(u.name, u));

    // Procesar el CSV usando streams
    for await (const record of stream.pipe(parser)) {
      let manufacturer = manufacturersMap.get(record.manufacturer_name);
      if (!manufacturer) {
        manufacturer = manufacturerRepository.create({
          name: record.manufacturer_name,
        });
        manufacturersMap.set(record.manufacturer_name, manufacturer);
      }

      let category = categoriesMap.get(record.category);
      if (!category) {
        category = categoryRepository.create({name: record.category});
        categoriesMap.set(record.category, category);
      }

      let unitOfMeasure = unitOfMeasuresMap.get(record.unit_of_measure);
      if (!unitOfMeasure) {
        unitOfMeasure = unitOfMeasureRepository.create({
          name: record.unit_of_measure,
        });
        unitOfMeasuresMap.set(record.unit_of_measure, unitOfMeasure);
      }

      materials.push({
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

      // Insertar en lotes de 1000 registros
      if (materials.length >= 1000) {
        await this.saveBatch(materialRepository, materials);
        materials.length = 0; // Limpiar el array después de la inserción
      }
    }

    // Guardar los registros restantes
    if (materials.length > 0) {
      await this.saveBatch(materialRepository, materials);
    }

    // Guardar fabricantes, categorías y unidades de medida nuevas en la base de datos
    await this.saveNewEntities(
      manufacturerRepository,
      manufacturersMap,
      existingManufacturers
    );
    await this.saveNewEntities(
      categoryRepository,
      categoriesMap,
      existingCategories
    );
    await this.saveNewEntities(
      unitOfMeasureRepository,
      unitOfMeasuresMap,
      existingUnitsOfMeasure
    );

    return true;
  }

  // Función para insertar en batch
  private async saveBatch(repository, batch) {
    await repository.insert(batch);
  }

  // Guardar solo los nuevos elementos en la base de datos
  private async saveNewEntities(repository, map, existingEntities) {
    const newEntities = Array.from(map.values()).filter(
      (entity: any) =>
        !existingEntities.some((e: any) => e.name === entity.name)
    );
    if (newEntities.length > 0) {
      await repository.insert(newEntities);
    }
  }
}
