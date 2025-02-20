import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import {Manufacturer} from "../../manufacturer/infraestructure/model.entity";
import {Category} from "../../category/infraestructure/model.entity";
import {UnitOfMeasure} from "../../unit-of-measure/infraestructure/model.entity";
import {Field, ObjectType} from "type-graphql";

@Entity()
@ObjectType()
export class Material {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column({nullable: true})
  description: string;

  @Field()
  @Column({nullable: true})
  long_description: string;

  @Field()
  @Column({nullable: true})
  customer_part_id: string; // foreign table customer part

  @Field(() => Manufacturer, {nullable: true})
  @ManyToOne(() => Manufacturer, {nullable: true})
  @JoinColumn({name: "manufacturer_id"})
  manufacturer?: Manufacturer;

  @Field()
  @Column({nullable: true})
  manufacturer_part_id: string; // foreign table manufacturer part

  @Field()
  @Column({nullable: true})
  competitor_name: string; // foreign table competitor

  @Field()
  @Column({nullable: true})
  competitor_part_name: string; // foreign table competitor part

  @Field()
  @Column({nullable: true})
  competitor_part_id: string; // foreign table competitor part

  @Field(() => Category, {nullable: true})
  @ManyToOne(() => Category, {nullable: true})
  @JoinColumn({name: "category_id"})
  category?: Category;

  @Field(() => UnitOfMeasure, {nullable: true})
  @ManyToOne(() => UnitOfMeasure, {nullable: true})
  @JoinColumn({name: "unit_of_measure_id"})
  unit_of_measure?: UnitOfMeasure;

  @Field()
  @Column({type: "float", nullable: true})
  unit_quantity: number;

  @Field()
  @Column({type: "float", nullable: true})
  requested_quantity: number;

  @Field()
  @Column({type: "float", nullable: true})
  requested_unit_price: number;
}
