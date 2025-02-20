import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Material} from "../../material/infraestructure/model.entity";
import {Field, Float, ObjectType} from "type-graphql";
import DatabaseBootstrap from "../../../core/bootstrap/database.bootstrap";

@Entity()
@ObjectType()
export class Category {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column({unique: true})
  name: string;

  @Field(() => [Material])
  @OneToMany(() => Material, (material) => material.category)
  materials: Material[];

  @Field(() => Number)
  async totalMaterials(): Promise<number> {
    const count = await DatabaseBootstrap.dataSource
      .getRepository(Material)
      .count({
        where: {category: {id: this.id}},
      });
    return count;
  }

  @Field(() => Float, {nullable: true})
  async averagePrice(): Promise<number | null> {
    const result = await DatabaseBootstrap.dataSource
      .getRepository(Material)
      .createQueryBuilder("material")
      .select("AVG(material.requested_unit_price)", "avg")
      .where("material.category_id = :id", {id: this.id})
      .getRawOne();
    return result?.avg || null;
  }

  @Field(() => Float, {nullable: true})
  async minPrice(): Promise<number | null> {
    const result = await DatabaseBootstrap.dataSource
      .getRepository(Material)
      .createQueryBuilder("material")
      .select("MIN(material.requested_unit_price)", "min")
      .where("material.category_id = :id", {id: this.id})
      .getRawOne();
    return result?.min || null;
  }

  @Field(() => Float, {nullable: true})
  async maxPrice(): Promise<number | null> {
    const result = await DatabaseBootstrap.dataSource
      .getRepository(Material)
      .createQueryBuilder("material")
      .select("MAX(material.requested_unit_price)", "max")
      .where("material.category_id = :id", {id: this.id})
      .getRawOne();
    return result?.max || null;
  }
}
