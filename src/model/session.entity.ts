import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";
import { thirtyDaysFromNow } from "../utils/date";

@Entity("sessions")
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, () => User, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @Column({ type: "text", nullable: true })
  userAgent?: string;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP + interval '1 day'",
  })
  expiresAt: Date;
}
