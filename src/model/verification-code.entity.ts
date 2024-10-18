import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./user.entity";
import VerificationCodeType from "../constants/verificationCodeType";
import { thirtyDaysFromNow } from "../utils/date";

@Entity("verification_codes")
export class VerificationCode {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, () => VerificationCode, {
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @Column({
    type: "enum",
    enum: VerificationCodeType,
    nullable: false,
  })
  type: VerificationCodeType;

  @CreateDateColumn({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    nullable: false,
    default: () => `CURRENT_TIMESTAMP + interval '1 day'`,
  })
  expiresAt: Date;
}
