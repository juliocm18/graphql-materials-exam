import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import {Material} from "../../material/infraestructure/model.entity";
import {Field, ObjectType} from "type-graphql";

@Entity()
@ObjectType()
export class UnitOfMeasure {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({unique: true})
  name: string;

  @Field(() => [Material])
  @OneToMany(() => Material, (material) => material.unit_of_measure)
  materials: Material[];
}
