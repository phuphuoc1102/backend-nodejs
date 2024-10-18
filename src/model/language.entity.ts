import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { AbstractEntity } from "./abtract-entity.entity";

@Entity("languages")
export class Language extends AbstractEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;
}
